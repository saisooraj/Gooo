/** Deterministic accent per leave type name, cycling through the design system's accent tokens. */
const PALETTE = [
  { hex: '#F0EDE8', text: 'text-t1' },
  { hex: '#7EB8F7', text: 'text-blue' },
  { hex: '#4ECBA0', text: 'text-green' },
  { hex: '#C4A6FF', text: 'text-purple' },
  { hex: '#F2844A', text: 'text-orange' },
] as const

function hash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function leaveTypeColor(leaveType: string): { hex: string; text: string } {
  return PALETTE[hash(leaveType) % PALETTE.length] ?? PALETTE[0]
}
