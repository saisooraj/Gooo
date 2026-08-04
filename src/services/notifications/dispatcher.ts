import type {
  NotificationChannel,
  NotificationChannelAdapter,
  NotificationDispatcher,
  NotificationPayload,
} from './types'

/**
 * Fans a notification out to whichever channel adapters are registered.
 * V1 registers only no-op adapters (see noopAdapter.ts) — there is no real
 * push/email/SMS/WhatsApp delivery yet — but every call site already goes
 * through this interface, so wiring up a real provider later is a one-file change.
 */
export function createNotificationDispatcher(
  adapters: NotificationChannelAdapter[],
): NotificationDispatcher {
  const byChannel = new Map(adapters.map((adapter) => [adapter.channel, adapter]))

  return {
    async dispatch(userId: string, payload: NotificationPayload, channels: NotificationChannel[]) {
      await Promise.all(channels.map((channel) => byChannel.get(channel)?.send(userId, payload)))
    },
  }
}
