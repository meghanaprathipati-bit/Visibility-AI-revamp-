import DetailedScanReport from '../reports/DetailedScanReport.jsx'

/** Detailed report body for the split pane */
export default function DetailedReportPanel({ report, onPromptAction }) {
  return <DetailedScanReport report={report} onPromptAction={onPromptAction} />
}
