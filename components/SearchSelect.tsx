import { inputClass, labelClass } from "./ui/styles";

export type Option = { value: string; label: string };

type Props = {
  id: string;
  name: string;
  label: string;
  options: Option[];
  query: string;
  onQueryChange: (query: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
};

export default function SearchSelect({
  id,
  name,
  label,
  options,
  query,
  onQueryChange,
  value,
  onValueChange,
  placeholder,
  disabled,
  loading,
}: Props) {
  function handleChange(text: string) {
    onQueryChange(text);
    const match = options.find(
      (o) =>
        o.label.toLowerCase() === text.trim().toLowerCase(),
    );
    onValueChange(match?.value ?? "");
  }

  function handleBlur() {
    if (query && !value) onQueryChange("");
  }

  const listId = `${id}-options`;

  return (
    <div>
      <label
        htmlFor={id}
        className={labelClass}>
        {label}
        {loading && (
          <span className="ml-2 text-xs font-normal text-gray-400">
            Loading…
          </span>
        )}
      </label>
      <input
        id={id}
        list={listId}
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        className={inputClass}
      />
      <input
        type="hidden"
        name={name}
        value={value}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option
            key={o.value}
            value={o.label}
          />
        ))}
      </datalist>
    </div>
  );
}
