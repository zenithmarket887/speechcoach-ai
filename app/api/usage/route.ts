import { NextResponse } from 'next/server'
import { getUsageSummary } from '@/app/lib/usage'

export const dynamic = 'force-dynamic'

export async function GET() {
  const summary = await getUsageSummary()
  return NextResponse.json(summary)
}
