import type { SVGProps } from 'react'

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p,
})

export const HomeIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></svg>
export const GridIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
export const UserIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
export const BackIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M15 5l-7 7 7 7" /></svg>
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M9 5l7 7-7 7" /></svg>
export const ChevronDown = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M5 9l7 7 7-7" /></svg>
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
export const MicIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>
export const PlusIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
export const TrashIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
export const PauseIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M8 5v14M16 5v14" /></svg>
