import { useState } from 'react'
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  Lock01Icon,
  Star,
} from '../../icons/index.js'
import HLModal, { modalBtnPrimary, modalBtnSecondary } from '../HLModal.jsx'
import VaLogo from '../VaLogo.jsx'

/** Prototype plan — replace with billing API in production */
const ALL_IN_ONE_PLAN = {
  name: 'All-in-One',
  subtitle: 'Search · AI answers · Maps',
  monthlyPrice: 79,
  credits: '1,000',
  features: [
    'Everything in Local and Digital',
    'Unified dashboard and reporting',
    'Approval and automation workflows',
    'Ongoing monitoring and alerts',
    'Priority onboarding and support',
    '1,000 credits/mo',
  ],
}

function ModalStepper({ currentStep }) {
  const steps = ['Subscription', 'Payment']
  return (
    <div className="px-4 pb-4 border-b border-gray-200">
      <div className="flex items-start">
        {steps.map((label, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < currentStep
          const isActive = stepNum === currentStep
          const isLast = index === steps.length - 1
          return (
            <div key={label} className="flex items-start flex-1 min-w-0 last:flex-none">
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold ${
                    isCompleted || isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <Check size={12} strokeWidth={2.5} /> : stepNum}
                </div>
                <span className={`mt-1.5 text-[12px] whitespace-nowrap ${isActive ? 'font-semibold text-gray-900' : isCompleted ? 'text-primary-600' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {!isLast && <div className={`flex-1 h-px mt-3 mx-2 ${isCompleted ? 'bg-primary-600' : 'bg-gray-200'}`} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SubscriptionStep({ onContinue }) {
  const plan = ALL_IN_ONE_PLAN
  return (
    <div className="px-4 py-4">
      <div className="rounded-xl border-2 border-primary-600 bg-white p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-warning-100 flex items-center justify-center shrink-0">
            <Star size={18} className="text-warning-600" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-900 m-0">{plan.name}</p>
            <p className="text-[12px] text-gray-500 mt-0.5 m-0">{plan.subtitle}</p>
          </div>
        </div>
        <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 mb-3">
          <p className="text-[22px] font-semibold text-gray-900 leading-none m-0">${plan.monthlyPrice}/mo</p>
          <p className="text-[11px] text-gray-500 mt-1 m-0">Monthly · ${plan.monthlyPrice} charged today</p>
        </div>
        <ul className="flex flex-col gap-2 m-0 p-0 list-none">
          {plan.features.map(feature => (
            <li key={feature} className="flex items-start gap-2 text-[12px] text-gray-600">
              <Check size={14} className="text-warning-600 shrink-0 mt-0.5" strokeWidth={2.5} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide m-0 mb-0.5">Selected plan</p>
          <p className="text-[14px] font-semibold text-gray-900 m-0">{plan.name} · Monthly · ${plan.monthlyPrice} due today</p>
        </div>
        <button type="button" onClick={onContinue} className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg ${modalBtnPrimary}`}>
          Continue
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function PaymentStep({ onBack, onSubscribe }) {
  const plan = ALL_IN_ONE_PLAN
  const [paymentMethod, setPaymentMethod] = useState('agency')

  return (
    <div className="px-4 py-4">
      <div className="flex gap-4">
        <aside className="w-[220px] shrink-0 border border-gray-200 rounded-xl p-4 bg-white">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide m-0 mb-3">{plan.name} plan</p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-warning-100 flex items-center justify-center shrink-0">
                <Star size={14} className="text-warning-600" />
              </div>
              <p className="text-[13px] font-semibold text-gray-900 leading-snug m-0">{plan.subtitle}</p>
            </div>
            <p className="text-[28px] font-semibold text-gray-900 leading-none m-0">${plan.monthlyPrice}</p>
            <p className="text-[12px] text-gray-500 mt-0.5 m-0">per month</p>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-[13px] font-medium text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft size={14} />
            Change plan
          </button>
          <div className="flex items-start gap-2.5 mb-4">
            <VaLogo size="sm" />
            <div>
              <p className="text-[15px] font-semibold text-gray-900 m-0">Visibility AI subscription</p>
              <p className="text-[13px] text-gray-500 mt-0.5 m-0">Choose how you want to pay for this subscription.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`rounded-xl border p-4 text-left ${paymentMethod === 'card' ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200'}`}
            >
              <CreditCard size={18} className={paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-400'} />
              <p className={`text-[14px] font-semibold mt-2 mb-0.5 ${paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-900'}`}>Pay with card</p>
              <p className="text-[12px] text-gray-500 m-0">Use a saved or new card</p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('agency')}
              className={`rounded-xl border p-4 text-left ${paymentMethod === 'agency' ? 'border-primary-600 bg-primary-50/30' : 'border-gray-200'}`}
            >
              <Building2 size={18} className={paymentMethod === 'agency' ? 'text-primary-600' : 'text-gray-400'} />
              <p className={`text-[14px] font-semibold mt-2 mb-0.5 ${paymentMethod === 'agency' ? 'text-primary-600' : 'text-gray-900'}`}>Charge to agency</p>
              <p className="text-[12px] text-gray-500 m-0">Bill the agency account</p>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between gap-4">
        <p className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 m-0">
          <Lock01Icon size={13} className="text-gray-400 shrink-0" />
          By confirming, you activate your Visibility AI subscription.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={onBack} className={modalBtnSecondary}>Cancel</button>
          <button type="button" onClick={onSubscribe} className={`inline-flex items-center gap-1.5 ${modalBtnPrimary}`}>
            <CreditCard size={14} />
            Pay $ {plan.monthlyPrice} and subscribe
          </button>
        </div>
      </div>
    </div>
  )
}

/** Two-step subscription modal — prototype; replace with billing API in production */
export default function SubscriptionModal({ open, onClose, onComplete }) {
  const [step, setStep] = useState(1)
  const plan = ALL_IN_ONE_PLAN

  if (!open) return null

  function handleClose() {
    setStep(1)
    onClose?.()
  }

  function handleSubscribe() {
    setStep(1)
    onComplete?.()
  }

  const header =
    step === 1
      ? { title: 'Choose your Visibility AI plan', subtitle: 'Choose the plan that fits your workflow, then continue to secure checkout.' }
      : { title: `Complete your ${plan.name} subscription`, subtitle: `${plan.name} plan · Monthly billing · $${plan.monthlyPrice} per month` }

  return (
    <HLModal
      id="subscription-modal"
      onClose={handleClose}
      width={step === 1 ? 720 : 960}
      maskClosable={false}
      headerDivider
      header={
        <div className="flex items-start gap-3">
          <VaLogo />
          <div className="flex-1 min-w-0">
            <h2 id="subscription-modal-title" className="text-[16px] font-semibold text-gray-900 leading-snug m-0">{header.title}</h2>
            <p className="text-[13px] text-gray-500 mt-0.5 m-0">{header.subtitle}</p>
          </div>
        </div>
      }
    >
      <ModalStepper currentStep={step} />
      {step === 1 ? (
        <SubscriptionStep onContinue={() => setStep(2)} />
      ) : (
        <PaymentStep onBack={() => setStep(1)} onSubscribe={handleSubscribe} />
      )}
    </HLModal>
  )
}
