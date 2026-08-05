import { motion } from 'motion/react'
import { staggerContainer, scaleIn } from '@/lib/motion'

export function StarRating({ stars, className }: { stars: 1 | 2 | 3 | 4 | 5; className?: string }) {
  return (
    <motion.span
      variants={staggerContainer(0.05)}
      initial="hidden"
      animate="show"
      className={className}
      aria-label={`${stars} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <motion.span key={i} variants={scaleIn} className={i < stars ? 'text-yellow' : 'text-white/15'}>
          ★
        </motion.span>
      ))}
    </motion.span>
  )
}
