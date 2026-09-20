import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { MenuItem, ShopMode } from '../types';
import { MENU_ITEMS } from '../data/menuData';
import { isConeCupApplicable } from '../utils/categoryUtils';

interface MenuCategoryGroup {
  id: string;
  name: string;
  icon: string;
  badge: string;
  description: string;
  tagline: string;
  filter: (item: MenuItem) => boolean;
}

const ICE_CREAM_CATEGORY_GROUPS: MenuCategoryGroup[] = [
  {
    id: 'scoops',
    name: 'Fresh Scoops & Waffle Cones',
    icon: 'fa-solid fa-ice-cream',
    badge: '10 Fresh Flavors',
    description: 'Rich, pure cream ice cream in freshly rolled crispy waffle cones or cups with 2 free syrups & toppings included.',
    tagline: 'Special chocolate-filled cones & soft-serve scoops with 2 free toppings',
    filter: (item) => item.category === 'scoops',
  },
  {
    id: 'sundaes',
    name: 'Signature Sundaes & Super Cups',
    icon: 'fa-solid fa-bowl-rice',
    badge: 'House Signature',
    description: "Frosty's Super Cup, Deluxe Banana Splits, Mango & Strawberry Purée cups, and layered super sundaes.",
    tagline: 'Super Cups, Fruit Purees & Banana Splits layered fresh',
    filter: (item) => item.category === 'sundaes',
  },
  {
    id: 'deals',
    name: 'Special Deals & Combos',
    icon: 'fa-solid fa-tags',
    badge: 'Save Up to 200 PKR',
    description: 'Family Deals, Friends Deals & Super Sundae Combos with multiple scoops and chilled sodas included.',
    tagline: 'Promotional Ice Cream & Soda Combos for couples, friends & families',
    filter: (item) => item.category === 'deals' || !!item.originalPrice,
  },
  {
    id: 'shakes',
    name: 'Milkshakes & Thick Shakes',
    icon: 'fa-solid fa-glass-water',
    badge: 'Thick & Creamy',
    description: 'Oreo Ice Cream Shake, creamy dairy shakes & fresh fruit seasonal milkshakes blended thick.',
    tagline: 'Oreo shakes, pure dairy milkshakes & fresh seasonal fruit shakes',
    filter: (item) => item.category === 'shakes',
  },
  {
    id: 'kulfi',
    name: 'Authentic Creamy Kulfi',
    icon: 'fa-solid fa-candy-cane',
    badge: 'Large Rs. 100',
    description: 'Authentic traditional Pakistani rich and creamy Kulfi on a stick made with pure condensed cream.',
    tagline: 'Pure cream traditional Kulfi on a stick - Green City favorite',
    filter: (item) => item.category === 'kulfi',
  },
  {
    id: 'coffees',
    name: 'Cold Coffees & Frappes',
    icon: 'fa-solid fa-mug-hot',
    badge: 'Freshly Brewed',
    description: "Frosty's Iced Coffee, Cold Spanish Latte & Ice Cream Mocha Frappe brewed fresh.",
    tagline: 'Cold Spanish Latte, Iced Coffee & Mocha Frappe with ice cream foam',
    filter: (item) => item.category === 'coffees',
  },
  {
    id: 'sodas',
    name: 'Soda Chillers (20 Flavors)',
    icon: 'fa-solid fa-glass-water-droplet',
    badge: '20 Flavors',
    description: '20 vibrant, refreshing iced fruit & mint fizzy soda chiller flavors made fresh to order.',
    tagline: '20 Chilled Fizzy Fruit & Mint Flavors - perfect thirst-quencher',
    filter: (item) => item.category === 'sodas',
  },
];

