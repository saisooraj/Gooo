/** Builds the deterministic human-readable name/reason for a recommendation. */

export function buildVacationName(holidayNames: string[], vacationLength: number): string {
  const uniqueNames = Array.from(new Set(holidayNames))
  if (uniqueNames.length === 1) return `${uniqueNames[0]} Long Weekend`
  if (uniqueNames.length > 1) return `${uniqueNames.join(' & ')} Vacation`
  return `${vacationLength}-Day Vacation`
}

function efficiencyLabel(efficiency: number): string {
  if (efficiency >= 3.5) return 'Excellent efficiency.'
  if (efficiency >= 2.5) return 'Great efficiency.'
  if (efficiency >= 2.0) return 'Good efficiency.'
  return 'Fair efficiency.'
}

export function buildVacationReason(
  leaveUsed: number,
  vacationLength: number,
  efficiency: number,
): string {
  const leaveLabel =
    leaveUsed === 0
      ? 'no leave — these days off already line up'
      : leaveUsed === 1
        ? 'only one leave day'
        : `only ${leaveUsed} leave days`
  const dayLabel = vacationLength === 1 ? 'day' : 'days'
  const recommendation = efficiency >= 2 ? 'Recommended.' : 'Consider if the dates work for you.'

  return `Uses ${leaveLabel} for ${vacationLength} consecutive ${dayLabel}. ${efficiencyLabel(
    efficiency,
  )} ${recommendation}`
}
