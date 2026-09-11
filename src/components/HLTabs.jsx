import { Children, useLayoutEffect, useRef, isValidElement } from 'react'

/**
 * React mirror of HighRise HLTabPane — https://highrise.gohighlevel.com/components/navigation/tabs
 * Used as a child of HLTabs; props are read by the parent.
 */
export function HLTabPane() {
  return null
}

HLTabPane.displayName = 'HLTabPane'

function camelToKebab(value) {
  return value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}

function toNaiveVars(theme) {
  return Object.fromEntries(Object.entries(theme).map(([key, value]) => [`--n-${camelToKebab(key)}`, value]))
}

/** Mirrors themeOverrides() from highrise428.mjs */
const TAB_SIZE_STYLE = {
  sm: {
    tabFontSize: '14px',
    tabHeight: '24px',
    tabLineHeight: 'var(--hr-line-height-md)',
    tabPadding: '3px 8px',
    tabGap: '4px',
    customSlotPadding: '0px 4px',
  },
  md: {
    tabFontSize: '14px',
    tabHeight: '32px',
    tabLineHeight: 'var(--hr-line-height-lg)',
    tabPadding: '6px 8px',
    tabGap: '6px',
    customSlotPadding: '0px 6px',
  },
  lg: {
    tabFontSize: '14px',
    tabHeight: '40px',
    tabLineHeight: 'var(--hr-line-height-lg)',
    tabPadding: '10px 8px',
    tabGap: '8px',
    customSlotPadding: '0px 8px',
  },
}

function getTabsThemeVars(type = 'line', size = 'md', theme = 'primary', noBorder = false) {
  const sizeStyle = TAB_SIZE_STYLE[size] ?? TAB_SIZE_STYLE.md
  return toNaiveVars({
    bezier: 'cubic-bezier(.4, 0, .2, 1)',
    barColor: 'var(--primary-600)',
    tabBorderRadius: '6px',
    tabFontWeight: 'var(--hr-font-weight-medium)',
    tabFontWeightActive: 'var(--hr-font-weight-semibold)',
    tabGap: '8px',
    tabGapVertical: '4px',
    tabHoverBgColor: theme === 'primary' ? 'var(--primary-50)' : 'var(--gray-100)',
    tabPadding: '4px 8px',
    tabOffSet: '0px',
    tabPaddingVertical: '4px 8px',
    tabTextColor: 'var(--gray-600)',
    tabTextColorActive: theme === 'primary' ? 'var(--primary-600)' : 'var(--gray-900)',
    tabTextColorDisabled: 'var(--gray-400)',
    tabTextColorHover: 'var(--gray-700)',
    tabBorderColor: noBorder ? 'transparent' : 'var(--gray-200)',
    colorSegment: 'var(--gray-100)',
    tabColorSegment: 'var(--base-white)',
    fontWeightStrong: 'var(--hr-font-weight-semibold)',
    panePaddingTop: '0px',
    panePaddingRight: '0px',
    panePaddingBottom: '0px',
    panePaddingLeft: '0px',
    ...sizeStyle,
    ...(type === 'line' ? { tabLineActiveHeight: size === 'sm' ? '0.5px' : '1px' } : {}),
  })
}

const NAIVE_SIZE_CLASS = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
}

function parsePanes(children) {
  return Children.toArray(children)
    .filter(child => isValidElement(child) && child.type?.displayName === 'HLTabPane')
    .map(child => ({
      name: child.props.name,
      tab: child.props.tab,
      disabled: child.props.disabled,
      children: child.props.children,
    }))
}

function syncSegmentCapsule(railRef, capsuleRef, activeName) {
  const rail = railRef.current
  const capsule = capsuleRef.current
  if (!rail || !capsule || activeName == null) return

  const activeTab = rail.querySelector(`[data-name="${CSS.escape(String(activeName))}"]`)
  if (!activeTab) return

  const railRect = rail.getBoundingClientRect()
  const tabRect = activeTab.getBoundingClientRect()
  capsule.style.width = `${tabRect.width}px`
  capsule.style.height = `${tabRect.height}px`
  capsule.style.transform = `translate(${tabRect.left - railRect.left}px, ${tabRect.top - railRect.top}px)`
}

