import React, { useState } from 'react';
import { MenuItem, ShopMode } from '../types';
import { MENU_ITEMS } from '../data/menuData';

interface MenuSectionProps {
  items?: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  inventory?: { [itemId: string]: number };
  activeCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
  triggerToast?: (msg: string) => void;
  activeShop: ShopMode;
  onSwitchShop: (shop: ShopMode) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items = MENU_ITEMS,
  onSelectItem,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  inventory = {},
  activeShop,
  onSwitchShop,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const searchQuery = externalSearchQuery || internalSearchQuery;
  const isGrill = activeShop === 'grill';

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchQuery(value);
    }
  };

  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange('');
    } else {
      setInternalSearchQuery('');
    }
  };

  // Base items partitioned strictly by shop mode
  const shopBaseItems = items.filter((item) => {
    if (isGrill) {
      return item.category === 'fast-food-bbq';
    } else {
      return item.category !== 'fast-food-bbq';
    }
  });

  // Check if search query might belong to the other shop
  const q = searchQuery.trim().toLowerCase();
  const isSearchTargetingGrill =
    !isGrill &&
    q.length > 0 &&
    (q.includes('burger') ||
      q.includes('sandwich') ||
      q.includes('tikka') ||
      q.includes('bbq') ||
      q.includes('wrap') ||
      q.includes('taco') ||
      q.includes('fries') ||
      q.includes('grill') ||
      q.includes('zinger'));

  const isSearchTargetingIceCream =
    isGrill &&
    q.length > 0 &&
    (q.includes('cone') ||
      q.includes('ice cream') ||
      q.includes('icecream') ||
      q.includes('sundae') ||
      q.includes('shake') ||
      q.includes('kulfi') ||
      q.includes('chiller') ||
      q.includes('soda') ||
      q.includes('vanilla') ||
      q.includes('chocolate') ||
      q.includes('coffee') ||
      q.includes('scoop'));

  // Filter items based on active shop, query and active tag
  const filteredItems = shopBaseItems.filter((item) => {
    let matchesSearch = true;
    if (q) {
      const qIsCone = q === 'cone' || q === 'cones';
      const qIsSundae = q === 'sundae' || q === 'sundaes';
      const qIsDeal = q === 'deal' || q === 'deals';
      const qIsShake = q === 'shake' || q === 'shakes' || q === 'milkshake' || q === 'milkshakes';
      const qIsKulfi = q === 'kulfi';
      const qIsCoffee = q === 'coffee' || q === 'coffees' || q === 'latte' || q === 'frappe';
      const qIsSoda = q === 'soda' || q === 'sodas' || q === 'chiller' || q === 'chillers';
      const qIsGrillTag =
        q === 'burger' ||
        q === 'burgers' ||
        q === 'sandwich' ||
        q === 'wrap' ||
        q === 'bbq' ||
        q === 'tikka' ||
        q === 'fries';

      matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (qIsCone &&
          (item.category === 'scoops' ||
            item.name.toLowerCase().includes('cone') ||
            item.tags?.some((t) => t.toLowerCase().includes('cone')))) ||
        (qIsSundae && (item.category === 'sundaes' || item.name.toLowerCase().includes('sundae'))) ||
        (qIsDeal && (item.category === 'deals' || !!item.originalPrice)) ||
        (qIsShake && (item.category === 'shakes' || item.name.toLowerCase().includes('shake'))) ||
        (qIsKulfi && (item.category === 'kulfi' || item.name.toLowerCase().includes('kulfi'))) ||
        (qIsCoffee && (item.category === 'coffees' || item.name.toLowerCase().includes('coffee'))) ||
        (qIsSoda && (item.category === 'sodas' || item.name.toLowerCase().includes('soda'))) ||
        (qIsGrillTag &&
          (item.category === 'fast-food-bbq' ||
            item.tags?.some((t) => t.toLowerCase().includes('burger') || t.toLowerCase().includes('grill')))) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
    }

    const matchesTag =
      !activeTag ||
      activeTag === 'All' ||
      item.tags?.some((t) => t.toLowerCase().includes(activeTag.toLowerCase())) ||
      item.name.toLowerCase().includes(activeTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  const iceCreamTags = ['Cone', 'Vanilla', 'Chocolate', 'Banana Split', 'Sundae', 'Shake', 'Kulfi', 'Soda Chiller', 'Deal'];
  const grillTags = ['All', 'Burger', 'Sandwich', 'Wrap', 'Tikka', 'Fries', 'Combo'];
  const activeTagsList = isGrill ? grillTags : iceCreamTags;

  return (
    <section
      id="menu"
      className="py-16 bg-[#FFFDF7] dark:bg-[#140D0C] text-[#2D1B18] dark:text-[#F7F2EE] relative scroll-mt-20 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Prominent Shop Switcher Banner Above Catalog */}
        <div
          className={`mb-12 p-6 sm:p-8 rounded-3xl border-2 shadow-2xl transition-all duration-300 ${
            isGrill
              ? 'bg-gradient-to-br from-[#24100C] via-[#1B0A08] to-[#140604] border-orange-500/50 shadow-orange-950/40'
              : 'bg-gradient-to-br from-[#271220] via-[#1C0D1B] to-[#120815] border-[#FF4B72]/50 shadow-pink-950/40'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white bg-white/10 border border-white/20">
                {isGrill ? (
                  <>
                    <i className="fa-solid fa-fire text-amber-400"></i>
                    <span>Frosty's Grill Department</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-ice-cream text-pink-300"></i>
                    <span>Frosty's Ice Cream & Desserts</span>
                  </>
                )}
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
                {isGrill ? "Sizzling Charcoal Burgers & BBQ Menu" : "Handcrafted Artisanal Ice Cream Menu"}
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/80 max-w-xl">
                {isGrill
                  ? 'Juicy charcoal smash burgers, crispy chicken tikka boti, club sandwiches, wraps & loaded fries supreme.'
                  : 'Crispy waffle cones, 10 artisanal flavors, signature sundaes, Oreo shakes, kulfi & soda chillers.'}
              </p>
            </div>

            {/* Switch to Other Shop Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => onSwitchShop(isGrill ? 'ice-cream' : 'grill')}
                id="btn-catalog-switch-shop"
                className={`px-6 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer group ${
                  isGrill
                    ? 'bg-gradient-to-r from-[#FF4B72] to-[#FF85A1] hover:from-[#E63956] hover:to-[#FF6584] shadow-pink-950/50'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 shadow-orange-950/60'
                }`}
              >
                {isGrill ? (
                  <>
                    <i className="fa-solid fa-ice-cream text-base group-hover:rotate-12 transition-transform"></i>
                    <span>Switch to Frosty's Ice Cream</span>
                    <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-fire text-amber-300 text-base group-hover:rotate-12 transition-transform"></i>
                    <span>Switch to Frosty's Grill (Burgers & BBQ)</span>
                    <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border ${
              isGrill
                ? 'bg-orange-500/10 dark:bg-orange-500/20 border-orange-500/30 text-orange-600 dark:text-amber-400'
                : 'bg-[#FF4B72]/10 dark:bg-[#FF4B72]/20 border-[#FF4B72]/20 dark:border-[#FF4B72]/40 text-[#E63956] dark:text-[#FF85A1]'
            }`}
          >
            {isGrill ? (
              <i className="fa-solid fa-fire-flame-curved"></i>
            ) : (
              <i className="fa-solid fa-ice-cream"></i>
            )}
            <span>{isGrill ? "Frosty's Grill Catalog" : "Frosty's Dessert Catalog"}</span>
          </div>

          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#2D1B18] dark:text-amber-50 tracking-tight">
            {isGrill ? "Explore Fresh Grill Items" : "Explore Ice Creams & Drinks"}
          </h3>

          {/* Search & Tag Filter Bar */}
          <div className="pt-2 max-w-2xl mx-auto space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder={
                  isGrill
                    ? 'Search Burgers, Tikka, Sandwiches, Wraps, Fries Supreme...'
                    : 'Search Waffle Cone, Vanilla, Banana Split, Oreo Shake, Kulfi, Soda...'
                }
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-[#1E1614] border border-stone-300 dark:border-[#3D2522] text-stone-800 dark:text-amber-50 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#FF4B72] focus:border-transparent shadow-sm text-sm font-semibold transition-colors"
              />
              <i
                className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 ${
                  isGrill ? 'text-orange-500' : 'text-[#FF4B72]'
                }`}
              ></i>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
              <span className="text-stone-500 dark:text-stone-400 font-semibold mr-1">Filter by:</span>
              <button
                onClick={() => {
                  setActiveTag(null);
                  handleClearSearch();
                }}
                className={`px-3 py-1 rounded-full border text-xs font-bold transition-all ${
                  !activeTag && !searchQuery
                    ? isGrill
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-[#2D1B18] text-amber-300 border-[#2D1B18] dark:bg-amber-400 dark:text-stone-950 dark:border-amber-400 shadow-sm'
                    : 'bg-stone-100 dark:bg-[#231A18] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-[#3D2522] hover:bg-stone-200 dark:hover:bg-[#2D1E1B]'
                }`}
              >
                All ({shopBaseItems.length})
              </button>
              {activeTagsList.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                    activeTag === tag
                      ? isGrill
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-[#FF4B72] text-white border-[#FF4B72] shadow-sm'
                      : 'bg-stone-100 dark:bg-[#231A18] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-[#3D2522] hover:bg-[#FF4B72] hover:text-white hover:border-[#FF4B72]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cross-Shop Discovery Prompt: User searching for Grill in Ice Cream Shop */}
        {isSearchTargetingGrill && (
          <div className="mb-8 p-4 rounded-2xl bg-orange-50 dark:bg-[#24130E] border-2 border-orange-400/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-md">
                <i className="fa-solid fa-fire-flame-curved"></i>
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-stone-900 dark:text-amber-100">
                  Looking for Burgers, Sandwiches or BBQ?
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  Savory items are served exclusively at <strong className="font-bold text-orange-600 dark:text-orange-400">Frosty's Grill</strong>!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onSwitchShop('grill');
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs shadow-md shrink-0 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <span>Switch to Frosty's Grill Shop</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        )}

        {/* Cross-Shop Discovery Prompt: User searching for Ice Cream in Grill Shop */}
        {isSearchTargetingIceCream && (
          <div className="mb-8 p-4 rounded-2xl bg-pink-50 dark:bg-[#24111E] border-2 border-[#FF4B72]/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-[#FF4B72] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-md">
                <i className="fa-solid fa-ice-cream"></i>
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-stone-900 dark:text-amber-100">
                  Looking for Ice Cream, Cones or Shakes?
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  Dessert items are served fresh at <strong className="font-bold text-[#FF4B72]">Frosty's Ice Cream</strong>!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onSwitchShop('ice-cream');
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4B72] to-[#FF85A1] text-white font-black text-xs shadow-md shrink-0 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <span>Switch to Frosty's Ice Cream Shop</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        )}

        {/* Menu Items Count Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-[#3D2522] mb-8">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl sm:text-2xl text-[#2D1B18] dark:text-amber-50">
              {searchQuery ? `Search Results for "${searchQuery}"` : activeTag ? `Showing #${activeTag}` : isGrill ? "Frosty's Grill Items" : "Frosty's Ice Cream Items"}
            </span>
            <span className="bg-stone-100 dark:bg-[#231A18] text-stone-700 dark:text-amber-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-stone-200 dark:border-[#3D2522]">
              {filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {(searchQuery || activeTag) && (
            <button
              onClick={() => {
                handleClearSearch();
                setActiveTag(null);
              }}
              className="text-xs text-[#FF4B72] hover:underline font-bold flex items-center gap-1"
            >
              <i className="fa-solid fa-rotate-left"></i>
              <span>Show All</span>
            </button>
          )}
        </div>

        {/* Empty Search State */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1E1614] rounded-3xl border border-stone-200 dark:border-[#3D2522] max-w-md mx-auto p-8 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-[#2A1E1C] text-stone-400 dark:text-amber-300/60 flex items-center justify-center mx-auto text-2xl">
              {isGrill ? (
                <i className="fa-solid fa-burger"></i>
              ) : (
                <i className="fa-solid fa-cookie-bite"></i>
              )}
            </div>
            <h3 className="font-heading font-bold text-lg text-stone-800 dark:text-amber-100">
              No items found in {isGrill ? "Frosty's Grill" : "Frosty's Ice Cream"}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isGrill
                ? "Looking for ice cream desserts? Try switching to Frosty's Ice Cream shop!"
                : "Looking for grilled burgers or BBQ? Try switching to Frosty's Grill shop!"}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  handleClearSearch();
                  setActiveTag(null);
                }}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold text-xs transition-colors"
              >
                Reset Search
              </button>
              <button
                onClick={() => onSwitchShop(isGrill ? 'ice-cream' : 'grill')}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs transition-colors shadow-md flex items-center gap-1.5 ${
                  isGrill
                    ? 'bg-gradient-to-r from-[#FF4B72] to-[#FF85A1]'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600'
                }`}
              >
                {isGrill ? (
                  <>
                    <i className="fa-solid fa-ice-cream"></i>
                    <span>Go to Frosty's Ice Cream</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-fire"></i>
                    <span>Go to Frosty's Grill</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Continuous Unified Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredItems.map((item) => {
              const itemStock = inventory[item.id] ?? 15;
              const isSoldOut = itemStock === 0;
              const isDeal = item.category === 'deals' || !!item.originalPrice;

              /* Deal Card View */
              if (isDeal) {
                return (
                  <div
                    key={item.id}
                    className={`group relative bg-gradient-to-br from-[#2D1B18] via-[#211120] to-[#361328] rounded-3xl border-2 border-amber-400/80 shadow-xl hover:shadow-2xl hover:border-amber-300 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1.5 ring-2 ring-amber-400/20 text-white ${
                      isSoldOut ? 'opacity-80 border-stone-600' : ''
                    }`}
                  >
                    {/* Top Banner Accent Ribbon */}
                    <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-[#2D1B18] px-4 py-1.5 flex items-center justify-between text-xs font-black uppercase tracking-wider shadow-md">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-bolt text-amber-950"></i>
                        <span>{item.badge || 'SPECIAL COMBO'}</span>
                      </span>
                      {item.originalPrice && (
                        <span className="bg-[#2D1B18] text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-black border border-amber-400/50">
                          SAVE {item.originalPrice - item.price} PKR
                        </span>
                      )}
                    </div>

                    <div>
                      {/* Deal Image Container */}
                      <div
                        className="relative h-52 overflow-hidden cursor-pointer bg-stone-900"
                        onClick={() => onSelectItem(item)}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            isSoldOut ? 'grayscale' : 'group-hover:scale-105'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B18] via-transparent to-black/20" />

                        {/* Sold Out Overlay */}
                        {isSoldOut && (
                          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-rose-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-lg border border-rose-400">
                              <i className="fa-solid fa-ban mr-1.5"></i> Out of Stock
                            </span>
                          </div>
                        )}

                        {/* Rating */}
                        {!isSoldOut && item.rating && (
                          <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md border border-amber-400/30">
                            <i className="fa-solid fa-star text-amber-400"></i>
                            <span className="text-white">{item.rating}</span>
                          </span>
                        )}
                      </div>

                      {/* Deal Content */}
                      <div className="p-5 space-y-3">
                        <h3
                          onClick={() => onSelectItem(item)}
                          className="font-heading font-black text-xl text-amber-300 group-hover:text-amber-200 transition-colors cursor-pointer line-clamp-1"
                        >
                          {item.name}
                        </h3>

                        <p className="text-xs text-stone-300 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>

                        {/* Deal Inclusions Checklist */}
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/10 space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-stone-200 font-medium">
                            <i className="fa-solid fa-circle-check text-emerald-400 text-[11px]"></i>
                            <span>Choose Custom Ice Cream Flavors</span>
                          </div>
                          <div className="flex items-center gap-2 text-stone-200 font-medium">
                            <i className="fa-solid fa-circle-check text-emerald-400 text-[11px]"></i>
                            <span>Includes 2 Soda Chillers (Choice of Flavors)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deal Footer Price & Action */}
                    <div className="p-5 pt-0 mt-auto border-t border-white/10 flex items-center justify-between gap-3">
                      <div>
                        {item.originalPrice && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-stone-400 font-bold line-through">
                              {item.originalPrice} PKR
                            </span>
                            <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-1.5 py-0.2 rounded">
                              Save {item.originalPrice - item.price} PKR
                            </span>
                          </div>
                        )}
                        <span className="font-heading font-black text-2xl sm:text-3xl text-amber-300 block">
                          {item.price} PKR
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectItem(item)}
                        disabled={isSoldOut}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg ${
                          isSoldOut
                            ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-[#2D1B18] font-black hover:scale-105'
                        }`}
                      >
                        <i className="fa-solid fa-wand-magic-sparkles text-[11px]"></i>
                        <span>Customize Deal</span>
                      </button>
                    </div>
                  </div>
                );
              }

              /* Standard Product Card View */
              return (
                <div
                  key={item.id}
                  className={`group bg-white dark:bg-[#1C1412] rounded-3xl border border-stone-200 dark:border-[#362420] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1 ${
                    isSoldOut ? 'opacity-80' : ''
                  }`}
                >
                  <div>
                    {/* Item Image */}
                    <div
                      className="relative h-48 overflow-hidden cursor-pointer bg-stone-100 dark:bg-stone-800"
                      onClick={() => onSelectItem(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isSoldOut ? 'grayscale' : 'group-hover:scale-105'
                        }`}
                      />

                      {/* Sold Out Overlay */}
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                            <i className="fa-solid fa-ban mr-1"></i> Sold Out
                          </span>
                        </div>
                      )}

                      {/* Badge */}
                      {!isSoldOut && item.badge && (
                        <span
                          className={`absolute top-3 left-3 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider ${
                            isGrill
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                              : 'bg-[#FF4B72]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Rating */}
                      {!isSoldOut && item.rating && (
                        <span className="absolute bottom-3 right-3 bg-white/95 dark:bg-[#2D1B18]/95 backdrop-blur-md text-amber-500 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-stone-200/50 dark:border-[#3D2522]">
                          <i className="fa-solid fa-star text-amber-400 text-[10px]"></i>
                          <span className="text-stone-800 dark:text-amber-100 font-extrabold">{item.rating}</span>
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          onClick={() => onSelectItem(item)}
                          className="font-heading font-black text-lg text-[#2D1B18] dark:text-amber-50 group-hover:text-[#FF4B72] dark:group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-1"
                        >
                          {item.name}
                        </h3>
                        {/* Shop Type Pill */}
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                            isGrill
                              ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-amber-300'
                              : 'bg-pink-100 dark:bg-pink-950/80 text-[#FF4B72] dark:text-pink-300'
                          }`}
                        >
                          {isGrill ? '🔥 Grill' : '🍦 Ice Cream'}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 dark:text-stone-300 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Price & Add Button */}
                  <div className="p-5 pt-0 mt-auto border-t border-stone-100 dark:border-[#2D1E1B] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-stone-400 dark:text-stone-400 font-semibold block">
                        {item.unit ? item.unit : 'Price'}
                      </span>
                      <span className="font-heading font-black text-xl text-[#2D1B18] dark:text-amber-300">
                        Rs. {item.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectItem(item)}
                        className="p-2.5 rounded-xl text-stone-500 dark:text-stone-400 hover:text-[#2D1B18] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#2D1E1B] text-xs font-semibold transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>

                      {isSoldOut ? (
                        <button
                          disabled
                          className="px-3.5 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-bold text-xs cursor-not-allowed flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-ban text-[10px]"></i>
                          <span>Sold Out</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectItem(item)}
                          id={`btn-add-${item.id}`}
                          className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                            isGrill
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-orange-950/40'
                              : 'bg-[#2D1B18] dark:bg-gradient-to-r dark:from-[#FF4B72] dark:to-rose-600 hover:bg-[#FF4B72]'
                          }`}
                        >
                          {isGrill ? (
                            <i className="fa-solid fa-fire text-[10px] text-amber-200"></i>
                          ) : (
                            <i className="fa-solid fa-wand-magic-sparkles text-[10px] text-amber-300"></i>
                          )}
                          <span>Customize & Add</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
