import React, { useState } from 'react';
import { OrderRecord, CartItem } from '../types';
import { MENU_ITEMS } from '../data/menuData';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  onUpdateStatus: (orderId: string, status: OrderRecord['status']) => void;
  onClearHistory: () => void;
  onAddToCart: (item: any, quantity: number) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateStatus,
  onClearHistory,
  onAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerPhone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const totalOrdersCount = orders.length;

  const handleCopyOrderText = (ord: OrderRecord) => {
    let text = `🛒 *ORDER #${ord.id} SUMMARY*\n`;
    text += `Customer: ${ord.customerName} (${ord.customerPhone})\n`;
    text += `Type: ${ord.orderType.toUpperCase()}\n`;
    if (ord.address) text += `Address: ${ord.address}\n`;
    text += `Items:\n`;
    ord.items.forEach((item, idx) => {
      text += `${idx + 1}. ${item.name} x${item.quantity} = Rs. ${item.price * item.quantity}\n`;
    });
    text += `Total: Rs. ${ord.totalAmount}\n`;
    text += `Status: ${ord.status}`;

    navigator.clipboard.writeText(text);
    setCopiedId(ord.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleReorder = (ord: OrderRecord) => {
    ord.items.forEach((ordItem) => {
      const foundMenuItem = MENU_ITEMS.find((m) => m.id === ordItem.id);
      if (foundMenuItem) {
        onAddToCart(foundMenuItem, ordItem.quantity);
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white text-stone-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#2D1B18] text-white p-5 sm:p-6 flex items-center justify-between gap-4 border-b border-[#3D2522] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FF4B72]/20 border border-[#FF4B72]/40 text-[#FF85A1] flex items-center justify-center text-xl shadow-inner">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
                  Past Orders & Sales History
                </h2>
                <span className="bg-[#38D39F] text-[#2D1B18] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {totalOrdersCount} Total
                </span>
              </div>
              <p className="text-xs text-amber-200/80 font-normal">
                Local log of all customer WhatsApp dessert submissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#3D2522] hover:bg-[#4D302C] text-stone-300 hover:text-white flex items-center justify-center transition-all"
            aria-label="Close order history"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="bg-stone-50 border-b border-stone-200 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <i className="fa-solid fa-money-bill-wave"></i>
            </div>
            <div>
              <span className="text-[10px] uppercase text-stone-400 font-bold block">Total Logged Revenue</span>
              <span className="text-base font-heading font-black text-emerald-700">Rs. {totalRevenue}</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div>
              <span className="text-[10px] uppercase text-stone-400 font-bold block">Total Saved Orders</span>
              <span className="text-base font-heading font-black text-stone-800">{totalOrdersCount} Orders</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-stone-400 font-bold block">Storage Memory</span>
              <span className="text-xs font-bold text-stone-700">Saved in browser</span>
            </div>
            {orders.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all order history logs?')) {
                    onClearHistory();
                  }
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 underline decoration-rose-300"
              >
                Clear All Logs
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-white border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, name, or phone..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
            <span className="text-stone-400 mr-1 hidden sm:inline">Status:</span>
            {['all', 'Received (WhatsApp)', 'Confirmed', 'Preparing', 'Completed', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[#2D1B18] text-white font-bold shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st === 'Received (WhatsApp)' ? 'Received' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="p-10 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-2">
              <i className="fa-solid fa-folder-open text-4xl text-stone-300"></i>
              <p className="text-sm font-semibold text-stone-600">No past orders found</p>
              <p className="text-xs text-stone-400">
                When customer orders are placed via WhatsApp, they automatically save here!
              </p>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-base text-[#2D1B18]">
                      Order #{ord.id}
                    </span>
                    <span className="text-xs text-stone-400 font-semibold">• {ord.timestamp}</span>
                  </div>

                  {/* Status Dropdown / Badge */}
                  <div className="flex items-center gap-2">
                    <select
                      value={ord.status}
                      onChange={(e) => onUpdateStatus(ord.id, e.target.value as OrderRecord['status'])}
                      className={`text-xs font-extrabold px-3 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : ord.status === 'Preparing'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : ord.status === 'Confirmed'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : ord.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : 'bg-purple-50 text-purple-700 border-purple-300'
                      }`}
                    >
                      <option value="Received (WhatsApp)">Received (WhatsApp)</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-400 font-semibold block">Customer</span>
                    <span className="font-bold text-stone-800">{ord.customerName}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-semibold block">Phone</span>
                    <span className="font-bold text-stone-800">{ord.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-semibold block">Type & Address</span>
                    <span className="font-bold text-stone-800 capitalize">
                      {ord.orderType} {ord.address ? `(${ord.address})` : ''}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] uppercase font-bold text-stone-400">Order Items:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-stone-50/80 px-2.5 py-1.5 rounded-lg border border-stone-100"
                      >
                        <span className="font-medium text-stone-800">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-bold text-stone-900">
                          Rs. {item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer line with Total & Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-medium">Total Amount:</span>
                    <span className="font-heading font-black text-lg text-[#2D1B18]">
                      Rs. {ord.totalAmount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleCopyOrderText(ord)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-copy text-xs"></i>
                      <span>{copiedId === ord.id ? 'Copied!' : 'Copy Summary'}</span>
                    </button>

                    <button
                      onClick={() => handleReorder(ord)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <i className="fa-solid fa-cart-plus text-xs"></i>
                      <span>Re-order Items</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-3 text-xs shrink-0">
          <span className="text-stone-500 font-medium">
            Saved locally in browser memory
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D1B18] hover:bg-[#3D2522] text-white font-bold text-xs transition-all shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
