import "../css/Logo.css";

export default function Logo({ compact = false }) {
  return (
    <span className={`brandLogo${compact ? " brandLogoCompact" : ""}`}>
      <svg
        className="brandLogoMark"
        viewBox="0 0 48 48"
        role="img"
        aria-label="Engineering Decoded logo"
      >
        <defs>
          <linearGradient
            id="engineeringDecodedGradient"
            x1="4"
            y1="4"
            x2="44"
            y2="44"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#78ed9a" />
            <stop offset="1" stopColor="#68b7ed" />
          </linearGradient>
        </defs>
        <path className="brandLogoFrame" d="M24 3 42 13.5v21L24 45 6 34.5v-21L24 3Z" />
        <path className="brandLogoCode" d="m19 15-7 9 7 9m10-18 7 9-7 9M27 11l-6 26" />
        <circle cx="24" cy="24" r="2.5" />
      </svg>
      {!compact && (
        <span className="brandLogoText">
          <strong>Engineering</strong>
          <span>Decoded</span>
        </span>
      )}
    </span>
  );
}
