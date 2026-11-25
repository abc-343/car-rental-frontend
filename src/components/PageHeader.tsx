import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  backLink?: string;
  backText?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, backLink, backText, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {backLink && (
          <Link to={backLink} className="back-link">
            <ArrowLeft size={16} /> {backText}
          </Link>
        )}
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
