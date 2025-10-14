'use client'

type Variant =
  | 'tray'      // Meals
  | 'calendar'  // Plans
  | 'truck'     // Delivery vibe
  | 'pin'       // Orders tracking
  | 'card'      // Checkout / payment
  | 'cart'      // Cart
  | 'user'      // Account
  | 'chart'     // Dashboard

export default function Illustration({
  variant,
  size = 72,
  className = '',
}: {
  variant: Variant
  size?: number
  className?: string
}) {
  // NOTE: We rely on Tailwind color classes on sub-elements like text-olive, text-terracotta, text-taupe
  // All animations are CSS-in-SVG via styled-jsx and very light.

  if (variant === 'tray') {
    return (
      <span className={`inline-block ${className}`} style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* Tray */}
          <rect x="6" y="18" width="52" height="30" rx="6" className="text-taupe" fill="currentColor" opacity=".35" />
          <rect x="10" y="22" width="44" height="22" rx="4" className="text-taupe" fill="currentColor" opacity=".55" />
          {/* Drumstick */}
          <ellipse cx="38" cy="31" rx="10" ry="8" className="text-terracotta" fill="currentColor" opacity=".95" />
          <rect x="44.5" y="24.5" width="10" height="3" rx="1.5" className="text-sand" fill="currentColor" />
          <circle cx="54.5" cy="26" r="2" className="text-sand" fill="currentColor" />
          {/* Veggies */}
          <circle cx="20" cy="34" r="6" className="text-olive" fill="currentColor" opacity=".95" />
          <circle cx="27.5" cy="36.5" r="4" className="text-olive" fill="currentColor" opacity=".8" />
          <circle cx="46" cy="38" r="3" className="text-terracotta" fill="currentColor" opacity=".9" />
          {/* Steam */}
          <g className="steam text-terracotta" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".9">
            <path d="M31 16 C30 13, 32 12, 31 10" />
            <path d="M36 16 C35 13, 37 12, 36 10" />
            <path d="M26 16 C25 13, 27 12, 26 10" />
          </g>
        </svg>
        <style jsx>{`
          .steam path {
            transform-origin: center;
            animation: nm-rise 2.2s ease-in-out infinite;
          }
          .steam path:nth-child(2) { animation-delay: .5s }
          .steam path:nth-child(3) { animation-delay: 1s }
          @keyframes nm-rise {
            0%   { transform: translateY(6px); opacity: 0 }
            20%  { opacity: .9 }
            80%  { opacity: .9 }
            100% { transform: translateY(-6px); opacity: 0 }
          }
        `}</style>
      </span>
    )
  }

  if (variant === 'calendar') {
    return (
      <span className={`inline-block ${className}`} style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <rect x="8" y="14" width="48" height="40" rx="6" className="text-taupe" fill="currentColor" opacity=".4" />
          <rect x="8" y="14" width="48" height="10" rx="6" className="text-terracotta" fill="currentColor" opacity=".9" />
          {/* grid */}
          <g fill="currentColor" className="text-sand" opacity=".9">
            {Array.from({ length: 12 }).map((_, i) => {
              const col = i % 4
              const row = Math.floor(i / 4)
              return <rect key={i} x={12 + col * 11} y={28 + row * 10} width="8" height="8" rx="2" />
            })}
          </g>
          {/* pulse marker */}
          <circle cx="40" cy="46" r="3" className="text-olive pulse" fill="currentColor" />
        </svg>
        <style jsx>{`
          .pulse {
            animation: nm-pulse 1.8s ease-in-out infinite;
            transform-origin: 40px 46px;
          }
          @keyframes nm-pulse {
            0%, 100% { transform: scale(1); opacity: .9 }
            50%      { transform: scale(1.2); opacity: .6 }
          }
        `}</style>
      </span>
    )
  }

  if (variant === 'truck') {
    return (
      <span className={`inline-block ${className}`} style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          {/* motion lines */}
          <g className="text-olive" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".6">
            <line x1="8" y1="30" x2="20" y2="30" className="dash" />
            <line x1="8" y1="36" x2="18" y2="36" className="dash" />
          </g>
          {/* truck body */}
          <g className="move">
            <rect x="18" y="28" width="30" height="14" rx="2" className="text-olive" fill="currentColor" opacity=".9" />
            <rect x="40" y="28" width="14" height="10" rx="2" className="text-terracotta" fill="currentColor" opacity=".9" />
            <rect x="42" y="30" width="8" height="6" rx="1" className="text-sand" fill="currentColor" />
            {/* wheels */}
            <circle cx="26" cy="44" r="4" className="text-charcoal wheel" fill="currentColor" />
            <circle cx="46" cy="44" r="4" className="text-charcoal wheel" fill="currentColor" />
          </g>
        </svg>
        <style jsx>{`
          .dash { stroke-dasharray: 12; animation: nm-dash 1.2s linear infinite }
          .move { animation: nm-bob 2.6s ease-in-out infinite }
          .wheel { animation: nm-spin 1.2s linear infinite; transform-origin: center }
          @keyframes nm-dash {
            to { stroke-dashoffset: -24 }
          }
          @keyframes nm-bob {
            0%,100% { transform: translateY(0) }
            50% { transform: translateY(-2px) }
          }
          @keyframes nm-spin { to { transform: rotate(360deg) } }
        `}</style>
      </span>
    )
  }

  if (variant === 'pin') {
    return (
      <span className={`inline-block ${className}`} style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <path d="M32 8c8 0 14 6 14 14 0 11-14 26-14 26S18 33 18 22c0-8 6-14 14-14z" className="text-terracotta" fill="currentColor" opacity=".95" />
          <circle cx="32" cy="22" r="5" className="text-sand" fill="currentColor" />
          <circle cx="32" cy="54" r="6" className="ring text-terracotta" fill="currentColor" opacity=".25" />
        </svg>
        <style jsx>{`
          .ring { animation: nm-ring 2.2s ease-out infinite; transform-origin: 32px 54px }
          @keyframes nm-ring {
            0% { transform: scale(.6); opacity: .35 }
            70%{ transform: scale(1.2); opacity: 0 }
            100%{ opacity: 0 }
          }
        `}</style>
      </span>
    )
  }

  if (variant === 'card') {
    return (
      <span className={`inline-block ${className}`} style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <rect x="10" y="18" width="44" height="28" rx="4" className="text-olive" fill="currentColor" opacity=".9" />
          <rect x="10" y="24" width="44" height="6" rx="2" className="text-terracotta" fill="currentColor" opacity=".9" />
          <rect x="16" y="32" width="10" height="6" rx="1" className="text-sand" fill="currentColor" />
          <rect x="28" y="32" width="20" height="4" rx="1" className="text-sand" fill="currentColor" opacity=".7" />
          <rect x="10" y="18" width="44" height="28" rx="4" className="shine" fill="url(#grad)" />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity=".18" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <style jsx>{`
          .shine { transform: translateX(-120%); animation: nm-shine 2.8s ease-in-out infinite }
          @keyframes nm-shine {
            0% { transform: translateX(-120%) }
            55% { transform: translateX(120%) }
            100% { transform: translateX(120%) }
          }
        `}</style>
      </span>
    )
  }

  if (variant === 'cart') {
    return (
      <span className={`inline-block ${className}`} style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <path d="M10 18h8l4 22h24l4-14H20" fill="none" stroke="currentColor" strokeWidth="3" className="text-olive" />
          <circle cx="26" cy="46" r="3.5" className="text-charcoal" fill="currentColor" />
          <circle cx="44" cy="46" r="3.5" className="text-charcoal" fill="currentColor" />
          <circle cx="12" cy="18" r="2.5" className="text-terracotta bounce" fill="currentColor" />
        </svg>
        <style jsx>{`
          .bounce { animation: nm-bounce 1.6s ease-in-out infinite }
          @keyframes nm-bounce {
            0%,100% { transform: translateY(0) }
            50% { transform: translateY(-3px) }
          }
        `}</style>
      </span>
    )
  }

  if (variant === 'user') {
    return (
      <span className={`inline-block ${className}`} style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 64 64" className="w-full h-full">
          <circle cx="32" cy="22" r="10" className="text-olive" fill="currentColor" opacity=".9" />
          <path d="M14 50c3-9 13-12 18-12s15 3 18 12" className="text-terracotta" stroke="currentColor" strokeWidth="3" fill="none" />
          <circle cx="32" cy="22" r="10" className="bob" fill="transparent" />
        </svg>
        <style jsx>{`
          .bob { animation: nm-bob 2.4s ease-in-out infinite; transform-origin: 32px 22px }
          @keyframes nm-bob {
            0%,100% { transform: translateY(0) }
            50% { transform: translateY(-1.5px) }
          }
        `}</style>
      </span>
    )
  }

  // chart
  return (
    <span className={`inline-block ${className}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <rect x="10" y="46" width="8" height="8" className="text-taupe" fill="currentColor" opacity=".5" />
        <rect x="22" y="38" width="8" height="16" className="bar text-olive" fill="currentColor" />
        <rect x="34" y="30" width="8" height="24" className="bar2 text-terracotta" fill="currentColor" />
        <rect x="46" y="22" width="8" height="32" className="bar3 text-olive" fill="currentColor" />
      </svg>
      <style jsx>{`
        .bar { transform-origin: bottom; animation: nm-grow 1.4s ease-out .2s both }
        .bar2{ transform-origin: bottom; animation: nm-grow 1.4s ease-out .4s both }
        .bar3{ transform-origin: bottom; animation: nm-grow 1.4s ease-out .6s both }
        @keyframes nm-grow {
          from { transform: scaleY(.2); opacity: .6 }
          to   { transform: scaleY(1); opacity: 1 }
        }
      `}</style>
    </span>
  )
}
