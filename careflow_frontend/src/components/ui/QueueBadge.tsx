interface QueueBadgeProps {
  number: number;
  label?: string;
}

export function QueueBadge({ number, label = 'Queue' }: QueueBadgeProps) {
  return (
    <div className="queue-badge">
      <span className="queue-badge__label">{label}</span>
      <span className="queue-badge__number">{number}</span>
    </div>
  );
}
