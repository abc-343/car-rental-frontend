import { Link } from 'react-router-dom';

// Visual identity: a key tag, the thing handed over the counter with every rental
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="RoadReady Rentals, go to dashboard">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect x="3" y="7" width="28" height="20" rx="4" fill="#F2B705" />
        <circle cx="9.5" cy="17" r="2.6" fill="#22262C" />
        <path d="M15 13.5h11M15 17h8M15 20.5h11" stroke="#22262C" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="logo-text">
        RoadReady
        <small>Rentals</small>
      </span>
    </Link>
  );
}
