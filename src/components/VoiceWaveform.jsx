import { useEffect, useRef } from 'react'

/** Design token — purple-600 accent for voice meter bars */
const ACCENT = '#6938EF'

const BAR_WIDTH = 3
const BAR_GAP = 2
const BAR_PITCH = BAR_WIDTH + BAR_GAP
const MAX_BAR_HEIGHT = 32
const MIN_BAR_HEIGHT = 3
const SCROLL_BARS_PER_SEC = 14
const SPEAK_THRESHOLD = 0.028
const BUFFER_SIZE = 128

function idleLevel(t) {
  return 0.12 + Math.sin(t * 0.0022) * 0.06 + Math.sin(t * 0.0051) * 0.03
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function drawBar(ctx, x, centerY, height, color, alpha) {
  const h = Math.max(MIN_BAR_HEIGHT, height)
  const top = centerY - h / 2
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x, top, BAR_WIDTH, h, BAR_WIDTH / 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

/**
 * ChatGPT-style scrolling voice waveform — mic-reactive with idle fallback.
 * Replace AnalyserNode path with production STT pipeline when wired to backend.
 */
export default function VoiceWaveform({ active }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const rafRef = useRef(null)
  const levelsRef = useRef(new Float32Array(BUFFER_SIZE).fill(0.12))
  const scrollRef = useRef(0)
  const smoothedVolRef = useRef(0)
  const speakingRef = useRef(false)
  const audioRef = useRef(null)
  const timeDataRef = useRef(new Uint8Array(256))
  const lastTimeRef = useRef(0)
  const simPhaseRef = useRef(0)

  useEffect(() => {
    if (!active) {
      levelsRef.current.fill(0.12)
      scrollRef.current = 0
      smoothedVolRef.current = 0
      speakingRef.current = false
      return undefined
    }

    let cancelled = false
    let stream = null

    async function startMic() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        const ctx = new AudioContext()
        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.82
        source.connect(analyser)
        audioRef.current = { ctx, analyser, stream, useMic: true }
        if (ctx.state === 'suspended') await ctx.resume()
      } catch {
        audioRef.current = { useMic: false }
      }
    }

    startMic()

    function readMicLevel() {
      const audio = audioRef.current
      if (!audio?.useMic) return null
      const { analyser } = audio
      const data = timeDataRef.current
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const n = (data[i] - 128) / 128
        sum += n * n
      }
      return Math.min(1, Math.sqrt(sum / data.length) * 3.2)
    }

    function readSimLevel(t) {
      simPhaseRef.current += 0.07
      const burst = 0.35 + Math.sin(simPhaseRef.current) * 0.25
      const speaking = Math.sin(t * 0.0013) > 0.15
      return speaking ? burst * (0.55 + Math.random() * 0.45) : null
    }

    function sampleIncomingLevel(t) {
      const mic = readMicLevel()
      if (mic != null) {
        smoothedVolRef.current = lerp(smoothedVolRef.current, mic, 0.22)
      } else {
        const sim = readSimLevel(t)
        if (sim != null) {
          smoothedVolRef.current = lerp(smoothedVolRef.current, sim, 0.18)
        } else {
          smoothedVolRef.current = lerp(smoothedVolRef.current, idleLevel(t) * 0.55, 0.08)
        }
      }

      const vol = smoothedVolRef.current
      const wasSpeaking = speakingRef.current
      speakingRef.current = vol > SPEAK_THRESHOLD

      if (speakingRef.current) {
        return 0.2 + vol * 0.85
      }
      if (wasSpeaking && !speakingRef.current) {
        return lerp(vol, idleLevel(t), 0.35)
      }
      return idleLevel(t)
    }

    function tick(now) {
      if (cancelled) return
      const canvas = canvasRef.current
      const wrap = wrapRef.current
      if (!canvas || !wrap) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const dt = lastTimeRef.current ? Math.min(48, now - lastTimeRef.current) : 16
      lastTimeRef.current = now

      scrollRef.current += (SCROLL_BARS_PER_SEC * dt) / 1000
      while (scrollRef.current >= 1) {
        levelsRef.current.copyWithin(0, 1)
        levelsRef.current[BUFFER_SIZE - 1] = sampleIncomingLevel(now)
        scrollRef.current -= 1
      }

      const dpr = window.devicePixelRatio || 1
      const cssW = wrap.clientWidth
      const cssH = wrap.clientHeight
      if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
        canvas.width = Math.round(cssW * dpr)
        canvas.height = Math.round(cssH * dpr)
        canvas.style.width = `${cssW}px`
        canvas.style.height = `${cssH}px`
      }

      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssW, cssH)

      const centerY = cssH / 2
      const offsetX = scrollRef.current * BAR_PITCH
      const visibleCount = Math.ceil(cssW / BAR_PITCH) + 2
      const startIdx = Math.max(0, BUFFER_SIZE - visibleCount)

      for (let i = startIdx; i < BUFFER_SIZE; i++) {
        const screenIdx = i - startIdx
        const x = screenIdx * BAR_PITCH - offsetX + (cssW - visibleCount * BAR_PITCH) / 2
        if (x + BAR_WIDTH < 0 || x > cssW) continue

        const level = levelsRef.current[i]
        const height = MIN_BAR_HEIGHT + level * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT)
        const alpha = speakingRef.current
          ? 0.55 + level * 0.45
          : 0.28 + level * 0.35

        drawBar(ctx, x, centerY, height, ACCENT, alpha)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = 0
      const audio = audioRef.current
      if (audio?.stream) audio.stream.getTracks().forEach(t => t.stop())
      if (audio?.ctx) audio.ctx.close().catch(() => {})
      audioRef.current = null
    }
  }, [active])

  return (
    <div
      ref={wrapRef}
      className="h-8 w-full max-w-full overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}
