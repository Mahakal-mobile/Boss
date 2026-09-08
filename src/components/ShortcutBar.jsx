import { SHORTCUTS } from "../lib/persona";

export default function ShortcutBar({ onPick }) {
  return (
    <div className="shortcut-bar">
      {SHORTCUTS.map((s) => (
        <button key={s.id} className="shortcut-chip" onClick={() => onPick(s)}>
          <span className="shortcut-icon">{s.icon}</span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
