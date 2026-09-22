import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { MenuItem, ShopMode } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { isConeCupApplicable } from '../utils/categoryUtils';

interface MenuCategoryGroup {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  description: string;
  filter: (item: MenuItem) => boolean;
  type?: 'dessert' | 'grill' | 'deal';
}

const MENU_CATEGORY_GROUPS: MenuCategoryGroup[] = [
  {
    id: 'scoops',
    name: 'Fresh Scoops & Cones',
    icon: 'fa-solid fa-ice-cream',
    badge: 'Fresh Flavors',
    description: 'Pure cream ice cream in freshly rolled crispy waffle cones or cups with toppings.',
    filter: (item) => item.category === 'scoops',
    type: 'dessert',
  },
  {
    id: 'sundaes',
    name: 'Sundaes & Super Cups',
    icon: 'fa-solid fa-bowl-rice',
    badge: 'Signature',
    description: "Frosty's Super Cups, Deluxe Banana Splits, layered sundaes, and fruit purée cups.",
    filter: (item) => item.category === 'sundaes',
    type: 'dessert',
  },
  {
    id: 'shakes',
    name: 'Milkshakes & Frappes',
    icon: 'fa-solid fa-glass-water',
    badge: 'Thick & Creamy',
    description: 'Oreo shakes, dairy milkshakes, cold Spanish latte, and ice cream mocha frappes.',
    filter: (item) => item.category === 'shakes' || item.category === 'coffees',
    type: 'dessert',
  },
  {
    id: 'burgers',
    name: 'Burgers & Sandwiches',
    icon: 'fa-solid fa-burger',
    badge: 'Fresh & Grilled',
    description: 'Flame-grilled chicken fillet burgers, smash burger deals, and triple-decker club sandwiches.',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('burger') || t.toLowerCase().includes('sandwich')) ||
      item.name.toLowerCase().includes('burger') ||
      item.name.toLowerCase().includes('sandwich'),
    type: 'grill',
  },
  {
    id: 'tacos-wraps',
    name: 'Tacos & Wraps',
    icon: 'fa-solid fa-shapes',
    badge: 'Crispy & Grilled',
    description: 'Crispy chicken tacos with zesty salsa and jumbo flame-grilled chipotle wraps.',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('taco') || t.toLowerCase().includes('wrap')) ||
      item.name.toLowerCase().includes('taco') ||
      item.name.toLowerCase().includes('wrap'),
    type: 'grill',
  },
  {
    id: 'fries-sides',
    name: 'Fries',
    icon: 'fa-solid fa-bowl-food',
    badge: 'Hot & Loaded',
    description: 'Hot shoestring fries, melted cheese fries, and grilled chicken fries supreme.',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('fries')) ||
      item.name.toLowerCase().includes('fries'),
    type: 'grill',
  },
  {
    id: 'chai',
    name: 'Karak Chai',
    icon: 'fa-solid fa-mug-hot',
    badge: 'Clay Matka',
    description: 'Authentic Pakistani hot Karak Chai brewed fresh with whole milk & spices in a clay matka cup.',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('chai') || t.toLowerCase().includes('tea')) ||
      item.name.toLowerCase().includes('chai'),
    type: 'grill',
  },
  {
    id: 'sodas-chillers',
    name: 'Soda Chillers & Kulfi',
    icon: 'fa-solid fa-glass-water-droplet',
    badge: '20 Flavors',
    description: 'Refreshing fruit & mint fizzy soda chillers and traditional rich cream Kulfi.',
    filter: (item) => item.category === 'sodas' || item.category === 'kulfi',
    type: 'dessert',
  },
  {
    id: 'deals',
    name: 'Special Deals',
    icon: 'fa-solid fa-tags',
    badge: 'Value Combos',
    description: 'Family, friends, and special treat combos at discounted prices.',
    filter: (item) => item.category === 'deals' || !!item.originalPrice,
    type: 'deal',
  },
];