const GRILL_CATEGORY_GROUPS: MenuCategoryGroup[] = [
  {
    id: 'grill-burgers',
    name: 'Flame-Grilled Burgers',
    icon: 'fa-solid fa-burger',
    badge: 'Flame-Grilled',
    description: 'Traditional spiced Shami Burgers, Ground Chicken Burgers & flame-grilled chicken fillet burgers on toasted sesame buns.',
    tagline: 'Juicy chicken patties & flame-grilled fillets with signature house grill sauce',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('burger')) ||
      item.name.toLowerCase().includes('burger'),
  },
  {
    id: 'grill-tacos-wraps',
    name: 'Crispy Tacos & Jumbo Wraps',
    icon: 'fa-solid fa-shapes',
    badge: 'Crispy & Grilled',
    description: 'Crispy filled chicken tacos with zesty dressing and jumbo flame-grilled chipotle chicken wraps.',
    tagline: '2 Pcs crispy chicken tacos with salsa & flame-grilled jumbo wraps',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('taco') || t.toLowerCase().includes('wrap')) ||
      item.name.toLowerCase().includes('taco') ||
      item.name.toLowerCase().includes('wrap'),
  },
  {
    id: 'grill-sandwiches',
    name: 'Triple-Decker Club Sandwiches',
    icon: 'fa-solid fa-bread-slice',
    badge: 'Triple-Layer',
    description: 'Triple-layer toasted club sandwiches layered with seasoned spiced chicken, cheese & fresh garden salad.',
    tagline: 'Golden toasted triple-layer club sandwiches made to perfection',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('sandwich')) ||
      item.name.toLowerCase().includes('sandwich'),
  },
  {
    id: 'grill-fries',
    name: 'Loaded Fries Supreme & Sides',
    icon: 'fa-solid fa-bowl-food',
    badge: 'Hot & Loaded',
    description: 'Hot golden salted shoestring fries in branded boxes, melted cheese fries & chicken fries supreme.',
    tagline: 'Regular shoestring fries, melted cheese & grilled chicken fries supreme',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('fries')) ||
      item.name.toLowerCase().includes('fries'),
  },
  {
    id: 'grill-bbq',
    name: 'Smoky Charcoal BBQ Platter',
    icon: 'fa-solid fa-drumstick-bite',
    badge: 'Charcoal Grilled',
    description: 'Traditional charcoal-grilled tender chicken tikka boti marinated in aromatic spices, served with hot naan & mint raita.',
    tagline: 'Smoky charcoal-grilled chicken tikka boti with naan & mint raita',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('bbq') || t.toLowerCase().includes('tikka')) ||
      item.name.toLowerCase().includes('tikka'),
  },
  {
    id: 'grill-chai',
    name: 'Authentic Karak Chai',
    icon: 'fa-solid fa-mug-hot',
    badge: 'Clay Matka Cup',
    description: 'Authentic Pakistani Karak Chai brewed steaming hot with whole creamy milk & aromatic cardamom in a rustic clay matka cup.',
    tagline: 'Steaming hot authentic Karak Chai served in a clay matka cup',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('chai') || t.toLowerCase().includes('tea')) ||
      item.name.toLowerCase().includes('chai'),
  },
  {
    id: 'grill-combos',
    name: 'Meal Combos & Upgrades',
    icon: 'fa-solid fa-tags',
    badge: 'Combo Deal',
    description: 'Upgrade any burger, sandwich or wrap with hot salted fries and a chilled soft drink of your choice.',
    tagline: 'Value combo add-ons with hot fries and chilled soft drinks',
    filter: (item) =>
      item.tags?.some((t) => t.toLowerCase().includes('combo')) ||
      item.name.toLowerCase().includes('combo'),
  },
];

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
  activeCategory: externalActiveCategory,
  onCategoryChange,
  activeShop,
  onSwitchShop,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeCategory = externalActiveCategory ?? selectedCategory;
  const setActiveCategory = (catId: string | null) => {
    setSelectedCategory(catId);
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
  };

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
  const shopBaseItems = useMemo(() => {
    return items.filter((item) => {
      if (isGrill) {
        return item.category === 'fast-food-bbq';
      } else {
        return item.category !== 'fast-food-bbq';
      }
    });
  }, [items, isGrill]);

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
      q.includes('shami') ||
      q.includes('chai') ||
      q.includes('tea') ||
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

  // Filter items based on active shop, query
  const filteredItems = useMemo(() => {
    return shopBaseItems.filter((item) => {
      if (!q) return true;

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
        q === 'taco' ||
        q === 'tacos' ||
        q === 'chai' ||
        q === 'tea' ||
        q === 'shami' ||
        q === 'sandwich' ||
        q === 'wrap' ||
        q === 'bbq' ||
        q === 'tikka' ||
        q === 'fries';

      return (
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
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [shopBaseItems, q]);

  // Current active shop's category groups
  const categoryGroups = useMemo(() => {
    return isGrill ? GRILL_CATEGORY_GROUPS : ICE_CREAM_CATEGORY_GROUPS;
  }, [isGrill]);

  // Categorize filtered items into groups
  const categorizedSections = useMemo(() => {
    const sections: { group: MenuCategoryGroup; items: MenuItem[] }[] = [];
    const matchedIds = new Set<string>();

    for (const group of categoryGroups) {
      // If a single category filter is active, only include that category
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
            id: isGrill ? 'grill-more' : 'icecream-more',
            name: isGrill ? 'More Grill Specialties' : 'More Dessert Specialties',
            icon: isGrill ? 'fa-solid fa-fire' : 'fa-solid fa-ice-cream',
            badge: 'Special Selection',
            description: isGrill
              ? 'Additional freshly made grill specialties, sides, and signature items.'
              : 'Additional freshly scooped desserts, sundaes, and ice cream favorites.',
            tagline: 'Freshly prepared kitchen favorites',
            filter: () => true,
          },
          items: leftoverItems,
        });
      }
    }

    return sections;
  }, [categoryGroups, filteredItems, activeCategory, isGrill]);

  // Handler for category navigation button
  const handleCategoryNavClick = (groupId: string | null) => {
    if (groupId === null || groupId === 'all') {
      setActiveCategory(null);
    } else {
      // If in all mode, scroll down to the category anchor
      const el = document.getElementById(`category-${groupId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setActiveCategory(groupId);
    }
  };

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
                {isGrill ? "Sizzling Charcoal Burgers & Grill Menu" : "Fresh Scoops, Sundaes & Shakes Menu"}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
                {isGrill
                  ? 'Flame-grilled chicken burgers, tender sandwiches, wraps, loaded fries supreme & chicken BBQ.'
                  : 'Freshly rolled crispy waffle cones, pure cream scoops, Banana Splits, thick shakes, kulfi & fruit soda chillers.'}
              </p>
            </div>

            {/* Switch to Other Shop Action Button */}
            <button
              onClick={() => {
                onSwitchShop(isGrill ? 'ice-cream' : 'grill');
                setActiveCategory(null);
              }}
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
        <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-8">
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
            {isGrill ? "Explore Fresh Grill Categories" : "Explore Ice Cream Categories"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            Browse through our specialty categories below. Scroll to view animated categories or select a category to jump directly.
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-2xl mx-auto space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder={
                  isGrill
                    ? 'Search Burgers, Tikka, Sandwiches, Wraps, Fries Supreme, Chai...'
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

            {/* Scroll-Triggered Category Navigation Pills Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="pt-2"
            >
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium">
                <span className="text-stone-400 text-[11px] font-bold mr-1">Categories:</span>
                
                {/* View All Categories Button */}
                <button
                  onClick={() => handleCategoryNavClick(null)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    !activeCategory || activeCategory === 'all'
                      ? isGrill
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-[#FF4B72] text-white border-[#FF4B72] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <i className="fa-solid fa-layer-group text-[10px]"></i>
                  <span>All Categories ({shopBaseItems.length})</span>
                </button>

                {/* Individual Category Group Buttons */}
                {categoryGroups.map((group) => {
                  const count = shopBaseItems.filter(group.filter).length;
                  const isActive = activeCategory === group.id;

                  return (
                    <button
                      key={group.id}
                      onClick={() => handleCategoryNavClick(isActive ? null : group.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? isGrill
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-[#FF4B72] text-white border-[#FF4B72] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <i className={`${group.icon} text-[11px]`}></i>
                      <span>{group.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Reset category filter badge if a single category is active */}
              {activeCategory && activeCategory !== 'all' && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 underline font-semibold cursor-pointer"
                  >
                    <span>Showing filtered category. Click here to view all categories</span>
                    <i className="fa-solid fa-rotate-left text-[10px]"></i>
                  </button>
                </div>
              )}
            </motion.div>
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
              onClick={() => {
                onSwitchShop('grill');
                setActiveCategory(null);
              }}
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
                  Fresh scoops, sundaes and shakes are available at <strong className="text-[#FF4B72] font-bold">Frosty's Ice Cream</strong>!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onSwitchShop('ice-cream');
                setActiveCategory(null);
              }}
              className="px-4 py-2 rounded-xl bg-[#FF4B72] hover:bg-[#E63956] text-white font-black text-xs shadow-xs shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>Switch to Frosty's Ice Cream</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        )}

        {/* Empty State */}
        {categorizedSections.length === 0 ? (
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
                  setActiveCategory(null);
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer"
              >
                Reset Filter & Search
              </button>
              <button
                onClick={() => {
                  onSwitchShop(isGrill ? 'ice-cream' : 'grill');
                  setActiveCategory(null);
                }}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer ${
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
          /* Dynamic Scroll-Triggered Category Sections */
          <div className="space-y-14 sm:space-y-16">
            {categorizedSections.map(({ group, items: groupItems }) => (
              <motion.section
                key={group.id}
                id={`category-${group.id}`}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08, margin: '-40px' }}
                transition={{ duration: 0.55, ease: [0.21, 1.02, 0.49, 1] }}
                className="scroll-mt-28 space-y-6"
              >
                {/* Scroll-Triggered Category Header Card */}
                <div
                  className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs ${
                    isGrill
                      ? 'bg-gradient-to-r from-orange-50/80 via-amber-50/40 to-white border-orange-200/80'
                      : 'bg-gradient-to-r from-pink-50/80 via-rose-50/30 to-white border-pink-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg shadow-xs shrink-0 ${
                        isGrill
                          ? 'bg-gradient-to-tr from-amber-500 to-orange-600'
                          : 'bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1]'
                      }`}
                    >
                      <i className={group.icon}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-heading font-black text-lg sm:text-xl text-stone-900 tracking-tight">
                          {group.name}
                        </h4>
                        {group.badge && (
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isGrill
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-pink-100 text-[#FF4B72] border border-pink-200'
                            }`}
                          >
                            {group.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isGrill
                          ? 'bg-orange-100/80 text-orange-800'
                          : 'bg-pink-100/80 text-[#FF4B72]'
                      }`}
                    >
                      {groupItems.length} {groupItems.length === 1 ? 'item' : 'items'}
                    </span>
                    <a
                      href="#menu"
                      className="text-[11px] text-stone-400 hover:text-stone-700 font-medium flex items-center gap-1 transition-colors"
                      title="Back to Top of Menu"
                    >
                      <span>Top</span>
                      <i className="fa-solid fa-arrow-up text-[9px]"></i>
                    </a>
                  </div>
                </div>

                {/* Staggered Item Grid for This Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                  {groupItems.map((item, idx) => {
                    const itemStock = inventory[item.id] ?? 15;
                    const isSoldOut = itemStock === 0;
                    const isDeal = item.category === 'deals' || !!item.originalPrice;
                    const isCone = item.category === 'scoops' || isConeCupApplicable(item);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 22 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.08, margin: '-20px' }}
                        transition={{ duration: 0.45, delay: (idx % 3) * 0.07, ease: 'easeOut' }}
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
                              <h5
                                onClick={() => onSelectItem(item)}
                                className="font-heading font-black text-base sm:text-lg text-stone-900 group-hover:text-[#FF4B72] transition-colors cursor-pointer line-clamp-1"
                              >
                                {item.name}
                              </h5>
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
                                  <i className="fa-solid fa-triangle-exclamation text-[9px] text-amber-600"></i>
                                  Cones are not available for delivery
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
