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

  const iceCreamTags = ['All', 'Cone', 'Vanilla', 'Chocolate', 'Banana Split', 'Sundae', 'Shake', 'Kulfi', 'Soda Chiller', 'Deal'];
  const grillTags = ['All', 'Burger', 'Sandwich', 'Wrap', 'Tikka', 'Fries', 'Combo'];
  const activeTagsList = isGrill ? grillTags : iceCreamTags;

  return (
    <section
      id="menu"
      className="py-12 sm:py-16 bg-[#FAFAF9] text-stone-900 relative scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Prominent Shop Switcher Card Above Catalog */}
        <div
          className={`mb-10 p-5 sm:p-7 rounded-3xl border shadow-xs transition-all duration-300 ${
            isGrill
              ? 'bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-white border-orange-200'
              : 'bg-gradient-to-r from-pink-50/90 via-rose-50/60 to-white border-pink-200'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white border border-stone-200 shadow-2xs">
                {isGrill ? (
                  <>
                    <i className="fa-solid fa-fire text-orange-600"></i>
                    <span className="text-stone-800">Frosty's Grill Department</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-ice-cream text-[#FF4B72]"></i>
                    <span className="text-stone-800">Frosty's Ice Cream & Desserts</span>
                  </>
                )}
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
                {isGrill ? "Sizzling Charcoal Burgers & BBQ Menu" : "Handcrafted Artisanal Ice Cream Menu"}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
                {isGrill
                  ? 'Flame-grilled burgers, tender chicken tikka boti, club sandwiches, wraps & loaded fries supreme.'
                  : 'Crispy waffle cones, pure cream scoops, Banana Splits, thick shakes, kulfi & fruit soda chillers.'}
              </p>
            </div>

            {/* Switch to Other Shop Action Button */}
            <button
              onClick={() => onSwitchShop(isGrill ? 'ice-cream' : 'grill')}
              id="btn-catalog-switch-shop"
              className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0 ${
                isGrill
                  ? 'bg-white hover:bg-pink-50 text-[#FF4B72] border-2 border-pink-300 shadow-sm'
                  : 'bg-white hover:bg-orange-50 text-orange-700 border-2 border-orange-300 shadow-sm'
              }`}
            >
              {isGrill ? (
                <>
                  <i className="fa-solid fa-ice-cream text-sm text-[#FF4B72]"></i>
                  <span>Switch to Frosty's Ice Cream</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-fire text-sm text-orange-500"></i>
                  <span>Switch to Frosty's Grill</span>
                </>
              )}
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isGrill
                ? 'bg-orange-100 text-orange-800'
                : 'bg-pink-100 text-[#FF4B72]'
            }`}
          >
            {isGrill ? (
              <i className="fa-solid fa-fire-flame-curved text-xs"></i>
            ) : (
              <i className="fa-solid fa-ice-cream text-xs"></i>
            )}
            <span>{isGrill ? "Frosty's Grill Catalog" : "Frosty's Dessert Catalog"}</span>
          </div>

          <h3 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            {isGrill ? "Explore Fresh Grill Items" : "Explore Ice Creams & Shakes"}
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
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500 shadow-2xs text-xs sm:text-sm font-semibold transition-colors"
              />
              <i
                className={`fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm ${
                  isGrill ? 'text-orange-500' : 'text-[#FF4B72]'
                }`}
              ></i>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-sm cursor-pointer"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
              <span className="text-stone-400 text-[11px] font-bold mr-1">Category:</span>
              {activeTagsList.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag === 'All' ? null : (activeTag === tag ? null : tag))}
                  className={`px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                    (tag === 'All' && !activeTag) || activeTag === tag
                      ? isGrill
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-[#FF4B72] text-white border-[#FF4B72] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {tag === 'All' ? `All (${shopBaseItems.length})` : tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cross-Shop Discovery Prompt: User searching for Grill in Ice Cream Shop */}
        {isSearchTargetingGrill && (
          <div className="mb-8 p-4 rounded-2xl bg-orange-50 border border-orange-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center text-base font-bold shrink-0">
                <i className="fa-solid fa-fire-flame-curved"></i>
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-stone-900">
                  Looking for Burgers, Sandwiches or BBQ?
                </h4>
                <p className="text-xs text-stone-600">
                  Sizzling food items are served at <strong className="text-orange-700 font-bold">Frosty's Grill</strong>!
                </p>
              </div>
            </div>
            <button
              onClick={() => onSwitchShop('grill')}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-xs shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>Switch to Frosty's Grill</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        )}

        {/* Cross-Shop Discovery Prompt: User searching for Ice Cream in Grill Shop */}
        {isSearchTargetingIceCream && (
          <div className="mb-8 p-4 rounded-2xl bg-pink-50 border border-pink-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#FF4B72] text-white flex items-center justify-center text-base font-bold shrink-0">
                <i className="fa-solid fa-ice-cream"></i>
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-stone-900">
                  Craving Ice Cream, Shakes or Sundaes?
                </h4>
                <p className="text-xs text-stone-600">
                  Artisanal scoops and desserts are available at <strong className="text-[#FF4B72] font-bold">Frosty's Ice Cream</strong>!
                </p>
              </div>
            </div>
            <button
              onClick={() => onSwitchShop('ice-cream')}
              className="px-4 py-2 rounded-xl bg-[#FF4B72] hover:bg-[#E63956] text-white font-black text-xs shadow-xs shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>Switch to Frosty's Ice Cream</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        )}

        {/* Product Catalog Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-xs max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="fa-solid fa-utensils"></i>
            </div>
            <h4 className="font-heading font-black text-lg text-stone-900 mb-1">
              No matching items found
            </h4>
            <p className="text-xs text-stone-500 mb-5">
              Try searching with different keywords or switch between Frosty's Ice Cream and Frosty's Grill.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  handleClearSearch();
                  setActiveTag(null);
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs"
              >
                Reset Search
              </button>
              <button
                onClick={() => onSwitchShop(isGrill ? 'ice-cream' : 'grill')}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs flex items-center gap-1.5 ${
                  isGrill
                    ? 'bg-[#FF4B72] hover:bg-[#E63956]'
                    : 'bg-orange-600 hover:bg-orange-700'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {filteredItems.map((item) => {
              const itemStock = inventory[item.id] ?? 15;
              const isSoldOut = itemStock === 0;
              const isDeal = item.category === 'deals' || !!item.originalPrice;
              const isCone = item.isConeCupAllowed === false || item.category === 'scoops';

              return (
                <div
                  key={item.id}
                  className={`group bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1 ${
                    isDeal
                      ? 'border-amber-300 shadow-sm hover:shadow-md'
                      : 'border-stone-200/90 shadow-2xs hover:shadow-md'
                  } ${isSoldOut ? 'opacity-70' : ''}`}
                >
                  <div>
                    {/* Item Image */}
                    <div
                      className="relative h-48 sm:h-52 overflow-hidden cursor-pointer bg-stone-100"
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
                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                            <i className="fa-solid fa-ban mr-1"></i> Sold Out
                          </span>
                        </div>
                      )}

                      {/* Badge / Deal Ribbon */}
                      {!isSoldOut && (item.badge || item.originalPrice) && (
                        <span
                          className={`absolute top-3 left-3 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider ${
                            item.originalPrice
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : isGrill
                              ? 'bg-orange-600'
                              : 'bg-[#FF4B72]'
                          }`}
                        >
                          {item.badge || 'SPECIAL DEAL'}
                        </span>
                      )}

                      {/* Rating */}
                      {!isSoldOut && item.rating && (
                        <span className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-stone-800 text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs border border-stone-100">
                          <i className="fa-solid fa-star text-amber-400 text-[10px]"></i>
                          <span>{item.rating}</span>
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          onClick={() => onSelectItem(item)}
                          className="font-heading font-black text-base sm:text-lg text-stone-900 group-hover:text-[#FF4B72] transition-colors cursor-pointer line-clamp-1"
                        >
                          {item.name}
                        </h3>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                            isGrill
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'bg-pink-50 text-[#FF4B72] border border-pink-200'
                          }`}
                        >
                          {isGrill ? 'Grill' : 'Ice Cream'}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Delivery Limitation Pill for Cones */}
                      {isCone && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <i className="fa-solid fa-shop text-[9px]"></i>
                            Dine-In & Takeaway Only (Not deliverable)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Price & Add Button */}
                  <div className="p-4 sm:p-5 pt-0 mt-auto border-t border-stone-100 flex items-center justify-between gap-3">
                    <div>
                      {item.originalPrice && (
                        <span className="text-[11px] text-stone-400 font-bold line-through block">
                          Rs. {item.originalPrice}
                        </span>
                      )}
                      <span className="font-heading font-black text-lg sm:text-xl text-stone-900">
                        Rs. {item.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectItem(item)}
                        className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs transition-colors cursor-pointer"
                        title="Quick View"
                      >
                        <i className="fa-solid fa-eye text-stone-400 hover:text-stone-700"></i>
                      </button>

                      {isSoldOut ? (
                        <button
                          disabled
                          className="px-3 py-2 rounded-xl bg-stone-100 text-stone-400 font-bold text-xs cursor-not-allowed flex items-center gap-1"
                        >
                          <i className="fa-solid fa-ban text-[10px]"></i>
                          <span>Sold Out</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectItem(item)}
                          id={`btn-add-${item.id}`}
                          className={`px-3.5 py-2 rounded-xl text-white font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                            isGrill
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                              : 'bg-[#FF4B72] hover:bg-[#E63956]'
                          }`}
                        >
                          {isGrill ? (
                            <i className="fa-solid fa-fire text-[10px]"></i>
                          ) : (
                            <i className="fa-solid fa-plus text-[10px]"></i>
                          )}
                          <span>Order</span>
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
