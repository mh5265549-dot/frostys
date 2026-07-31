import React, { useState } from 'react';
import { MenuItem, OrderRecord } from '../types';
import { getStoredAdminPin, saveAdminPin } from '../utils/menuStore';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onUpdateMenuItem: (updatedItem: MenuItem) => void;
  onResetMenu: () => void;
  inventory: { [itemId: string]: number };
  onUpdateStock: (itemId: string, newStock: number) => void;
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  onUpdateMenuItem,
  onResetMenu,
  inventory,
  onUpdateStock,
  orders,
  onUpdateOrderStatus,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinHint, setShowPinHint] = useState(false);

  // PIN Change State
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'inventory' | 'orders'>('overview');

  // Search & Filters inside Admin
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Editing Item state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  if (!isOpen) return null;

  // Handle Owner Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getStoredAdminPin();
    if (pinInput.trim() === correctPin) {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect PIN. Default PIN is 1234.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
  };

  // Handle PIN Update
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      setPinChangeMsg('PIN must be at least 4 digits/characters.');
      return;
    }
    saveAdminPin(newPin.trim());
    setPinChangeMsg('✅ Admin PIN updated successfully!');
    setNewPin('');
    setTimeout(() => {
      setIsChangingPin(false);
      setPinChangeMsg('');
    }, 1500);
  };

  // Metric Calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockItems = menuItems.filter((i) => {
    const stock = inventory[i.id] ?? 15;
    return stock > 0 && stock <= 5;
  });

  const outOfStockItems = menuItems.filter((i) => (inventory[i.id] ?? 15) <= 0);

  // Bulk Restock
  const handleRestockAll = () => {
    if (window.confirm('Restock all menu items to 15 units?')) {
      menuItems.forEach((item) => {
        onUpdateStock(item.id, 15);
      });
    }
  };

  // Save edited menu item
  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateMenuItem(editingItem);
      setEditingItem(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#2D1B18] text-stone-100 w-full max-w-5xl rounded-3xl border border-[#52332E] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-[#211311] border-b border-[#3D2522] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF4B72] to-amber-500 flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-[#fa-shield-halved] fa-shield-halved text-lg"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-xl text-amber-50 tracking-wide">
                  Frosty's Owner Dashboard
                </h2>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                  <i className="fa-solid fa-crown text-[9px] mr-1"></i> Admin
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Manage item prices, stock inventory, and customer orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setIsChangingPin(!isChangingPin)}
                  className="px-3 py-1.5 rounded-xl bg-[#3D2522] hover:bg-[#4D302C] text-stone-300 hover:text-white text-xs font-semibold transition-colors border border-[#52332E] hidden sm:flex items-center gap-1.5"
                  title="Change Owner PIN"
                >
                  <i className="fa-solid fa-key text-amber-400"></i>
                  <span>Change PIN</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-950 text-rose-300 text-xs font-semibold transition-colors border border-rose-900/50 flex items-center gap-1.5"
                  title="Lock Dashboard"
                >
                  <i className="fa-solid fa-lock text-rose-400"></i>
                  <span className="hidden sm:inline">Lock</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#3D2522] hover:bg-[#4D302C] text-stone-300 hover:text-white transition-colors flex items-center justify-center"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* PIN LOGIN SCREEN IF NOT AUTHENTICATED */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center my-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#3D2522] border border-[#52332E] flex items-center justify-center text-amber-400 text-2xl shadow-inner">
              <i className="fa-solid fa-user-shield"></i>
            </div>

            <div className="max-w-sm">
              <h3 className="font-heading font-bold text-2xl text-amber-100">
                Owner PIN Required
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Enter your secure owner PIN to access live price updates, stock inventory, and past orders.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={10}
                  autoFocus
                  className="w-full text-center tracking-[0.5em] text-xl font-mono font-bold py-3.5 px-4 rounded-2xl bg-[#211311] border border-[#52332E] text-amber-300 placeholder:text-stone-600 focus:outline-none focus:border-[#FF4B72] focus:ring-2 focus:ring-[#FF4B72]/20"
                />
              </div>

              {pinError && (
                <p className="text-xs font-bold text-rose-400 animate-pulse">
                  <i className="fa-solid fa-triangle-exclamation mr-1"></i> {pinError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF4B72] to-[#E63956] hover:from-[#E63956] hover:to-[#C92A43] text-white font-bold text-sm shadow-lg transition-all"
              >
                Unlock Admin Panel
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinHint(!showPinHint)}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  {showPinHint ? 'Hide Default PIN Hint' : '🔑 Need Demo PIN?'}
                </button>
                {showPinHint && (
                  <p className="text-[11px] text-stone-400 mt-1.5 bg-[#211311] p-2.5 rounded-xl border border-[#3D2522]">
                    Default PIN: <span className="font-mono font-bold text-amber-300">1234</span>
                  </p>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN PANEL */
          <div className="flex-1 overflow-y-auto flex flex-col">
            
            {/* PIN Change Sub-modal / Notification */}
            {isChangingPin && (
              <div className="p-4 bg-[#211311] border-b border-[#3D2522] animate-slideDown">
                <form onSubmit={handleSaveNewPin} className="max-w-md mx-auto flex items-center gap-3">
                  <input
                    type="text"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter new 4-digit PIN (e.g. 8888)"
                    className="flex-1 px-4 py-2 rounded-xl bg-[#2D1B18] border border-[#52332E] text-xs font-mono text-amber-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-extrabold text-xs"
                  >
                    Save PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPin(false)}
                    className="px-3 py-2 rounded-xl bg-[#3D2522] text-stone-400 text-xs hover:text-white"
                  >
                    Cancel
                  </button>
                </form>
                {pinChangeMsg && (
                  <p className="text-center text-xs font-bold text-amber-400 mt-2">
                    {pinChangeMsg}
                  </p>
                )}
              </div>
            )}

            {/* Admin Metric Cards Bar */}
            <div className="p-4 sm:p-6 bg-[#211311]/60 border-b border-[#3D2522] grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#2D1B18] p-3.5 sm:p-4 rounded-2xl border border-[#52332E]">
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span>Total Revenue</span>
                  <i className="fa-solid fa-coins text-amber-400"></i>
                </div>
                <div className="font-heading font-black text-xl sm:text-2xl text-amber-300">
                  Rs. {totalRevenue.toLocaleString()}
                </div>
                <span className="text-[10px] text-stone-400">From completed & active orders</span>
              </div>

              <div className="bg-[#2D1B18] p-3.5 sm:p-4 rounded-2xl border border-[#52332E]">
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span>Total Orders</span>
                  <i className="fa-solid fa-receipt text-blue-400"></i>
                </div>
                <div className="font-heading font-black text-xl sm:text-2xl text-stone-100">
                  {orders.length}
                </div>
                <span className="text-[10px] text-stone-400">Saved order history</span>
              </div>

              <div className="bg-[#2D1B18] p-3.5 sm:p-4 rounded-2xl border border-[#52332E]">
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span>Low / No Stock</span>
                  <i className="fa-solid fa-boxes-stacked text-amber-500"></i>
                </div>
                <div className="font-heading font-black text-xl sm:text-2xl text-amber-400">
                  {lowStockItems.length + outOfStockItems.length}
                </div>
                <span className="text-[10px] text-stone-400">
                  {outOfStockItems.length} sold out, {lowStockItems.length} low
                </span>
              </div>

              <div className="bg-[#2D1B18] p-3.5 sm:p-4 rounded-2xl border border-[#52332E]">
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span>Active Catalog</span>
                  <i className="fa-solid fa-ice-cream text-[#FF4B72]"></i>
                </div>
                <div className="font-heading font-black text-xl sm:text-2xl text-stone-100">
                  {menuItems.length}
                </div>
                <span className="text-[10px] text-stone-400">Menu items active</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#3D2522] bg-[#211311] px-4 sm:px-6 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'border-[#FF4B72] text-[#FF4B72]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <i className="fa-solid fa-chart-pie"></i>
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                className={`py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === 'menu'
                    ? 'border-[#FF4B72] text-[#FF4B72]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <i className="fa-solid fa-pen-to-square"></i>
                <span>Price & Menu Editor</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === 'inventory'
                    ? 'border-[#FF4B72] text-[#FF4B72]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <i className="fa-solid fa-boxes-packing"></i>
                <span>Stock Control ({lowStockItems.length + outOfStockItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-[#FF4B72] text-[#FF4B72]'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span>Order Log ({orders.length})</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#211311] p-4 rounded-2xl border border-[#3D2522]">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-amber-100">
                        Quick Operations & Stock Management
                      </h3>
                      <p className="text-xs text-stone-400">
                        Restock low inventory or reset prices back to default catalog settings.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRestockAll}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-arrows-rotate"></i>
                        <span>Restock All (15 Units)</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('Reset menu items and prices back to default catalog?')) {
                            onResetMenu();
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-[#3D2522] hover:bg-[#4D302C] text-stone-300 text-xs font-semibold border border-[#52332E]"
                      >
                        Reset Catalog Defaults
                      </button>
                    </div>
                  </div>

                  {/* Low stock alert section if any */}
                  {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
                    <div className="space-y-3">
                      <h4 className="font-heading font-bold text-sm text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <span>Inventory Attention Needed</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {outOfStockItems.map((item) => (
                          <div key={item.id} className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="font-bold text-xs text-rose-200 block">{item.name}</span>
                              <span className="text-[10px] text-rose-400 font-extrabold uppercase">SOLD OUT (0 Stock)</span>
                            </div>
                            <button
                              onClick={() => onUpdateStock(item.id, 15)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px]"
                            >
                              + Restock 15
                            </button>
                          </div>
                        ))}
                        {lowStockItems.map((item) => (
                          <div key={item.id} className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="font-bold text-xs text-amber-200 block">{item.name}</span>
                              <span className="text-[10px] text-amber-400 font-extrabold">Only {inventory[item.id] ?? 15} left</span>
                            </div>
                            <button
                              onClick={() => onUpdateStock(item.id, (inventory[item.id] ?? 0) + 10)}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 text-stone-900 font-bold text-[10px]"
                            >
                              + Add 10
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Orders List Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-bold text-sm text-stone-200 uppercase tracking-wider">
                        Recent Customer Orders Log
                      </h4>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-[#FF4B72] font-bold hover:underline"
                      >
                        View All ({orders.length}) →
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="p-8 text-center bg-[#211311] rounded-2xl border border-[#3D2522]">
                        <p className="text-xs text-stone-400">No customer orders recorded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {orders.slice(0, 4).map((order) => (
                          <div
                            key={order.id}
                            className="p-3.5 bg-[#211311] rounded-2xl border border-[#3D2522] flex items-center justify-between gap-4"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-amber-400 text-xs">
                                  #{order.id}
                                </span>
                                <span className="font-bold text-xs text-stone-100">
                                  {order.customerName} ({order.customerPhone})
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400">
                                {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="font-heading font-black text-sm text-amber-300 block">
                                Rs. {order.totalAmount}
                              </span>
                              <span className="text-[10px] text-stone-400">{order.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PRICE & MENU EDITOR */}
              {activeTab === 'menu' && (
                <div className="space-y-4">
                  {/* Search and Category Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#211311] p-3 rounded-2xl border border-[#3D2522]">
                    <div className="relative w-full sm:w-72">
                      <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"></i>
                      <input
                        type="text"
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        placeholder="Search menu items..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#2D1B18] border border-[#52332E] text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-[#FF4B72]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                      {['all', 'sundaes', 'shakes', 'waffles', 'scoops', 'brownies', 'combos'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                            selectedCategory === cat
                              ? 'bg-[#FF4B72] text-white'
                              : 'bg-[#2D1B18] text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Menu Items Grid for Editing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems
                      .filter((item) => {
                        const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
                        const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
                        return matchesCat && matchesSearch;
                      })
                      .map((item) => {
                        const stock = inventory[item.id] ?? 15;
                        const isSoldOut = stock <= 0;

                        return (
                          <div
                            key={item.id}
                            className="bg-[#211311] rounded-2xl p-4 border border-[#3D2522] flex gap-4 items-start"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className={`w-20 h-20 rounded-xl object-cover bg-stone-900 border border-[#52332E] ${
                                isSoldOut ? 'grayscale' : ''
                              }`}
                            />

                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-heading font-bold text-sm text-stone-100">
                                    {item.name}
                                  </h4>
                                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                                    Category: {item.category}
                                  </span>
                                </div>

                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="px-2.5 py-1 rounded-lg bg-[#3D2522] hover:bg-[#4D302C] text-amber-300 text-xs font-bold border border-[#52332E] flex items-center gap-1"
                                >
                                  <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                                  <span>Edit</span>
                                </button>
                              </div>

                              <p className="text-xs text-stone-400 line-clamp-1">{item.description}</p>

                              <div className="flex items-center justify-between pt-1 border-t border-[#3D2522]">
                                <div className="flex items-center gap-2">
                                  <span className="font-heading font-black text-amber-400 text-sm">
                                    Rs. {item.price}
                                  </span>
                                  {item.badge && (
                                    <span className="bg-[#FF4B72]/20 text-[#FF4B72] border border-[#FF4B72]/40 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() => onUpdateStock(item.id, isSoldOut ? 15 : 0)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-colors ${
                                    isSoldOut
                                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  }`}
                                >
                                  {isSoldOut ? 'Mark Available' : 'Mark Sold Out'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB 3: INVENTORY & STOCK CONTROL */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#211311] p-4 rounded-2xl border border-[#3D2522]">
                    <div>
                      <h3 className="font-heading font-bold text-base text-amber-100">
                        Live Dessert Stock Control
                      </h3>
                      <p className="text-xs text-stone-400">
                        Update stock quantities manually or run bulk stock increments.
                      </p>
                    </div>
                    <button
                      onClick={handleRestockAll}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow"
                    >
                      Restock All Items (15 Units)
                    </button>
                  </div>

                  <div className="bg-[#211311] rounded-2xl border border-[#3D2522] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-300">
                        <thead className="bg-[#1A0E0D] text-amber-200 uppercase text-[10px] font-extrabold border-b border-[#3D2522]">
                          <tr>
                            <th className="p-3.5">Item Name</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Price</th>
                            <th className="p-3.5">Stock Level</th>
                            <th className="p-3.5 text-right">Quick Stock Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2D1B18]">
                          {menuItems.map((item) => {
                            const stock = inventory[item.id] ?? 15;
                            const isOut = stock <= 0;
                            const isLow = stock > 0 && stock <= 5;

                            return (
                              <tr key={item.id} className="hover:bg-[#2A1816] transition-colors">
                                <td className="p-3.5 font-bold text-stone-100 flex items-center gap-2">
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="w-8 h-8 rounded-lg object-cover bg-stone-900"
                                  />
                                  <span>{item.name}</span>
                                </td>
                                <td className="p-3.5 capitalize text-stone-400">{item.category}</td>
                                <td className="p-3.5 font-bold text-amber-300">Rs. {item.price}</td>
                                <td className="p-3.5">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                      isOut
                                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                        : isLow
                                        ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    }`}
                                  >
                                    {isOut ? 'Sold Out (0)' : isLow ? `Low (${stock})` : `${stock} Units`}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right space-x-1.5">
                                  <button
                                    onClick={() => onUpdateStock(item.id, Math.max(0, stock - 1))}
                                    className="px-2 py-1 bg-[#3D2522] hover:bg-[#4D302C] text-stone-200 rounded-lg text-xs font-bold"
                                    title="Decrease stock"
                                  >
                                    -1
                                  </button>
                                  <button
                                    onClick={() => onUpdateStock(item.id, stock + 1)}
                                    className="px-2 py-1 bg-[#3D2522] hover:bg-[#4D302C] text-stone-200 rounded-lg text-xs font-bold"
                                    title="Increase stock"
                                  >
                                    +1
                                  </button>
                                  <button
                                    onClick={() => onUpdateStock(item.id, stock + 10)}
                                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-stone-900 rounded-lg text-xs font-bold"
                                    title="Add +10 stock"
                                  >
                                    +10
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ORDER LOG */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Search and status filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#211311] p-3 rounded-2xl border border-[#3D2522]">
                    <div className="relative w-full sm:w-72">
                      <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"></i>
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search by customer name or phone..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#2D1B18] border border-[#52332E] text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-[#FF4B72]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                      {['all', 'Received (WhatsApp)', 'Confirmed', 'Preparing', 'Completed', 'Cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            orderStatusFilter === st
                              ? 'bg-[#FF4B72] text-white'
                              : 'bg-[#2D1B18] text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {st === 'all' ? 'All Orders' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders List */}
                  {orders.length === 0 ? (
                    <div className="p-12 text-center bg-[#211311] rounded-2xl border border-[#3D2522] space-y-2">
                      <i className="fa-solid fa-receipt text-3xl text-stone-600"></i>
                      <p className="text-sm font-bold text-stone-300">No customer orders recorded yet</p>
                      <p className="text-xs text-stone-500">
                        When customers submit orders via WhatsApp, they automatically log here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders
                        .filter((o) => {
                          const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                          const matchesSearch =
                            o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.customerPhone.includes(orderSearch);
                          return matchesStatus && matchesSearch;
                        })
                        .map((order) => (
                          <div
                            key={order.id}
                            className="bg-[#211311] p-4 rounded-2xl border border-[#3D2522] space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#3D2522]">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-amber-400 text-sm">
                                  #{order.id}
                                </span>
                                <span className="font-bold text-stone-100 text-sm">
                                  {order.customerName}
                                </span>
                                <span className="text-xs text-stone-400">
                                  ({order.customerPhone})
                                </span>
                                <span className="bg-[#3D2522] text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                  {order.orderType}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-heading font-black text-lg text-amber-300">
                                  Rs. {order.totalAmount}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-300">
                              <div>
                                <span className="text-[10px] text-stone-400 font-extrabold uppercase block mb-1">
                                  Items Ordered:
                                </span>
                                <ul className="space-y-1 bg-[#2D1B18] p-2.5 rounded-xl border border-[#52332E]">
                                  {order.items.map((it, idx) => (
                                    <li key={idx} className="flex justify-between">
                                      <span>
                                        {it.quantity}x {it.name}
                                      </span>
                                      <span className="text-amber-400 font-bold">
                                        Rs. {it.price * it.quantity}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-2 flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] text-stone-400 font-extrabold uppercase block mb-1">
                                    Delivery Address / Notes:
                                  </span>
                                  <p className="bg-[#2D1B18] p-2.5 rounded-xl border border-[#52332E] text-stone-300 italic">
                                    {order.address || 'Takeaway / Pickup'} {order.notes && `— Note: ${order.notes}`}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1">
                                  <span className="text-[10px] text-stone-400">{order.timestamp}</span>

                                  {/* Status Selector */}
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      onUpdateOrderStatus(order.id, e.target.value as OrderRecord['status'])
                                    }
                                    className="bg-[#2D1B18] border border-amber-500/40 text-amber-200 text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none"
                                  >
                                    <option value="Received (WhatsApp)">Received (WhatsApp)</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Preparing">Preparing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* ITEM EDIT SUB-MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2D1B18] border border-[#52332E] text-stone-100 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center pb-2 border-b border-[#3D2522]">
              <h3 className="font-heading font-bold text-lg text-amber-100">
                Edit Item Details
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveItemEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-bold">Item Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#211311] border border-[#52332E] text-stone-100 font-bold focus:outline-none focus:border-[#FF4B72]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">Price (Rs.)</label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#211311] border border-[#52332E] text-amber-300 font-black focus:outline-none focus:border-[#FF4B72]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-bold">Badge Text</label>
                  <input
                    type="text"
                    value={editingItem.badge || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                    placeholder="e.g. Bestseller"
                    className="w-full px-3 py-2 rounded-xl bg-[#211311] border border-[#52332E] text-stone-100 focus:outline-none focus:border-[#FF4B72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-bold">Description</label>
                <textarea
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#211311] border border-[#52332E] text-stone-100 focus:outline-none focus:border-[#FF4B72]"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-bold">Image URL</label>
                <input
                  type="text"
                  value={editingItem.image}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#211311] border border-[#52332E] text-stone-100 focus:outline-none focus:border-[#FF4B72]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF4B72] to-[#E63956] text-white font-bold text-xs shadow"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-3 rounded-xl bg-[#3D2522] text-stone-300 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
