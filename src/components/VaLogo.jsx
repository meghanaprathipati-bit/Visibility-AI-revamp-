import visibilityLogo from '../assets/visibility-logo.png'

/** Visibility product logo — circular gradient lighthouse mark */
export default function VaLogo({ size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  return (
    <img
      src={visibilityLogo}
      alt="Visibility"
      className={`${dim} rounded-full shrink-0 object-cover`}
    />
  )
}
