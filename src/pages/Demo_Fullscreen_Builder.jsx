import { useNavigate } from 'react-router-dom'
import BuilderBar from '../shell/BuilderBar'

const CANVAS_SHADOW = 'shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)]'

export default function Demo_Fullscreen_Builder() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] overflow-hidden">
      <BuilderBar
        onBack={() => navigate('/')}
        title="Welcome email — Onboarding sequence"
        onSave={() => {}}
        onPublish={() => {}}
      />
      <main className="flex-1 flex min-h-0 p-4 gap-4">

        {/* Canvas area */}
        <div className={`flex-1 bg-white rounded-xl ${CANVAS_SHADOW} flex flex-col overflow-hidden`}>
          <div className="border-b border-[#EAECF0] px-6 py-3 flex items-center gap-3 shrink-0">
            <span className="text-[13px] font-medium text-[#667085]">Desktop</span>
            <div className="w-px h-4 bg-[#EAECF0]" />
            <span className="text-[13px] font-medium text-[#344054]">Mobile</span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-[#F9FAFB]">
            <div className="w-[600px] flex flex-col gap-0">
              <div className="bg-[#155EEF] rounded-t-lg h-16 flex items-center justify-center">
                <span className="text-white text-[13px] font-medium">Header / logo</span>
              </div>
              <div className="bg-white border-x border-[#EAECF0] px-8 py-10 flex flex-col gap-4">
                <div className="h-5 w-3/4 bg-[#F2F4F7] rounded" />
                <div className="h-3 w-full bg-[#F2F4F7] rounded" />
                <div className="h-3 w-5/6 bg-[#F2F4F7] rounded" />
                <div className="h-3 w-4/5 bg-[#F2F4F7] rounded" />
                <div className="mt-2 h-9 w-36 bg-[#155EEF] rounded-lg" />
              </div>
              <div className="bg-[#F9FAFB] border border-[#EAECF0] rounded-b-lg h-10 flex items-center justify-center">
                <span className="text-[12px] text-[#98A2B3]">Footer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Properties panel */}
        <div className={`w-[280px] shrink-0 bg-white rounded-xl ${CANVAS_SHADOW} flex flex-col overflow-hidden`}>
          <div className="border-b border-[#EAECF0] px-4 py-3 shrink-0">
            <p className="text-[14px] font-semibold text-[#101828]">Properties</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {['Content', 'Style', 'Settings'].map(section => (
              <div key={section}>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-[#98A2B3] mb-2">
                  {section}
                </p>
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border border-[#EAECF0] rounded-lg p-3">
                      <div className="h-3 w-1/2 bg-[#F2F4F7] rounded mb-2" />
                      <div className="h-7 w-full bg-[#F9FAFB] border border-[#EAECF0] rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
