import { diffDaysInclusive, subtractDays } from '@/utils/date'
import type { DateKey } from '@/utils/date'
import { computeEfficiency } from '@/modules/shared/lib/efficiency'
import { classifyYear, type ClassifiedDay } from './dayClassifier'
import { computeScore } from './scoring'
import { buildVacationName, buildVacationReason } from './explanation'
import type {
  RecommendationEngine,
  RecommendationEngineInput,
  VacationRecommendation,
} from '../types/recommendation.types'

/** Minimum length (in days) for a zero-leave holiday+weekend block to be worth surfacing. */
const MIN_FREE_BLOCK_LENGTH = 3

interface CandidateBlock {
  startIndex: number
  endIndex: number
  leaveIndexes: number[]
}

function isOffDay(day: ClassifiedDay): boolean {
  return day.kind !== 'workday'
}

function extendLeft(days: ClassifiedDay[], from: number): number {
  let start = from
  while (start - 1 >= 0 && isOffDay(days[start - 1] as ClassifiedDay)) start--
  return start
}

function extendRight(days: ClassifiedDay[], from: number): number {
  let end = from
  while (end + 1 < days.length && isOffDay(days[end + 1] as ClassifiedDay)) end++
  return end
}

function leaveIndexRange(start: number, end: number): number[] {
  const indexes: number[] = []
  for (let k = start; k <= end; k++) indexes.push(k)
  return indexes
}

/**
 * Finds every maximal run of consecutive workdays and, for each amount of
 * leave from 1 up to `maxContinuousLeaveDays`, considers taking just the
 * days at either edge of that run as leave (e.g. only the Friday of a work
 * week) — since only leave days touching an off-day boundary can bridge
 * into a weekend/holiday for free. The matching edge is then greedily
 * extended through adjacent holidays/weekends to form the full vacation
 * block for that amount of leave.
 */
function findLeaveBridgeBlocks(
  days: ClassifiedDay[],
  maxContinuousLeaveDays: number,
): CandidateBlock[] {
  const blocks: CandidateBlock[] = []
  let i = 0

  while (i < days.length) {
    if (days[i]?.kind !== 'workday') {
      i++
      continue
    }

    let j = i
    while (j < days.length && days[j]?.kind === 'workday') j++
    const runLength = j - i
    const maxLen = Math.min(maxContinuousLeaveDays, runLength)

    for (let len = 1; len <= maxLen; len++) {
      if (len === runLength) {
        // The whole run becomes leave — free to extend on both sides.
        const start = extendLeft(days, i)
        const end = extendRight(days, j - 1)
        blocks.push({ startIndex: start, endIndex: end, leaveIndexes: leaveIndexRange(i, j - 1) })
        continue
      }

      // Prefix: leave the first `len` days of the run, bridging left only.
      const prefixEnd = i + len - 1
      blocks.push({
        startIndex: extendLeft(days, i),
        endIndex: prefixEnd,
        leaveIndexes: leaveIndexRange(i, prefixEnd),
      })

      // Suffix: leave the last `len` days of the run, bridging right only.
      const suffixStart = j - len
      blocks.push({
        startIndex: suffixStart,
        endIndex: extendRight(days, j - 1),
        leaveIndexes: leaveIndexRange(suffixStart, j - 1),
      })
    }

    i = j
  }

  return blocks
}

interface WorkdayRun {
  startIndex: number
  endIndex: number
}

function findWorkdayRunEndingAt(days: ClassifiedDay[], offBlockStart: number): WorkdayRun | null {
  const end = offBlockStart - 1
  if (end < 0 || days[end]?.kind !== 'workday') return null
  let start = end
  while (start - 1 >= 0 && days[start - 1]?.kind === 'workday') start--
  return { startIndex: start, endIndex: end }
}

function findWorkdayRunStartingAt(days: ClassifiedDay[], offBlockEnd: number): WorkdayRun | null {
  const start = offBlockEnd + 1
  if (start >= days.length || days[start]?.kind !== 'workday') return null
  let end = start
  while (end + 1 < days.length && days[end + 1]?.kind === 'workday') end++
  return { startIndex: start, endIndex: end }
}

/**
 * Finds "sandwich" opportunities: taking one or more leave days immediately
 * before *and* immediately after the same off-day block (a holiday, a
 * weekend, or a holiday-extended weekend) to fold it into one longer break —
 * e.g. Thursday + Monday leave around a Friday holiday for a 5-day trip.
 * Prefix/suffix bridging alone can't express this, since the two leave days
 * belong to two different workday runs on either side of the block.
 */
