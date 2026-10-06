export default function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Low: 'bg-slate-100 text-slate-600',
    Medium: 'bg-orange-100 text-orange-700',
    High: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[priority] || ''}`}>
      {priority}
    </span>
  );
}
