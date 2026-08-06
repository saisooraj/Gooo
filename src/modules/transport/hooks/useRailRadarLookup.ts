import { useQuery } from '@tanstack/react-query'
import { fetchStationLookup, fetchTrainLookup } from '../lib/railradar'

const STALE_TIME = 24 * 60 * 60 * 1000

export function useTrainLookup() {
  return useQuery({
    queryKey: ['railradar', 'lookup', 'trains'],
    queryFn: fetchTrainLookup,
    staleTime: STALE_TIME,
  })
}

export function useStationLookup() {
  return useQuery({
    queryKey: ['railradar', 'lookup', 'stations'],
    queryFn: fetchStationLookup,
    staleTime: STALE_TIME,
  })
}