interface MenuSectionProps {
  items?: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onAddToCart?: (item: MenuItem) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  inventory?: { [itemId: string]: number };
  activeCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
  triggerToast?: (msg: string) => void;
  activeShop?: ShopMode;
  onSwitchShop?: (shop: ShopMode) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items = MENU_ITEMS,
  onSelectItem,
  onAddToCart,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  inventory = {},
  activeCategory: externalActiveCategory,
  onCategoryChange,
  triggerToast,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const addedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    };
  }, []);

  const activeCategory = externalActiveCategory ?? selectedCategory;
  const setActiveCategory = (catId: string | null) => {
    setSelectedCategory(catId);
    if (onCategoryChange) {
      onCategoryChange(catId);
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

  const q = searchQuery.trim().toLowerCase();

  // Filter items based on query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!q) return true;

      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [items, q]);

  // Categorize filtered items into groups
  const categorizedSections = useMemo(() => {
    const sections: { group: MenuCategoryGroup; items: MenuItem[] }[] = [];
    const matchedIds = new Set<string>();

    for (const group of MENU_CATEGORY_GROUPS) {
      if (activeCategory && activeCategory !== 'all' && activeCategory !== group.id) {
        continue;
      }

      const groupItems = filteredItems.filter((item) => {
        const matches = group.filter(item);
        if (matches) {
          matchedIds.add(item.id);
        }
        return matches;
      });

      if (groupItems.length > 0) {
        sections.push({
          group,
          items: groupItems,
        });
      }
    }

    // Catch any remaining items that didn't match specific group filters
    if (!activeCategory || activeCategory === 'all') {
      const leftoverItems = filteredItems.filter((item) => !matchedIds.has(item.id));
      if (leftoverItems.length > 0) {
        sections.push({
          group: {
            id: 'more-items',
            name: 'More Specialties',
            icon: 'fa-solid fa-sparkles',
            badge: 'Specials',
            description: 'Additional fresh favorites and treats.',
            filter: () => true,
            type: 'dessert',
          },
          items: leftoverItems,
        });
      }
    }

    return sections;
  }, [filteredItems, activeCategory]);

  const handleCategoryNavClick = (groupId: string | null) => {
    const nextCategory = groupId === null || groupId === 'all' ? null : groupId;
    setActiveCategory(nextCategory);

    // Give React time to render the filtered category cleanly so scroll position is accurate
    setTimeout(() => {
      const targetId = nextCategory ? `category-${nextCategory}` : 'menu-category-pills';
      const el = document.getElementById(targetId) || document.getElementById('menu');
      if (el) {
        const navOffset = 90;
        const targetY = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: 'smooth',
        });
      }
    }, 60);
  };

  return (
    <section
      id="menu"
      className="py-10 sm:py-14 bg-[#FAFAF9] text-stone-900 relative scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
            <i className="fa-solid fa-ice-cream text-xs text-red-600"></i>
            <span>Frosty's Menu</span>
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Explore All Items
          </h2>

          {/* Search Bar */}
          <div className="pt-2 max-w-xl mx-auto space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search cones, scoops, shakes, burgers, fries, drinks..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-blue-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-500 shadow-2xs text-xs sm:text-sm font-semibold transition-colors"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm text-red-600"></i>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-sm cursor-pointer"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            {/* Category Navigation Pills */}
            <motion.div
              id="menu-category-pills"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="pt-1 scroll-mt-24"
            >
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
                {/* View All Button */}
                <button
                  onClick={() => handleCategoryNavClick(null)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    !activeCategory || activeCategory === 'all'
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                  }`}
                >
                  <i className="fa-solid fa-layer-group text-[10px]"></i>
                  <span>All ({items.length})</span>
                </button>

                {/* Category Buttons */}
                {MENU_CATEGORY_GROUPS.map((group) => {
                  const count = items.filter(group.filter).length;
                  const isActive = activeCategory === group.id;
                  const isGrill = group.type === 'grill';
                  const isDeal = group.type === 'deal';

                  let btnStyle = '';
                  let iconStyle = '';
                  let badgeStyle = '';

                  if (isActive) {
                    if (isGrill) {
                      btnStyle = 'bg-red-600 text-white border-red-600 shadow-xs';
                      iconStyle = 'text-white';
                      badgeStyle = 'bg-white/20 text-white';
                    } else if (isDeal) {
                      btnStyle = 'bg-amber-600 text-white border-amber-600 shadow-xs';
                      iconStyle = 'text-white';
                      badgeStyle = 'bg-white/20 text-white';
                    } else {
                      // Ice cream, shakes, sundaes (desserts)
                      btnStyle = 'bg-blue-600 text-white border-blue-600 shadow-xs';
                      iconStyle = 'text-white';
                      badgeStyle = 'bg-white/20 text-white';
                    }
                  } else {
                    if (isGrill) {
                      // Light red background & red text for Grill items
                      btnStyle = 'bg-red-50 hover:bg-red-100 text-red-900 border-red-200 hover:border-red-300';
                      iconStyle = 'text-red-600';
                      badgeStyle = 'bg-red-100/90 text-red-800';
                    } else if (isDeal) {
                      // Special Deals
                      btnStyle = 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200 hover:border-amber-300';
                      iconStyle = 'text-amber-600';
                      badgeStyle = 'bg-amber-100/90 text-amber-900';
                    } else {
                      // Light blue background & blue text for Ice cream, shakes, sundaes, etc.
                      btnStyle = 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200 hover:border-blue-300';
                      iconStyle = 'text-blue-600';
                      badgeStyle = 'bg-blue-100/90 text-blue-800';
                    }
                  }

                  return (
                    <button
                      key={group.id}
                      onClick={() => handleCategoryNavClick(isActive ? null : group.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${btnStyle}`}
                    >
                      <i className={`${group.icon} text-[11px] ${iconStyle}`}></i>
                      <span>{group.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${badgeStyle}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeCategory && activeCategory !== 'all' && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 underline font-semibold cursor-pointer"
                  >
                    <span>Showing filtered category. Click here to view all</span>
                    <i className="fa-solid fa-rotate-left text-[10px]"></i>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Empty State */}
        {categorizedSections.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-xs max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl mx-auto mb-3">
              <i className="fa-solid fa-utensils"></i>
            </div>
            <h4 className="font-heading font-black text-lg text-stone-900 mb-1">
              No matching items found
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              Try searching with different keywords like cone, burger, or shake.
            </p>
            <button
              onClick={() => {
                handleClearSearch();
                setActiveCategory(null);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
            >
              Reset Filter & Search
            </button>
          </div>
        ) : (
          /* Category Sections */
          <div className="space-y-12 sm:space-y-14">
            {categorizedSections.map(({ group, items: groupItems }) => (
              <motion.section
                key={group.id}
                id={`category-${group.id}`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08, margin: '-30px' }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="scroll-mt-24 space-y-5"
              >
                {/* Category Header Card */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl bg-white border ${
                    group.type === 'grill'
                      ? 'border-red-100/90 shadow-red-500/5'
                      : group.type === 'deal'
                      ? 'border-amber-100/90 shadow-amber-500/5'
                      : 'border-blue-100/90 shadow-blue-500/5'
                  } shadow-2xs flex items-center justify-between gap-4`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${
                        group.type === 'grill'
                          ? 'bg-red-600'
                          : group.type === 'deal'
                          ? 'bg-amber-600'
                          : 'bg-blue-600'
                      } text-white flex items-center justify-center text-base shadow-xs shrink-0`}
                    >
                      <i className={group.icon}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-black text-base sm:text-lg text-stone-900 tracking-tight">
                          {group.name}
                        </h3>
                        {group.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              group.type === 'grill'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : group.type === 'deal'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            } uppercase tracking-wider`}
                          >
                            {group.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        group.type === 'grill'
                          ? 'bg-red-50 text-red-800 border border-red-100'
                          : group.type === 'deal'
                          ? 'bg-amber-50 text-amber-800 border border-amber-100'
                          : 'bg-blue-50 text-blue-800 border border-blue-100'
                      }`}
                    >
                      {groupItems.length} {groupItems.length === 1 ? 'item' : 'items'}
                    </span>
                    <a
                      href="#menu"
                      className="text-[11px] text-stone-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                      title="Back to Top"
                    >
                      <span>Top</span>
                      <i className="fa-solid fa-arrow-up text-[9px]"></i>
                    </a>
                  </div>
                </div>

                {/* Horizontal Media Object Item Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4.5">
                  {groupItems.map((item, idx) => {
                    const itemStock = inventory[item.id] ?? 15;
                    const isSoldOut = itemStock === 0;
                    const isDeal = item.category === 'deals' || !!item.originalPrice;
                    const isCone = item.category === 'scoops' || isConeCupApplicable(item);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.08, margin: '-15px' }}
                        transition={{ duration: 0.35, delay: (idx % 4) * 0.04, ease: 'easeOut' }}
                        onClick={() => onSelectItem(item)}
                        className={`group bg-white rounded-2xl border border-stone-200/85 hover:border-blue-400 hover:shadow-md hover:shadow-blue-950/5 shadow-2xs transition-all duration-300 overflow-hidden flex flex-row items-stretch hover:-translate-y-0.5 cursor-pointer ${
                          isSoldOut ? 'opacity-75' : ''
                        }`}
                      >
                        {/* Media Object: Thumbnail Image on Left */}
                        <div className="relative w-28 sm:w-36 md:w-40 shrink-0 bg-stone-100 overflow-hidden self-stretch">
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
                            <div className="absolute inset-0 bg-stone-900/65 backdrop-blur-[2px] flex items-center justify-center p-1 text-center">
                              <span className="bg-rose-600 text-white font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                <i className="fa-solid fa-ban mr-0.5"></i> Sold Out
                              </span>
                            </div>
                          )}

                          {/* Deal / Special Ribbon */}
                          {!isSoldOut && (item.badge || item.originalPrice) && (
                            <span className="absolute top-2 left-2 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider bg-red-600">
                              {item.badge || 'DEAL'}
                            </span>
                          )}

                          {/* Rating Pill */}
                          {!isSoldOut && item.rating && (
                            <span className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs text-stone-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-2xs border border-stone-100">
                              <i className="fa-solid fa-star text-amber-400 text-[9px]"></i>
                              <span>{item.rating}</span>
                            </span>
                          )}
                        </div>

                        {/* Media Object Body: Details & Pricing on Right */}
                        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-1.5">
                              <h4 className="font-heading font-black text-sm sm:text-base text-stone-900 group-hover:text-red-600 transition-colors line-clamp-1">
                                {item.name}
                              </h4>
                              {item.popular && (
                                <span className="shrink-0 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                  Popular
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>

                            {/* Delivery Limitation Pill for Cones */}
                            {isCone && (
                              <div className="pt-0.5">
                                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                                  <i className="fa-solid fa-triangle-exclamation text-[8px] text-amber-600"></i>
                                  Takeaway & Dine-in only
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Footer Price & Order Action */}
                          <div className="pt-2 sm:pt-3 mt-1.5 border-t border-stone-100 flex items-center justify-between gap-2">
                            <div>
                              {item.originalPrice && (
                                <span className="text-[10px] sm:text-[11px] text-stone-400 font-bold line-through block">
                                  Rs. {item.originalPrice}
                                </span>
                              )}
                              <span className="font-heading font-black text-sm sm:text-lg text-stone-900">
                                Rs. {item.price}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectItem(item);
                                }}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 text-xs transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <i className="fa-solid fa-eye text-xs"></i>
                              </button>

                              {isSoldOut ? (
                                <button
                                  disabled
                                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-100 text-stone-400 font-bold text-[11px] sm:text-xs cursor-not-allowed flex items-center gap-1"
                                >
                                  <i className="fa-solid fa-ban text-[9px]"></i>
                                  <span>Sold Out</span>
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const needsModal = (item.variants && item.variants.length > 1) || item.category === 'scoops' || item.category === 'sundaes';
                                    if (needsModal || !onAddToCart) {
                                      onSelectItem(item);
                                    } else {
                                      onAddToCart(item);
                                      setAddedItemId(item.id);
                                      if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
                                      addedTimeoutRef.current = setTimeout(() => {
                                        setAddedItemId(null);
                                      }, 1100);
                                      if (triggerToast) {
                                        triggerToast(`Added ${item.name} to cart!`);
                                      }
                                    }
                                  }}
                                  id={`btn-add-${item.id}`}
                                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                                    addedItemId === item.id
                                      ? 'bg-emerald-600 text-white animate-cart-bounce'
                                      : 'bg-red-600 hover:bg-red-700 active:scale-95 text-white hover:scale-105'
                                  }`}
                                  title={addedItemId === item.id ? 'Added to Cart!' : 'Add to Cart'}
                                >
                                  {addedItemId === item.id ? (
                                    <>
                                      <i className="fa-solid fa-check text-[10px] animate-checkmark-pop"></i>
                                      <span>Added!</span>
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa-solid fa-plus text-[9px]"></i>
                                      <span>Add</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
