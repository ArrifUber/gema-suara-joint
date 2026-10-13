import { SearchIcon } from './Icons'

export default function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-12 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-mute focus-within:border-gold">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-mute"
      />
      <SearchIcon width={18} height={18} />
    </label>
  )
}
