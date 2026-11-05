import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { MenuItem, ShopMode } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { isConeCupApplicable } from '../utils/categoryUtils';
import { FluidText } from './FluidText';

interface MenuCategoryGroup {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  description: string;
  filter: (item: MenuItem) => boolean;
  type?: 'dessert' | 'grill' | 'deal';
}

/**
 * Strict ice cream classifier:
 * Categorizes all scoops, cones, sundaes, super cups, kulfi, and ice cream deals.
 * Guarantees that ice cream items are NEVER shown under fast food, grill, drinks, or green teas.
 */
export const isIceCreamItem = (item: MenuItem): boolean => {
  const cat = (item.category || '').toLowerCase();
  const name = item.name.toLowerCase();
  const id = item.id.toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase());

  // Beverages (shakes, coffees, sodas, and chai) are drinks, NOT pure ice cream desserts
  if (
    cat === 'shakes' ||
    cat === 'coffees' ||
    cat === 'sodas' ||
    cat === 'chai' ||
    cat === 'green-teas' ||
    item.isBeverage === true
  ) {
    return false;
  }

  // Ice cream specific categories
  if (
    cat === 'ice-cream' ||
    cat === 'scoops' ||
    cat === 'sundaes' ||
    cat === 'kulfi'
  ) {
    return true;
  }

  // Ice cream deals & combos
  if (
    id === 'deal-family' ||
    id === 'deal-friends' ||
    id === 'deal-super-sundae' ||
    tags.some(
      (t) =>
        t.includes('scoop') ||
        t.includes('sundae') ||
        t.includes('5 scoops') ||
        t.includes('6 scoops') ||
        t.includes('super sundae')
    ) ||
    name.includes('super sundae') ||
    name.includes('scoop')
  ) {
    return true;
  }

  // Pure ice cream tag or name identifiers
  if (
    tags.some(
      (t) =>
        t.includes('ice cream') ||
        t.includes('scoop') ||
        t.includes('sundae') ||
        t.includes('cone') ||
        t.includes('waffle cone') ||
        t.includes('kulfi') ||
        t.includes('banana split') ||
        t.includes('super cup') ||
        t.includes('kulfa')
    )
  ) {
    return true;
  }

  if (
    name.includes('ice cream') ||
    name.includes('cone') ||
    name.includes('scoop') ||
    name.includes('sundae') ||
    name.includes('banana split') ||
    name.includes('super cup') ||
    name.includes('kulfi') ||
    name.includes('kulfa')
  ) {
    return true;
  }

  return false;
};

