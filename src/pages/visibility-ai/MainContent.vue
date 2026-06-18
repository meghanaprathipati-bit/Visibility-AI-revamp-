<script setup>
import { ref, watch, nextTick } from 'vue'
import ClarifyingQuestionsCard from '../../components/ClarifyingQuestionsCard.vue'
import { buildScanResultsPayload, hydrateScanResultsMessages } from '../../data/scanResults.js'
import { SEO_SCAN_PROMPT, isAutoScanPrompt, getScanKindFromPrompt } from '../../data/scanPrompts.js'
import {
  SEO_SCAN_CHAT_ID,
  createSeoScanSession,
  createEmptySession,
} from '../../data/seedChats.js'
import {
  QUICK_ACTIONS,
  getQuickActionLabelForPrompt,
  AI_VISIBILITY_QUESTIONS,
  getClarifyingQuestions,
} from './constants.js'
import TypingText from './TypingText.vue'
import PromptComposer from './PromptComposer.vue'
import ChatMessage from './ChatMessage.vue'

const props = defineProps({
  activeChatId: { type: Number, required: true },
  loadedSession: { type: Object, default: null },
  composerFocusKey: { type: Number, default: 0 },
  detailPanelOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['sessionDraft', 'chatAutoTitle', 'inputChange', 'messageSent', 'openDetailPanel'])

const inputValue = ref('')
const chatMode = ref(false)
const isScanning = ref(false)
const messages = ref([])
const pendingQuestions = ref(null)
const aiVisibilityPending = ref(false)
const awaitingAnswer = ref(false)
const messagesEndRef = ref(null)
const composerRef = ref(null)
const skipDraft = ref(false)
const prevActiveChatId = ref(props.activeChatId)

function buildSessionSnapshot() {
  return {
    chatMode: chatMode.value,
    isScanning: isScanning.value,
    messages: messages.value,
    inputValue: inputValue.value,
    pendingQuestions: pendingQuestions.value,
    aiVisibilityPending: aiVisibilityPending.value,
    awaitingAnswer: awaitingAnswer.value,
  }
}

function setInputValue(val) {
  inputValue.value = val
  emit('inputChange', val.trim().length > 0)
}

function resolveSession() {
  if (props.loadedSession) return props.loadedSession
  if (props.activeChatId === SEO_SCAN_CHAT_ID) return createSeoScanSession()
  return createEmptySession()
}

watch(
  () => [props.activeChatId, props.loadedSession],
  () => {
    skipDraft.value = true
    const chatSwitched = prevActiveChatId.value !== props.activeChatId
    prevActiveChatId.value = props.activeChatId

    const session = resolveSession()
    const hydratedMessages = hydrateScanResultsMessages(
      session.messages,
      props.activeChatId === SEO_SCAN_CHAT_ID ? SEO_SCAN_PROMPT : '',
    )
    const loadedIsEmpty =
      !session.chatMode
      && !(session.messages?.length)
      && !(session.inputValue?.trim())
      && !session.pendingQuestions
      && !session.aiVisibilityPending
      && !session.awaitingAnswer

    if (!chatSwitched && loadedIsEmpty && chatMode.value && messages.value.length > 0) {
      skipDraft.value = false
      return
    }

    chatMode.value = session.chatMode
    isScanning.value = session.isScanning
    messages.value = hydratedMessages
    setInputValue(session.inputValue ?? '')
    pendingQuestions.value = session.pendingQuestions ?? null
    aiVisibilityPending.value = Boolean(session.aiVisibilityPending)
    awaitingAnswer.value = session.awaitingAnswer ?? false
    emit('sessionDraft', {
      ...session,
      messages: hydratedMessages,
    })
    skipDraft.value = false
  },
)

watch([chatMode, isScanning, messages, inputValue, pendingQuestions, aiVisibilityPending, awaitingAnswer], () => {
  if (skipDraft.value) return
  emit('sessionDraft', buildSessionSnapshot())
})

watch(() => props.composerFocusKey, () => {
  if (!isScanning.value) nextTick(() => composerRef.value?.focus())
})

watch([messages, isScanning], () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
})

function getTimestamp() {
  const now = new Date()
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
}

function onScanComplete() {
  isScanning.value = false
  const prev = messages.value
  const scanMsg = prev.find(m => m.content === 'scan')
  const scanKind = scanMsg?.scanKind || 'generic'

  if (scanKind === 'ai-visibility-prep') {
    setTimeout(() => { aiVisibilityPending.value = true }, 0)
    messages.value = prev.map(m => (m.content === 'scan' ? { ...m, content: 'scan-done' } : m))
    return
  }

  if (prev.some(m => m.content === 'scan-results')) return
  const lastUser = [...prev].reverse().find(m => m.type === 'user' && m.content !== 'answers-formatted')
  const payload = buildScanResultsPayload(lastUser?.content, scanKind)
  const ts = getTimestamp()
  messages.value = prev
    .map(m => (m.content === 'scan' ? { ...m, content: 'scan-done' } : m))
    .concat([{ id: Date.now(), type: 'ai', content: 'scan-results', scanKind, ts, ...payload }])
}

