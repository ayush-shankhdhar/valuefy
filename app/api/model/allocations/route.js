import { NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';

export async function GET() {
  try {
    const modelFunds = await query(
      `SELECT fund_id, fund_name, asset_class, allocation_pct 
       FROM model_funds 
       ORDER BY asset_class, fund_name`
    );

    return NextResponse.json({ modelFunds });
  } catch (error) {
    console.error('Error fetching model funds:', error);
    return NextResponse.json({ error: 'Failed to fetch model funds' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { updates } = await request.json();
    
    // Validate inputs
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Invalid updates format' }, { status: 400 });
    }

    // Verify sum is exactly 100%
    const totalAllocation = updates.reduce((sum, fund) => sum + Number(fund.allocation_pct), 0);
    
    if (Math.abs(totalAllocation - 100) > 0.01) {
      return NextResponse.json(
        { error: `Total allocation must be exactly 100%. Current total is ${totalAllocation.toFixed(2)}%` },
        { status: 400 }
      );
    }

    // Prepare transaction queries
    const queries = updates.map(fund => ({
      sql: 'UPDATE model_funds SET allocation_pct = ? WHERE fund_id = ?',
      params: [fund.allocation_pct, fund.fund_id]
    }));

    await transaction(queries);

    return NextResponse.json({ success: true, message: 'Model allocations updated successfully' });
  } catch (error) {
    console.error('Error updating model funds:', error);
    return NextResponse.json({ error: 'Failed to update model funds' }, { status: 500 });
  }
}
