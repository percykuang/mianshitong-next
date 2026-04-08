import type { SVGProps } from 'react'

export function MianshitongLogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient
          id="mianshitong-logo-bg"
          gradientUnits="userSpaceOnUse"
          x1="32"
          x2="224"
          y1="32"
          y2="224"
        >
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect
        fill="url(#mianshitong-logo-bg)"
        height="224"
        rx="56"
        width="224"
        x="16"
        y="16"
      />
      <path
        d="M76 182V74H100L128 120L156 74H180V182"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="20"
      />
    </svg>
  )
}