function findSandwichBlocks(
  days: ClassifiedDay[],
  maxContinuousLeaveDays: number,
): CandidateBlock[] {
  const blocks: CandidateBlock[] = []
  let i = 0

  while (i < days.length) {
    if (days[i]?.kind === 'workday') {
      i++
      continue
    }

    let j = i
    while (j < days.length && days[j]?.kind !== 'workday') j++
    // The off-day block spans [i, j - 1].

    const precedingRun = findWorkdayRunEndingAt(days, i)
    const followingRun = findWorkdayRunStartingAt(days, j - 1)

    if (precedingRun && followingRun) {
      const precedingLength = precedingRun.endIndex - precedingRun.startIndex + 1
      const followingLength = followingRun.endIndex - followingRun.startIndex + 1

      for (let total = 2; total <= maxContinuousLeaveDays; total++) {
        for (let before = 1; before < total; before++) {
          const after = total - before
          if (before > precedingLength || after > followingLength) continue

          const startIndex = precedingRun.endIndex - before + 1
          const endIndex = followingRun.startIndex + after - 1
          blocks.push({
            startIndex,
            endIndex,
            leaveIndexes: [
              ...leaveIndexRange(startIndex, precedingRun.endIndex),
              ...leaveIndexRange(followingRun.startIndex, endIndex),
            ],
          })
        }
      }
    }

    i = j
  }

  return blocks
}

/** Finds holiday-anchored off-day runs that already form a long weekend with zero leave. */
function findFreeBlocks(days: ClassifiedDay[]): CandidateBlock[] {
  const blocks: CandidateBlock[] = []
  let i = 0

  while (i < days.length) {
    if (days[i]?.kind === 'workday') {
      i++
      continue
    }

    let j = i
    while (j < days.length && days[j]?.kind !== 'workday') j++

    const hasHoliday = days.slice(i, j).some((day) => day.kind === 'holiday')
    if (j - i >= MIN_FREE_BLOCK_LENGTH && hasHoliday) {
      blocks.push({ startIndex: i, endIndex: j - 1, leaveIndexes: [] })
    }

    i = j
  }

  return blocks
}

function buildRecommendation(
  block: CandidateBlock,
  days: ClassifiedDay[],
  input: RecommendationEngineInput,
): VacationRecommendation {
  const blockDays = days.slice(block.startIndex, block.endIndex + 1)
  const startDate = (days[block.startIndex] as ClassifiedDay).date
  const endDate = (days[block.endIndex] as ClassifiedDay).date
  const vacationLength = diffDaysInclusive(startDate, endDate)
  const leaveUsed = block.leaveIndexes.length

  const leaveDatesUsed = block.leaveIndexes.map((idx) => (days[idx] as ClassifiedDay).date)
  const holidayDatesUsed = blockDays.filter((d) => d.kind === 'holiday').map((d) => d.date)
  const weekendDatesUsed = blockDays.filter((d) => d.kind === 'weekend').map((d) => d.date)
  const holidayNames = blockDays
    .filter((d): d is ClassifiedDay & { holidayName: string } => Boolean(d.holidayName))
    .map((d) => d.holidayName)

  const { efficiency, stars } = computeEfficiency(vacationLength, leaveUsed)
  const score = computeScore({
    vacationLength,
    leaveUsed,
    efficiency,
    preferredTripDuration: input.preferences.preferredTripDuration,
  })

  const bookingDate: DateKey = subtractDays(startDate, input.advanceReservationDays)
  const returnBookingDate: DateKey = subtractDays(endDate, input.advanceReservationDays)

  return {
    name: buildVacationName(holidayNames, vacationLength),
    startDate,
    endDate,
    leaveDatesUsed,
    holidayDatesUsed,
    weekendDatesUsed,
    vacationLength,
    leaveUsed,
    efficiency,
    score,
    stars,
    bookingDate,
    returnBookingDate,
    reason: buildVacationReason(leaveUsed, vacationLength, efficiency),
  }
}

function overlapsExcludedDates(block: CandidateBlock, days: ClassifiedDay[], excluded: Set<DateKey>): boolean {
  for (let idx = block.startIndex; idx <= block.endIndex; idx++) {
    if (excluded.has((days[idx] as ClassifiedDay).date)) return true
  }
  return false
}

/**
 * Deterministic recommendation engine: given the same holidays, weekend
 * definition, leave balance, and preferences, it always returns the same
 * ranked list of vacation opportunities. No AI or randomness is involved —
 * an AI layer may later sit on top to re-explain results, never to compute them.
 */
export function createDeterministicRecommendationEngine(): RecommendationEngine {
  return {
    generate(input: RecommendationEngineInput): VacationRecommendation[] {
      const days = classifyYear(input.year, input.holidays, input.weekend)
      const excluded = new Set(input.excludedDates)

      const candidates = [
        ...findLeaveBridgeBlocks(days, input.preferences.maxContinuousLeaveDays),
        ...findSandwichBlocks(days, input.preferences.maxContinuousLeaveDays),
        ...findFreeBlocks(days),
      ].filter(
        (block) =>
          block.leaveIndexes.length <= input.availableLeaveDays &&
          !overlapsExcludedDates(block, days, excluded),
      )

      return candidates
        .map((block) => buildRecommendation(block, days, input))
        .sort((a, b) => b.score - a.score)
    },
  }
}
