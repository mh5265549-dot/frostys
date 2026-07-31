import React, { useState } from 'react';
import { MENU_ITEMS } from '../data/menuData';
import { Category } from '../types';

interface InventoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: { [itemId: string]: number };
  onUpdateStock: (itemId: string, newStock: number) => void;
  onResetAllStock: () => void;
}

export const InventoryManagerModal: React.FC<InventoryManagerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onUpdateStock,
  onResetAllStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  if (!isOpen) return null;

  // Calculate metrics
  const totalItems = MENU_ITEMS.length;
  const totalStockUnits = Object.values(inventory).reduce((a: number, b: number) => a + b, 0);
  const lowStockCount = MENU_ITEMS.filter(
    (item) => (inventory[item.id] ?? 0) > 0 && (inventory[item.id] ?? 0) <= 5
  ).length;
  const soldOutCount = MENU_ITEMS.filter(
    (item) => (inventory[item.id] ?? 0) === 0
  ).length;

  const filteredItems = MENU_ITEMS.filter((item) => {
    const stock = inventory[item.id] ?? 0;
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStockFilter = !showOnlyLowStock || stock <= 5;

    return matchesCategory && matchesSearch && matchesLowStockFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white text-stone-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#2D1B18] text-white p-5 sm:p-6 flex items-center justify-between gap-4 border-b border-[#3D2522] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl shadow-inner">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
                  Inventory & Stock Manager
                </h2>
                <span className="bg-[#FF4B72] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-amber-200/80 font-normal">
                Real-time stock control for Frosty's dessert items
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#3D2522] hover:bg-[#4D302C] text-stone-300 hover:text-white flex items-center justify-center transition-all"
            aria-label="Close inventory manager"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Metrics Summary Strip */}
        <div className="bg-amber-50/80 border-b border-amber-200/60 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              <i className="fa-solid fa-ice-cream"></i>
            </div>
            <div>
              <span className="text-[10px] uppercase text-stone-400 font-bold block">Total Items</span>
              <span className="text-base font-heading font-black text-stone-800">{totalItems} Products</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <i className="fa-solid fa-cubes"></i>
            </div>
            <div>
              <span className="text-[10px] uppercase text-stone-400 font-bold block">Units Available</span>
              <span className="text-base font-heading font-black text-emerald-700">{totalStockUnits} Units</span>
            </div>
          </div>

          <div
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              showOnlyLowStock
                ? 'bg-amber-100 border-amber-400 shadow-md ring-2 ring-amber-400'
                : 'bg-white border-amber-200/80 shadow-sm hover:border-amber-300'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              <i className="fa-solid fa-triangle-exclamation animate-pulse"></i>
            </div>
            <div>
              <span className="text-[10px] uppercase text-amber-800 font-bold block">Low Stock (≤ 5)</span>
              <span className="text-base font-heading font-black text-amber-800">{lowStockCount} Items</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              <i className="fa-solid fa-ban"></i>
            </div>
            <div>
              <span className="text-[10px] uppercase text-stone-400 font-bold block">Sold Out</span>
              <span className="text-base font-heading font-black text-rose-600">{soldOutCount} Items</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by dessert name..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'sundaes', 'shakes', 'waffles', 'scoops', 'brownies', 'combos'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#2D1B18] text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={onResetAllStock}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap flex items-center gap-1.5 ml-auto sm:ml-2 shrink-0"
              title="Reset all quantities to default stock level"
            >
              <i className="fa-solid fa-rotate-right text-xs"></i>
              <span>Restock All</span>
            </button>
          </div>
        </div>

        {/* Item Stock List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-stone-100 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
              <i className="fa-solid fa-box-open text-3xl text-stone-300 mb-2"></i>
              <p className="text-sm font-semibold text-stone-600">No items match your filter</p>
              <p className="text-xs text-stone-400 mt-1">Try clearing search or filters</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const stock = inventory[item.id] ?? 0;
              const isLowStock = stock > 0 && stock <= 5;
              const isSoldOut = stock === 0;

              return (
                <div
                  key={item.id}
                  className={`pt-3 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl transition-all ${
                    isSoldOut
                      ? 'bg-rose-50/70 border border-rose-200'
                      : isLowStock
                      ? 'bg-amber-50/70 border border-amber-200'
                      : 'bg-white hover:bg-stone-50/80 border border-stone-100'
                  }`}
                >
                  {/* Left: Product Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-heading font-bold text-sm text-stone-900">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs mt-1">
                        <span className="font-bold text-[#2D1B18]">Rs. {item.price}</span>
                        {item.unit && <span className="text-stone-400">• {item.unit}</span>}
                      </div>

                      {/* Stock Badge */}
                      <div className="mt-1">
                        {isSoldOut ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300">
                            <i className="fa-solid fa-circle-xmark"></i> OUT OF STOCK
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 animate-pulse">
                            <i className="fa-solid fa-bolt"></i> LOW STOCK ({stock} remaining)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <i className="fa-solid fa-circle-check"></i> In Stock ({stock} available)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onUpdateStock(item.id, Math.max(0, stock - 1))}
                      disabled={stock === 0}
                      className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-black transition-all border border-stone-200 text-xs"
                      title="Decrease stock"
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>

                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        onUpdateStock(item.id, Math.max(0, val));
                      }}
                      className="w-16 py-1.5 text-center font-heading font-black text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                    />

                    <button
                      onClick={() => onUpdateStock(item.id, stock + 1)}
                      className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-black transition-all border border-stone-200 text-xs"
                      title="Increase stock"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>

                    {/* Quick State Toggle Buttons */}
                    <div className="flex items-center gap-1 ml-2 border-l border-stone-200 pl-2">
                      <button
                        onClick={() => onUpdateStock(item.id, 0)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          isSoldOut
                            ? 'bg-rose-600 text-white border-rose-700'
                            : 'bg-stone-100 text-rose-600 border-stone-200 hover:bg-rose-50'
                        }`}
                        title="Mark as Sold Out"
                      >
                        Sold Out
                      </button>
                      <button
                        onClick={() => onUpdateStock(item.id, 10)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-100 text-emerald-700 border border-stone-200 hover:bg-emerald-50 transition-all"
                        title="Quick set to 10 units"
                      >
                        +10 Units
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-3 text-xs shrink-0">
          <span className="text-stone-500 font-medium">
            Changes save automatically to local store memory
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D1B18] hover:bg-[#3D2522] text-white font-bold text-xs transition-all shadow-sm"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
