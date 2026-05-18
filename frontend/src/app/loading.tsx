export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
      <div className="h-12 w-12 animate-spin border-2 border-ink/15 border-t-cobalt" />
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/40">
        Loading
      </p>
    </div>
  );
}
