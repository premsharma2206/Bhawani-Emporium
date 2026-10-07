/** One ring of petals between two radii, drawn as closed curves around the centre. */
function petals(count: number, inner: number, outer: number, width: number) {
  const span = outer - inner;
  const d = [
    `M0 ${-inner}`,
    `C${width} ${-(inner + span * 0.35)} ${width} ${-(outer - span * 0.25)} 0 ${-outer}`,
    `C${-width} ${-(outer - span * 0.25)} ${-width} ${-(inner + span * 0.35)} 0 ${-inner}Z`,
  ].join(" ");
  return Array.from({ length: count }, (_, i) => (
    <path key={i} d={d} transform={`rotate(${(i * 360) / count})`} />
  ));
}

function dots(count: number, radius: number) {
  return Array.from({ length: count }, (_, i) => (
    <circle key={i} r="2.5" cy={-radius} transform={`rotate(${(i * 360) / count})`} />
  ));
}

/** Line-drawn mandala whose rings turn slowly in alternating directions. */
function Mandala({ className }: { className: string }) {
  return (
    <svg viewBox="-360 -360 720 720" fill="none" stroke="currentColor" className={className}>
      <g className="backdrop-spin">
        <circle r="345" strokeDasharray="2 10" />
        <circle r="330" />
        {petals(32, 272, 328, 20)}
      </g>
      <g className="backdrop-spin-reverse">
        <circle r="270" />
        {petals(24, 202, 268, 24)}
        <g fill="currentColor" stroke="none">
          {dots(24, 284)}
        </g>
      </g>
      <g className="backdrop-spin">
        <circle r="200" />
        {petals(16, 122, 198, 30)}
      </g>
      <g className="backdrop-spin-reverse">
        <circle r="120" />
        {petals(8, 40, 118, 36)}
        <circle r="40" />
        <circle r="14" />
      </g>
    </svg>
  );
}

/** Animated page background: drifting glows, a faint grid and two turning mandalas. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="backdrop-orb backdrop-drift-a top-[-14rem] left-[-10rem] size-[38rem] bg-accent/25" />
      <div className="backdrop-orb backdrop-drift-b top-[-8rem] right-[-12rem] size-[34rem] bg-glow/20" />
      <div className="backdrop-orb backdrop-drift-c bottom-[-18rem] left-1/3 size-[40rem] bg-[#7c5cff]/20" />
      <div className="backdrop-grid absolute inset-0" />
      <Mandala className="absolute top-[-9rem] right-[-11rem] size-[46rem] text-accent/20" />
      <Mandala className="absolute bottom-[-16rem] left-[-14rem] size-[40rem] text-glow/15" />
    </div>
  );
}
