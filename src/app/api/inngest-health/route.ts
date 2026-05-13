import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: '/recruitment/api/inngest-health',
    timestamp: new Date().toISOString(),
  });
}

export async function PUT() {
  return NextResponse.json({
    ok: true,
    route: '/recruitment/api/inngest-health',
    method: 'PUT',
    timestamp: new Date().toISOString(),
  });
}
