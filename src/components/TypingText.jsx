import { useEffect, useState } from 'react'

/** Rotating typewriter phrases below the main landing headline */
export default function TypingText() {
  const phrases = [
    'Check your AI visibility across ChatGPT, Perplexity, and Google',
    'Audit your Google Business Profile in seconds',
    'Crawl your website to find SEO issues',
    'Track your local rank against competitors',
  ]
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIdx]
    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), 1800)
      return () => clearTimeout(t)
    }
    if (deleting && text === '') {
      setDeleting(false)
      setPhraseIdx(i => (i + 1) % phrases.length)
      return
    }
    const speed = deleting ? 22 : 42
    const t = setTimeout(() => {
      setText(prev =>
        deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
      )
    }, speed)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, deleting, phraseIdx])

  return (
    <div className="min-h-[28px] flex items-center justify-center">
      <span className="text-[16px] text-gray-500 font-normal leading-relaxed">{text}</span>
      <span className="inline-block w-[2px] h-[18px] bg-purple-600 ml-0.5 animate-pulse align-middle" />
    </div>
  )
}
