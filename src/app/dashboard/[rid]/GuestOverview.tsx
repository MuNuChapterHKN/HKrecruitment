type GuestOverviewProps = {
  name?: string | null;
};

export function GuestOverview({ name }: GuestOverviewProps) {
  const displayName = name?.trim();

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          {displayName ? `Welcome, ${displayName}` : 'Welcome'}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Use the sidebar to access the pages available to you.
        </p>
      </div>
    </div>
  );
}
