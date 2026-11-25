import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState title="Page not found" message="This page doesn't exist. Check the address or go back to the dashboard.">
      <Link to="/" className="btn btn-primary">
        Go to dashboard
      </Link>
    </EmptyState>
  );
}
