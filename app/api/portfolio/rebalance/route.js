import { NextResponse } from 'next/server';
import { transaction, execute } from '@/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const { 
      clientId = 1, 
      portfolioValue, 
      totalToBuy, 
      totalToSell, 
      netCashNeeded, 
      items 
    } = data;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'No rebalance items provided' }, { status: 400 });
    }

    const createdAt = new Date().toISOString();

    const sessionResult = await execute(
      `INSERT INTO rebalance_sessions 
       (client_id, created_at, portfolio_value, total_to_buy, total_to_sell, net_cash_needed, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [clientId, createdAt, portfolioValue, totalToBuy, totalToSell, netCashNeeded, 'PENDING']
    );

    const sessionId = sessionResult.lastID;

    const queries = items.map(item => ({
      sql: `INSERT INTO rebalance_items 
            (session_id, fund_id, fund_name, action, amount, current_pct, target_pct, post_rebalance_pct, is_model_fund) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        sessionId,
        item.fund_id,
        item.fund_name,
        item.action,
        item.amount,
        item.current_pct,
        item.target_pct,
        item.target_pct || 0,
        item.target_pct !== null ? 1 : 0
      ]
    }));

    await transaction(queries);

    return NextResponse.json({ 
      success: true, 
      sessionId,
      message: 'Rebalance recommendation saved successfully' 
    });
  } catch (error) {
    console.error('Error saving rebalance session:', error);
    return NextResponse.json({ error: 'Failed to save rebalance recommendation' }, { status: 500 });
  }
}
