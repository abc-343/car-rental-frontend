import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  children: ReactNode; // the input or select
}

export function FormField({ label, id, error, hint, children }: FormFieldProps) {
  return (
    <div className={error ? 'field field-invalid' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
      {!error && hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}
