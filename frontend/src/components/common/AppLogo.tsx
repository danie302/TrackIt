interface AppLogoProps {
  size?: number
  variant?: 'color' | 'white'
}

export default function AppLogo({ size = 48, variant = 'color' }: AppLogoProps) {
  const boxStroke = variant === 'white' ? 'white' : 'white'
  const bgStart = variant === 'white' ? 'rgba(255,255,255,0.2)' : '#1565C0'
  const bgEnd = variant === 'white' ? 'rgba(255,255,255,0.1)' : '#0288D1'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bgStart} />
          <stop offset="100%" stopColor={bgEnd} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="48" height="48" rx="11" fill="url(#logoGrad)" />

      {/* Box body */}
      <rect
        x="10"
        y="20"
        width="28"
        height="19"
        rx="2"
        stroke={boxStroke}
        strokeWidth="2"
        fill="none"
      />

      {/* Box top flaps */}
      <polyline
        points="10,20 24,13 38,20"
        stroke={boxStroke}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Center fold line on top */}
      <line
        x1="24"
        y1="13"
        x2="24"
        y2="20"
        stroke={boxStroke}
        strokeWidth="2"
      />

      {/* Tape strip across box */}
      <rect
        x="19"
        y="20"
        width="10"
        height="6"
        fill={boxStroke}
        opacity="0.35"
        rx="1"
      />

      {/* Checkmark overlay (bottom right badge) */}
      <circle cx="34" cy="34" r="8" fill="#4CAF50" />
      <polyline
        points="29.5,34 32.5,37 38.5,31"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
