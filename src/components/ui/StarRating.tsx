export function StarRating({ stars, className }: { stars: 1 | 2 | 3 | 4 | 5; className?: string }) {
  return (
    <span className={className} aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < stars ? 'text-yellow' : 'text-white/15'}>
          ★
        </span>
      ))}
    </span>
  )
}
