// Motivo visual: dos hemisferios separados por una línea fina. El tamaño de cada mitad puede reflejar fortalezas.
export default function Hemispheres({ left = 1, right = 1, size = 160, animate = false, muted = false }:
  { left?: number; right?: number; size?: number; animate?: boolean; muted?: boolean }) {
  const r = size / 2 - 4;
  const sl = Math.max(0.35, Math.min(1, left)), sr = Math.max(0.35, Math.min(1, right));
  const half = (side: "L" | "R", scale: number, color: string) => {
    const rr = r * scale, cx = size / 2 + (side === "L" ? -3 : 3), cy = size / 2;
    const d = side === "L"
      ? `M ${cx} ${cy - rr} A ${rr} ${rr} 0 0 0 ${cx} ${cy + rr} Z`
      : `M ${cx} ${cy - rr} A ${rr} ${rr} 0 0 1 ${cx} ${cy + rr} Z`;
    return (
      <path d={d} fill={color} className={animate ? "hemi" : undefined}
        style={animate ? ({ ["--from" as any]: side === "L" ? "-14px" : "14px" } as React.CSSProperties) : undefined} />
    );
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {half("L", sl, muted ? "#E9B7BC" : "var(--red)")}
      {half("R", sr, muted ? "#B6CAE8" : "var(--blue)")}
    </svg>
  );
}
