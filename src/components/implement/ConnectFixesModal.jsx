import { useState } from 'react'
import { Globe, Download, Plus, ExternalLink } from '../../icons/index.js'
import HLModal, { modalTitle, modalSubtext } from '../HLModal.jsx'
import HLInput from '../HLInput.jsx'
import HLButton from '../HLButton.jsx'

// Connect modal shown after "Apply fixes". In production only one variant appears,
// chosen automatically from the site's platform (WordPress or Cloudflare). For the
// demo we expose a WordPress | Cloudflare toggle so both can be shown to the PM.

const CONNECT_CTA = 'Connect and apply'

const PLATFORM_META = {
  wordpress: {
    title: 'Connect WordPress to implement SEO fixes',
    subtitle: 'Install the Visibility AI SEO plugin, copy the API token from WordPress, then connect it here.',
  },
  cloudflare: {
    title: 'Connect Cloudflare to apply fixes',
    subtitle: 'Fixes are delivered through your Cloudflare account. Add your account ID and an API token to finish the one-time setup before we apply changes.',
  },
}

const FORM_LABEL_CLASS = 'block text-[14px] font-medium text-gray-500 mb-1'
const FORM_HELPER_CLASS = 'text-[12px] text-gray-500 mb-3'

// Small inline eye / eye-off toggle (no Eye icon exists in the icon set).
function EyeToggle({ visible, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-500 hover:text-gray-600 transition-colors shrink-0"
      aria-label={visible ? 'Hide token' : 'Show token'}
    >
      {visible ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      )}
    </button>
  )
}

