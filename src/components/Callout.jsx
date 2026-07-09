const ICONS = { tip: '✅', warn: '⚠️', info: 'ℹ️' };

export default function Callout({ type = 'info', children }) {
  return (
    <div className={'callout ' + type}>
      <span className="callout-icon">{ICONS[type]}</span>
      <div>{children}</div>
    </div>
  );
}
