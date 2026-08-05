import type { Transition, Variants } from 'motion/react'

/** Shared easing/spring presets so every animated surface in the app moves the same way. */
export const easeOutTransition: Transition = { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
export const springSnappy: Transition = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }
export const springSoft: Transition = { type: 'spring', stiffness: 240, damping: 26 }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: easeOutTransition },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: easeOutTransition },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: springSnappy },
}

/** Wraps a page's content — stagger delay lets nested `fadeUp`/`staggerContainer` children cascade in. */
export const pageContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.02 } },
}

export function staggerContainer(staggerChildren = 0.06, delayChildren = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren, delayChildren } },
  }
}
