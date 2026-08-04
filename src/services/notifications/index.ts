import { createNotificationDispatcher } from './dispatcher'
import { createNoopAdapter } from './noopAdapter'

export * from './types'
export { createNotificationDispatcher } from './dispatcher'

/** V1 default: every channel resolves to a no-op until a real provider is added. */
export const notificationDispatcher = createNotificationDispatcher([
  createNoopAdapter('email'),
  createNoopAdapter('push'),
  createNoopAdapter('sms'),
  createNoopAdapter('whatsapp'),
  createNoopAdapter('calendar'),
])
