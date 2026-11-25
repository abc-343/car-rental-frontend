import { titleCase } from '../utils/format';

interface StatusBadgeProps {
  status: string; // a CarStatus or a RentalStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{titleCase(status)}</span>;
}
