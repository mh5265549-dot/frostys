import React, { useState } from 'react';
import { MenuItem } from '../../types';
import {
  getItemDeliveryRestrictions,
  setItemDeliveryAllowed,
  getOutStockFlavors,
  toggleFlavorStock,
  getOutStockToppings,
  toggleToppingStock,
  getAddonPricing,
  saveAddonPricing,
  AddonPricingConfig,
} from '../../utils/operationalStore';

interface PerishableMenuControlProps {
  menuItems: MenuItem[];
  onCatalogChanged?: () => void;
}

const ALL_ICE_CREAM_FLAVORS = [
  { id: 'Vanilla', name: 'Vanilla Soft Serve & Scoops', type: 'Classic Pure Dairy' },
  { id: 'Chocolate', name: 'Rich Dutch Chocolate', type: 'Dark Cocoa Base' },
  { id: 'Chocolate Chip', name: 'Chocolate Chip Cream', type: 'Fudge Stracciatella' },
  { id: 'Strawberry', name: 'Strawberry Swirl', type: 'Real Strawberry Puree' },
  { id: 'Mango', name: 'Alphonso Mango Delight', type: 'Seasonal Puree' },
  { id: 'Praline', name: 'Praline & Roasted Almonds', type: 'Caramel Crunch' },
  { id: 'Kulfa', name: 'Traditional Shahi Kulfa', type: 'Khoya, Cardamom & Pistachio' },
  { id: 'Coffee', name: 'Espresso Mocha Cold Brew', type: 'Roasted Arabica' },
];

const ALL_TOPPINGS = [
  { id: 'sprinkles', name: 'Rainbow Sprinkles', isPremium: false, icon: '🌈' },
  { id: 'choco_chips', name: 'Chocolate Chips', isPremium: false, icon: '🍫' },
  { id: 'oreo_crumbs', name: 'Oreo Crumbs', isPremium: false, icon: '🍪' },
  { id: 'cookie_crumbs', name: 'Cookie Crumbs', isPremium: false, icon: '🍪' },
  { id: 'waffle_crumbs', name: 'Waffle Cone Crumbs', isPremium: false, icon: '🧇' },
  { id: 'mango_chunks', name: 'Fresh Mango Chunks', isPremium: true, icon: '🥭' },
  { id: 'banana_slices', name: 'Caramelized Banana Slices', isPremium: true, icon: '🍌' },
];

