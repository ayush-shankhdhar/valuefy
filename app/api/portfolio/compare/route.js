import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || 1;
    const clientHoldings = await query(
      `SELECT fund_id, fund_name, current_value FROM client_holdings WHERE client_id = ?`,
      [clientId]
    );

    const modelFunds = await query(
      `SELECT fund_id, fund_name, asset_class, allocation_pct FROM model_funds`
    );

    let totalPortfolioValue = 0;
    const holdingsMap = new Map();

    for (const holding of clientHoldings) {
      totalPortfolioValue += holding.current_value;
      holdingsMap.set(holding.fund_id, holding);
    }

    const modelMap = new Map();
    for (const model of modelFunds) {
      modelMap.set(model.fund_id, model);
    }

    // Combine all funds from both holdings and model
    const combinedFundIds = new Set([...holdingsMap.keys(), ...modelMap.keys()]);

    let totalBuy = 0;
    let totalSell = 0;
    const items = [];

    for (const fundId of combinedFundIds) {
      const holding = holdingsMap.get(fundId);
      const model = modelMap.get(fundId);

      const fund_name = holding ? holding.fund_name : model.fund_name;
      const current_value = holding ? holding.current_value : 0;

      let current_pct = 0;
      if (totalPortfolioValue > 0) {
        current_pct = (current_value / totalPortfolioValue) * 100;
      }

      let target_pct = null;
      let drift = null;
      let action = 'REVIEW';
      let amount = 0;

      if (model) {
        target_pct = model.allocation_pct;
        drift = target_pct - current_pct;
        amount = (drift * totalPortfolioValue) / 100;

        if (drift > 0.01) {
          action = 'BUY';
          totalBuy += amount;
        } else if (drift < -0.01) {
          action = 'SELL';
          totalSell += Math.abs(amount);
        } else {
          action = 'OK';
        }
      } else {
        action = 'REVIEW';
      }

      items.push({
        fund_id: fundId,
        fund_name,
        current_value,
        current_pct: Number(current_pct.toFixed(2)),
        target_pct: target_pct !== null ? Number(target_pct.toFixed(2)) : null,
        drift: drift !== null ? Number(drift.toFixed(2)) : null,
        action,
        amount: Math.abs(Number(amount.toFixed(2)))
      });
    }

    const freshMoneyNeeded = Math.max(0, totalBuy - totalSell);

    return NextResponse.json({
      clientId,
      totalPortfolioValue,
      totalBuy: Number(totalBuy.toFixed(2)),
      totalSell: Number(totalSell.toFixed(2)),
      freshMoneyNeeded: Number(freshMoneyNeeded.toFixed(2)),
      items: items.sort((a, b) => b.amount - a.amount || a.fund_name.localeCompare(b.fund_name)),
    });
  } catch (error) {
    console.error('Error fetching portfolio compare:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 });
  }
}
