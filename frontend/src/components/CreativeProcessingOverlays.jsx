
import React, { useEffect, useState } from "react";

/**
 * Three themed waiting overlays for background processing tabs:
 * 1) PaintBrushOverlay – animated brush painting a gradient stroke
 * 2) CameraCaptureOverlay – camera with spinning aperture and flash
 * 3) MergeImagesOverlay – two image tiles slide+blend into one
 *
 * All are dependency-free (pure React + inline SVG/CSS), accessible, and respect reduced-motion.
 * Each overlay accepts common props: open, message, submessage, onCancel, colors, className
 *
 * Colors defaults are brand-agnostic but easy to override per tab.
 */

const defaultColors = {
  primary: "#7c4dff", // violet
  accent: "#00e5ff",  // aqua
  rose: "#ff6db6",    // magenta
  ink: "#0b1020",     // deep navy
  bg: "#050914CC",    // translucent backdrop
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

function OverlayShell({ open, message, submessage, onCancel, colors = defaultColors, children, className }) {
  if (!open) return null;
  return (
    <div role="status" aria-live="polite" aria-atomic className={["fixed inset-0 z-[1000] grid place-items-center p-6", className].filter(Boolean).join(" ")} style={{ background: colors.bg, backdropFilter: "blur(6px)", color: "white" }}>
      <div className="grid gap-5 place-items-center text-center max-w-lg w-full">
        {children}
        <div className="grid gap-1">
          {message && <div className="text-lg font-semibold" style={{textShadow:"0 2px 14px rgba(0,0,0,.35)"}}>{message}</div>}
          {submessage && <div className="opacity-80 text-sm">{submessage}</div>}
        </div>
        {onCancel && (
          <button onClick={onCancel} className="mt-1 rounded-2xl px-4 py-2 text-sm font-medium shadow-sm" style={{ background:`linear-gradient(135deg, ${colors.accent}, ${colors.primary})`, boxShadow:"0 8px 24px rgba(0,0,0,.25)" }}>Cancel</button>
        )}
      </div>
    </div>
  );
}

/** 1) PaintBrushOverlay */
export function PaintBrushOverlay({ open, message = "Painting preview…", submessage = "Rendering style transfer", onCancel, colors = defaultColors, size = 220, className }) {
  const reduced = usePrefersReducedMotion();
  const W = size, H = size * 0.62; // cinematic aspect
  const strokeH = Math.max(18, Math.floor(H * 0.18));
  const brushW = Math.max(20, Math.floor(W * 0.14));
  const y = H / 2 - strokeH / 2;

  return (
    <OverlayShell open={open} message={message} submessage={submessage} onCancel={onCancel} colors={colors} className={className}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="Painting in progress" role="img" style={{borderRadius:16, boxShadow:"0 10px 30px rgba(0,0,0,.35)"}}>
        <defs>
          <linearGradient id="paintGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="50%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.rose} />
          </linearGradient>
          {/* Mask reveals the painted area as brush moves */}
          <mask id="reveal">
            <rect x="0" y="0" width={W} height={H} fill="black" />
            <rect id="revealBar" x={-W} y={y} width={W} height={strokeH} rx={strokeH/2} fill="white">
              {!reduced && (
                <animate attributeName="x" from={-W} to={W} dur="2.2s" repeatCount="indefinite" />
              )}
            </rect>
          </mask>
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Canvas */}
        <rect x="0" y="0" width={W} height={H} fill="rgba(12,17,35,.65)" />
        {/* Painted stroke with glow */}
        <g mask="url(#reveal)">
          <rect x="0" y={y} width={W} height={strokeH} rx={strokeH/2} fill="url(#paintGrad)" />
          <rect x="0" y={y} width={W} height={strokeH} rx={strokeH/2} fill="url(#paintGrad)" filter="url(#soft)" opacity="0.45" />
        </g>

        {/* Brush head moving with the mask bar */}
        <g>
          <g id="brush" transform={`translate(${W * 0.15}, ${y - 6})`}>
            <rect x="0" y="0" width={brushW} height={strokeH + 12} rx={6} fill="#d1b790" />
            <rect x={brushW} y={6} width={brushW * 0.3} height={strokeH} rx={4} fill="#b08968" />
            <rect x={brushW * 1.3} y={strokeH/2 - 6} width={brushW * 0.6} height={12} rx={6} fill="#6b7280" />
            <rect x={brushW * 1.9} y={strokeH/2 - 8} width={brushW * 0.22} height={16} rx={6} fill="#374151" />
          </g>

          {!reduced && (
            <animateTransform xlinkHref="#brush" attributeName="transform" type="translate" from={`${-brushW} ${y - 6}`} to={`${W - brushW * 0.1} ${y - 6}`} dur="2.2s" repeatCount="indefinite" />
          )}
        </g>
      </svg>
    </OverlayShell>
  );
}

