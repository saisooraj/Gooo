import type { NotificationChannel, NotificationChannelAdapter } from './types'

/** Placeholder adapter used until a real provider is wired up for a channel. */
export function createNoopAdapter(channel: NotificationChannel): NotificationChannelAdapter {
  return {
    channel,
    async send() {
      // No delivery integration in V1 for this channel yet.
    },
  }
}
