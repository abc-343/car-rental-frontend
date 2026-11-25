import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  children?: ReactNode; // optional button
}

export function EmptyState({ title, message, children }: EmptyStateProps) {
  return (
    <div className="state-box">
      <h2>{title}</h2>
      <p className="muted">{message}</p>
      {children}
    </div>
  );
}
