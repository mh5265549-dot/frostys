import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, Category } from '../types';
import { CATEGORIES, MENU_ITEMS } from '../data/menuData';
import { FrostysFlameMetalBoard } from './FrostysFlameMetalBoard';

interface MenuSectionProps {
  items?: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  inventory?: { [itemId: string]: number };
  activeCategory?: Category['id'] | null;
  onCategoryChange?: (category: Category['id'] | null) => void;
  onNavigateToFrostysFlame?: () => void;
  triggerToast?: (msg: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items = MENU_ITEMS,
  onSelectItem,
  onAddToCart,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  inventory = {},
  activeCategory: externalActiveCategory = null,
  onCategoryChange,
  onNavigateToFrostysFlame,
  triggerToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category['id'] | null>(
    externalActiveCategory ?? null
  );
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [animatingCatId, setAnimatingCatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (externalActiveCategory !== undefined) {
      setSelectedCategory(externalActiveCategory);
    }
  }, [externalActiveCategory]);

  const handleCategorySelect = (catId: Category['id'] | null) => {
    if (!catId) {
      setSelectedCategory(null);
      if (onCategoryChange) onCategoryChange(null);
      return;
    }

    if (catId === 'fast-food-bbq' && onNavigateToFrostysFlame) {
      onNavigateToFrostysFlame();
      return;
    }

    // Trigger visual pop and skeleton loading delay
    setAnimatingCatId(catId);
    setSelectedCategory(catId);
    setIsLoading(true);

    if (onCategoryChange) {
      onCategoryChange(catId);
    }

    // Smooth skeleton delay to provide satisfying responsive feedback
    setTimeout(() => {
      setIsLoading(false);
      setAnimatingCatId(null);
    }, 380);

    // Smoothly scroll to menu section
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToAllCategories = () => {
    setSelectedCategory(null);
    setActiveTag(null);
    if (onCategoryChange) {
      onCategoryChange(null);
    }
    if (onSearchChange) {
      onSearchChange('');
    } else {
      setInternalSearchQuery('');
    }
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  // Determine whether we are in "Category-Only Grid" mode or "Products Listing" mode
  // If no category is explicitly selected AND there's no active search query or tag, show ONLY the category cards.
  const isCategoryOnlyView = selectedCategory === null && !searchQuery.trim() && !activeTag;

  // Filter items based on category, search query, and tags
  const filteredItems = items.filter((item) => {
    const q = searchQuery.trim().toLowerCase();

    // Search query match
    let matchesSearch = true;
    if (q) {
      const qIsCone = q === 'cone' || q === 'cones';
      const qIsSundae = q === 'sundae' || q === 'sundaes';
      const qIsDeal = q === 'deal' || q === 'deals';
      const qIsShake = q === 'shake' || q === 'shakes' || q === 'milkshake' || q === 'milkshakes';
      const qIsKulfi = q === 'kulfi';
      const qIsCoffee = q === 'coffee' || q === 'coffees' || q === 'latte' || q === 'frappe';
      const qIsSoda = q === 'soda' || q === 'sodas' || q === 'chiller' || q === 'chillers';
      const qIsFastFood =
        q === 'burger' ||
        q === 'burgers' ||
        q === 'bbq' ||
        q === 'taco' ||
        q === 'tacos' ||
        q === 'sandwich' ||
        q === 'sandwiches' ||
        q === 'fast food' ||
        q === 'tikka';

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
        (qIsFastFood &&
          (item.category === 'fast-food-bbq' ||
            item.name.toLowerCase().includes('burger') ||
            item.name.toLowerCase().includes('bbq') ||
            item.name.toLowerCase().includes('taco') ||
            item.name.toLowerCase().includes('sandwich'))) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
    }

    // Category match: if selectedCategory is 'all' or null, match all items
    const matchesCategory =
      !selectedCategory || selectedCategory === 'all' || item.category === selectedCategory;

    // Active tag match
    const matchesTag =
      !activeTag ||
      item.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase()) ||
      item.name.toLowerCase().includes(activeTag.toLowerCase());

    return matchesCategory && matchesSearch && matchesTag;
  });

  // Active category metadata object
  const currentCategoryMeta = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <section id="menu" className="py-16 bg-[#FFFDF7] text-[#2D1B18] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* VIEW 1: CATEGORY-ONLY SCROLL VIEW (Default when scrolling from Hero)      */}
        {/* All product items are strictly hidden until user picks a category or searches */}
        {/* ========================================================================= */}
        {isCategoryOnlyView ? (
          <div className="space-y-10 animate-fadeIn">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF4B72]/10 border border-[#FF4B72]/20 text-[#E63956] text-xs font-bold uppercase tracking-wider shadow-sm">
                <i className="fa-solid fa-ice-cream"></i>
                <span>Fresh Late-Night Dessert Selection</span>
              </div>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#2D1B18] tracking-tight">
                Explore Menu by Category
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
                Select any dessert category below to reveal our handcrafted ice cream scoops, signature sundaes, rich milkshakes, traditional kulfi, cold coffees, and 20 soda chillers.
              </p>
            </div>

            {/* Quick In-Menu Search & Tags Bar */}
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Or search any item directly (e.g., Banana Split, Mango Cone, Oreo Shake)..."
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

              {/* Popular Search Filter Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
                <span className="text-stone-500 font-semibold mr-1">Popular Tags:</span>
                {['Cone', 'Vanilla', 'Chocolate', 'Banana Split', 'Sundae', 'Oreo', 'Kulfi', 'Soda Chiller', 'Deal'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className="px-3 py-1 rounded-full border bg-stone-100 text-stone-600 border-stone-200 hover:bg-[#FF4B72] hover:text-white hover:border-[#FF4B72] transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Prominent Category Showcase Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
              {CATEGORIES.map((cat, idx) => {
                // Count items in category
                const catItemCount =
                  cat.id === 'all'
                    ? items.length
                    : items.filter((i) => i.category === cat.id).length;

                const isGrill = cat.id === 'fast-food-bbq';
                const isDeals = cat.id === 'deals';
                const isCurrentLoading = animatingCatId === cat.id;

                return (
                  <motion.div
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    id={`category-card-${cat.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      isCurrentLoading
                        ? { scale: [1, 0.93, 1.07, 1], transition: { duration: 0.28, ease: "easeInOut" } }
                        : { opacity: 1, y: 0, transition: { duration: 0.35, delay: idx * 0.04 } }
                    }
                    whileHover={{ scale: 1.03, y: -6 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    className={`group relative rounded-3xl overflow-hidden cursor-pointer border transition-colors duration-300 flex flex-col justify-between select-none ${
                      isCurrentLoading
                        ? 'ring-4 ring-[#FF4B72] shadow-2xl scale-[1.03]'
                        : isDeals
                        ? 'bg-gradient-to-br from-[#2D1B18] via-[#36162B] to-[#2D1B18] text-white border-amber-400/60 shadow-xl hover:shadow-2xl hover:border-amber-300'
                        : isGrill
                        ? 'bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#1C1917] text-white border-orange-500/50 shadow-xl hover:shadow-2xl hover:border-orange-400'
                        : 'bg-white text-[#2D1B18] border-stone-200/90 shadow-md hover:shadow-2xl hover:border-[#FF4B72]/50'
                    }`}
                  >
                    {/* Visual Loading Pop Overlay on Click */}
                    {isCurrentLoading && (
                      <div className="absolute inset-0 z-30 bg-[#2D1B18]/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-fadeIn">
                        <div className="w-12 h-12 rounded-full bg-[#FF4B72] text-white flex items-center justify-center text-xl shadow-lg mb-2 animate-bounce">
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </div>
                        <span className="font-heading font-black text-sm text-white tracking-wide">
                          Opening {cat.name}...
                        </span>
                        <span className="text-[11px] text-amber-300 font-semibold mt-1">
                          Loading products
                        </span>
                      </div>
                    )}

                    {/* Category Image Cover */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-900">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 group-active:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2D1B18] flex items-center justify-center">
                          <i className={`${cat.icon} text-5xl text-[#FF4B72]`}></i>
                        </div>
                      )}

                      {/* Gradient Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                        {cat.badge && (
                          <span
                            className={`text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full shadow-lg backdrop-blur-md transition-transform group-hover:scale-105 ${
                              isDeals
                                ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-stone-950 border border-amber-300'
                                : isGrill
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 border border-orange-300'
                                : 'bg-[#FF4B72] text-white'
                            }`}
                          >
                            {cat.badge}
                          </span>
                        )}

                        {/* Starting Price / Count Pill */}
                        {cat.startingPrice && (
                          <span className="bg-black/70 backdrop-blur-md text-amber-300 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-white/10 shadow-md">
                            {cat.startingPrice}
                          </span>
                        )}
                      </div>

                      {/* Bottom Image Overlay Tag */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center gap-2 text-white z-10">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-110 transition-transform">
                          <i className={`${cat.icon} text-sm`}></i>
                        </div>
                        <span className="text-xs font-bold tracking-wide text-white/90 drop-shadow">
                          {catItemCount > 0 ? `${catItemCount} Items Listed` : 'Artisanal Selection'}
                        </span>
                      </div>
                    </div>

                    {/* Category Card Body Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className={`font-heading font-black text-lg sm:text-xl transition-colors line-clamp-1 ${
                          isDeals ? 'text-amber-300 group-hover:text-amber-200' : isGrill ? 'text-orange-400 group-hover:text-orange-300' : 'text-[#2D1B18] group-hover:text-[#E63956]'
                        }`}>
                          {cat.name}
                        </h3>
                        <p className={`text-xs leading-relaxed line-clamp-2 ${
                          isDeals || isGrill ? 'text-stone-300' : 'text-stone-600'
                        }`}>
                          {cat.description}
                        </p>
                      </div>

                      {/* Explore Action Button */}
                      <div className={`pt-3 border-t flex items-center justify-between font-bold text-xs ${
                        isDeals || isGrill ? 'border-white/10' : 'border-stone-100'
                      }`}>
                        <span className={`${
                          isDeals ? 'text-amber-300' : isGrill ? 'text-orange-400' : 'text-[#FF4B72]'
                        }`}>
                          {isGrill ? 'Open Teaser Board' : isDeals ? 'View Combo Deals' : 'View Products'}
                        </span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all group-hover:translate-x-1.5 group-hover:scale-110 shadow-sm ${
                          isDeals
                            ? 'bg-amber-400 text-stone-900'
                            : isGrill
                            ? 'bg-orange-500 text-white'
                            : 'bg-[#2D1B18] group-hover:bg-[#FF4B72] text-white'
                        }`}>
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: INTERACTIVE PRODUCTS LISTING VIEW (Expands on Category Click)     */
          /* Displays filtered items belonging strictly to the selected category      */
          /* ========================================================================= */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-8"
          >
            
            {/* Top Navigation & Breadcrumb Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-md">
              
              {/* Back to Categories Button */}
              <button
                onClick={handleBackToAllCategories}
                id="btn-back-to-categories"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#2D1B18] hover:bg-[#FF4B72] text-white text-xs sm:text-sm font-bold shadow-md transition-all duration-200 hover:scale-105 active:scale-95 group w-fit"
              >
                <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform text-xs"></i>
                <span>← All Categories</span>
              </button>

              {/* Active Category Title & Count Badge */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF4B72]/10 border border-[#FF4B72]/20 flex items-center justify-center text-[#FF4B72] text-lg">
                  <i className={currentCategoryMeta?.icon || 'fa-solid fa-ice-cream'}></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-black text-xl sm:text-2xl text-[#2D1B18]">
                      {searchQuery
                        ? `Search: "${searchQuery}"`
                        : currentCategoryMeta?.name || 'Selected Category'}
                    </h2>
                    <span className="bg-stone-100 text-stone-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-stone-200">
                      {filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                    {searchQuery
                      ? 'Matching search results from our catalog'
                      : currentCategoryMeta?.description || 'Browse all products in this category'}
                  </p>
                </div>
              </div>

              {/* Search Within View */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Filter items..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72] text-xs font-semibold"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs"></i>
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>

            </div>

            {/* Quick Horizontal Category Switcher Bar */}
            <div className="flex items-center justify-start gap-2 overflow-x-auto pb-2 no-scrollbar">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToAllCategories}
                className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200 flex items-center gap-1.5 shadow-sm"
              >
                <i className="fa-solid fa-grid-2"></i>
                <span>All Categories</span>
              </motion.button>

              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-[#2D1B18] text-[#FFFDF7] shadow-md shadow-[#2D1B18]/20 ring-2 ring-[#FF4B72]/50 scale-105'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <i className={`${cat.icon} ${selectedCategory === cat.id ? 'text-[#FF4B72]' : 'text-stone-400'}`}></i>
                  <span>{cat.name}</span>
                  {cat.id === 'deals' && (
                    <span className="bg-[#FF4B72] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      HOT
                    </span>
                  )}
                  {cat.id === 'fast-food-bbq' && (
                    <span className="bg-amber-400 text-[#2D1B18] text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      SOON
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Frosty's Flame Industrial Steel Metal Board Section */}
            {selectedCategory === 'fast-food-bbq' ? (
              <FrostysFlameMetalBoard
                onBackToDesserts={handleBackToAllCategories}
                triggerToast={triggerToast}
              />
            ) : (
              <>
                {/* Promotional Banner for Deals Category */}
                {selectedCategory === 'deals' && (
                  <div className="bg-gradient-to-r from-[#2D1B18] via-[#3B172C] to-[#2D1B18] text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400/60 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold uppercase tracking-wider border border-amber-400/40">
                          <i className="fa-solid fa-gift text-amber-400"></i>
                          <span>Exclusive Promotional Combo Deals</span>
                        </div>
                        <h3 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white">
                          Special Ice Cream & Soda Combos
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                          Enjoy our top artisanal ice cream scoops combined with refreshing chilled sodas at unbeatable prices! Select your custom ice cream & soda flavors before ordering on WhatsApp.
                        </p>
                      </div>
                      <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shadow-inner">
                        <span className="text-xs text-amber-300 font-bold block uppercase tracking-wider">Save Up To</span>
                        <span className="font-heading font-black text-3xl text-amber-400">200 PKR</span>
                        <span className="text-[10px] text-stone-300 block">per promotional deal</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skeleton Loading State or Filtered Products Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 lg:gap-8 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((sk) => (
                      <div
                        key={sk}
                        className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Skeleton Image with Shimmer */}
                          <div className="relative h-48 bg-stone-200 overflow-hidden">
                            <div className="absolute top-3 left-3 w-20 h-5 bg-stone-300 rounded-full" />
                            <div className="absolute bottom-3 right-3 w-12 h-6 bg-stone-300/80 rounded-lg" />
                          </div>
                          {/* Skeleton Content */}
                          <div className="p-5 space-y-3">
                            <div className="h-5 bg-stone-200 rounded-md w-3/4" />
                            <div className="space-y-1.5 pt-1">
                              <div className="h-3.5 bg-stone-200 rounded-md w-full" />
                              <div className="h-3.5 bg-stone-200 rounded-md w-4/5" />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <div className="h-5 bg-stone-100 rounded w-16" />
                              <div className="h-5 bg-stone-100 rounded w-14" />
                            </div>
                          </div>
                        </div>
                        {/* Skeleton Footer */}
                        <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="h-3 bg-stone-200 rounded w-10" />
                            <div className="h-6 bg-stone-200 rounded w-20" />
                          </div>
                          <div className="h-9 bg-stone-200 rounded-xl w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto p-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
                      <i className="fa-solid fa-cookie-bite"></i>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-stone-800">No items matched</h3>
                    <p className="text-xs text-stone-500">
                      Try adjusting your search terms or clearing filters to view all products in this category.
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={handleClearSearch}
                        className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
                      >
                        Clear Search
                      </button>
                      <button
                        onClick={handleBackToAllCategories}
                        className="px-4 py-2 rounded-xl bg-[#2D1B18] hover:bg-[#FF4B72] text-white font-semibold text-xs transition-colors"
                      >
                        Back to Categories
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Filtered Product Cards Grid */
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
              </>
            )}
          </motion.div>
        )}

      </div>
    </section>
  );
};
