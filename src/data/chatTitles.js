/**
 * Derives a sidebar chat title from the first user message — replace with API in production.
 */

import { getQuickActionLabelForPrompt } from './quickActions.js'

const MAX_TITLE_LENGTH = 48

function truncate(text) {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_TITLE_LENGTH) return trimmed
  return `${trimmed.slice(0, MAX_TITLE_LENGTH - 1).trim()}…`
}

/** Chip prompts use the short chip label; typed prompts fall back to a truncated message */
export function deriveChatTitle(text) {
  const chipLabel = getQuickActionLabelForPrompt(text)
  if (chipLabel) return chipLabel
  if (!text?.trim()) return 'New chat'
  return truncate(text)
}

export function deriveChatTitleFromSession(session) {
  const firstUser = session?.messages?.find(message => message.type === 'user')
  if (!firstUser?.content) return null
  return deriveChatTitle(firstUser.content)
}
