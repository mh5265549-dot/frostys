import React, { useState } from 'react';
import { OrderRecord, MenuItem } from '../../types';
import {
  calculateFinancialSummary,
  getStoredIngredientCosts,
  getStoredExpenses,
} from '../../utils/costAndFinance';

interface FinancialDashboardProps {
  orders: OrderRecord[];
  menuItems: MenuItem[];
  onNavigateToTab?: (tab: string) => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  orders,
  menuItems,
  onNavigateToTab,
}) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all' | 'custom'>('today');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  const costsMap = getStoredIngredientCosts();
  const expenses = getStoredExpenses();

  const summary = calculateFinancialSummary(
    orders,
    timeframe,
    { start: customStart, end: customEnd },
    costsMap,
    expenses
  );

  return (
    <div className="space-y-6 animate-panel-enter">
      {/* 1. Timeframe Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#140D0C] p-4 sm:p-5 rounded-2xl border border-stone-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="font-heading font-black text-lg sm:text-xl text-amber-100">
              Real-Time Financial Dashboard
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Live Profit & Margin
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Tracking revenue, Cost of Goods Sold (COGS), and bottom-line profit margins across Frosty's Ice Cream & Grill.
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['today', 'week', 'month', 'all', 'custom'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {tf === 'today'
                ? "Today's Shift"
                : tf === 'week'
                ? 'This Week'
                : tf === 'month'
                ? 'This Month'
                : tf === 'all'
                ? 'All Time'
                : 'Custom Range'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {timeframe === 'custom' && (
        <div className="p-4 rounded-2xl bg-[#1C1210] border border-amber-500/40 flex flex-col sm:flex-row items-center gap-4 animate-slideDown">
          <div className="flex items-center gap-2 text-xs text-stone-300 font-bold">
            <i className="fa-solid fa-calendar-range text-amber-400"></i>
            <span>Select Custom Date Range:</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-stone-400">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-stone-400">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Top-Line KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Gross Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1E1412] border border-amber-500/40 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <i className="fa-solid fa-wallet text-xs"></i>
              Gross Revenue
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              CASH IN
            </span>
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-amber-300">
            Rs. {summary.grossRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 mt-1.5 flex items-center justify-between">
            <span>{summary.orderCount} completed orders</span>
            {summary.deliveryFeesCollected > 0 && (
              <span className="text-blue-300 font-mono">
                +Rs. {summary.deliveryFeesCollected} Delivery
              </span>
            )}
          </div>
        </div>

        {/* Total Cost of Goods Sold (COGS) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#201518] border border-rose-900/50 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-rose-300 flex items-center gap-1.5">
              <i className="fa-solid fa-boxes-packing text-xs"></i>
              Total COGS (Ingredients)
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              MATERIAL COST
            </span>
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-rose-300">
            Rs. {summary.totalCogs.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 mt-1.5 flex items-center justify-between">
            <span>Raw meat, buns, dairy & packing</span>
            <span className="font-mono text-rose-400">
              {summary.grossRevenue > 0
                ? ((summary.totalCogs / summary.grossRevenue) * 100).toFixed(1)
                : 0}
              % of sales
            </span>
          </div>
        </div>

        {/* Net Profit & Margin % */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#14231b] border border-emerald-500/60 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <i className="fa-solid fa-chart-line text-xs"></i>
              Net Margin / Gross Profit
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              PROFIT
            </span>
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-emerald-300">
            Rs. {summary.netProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-300 mt-1.5 flex items-center justify-between font-bold">
            <span className="text-emerald-400">
              Margin: {summary.profitMarginPercent.toFixed(1)}%
            </span>
            <span className="text-[10px] text-stone-400 font-mono">Revenue - COGS</span>
          </div>
        </div>

        {/* True Net Operating Profit (After Rent, Wages, Power) */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border relative overflow-hidden shadow-md ${
            summary.netOperatingProfit >= 0
              ? 'bg-[#181d29] border-blue-500/50'
              : 'bg-[#291418] border-rose-600/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span
              className={`font-bold flex items-center gap-1.5 ${
                summary.netOperatingProfit >= 0 ? 'text-blue-300' : 'text-rose-300'
              }`}
            >
              <i className="fa-solid fa-scale-balanced text-xs"></i>
              True Operating Profit
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-700">
              BOTTOM LINE
            </span>
          </div>
          <div
            className={`font-heading font-black text-2xl sm:text-3xl ${
              summary.netOperatingProfit >= 0 ? 'text-blue-200' : 'text-rose-300'
            }`}
          >
            Rs. {summary.netOperatingProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 mt-1.5 flex items-center justify-between">
            <span>After Rs. {summary.totalOperatingExpenses.toLocaleString()} Overheads</span>
            <span
              className={`font-mono font-bold ${
                summary.netOperatingProfit >= 0 ? 'text-blue-400' : 'text-rose-400'
              }`}
            >
              {summary.netOperatingMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Category Profit Breakdown: Grill vs Ice Cream */}
      <div className="bg-[#140D0C] p-5 sm:p-6 rounded-3xl border border-stone-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <h4 className="font-heading font-black text-lg text-amber-100 flex items-center gap-2">
              <i className="fa-solid fa-scale-unbalanced-flip text-amber-400"></i>
              <span>Category Profit Breakdown: Grill Items vs. Ice Cream Items</span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Comparative analysis showing revenue, ingredient expenditure, and net profit margins across departments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400">Margin Leader:</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-sky-950 text-sky-300 border border-sky-800">
              🍦 Ice Cream ({summary.iceCream.marginPercent.toFixed(1)}%)
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-orange-950 text-orange-300 border border-orange-800">
              🔥 Grill ({summary.grill.marginPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Side-by-Side Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grill Department */}
          <div className="p-5 rounded-2xl bg-[#1C1210] border border-orange-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-fire"></i>
                </div>
                <div>
                  <h5 className="font-heading font-black text-base text-stone-100">
                    Frosty's Grill Department
                  </h5>
                  <span className="text-[10px] text-stone-400 font-medium">
                    Burgers, Wraps, BBQ, Fries, Tacos & Platters
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-black text-orange-400 block text-lg">
                  {summary.grill.marginPercent.toFixed(1)}%
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-400">Profit Margin</span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-[#241715] border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Grill Revenue</span>
                <span className="font-heading font-black text-sm text-stone-100">
                  Rs. {summary.grill.revenue.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#241715] border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Grill COGS</span>
                <span className="font-heading font-black text-sm text-rose-300">
                  Rs. {summary.grill.cogs.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#241715] border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Grill Profit</span>
                <span className="font-heading font-black text-sm text-emerald-400">
                  Rs. {summary.grill.netProfit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Margin Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-bold mb-1">
                <span>Ingredient Cost Ratio: {(100 - summary.grill.marginPercent).toFixed(1)}%</span>
                <span className="text-orange-400">Net Profit Margin: {summary.grill.marginPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - summary.grill.marginPercent))}%` }}
                  title="COGS Cost"
                ></div>
                <div
                  className="bg-orange-500 h-full"
                  style={{ width: `${Math.min(100, Math.max(0, summary.grill.marginPercent))}%` }}
                  title="Net Profit"
                ></div>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 italic">
              💡 <strong>Insight:</strong> Grill items have higher average ticket revenue per order (e.g. Grilled Chicken Wrap Rs. 700 with Rs. 330 unit profit).
            </p>
          </div>

          {/* Ice Cream Department */}
          <div className="p-5 rounded-2xl bg-[#121B24] border border-sky-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-ice-cream"></i>
                </div>
                <div>
                  <h5 className="font-heading font-black text-base text-stone-100">
                    Frosty's Ice Cream Department
                  </h5>
                  <span className="text-[10px] text-stone-400 font-medium">
                    Waffle Cones, Sundaes, Shakes, Kulfi & Sodas
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-black text-sky-400 block text-lg">
                  {summary.iceCream.marginPercent.toFixed(1)}%
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-400">Profit Margin</span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-[#16232F] border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Ice Cream Rev</span>
                <span className="font-heading font-black text-sm text-stone-100">
                  Rs. {summary.iceCream.revenue.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#16232F] border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Ice Cream COGS</span>
                <span className="font-heading font-black text-sm text-rose-300">
                  Rs. {summary.iceCream.cogs.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#16232F] border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Ice Cream Profit</span>
                <span className="font-heading font-black text-sm text-emerald-400">
                  Rs. {summary.iceCream.netProfit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Margin Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-bold mb-1">
                <span>Ingredient Cost Ratio: {(100 - summary.iceCream.marginPercent).toFixed(1)}%</span>
                <span className="text-sky-400">Net Profit Margin: {summary.iceCream.marginPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - summary.iceCream.marginPercent))}%` }}
                  title="COGS Cost"
                ></div>
                <div
                  className="bg-sky-500 h-full"
                  style={{ width: `${Math.min(100, Math.max(0, summary.iceCream.marginPercent))}%` }}
                  title="Net Profit"
                ></div>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 italic">
              💡 <strong>Insight:</strong> Ice Cream yields exceptional percentage margins (Waffle Cones ~65%, Kulfi ~65%, Soda Chillers ~67.5%).
            </p>
          </div>
        </div>
      </div>

      {/* 4. Order Channel Breakdown & Delivery Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Delivery Orders */}
        <div className="p-4 rounded-2xl bg-[#140D0C] border border-blue-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading font-black text-sm text-blue-300 flex items-center gap-1.5">
              <i className="fa-solid fa-motorcycle text-blue-400"></i>
              <span>Delivery Orders</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-black">
              {summary.orderTypes.delivery.count} Orders
            </span>
          </div>
          <div className="font-heading font-black text-xl text-stone-100">
            Rs. {summary.orderTypes.delivery.revenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 space-y-0.5 pt-1 border-t border-stone-800">
            <div className="flex justify-between">
              <span>Paragon Deliveries (Rs. 100 Fee):</span>
              <span className="font-mono text-amber-300 font-bold">
                {summary.orderTypes.delivery.paragonCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Green City Deliveries (Free):</span>
              <span className="font-mono text-emerald-400 font-bold">
                {summary.orderTypes.delivery.greenCityCount}
              </span>
            </div>
            <div className="flex justify-between font-bold text-emerald-300 pt-0.5">
              <span>Delivery Gross Profit:</span>
              <span className="font-mono">Rs. {summary.orderTypes.delivery.profit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Dine-In Orders */}
        <div className="p-4 rounded-2xl bg-[#140D0C] border border-amber-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading font-black text-sm text-amber-300 flex items-center gap-1.5">
              <i className="fa-solid fa-chair text-amber-400"></i>
              <span>Dine-In (Outdoor Patio)</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black">
              {summary.orderTypes.dinein.count} Orders
            </span>
          </div>
          <div className="font-heading font-black text-xl text-stone-100">
            Rs. {summary.orderTypes.dinein.revenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 space-y-0.5 pt-1 border-t border-stone-800">
            <div className="flex justify-between">
              <span>Estimated Ingredient Cost:</span>
              <span className="font-mono text-rose-300">
                Rs. {summary.orderTypes.dinein.cogs.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-bold text-emerald-300 pt-0.5">
              <span>Dine-In Gross Profit:</span>
              <span className="font-mono">Rs. {summary.orderTypes.dinein.profit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Takeaway Orders */}
        <div className="p-4 rounded-2xl bg-[#140D0C] border border-emerald-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading font-black text-sm text-emerald-300 flex items-center gap-1.5">
              <i className="fa-solid fa-bag-shopping text-emerald-400"></i>
              <span>Takeaway / Pickups</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black">
              {summary.orderTypes.takeaway.count} Orders
            </span>
          </div>
          <div className="font-heading font-black text-xl text-stone-100">
            Rs. {summary.orderTypes.takeaway.revenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 space-y-0.5 pt-1 border-t border-stone-800">
            <div className="flex justify-between">
              <span>Estimated Ingredient Cost:</span>
              <span className="font-mono text-rose-300">
                Rs. {summary.orderTypes.takeaway.cogs.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-bold text-emerald-300 pt-0.5">
              <span>Takeaway Gross Profit:</span>
              <span className="font-mono">Rs. {summary.orderTypes.takeaway.profit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Top Profit Stars & Volume Champions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profit Leaders */}
        <div className="p-5 rounded-2xl bg-[#140D0C] border border-stone-800 space-y-3">
          <h4 className="font-heading font-black text-sm text-amber-200 flex items-center gap-2">
            <i className="fa-solid fa-trophy text-amber-400"></i>
            <span>Top Profit Generating Dishes (PKR)</span>
          </h4>
          <div className="space-y-2">
            {summary.topProfitLeaders.length === 0 ? (
              <p className="text-xs text-stone-500 py-3">No completed orders in this timeframe.</p>
            ) : (
              summary.topProfitLeaders.map((lead, idx) => (
                <div
                  key={lead.id}
                  className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-black text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-stone-100 block">{lead.name}</span>
                      <span className="text-[10px] text-stone-400">
                        {lead.unitsSold} units sold • Rev: Rs. {lead.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-emerald-400 block">
                      +Rs. {lead.profit.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {lead.revenue > 0 ? ((lead.profit / lead.revenue) * 100).toFixed(1) : 0}% margin
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Volume Leaders */}
        <div className="p-5 rounded-2xl bg-[#140D0C] border border-stone-800 space-y-3">
          <h4 className="font-heading font-black text-sm text-sky-200 flex items-center gap-2">
            <i className="fa-solid fa-fire-flame-curved text-sky-400"></i>
            <span>Volume Champions (Most Popular Items)</span>
          </h4>
          <div className="space-y-2">
            {summary.topVolumeLeaders.length === 0 ? (
              <p className="text-xs text-stone-500 py-3">No items sold in this timeframe.</p>
            ) : (
              summary.topVolumeLeaders.map((lead, idx) => (
                <div
                  key={lead.id}
                  className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-black text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-stone-100 block">{lead.name}</span>
                      <span className="text-[10px] text-stone-400">
                        {lead.category === 'grill' ? '🔥 Grill Department' : '🍦 Ice Cream Department'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-sky-300 block">
                      {lead.unitsSold} Orders
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      Rs. {lead.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
