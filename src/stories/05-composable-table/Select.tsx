export function Select(props: {
  value: number;
  options: number[];
  onChange: (value: number) => void;
}) {
  return (
    <div className="ml-4 flex items-center gap-2">
      <select
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="border border-slate-400 bg-slate-50 rounded px-1 h-full"
      >
        {props.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
