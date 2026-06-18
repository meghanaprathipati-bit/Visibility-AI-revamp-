<script setup>
import { ref, watch } from 'vue'
import AppShell from '../shell/AppShell.vue'
import { ActionItemsPanel } from '../components/action-items/index.js'
import { deriveChatTitle, deriveChatTitleFromSession } from '../data/chatTitles.js'
import DetailSidePanel from '../components/split-pane/DetailSidePanel.vue'
import DetailedReportPanel from '../components/split-pane/DetailedReportPanel.vue'
import AiRankTrackingDashboard from '../components/dashboards/AiRankTrackingDashboard.vue'
import {
  SEO_SCAN_CHAT_ID,
  createSeoScanSession,
  createEmptySession,
} from '../data/seedChats.js'
import {
  NAV_SECTIONS,
  SUB_TABS,
  INITIAL_CHATS,
  INITIAL_CHAT_LABELS,
} from './visibility-ai/constants.js'
import ChatPanel from './visibility-ai/ChatPanel.vue'
import MainContent from './visibility-ai/MainContent.vue'
import ToolsPanel from './visibility-ai/ToolsPanel.vue'

const activeSubTab = ref('Visibility AI')

function onSubTabChange(tab) {
  activeSubTab.value = tab
}

const activePanel = ref('Chats')
const selectedDashboardId = ref('ai-rank-tracking')
const chatPanelCollapsed = ref(false)
const toolsPanelCollapsed = ref(false)
const composerFocusKey = ref(0)
const composerHasInput = ref(false)
const activeChatUsed = ref(false)
const detailPanel = ref(null)
const activeChatId = ref(1)
const chats = ref([...INITIAL_CHATS])
const nextChatId = ref(INITIAL_CHATS.length + 1)
const chatSessions = ref({
  [SEO_SCAN_CHAT_ID]: createSeoScanSession(),
})
const chatLabels = ref({ ...INITIAL_CHAT_LABELS })
const sessionDraft = ref(createEmptySession())

/** Deep-enough clone so switching chats never shares mutable message arrays */
function cloneSession(session) {
  if (!session) return createEmptySession()
  return {
    chatMode: Boolean(session.chatMode),
    isScanning: Boolean(session.isScanning),
    messages: Array.isArray(session.messages)
      ? session.messages.map(message => ({ ...message }))
      : [],
    inputValue: session.inputValue ?? '',
    pendingQuestions: session.pendingQuestions ?? null,
    aiVisibilityPending: Boolean(session.aiVisibilityPending),
    awaitingAnswer: session.awaitingAnswer ?? false,
  }
}

function persistSession(chatId, session) {
  if (chatId == null || !session) return
  chatSessions.value = {
    ...chatSessions.value,
    [chatId]: cloneSession(session),
  }
}

function getChatLabel(chat) {
  return chatLabels.value[chat.id] ?? chat.label
}

function setChatLabel(chatId, label) {
  chatLabels.value = { ...chatLabels.value, [chatId]: label }
  chats.value = chats.value.map(chat =>
    chat.id === chatId ? { ...chat, label } : chat,
  )
}

function applyAutoChatTitle(chatId, titleOrMessage, useAsIs = false) {
  if (chatId == null || !titleOrMessage?.trim()) return
  const title = useAsIs ? titleOrMessage.trim() : deriveChatTitle(titleOrMessage)
  const current = chatLabels.value[chatId]
  if (current && current !== 'New chat') return
  setChatLabel(chatId, title)
}

function syncChatTitleFromSession(chatId, session) {
  if (!session?.messages?.length) return
  const title = deriveChatTitleFromSession(session)
  if (!title || chatId == null) return
  const current = chatLabels.value[chatId]
  if (current && current !== 'New chat') return
  setChatLabel(chatId, title)
}

watch(chatSessions, (sessions) => {
  let changed = false
  const next = { ...chatLabels.value }
  for (const [idStr, session] of Object.entries(sessions)) {
    const id = Number(idStr)
    if (next[id] && next[id] !== 'New chat') continue
    const title = deriveChatTitleFromSession(session)
    if (title && next[id] !== title) {
      next[id] = title
      changed = true
    }
  }
  if (changed) {
    chatLabels.value = next
    chats.value = chats.value.map(chat => ({
      ...chat,
      label: next[chat.id] ?? chat.label,
    }))
  }
}, { deep: true })

function isChatSessionUsed(session) {
  if (!session) return false
  return Boolean(
    session.chatMode
    || session.isScanning
    || session.messages?.length
    || session.inputValue?.trim()
    || session.pendingQuestions
    || session.aiVisibilityPending
    || session.awaitingAnswer,
  )
}

function handleSelectChat(chatId) {
  if (activeChatId.value != null && sessionDraft.value) {
    persistSession(activeChatId.value, sessionDraft.value)
  }

  const next = { ...chatSessions.value }
  if (chatId === SEO_SCAN_CHAT_ID && !next[chatId]) {
    next[chatId] = cloneSession(createSeoScanSession())
  }
  chatSessions.value = next

  activeChatId.value = chatId
  detailPanel.value = null
  composerHasInput.value = false

  const loaded = chatSessions.value[chatId]
  sessionDraft.value = loaded ? cloneSession(loaded) : createEmptySession()
  activeChatUsed.value = chatId !== SEO_SCAN_CHAT_ID && isChatSessionUsed(loaded)
}

