import { titleCase } from '../utils/format';

interface BreakdownBarsProps {
  items: { status: string; count: number }[];
}

// Horizontal bars used on the dashboard (rentals by status)
export function BreakdownBars({ items }: BreakdownBarsProps) {
  let total = 0;
  items.forEach((item) => (total += item.count));

  return (
    <ul className="bars">
      {items.map((item) => {
        const percent = total === 0 ? 0 : Math.round((item.count / total) * 100);
        return (
          <li key={item.status}>
            <div className="bar-label">
              <span>{titleCase(item.status)}</span>
              <span className="muted">
                {item.count} ({percent}%)
              </span>
            </div>
            <div className="bar-track">
              <div className={`bar-fill fill-${item.status.toLowerCase()}`} style={{ width: percent + '%' }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
