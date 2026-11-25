import { Link } from 'react-router-dom';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  backLink?: string;
  backText?: string;
}

export function ErrorMessage({ message, onRetry, backLink, backText }: ErrorMessageProps) {
  return (
    <div className="state-box state-error" role="alert">
      <h2>Something went wrong</h2>
      <p>{message}</p>
      <div className="state-actions">
        {onRetry && (
          <button className="btn btn-secondary" onClick={onRetry}>
            Try again
          </button>
        )}
        {backLink && (
          <Link to={backLink} className="btn btn-secondary">
            {backText}
          </Link>
        )}
      </div>
    </div>
  );
}
