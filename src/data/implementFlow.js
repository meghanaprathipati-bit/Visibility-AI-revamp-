import { Globe, Lock01Icon } from '../icons/index.js'

/** Prototype Cloudflare credential form title — replace with API copy in production */
export const CLOUDFLARE_CONNECT_TITLE = 'Connect your Cloudflare account'

/** Prototype Cloudflare credential questions — replace with API-driven form in production */
export const CLOUDFLARE_CONNECT_QUESTIONS = [
  {
    id: 'cloudflare-account-id',
    label: 'Account ID',
    helperText: "Found in Cloudflare Dashboard → right sidebar under 'Account ID'",
    type: 'text',
    placeholder: 'Paste your account ID (e.g. a1b2c3d4e5f6...)',
    required: true,
    icon: Globe,
  },
  {
    id: 'cloudflare-api-token',
    label: 'API token',
    helperText: 'Create a token in Cloudflare → My Profile → API Tokens → with Zone:Read & DNS:Edit permissions',
    type: 'password',
    placeholder: "Paste your API token – it won't be shown again after saving",
    required: true,
    icon: Lock01Icon,
  },
]

const BUSY_STEPS = new Set(['cloudflare-token', 'cloudflare-credentials', 'implementing'])

/** Prototype panel footer — replace with billing + job state from API in production */
export function getActionItemsFooterState({
  implementFlow,
  selectedAutofixCount,
  selectableAutofixCount,
}) {
  const manualOnly = Boolean(implementFlow?.freeImplementDone || implementFlow?.allAutoFixesDone)
  const isBusy = BUSY_STEPS.has(implementFlow?.step)

  if (manualOnly) {
    return {
      mode: 'manual-only',
      rescanDisabled: isBusy,
      cancelDisabled: isBusy,
    }
  }

  return {
    mode: 'autofix',
    rescanTertiaryDisabled: isBusy,
    implementSelectedDisabled: isBusy || selectedAutofixCount === 0,
    cancelDisabled: isBusy,
  }
}
