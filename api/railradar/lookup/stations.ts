import type { VercelRequest, VercelResponse } from '@vercel/node'

/** Flat `{ code: name }` map of all stations, proxied to keep RAIL_RADAR_API_KEY server-side. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const upstream = await fetch('https://api.railradar.in/v1/lookup/stations', {
    headers: { Authorization: `Bearer ${process.env.RAIL_RADAR_API_KEY}` },
  })
  const data = await upstream.json()

  // Cached at the edge for a day — the lookup map changes rarely, and the free
  // tier is 50 req/day, so this keeps real upstream calls to a handful/day.
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=43200')
  res.status(upstream.status).json(data)
}
