import React, { useState } from 'react';
import { MenuItem } from '../../types';
import {
  getStoredIngredientCosts,
  saveItemIngredientCost,
  resetIngredientCostsToDefault,
  getItemCogsCost,
  isGrillOrderItem,
} from '../../utils/costAndFinance';

interface RecipeCostManagerProps {
  menuItems: MenuItem[];
  onCostsUpdated?: () => void;
}

export const RecipeCostManager: React.FC<RecipeCostManagerProps> = ({
  menuItems,
  onCostsUpdated,
}) => {
  const [costsMap, setCostsMap] = useState<Record<string, { cost: number; breakdown: string }>>(() =>
    getStoredIngredientCosts()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'grill' | 'ice-cream'>('all');
  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
    price: number;
    currentCost: number;
    currentBreakdown: string;
  } | null>(null);

  const [inputCost, setInputCost] = useState<number | ''>('');
  const [inputBreakdown, setInputBreakdown] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const handleOpenEdit = (item: MenuItem) => {
    const existing = costsMap[item.id] || {
      cost: getItemCogsCost(item.id, item.name, item.price, costsMap),
      breakdown: isGrillOrderItem(item)
        ? 'Chicken / Meat, Buns / Tortilla, Sauces, Packaging'
        : 'Dairy Soft Serve, Waffle / Cup, Syrups, Toppings',
    };
    setEditingItem({
      id: item.id,
      name: item.name,
      price: item.price,
      currentCost: existing.cost,
      currentBreakdown: existing.breakdown,
    });
    setInputCost(existing.cost);
    setInputBreakdown(existing.breakdown);
  };

  const handleSaveCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const newCostNumber = typeof inputCost === 'number' ? inputCost : 0;
    const updated = saveItemIngredientCost(editingItem.id, newCostNumber, inputBreakdown.trim());
    setCostsMap(updated);
    setEditingItem(null);
    if (onCostsUpdated) onCostsUpdated();

    setSaveToast(`Updated recipe cost for ${editingItem.name}!`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const confirmResetDefaults = () => {
    const reset = resetIngredientCostsToDefault();
    setCostsMap(reset);
    setShowResetConfirmModal(false);
    if (onCostsUpdated) onCostsUpdated();
    setSaveToast('Recipe costs reset to default restaurant benchmarks.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Filtered menu items
  const filteredItems = menuItems.filter((item) => {
    const isGrill = isGrillOrderItem(item);
    if (categoryFilter === 'grill' && !isGrill) return false;
    if (categoryFilter === 'ice-cream' && isGrill) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchBreakdown = (costsMap[item.id]?.breakdown || '').toLowerCase().includes(q);
      if (!matchName && !matchCategory && !matchBreakdown) return false;
    }
    return true;
  });

  // Calculate summary metrics across displayed items
  const totalItemsCount = menuItems.length;
  const averageMargin =
    menuItems.reduce((acc, item) => {
      const cost = getItemCogsCost(item.id, item.name, item.price, costsMap);
      const profit = Math.max(0, item.price - cost);
      const margin = item.price > 0 ? (profit / item.price) * 100 : 0;
      return acc + margin;
    }, 0) / (totalItemsCount || 1);

  return (
    <div className="space-y-6 animate-panel-enter">
      {/* Toast */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <i className="fa-solid fa-circle-check text-sm"></i>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#140D0C] p-4 sm:p-5 rounded-2xl border border-stone-800">
        <div>
          <h3 className="font-heading font-black text-lg sm:text-xl text-amber-100 flex items-center gap-2">
            <i className="fa-solid fa-kitchen-set text-amber-400"></i>
            <span>Recipe & Ingredient Cost Management (Cost Price Setup)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Configure raw ingredient expenditures and packaging costs per unit. When wholesale ingredient prices fluctuate, updates here immediately recalculate all historical and real-time net profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirmModal(true)}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset to default verified restaurant benchmarks"
          >
            <i className="fa-solid fa-rotate-left text-amber-400"></i>
            <span>Reset Benchmarks</span>
          </button>
        </div>
      </div>

      {/* High-Level Recipe Margins Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#1C1210] border border-stone-800">
          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Catalog Items</span>
          <span className="font-heading font-black text-xl text-amber-300">{totalItemsCount} Products</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Fully Costed</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1C1210] border border-stone-800">
          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Avg Recipe Margin</span>
          <span className="font-heading font-black text-xl text-emerald-400">{averageMargin.toFixed(1)}%</span>
          <span className="text-[11px] text-stone-500 block mt-0.5">Across All Categories</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1C1210] border border-stone-800">
          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Grill Items</span>
          <span className="font-heading font-black text-xl text-orange-400">
            {menuItems.filter(isGrillOrderItem).length} Items
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">~47% Target Margin</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1C1210] border border-stone-800">
          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Ice Cream Items</span>
          <span className="font-heading font-black text-xl text-sky-400">
            {menuItems.filter((i) => !isGrillOrderItem(i)).length} Items
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">~60% Target Margin</span>
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
            placeholder="Search dish name, ingredient (e.g. Chicken, Tortilla, Banana)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-700'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('grill')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              categoryFilter === 'grill'
                ? 'bg-orange-500 text-stone-950 font-black shadow-xs'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-700'
            }`}
          >
            <i className="fa-solid fa-fire text-[10px]"></i>
            <span>Grill Items</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('ice-cream')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              categoryFilter === 'ice-cream'
                ? 'bg-sky-500 text-stone-950 font-black shadow-xs'
                : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-700'
            }`}
          >
            <i className="fa-solid fa-ice-cream text-[10px]"></i>
            <span>Ice Cream</span>
          </button>
        </div>
      </div>

      {/* Recipe Cost Management Table */}
      <div className="bg-[#140D0C] rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#1C1210] text-[11px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-3 px-4">Menu Item & Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Retail Price</th>
                <th className="py-3 px-3 text-right">Ingredient Cost (COGS)</th>
                <th className="py-3 px-4">Ingredient Cost Breakdown</th>
                <th className="py-3 px-3 text-right">Unit Profit</th>
                <th className="py-3 px-3 text-right">Margin %</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-medium">
              {filteredItems.map((item) => {
                const isGrill = isGrillOrderItem(item);
                const cost = getItemCogsCost(item.id, item.name, item.price, costsMap);
                const breakdown =
                  costsMap[item.id]?.breakdown ||
                  (isGrill
                    ? 'Chicken, Patty/Fillet, Seasoning, Sauces, Packaging'
                    : 'Dairy Soft Serve, Waffle/Cup, Syrups, Toppings');
                const profit = Math.max(0, item.price - cost);
                const margin = item.price > 0 ? (profit / item.price) * 100 : 0;

                return (
                  <tr key={item.id} className="hover:bg-[#1A1110] transition-colors">
                    {/* Item Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-700 shrink-0"
                        />
                        <div>
                          <span className="font-heading font-black text-sm text-stone-100 block">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {item.unit || 'Serving'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      {isGrill ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-950/80 text-orange-300 border border-orange-800/80 text-[10px] font-black">
                          <i className="fa-solid fa-fire text-[9px]"></i>
                          <span>Grill</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-800/80 text-[10px] font-black">
                          <i className="fa-solid fa-ice-cream text-[9px]"></i>
                          <span>Ice Cream</span>
                        </span>
                      )}
                    </td>

                    {/* Retail Selling Price */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-stone-100">
                      Rs. {item.price.toLocaleString()}
                    </td>

                    {/* Ingredient Cost */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-300">
                      Rs. {cost.toLocaleString()}
                    </td>

                    {/* Cost Breakdown */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-stone-400 leading-relaxed italic truncate" title={breakdown}>
                        {breakdown}
                      </p>
                    </td>

                    {/* Unit Profit */}
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-400">
                      Rs. {profit.toLocaleString()}
                    </td>

                    {/* Margin % */}
                    <td className="py-3 px-3 text-right font-mono font-black">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          margin >= 55
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : margin >= 40
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {margin.toFixed(1)}%
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-200 text-xs font-bold border border-stone-700 transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto"
                        title="Edit Ingredient Cost & Recipe Breakdown"
                      >
                        <i className="fa-solid fa-pencil text-[10px]"></i>
                        <span>Edit Cost</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT INGREDIENT COST MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#181110] text-stone-100 w-full max-w-md rounded-3xl border border-amber-500/50 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h4 className="font-heading font-black text-base text-amber-200">
                  Edit Ingredient Cost (COGS)
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">{editingItem.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveCost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Retail Selling Price (Fixed)
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 font-mono text-sm font-black text-amber-300">
                  Rs. {editingItem.price.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Unit Ingredient / Material Cost (PKR) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  required
                  value={inputCost}
                  onChange={(e) => setInputCost(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 320"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm font-mono font-bold text-rose-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Ingredient Breakdown Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={inputBreakdown}
                  onChange={(e) => setInputBreakdown(e.target.value)}
                  placeholder="e.g. Chicken breast fillet, bun, smoked grill sauce, cheddar, box packing"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                ></textarea>
                <p className="text-[10px] text-stone-500 mt-1">
                  Helps kitchen management audit exactly what ingredients comprise this unit cost.
                </p>
              </div>

              {/* Calculated Preview */}
              {typeof inputCost === 'number' && (
                <div className="p-3 rounded-xl bg-[#241715] border border-amber-900/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Calculated Unit Profit</span>
                    <span className="font-heading font-black text-emerald-400 text-base">
                      Rs. {(editingItem.price - inputCost).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">New Profit Margin</span>
                    <span className="font-mono font-black text-amber-300 text-base">
                      {editingItem.price > 0 ? (((editingItem.price - inputCost) / editingItem.price) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-stone-950 font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Recipe Cost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1C1210] text-stone-100 w-full max-w-sm rounded-3xl border border-amber-500/50 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-rotate-left"></i>
            </div>
            <div className="text-center">
              <h4 className="font-heading font-black text-base text-amber-200">
                Reset All Ingredient Costs?
              </h4>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                This will reset all recipe costs to the verified restaurant benchmarks (e.g. Grilled Chicken Burger Rs. 320, Waffle Cone Rs. 35, Banana Split Rs. 150).
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetDefaults}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black cursor-pointer shadow-md"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
