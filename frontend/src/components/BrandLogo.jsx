function BrandLogo({ className = "", theme = "default", showTagline = true, adminLabel = false }) {
  const classes = ["brand-logo", `brand-logo--${theme}`, className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      <span className="brand-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64">
          <defs>
            <linearGradient id="dolia-logo-fill" x1="10%" y1="10%" x2="88%" y2="92%">
              <stop offset="0%" stopColor="#6f3346" />
              <stop offset="55%" stopColor="#9d5067" />
              <stop offset="100%" stopColor="#d78aa0" />
            </linearGradient>
            <linearGradient id="dolia-logo-stroke" x1="18%" y1="16%" x2="82%" y2="82%">
              <stop offset="0%" stopColor="#fff8fb" />
              <stop offset="100%" stopColor="#f6d8e1" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="52" height="52" rx="18" fill="url(#dolia-logo-fill)" />
          <path
            d="M23 18h10.5c9.4 0 15.5 5.7 15.5 14.1S42.9 46 33.5 46H23V18Z"
            fill="none"
            stroke="url(#dolia-logo-stroke)"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M33 22.5c5.9 0 9.7 3.5 9.7 9.1s-3.8 9.1-9.7 9.1h-4.6V22.5H33Z"
            fill="rgba(255,248,251,0.18)"
          />
          <path
            d="M42.4 15.2c3.5-.1 5.8 2.3 5.9 5.7-3.3.1-5.8-2-6-5.4"
            fill="#f8dbe5"
          />
          <circle cx="46.5" cy="20.5" r="1.6" fill="#fff7fa" />
        </svg>
      </span>

      <span className="brand-logo-copy">
        <strong>Dolia</strong>
        {showTagline && <small>{adminLabel ? "Fashion Admin" : "Fashion Boutique"}</small>}
      </span>
    </span>
  );
}

export default BrandLogo;