/** 2) CameraCaptureOverlay */
export function CameraCaptureOverlay({ open, message = "Capturing image…", submessage = "Optimizing exposure & focus", onCancel, colors = defaultColors, size = 220, className }) {
  const reduced = usePrefersReducedMotion();
  const S = size;
  const cx = S/2, cy = S/2;
  const r = S * 0.32;

  return (
    <OverlayShell open={open} message={message} submessage={submessage} onCancel={onCancel} colors={colors} className={className}>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} aria-label="Camera processing" role="img" style={{borderRadius:16, boxShadow:"0 10px 30px rgba(0,0,0,.35)"}}>
        <defs>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="60%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.rose} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Body */}
        <rect x={S*0.15} y={S*0.22} width={S*0.7} height={S*0.46} rx={S*0.06} fill="#0f172a" stroke="#93c5fd22" strokeWidth={2} />
        {/* Lens ring */}
        <circle cx={cx} cy={cy} r={r+12} fill="none" stroke="#ffffff22" strokeWidth={10} />
        <circle cx={cx} cy={cy} r={r} fill="#0b1020" stroke="url(#glass)" strokeWidth={10} />

        {/* Aperture blades (6) */}
        <g transform={`translate(${cx} ${cy})`}>
          {[...Array(6)].map((_, i) => (
            <polygon key={i} points={`0,-${r} ${r*0.18},-${r*0.35} ${r*0.45},-${r*0.08}`} fill="url(#glass)" opacity="0.9" transform={`rotate(${i*60})`} />
          ))}
          {!reduced && (
            <animateTransform attributeName="transform" type="rotate" from={`0 ${0} ${0}`} to={`360 ${0} ${0}`} dur="2.2s" repeatCount="indefinite" />
          )}
        </g>

        {/* Flash indicator */}
        <circle cx={S*0.32} cy={S*0.27} r={S*0.018} fill="#fff" />
        {!reduced && (
          <rect x={S*0.15} y={S*0.22} width={S*0.7} height={S*0.46} fill="#ffffff" opacity="0">
            <animate attributeName="opacity" values="0;0;0.95;0" keyTimes="0;0.88;0.9;1" dur="2.2s" repeatCount="indefinite" />
          </rect>
        )}

        {/* Focusing brackets */}
        <g stroke="#ffffff66" strokeWidth={2} filter="url(#glow)">
          <path d={`M ${S*0.25} ${S*0.25} h ${S*0.08} M ${S*0.25} ${S*0.25} v ${S*0.08}`} />
          <path d={`M ${S*0.75} ${S*0.25} h -${S*0.08} M ${S*0.75} ${S*0.25} v ${S*0.08}`} />
          <path d={`M ${S*0.25} ${S*0.75} h ${S*0.08} M ${S*0.25} ${S*0.75} v -${S*0.08}`} />
          <path d={`M ${S*0.75} ${S*0.75} h -${S*0.08} M ${S*0.75} ${S*0.75} v -${S*0.08}`} />
        </g>
      </svg>
    </OverlayShell>
  );
}

