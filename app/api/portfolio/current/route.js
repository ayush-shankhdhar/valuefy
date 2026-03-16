import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || 1; // Default to Amit Sharma

    const clientHoldings = await query(
      `SELECT holding_id, client_id, fund_id, fund_name, current_value 
       FROM client_holdings 
       WHERE client_id = ?`,
      [clientId]
    );

    let totalPortfolioValue = 0;
    for (const holding of clientHoldings) {
      totalPortfolioValue += holding.current_value;
    }

    return NextResponse.json({
      clientId,
      totalPortfolioValue,
      holdings: clientHoldings
    });
  } catch (error) {
    console.error('Error fetching current portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch current portfolio' }, { status: 500 });
  }
}