function handleNewChatSession(newChatId) {
  if (activeChatId.value != null && sessionDraft.value) {
    persistSession(activeChatId.value, sessionDraft.value)
  }

  const emptySession = createEmptySession()
  chatSessions.value = {
    ...chatSessions.value,
    [newChatId]: cloneSession(emptySession),
  }
  sessionDraft.value = cloneSession(emptySession)
  activeChatId.value = newChatId
  composerFocusKey.value += 1
  composerHasInput.value = false
  activeChatUsed.value = false
  detailPanel.value = null
}

function handleCreateChat() {
  const existingEmpty = chats.value.find(chat => getChatLabel(chat) === 'New chat')
  if (existingEmpty && !activeChatUsed.value) {
    handleSelectChat(existingEmpty.id)
    return
  }

  const newId = nextChatId.value
  nextChatId.value += 1
  chats.value = [{ id: newId, label: 'New chat' }, ...chats.value]
  setChatLabel(newId, 'New chat')
  handleNewChatSession(newId)
}

function handleRenameChat({ id, label }) {
  setChatLabel(id, label)
}

function handleDeleteChat(id) {
  const remaining = chats.value.filter(chat => chat.id !== id)
  if (activeChatId.value === id && remaining.length > 0) {
    handleSelectChat(remaining[0].id)
  }
  chats.value = remaining

  const nextLabels = { ...chatLabels.value }
  delete nextLabels[id]
  chatLabels.value = nextLabels

  const nextSessions = { ...chatSessions.value }
  delete nextSessions[id]
  chatSessions.value = nextSessions
}

function handleSessionDraft(session) {
  sessionDraft.value = cloneSession(session)
  syncChatTitleFromSession(activeChatId.value, session)
}

function handleMessageSent(sessionSnapshot) {
  activeChatUsed.value = true
  if (sessionSnapshot && activeChatId.value != null) {
    persistSession(activeChatId.value, sessionSnapshot)
    syncChatTitleFromSession(activeChatId.value, sessionSnapshot)
  }
}

function handleChatAutoTitle(title, useAsIs) {
  applyAutoChatTitle(activeChatId.value, title, useAsIs)
}

function handlePanelChange(tab) {
  activePanel.value = tab
  if (tab === 'Dashboards') detailPanel.value = null
}
</script>

<template>
  <AppShell
    sidebar="main-nav"
    :sidebar-props="{ navSections: NAV_SECTIONS }"
    topbar="tabbed"
    :topbar-props="{
      title: 'Reputation',
      sectionTabs: [],
      activeSection: '',
      subTabs: SUB_TABS,
      activeSubTab,
      onSubTabChange,
    }"
  >
    <div class="flex flex-1 min-h-0 h-full overflow-hidden bg-white">
      <ChatPanel
        :active-panel="activePanel"
        :active-chat-id="activeChatId"
        :chats="chats"
        :chat-labels="chatLabels"
        :selected-dashboard-id="selectedDashboardId"
        :collapsed="chatPanelCollapsed"
        :composer-has-input="composerHasInput"
        :active-chat-used="activeChatUsed"
        @create-chat="handleCreateChat"
        @rename-chat="handleRenameChat"
        @delete-chat="handleDeleteChat"
        @select-chat="handleSelectChat"
        @panel-change="handlePanelChange"
        @select-dashboard="selectedDashboardId = $event"
        @toggle-collapse="chatPanelCollapsed = !chatPanelCollapsed"
      />
      <div class="flex flex-1 min-w-0 min-h-0 overflow-hidden">
        <AiRankTrackingDashboard v-if="activePanel === 'Dashboards'" />
        <template v-else>
          <MainContent
            :key="activeChatId"
            :active-chat-id="activeChatId"
            :loaded-session="chatSessions[activeChatId]"
            :composer-focus-key="composerFocusKey"
            :detail-panel-open="Boolean(detailPanel)"
            @session-draft="handleSessionDraft"
            @chat-auto-title="handleChatAutoTitle"
            @input-change="composerHasInput = $event"
            @message-sent="handleMessageSent"
            @open-detail-panel="detailPanel = $event"
          />
          <DetailSidePanel
            v-if="detailPanel"
            :type="detailPanel.type"
            :title="detailPanel.title"
            :subtitle="detailPanel.subtitle"
            @close="detailPanel = null"
          >
            <ActionItemsPanel
              v-if="detailPanel.type === 'action-items'"
              :items="detailPanel.items"
              embedded
            />
            <DetailedReportPanel
              v-if="detailPanel.type === 'report'"
              :report="detailPanel.report"
            />
          </DetailSidePanel>
        </template>
      </div>
      <ToolsPanel
        :collapsed="toolsPanelCollapsed"
        @toggle-collapse="toolsPanelCollapsed = !toolsPanelCollapsed"
      />
    </div>
  </AppShell>
</template>
