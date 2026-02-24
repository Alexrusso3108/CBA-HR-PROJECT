export default function Badge({ status, label }) {
  const text = label || status;
  return <span className={`badge badge-${status?.toLowerCase().replace(' ', '_')}`}>{text}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge badge-${priority}`}>{priority?.charAt(0).toUpperCase() + priority?.slice(1)}</span>;
}
