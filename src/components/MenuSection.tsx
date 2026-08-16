import React, { useState } from 'react';
import { MenuItem } from '../types';
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
  onNavigateToFrostysFlame?: () => void;
  triggerToast?: (msg: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items = MENU_ITEMS,
  onSelectItem,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  inventory = {},
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const searchQuery = externalSearchQuery || internalSearchQuery;

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

  // Filter items based purely on search query and tag chips (No category restriction)
  const filteredItems = items.filter((item) => {
    const q = searchQuery.trim().toLowerCase();

    let matchesSearch = true;
    if (q) {
      const qIsCone = q === 'cone' || q === 'cones';
      const qIsSundae = q === 'sundae' || q === 'sundaes';
      const qIsDeal = q === 'deal' || q === 'deals';
      const qIsShake = q === 'shake' || q === 'shakes' || q === 'milkshake' || q === 'milkshakes';
      const qIsKulfi = q === 'kulfi';
      const qIsCoffee = q === 'coffee' || q === 'coffees' || q === 'latte' || q === 'frappe';
      const qIsSoda = q === 'soda' || q === 'sodas' || q === 'chiller' || q === 'chillers';

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
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
    }

    const matchesTag =
      !activeTag ||
      item.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase()) ||
      item.name.toLowerCase().includes(activeTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  return (
    <section id="menu" className="py-16 bg-[#FFFDF7] text-[#2D1B18] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF4B72]/10 border border-[#FF4B72]/20 text-[#E63956] text-xs font-bold uppercase tracking-wider shadow-sm">
            <i className="fa-solid fa-ice-cream"></i>
            <span>Fresh Handcrafted Dessert Catalog</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#2D1B18] tracking-tight">
            Our Complete Menu
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            Explore all our handcrafted ice cream scoops, soft serve cones, signature sundaes, rich milkshakes, traditional kulfi, cold coffees, deals, and soda chillers in one continuous menu!
          </p>

          {/* Search & Tag Filter Bar */}
          <div className="pt-4 max-w-2xl mx-auto space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search any menu item (e.g. Waffle Cone, Vanilla, Banana Split, Oreo Shake)..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-stone-300 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72] focus:border-transparent shadow-sm text-sm font-semibold"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#FF4B72]"></i>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-sm"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
              <span className="text-stone-500 font-semibold mr-1">Filter by:</span>
              <button
                onClick={() => { setActiveTag(null); handleClearSearch(); }}
                className={`px-3 py-1 rounded-full border text-xs font-bold transition-all ${
                  !activeTag && !searchQuery
                    ? 'bg-[#2D1B18] text-amber-300 border-[#2D1B18] shadow-sm'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                }`}
              >
                All Items ({items.length})
              </button>
              {['Cone', 'Vanilla', 'Chocolate', 'Banana Split', 'Sundae', 'Shake', 'Kulfi', 'Soda Chiller', 'Deal'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                    activeTag === tag
                      ? 'bg-[#FF4B72] text-white border-[#FF4B72] shadow-sm'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-[#FF4B72] hover:text-white hover:border-[#FF4B72]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items Count Banner */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-200 mb-8">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-xl sm:text-2xl text-[#2D1B18]">
              {searchQuery ? `Search Results for "${searchQuery}"` : activeTag ? `Showing #${activeTag}` : 'All Menu Items'}
            </span>
            <span className="bg-stone-100 text-stone-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-stone-200">
              {filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {(searchQuery || activeTag) && (
            <button
              onClick={() => { handleClearSearch(); setActiveTag(null); }}
              className="text-xs text-[#FF4B72] hover:underline font-bold flex items-center gap-1"
            >
              <i className="fa-solid fa-rotate-left"></i>
              <span>Show All Items</span>
            </button>
          )}
        </div>

        {/* Empty Search State */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto p-8 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-cookie-bite"></i>
            </div>
            <h3 className="font-heading font-bold text-lg text-stone-800">No items found</h3>
            <p className="text-xs text-stone-500">
              We couldn't find any menu item matching your search. Try checking your spelling or reset the filters.
            </p>
            <button
              onClick={() => { handleClearSearch(); setActiveTag(null); }}
              className="px-4 py-2 rounded-xl bg-[#2D1B18] hover:bg-[#FF4B72] text-white font-semibold text-xs transition-colors shadow-md"
            >
              Reset & View All Items
            </button>
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
                        id={`btn-add-${item.id}`}
                        className={`px-4 py-3 rounded-2xl font-extrabold text-xs transition-all shadow-lg flex items-center gap-2 ${
                          isSoldOut
                            ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#FF4B72] to-amber-500 hover:from-amber-500 hover:to-[#FF4B72] text-white shadow-pink-500/20 hover:scale-105'
                        }`}
                      >
                        <i className="fa-solid fa-fire text-amber-200"></i>
                        <span>Customize & Claim</span>
                      </button>
                    </div>
                  </div>
                );
              }

              /* Standard Product Card View */
              return (
                <div
                  key={item.id}
                  className={`group bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1 ${
                    isSoldOut ? 'border-rose-200 opacity-90' : 'border-stone-200/90'
                  }`}
                >
                  <div>
                    {/* Item Image & Badge Container */}
                    <div
                      className="relative h-48 overflow-hidden bg-stone-100 cursor-pointer"
                      onClick={() => onSelectItem(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isSoldOut ? 'grayscale scale-100' : 'group-hover:scale-105'
                        }`}
                      />

                      {/* Sold Out Overlay */}
                      {isSoldOut && !item.isComingSoon && (
                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-rose-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-lg border border-rose-400">
                            <i className="fa-solid fa-ban mr-1.5"></i> Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Coming Soon Overlay Ribbon */}
                      {item.isComingSoon && (
                        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center p-4">
                          <span className="bg-amber-400 text-[#2D1B18] font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xl border-2 border-amber-500 flex items-center gap-1.5 animate-pulse">
                            <i className="fa-solid fa-clock"></i>
                            <span>Launching Soon</span>
                          </span>
                        </div>
                      )}

                      {/* Badge */}
                      {!isSoldOut && item.badge && !item.isComingSoon && (
                        <span className="absolute top-3 left-3 bg-[#FF4B72] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}

                      {/* Rating */}
                      {!isSoldOut && item.rating && (
                        <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                          <i className="fa-solid fa-star text-amber-400"></i>
                          <span className="text-white">{item.rating}</span>
                        </span>
                      )}
                    </div>

                    {/* Card Details */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          onClick={() => onSelectItem(item)}
                          className="font-heading font-bold text-lg text-[#2D1B18] group-hover:text-[#E63956] transition-colors cursor-pointer line-clamp-1"
                        >
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Tags */}
                      {item.tags && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Price & Add Button */}
                  <div className="p-5 pt-0 mt-auto border-t border-stone-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-stone-400 font-semibold block">
                        {item.unit ? item.unit : 'Price'}
                      </span>
                      <span className="font-heading font-black text-xl text-[#2D1B18]">
                        Rs. {item.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectItem(item)}
                        className="p-2.5 rounded-xl text-stone-500 hover:text-[#2D1B18] hover:bg-stone-100 text-xs font-semibold"
                        title="View Details"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>

                      {item.isComingSoon ? (
                        <button
                          disabled
                          className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 font-extrabold text-xs cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                          title="Launching in 1-2 weeks - ordering disabled"
                        >
                          <i className="fa-solid fa-clock text-amber-600"></i>
                          <span>Coming Soon</span>
                        </button>
                      ) : isSoldOut ? (
                        <button
                          disabled
                          className="px-3.5 py-2.5 rounded-xl bg-stone-200 text-stone-500 font-bold text-xs cursor-not-allowed flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-ban text-[10px]"></i>
                          <span>Sold Out</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectItem(item)}
                          id={`btn-add-${item.id}`}
                          className="px-4 py-2.5 rounded-xl bg-[#2D1B18] hover:bg-[#FF4B72] text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-wand-magic-sparkles text-[10px] text-amber-300"></i>
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
