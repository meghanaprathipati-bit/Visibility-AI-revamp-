<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ChevronDown, Search, Plus, Settings, Check, X, Pencil, Trash2, TrendingUp,
  MessageChatSquareIcon, Grid01Icon, PanelLeftIcon, FolderPlus,
} from '../../icons/index.js'
import { DASHBOARD_ITEMS } from '../../data/aiRankDashboard.js'
import VaLogo from './VaLogo.vue'
import NewProjectModal from './NewProjectModal.vue'
import { INITIAL_PROJECTS } from './constants.js'

const props = defineProps({
  activePanel: { type: String, required: true },
  activeChatId: { type: Number, required: true },
  chats: { type: Array, required: true },
  chatLabels: { type: Object, default: () => ({}) },
  selectedDashboardId: { type: String, default: '' },
  collapsed: { type: Boolean, default: false },
  composerHasInput: { type: Boolean, default: false },
  activeChatUsed: { type: Boolean, default: false },
})

const emit = defineEmits([
  'createChat',
  'renameChat',
  'deleteChat',
  'selectChat',
  'panelChange',
  'selectDashboard',
  'toggleCollapse',
])

const editingId = ref(null)
const editingLabel = ref('')
const searchQuery = ref('')
const dashboardSearchQuery = ref('')
const projects = ref([...INITIAL_PROJECTS])
const projectDropdownOpen = ref(false)
const activeProjectId = ref(1)
const newProjectModalOpen = ref(false)
const nextProjectId = ref(INITIAL_PROJECTS.length + 1)
const collapsedSearchOpen = ref(false)
const dropdownRef = ref(null)
const collapsedSearchRef = ref(null)