/**
 * React mirror of HighRise HLTabs — https://highrise.gohighlevel.com/components/navigation/tabs#segment-type
 */
export default function HLTabs({
  id,
  children,
  type = 'line',
  size = 'md',
  theme = 'primary',
  value,
  defaultValue,
  onValueChange,
  tabsOnly = false,
  compact = false,
  className = '',
  noBorder = false,
}) {
  const panes = parsePanes(children)
  const resolvedSize = TAB_SIZE_STYLE[size] ? size : 'md'
  const naiveSize = NAIVE_SIZE_CLASS[resolvedSize] ?? 'medium'
  const isSegment = type === 'segment'
  const themeVars = getTabsThemeVars(type, resolvedSize, theme, noBorder)
  const railRef = useRef(null)
  const capsuleRef = useRef(null)

  const activeValue = value ?? defaultValue ?? panes[0]?.name

  useLayoutEffect(() => {
    if (!isSegment) return undefined
    syncSegmentCapsule(railRef, capsuleRef, activeValue)

    const rail = railRef.current
    if (!rail) return undefined

    const ro = new ResizeObserver(() => syncSegmentCapsule(railRef, capsuleRef, activeValue))
    ro.observe(rail)
    return () => ro.disconnect()
  }, [activeValue, isSegment, panes.length])

  function handleSelect(name, disabled) {
    if (disabled || name === activeValue) return
    onValueChange?.(name)
  }

  const activePane = panes.find(pane => pane.name === activeValue)

  return (
    <div className={`hr-v-4-7-2 ${compact ? 'w-fit shrink-0' : 'w-full'} ${className}`}>
      <div
        id={id}
        style={themeVars}
        className={[
          'hr-tabs',
          'hr-tabs__container',
          'hr-tabs--segment-type',
          `hr-tabs--${naiveSize}-size`,
          'hr-tabs--top',
          isSegment && 'hr-tabs--segment',
          compact && 'hr-tabs--compact',
          'top',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="hr-tabs-nav hr-tabs-nav--segment-type hr-tabs-nav--top">
          <div ref={railRef} className="hr-tabs-rail" role="tablist" aria-orientation="horizontal">
            {isSegment && <div ref={capsuleRef} className="hr-tabs-capsule" aria-hidden="true" />}
            <div className="hr-tabs-rail-inner">
              {panes.map((pane, index) => {
                const isActive = pane.name === activeValue
                return (
                  <div key={pane.name} className="hr-tabs-tab-wrapper">
                    {index > 0 && <div className="hr-tabs-tab-pad" aria-hidden="true" />}
                    <div
                      data-name={pane.name}
                      data-disabled={pane.disabled ? 'true' : undefined}
                      role="tab"
                      id={id ? `${id}-tab-${pane.name}` : undefined}
                      aria-selected={isActive}
                      aria-disabled={pane.disabled || undefined}
                      tabIndex={isActive ? 0 : -1}
                      className={[
                        'hr-tabs-tab',
                        isActive && 'hr-tabs-tab--active',
                        pane.disabled && 'hr-tabs-tab--disabled',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => handleSelect(pane.name, pane.disabled)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSelect(pane.name, pane.disabled)
                        }
                      }}
                    >
                      <span className="hr-tabs-tab__label">{pane.tab}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {!tabsOnly && activePane?.children && (
          <div
            className="hr-tabs-pane-wrapper"
            role="tabpanel"
            id={id ? `${id}-panel-${activePane.name}` : undefined}
            aria-labelledby={id ? `${id}-tab-${activePane.name}` : undefined}
          >
            <div className="hr-tab-pane">{activePane.children}</div>
          </div>
        )}
      </div>
    </div>
  )
}
