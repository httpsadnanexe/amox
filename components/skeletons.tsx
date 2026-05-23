export function PostSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full skeleton-shimmer" />
        <div className="h-4 w-24 rounded skeleton-shimmer" />
        <div className="h-3 w-16 rounded skeleton-shimmer ml-auto" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded skeleton-shimmer" />
        <div className="h-4 w-full rounded skeleton-shimmer" />
        <div className="h-4 w-2/3 rounded skeleton-shimmer" />
      </div>
      <div className="flex items-center gap-4 pt-2">
        <div className="h-8 w-16 rounded skeleton-shimmer" />
        <div className="h-8 w-16 rounded skeleton-shimmer" />
        <div className="h-8 w-20 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 py-3">
      <div className="w-7 h-7 rounded-full skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-20 rounded skeleton-shimmer" />
        <div className="h-4 w-full rounded skeleton-shimmer" />
        <div className="h-3 w-16 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full skeleton-shimmer" />
        <div className="space-y-2">
          <div className="h-6 w-32 rounded skeleton-shimmer" />
          <div className="h-4 w-20 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}