/** 3) MergeImagesOverlay */
export function MergeImagesOverlay({ open, message = "Merging images…", submessage = "Blending layers & colors", onCancel, colors = defaultColors, size = 220, className }) {
  const reduced = usePrefersReducedMotion();
  const W = size * 1.25, H = size * 0.75;

  return (
    <OverlayShell open={open} message={message} submessage={submessage} onCancel={onCancel} colors={colors} className={className}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="Merging images" role="img" style={{borderRadius:16, boxShadow:"0 10px 30px rgba(0,0,0,.35)"}}>
        <defs>
          <linearGradient id="imgA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.primary} />
          </linearGradient>
          <linearGradient id="imgB" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.rose} />
            <stop offset="100%" stopColor={colors.primary} />
          </linearGradient>
          <filter id="halo">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Two image tiles */}
        <g id="leftTile" transform={`translate(${W*0.12}, ${H*0.18})`}>
          <rect width={W*0.32} height={H*0.64} rx={12} fill="url(#imgA)" />
          <path d={`M 12 ${H*0.45} l ${W*0.08} -${H*0.18} l ${W*0.1} ${H*0.22} l ${W*0.06} -${H*0.12} l ${W*0.06} ${H*0.12} v ${H*0.2} h -${W*0.3} z`} fill="#ffffff22" />
        </g>
        <g id="rightTile" transform={`translate(${W*0.56}, ${H*0.18})`}>
          <rect width={W*0.32} height={H*0.64} rx={12} fill="url(#imgB)" />
          <circle cx={W*0.06} cy={H*0.18} r={H*0.07} fill="#ffffff22" />
          <path d={`M ${W*0.04} ${H*0.5} h ${W*0.22} v ${H*0.14} h -${W*0.22} z`} fill="#ffffff18" />
        </g>

        {/* Merge glow */}
        <rect x={W*0.38} y={H*0.12} width={W*0.24} height={H*0.76} rx={14} fill="#fff" opacity="0.06" filter="url(#halo)" />

        {/* Animate tiles toward center & scale down into single tile */}
        {!reduced && (
          <>
            <animateTransform xlinkHref="#leftTile" attributeName="transform" type="translate" values={`
              ${W*0.12} ${H*0.18};
              ${W*0.22} ${H*0.18};
              ${W*0.30} ${H*0.18}
            `} keyTimes="0; .6; 1" dur="2.4s" repeatCount="indefinite" />
            <animateTransform xlinkHref="#rightTile" attributeName="transform" type="translate" values={`
              ${W*0.56} ${H*0.18};
              ${W*0.46} ${H*0.18};
              ${W*0.38} ${H*0.18}
            `} keyTimes="0; .6; 1" dur="2.4s" repeatCount="indefinite" />
          </>
        )}

        {/* Resulting merged tile in center */}
        <g id="merged" transform={`translate(${W*0.34}, ${H*0.16})`}>
          <rect width={W*0.32} height={H*0.68} rx={14} fill="#0b1020" stroke="#ffffff22" />
          <rect width={W*0.32} height={H*0.68} rx={14} fill="url(#imgA)" opacity="0.14" />
          <rect width={W*0.32} height={H*0.68} rx={14} fill="url(#imgB)" opacity="0.14" />
        </g>

        {/* Pulse at merge moment */}
        {!reduced && (
          <circle cx={W*0.5} cy={H*0.5} r={12} fill={colors.accent} opacity="0.18">
            <animate attributeName="r" values={`12; ${Math.min(W,H)*0.45}; 12`} keyTimes="0; .6; 1" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.18; 0; 0.18" keyTimes="0; .6; 1" dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </OverlayShell>
  );
}

// Convenience re-exports bundled in one default object (optional)
export default { PaintBrushOverlay, CameraCaptureOverlay, MergeImagesOverlay };
