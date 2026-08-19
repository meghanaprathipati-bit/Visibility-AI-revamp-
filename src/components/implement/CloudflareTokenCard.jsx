import { ExternalLink } from '../../icons/index.js'
import HLButton from '../HLButton.jsx'

const CLOUDFLARE_API_TOKENS_URL = 'https://dash.cloudflare.com/profile/api-tokens'

/** Step 1 — prompt user to connect their website before the Cloudflare credential flow */
export default function CloudflareTokenCard({ onContinue, actionsDisabled = false }) {
  function handleOpenCloudflare() {
    window.open(CLOUDFLARE_API_TOKENS_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5">
        <p className="text-[14px] font-semibold text-gray-900 leading-relaxed m-0">
          Connect your website
        </p>
        <p className="text-[14px] text-gray-700 leading-relaxed m-0">
          Visibility AI will analyze your website, suggest improvements, and make it easy for you to publish approved changes when you&apos;re ready.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          disabled={actionsDisabled}
          onClick={handleOpenCloudflare}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <ExternalLink size={14} className="shrink-0" />
          Open Cloudflare API token page
        </button>
        <HLButton
          variant="primary"
          color="blue"
          size="sm"
          disabled={actionsDisabled}
          className="w-fit"
          onClick={onContinue}
        >
          Continue
        </HLButton>
      </div>
    </div>
  )
}
