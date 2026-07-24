import HLButton from './HLButton.jsx'
import { AI_VISIBILITY_SETUP_GREETING } from '../data/onboardingData.js'

/** AI visibility onboarding — greeting + CTA before the 3-step question component */
export default function AiVisibilitySetupCard({
  onContinue,
  actionsDisabled = false,
  /** When true, hide outro + Continue — wizard is shown below instead */
  hideFooter = false,
}) {
  const copy = AI_VISIBILITY_SETUP_GREETING

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5">
        <p className="text-[14px] font-semibold text-gray-900 leading-relaxed m-0">
          {copy.headline}
        </p>
        <p className="text-[14px] text-gray-700 leading-relaxed m-0">{copy.intro}</p>
        <ul className="flex flex-col gap-1.5 pl-4 list-disc m-0">
          {copy.bullets.map(item => (
            <li key={item} className="text-[14px] text-gray-700 leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
        {!hideFooter && (
          <p className="text-[14px] text-gray-700 leading-relaxed m-0">{copy.outro}</p>
        )}
      </div>
      {!hideFooter && (
        <div className="flex flex-wrap items-center justify-start gap-2">
          <HLButton
            variant="primary"
            color="blue"
            size="sm"
            disabled={actionsDisabled}
            className="w-fit"
            onClick={onContinue}
          >
            {copy.ctaLabel}
          </HLButton>
        </div>
      )}
    </div>
  )
}