const filteredChats = computed(() =>
  props.chats.filter(c =>
    getChatLabel(c).toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
)

const filteredDashboards = computed(() =>
  DASHBOARD_ITEMS.filter(d =>
    d.label.toLowerCase().includes(dashboardSearchQuery.value.toLowerCase()),
  ),
)

const activeProjectLabel = computed(() =>
  projects.value.find(p => p.id === activeProjectId.value)?.label,
)

const hasEmptyUnused = computed(() =>
  props.chats.some(c => getChatLabel(c) === 'New chat' && c.id === props.activeChatId)
  && !props.composerHasInput
  && !props.activeChatUsed,
)

function getChatLabel(chat) {
  return props.chatLabels[chat.id] ?? chat.label
}

function handleCreateProject(data) {
  const id = nextProjectId.value
  projects.value = [{ id, label: data.name }, ...projects.value]
  activeProjectId.value = id
  nextProjectId.value += 1
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    projectDropdownOpen.value = false
  }
  if (collapsedSearchRef.value && !collapsedSearchRef.value.contains(e.target)) {
    collapsedSearchOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

function selectProject(projectId) {
  activeProjectId.value = projectId
  projectDropdownOpen.value = false
}

function handleNewChat() {
  emit('createChat')
}

function handleEdit(e, chat) {
  e.stopPropagation()
  editingId.value = chat.id
  editingLabel.value = getChatLabel(chat)
}

function handleConfirmEdit(e) {
  if (e) e.stopPropagation()
  if (editingLabel.value.trim()) {
    emit('renameChat', { id: editingId.value, label: editingLabel.value.trim() })
  }
  editingId.value = null
  editingLabel.value = ''
}

function handleCancelEdit(e) {
  if (e) e.stopPropagation()
  editingId.value = null
  editingLabel.value = ''
}

function handleDelete(e, id) {
  e.stopPropagation()
  emit('deleteChat', id)
}

function toggleCollapse() {
  projectDropdownOpen.value = false
  collapsedSearchOpen.value = false
  emit('toggleCollapse')
}
</script>

<template>
  <aside
    class="relative shrink-0 border-r border-gray-200 bg-white flex flex-col h-full min-h-0 transition-[width] duration-200 overflow-visible"
    :class="collapsed ? 'w-[56px]' : 'w-[280px]'"
  >
    <!-- ── Collapsed: icon-only rail ── -->
    <div
      v-if="collapsed"
      class="flex flex-col items-center flex-1 min-h-0 w-full pt-3 pb-3"
    >
      <VaLogo />
      <button
        type="button"
        class="mt-2 w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        aria-label="Expand panel"
        title="Expand panel"
        @click="toggleCollapse"
      >
        <PanelLeftIcon :size="16" />
      </button>

      <div class="mt-3 flex flex-col items-center flex-1 min-h-0 w-full px-2">
        <!-- Project -->
        <div ref="dropdownRef" class="relative">
          <button
            type="button"
            title="Project"
            aria-label="Project"
            class="size-9 rounded-lg flex items-center justify-center border transition-colors"
            :class="projectDropdownOpen
              ? 'border-primary-600 bg-primary-50 text-primary-600'
              : 'border-primary-200 bg-gray-50 text-primary-600 hover:bg-primary-50'"
            @click="projectDropdownOpen = !projectDropdownOpen"
          >
            <FolderPlus :size="16" :stroke-width="1.75" />
          </button>
          <div
            v-if="projectDropdownOpen"
            class="absolute left-full top-0 ml-2 z-[100] w-[240px] bg-white border border-gray-200 rounded-lg shadow-dropdown overflow-hidden"
          >
            <button
              type="button"
              class="flex items-center gap-2 w-full px-4 py-2.5 text-left text-primary-600 hover:bg-primary-50 transition-colors"
              @click="projectDropdownOpen = false; newProjectModalOpen = true"
            >
              <FolderPlus :size="14" class="shrink-0" />
              <span class="text-[14px] font-medium">New project</span>
            </button>
            <div class="border-t border-gray-200" />
            <div class="max-h-[240px] overflow-y-auto scrollbar-gray-300">
              <button
                v-for="project in projects"
                :key="project.id"
                type="button"
                class="flex items-center w-full px-4 py-2.5 text-left transition-colors"
                :class="project.id === activeProjectId ? 'bg-primary-50' : 'hover:bg-gray-50'"
                @click="selectProject(project.id)"
              >
                <span class="flex-1 text-[14px] font-normal text-gray-700 truncate">
                  {{ project.label }}
                </span>
                <Check v-if="project.id === activeProjectId" :size="14" class="text-primary-600 shrink-0 ml-2" />
              </button>
            </div>
          </div>
        </div>

        <!-- Group 2: Tabs + New chat (matches expanded order) -->
        <div class="mt-[18px] flex flex-col items-center gap-2 w-full">
          <div class="flex flex-col items-center bg-gray-100 rounded-xl p-1 gap-0.5 w-10">
            <button
              type="button"
              title="Chats"
              aria-label="Chats"
              class="size-8 rounded-lg flex items-center justify-center transition-all duration-150"
              :class="activePanel === 'Chats'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
              @click="emit('panelChange', 'Chats')"
            >
              <MessageChatSquareIcon :size="15" />
            </button>
            <button
              type="button"
              title="Dashboards"
              aria-label="Dashboards"
              class="size-8 rounded-lg flex items-center justify-center transition-all duration-150"
              :class="activePanel === 'Dashboards'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
              @click="emit('panelChange', 'Dashboards')"
            >
              <Grid01Icon :size="15" />
            </button>
          </div>
          <button
            v-if="activePanel === 'Chats'"
            type="button"
            title="New chat"
            aria-label="New chat"
            :disabled="hasEmptyUnused"
            class="size-9 rounded-lg flex items-center justify-center border border-primary-200 bg-white text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            @click="handleNewChat"
          >
            <Plus :size="16" :stroke-width="2.5" />
          </button>
        </div>

        <!-- Search -->
        <div ref="collapsedSearchRef" class="mt-[18px] relative">
          <button
            type="button"
            :title="activePanel === 'Chats' ? 'Search chats' : 'Search dashboards'"
            :aria-label="activePanel === 'Chats' ? 'Search chats' : 'Search dashboards'"
            class="size-9 rounded-lg flex items-center justify-center transition-colors"
            :class="collapsedSearchOpen
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            @click="collapsedSearchOpen = !collapsedSearchOpen"
          >
            <Search :size="16" :stroke-width="1.75" />
          </button>
          <div
            v-if="collapsedSearchOpen"
            class="absolute left-full top-0 ml-2 z-[100] w-[220px] bg-white border border-gray-200 rounded-lg shadow-dropdown p-2"
          >
            <div class="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-gray-100 rounded-lg">
              <Search :size="13" class="text-gray-400 shrink-0" />
              <input
                v-if="activePanel === 'Chats'"
                v-model="searchQuery"
                autofocus
                type="text"
                placeholder="Search chats"
                class="flex-1 min-w-0 text-[13px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
              >
              <input
                v-else
                v-model="dashboardSearchQuery"
                autofocus
                type="text"
                placeholder="Search dashboards"
                class="flex-1 min-w-0 text-[13px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
              >
              <button
                v-if="activePanel === 'Chats' ? searchQuery : dashboardSearchQuery"
                type="button"
                class="shrink-0 text-gray-400 hover:text-gray-500"
                aria-label="Clear search"
                @click="activePanel === 'Chats' ? searchQuery = '' : dashboardSearchQuery = ''"
              >
                <X :size="12" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        title="Visibility settings"
        aria-label="Visibility settings"
        class="size-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:text-primary-600 hover:bg-gray-200 transition-colors shrink-0"
      >
        <Settings :size="16" />
      </button>
    </div>

    <!-- ── Expanded: icons + labels ── -->
    <div
      v-else
      class="flex flex-col flex-1 min-h-0 w-full hover-shows-scrollbar"
    >
      <div class="flex items-center gap-2.5 px-3 pt-3 pb-3 border-b border-gray-200 shrink-0">
        <VaLogo />
        <div class="flex-1 min-w-0">
          <div class="text-[14px] font-semibold text-gray-900 leading-tight truncate">Visibility AI</div>
          <div class="text-[12px] text-gray-500 leading-tight truncate">Search, AI, and local</div>
        </div>
        <button
          type="button"
          class="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Collapse panel"
          title="Collapse panel"
          @click="toggleCollapse"
        >
          <PanelLeftIcon :size="16" />
        </button>
      </div>

      <!-- Group 1: Project dropdown -->
      <div class="px-3 pt-3 shrink-0">
        <div ref="dropdownRef" class="relative">
          <button
            type="button"
            class="flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all border"
            :class="projectDropdownOpen ? 'bg-white border-primary-600 shadow-focus-primary-sm' : 'bg-white border-gray-200 hover:bg-gray-50'"
            @click="projectDropdownOpen = !projectDropdownOpen"
          >
            <span class="text-[14px] font-medium text-gray-900 truncate flex-1 text-left">
              {{ activeProjectLabel }}
            </span>
            <ChevronDown
              :size="13"
              class="text-gray-400 shrink-0 transition-transform duration-200"
              :class="{ 'rotate-180': projectDropdownOpen }"
            />
          </button>

          <div
            v-if="projectDropdownOpen"
            class="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-dropdown overflow-hidden"
          >
            <button
              type="button"
              class="flex items-center gap-2 w-full px-4 py-2.5 text-left text-primary-600 hover:bg-primary-50 transition-colors"
              @click="projectDropdownOpen = false; newProjectModalOpen = true"
            >
              <FolderPlus :size="14" class="shrink-0" />
              <span class="text-[14px] font-medium">New project</span>
            </button>
            <div class="border-t border-gray-200" />
            <div class="max-h-[240px] overflow-y-auto scrollbar-gray-300">
              <button
                v-for="project in projects"
                :key="project.id"
                type="button"
                class="flex items-center w-full px-4 py-2.5 text-left transition-colors"
                :class="project.id === activeProjectId ? 'bg-primary-50' : 'hover:bg-gray-50'"
                @click="selectProject(project.id)"
              >
                <span class="flex-1 text-[14px] font-normal text-gray-700 truncate">
                  {{ project.label }}
                </span>
                <Check v-if="project.id === activeProjectId" :size="14" class="text-primary-600 shrink-0 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Group 2: Tabs + New chat (coupled) -->
      <div class="px-3 mt-[18px] shrink-0 flex flex-col gap-2">
        <div class="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
          <button
            v-for="tab in ['Chats', 'Dashboards']"
            :key="tab"
            type="button"
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150"
            :class="activePanel === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
            @click="emit('panelChange', tab)"
          >
            <MessageChatSquareIcon v-if="tab === 'Chats'" :size="14" />
            <Grid01Icon v-else :size="14" />
            {{ tab }}
          </button>
        </div>
        <button
          v-if="activePanel === 'Chats'"
          type="button"
          :disabled="hasEmptyUnused"
          class="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-primary-200 bg-white text-primary-600 text-[13px] font-semibold hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          @click="handleNewChat"
        >
          <Plus :size="14" :stroke-width="2.5" />
          New chat
        </button>
      </div>

      <!-- Group 3: Search + list (decoupled from New chat) -->
      <div class="px-3 mt-[18px] pb-3 shrink-0">
        <div v-if="activePanel === 'Chats'" class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg">
          <Search :size="13" class="text-gray-400 shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search chats"
            class="flex-1 text-[13px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
          >
          <button
            v-if="searchQuery"
            type="button"
            class="shrink-0 text-gray-400 hover:text-gray-500"
            @click="searchQuery = ''"
          >
            <X :size="12" />
          </button>
        </div>
        <div v-else class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg">
          <Search :size="13" class="text-gray-400 shrink-0" />
          <input
            v-model="dashboardSearchQuery"
            type="text"
            placeholder="Search dashboards"
            class="flex-1 text-[13px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
          >
          <button
            v-if="dashboardSearchQuery"
            type="button"
            class="shrink-0 text-gray-400 hover:text-gray-500"
            @click="dashboardSearchQuery = ''"
          >
            <X :size="12" />
          </button>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto scrollbar-gray-300">
        <div v-if="activePanel === 'Chats'" class="flex flex-col gap-0.5 px-2">
          <div
            v-for="chat in filteredChats"
            :key="chat.id"
            class="group flex items-center gap-2 px-2.5 h-9 rounded-lg w-full transition-colors cursor-pointer"
            :class="chat.id === activeChatId ? 'bg-primary-50' : 'hover:bg-gray-50'"
            @click="editingId !== chat.id && emit('selectChat', chat.id)"
          >
            <template v-if="editingId === chat.id">
              <input
                v-model="editingLabel"
                autofocus
                class="flex-1 min-w-0 py-0 text-[13px] bg-transparent outline-none leading-[1.5]"
                :class="chat.id === activeChatId ? 'font-medium text-gray-900' : 'font-normal text-gray-700'"
                @keydown.enter="handleConfirmEdit()"
                @keydown.esc="handleCancelEdit()"
                @click.stop
              >
              <button
                type="button"
                class="shrink-0 p-1 text-success-600 hover:text-success-900 transition-colors rounded"
                @click="handleConfirmEdit"
              >
                <Check :size="12" />
              </button>
              <button
                type="button"
                class="shrink-0 p-1 text-gray-500 hover:text-gray-700 transition-colors rounded"
                @click="handleCancelEdit"
              >
                <X :size="12" />
              </button>
            </template>
            <template v-else>
              <span
                class="flex-1 min-w-0 text-[13px] truncate"
                :class="chat.id === activeChatId ? 'font-medium text-gray-900' : 'text-gray-700'"
              >
                {{ getChatLabel(chat) }}
              </span>
              <div class="shrink-0 items-center gap-0.5 hidden group-hover:flex">
                <button
                  type="button"
                  class="p-1 text-gray-400 hover:text-gray-700 transition-colors rounded"
                  aria-label="Edit"
                  @click="handleEdit($event, chat)"
                >
                  <Pencil :size="12" />
                </button>
                <button
                  type="button"
                  class="p-1 text-error-600 hover:text-error-700 transition-colors rounded"
                  aria-label="Delete"
                  @click="handleDelete($event, chat.id)"
                >
                  <Trash2 :size="12" />
                </button>
              </div>
            </template>
          </div>
        </div>
        <div v-else class="flex flex-col gap-0.5 px-2 pt-1">
          <button
            v-for="dashboard in filteredDashboards"
            :key="dashboard.id"
            type="button"
            class="flex items-center gap-2 px-2.5 h-9 rounded-lg w-full transition-colors text-left"
            :class="dashboard.id === selectedDashboardId ? 'bg-primary-50' : 'hover:bg-gray-50'"
            @click="emit('selectDashboard', dashboard.id)"
          >
            <div class="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
              <TrendingUp :size="13" class="text-gray-500" />
            </div>
            <span
              class="flex-1 min-w-0 text-[13px] truncate"
              :class="dashboard.id === selectedDashboardId ? 'font-medium text-gray-900' : 'text-gray-700'"
            >
              {{ dashboard.label }}
            </span>
          </button>
        </div>
      </div>

      <div class="border-t border-gray-200 px-3 py-3 shrink-0">
        <button
          type="button"
          class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-medium text-gray-600 hover:text-primary-600 transition-colors"
        >
          <Settings :size="14" />
          Visibility settings
        </button>
      </div>
    </div>

    <NewProjectModal
      v-if="newProjectModalOpen"
      :show="newProjectModalOpen"
      @close="newProjectModalOpen = false"
      @create-project="handleCreateProject"
    />
  </aside>
</template>
