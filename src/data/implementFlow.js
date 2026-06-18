import { Globe, Lock01Icon } from '../icons/index.js'

/** Prototype Cloudflare credential questions — replace with API-driven form in production */
export const CLOUDFLARE_CONNECT_QUESTIONS = [
  {
    id: 'cloudflare-account-id',
    label: 'Connect Cloudflare account — enter your account ID',
    type: 'text',
    placeholder: 'Enter your account ID',
    required: true,
    icon: Globe,
  },
  {
    id: 'cloudflare-api-token',
    label: 'Cloudflare API token',
    type: 'password',
    placeholder: 'Enter your API token',
    required: true,
    icon: Lock01Icon,
  },
]

/** Contextual label for the action items pane implement button — replace with billing state in production */
export function getImplementButtonState({ implementFlow, selectedAutofixCount, packageCustomizerMode, freeFixLimit }) {
  const defaultLabel = packageCustomizerMode
    ? `Set to implement changes (${selectedAutofixCount}/${freeFixLimit} free)`
    : `Implement changes${selectedAutofixCount > 0 ? ` (${selectedAutofixCount})` : ''}`

  if (implementFlow?.allAutoFixesDone) {
    return { disabled: true, label: 'Only manual fixes left', action: null }
  }

  switch (implementFlow?.step) {
    case 'cloudflare-token':
    case 'cloudflare-credentials':
      return { disabled: true, label: 'Connect site first', action: null }
    case 'preview':
      return {
        disabled: true,
        label: implementFlow.round === 'subscribed' ? 'Proceed in chat' : 'Confirm in chat',
        action: null,
      }
    case 'implementing':
      return { disabled: true, label: 'Implementing...', action: null }
    default:
      break
  }

  if (implementFlow?.freeImplementDone && !implementFlow?.subscribed) {
    return { disabled: false, label: 'Subscribe to fix all', action: 'subscribe' }
  }

  if (packageCustomizerMode) {
    return {
      disabled: selectedAutofixCount === 0,
      label: `Set to implement changes (${selectedAutofixCount}/${freeFixLimit} free)`,
      action: 'start',
    }
  }

  return {
    disabled: selectedAutofixCount === 0,
    label: defaultLabel,
    action: 'start',
  }
}
