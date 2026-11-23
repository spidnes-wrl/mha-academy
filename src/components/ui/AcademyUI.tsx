import type { ReactNode } from 'react';

export function GlassSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass-surface glass-fallback rounded-2xl ${className}`}>{children}</div>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Banner({ imageUrl, children, className = '' }: { imageUrl?: string | null; children?: ReactNode; className?: string }) {
  return <section className={`mha-banner overflow-hidden p-5 sm:p-7 ${className}`}>
    {imageUrl ? <img src={imageUrl} alt="" className="mha-banner-image" /> : null}
    <div className="relative z-10">{children}</div>
  </section>;
}

export function ChibiSticker({ imageUrl, label = 'MHA' }: { imageUrl?: string | null; label?: string }) {
  return <div className="absolute -bottom-5 right-4 z-20 grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-blue-400/40 bg-[#111827] shadow-xl">
    {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-center text-[10px] font-black leading-tight text-[#BFD2FF]">{label}<br/><span className="text-xl">✦</span></span>}
  </div>;
}

export function Chip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return <span className={`inline-flex min-h-9 items-center rounded-full border px-4 text-xs font-semibold ${active ? 'border-blue-500 bg-blue-600 text-white' : 'border-[#1B2437] bg-[#0A0D14] text-[#BFD2FF]'}`}>{children}</span>;
}

export function AvatarFrame({ src, name = 'Avatar', size = 'h-12 w-12' }: { src?: string | null; name?: string; size?: string }) {
  return <span className={`mha-avatar-frame shrink-0 ${size}`}>
    {src ? <img src={src} alt={name} /> : <span className="grid h-full w-full place-items-center rounded-full bg-[#111827] text-sm font-bold text-[#BFD2FF]">{name.slice(0,1).toUpperCase()}</span>}
  </span>;
}
