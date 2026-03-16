import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || 1;

    const history = await query(
      `SELECT session_id, client_id, created_at, portfolio_value, total_to_buy, total_to_sell, net_cash_needed, status
       FROM rebalance_sessions
       WHERE client_id = ?
       ORDER BY created_at DESC`,
      [clientId]
    );

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