export const PerishableMenuControl: React.FC<PerishableMenuControlProps> = ({
  menuItems,
  onCatalogChanged,
}) => {
  const [restrictions, setRestrictions] = useState<Record<string, boolean>>(() =>
    getItemDeliveryRestrictions()
  );
  const [outFlavors, setOutFlavors] = useState<string[]>(() => getOutStockFlavors());
  const [outToppings, setOutToppings] = useState<string[]>(() => getOutStockToppings());
  const [addonPricing, setAddonPricing] = useState<AddonPricingConfig>(() => getAddonPricing());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubTab, setSelectedSubTab] = useState<'restrictions' | 'flavors' | 'addons'>('restrictions');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleDelivery = (itemId: string, currentAllowed: boolean) => {
    const updated = setItemDeliveryAllowed(itemId, !currentAllowed);
    setRestrictions(updated);
    showToast(`Updated delivery permission for item.`);
    if (onCatalogChanged) onCatalogChanged();
  };

  const handleToggleFlavor = (flavorName: string, isCurrentlyOut: boolean) => {
    const updated = toggleFlavorStock(flavorName, isCurrentlyOut);
    setOutFlavors(updated);
    showToast(isCurrentlyOut ? `"${flavorName}" is now In Stock!` : `"${flavorName}" marked Out of Stock!`);
    if (onCatalogChanged) onCatalogChanged();
  };

  const handleToggleTopping = (toppingId: string, isCurrentlyOut: boolean) => {
    const updated = toggleToppingStock(toppingId, isCurrentlyOut);
    setOutToppings(updated);
    showToast(isCurrentlyOut ? `Topping back In Stock!` : `Topping marked Out of Stock!`);
    if (onCatalogChanged) onCatalogChanged();
  };

  const handleSaveAddonPricing = (e: React.FormEvent) => {
    e.preventDefault();
    saveAddonPricing(addonPricing);
    showToast('Add-on pricing updated successfully!');
    if (onCatalogChanged) onCatalogChanged();
  };

  // Filtered menu items for delivery rules
  const filteredItems = menuItems.filter((i) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-panel-enter">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <i className="fa-solid fa-circle-check text-sm"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#140D0C] p-4 sm:p-5 rounded-2xl border border-stone-800">
        <div>
          <h3 className="font-heading font-black text-lg sm:text-xl text-amber-100 flex items-center gap-2">
            <i className="fa-solid fa-snowflake text-sky-400"></i>
            <span>Menu & Perishable Catalog Control</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Control melting delivery restrictions, 1-click out-of-stock toggles for ice cream flavors & mix-ins, and dynamic add-on pricing across Frosty's online store.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedSubTab('restrictions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              selectedSubTab === 'restrictions'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <i className="fa-solid fa-shield-halved text-xs mr-1"></i>
            Delivery Rules (Cones)
          </button>
          <button
            type="button"
            onClick={() => setSelectedSubTab('flavors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              selectedSubTab === 'flavors'
                ? 'bg-sky-500 text-stone-950 shadow-md'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <i className="fa-solid fa-ice-cream text-xs mr-1"></i>
            Flavors & Mix-ins Stock
          </button>
          <button
            type="button"
            onClick={() => setSelectedSubTab('addons')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              selectedSubTab === 'addons'
                ? 'bg-emerald-500 text-stone-950 shadow-md'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <i className="fa-solid fa-tags text-xs mr-1"></i>
            Combo & Add-ons Pricing
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: DELIVERY RESTRICTION TOGGLES (PER-ITEM MELTING RULES) */}
      {/* ========================================================================= */}
      {selectedSubTab === 'restrictions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/60 flex items-start gap-3 text-xs text-amber-200">
            <i className="fa-solid fa-temperature-arrow-up text-amber-400 text-lg shrink-0 mt-0.5"></i>
            <div>
              <strong className="text-amber-100 font-bold block mb-0.5">
                Default Perishable Rule: Ice Cream Cones are locked to "Dine-In / Takeaway Only"
              </strong>
              <span>
                To prevent melting during motorbike transport in Lahore heat, ice cream cones and soft-serve wafer items are flagged as pickup/dine-in only. Cups, insulated sundae boats, and sealed pints can be toggled for delivery.
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name or category (e.g. Waffle Cone, Sundae, Burger)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-amber-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Per-Item Table */}
          <div className="bg-[#140D0C] rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-[#1C1210] text-[11px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Menu Item</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Default Form</th>
                    <th className="py-3 px-3 text-center">Allow for Delivery?</th>
                    <th className="py-3 px-4 text-center">Fulfillment Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-medium">
                  {filteredItems.map((item) => {
                    const isConeItem =
                      item.name.toLowerCase().includes('cone') ||
                      item.id.includes('cone') ||
                      item.category === 'scoops';
                    // Determine if allowed for delivery
                    const isAllowed = restrictions[item.id] !== undefined ? restrictions[item.id] : !isConeItem;

                    return (
                      <tr key={item.id} className="hover:bg-[#1A1110] transition-colors">
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
                              <span className="text-[10px] text-amber-300 font-mono">
                                Rs. {item.price}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-stone-900 text-stone-400 border border-stone-800">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {isConeItem ? (
                            <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                              🍦 Crispy Wafer / Cone
                            </span>
                          ) : (
                            <span className="text-[11px] text-stone-400">
                              📦 Insulated Box / Cup
                            </span>
                          )}
                        </td>

                        {/* Toggle Switch */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleDelivery(item.id, isAllowed)}
                            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 mx-auto ${
                              isAllowed
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isAllowed ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            <span>{isAllowed ? 'Allowed for Delivery' : 'Dine-In / Takeaway Only'}</span>
                          </button>
                        </td>

                        {/* Policy explanation */}
                        <td className="py-3 px-4 text-center">
                          {isAllowed ? (
                            <span className="text-[11px] text-emerald-400 font-semibold">
                              Available across all channels
                            </span>
                          ) : (
                            <span className="text-[11px] text-rose-300 font-semibold flex items-center justify-center gap-1">
                              <i className="fa-solid fa-snowflake text-[10px]"></i>
                              <span>Melting Protection Active</span>
                            </span>
                          )}
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

      {/* ========================================================================= */}
      {/* SUB-TAB 2: INSTANT OUT-OF-STOCK TOGGLES (FLAVORS & MIX-INS) */}
      {/* ========================================================================= */}
      {selectedSubTab === 'flavors' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-900/60 text-xs text-sky-200">
            <strong className="text-sky-100 font-bold block mb-0.5">
              Instant Kitchen Out-of-Stock Controls
            </strong>
            <span>
              If a blast freezer tub runs out during service, 1-click toggle any flavor or topping off. It will immediately disable on customer flavor selection cards in real-time.
            </span>
          </div>

          {/* Ice Cream Flavors Grid */}
          <div className="space-y-3">
            <h4 className="font-heading font-black text-sm text-stone-200 flex items-center gap-2">
              <i className="fa-solid fa-ice-cream text-sky-400"></i>
              <span>Ice Cream Flavors Live Stock ({ALL_ICE_CREAM_FLAVORS.length} Flavors)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ALL_ICE_CREAM_FLAVORS.map((flavor) => {
                const isOutOfStock = outFlavors.some(
                  (f) => f.toLowerCase() === flavor.id.toLowerCase()
                );

                return (
                  <div
                    key={flavor.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isOutOfStock
                        ? 'bg-rose-950/20 border-rose-900/70'
                        : 'bg-[#1C1210] border-stone-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-black text-sm text-stone-100">
                          {flavor.name}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 mt-0.5 block">
                        {flavor.type}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFlavor(flavor.id, isOutOfStock)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow ${
                        isOutOfStock
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700'
                      }`}
                    >
                      <i className={`fa-solid ${isOutOfStock ? 'fa-circle-check' : 'fa-ban'} text-xs`}></i>
                      <span>{isOutOfStock ? 'Mark Back In Stock' : 'Mark Out of Stock'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toppings & Mix-ins Grid */}
          <div className="space-y-3 pt-3 border-t border-stone-800">
            <h4 className="font-heading font-black text-sm text-stone-200 flex items-center gap-2">
              <i className="fa-solid fa-cookie-bite text-amber-400"></i>
              <span>Toppings, Mix-ins & Fruit Chunks Live Stock</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ALL_TOPPINGS.map((top) => {
                const isOutOfStock = outToppings.includes(top.id);

                return (
                  <div
                    key={top.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isOutOfStock
                        ? 'bg-rose-950/20 border-rose-900/70'
                        : 'bg-[#1C1210] border-stone-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-black text-sm text-stone-100 flex items-center gap-1.5">
                          <span>{top.icon}</span>
                          <span>{top.name}</span>
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isOutOfStock ? 'OUT' : 'IN'}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 mt-0.5 block">
                        {top.isPremium ? 'Premium Chunks (+Rs. 50)' : 'Standard Free Topping'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleTopping(top.id, isOutOfStock)}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isOutOfStock
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                      }`}
                    >
                      <span>{isOutOfStock ? 'Restock Topping' : 'Mark Out of Stock'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: COMBO & ADD-ON MANAGER */}
      {/* ========================================================================= */}
      {selectedSubTab === 'addons' && (
        <form onSubmit={handleSaveAddonPricing} className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/60 text-xs text-emerald-200">
            <strong className="text-emerald-100 font-bold block mb-0.5">
              Dynamic Add-on & Extra Scoop Pricing
            </strong>
            <span>
              Easily update supplemental charges for additional scoops, chocolate dip coatings, waffle cone upgrades, and extra topping portions.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Extra Scoop */}
            <div className="p-4 rounded-2xl bg-[#1C1210] border border-stone-800 space-y-2">
              <label className="text-xs font-bold text-amber-200 block">
                🍨 Extra Scoop Price (PKR)
              </label>
              <input
                type="number"
                min={0}
                value={addonPricing.extraScoopPrice}
                onChange={(e) =>
                  setAddonPricing((prev) => ({
                    ...prev,
                    extraScoopPrice: Number(e.target.value),
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-stone-400 block">
                Applied when customer adds double or triple scoops on customer modal.
              </span>
            </div>

            {/* Dip Coating */}
            <div className="p-4 rounded-2xl bg-[#1C1210] border border-stone-800 space-y-2">
              <label className="text-xs font-bold text-amber-200 block">
                🍫 Warm Chocolate Dip Coating (PKR)
              </label>
              <input
                type="number"
                min={0}
                value={addonPricing.dipCoatingPrice}
                onChange={(e) =>
                  setAddonPricing((prev) => ({
                    ...prev,
                    dipCoatingPrice: Number(e.target.value),
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-stone-400 block">
                Crispy hardening dark chocolate dip poured over cold soft-serve.
              </span>
            </div>

            {/* Waffle Cone Upgrade */}
            <div className="p-4 rounded-2xl bg-[#1C1210] border border-stone-800 space-y-2">
              <label className="text-xs font-bold text-amber-200 block">
                🧇 Fresh Rolled Waffle Cone Upgrade (PKR)
              </label>
              <input
                type="number"
                min={0}
                value={addonPricing.waffleConeUpgradePrice}
                onChange={(e) =>
                  setAddonPricing((prev) => ({
                    ...prev,
                    waffleConeUpgradePrice: Number(e.target.value),
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-stone-400 block">
                Upgrade from plain cup to vanilla waffle cone with brown sugar aroma.
              </span>
            </div>

            {/* Extra Topping Price */}
            <div className="p-4 rounded-2xl bg-[#1C1210] border border-stone-800 space-y-2">
              <label className="text-xs font-bold text-amber-200 block">
                🍓 Extra Premium Fruit / Nut Topping (PKR)
              </label>
              <input
                type="number"
                min={0}
                value={addonPricing.extraToppingPrice}
                onChange={(e) =>
                  setAddonPricing((prev) => ({
                    ...prev,
                    extraToppingPrice: Number(e.target.value),
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-stone-400 block">
                Cost for additional premium fruit chunks (Mango, Banana, Almonds).
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-stone-950 font-black text-xs shadow-md cursor-pointer transition-all"
            >
              Save Add-on Pricing Configuration
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
