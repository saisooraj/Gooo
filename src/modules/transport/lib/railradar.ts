/** number → name */
export type TrainLookup = Record<string, string>
/** code → name */
export type StationLookup = Record<string, string>

export async function fetchTrainLookup(): Promise<TrainLookup> {
  const res = await fetch('/api/railradar/lookup/trains')
  if (!res.ok) throw new Error('Failed to fetch train lookup')
  const body = await res.json()
  return body.data as TrainLookup
}

export async function fetchStationLookup(): Promise<StationLookup> {
  const res = await fetch('/api/railradar/lookup/stations')
  if (!res.ok) throw new Error('Failed to fetch station lookup')
  const body = await res.json()
  return body.data as StationLookup
}
