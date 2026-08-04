/**
 * Default advance reservation period, in days, used to compute a train
 * booking's opening date when the user hasn't overridden it. Indian
 * Railways' general-quota ARP is 60 days at time of writing (verified
 * against real IRCTC booking-window behavior); this is a default, not a
 * hardcoded rule — every booking can override it per train/quota (e.g.
 * Tatkal has a much shorter window).
 */
export const DEFAULT_ADVANCE_RESERVATION_DAYS = 60

/** Days before booking-open date to start surfacing a "book soon" reminder. */
export const BOOKING_REMINDER_LEAD_DAYS = 3
