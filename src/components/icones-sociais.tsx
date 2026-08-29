/**
 * Ícones de redes sociais.
 * O lucide-react v1 não distribui mais ícones de marcas, então mantemos os SVGs aqui.
 */

type Props = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true as const,
});

export function IconeFacebook({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M14 8.5V6.8c0-.8.2-1.2 1.3-1.2H17V3h-2.6C11.5 3 10.6 4.4 10.6 6.7v1.8H8.6V11h2v10h3.4V11h2.4l.4-2.5H14Z" />
    </svg>
  );
}

export function IconeInstagram({ size = 16, className }: Props) {
  return (
    <svg
      {...base(size)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconeYoutube({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M22 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.8C18.3 5 12 5 12 5s-6.3 0-7.9.5A2.5 2.5 0 0 0 2.4 7.3C2 8.8 2 12 2 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.8C5.7 19 12 19 12 19s6.3 0 7.9-.5a2.5 2.5 0 0 0 1.7-1.8c.4-1.5.4-4.7.4-4.7ZM10 15.2V8.8L15.5 12 10 15.2Z" />
    </svg>
  );
}

export function IconeTiktok({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M16.5 3h-2.7v12.1a2.4 2.4 0 1 1-2-2.4V10a5.4 5.4 0 1 0 4.7 5.3V9.1c.9.7 2.1 1.1 3.5 1.2V7.5c-2 0-3.5-1.6-3.5-4.5Z" />
    </svg>
  );
}

export function IconeWhatsapp({ size = 16, className }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2 22l5.33-1.4a9.82 9.82 0 0 0 4.7 1.2h.01c5.44 0 9.86-4.42 9.86-9.86 0-2.63-1.03-5.11-2.89-6.97A9.79 9.79 0 0 0 12.04 2Zm0 17.98h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.16 8.16 0 0 1-1.25-4.36c0-4.52 3.68-8.2 8.2-8.2 2.19 0 4.25.86 5.8 2.41a8.15 8.15 0 0 1 2.4 5.8c0 4.52-3.68 8.19-8.2 8.19Z" />
    </svg>
  );
}
