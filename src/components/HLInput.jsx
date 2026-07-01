import { forwardRef } from 'react'

/**
 * React mirror of HighRise HLInput — https://highrise.gohighlevel.com/components/data-input/input-text
 * DOM + CSS variables match highrise451.mjs (BaseInput) + highrise948.mjs (naive input styles).
 */

function camelToKebab(value) {
  return value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}

function toNaiveVars(theme) {
  return Object.fromEntries(Object.entries(theme).map(([key, value]) => [`--n-${camelToKebab(key)}`, value]))
}

/** Mirrors createInputSizeStyle() from highrise388.mjs */
const INPUT_SIZE_STYLE = {
  lg: {
    fontSize: 'var(--hr-font-size-2xl)',
    height: '44px',
    paddingLeft: '14px',
    paddingRight: '14px',
    borderRadius: '8px',
    prefixIconSize: '20px',
    suffixIconSize: '16px',
    suffixIconFontSize: '16px',
    paddingVertical: '10px',
  },
  md: {
    fontSize: 'var(--hr-font-size-2xl)',
    height: '40px',
    paddingLeft: '12px',
    paddingRight: '12px',
    borderRadius: '8px',
    prefixIconSize: '20px',
    suffixIconSize: '16px',
    suffixIconFontSize: '16px',
    paddingVertical: '10px',
  },
  sm: {
    fontSize: 'var(--hr-font-size-lg)',
    height: '36px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderRadius: '6px',
    prefixIconSize: '16px',
    suffixIconSize: '16px',
    suffixIconFontSize: '14px',
    paddingVertical: '8px',
  },
  xs: {
    fontSize: 'var(--hr-font-size-lg)',
    height: '32px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderRadius: '4px',
    prefixIconSize: '16px',
    suffixIconSize: '14px',
    suffixIconFontSize: '13px',
    paddingVertical: '6px',
  },
  '2xs': {
    fontSize: 'var(--hr-font-size-lg)',
    height: '28px',
    paddingLeft: '6px',
    paddingRight: '6px',
    borderRadius: '4px',
    prefixIconSize: '14px',
    suffixIconSize: '14px',
    suffixIconFontSize: '12px',
    paddingVertical: '7px',
  },
  '3xs': {
    fontSize: 'var(--hr-font-size-lg)',
    height: '24px',
    paddingLeft: '6px',
    paddingRight: '6px',
    borderRadius: '4px',
    prefixIconSize: '14px',
    suffixIconSize: '12px',
    suffixIconFontSize: '11px',
    paddingVertical: '6px',
  },
}

/** Mirrors getInputThemeOverrides() from highrise620.mjs */
function getInputThemeOverrides() {
  return {
    bezier: 'cubic-bezier(.4, 0, .2, 1)',
    border: '1px solid var(--gray-300)',
    borderHover: '1px solid var(--primary-600)',
    borderFocus: '1px solid var(--primary-600)',
    borderDisabled: '1px solid var(--gray-300)',
    boxShadowFocus: '0px 0px 0px 4px var(--primary-100), var(--shadow-xs)',
    color: 'var(--base-white)',
    colorDisabled: 'var(--gray-50)',
    textColor: 'var(--gray-900)',
    textColorDisabled: 'var(--gray-400)',
    placeholderColor: 'var(--gray-500)',
    placeholderColorDisabled: 'var(--gray-400)',
    caretColor: 'var(--primary-500)',
    loadingColor: 'var(--primary-600)',
    iconColor: 'var(--gray-400)',
    iconColorDisabled: 'var(--gray-300)',
    iconGap: '4px',
    fontWeight: '400',
    suffixTextColor: 'var(--gray-500)',
    iconSize: '16px',
  }
}

function getInputThemeVars(size = 'md') {
  const sizeStyle = INPUT_SIZE_STYLE[size] ?? INPUT_SIZE_STYLE.md
  return toNaiveVars({
    ...getInputThemeOverrides(),
    ...sizeStyle,
    borderRadius: sizeStyle.borderRadius,
  })
}

const HLInput = forwardRef(function HLInput(
  {
    id,
    value = '',
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    placeholder,
    type = 'text',
    size = 'md',
    disabled = false,
    readOnly = false,
    autoFocus = false,
    prefixIcon: PrefixIcon,
    prefix,
    suffix,
    className = '',
    inputProps = {},
  },
  ref,
) {
  const resolvedSize = INPUT_SIZE_STYLE[size] ? size : 'md'
  const sizeStyle = INPUT_SIZE_STYLE[resolvedSize]
  const themeVars = getInputThemeVars(resolvedSize)
  const prefixIconSize = Number.parseInt(sizeStyle.prefixIconSize, 10)

  return (
    <div className={`hr-v-4-7-2 w-full ${className}`}>
      <div
        style={themeVars}
        className={[
          'hr-input',
          'hr-input-text',
          `hr-input--${resolvedSize}`,
          'hr-input--resizable',
          'hr-input--stateful',
          disabled && 'hr-input--disabled',
          readOnly && 'hr-input--readonly',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="hr-input-wrapper">
          {(PrefixIcon || prefix) && (
            <div className="hr-input__prefix">
              <div className="hr-input__prefix-container">
                {PrefixIcon ? (
                  <span className="hr-input__prefix-icon">
                    <PrefixIcon size={prefixIconSize} className="text-gray-400" strokeWidth={1.67} />
                  </span>
                ) : (
                  prefix
                )}
              </div>
            </div>
          )}
          <div className="hr-input__input">
            <input
              ref={ref}
              id={id}
              type={type}
              value={value}
              disabled={disabled}
              readOnly={readOnly}
              autoFocus={autoFocus}
              placeholder={placeholder}
              className="hr-input__input-el"
              onChange={onChange}
              onKeyDown={onKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              {...inputProps}
            />
          </div>
          {suffix && (
            <div className="hr-input__suffix">
              <div className="hr-input__suffix-container">{suffix}</div>
            </div>
          )}
        </div>
        <div className="hr-input__border" aria-hidden="true" />
        <div className="hr-input__state-border" aria-hidden="true" />
      </div>
    </div>
  )
})

export default HLInput