const MENU_CATEGORY_GROUPS: MenuCategoryGroup[] = [
  {
    id: 'fast-food',
    name: 'fast food',
    icon: 'fa-solid fa-burger',
    badge: 'Burgers & Rolls',
    description: 'Flame-grilled burgers, crispy tacos, loaded fries supreme, and freshly toasted paratha rolls.',
    filter: (item) => {
      // STRICT RULE: Ice creams must NEVER appear in fast food
      if (isIceCreamItem(item)) {
        return false;
      }
      const cat = (item.category || '').toLowerCase();
      const name = item.name.toLowerCase();
      const tags = (item.tags || []).map((t) => t.toLowerCase());

      // Only match authentic savory rolls (paratha rolls, tikka rolls, kabab rolls) - NEVER waffle cones!
      const isSavoryRoll =
        (name.includes('roll') && !name.includes('cone') && !name.includes('waffle') && !name.includes('cream')) ||
        tags.some((t) => t.includes('paratha roll') || t.includes('boti roll') || t.includes('kabab roll') || t.includes('jumbo roll'));

      return (
        cat === 'fast-food' ||
        cat === 'burgers' ||
        cat === 'tacos' ||
        cat === 'fries' ||
        cat === 'sandwiches' ||
        item.id === 'deal-crispy-burger-meal' ||
        isSavoryRoll ||
        tags.some((t) =>
          t.includes('fast food') ||
          t.includes('burger') ||
          t.includes('taco') ||
          t.includes('fries') ||
          t.includes('sandwich') ||
          t.includes('gyro')
        ) ||
        name.includes('burger') ||
        name.includes('taco') ||
        name.includes('fries') ||
        name.includes('sandwich') ||
        name.includes('wrap') ||
        name.includes('gyro')
      );
    },
    type: 'grill',
  },
  {
    id: 'grill',
    name: 'grill',
    icon: 'fa-solid fa-drumstick-bite',
    badge: 'Charcoal & Fish',
    description: 'Grill Fish (Kala Rahu Rs 2200/KG), Charcoal Malai & Tikka Boti, Wings, 19B & Hot Sour Soups, Platters, and Tandoori Sides.',
    filter: (item) => {
      // STRICT RULE: Ice creams must NEVER appear in grill
      if (isIceCreamItem(item)) {
        return false;
      }
      const cat = (item.category || '').toLowerCase();
      const name = item.name.toLowerCase();
      const tags = (item.tags || []).map((t) => t.toLowerCase());

      // Exclude fast food items (rolls, burgers, tacos, fries, wraps, gyro, sandwiches)
      if (
        name.includes('roll') ||
        cat === 'fast-food' ||
        name.includes('burger') ||
        name.includes('sandwich') ||
        name.includes('fries') ||
        name.includes('taco') ||
        name.includes('wrap') ||
        name.includes('gyro') ||
        item.id === 'deal-crispy-burger-meal'
      ) {
        return false;
      }

      // Only BBQ & Grill Deals (e.g. Deal 1, Deal 2, Family BBQ Platter)
      const isBbqDeal =
        item.id === 'deal-1' ||
        item.id === 'deal-2' ||
        item.id === 'deal-family-bbq-platter' ||
        tags.some((t) => t.includes('bbq deal') || t.includes('tikka deal') || t.includes('bbq platter'));

      return (
        cat === 'grill' ||
        cat === 'bbq' ||
        cat === 'bbq-main' ||
        cat === 'bbq-sides' ||
        isBbqDeal ||
        tags.some((t) =>
          t.includes('grill') ||
          t.includes('fish') ||
          t.includes('kala rahu') ||
          t.includes('bbq') ||
          t.includes('tikka') ||
          t.includes('malai boti') ||
          t.includes('kabab') ||
          t.includes('soup') ||
          t.includes('salad') ||
          t.includes('raita') ||
          t.includes('naan') ||
          t.includes('roti') ||
          t.includes('platter') ||
          t.includes('wings')
        ) ||
        name.includes('fish') ||
        name.includes('soup') ||
        name.includes('tikka') ||
        name.includes('malai boti') ||
        name.includes('kabab') ||
        name.includes('wings') ||
        name.includes('platter') ||
        name.includes('chest piece') ||
        name.includes('leg piece') ||
        name.includes('salad') ||
        name.includes('raita') ||
        name.includes('naan') ||
        name.includes('roti')
      );
    },
    type: 'grill',
  },
  {
    id: 'drinks',
    name: 'drinks (hot/cold beverages)',
    icon: 'fa-solid fa-mug-hot',
    badge: 'Hot & Cold',
    description: 'Thick creamy milkshakes, cold Spanish latte, iced coffees, fruit soda chillers, and hot Karak Chai matka.',
    filter: (item) => {
      // STRICT RULE: Pure ice cream desserts must NEVER appear in drinks
      if (isIceCreamItem(item)) {
        return false;
      }
      const cat = (item.category || '').toLowerCase();
      const name = item.name.toLowerCase();
      const tags = (item.tags || []).map((t) => t.toLowerCase());

      // Exclude green tea items
      if (
        cat === 'green-teas' ||
        name.includes('green tea') ||
        name.includes('qehwa') ||
        tags.includes('green tea') ||
        tags.includes('qehwa')
      ) {
        return false;
      }

      return (
        cat === 'drinks' ||
        cat === 'shakes' ||
        cat === 'coffees' ||
        cat === 'sodas' ||
        cat === 'chai' ||
        item.isBeverage === true ||
        tags.some((t) =>
          t.includes('shake') ||
          t.includes('coffee') ||
          t.includes('frappe') ||
          t.includes('soda') ||
          t.includes('chiller') ||
          t.includes('chai')
        ) ||
        name.includes('shake') ||
        name.includes('coffee') ||
        name.includes('frappe') ||
        name.includes('chiller') ||
        name.includes('chai') ||
        name.includes('latte')
      );
    },
    type: 'dessert',
  },
  {
    id: 'ice-cream',
    name: 'ice cream',
    icon: 'fa-solid fa-ice-cream',
    badge: 'Cups & Cones',
    description: 'Pure cream artisanal ice cream cups, Super Cups, Deluxe Banana Splits, and crispy freshly rolled waffle cones.',
    filter: (item) => {
      // ALL and ONLY ice cream items belong in this section
      return isIceCreamItem(item);
    },
    type: 'dessert',
  },
  {
    id: 'green-teas',
    name: "Green tea's",
    icon: 'fa-solid fa-leaf',
    badge: 'Qehwa & Herbal',
    description: 'Hot steaming Peshawari Qehwa, Cardamom & Mint Green Tea, and Lemon & Honey Green Tea.',
    filter: (item) => {
      if (isIceCreamItem(item)) {
        return false;
      }
      const cat = (item.category || '').toLowerCase();
      const name = item.name.toLowerCase();
      const tags = (item.tags || []).map((t) => t.toLowerCase());
      return (
        cat === 'green-teas' ||
        tags.some((t) => t.includes('green tea') || t.includes('qehwa')) ||
        name.includes('green tea') ||
        name.includes('qehwa')
      );
    },
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

      const groupItems = filteredItems.filter((item) => group.filter(item));
      groupItems.forEach((item) => matchedIds.add(item.id));

      const isDealItem = (it: MenuItem) =>
        it.category === 'deals' ||
        it.id.startsWith('deal-') ||
        (it.badge && it.badge.toLowerCase().includes('deal')) ||
        (it.tags && it.tags.some((t) => t.toLowerCase().includes('deal') || t.toLowerCase().includes('combo deal')));

      const regularItems = groupItems.filter((it) => !isDealItem(it));
      const dealItems = groupItems.filter(isDealItem);
      const sortedGroupItems = [...regularItems, ...dealItems];

      if (sortedGroupItems.length > 0) {
        sections.push({
          group,
          items: sortedGroupItems,
        });
      }
    }

    // Catch any remaining items that didn't match specific group filters
    if (!activeCategory || activeCategory === 'all') {
      const leftoverItems = filteredItems.filter(
        (item) => !matchedIds.has(item.id) && !isIceCreamItem(item)
      );
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

          <div className="h-10 sm:h-12 w-full max-w-md sm:max-w-lg mx-auto my-1">
            <FluidText
              text="EXPLORE ALL ITEMS"
              color="#1C1917"
              align="center"
              headingLevel={2}
              font={{
                fontFamily: "Outfit, 'Plus Jakarta Sans', sans-serif",
                fontWeight: 900,
                fontSize: "28px",
                textAlign: "center",
              }}
              paletteColors={["#dc2626", "#2563eb", "#ec4899", "#f59e0b", "#06b6d4"]}
              className="w-full h-full"
            />
          </div>

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
                {(() => {
                  const renderItemCard = (item: MenuItem, idx: number) => {
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

                          {/* Deal / Special Ribbon / Coming Soon */}
                          {!isSoldOut && (item.isComingSoon || item.badge?.toLowerCase().includes('coming soon')) ? (
                            <span className="absolute top-2 left-2 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider bg-amber-600 animate-pulse">
                              ⏳ Coming Soon
                            </span>
                          ) : (
                            !isSoldOut && (item.badge || item.originalPrice) && (
                              <span className="absolute top-2 left-2 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider bg-red-600">
                                {item.badge || 'DEAL'}
                              </span>
                            )
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
                              ) : item.isComingSoon || item.badge?.toLowerCase().includes('coming soon') ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectItem(item);
                                  }}
                                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-bold text-[11px] sm:text-xs hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <i className="fa-solid fa-clock text-[9px] text-amber-600"></i>
                                  <span>Coming Soon</span>
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const needsModal =
                                      (item.variants && item.variants.length > 1) ||
                                      item.category === 'scoops' ||
                                      item.category === 'sundaes';
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
                  };

                  if (group.id === 'ice-cream') {
                    const isConeItem = (it: MenuItem) => {
                      const n = it.name.toLowerCase();
                      const id = it.id.toLowerCase();
                      return (
                        id === 'waffle-cone-classic' ||
                        n.includes('waffle cone') ||
                        (n.includes('cone') && !n.includes('cup'))
                      );
                    };

                    const coneItems = groupItems.filter(isConeItem);
                    const cupItems = groupItems.filter((it) => !isConeItem(it));

                    const ICE_CREAM_FLAVORS = [
                      { name: 'Vanilla Bean', emoji: '🍨', color: 'bg-amber-50 text-amber-900 border-amber-200' },
                      { name: 'Dutch Chocolate', emoji: '🍫', color: 'bg-stone-100 text-stone-800 border-stone-300' },
                      { name: 'Chaunsa Mango', emoji: '🥭', color: 'bg-orange-50 text-orange-900 border-orange-200' },
                      { name: 'Pistachio Kulfa', emoji: '🥜', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
                      { name: 'Chocolate Chip', emoji: '🍪', color: 'bg-amber-50 text-stone-900 border-stone-200' },
                      { name: 'Strawberry Swirl', emoji: '🍓', color: 'bg-pink-50 text-pink-900 border-pink-200' },
                      { name: 'Caramel Praline', emoji: '🌰', color: 'bg-yellow-50 text-yellow-900 border-yellow-200' },
                      { name: 'Lotus Biscoff', emoji: '🧇', color: 'bg-amber-100 text-amber-950 border-amber-300' },
                    ];

                    return (
                      <div className="space-y-8">
                        {/* 1. Ice Cream Cups & All Flavors In One Place */}
                        {cupItems.length > 0 && (
                          <div className="space-y-4">
                            {/* Unified Cup & All Flavors Showcase Card */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/80 border border-blue-200/90 shadow-2xs space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-xs shrink-0">
                                    <i className="fa-solid fa-bowl-rice"></i>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-heading font-black text-base sm:text-lg text-stone-900 tracking-tight">
                                        Ice Cream Cups (All Flavors)
                                      </h4>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 uppercase tracking-wider">
                                        10+ Artisanal Flavors
                                      </span>
                                    </div>
                                    <p className="text-xs text-stone-600 mt-0.5">
                                      Pure dairy cream scoops served in branded cups. Single (Rs. 150) • Double (Rs. 250) • Triple (Rs. 350) + <strong>2 Free Syrups & Toppings included</strong>!
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-blue-800 border border-blue-200 shadow-2xs">
                                    {cupItems.length} Cup Items & Sundaes
                                  </span>
                                </div>
                              </div>

                              {/* Interactive Flavor Badges Showcase */}
                              <div className="pt-1 flex flex-wrap gap-1.5 sm:gap-2">
                                {ICE_CREAM_FLAVORS.map((flv) => (
                                  <button
                                    key={flv.name}
                                    type="button"
                                    onClick={() => {
                                      const matchedCup = cupItems.find(
                                        (c) => c.name.toLowerCase().includes(flv.name.toLowerCase()) || c.id === 'ice-cream-cup-all-flavors'
                                      ) || cupItems[0];
                                      onSelectItem(matchedCup);
                                    }}
                                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1.5 ${flv.color}`}
                                    title={`Click to order ${flv.name} Cup`}
                                  >
                                    <span>{flv.emoji}</span>
                                    <span>{flv.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4.5">
                              {cupItems.map((item, idx) => renderItemCard(item, idx))}
                            </div>
                          </div>
                        )}

                        {/* 2. Distinct Heading for Cones Followed by Cone Items */}
                        {coneItems.length > 0 && (
                          <div className="pt-4 space-y-4">
                            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 shadow-2xs flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-base shadow-xs shrink-0">
                                  <i className="fa-solid fa-ice-cream"></i>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-heading font-black text-base sm:text-lg text-stone-900 tracking-tight">
                                      Cones
                                    </h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                                      Fresh Waffle & Crunchy Cones
                                    </span>
                                  </div>
                                  <p className="text-xs text-stone-600 mt-0.5">
                                    Freshly rolled crispy waffle cones and crunchy soft-serve cones (Takeaway & Dine-In Only).
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                                {coneItems.length} {coneItems.length === 1 ? 'cone' : 'cones'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4.5">
                              {coneItems.map((item, idx) => renderItemCard(item, idx))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4.5">
                      {groupItems.map((item, idx) => renderItemCard(item, idx))}
                    </div>
                  );
                })()}
              </motion.section>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
