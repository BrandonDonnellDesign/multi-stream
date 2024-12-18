interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}