function handleStopScan() {
  isScanning.value = false
}

function triggerScan(scanKind = 'generic') {
  isScanning.value = true
  setTimeout(() => {
    messages.value = [
      ...messages.value,
      { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind, ts: getTimestamp() },
    ]
  }, 300)
}

function handlePendingSubmit() {
  pendingQuestions.value = null
  triggerScan()
}

function handlePendingSkip() {
  pendingQuestions.value = null
  triggerScan()
}

function handleAiVisibilitySubmit(answers) {
  const urlAnswer = answers['website-url'] || answers[Object.keys(answers)[0]] || ''
  const answersText = `Website URL → ${urlAnswer}`
  const ts = getTimestamp()
  const userAnswerMsg = {
    id: Date.now(),
    type: 'user',
    content: 'answers-formatted',
    answersText,
    rawAnswers: answers,
    ts,
  }
  aiVisibilityPending.value = false
  messages.value = [...messages.value, userAnswerMsg]
  isScanning.value = true
  setTimeout(() => {
    messages.value = [
      ...messages.value,
      { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind: 'ai-visibility', ts: getTimestamp() },
    ]
  }, 400)
}

function handleAiVisibilitySkip() {
  aiVisibilityPending.value = false
  isScanning.value = true
  setTimeout(() => {
    messages.value = [
      ...messages.value,
      { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind: 'ai-visibility', ts: getTimestamp() },
    ]
  }, 400)
}

function handleOptionSelect(option) {
  if (awaitingAnswer.value === false) return
  const ts = getTimestamp()
  const userMsg = { id: Date.now(), type: 'user', content: option, ts }
  const scanKind = awaitingAnswer.value
  messages.value = [
    ...messages.value.map(m =>
      m.content === 'ai-question' && !m.answered ? { ...m, answered: true, selectedOption: option } : m,
    ),
    userMsg,
  ]
  awaitingAnswer.value = false
  isScanning.value = true
  setTimeout(() => {
    messages.value = [
      ...messages.value,
      { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind, ts: getTimestamp() },
    ]
  }, 400)
}

function handleQuickActionSelect({ prompt }) {
  setInputValue(prompt)
  nextTick(() => composerRef.value?.focus())
}

function handleSetInputValue(value) {
  setInputValue(value)
  nextTick(() => composerRef.value?.focus())
}

function finishSubmit({ nextChatMode, nextMessages, nextIsScanning = isScanning.value, trimmed, chatTitle, chatTitleAsIs = false }) {
  chatMode.value = nextChatMode
  messages.value = nextMessages
  if (nextIsScanning !== isScanning.value) isScanning.value = nextIsScanning
  setInputValue('')
  emit('messageSent', buildSessionSnapshot())
  if (chatTitle != null) emit('chatAutoTitle', chatTitle, chatTitleAsIs)
  else {
    const chipLabel = getQuickActionLabelForPrompt(trimmed)
    emit('chatAutoTitle', chipLabel ?? trimmed, Boolean(chipLabel))
  }
  nextTick(() => composerRef.value?.focus())
}

function submitPrompt(trimmed, { chatTitle, chatTitleAsIs = false } = {}) {
  if (!trimmed || isScanning.value || pendingQuestions.value || awaitingAnswer.value || aiVisibilityPending.value) return

  const ts = getTimestamp()
  const userMsg = { id: Date.now(), type: 'user', content: trimmed, ts }
  const scanKind = getScanKindFromPrompt(trimmed)
  const enteringChat = !chatMode.value

  if (scanKind === 'ai-action-plan') {
    const nextMessages = chatMode.value ? [...messages.value, userMsg] : [userMsg]
    finishSubmit({ nextChatMode: true, nextMessages, trimmed, chatTitle, chatTitleAsIs })
    awaitingAnswer.value = 'ai-action-plan'
    setTimeout(() => {
      messages.value = [...messages.value, {
        id: Date.now() + 100,
        type: 'ai',
        content: 'ai-question',
        question: "To build your AI action plan I need to understand your priorities. What's your biggest challenge right now?",
        options: ['Low local search rankings', 'Not appearing in AI search results', 'Competitors outranking me', 'All of the above'],
        scanKind: 'ai-action-plan',
        ts: getTimestamp(),
      }]
    }, 600)
    return
  }

  const clarifyingQs = isAutoScanPrompt(trimmed) ? null : getClarifyingQuestions(trimmed)
  if (clarifyingQs) {
    const nextMessages = chatMode.value ? [...messages.value, userMsg] : [userMsg]
    finishSubmit({ nextChatMode: true, nextMessages, trimmed, chatTitle, chatTitleAsIs })
    pendingQuestions.value = { questions: clarifyingQs }
    return
  }

  if (scanKind === 'ai-visibility') {
    const nextMessages = enteringChat ? [userMsg] : [...messages.value, userMsg]
    finishSubmit({
      nextChatMode: true,
      nextMessages,
      nextIsScanning: true,
      trimmed,
      chatTitle,
      chatTitleAsIs,
    })
    setTimeout(() => {
      messages.value = [
        ...messages.value,
        { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind: 'ai-visibility-prep', ts: getTimestamp() },
      ]
    }, 450)
    return
  }

  const nextMessages = enteringChat ? [userMsg] : [...messages.value, userMsg]
  finishSubmit({
    nextChatMode: true,
    nextMessages,
    nextIsScanning: true,
    trimmed,
    chatTitle,
    chatTitleAsIs,
  })
  setTimeout(() => {
    messages.value = [
      ...messages.value,
      { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind, ts: getTimestamp() },
    ]
  }, 450)
}

