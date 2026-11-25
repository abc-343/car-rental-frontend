import { titleCase } from '../utils/format';

interface FilterChipsProps {
  options: string[];
  selected: string; // '' means "All"
  onSelect: (value: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <div className="chips">
      <button className={selected === '' ? 'chip chip-active' : 'chip'} onClick={() => onSelect('')}>
        All
      </button>
      {options.map((option) => (
        <button
          key={option}
          className={selected === option ? 'chip chip-active' : 'chip'}
          onClick={() => onSelect(option)}
        >
          {titleCase(option)}
        </button>
      ))}
    </div>
  );
}
