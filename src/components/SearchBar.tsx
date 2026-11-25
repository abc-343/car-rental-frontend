import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="search-bar">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
