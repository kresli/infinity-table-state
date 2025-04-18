export function ButtonIcon(props: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      className="bg-slate-50 border border-slate-400 rounded text-slate-600"
    >
      {props.icon}
    </button>
  );
}
