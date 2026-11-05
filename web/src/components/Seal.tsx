/** Hanko-style seal. 確 = "confirmed". The rough edge comes from the #rough filter mounted once in App. */
export function Seal({ size = 56, label = "Checked against the AniList record" }: { size?: number; label?: string }) {
  return (
    <svg className="seal" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={label}>
      <g filter="url(#rough)">
        <rect x="5" y="5" width="54" height="54" rx="5" fill="none" stroke="currentColor" strokeWidth="5" />
        <text x="32" y="47" textAnchor="middle" fontSize="38" fill="currentColor" fontFamily="OO Seal, serif">確</text>
      </g>
    </svg>
  );
}

export function SealDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
      </filter>
    </svg>
  );
}
