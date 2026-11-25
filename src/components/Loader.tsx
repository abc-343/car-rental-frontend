interface LoaderProps {
  text?: string;
}

export function Loader({ text = 'Loading...' }: LoaderProps) {
  return (
    <div className="state-box" role="status">
      <div className="spinner" />
      <p>{text}</p>
      {/* the backend is on Render's free plan, it sleeps when nobody uses it */}
      <p className="muted small">The first load can take up to a minute while the server wakes up.</p>
    </div>
  );
}
