import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted">
      <span className="text-3xl opacity-70">{icon ?? '♟'}</span>
      <p>{message}</p>
    </div>
  );
}
