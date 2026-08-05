import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { LogoMark } from '@/components/layout/navIcons'
import { signInWithGoogle } from '@/firebase/auth'
import { fadeUp, springSnappy, staggerContainer } from '@/lib/motion'

export function LoginPage() {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    setError(null)
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch {
      setError('Sign-in failed. Please try again.')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center bg-bg px-6">
      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerContainer(0.09, 0.1)}
        className="flex w-full max-w-sm flex-col items-center text-center"
      >
        <motion.div
          variants={fadeUp}
          initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ ...springSnappy, delay: 0.05 }}
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime"
        >
          <LogoMark className="h-7 w-7" />
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-2xl font-bold tracking-tight text-t1">
          Gooo
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-sm text-t2">
          Turn a handful of leave days into your next great trip — we do the math on
          holidays, weekends, and booking windows for you.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 w-full">
          <Button
            onClick={() => void handleSignIn()}
            disabled={isSigningIn}
            size="lg"
            fullWidth
            variant="secondary"
          >
            {isSigningIn ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
                />
                <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-4v-2.6H3.1a10 10 0 0 0 0 9.2L6.4 14Z" />
                <path
                  fill="#EA4335"
                  d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4l3.3 2.6C7.2 7.8 9.4 6 12 6Z"
                />
              </svg>
            )}
            Continue with Google
          </Button>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-red"
          >
            {error}
          </motion.p>
        )}

        <motion.p variants={fadeUp} className="mt-8 text-xs text-t3">
          Your data stays private to your account.
        </motion.p>
      </motion.div>
    </div>
  )
}
