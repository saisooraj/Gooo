import { describe, expect, it } from 'vitest'
import {
  computeBookingWindow,
  computeReturnBookingDate,
  estimateDemand,
  getBookingReminder,
  isReminderDue,
} from './bookingWindow'

describe('computeBookingWindow', () => {
  it('opens exactly N days before the journey date', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-08-01')
    expect(window.bookingOpensOn).toBe('2026-08-27')
    expect(window.bookingClosesOn).toBe('2026-12-25')
    expect(window.status).toBe('upcoming')
  })

  it('is book-today the day the window opens', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-08-27')
    expect(window.status).toBe('open-book-today')
  })

  it('is open between opening and the journey date', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-12-01')
    expect(window.status).toBe('open')
  })

  it('is closed after the journey date', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-12-26')
    expect(window.status).toBe('closed')
  })

  it('handles a leap-year advance window spanning Feb 29', () => {
    const window = computeBookingWindow('2024-03-10', 120, '2023-11-01')
    expect(window.bookingOpensOn).toBe('2023-11-11')
  })
})

describe('computeReturnBookingDate', () => {
  it('derives the return leg opening date from its own journey date', () => {
    expect(computeReturnBookingDate('2026-12-30', 120)).toBe('2026-09-01')
  })
})

describe('getBookingReminder', () => {
  it('reports booked when a bookedDate is present', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-08-01')
    expect(getBookingReminder(window, '2026-08-01')).toBe('booked')
  })

  it('reports book-today once the window is open', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-12-01')
    expect(getBookingReminder(window, null)).toBe('book-today')
  })

  it('reports book-tomorrow the day before opening', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-08-26')
    expect(getBookingReminder(window, null)).toBe('book-tomorrow')
  })

  it('reports book-this-week within 7 days of opening', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-08-22')
    expect(getBookingReminder(window, null)).toBe('book-this-week')
  })

  it('reports already-missed once the journey date has passed unbooked', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-12-26')
    expect(getBookingReminder(window, null)).toBe('already-missed')
  })
})

describe('isReminderDue', () => {
  it('is due within the reminder lead window', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-08-25')
    expect(isReminderDue(window)).toBe(true)
  })

  it('is not due far ahead of opening', () => {
    const window = computeBookingWindow('2026-12-25', 120, '2026-01-01')
    expect(isReminderDue(window)).toBe(false)
  })
})

describe('estimateDemand', () => {
  it('is Very High during a festival period regardless of other factors', () => {
    expect(estimateDemand({ journeyWeekday: 2, isLongWeekend: false, isFestivalPeriod: true })).toBe(
      'Very High',
    )
  })

  it('is High on a long weekend', () => {
    expect(estimateDemand({ journeyWeekday: 2, isLongWeekend: true })).toBe('High')
  })

  it('is Medium for Friday/Sunday travel', () => {
    expect(estimateDemand({ journeyWeekday: 5, isLongWeekend: false })).toBe('Medium')
    expect(estimateDemand({ journeyWeekday: 0, isLongWeekend: false })).toBe('Medium')
  })

  it('is Low for an ordinary weekday', () => {
    expect(estimateDemand({ journeyWeekday: 2, isLongWeekend: false })).toBe('Low')
  })
})
