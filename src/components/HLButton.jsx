/**
 * React mirror of HighRise HLButton — https://highrise.gohighlevel.com/components/common/button
 * DOM + CSS variables match highrise215.mjs (HLButton) + highrise819.mjs (naive button styles).
 */

const COLOR_MAP = {
  blue: 'primary',
  purple: 'purple',
  red: 'error',
  gray: 'gray',
  orange: 'warning',
  green: 'success',
}

const VALID_VARIANTS = new Set(['primary', 'secondary', 'tertiary', 'ghost', 'text'])

/** Mirrors getButtonSizeStyles() from highrise369.mjs */
const BUTTON_SIZE_STYLE = {
  '2xl': { height: '60px', borderRadius: '8px', padding: '16px 28px', iconSize: '24px', iconMargin: '12px' },
  xl: { height: '48px', borderRadius: '8px', padding: '12px 20px', iconSize: '20px', iconMargin: '8px' },
  lg: { height: '44px', borderRadius: '8px', padding: '10px 18px', iconSize: '20px', iconMargin: '8px' },
  md: { height: '40px', borderRadius: '8px', padding: '10px 16px', iconSize: '20px', iconMargin: '8px' },
  sm: { height: '36px', borderRadius: '8px', padding: '8px 14px', iconSize: '20px', iconMargin: '8px' },
  xs: { height: '32px', borderRadius: '4px', padding: '6px 10px', iconSize: '16px', iconMargin: '8px' },
  '2xs': { height: '28px', borderRadius: '4px', padding: '8px', iconSize: '16px', iconMargin: '6px' },
  '3xs': { height: '24px', borderRadius: '4px', padding: '8px 6px', iconSize: '14px', iconMargin: '4px' },
}

function camelToKebab(value) {
  return value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}

function toNaiveVars(theme) {
  return Object.fromEntries(Object.entries(theme).map(([key, value]) => [`--n-${camelToKebab(key)}`, value]))
}

function colorVar(palette, shade) {
  return `var(--${palette}-${shade})`
}

function borderVar(palette, shade) {
  return `1px solid var(--${palette}-${shade})`
}

function outlineVar(palette, shade) {
  return `4px solid var(--${palette}-${shade})`
}

/** Mirrors createPrimaryTheme() from highrise634.mjs */
function createPrimaryTheme(palette) {
  const theme = {
    color: colorVar(palette, 600),
    border: borderVar(palette, 600),
    rippleColor: colorVar(palette, 600),
    textColor: 'var(--base-white)',
    colorHover: colorVar(palette, 800),
    borderHover: borderVar(palette, 800),
    textColorHover: 'var(--base-white)',
    colorFocus: colorVar(palette, 800),
    outlineFocus: outlineVar(palette, 100),
    borderFocus: borderVar(palette, 800),
    textColorFocus: 'var(--base-white)',
    colorPressed: colorVar(palette, 900),
    borderPressed: borderVar(palette, 900),
    textColorPressed: 'var(--base-white)',
    colorDisabled: colorVar(palette, 200),
    borderDisabled: borderVar(palette, 200),
    textColorDisabled: 'var(--base-white)',
  }

  if (palette !== 'primary') {
    return {
      ...theme,
      colorHover: colorVar(palette, 700),
      borderHover: borderVar(palette, 700),
      colorFocus: colorVar(palette, 700),
      borderFocus: borderVar(palette, 700),
    }
  }

  return theme
}

/** Mirrors createSecondaryTheme() from highrise635.mjs */
function createSecondaryTheme(palette) {
  return {
    color: 'var(--base-white)',
    border: borderVar(palette, 300),
    textColor: palette === 'gray' ? colorVar(palette, 600) : colorVar(palette, 700),
    rippleColor: colorVar(palette, 600),
    colorHover: colorVar(palette, 50),
    borderHover: borderVar(palette, 300),
    textColorHover: colorVar(palette, 800),
    colorFocus: colorVar(palette, 50),
    outlineFocus: outlineVar(palette, 100),
    borderFocus: borderVar(palette, 300),
    textColorFocus: colorVar(palette, 800),
    colorPressed: colorVar(palette, 100),
    borderPressed: borderVar(palette, 300),
    textColorPressed: colorVar(palette, 900),
    colorDisabled: 'var(--base-white)',
    borderDisabled: borderVar(palette, 200),
    textColorDisabled: colorVar(palette, 300),
  }
}

/** Mirrors createButtonVariantStyle() from highrise367.mjs */
function createButtonVariantStyle(color = 'gray', variant = 'secondary') {
  const palette = COLOR_MAP[color] ?? 'gray'
  if (variant === 'primary') return createPrimaryTheme(palette)
  return createSecondaryTheme(palette)
}

function getButtonThemeVars(color, variant, size) {
  const sizeStyle = BUTTON_SIZE_STYLE[size] ?? BUTTON_SIZE_STYLE.sm
  return toNaiveVars({
    bezier: 'cubic-bezier(.4, 0, .2, 1)',
    bezierEaseOut: 'cubic-bezier(.4, 0, .2, 1)',
    opacityDisabled: '1',
    fontWeight: '600',
    fontSize: 'var(--hr-font-size-lg)',
    width: 'initial',
    boxShadow: '0px 1px 2px 0px color-mix(in srgb, var(--gray-900) 5.1%, transparent)',
    ...createButtonVariantStyle(color, variant),
    ...sizeStyle,
  })
}

export default function HLButton({
  id,
  children,
  color = 'gray',
  variant = 'secondary',
  size = 'sm',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  style,
  onClick,
  ...rest
}) {
  const resolvedVariant = VALID_VARIANTS.has(variant) ? variant : 'secondary'
  const resolvedSize = BUTTON_SIZE_STYLE[size] ? size : 'sm'
  const themeVars = getButtonThemeVars(color, resolvedVariant, resolvedSize)
  const isDisabled = disabled || loading

  return (
    <span className={`hr-v-4-7-2 inline-flex ${className}`}>
      <button
        id={id}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        style={{ ...themeVars, ...style }}
        className={[
          'hr-button',
          'hr-button--default-type',
          'hr-button--medium-type',
          `hr-button--${resolvedVariant}`,
          `hr-button--${resolvedSize}`,
          isDisabled && 'hr-button--disabled',
          loading && 'hr-button--loading',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={isDisabled ? undefined : onClick}
        {...rest}
      >
        <span className="hr-button__content">
          <span id={id ? `${id}-label` : undefined} className="hr-button__content-default-slot">
            {children}
          </span>
        </span>
        <div className="hr-button__border" aria-hidden="true" />
        <div className="hr-button__state-border" aria-hidden="true" />
      </button>
    </span>
  )
}
