/**
 * OnboardingStableTable — bordered table shell for in-chat onboarding steps.
 * Fixed header + scrollable body (fills card) + fixed footer.
 */
export default function OnboardingStableTable({
  header,
  footer,
  children,
  bodyRef,
  bodyClassName = '',
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full border border-purple-200 rounded-lg bg-white overflow-hidden">
      {header ? (
        <div className="shrink-0 bg-purple-50 border-b border-purple-100 py-1.5">
          {header}
        </div>
      ) : null}
      <div
        ref={bodyRef}
        className={`flex-1 min-h-0 overflow-y-auto scrollbar-gray-300 ${bodyClassName}`.trim()}
      >
        {children}
      </div>
      {footer != null ? (
        <div className="shrink-0 border-t border-gray-100 py-2 bg-white">
          <div className="pl-3 pr-6">{footer}</div>
        </div>
      ) : null}
    </div>
  )
}
