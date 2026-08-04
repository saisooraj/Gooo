export type NotificationChannel = 'email' | 'push' | 'sms' | 'whatsapp' | 'calendar'

export interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, string>
}

/** One integration (email/push/SMS/WhatsApp/calendar) plugged into the dispatcher. */
export interface NotificationChannelAdapter {
  channel: NotificationChannel
  send(userId: string, payload: NotificationPayload): Promise<void>
}

export interface NotificationDispatcher {
  dispatch(
    userId: string,
    payload: NotificationPayload,
    channels: NotificationChannel[],
  ): Promise<void>
}
