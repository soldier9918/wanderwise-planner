const TravelZentraLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" className="fill-primary" />
    <path
      d="M10 13h20v3.5H17.5L30 28.5v2.5H10v-3.5h12.5L10 15.5V13Z"
      className="fill-primary-foreground"
    />
    <circle cx="33" cy="10" r="4" className="fill-accent" opacity="0.9" />
    <path d="M33 7v3h3" stroke="currentColor" strokeWidth="1.2" className="stroke-primary" />
  </svg>
);

export default TravelZentraLogo;