function StepCard({ n, Icon, iconWrap, iconColor, title, desc, children }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 min-w-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconWrap}`}>
        <Icon size={16} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-gray-900 mb-1 leading-snug">{n}. {title}</p>
        <p className="text-[13px] font-normal text-gray-500 leading-[18px]">{desc}</p>
      </div>
      {children && <div className="mt-auto min-w-0">{children}</div>}
    </div>
  )
}

/** Primary action link — colored (e.g. Download plugin, Create API token) */
function StepLink({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-600 hover:text-primary-700 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/** Secondary action link — gray (e.g. Open token settings) */
function StepLinkMuted({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default function ConnectFixesModal({ platform, onPlatformChange, onClose, onApply }) {
  const [apiToken, setApiToken] = useState('')       // WordPress plugin token
  const [pluginDownloaded, setPluginDownloaded] = useState(false)
  const [accountId, setAccountId] = useState('')     // Cloudflare account ID
  const [cfToken, setCfToken] = useState('')         // Cloudflare API token
  const [showToken, setShowToken] = useState(false)

  const meta = PLATFORM_META[platform] || PLATFORM_META.wordpress
  const canSubmit = platform === 'wordpress'
    ? !!apiToken.trim()
    : !!accountId.trim() && !!cfToken.trim()

  const header = (
    <div className="px-6 pt-6 pb-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
          <Globe size={18} className="text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 id="connect-fixes-title" className={`${modalTitle} m-0`}>{meta.title}</h2>
          <p className={`${modalSubtext} m-0 mt-1`}>{meta.subtitle}</p>
        </div>
      </div>
      {/* Demo-only platform switch — production picks the variant from the site's platform. */}
      <div className="mt-4 inline-flex items-center gap-0.5 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
        {[{ id: 'wordpress', label: 'WordPress' }, { id: 'cloudflare', label: 'Cloudflare' }].map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPlatformChange(p.id)}
            className={`px-3 py-1.5 rounded-md text-[14px] font-medium transition-all ${
              platform === p.id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <HLButton variant="secondary" color="gray" size="sm" onClick={onClose}>
        Cancel
      </HLButton>
      <HLButton
        variant="primary"
        color="blue"
        size="sm"
        disabled={!canSubmit}
        onClick={() => { if (canSubmit) (onApply || onClose)() }}
      >
        {CONNECT_CTA}
      </HLButton>
    </div>
  )

  return (
    <HLModal
      id="connect-fixes"
      width={840}
      headerDivider
      header={header}
      footer={footer}
      footerClassName="px-6 py-4"
      contentClassName="px-6 py-5"
      onClose={onClose}
    >
      {platform === 'wordpress' ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StepCard n="1" Icon={Download} iconWrap="bg-primary-50" iconColor="text-primary-600"
              title="Download plugin" desc="Download the Visibility AI SEO plugin package for your WordPress site.">
              <StepLink onClick={() => setPluginDownloaded(true)}>
                <Download size={14} className="shrink-0" />
                Download plugin
              </StepLink>
            </StepCard>

            <StepCard n="2" Icon={Plus} iconWrap="bg-purple-50" iconColor="text-purple-600"
              title="Install in WordPress" desc="Open WordPress admin, go to Plugins, Add New, Upload Plugin, then activate it.">
              {pluginDownloaded ? (
                <StepLink>
                  <ExternalLink size={14} className="shrink-0" />
                  Open WordPress admin
                </StepLink>
              ) : (
                <span className="text-[13px] font-medium text-gray-500">
                  Download the plugin first
                </span>
              )}
            </StepCard>

            <StepCard n="3" Icon={ExternalLink} iconWrap="bg-success-50" iconColor="text-success-600"
              title="Copy API token" desc="Open the plugin settings page in WordPress and copy the API token shown there.">
              <StepLinkMuted>
                <ExternalLink size={14} className="shrink-0" />
                Open token settings
              </StepLinkMuted>
            </StepCard>
          </div>

          <div className="mt-4 border border-gray-200 rounded-lg p-4">
            <label htmlFor="connect-wp-token" className={FORM_LABEL_CLASS}>WordPress plugin API token</label>
            <p className={FORM_HELPER_CLASS}>
              Paste the token from{' '}
              <span className="text-primary-600">https://ramada.9hf9h.com/wp-admin/options-general.php?page=visibility-ai-seo</span>.
              {' '}The token is used only to complete this connection flow.
            </p>
            <HLInput
              id="connect-wp-token"
              size="sm"
              value={apiToken}
              onChange={e => setApiToken(e.target.value)}
              placeholder="Paste the token from your plugin settings page"
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StepCard n="1" Icon={ExternalLink} iconWrap="bg-primary-50" iconColor="text-primary-600"
              title="Create API token" desc="Open the token template in Cloudflare so the required permissions are pre-filled.">
              <StepLink>
                <ExternalLink size={14} className="shrink-0" />
                Create API token
              </StepLink>
            </StepCard>

            <StepCard n="2" Icon={Plus} iconWrap="bg-purple-50" iconColor="text-purple-600"
              title="Grant permissions" desc="The token template pre-fills the permissions we need to apply edge fixes.">
              <span className="inline-flex items-center text-[13px] font-medium text-purple-700">
                Permissions pre-filled
              </span>
            </StepCard>

            <StepCard n="3" Icon={Globe} iconWrap="bg-success-50" iconColor="text-success-600"
              title="Copy account ID" desc="Find the 32-character account ID on your Cloudflare dashboard overview page.">
              <span className="inline-flex items-center text-[13px] font-medium text-success-700">
                On the overview page
              </span>
            </StepCard>
          </div>

          <div className="mt-4 border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
            <div>
              <label htmlFor="connect-cf-account-id" className={FORM_LABEL_CLASS}>Cloudflare account ID</label>
              <p className={FORM_HELPER_CLASS}>Found on your Cloudflare dashboard overview page (32-character value).</p>
              <HLInput
                id="connect-cf-account-id"
                size="sm"
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                placeholder="32-character account ID"
              />
            </div>
            <div>
              <label htmlFor="connect-cf-token" className={FORM_LABEL_CLASS}>Cloudflare API token</label>
              <p className={FORM_HELPER_CLASS}>Create a token with the required permissions, then paste it here.</p>
              <HLInput
                id="connect-cf-token"
                size="sm"
                type={showToken ? 'text' : 'password'}
                value={cfToken}
                onChange={e => setCfToken(e.target.value)}
                placeholder="Paste the API token you created"
                suffix={<EyeToggle visible={showToken} onClick={() => setShowToken(v => !v)} />}
              />
            </div>
          </div>
        </>
      )}
    </HLModal>
  )
}
