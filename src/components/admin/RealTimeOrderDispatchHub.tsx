import React, { useState } from 'react';
import { OrderRecord } from '../../types';
import { isItemAllowedForDelivery } from '../../utils/operationalStore';
import { STORE_INFO } from '../../data/menuData';

interface RealTimeOrderDispatchHubProps {
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
  isStaffMode?: boolean;
}

export const RealTimeOrderDispatchHub: React.FC<RealTimeOrderDispatchHubProps> = ({
  orders,
  onUpdateOrderStatus,
  isStaffMode = false,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Group and filter orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'active') {
      if (order.status === 'Completed' || order.status === 'Cancelled') return false;
    } else if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchCustomer = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchId && !matchCustomer && !matchPhone && !matchItem) return false;
    }

    return true;
  });

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // WhatsApp Automated Customer Notification Quick-Action
  const sendWhatsAppUpdate = (order: OrderRecord, updateType: 'confirmed' | 'prep' | 'ready' | 'delivery' | 'completed') => {
    let message = '';
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCode = cleanPhone.startsWith('92')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? '92' + cleanPhone.substring(1)
      : '92' + cleanPhone;

    switch (updateType) {
      case 'confirmed':
        message = `*Frosty's & Grill Order Update* 🍦\n\nSalam *${order.customerName}*!\nYour Order *#${order.id}* has been confirmed by our kitchen.\nTotal: Rs. ${order.totalAmount}\nFulfillment: ${order.orderType.toUpperCase()}${order.address ? ` (${order.address})` : ''}\n\nOur kitchen and scoop station have started packing your order!`;
        break;
      case 'prep':
        message = `*Frosty's Kitchen Update* 👨‍🍳🔥\n\nSalam *${order.customerName}*!\nYour Order *#${order.id}* is currently in scoop prep & grill searing. We ensure your ice creams stay chilled and grill items stay piping hot!`;
        break;
      case 'ready':
        message = `*Frosty's Order Ready for Pickup!* 🛍️\n\nSalam *${order.customerName}*!\nYour Order *#${order.id}* is freshly prepared and packed. Please pick it up at our Green City counter.\nStore location: ${STORE_INFO.address}`;
        break;
      case 'delivery':
        message = `*Frosty's Order Out for Delivery!* 🛵💨\n\nSalam *${order.customerName}*!\nYour Order *#${order.id}* is packed in insulated boxes and our rider is on the way to *${order.address || order.deliveryZone || 'your location'}*.\nPlease keep Rs. ${order.totalAmount} ready in cash. Enjoy your meal!`;
        break;
      case 'completed':
        message = `*Thank you for choosing Frosty's!* 🌟\n\nSalam *${order.customerName}*!\nOrder *#${order.id}* is completed. We hope you enjoyed your desserts and grill dishes! Have feedback? Let us know on WhatsApp.`;
        break;
    }

    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
    try {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.location.href = url;
    }
    showToast(`WhatsApp message opened for ${order.customerName}!`);
  };

  // Check for melting delivery violations
  const getDeliveryViolations = (order: OrderRecord) => {
    if (order.orderType !== 'delivery') return [];
    return order.items.filter((item) => {
      return !isItemAllowedForDelivery(item.id, item.name, (item as any).selectedContainer);
    });
  };

  return (
    <div className="space-y-6 animate-panel-enter">
      {/* Notification Toast */}
      {notificationToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <i className="fa-solid fa-circle-check text-sm"></i>
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Header & Quick Filter Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#140D0C] p-4 sm:p-5 rounded-2xl border border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="font-heading font-black text-lg sm:text-xl text-amber-100 flex items-center gap-2">
              <i className="fa-solid fa-bell-concierge text-amber-400"></i>
              <span>Live Orders & Kitchen Queue</span>
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Live Stream
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Live orders from dine-in, takeaway, and delivery. Update prep status and click WhatsApp buttons to notify customers.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <i className="fa-solid fa-fire text-amber-400"></i>
            <span>{orders.filter((o) => o.status === 'Preparing' || o.status === 'Confirmed').length} In Kitchen</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <i className="fa-solid fa-motorcycle text-blue-400"></i>
            <span>{orders.filter((o) => o.orderType === 'delivery' && o.status !== 'Completed').length} Deliveries</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#140D0C] p-3 rounded-2xl border border-stone-800">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active ticket #ID, customer phone, dish..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Queue Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'active', label: 'Active Queue', icon: 'fa-stream' },
            { id: 'Received (WhatsApp)', label: 'New Incoming', icon: 'fa-inbox' },
            { id: 'Confirmed', label: 'Confirmed', icon: 'fa-check' },
            { id: 'Preparing', label: 'In Kitchen Prep', icon: 'fa-fire-burner' },
            { id: 'Completed', label: 'Completed', icon: 'fa-circle-check' },
            { id: 'all', label: 'All Orders', icon: 'fa-list-check' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
              <span>{tab.label}</span>
              {tab.id === 'active' && (
                <span className="text-[10px] px-1.5 rounded-full bg-stone-950 text-amber-300 font-mono">
                  {orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Orders Queue Stream */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#140D0C] border border-stone-800 text-stone-400 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-check-double"></i>
            </div>
            <p className="text-sm font-bold text-stone-300">No active orders in this queue</p>
            <p className="text-xs text-stone-500">All incoming online orders will stream here automatically.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const violations = getDeliveryViolations(ord);
            const isDelivery = ord.orderType === 'delivery';
            const isParagon =
              ord.deliveryZone === 'paragon' || (ord.address || '').toLowerCase().includes('paragon');
            const isGreenCity =
              ord.deliveryZone === 'greencity' || (ord.address || '').toLowerCase().includes('green city');

            return (
              <div
                key={ord.id}
                className={`bg-[#140D0C] rounded-2xl border transition-all overflow-hidden shadow-lg ${
                  violations.length > 0
                    ? 'border-rose-500/80 ring-1 ring-rose-500/30'
                    : ord.status === 'Preparing'
                    ? 'border-amber-500/70'
                    : 'border-stone-800'
                }`}
              >
                {/* Delivery Restriction Violation Warning Header */}
                {violations.length > 0 && (
                  <div className="bg-gradient-to-r from-rose-950 via-red-950 to-rose-900 p-3 px-4 text-xs text-rose-200 border-b border-rose-800 flex items-center justify-between gap-3 animate-pulse">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-triangle-exclamation text-rose-400 text-base"></i>
                      <div>
                        <strong className="text-white uppercase font-black tracking-wider">
                          MELTING RISK DELIVERY VIOLATION!
                        </strong>
                        <span className="block text-[11px] text-rose-300">
                          Order contains {violations.map((v) => `"${v.name}"`).join(', ')} scheduled for Delivery. Cones melt during rider transit; recommend packing in an insulated tub/cup!
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => sendWhatsAppUpdate(ord, 'prep')}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shrink-0 cursor-pointer shadow"
                    >
                      Notify Customer
                    </button>
                  </div>
                )}

                {/* Ticket Top Bar */}
                <div className="p-4 bg-[#181110] border-b border-stone-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-400 text-base">
                        #{ord.id}
                      </span>
                      <span className="font-bold text-stone-100 text-sm">
                        {ord.customerName}
                      </span>
                      <a
                        href={`tel:${ord.customerPhone}`}
                        className="text-stone-400 hover:text-amber-300 text-xs font-mono flex items-center gap-1 transition-colors"
                      >
                        <i className="fa-solid fa-phone text-[10px]"></i>
                        <span>{ord.customerPhone}</span>
                      </a>
                    </div>

                    {/* Fulfillment Type Badges */}
                    {isDelivery ? (
                      <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-black flex items-center gap-1.5">
                        <i className="fa-solid fa-motorcycle text-[10px]"></i>
                        <span>
                          Delivery • {isParagon ? 'Paragon City (+Rs. 100)' : isGreenCity ? 'Green City (FREE)' : 'Local Area'}
                        </span>
                      </span>
                    ) : ord.orderType === 'dinein' ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black flex items-center gap-1.5">
                        <i className="fa-solid fa-chair text-[10px]"></i>
                        <span>Dine-In • Outdoor Patio</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black flex items-center gap-1.5">
                        <i className="fa-solid fa-bag-shopping text-[10px]"></i>
                        <span>Takeaway / Counter Pickup</span>
                      </span>
                    )}

                    <span className="text-[11px] text-stone-500 font-mono">
                      {ord.timestamp}
                    </span>
                  </div>

                  {/* Status Controller */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <span className="text-xs text-stone-400 font-bold">Status:</span>
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
                          : 'bg-stone-900 text-stone-300 border-stone-700'
                      }`}
                    >
                      <option value="Received (WhatsApp)">Received (WhatsApp)</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">In Kitchen / Scoop Prep</option>
                      <option value="Completed">Completed / Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Ticket Body: Item List with Preparation Checkboxes */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left 2 Cols: Item checklist */}
                  <div className="md:col-span-2 space-y-2.5">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                      Kitchen & Scoop Checklist:
                    </span>
                    <div className="space-y-1.5">
                      {ord.items.map((item, idx) => {
                        const checkKey = `${ord.id}-${idx}`;
                        const isDone = checkedItems[checkKey] || false;
                        const isMeltingRisk = !isItemAllowedForDelivery(
                          item.id,
                          item.name,
                          (item as any).selectedContainer
                        ) && isDelivery;

                        return (
                          <div
                            key={idx}
                            onClick={() => toggleItemCheck(ord.id, idx)}
                            className={`p-2.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                              isDone
                                ? 'bg-emerald-950/20 border-emerald-900/40 text-stone-400 line-through'
                                : isMeltingRisk
                                ? 'bg-rose-950/30 border-rose-800/80'
                                : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => {}}
                              className="mt-0.5 accent-amber-500 rounded cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-xs">
                                <span className={`font-bold ${isDone ? 'text-stone-400' : 'text-stone-100'}`}>
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="font-mono text-amber-300 font-bold">
                                  Rs. {item.price * item.quantity}
                                </span>
                              </div>
                              {item.customizationsText && (
                                <p className="text-[11px] text-stone-400 mt-0.5 italic">
                                  {item.customizationsText}
                                </p>
                              )}
                              {isMeltingRisk && (
                                <span className="inline-block mt-1 text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                                  ⚠️ High Melting Risk for Delivery!
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Notes / Address */}
                    {(ord.address || ord.notes) && (
                      <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs text-stone-300">
                        {ord.address && (
                          <div className="flex items-center gap-1.5 text-stone-300">
                            <i className="fa-solid fa-location-dot text-amber-400 text-xs"></i>
                            <span>Address: {ord.address}</span>
                          </div>
                        )}
                        {ord.notes && (
                          <div className="flex items-center gap-1.5 text-amber-200/90 mt-1">
                            <i className="fa-solid fa-message text-amber-400 text-xs"></i>
                            <span>Instructions: "{ord.notes}"</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Col: WhatsApp Automated Quick-Actions & Total */}
                  <div className="p-3.5 rounded-2xl bg-[#1C1210] border border-stone-800 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                        Total Order Amount:
                      </span>
                      <div className="font-heading font-black text-2xl text-amber-300">
                        Rs. {ord.totalAmount.toLocaleString()}
                      </div>
                      {ord.deliveryFee && ord.deliveryFee > 0 ? (
                        <span className="text-[11px] text-blue-300 block font-mono">
                          Includes Rs. {ord.deliveryFee} delivery charges
                        </span>
                      ) : null}
                    </div>

                    {/* Automated WhatsApp Dispatch Buttons */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-800">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        WhatsApp 1-Click Customer Dispatches:
                      </span>

                      <button
                        type="button"
                        onClick={() => sendWhatsAppUpdate(ord, 'confirmed')}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-700/50 text-[11px] font-bold flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <i className="fa-brands fa-whatsapp text-emerald-400 text-xs"></i>
                          <span>Order Confirmed</span>
                        </span>
                        <i className="fa-solid fa-paper-plane text-[10px]"></i>
                      </button>

                      <button
                        type="button"
                        onClick={() => sendWhatsAppUpdate(ord, 'prep')}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-700/50 text-[11px] font-bold flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <i className="fa-brands fa-whatsapp text-emerald-400 text-xs"></i>
                          <span>In Scoop Prep</span>
                        </span>
                        <i className="fa-solid fa-fire-burner text-[10px]"></i>
                      </button>

                      {isDelivery ? (
                        <button
                          type="button"
                          onClick={() => {
                            sendWhatsAppUpdate(ord, 'delivery');
                            onUpdateOrderStatus(ord.id, 'Preparing');
                          }}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50 text-[11px] font-bold flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <i className="fa-brands fa-whatsapp text-emerald-400 text-xs"></i>
                            <span>Out for Delivery</span>
                          </span>
                          <i className="fa-solid fa-motorcycle text-[10px]"></i>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendWhatsAppUpdate(ord, 'ready')}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50 text-[11px] font-bold flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <i className="fa-brands fa-whatsapp text-emerald-400 text-xs"></i>
                            <span>Ready for Pickup</span>
                          </span>
                          <i className="fa-solid fa-bag-shopping text-[10px]"></i>
                        </button>
                      )}

                      {ord.status !== 'Completed' && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateOrderStatus(ord.id, 'Completed');
                            sendWhatsAppUpdate(ord, 'completed');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-1"
                        >
                          <i className="fa-solid fa-check-double text-xs"></i>
                          <span>Mark Ticket Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
