import React, { useState } from 'react';
import { OrderRecord } from '../../types';
import { isItemAllowedForDelivery } from '../../utils/operationalStore';

interface KitchenStaffDispatchViewProps {
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
  onExitStaffMode?: () => void;
}

export const KitchenStaffDispatchView: React.FC<KitchenStaffDispatchViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onExitStaffMode,
}) => {
  const [filterStation, setFilterStation] = useState<'all' | 'ice-cream' | 'grill'>('all');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Active kitchen tickets (non-completed, non-cancelled)
  const activeOrders = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled');

  const toggleCheck = (orderId: string, idx: number) => {
    const key = `${orderId}-${idx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4 font-sans animate-panel-enter">
      {/* Staff View Mode Top Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border-2 border-blue-500/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg">
            <i className="fa-solid fa-kitchen-set"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-black text-xl text-white">
                Kitchen & Counter Dispatch Screen
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/40">
                Staff View
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              High-contrast, distraction-free order tickets for kitchen chefs, scoopers, and counter dispatchers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Station Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setFilterStation('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                filterStation === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Stations ({activeOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStation('ice-cream')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                filterStation === 'ice-cream'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🍦 Ice Cream Station
            </button>
            <button
              type="button"
              onClick={() => setFilterStation('grill')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                filterStation === 'grill'
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔥 Grill Station
            </button>
          </div>

          {onExitStaffMode && (
            <button
              type="button"
              onClick={onExitStaffMode}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-arrow-right-from-bracket mr-1.5"></i>
              <span>Back to Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Orders Dispatch Grid */}
      {activeOrders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#0F172A] border border-slate-800 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
            <i className="fa-solid fa-check"></i>
          </div>
          <h3 className="font-heading font-black text-xl text-white">All Orders Dispatched!</h3>
          <p className="text-sm text-slate-400">All kitchen prep and counter pickup orders have been served.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeOrders.map((ord) => {
            const isDelivery = ord.orderType === 'delivery';
            const isParagon =
              ord.deliveryZone === 'paragon' || (ord.address || '').toLowerCase().includes('paragon');

            // Scan items for melting violations
            const meltingViolations = ord.items.filter((item) => {
              return isDelivery && !isItemAllowedForDelivery(item.id, item.name, (item as any).selectedContainer);
            });

            return (
              <div
                key={ord.id}
                className={`rounded-3xl border-2 overflow-hidden shadow-2xl flex flex-col justify-between transition-all ${
                  meltingViolations.length > 0
                    ? 'bg-[#1e1313] border-rose-500'
                    : ord.status === 'Preparing'
                    ? 'bg-[#172033] border-blue-500'
                    : 'bg-[#111827] border-slate-700'
                }`}
              >
                {/* Melting Violation Banner */}
                {meltingViolations.length > 0 && (
                  <div className="bg-rose-600 px-4 py-2 text-white font-black text-xs flex items-center justify-between animate-pulse">
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      <span>MELTING CONE ALERT: Pack in insulated cup for rider!</span>
                    </span>
                    <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded">Rider Transit</span>
                  </div>
                )}

                {/* Card Header: Ticket Number & Channel */}
                <div className="p-4 bg-black/30 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-2xl text-amber-400">
                      #{ord.id}
                    </span>
                    <div>
                      <h4 className="font-heading font-black text-lg text-white">
                        {ord.customerName}
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        {ord.customerPhone}
                      </span>
                    </div>
                  </div>

                  {/* Channel Tag */}
                  {isDelivery ? (
                    <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow">
                      <i className="fa-solid fa-motorcycle text-sm"></i>
                      <span>Delivery {isParagon ? '(Paragon)' : '(Green City)'}</span>
                    </span>
                  ) : ord.orderType === 'dinein' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow">
                      <i className="fa-solid fa-chair text-sm"></i>
                      <span>Dine-In Patio</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow">
                      <i className="fa-solid fa-bag-shopping text-sm"></i>
                      <span>Counter Takeaway</span>
                    </span>
                  )}
                </div>

                {/* Items Checklist (Large Touch Targets) */}
                <div className="p-4 space-y-2 flex-1">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-2">
                    Items to Prepare & Pack:
                  </span>

                  <div className="space-y-2">
                    {ord.items.map((item, idx) => {
                      const checkKey = `${ord.id}-${idx}`;
                      const isDone = checkedItems[checkKey] || false;
                      const isGrill =
                        item.name.toLowerCase().includes('burger') ||
                        item.name.toLowerCase().includes('wrap') ||
                        item.name.toLowerCase().includes('bbq') ||
                        item.name.toLowerCase().includes('fries') ||
                        item.name.toLowerCase().includes('tikka');

                      if (filterStation === 'ice-cream' && isGrill) return null;
                      if (filterStation === 'grill' && !isGrill) return null;

                      return (
                        <div
                          key={idx}
                          onClick={() => toggleCheck(ord.id, idx)}
                          className={`p-3 rounded-2xl border-2 flex items-start gap-3.5 cursor-pointer transition-all ${
                            isDone
                              ? 'bg-slate-900/60 border-slate-800 text-slate-500 line-through opacity-70'
                              : isGrill
                              ? 'bg-orange-950/30 border-orange-800/80 hover:border-orange-500'
                              : 'bg-sky-950/30 border-sky-800/80 hover:border-sky-500'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                              isDone ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-950'
                            }`}
                          >
                            {isDone ? <i className="fa-solid fa-check"></i> : `${item.quantity}x`}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-base">
                              <span className={`font-black ${isDone ? 'text-slate-500' : 'text-white'}`}>
                                {item.name}
                              </span>
                              <span className="text-xs font-mono text-slate-400">
                                Rs. {item.price * item.quantity}
                              </span>
                            </div>
                            {item.customizationsText && (
                              <p className="text-xs text-amber-300 font-semibold mt-0.5">
                                ⭐ {item.customizationsText}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {ord.notes && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-bold">
                      Customer Note: "{ord.notes}"
                    </div>
                  )}

                  {ord.address && (
                    <div className="mt-2 text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                      <i className="fa-solid fa-location-dot text-amber-400"></i>
                      <span>Delivery To: {ord.address}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Touch Actions: Progress status */}
                <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Order Value</span>
                    <span className="font-heading font-black text-xl text-amber-300">
                      Rs. {ord.totalAmount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ord.status !== 'Preparing' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(ord.id, 'Preparing')}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                      >
                        <i className="fa-solid fa-fire-burner"></i>
                        <span>Start Prep</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(ord.id, 'Completed')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 cursor-pointer"
                    >
                      <i className="fa-solid fa-circle-check"></i>
                      <span>{isDelivery ? 'Dispatched / Done' : 'Picked Up / Done'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
