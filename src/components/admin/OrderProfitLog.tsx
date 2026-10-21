import React, { useState } from 'react';
import { OrderRecord, MenuItem } from '../../types';
import { getItemCogsCost, getStoredIngredientCosts } from '../../utils/costAndFinance';

interface OrderProfitLogProps {
  orders: OrderRecord[];
  menuItems: MenuItem[];
  onUpdateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
}

export const OrderProfitLog: React.FC<OrderProfitLogProps> = ({
  orders,
  menuItems,
  onUpdateOrderStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'delivery' | 'dinein' | 'takeaway'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const costsMap = getStoredIngredientCosts();

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (typeFilter !== 'all' && order.orderType !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchId && !matchName && !matchPhone && !matchItem) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-panel-enter">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#140D0C] p-4 sm:p-5 rounded-2xl border border-stone-800">
        <div>
          <h3 className="font-heading font-black text-lg sm:text-xl text-amber-100 flex items-center gap-2">
            <i className="fa-solid fa-receipt text-amber-400"></i>
            <span>Order Breakdown with Live Profit Logging</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Every incoming order calculates both its retail selling price and raw ingredient cost price (COGS) so management tracks exact instant margins on individual transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-black px-3 py-1.5 rounded-xl bg-blue-950 text-blue-300 border border-blue-800">
            {orders.length} Total Orders Recorded
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#140D0C] p-3 rounded-2xl border border-stone-800">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order #ID, customer name, phone, dish..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Order Channel Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-300 focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="delivery">Delivery</option>
            <option value="dinein">Dine-In</option>
            <option value="takeaway">Takeaway</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Received (WhatsApp)">Received</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Preparing">Preparing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List with Itemized Live Profit Breakdown */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#140D0C] border border-stone-800 text-stone-500 text-xs">
            No orders match the selected filters.
          </div>
        ) : (
          filteredOrders.map((ord) => {
            // Calculate this order's exact material cost
            let orderCogs = 0;
            const itemCostBreakdowns = (ord.items || []).map((item) => {
              const unitCost = getItemCogsCost(item.id, item.name, item.price, costsMap);
              const lineCost = unitCost * (item.quantity || 1);
              const lineRevenue = item.price * (item.quantity || 1);
              const lineProfit = lineRevenue - lineCost;
              orderCogs += lineCost;

              return {
                ...item,
                unitCost,
                lineCost,
                lineRevenue,
                lineProfit,
                marginPercent: lineRevenue > 0 ? (lineProfit / lineRevenue) * 100 : 0,
              };
            });

            const orderProfit = Math.max(0, ord.totalAmount - orderCogs);
            const orderMargin = ord.totalAmount > 0 ? (orderProfit / ord.totalAmount) * 100 : 0;
            const isExpanded = expandedOrderId === ord.id;
            const isParagon =
              ord.deliveryZone === 'paragon' || (ord.address || '').toLowerCase().includes('paragon');

            return (
              <div
                key={ord.id}
                className="bg-[#140D0C] rounded-2xl border border-stone-800 overflow-hidden shadow-md hover:border-stone-700 transition-all"
              >
                {/* Order Top Summary Bar */}
                <div className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-[#181110]">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                      className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-700 text-amber-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse order line-items' : 'Expand order line-items'}
                    >
                      <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-amber-400 text-sm">{ord.id}</span>
                        <span className="text-stone-100 font-bold text-xs">{ord.customerName}</span>
                        <span className="text-stone-400 text-[11px] font-mono">({ord.customerPhone})</span>

                        {/* Order Channel Badge */}
                        {ord.orderType === 'delivery' ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-black flex items-center gap-1">
                            <i className="fa-solid fa-motorcycle text-[9px]"></i>
                            <span>Delivery {isParagon ? '(Paragon +Rs. 100)' : '(Green City Free)'}</span>
                          </span>
                        ) : ord.orderType === 'dinein' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black flex items-center gap-1">
                            <i className="fa-solid fa-chair text-[9px]"></i>
                            <span>Dine-In Table</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black flex items-center gap-1">
                            <i className="fa-solid fa-bag-shopping text-[9px]"></i>
                            <span>Takeaway</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                        <span>{ord.timestamp}</span>
                        {ord.address && <span>• {ord.address}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics for this Order */}
                  <div className="flex items-center gap-4 self-end lg:self-center flex-wrap">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Revenue</span>
                      <span className="font-mono font-black text-amber-300 text-sm">
                        Rs. {ord.totalAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Cost (COGS)</span>
                      <span className="font-mono font-bold text-rose-300 text-sm">
                        Rs. {orderCogs.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Instant Profit</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-black text-emerald-400 text-base">
                          Rs. {orderProfit.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {orderMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Order Status Selector */}
                    <select
                      value={ord.status}
                      onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderRecord['status'])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider focus:outline-none cursor-pointer border ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : ord.status === 'Preparing'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : ord.status === 'Confirmed'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : ord.status === 'Cancelled'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-stone-800 text-stone-200 border-stone-700'
                      }`}
                    >
                      <option value="Received (WhatsApp)">Received</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Line Items Breakdown (Always visible or toggleable) */}
                {isExpanded && (
                  <div className="p-4 bg-[#140D0C] border-t border-stone-800/80 space-y-2.5 animate-slideDown">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                      Itemized Recipe Cost & Line Profit Breakdown
                    </span>

                    <div className="divide-y divide-stone-800/50">
                      {itemCostBreakdowns.map((it, idx) => (
                        <div
                          key={idx}
                          className="py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 text-[11px]">
                              {it.quantity}x
                            </span>
                            <span className="font-bold text-stone-100">{it.name}</span>
                            {it.customizationsText && (
                              <span className="text-[10px] text-stone-400 italic">
                                ({it.customizationsText})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs self-end sm:self-center">
                            <span className="text-stone-400">
                              Selling: <strong className="font-mono text-stone-100">Rs. {it.lineRevenue}</strong>
                            </span>
                            <span className="text-stone-400">
                              Cost: <strong className="font-mono text-rose-300">Rs. {it.lineCost}</strong>
                            </span>
                            <span className="text-emerald-400 font-bold font-mono">
                              Profit: +Rs. {it.lineProfit} ({it.marginPercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {ord.notes && (
                      <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 text-xs">
                        <strong className="text-amber-400">Customer Note:</strong> {ord.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
