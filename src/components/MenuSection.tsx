import React, { useState } from 'react';
import { MenuItem, Category } from '../types';
import { CATEGORIES, MENU_ITEMS } from '../data/menuData';

interface MenuSectionProps {
  items?: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  inventory?: { [itemId: string]: number };
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items = MENU_ITEMS,
  onSelectItem,
  onAddToCart,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  inventory = {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category['id']>('all');
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

  const tagsList = ['Milk', 'Rice', 'Oil', 'Tea', 'Snack', 'Nutella', 'Lotus', 'Oreo', 'Chocolate', 'Sundae'];

  const filteredItems = items.filter((item) => {
    // Category match
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    // Search query match
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Active tag match
    const matchesTag = !activeTag || item.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase());

    return matchesCategory && matchesSearch && matchesTag;
  });

  return (
    <section id="menu" className="py-16 bg-[#FFFDF7] text-[#2D1B18] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF4B72]/10 border border-[#FF4B72]/20 text-[#E63956] text-xs font-bold uppercase tracking-wider">
            <i className="fa-solid fa-ice-cream"></i>
            <span>Late-Night Artisanal Desserts & Treats</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#2D1B18] tracking-tight">
            Frosty's Dessert Menu
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            Handcrafted with 100% pure dairy cream, Belgian chocolate, and authentic imported spreads. Made fresh to order in Green City, Lahore!
          </p>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="max-w-2xl mx-auto mb-8 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search Oreo, Nutella Shake, Lotus Waffle, Lava Brownie, Scoops..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-stone-300 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72] focus:border-transparent shadow-sm text-sm font-semibold"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"></i>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-sm"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
            <span className="text-stone-500 font-semibold mr-1">Popular Flavour Tags:</span>
            {['Oreo', 'Nutella', 'Lotus', 'Chocolate', 'Waffle', 'Brownie', 'Sundae', 'Ferrero', 'Combo'].map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full border transition-all ${
                  activeTag === tag
                    ? 'bg-[#FF4B72] text-white border-[#FF4B72] font-bold shadow-sm'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                }`}
              >
                #{tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="text-xs text-[#E63956] underline font-semibold ml-1"
              >
                Clear Tag
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-start md:justify-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center gap-2.5 ${
                selectedCategory === cat.id
                  ? 'bg-[#2D1B18] text-[#FFFDF7] shadow-lg shadow-[#2D1B18]/20 scale-105'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <i className={`${cat.icon} ${selectedCategory === cat.id ? 'text-[#FF4B72]' : 'text-stone-400'}`}></i>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto p-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-cookie-bite"></i>
            </div>
            <h3 className="font-heading font-bold text-lg text-stone-800">No desserts matched</h3>
            <p className="text-xs text-stone-500">
              Try adjusting your search terms or clearing tag filters to see our full dessert menu.
            </p>
            <button
              onClick={() => {
                handleClearSearch();
                setActiveTag(null);
                setSelectedCategory('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#2D1B18] text-white font-semibold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredItems.map((item) => {
              const itemStock = inventory[item.id] ?? 15;
              const isSoldOut = itemStock === 0;
              const isLowStock = itemStock > 0 && itemStock <= 5;

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
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-rose-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-lg border border-rose-400">
                            <i className="fa-solid fa-ban mr-1.5"></i> Out of Stock
                          </span>
                        </div>
                      )}
                      
                      {/* Badge */}
                      {!isSoldOut && item.badge && (
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

                      {isSoldOut ? (
                        <button
                          disabled
                          className="px-3.5 py-2.5 rounded-xl bg-stone-200 text-stone-500 font-bold text-xs cursor-not-allowed flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-ban text-[10px]"></i>
                          <span>Sold Out</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onAddToCart(item)}
                          id={`btn-add-${item.id}`}
                          className="px-4 py-2.5 rounded-xl bg-[#2D1B18] hover:bg-[#FF4B72] text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-plus text-[10px]"></i>
                          <span>Add</span>
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