function handleSend() {
  const trimmed = inputValue.value.trim()
  if (!trimmed) return
  const chipLabel = getQuickActionLabelForPrompt(trimmed)
  submitPrompt(trimmed, chipLabel ? { chatTitle: chipLabel, chatTitleAsIs: true } : {})
}
</script>

<template>
  <main v-if="!chatMode" class="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
    <div class="flex-1 flex flex-col items-center justify-center py-10 overflow-y-auto">
      <div class="w-[85vw] max-w-[1540px] mx-auto flex flex-col items-center gap-6">
        <div class="text-center">
          <h1 class="text-[32px] font-bold text-gray-900 leading-[1.15] tracking-tight">
            How can we improve your visibility today?
          </h1>
        </div>
        <TypingText />
        <div class="w-[60%] mx-auto">
          <PromptComposer
            ref="composerRef"
            v-model="inputValue"
            :focus-key="composerFocusKey"
            @send="handleSend"
          />
        </div>
        <div class="flex flex-nowrap items-center justify-center gap-2 w-full">
          <button
            v-for="{ label, prompt } in QUICK_ACTIONS"
            :key="label"
            type="button"
            class="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-100 text-[13px] font-normal text-gray-600 hover:bg-gray-200 transition-colors"
            @click="handleQuickActionSelect({ prompt })"
          >
            {{ label }}
          </button>
        </div>
      </div>
    </div>
  </main>

  <main v-else class="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
    <div class="flex-1 min-h-0 overflow-y-auto py-8">
      <div
        class="mx-auto flex flex-col gap-6 px-6"
        :class="detailPanelOpen ? 'w-full max-w-[720px]' : 'w-[60%]'"
      >
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :msg="msg"
          :messages="messages"
          @scan-complete="onScanComplete"
          @option-select="handleOptionSelect"
          @set-input-value="handleSetInputValue"
          @open-detail-panel="emit('openDetailPanel', $event)"
        />
        <div ref="messagesEndRef" />
      </div>
    </div>

    <div class="shrink-0 border-t border-gray-200 bg-white">
      <div
        class="mx-auto pb-2 pt-2 px-6"
        :class="detailPanelOpen ? 'w-full max-w-[720px]' : 'w-[60%]'"
      >
        <div v-if="pendingQuestions" class="mb-2">
          <ClarifyingQuestionsCard
            :questions="pendingQuestions.questions"
            @submit="handlePendingSubmit"
            @skip="handlePendingSkip"
          />
        </div>
        <div v-if="aiVisibilityPending" class="w-full relative">
          <div class="mx-2.5 relative z-0">
            <ClarifyingQuestionsCard
              :questions="AI_VISIBILITY_QUESTIONS"
              attached-to-editor
              @submit="handleAiVisibilitySubmit"
              @skip="handleAiVisibilitySkip"
            />
          </div>
          <div class="relative z-10 -mt-2">
            <PromptComposer
              ref="composerRef"
              v-model="inputValue"
              :focus-key="composerFocusKey"
              :scanning="isScanning"
              placeholder="Ask about SEO, or type a domain to audit, like 'audit example.com'"
              @send="handleSend"
              @stop="handleStopScan"
            />
          </div>
        </div>
        <PromptComposer
          v-else
          ref="composerRef"
          v-model="inputValue"
          :focus-key="composerFocusKey"
          :scanning="isScanning"
          placeholder="Ask about SEO, or type a domain to audit, like 'audit example.com'"
          @send="handleSend"
          @stop="handleStopScan"
        />
        <p class="text-center text-[11px] text-gray-400 mt-2 mb-2">
          Review important AI-assisted changes before publishing.
        </p>
      </div>
    </div>
  </main>
</template>
