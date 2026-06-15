/**
 * React mirror of HighRise HLCheckbox — https://highrise.gohighlevel.com/components/data-input/checkbox
 * DOM + CSS variables match @platform-ui/highrise (highrise852.mjs + highrise580.mjs).
 */

const SIZE_OVERRIDES = {
  lg: { size: '20px', borderRadius: '6px', labelGap: '6px', labelLineHeight: '24px' },
  md: { size: '18px', borderRadius: '4px', labelGap: '6px', labelLineHeight: '24px' },
  sm: { size: '16px', borderRadius: '4px', labelGap: '4px', labelLineHeight: '20px' },
  xs: { size: '14px', labelGap: '4px', labelLineHeight: '18px' },
  '2xs': {
    size: '12px',
    boxShadowFocus: '0px 0px 0px 2px var(--primary-100)',
    labelGap: '4px',
    labelLineHeight: '17px',
  },
  '3xs': {
    size: '10px',
    boxShadowFocus: '0px 0px 0px 2px var(--primary-100)',
    labelGap: '4px',
    labelLineHeight: '16px',
  },
}

const LABEL_SIZE = {
  lg: 'text-[18px] leading-6',
  md: 'text-[18px] leading-6',
  sm: 'text-[16px] leading-5',
  xs: 'text-[14px] leading-[18px]',
  '2xs': 'text-[13px] leading-[17px]',
  '3xs': 'text-[12px] leading-4',
}

function camelToKebab(value) {
  return value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}

/** Mirrors checkboxThemeOverrides() + JSONtoNaiveVars() from @platform-ui/highrise */
function getCheckboxThemeVars(size = 'md', indeterminate = false) {
  const sizeKey = SIZE_OVERRIDES[size] ? size : 'md'
  const theme = {
    border: '1px solid var(--gray-400)',
    borderChecked: '1px solid var(--primary-600)',
    borderDisabled: `1px solid ${indeterminate ? 'var(--primary-200)' : 'var(--gray-300)'}`,
    borderDisabledChecked: '1px solid var(--primary-200)',
    borderFocus: '1px solid var(--primary-300)',
    borderRadius: '2px',
    boxShadowFocus: '0px 0px 0px 4px var(--primary-100)',
    checkMarkColor: 'var(--base-white)',
    checkMarkColorDisabled: 'var(--base-white)',
    checkMarkColorDisabledChecked: 'var(--base-white)',
    color: 'var(--base-white)',
    colorChecked: 'var(--primary-600)',
    colorDisabled: indeterminate ? 'var(--primary-200)' : 'var(--gray-100)',
    colorDisabledChecked: 'var(--primary-200)',
    colorHover: 'var(--primary-100)',
    textColor: 'var(--gray-900)',
    textColorDisabled: 'var(--gray-400)',
    labelPadding: '0',
    labelFontWeight: '400',
    bezier: 'cubic-bezier(.4, 0, .2, 1)',
    ...SIZE_OVERRIDES[sizeKey],
  }

  return Object.fromEntries(Object.entries(theme).map(([key, value]) => [`--n-${camelToKebab(key)}`, value]))
}

function CheckboxCheckIcon() {
  return (
    <svg viewBox="0 0 64 64" className="check-icon" aria-hidden="true">
      <path d="M50.42,16.76L22.34,39.45l-8.1-11.46c-1.12-1.58-3.3-1.96-4.88-0.84c-1.58,1.12-1.95,3.3-0.84,4.88l10.26,14.51  c0.56,0.79,1.42,1.31,2.38,1.45c0.16,0.02,0.32,0.03,0.48,0.03c0.8,0,1.57-0.27,2.2-0.78l30.99-25.03c1.5-1.21,1.74-3.42,0.52-4.92  C54.13,15.78,51.93,15.55,50.42,16.76z" />
    </svg>
  )
}

function CheckboxLineIcon() {
  return (
    <svg viewBox="0 0 100 100" className="line-icon" aria-hidden="true">
      <path d="M80.2,55.5H21.4c-2.8,0-5.1-2.5-5.1-5.5l0,0c0-3,2.3-5.5,5.1-5.5h58.7c2.8,0,5.1,2.5,5.1,5.5l0,0C85.2,53.1,82.9,55.5,80.2,55.5z" />
    </svg>
  )
}

export default function HLCheckbox({
  id,
  checked = false,
  indeterminate = false,
  disabled = false,
  size = 'md',
  value,
  className = '',
  'aria-label': ariaLabel,
  onChange,
  onClick,
  children,
}) {
  const resolvedSize = SIZE_OVERRIDES[size] ? size : 'md'
  const labelId = children ? `${id}-label` : undefined
  const themeVars = getCheckboxThemeVars(resolvedSize, indeterminate)

  function handleChange(event) {
    if (disabled) return
    onChange?.(!checked, event)
  }

  return (
    <span className={`hr-v-4-7-2 inline-flex ${className}`}>
      <label
        htmlFor={id}
        style={themeVars}
        className={[
          'hr-checkbox',
          'hr-checkbox__container',
          `hr-checkbox-${resolvedSize}`,
          checked && 'hr-checkbox--checked',
          indeterminate && 'hr-checkbox--indeterminate',
          disabled && 'hr-checkbox--disabled',
          children && 'hr-checkbox--show-label',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="hr-checkbox-box-wrapper">
          {'\u00A0'}
          <span className="hr-checkbox-box">
            <span className="hr-checkbox-icon">
              {indeterminate ? <CheckboxLineIcon /> : <CheckboxCheckIcon />}
            </span>
            <span className="hr-checkbox-box__border" aria-hidden="true" />
          </span>
          <input
            id={id}
            type="checkbox"
            className="hr-checkbox-input sr-only"
            checked={checked}
            disabled={disabled}
            value={value}
            aria-label={!children ? ariaLabel : undefined}
            aria-labelledby={labelId}
            aria-checked={indeterminate ? 'mixed' : checked}
            onChange={handleChange}
            onClick={e => {
              e.stopPropagation()
              onClick?.(e)
            }}
          />
        </span>
        {children && (
          <span id={labelId} className={`hr-checkbox__label ${LABEL_SIZE[resolvedSize]}`}>
            {children}
          </span>
        )}
      </label>
    </span>
  )
}
