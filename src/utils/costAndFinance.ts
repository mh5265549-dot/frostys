import { MenuItem, OrderRecord } from '../types';

export interface ItemCostProfile {
  itemId: string;
  name: string;
  category: MenuItem['category'] | 'ice-cream' | 'grill';
  sellingPrice: number;
  makingCost: number;
  costBreakdown: string;
  lastUpdated?: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category:
    | 'Rent'
    | 'Staff Wages'
    | 'Utilities (Electricity & Gas)'
    | 'Generator Fuel'
    | 'Packaging & Disposables'
    | 'Maintenance & Repairs'
    | 'Marketing'
    | 'Other';
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO
  notes?: string;
  paidBy?: string;
}

const COGS_STORAGE_KEY = 'frostys_custom_cogs_v1';
const EXPENSES_STORAGE_KEY = 'frostys_operational_expenses_v1';

/**
 * Standard benchmark & recipe cost catalog for Frosty's & Grill items
 * Calibrated specifically with official restaurant cost structures
 */
export const DEFAULT_RECIPE_COSTS: Record<string, { cost: number; breakdown: string }> = {
  // Grill & Fast Food Items
  'ff-grilled-chicken-burger': {
    cost: 320,
    breakdown: 'Chicken Breast Fillet, Toasted Bun, Smoke Sauce, Cheddar, Box Packaging',
  },
  'ff-striped-grill-wrap': {
    cost: 370,
    breakdown: 'Tortilla, Grilled Chicken, Olives, Chipotle Sauce, Foil Wrapper',
  },
  'ff-fries-supreme': {
    cost: 140,
    breakdown: 'Shoestring Potatoes, Melted Cheddar, Chipotle, Jalapeños, Meal Box',
  },
  'ff-ground-chicken-burger': {
    cost: 175,
    breakdown: 'Minced Chicken Patty, Sesame Bun, Garden Veggies, House Sauce, Packing',
  },
  'ff-grilled-chicken-tacos': {
    cost: 340,
    breakdown: '2 Crispy Taco Shells, Grilled Chicken, Veggies, Dressing, Dip Cup, Box',
  },
  'ff-grilled-sandwich': {
    cost: 210,
    breakdown: 'Triple Bread Slices, Spiced Chicken, Tomatoes, Lettuce, Dressing, Box',
  },
  'ff-regular-fries': {
    cost: 95,
    breakdown: 'Potatoes, Cooking Oil, House Seasoning, Branded Takeout Box',
  },
  'ff-shami-burger': {
    cost: 160,
    breakdown: 'Spiced Shami Tikki, Farm Egg Omelette, Sesame Bun, Onions, Mint Chutney, Box',
  },
  'ff-greek-gyro': {
    cost: 320,
    breakdown: 'Warm Greek Pita, Sliced Marinated Herb Grilled Chicken, Tzatziki, Sliced Onions, Tomatoes, Crispy Fries',
  },
  'ff-karak-chai': {
    cost: 55,
    breakdown: 'Full-Cream Milk, Premium Tea Leaves, Cardamom, Frosty\'s Branded Cup',
  },
  'ff-kashmiri-pink-chai': {
    cost: 65,
    breakdown: 'Kashmiri Green Tea, Whole Milk, Crushed Pistachios, Sliced Almonds, Cardamom, Frosty\'s Cup',
  },
  'ice-cream-cup-all-flavors': {
    cost: 48,
    breakdown: 'Pure Dairy Cream Scoop, 2 Free Toppings/Syrup, Branded Cup & Spoon',
  },

  // Charcoal BBQ Grill
  'bbq-seekh-kabab-chicken': {
    cost: 90,
    breakdown: 'Minced Chicken, Desi Spices, Skewer Charcoal Prep, Mint Chutney',
  },
  'bbq-chicken-malai-boti': {
    cost: 240,
    breakdown: 'Boneless Chicken, Heavy Cream Marinade, Charcoal Grilling, Raita & Salad',
  },
  'bbq-tikka-chest-piece': {
    cost: 180,
    breakdown: 'Chicken Breast Quarter, Special Tikka Masala, Charcoal Grilling, Lemon',
  },
  'bbq-tikka-leg-piece': {
    cost: 165,
    breakdown: 'Chicken Leg Quarter, Tikka Marinade, Charcoal Grilling, Lemon & Mint',
  },
  'bbq-honey-wings': {
    cost: 210,
    breakdown: '6 Chicken Wings, Honey BBQ Glaze, Butter, Sesame Seeds, Portion Cup',
  },
  'bbq-mix-platter': {
    cost: 1250,
    breakdown: 'Malai Boti, Seekh Kabab, Tikka Boti, Wings, 4 Naan, Salad & Raitas',
  },
  'bbq-family-deal': {
    cost: 1850,
    breakdown: 'Full Charcoal BBQ Assortment, 6 Naan, Salad, Raita, 1.5L Drink Box',
  },

  // BBQ Sides & Tandoor
  'side-fresh-salad': {
    cost: 45,
    breakdown: 'Crisp Cucumbers, Ripe Tomatoes, Crunchy Onions, Lemon Wedges, Plate',
  },
  'side-extra-sauce': {
    cost: 22,
    breakdown: 'Garlic Mayo / Smoky BBQ Sauce Dip, Portion Cup & Airtight Lid',
  },
  'side-mint-raita': {
    cost: 18,
    breakdown: 'Fresh Yogurt, Wild Green Mint, Roasted Zeera Cumin, Cup & Lid',
  },
  'side-sada-naan': {
    cost: 12,
    breakdown: 'Fine Maida Flour, Yeast, Milk Glaze, Clay Tandoor Baking',
  },
  'side-sada-roti': {
    cost: 7,
    breakdown: 'Whole Wheat Atta, Tandoor Baking, Butter Paper Wrapping',
  },

  // Seafood, Soups & Paratha Rolls
  'grill-fish-kala-rahu': {
    cost: 1100,
    breakdown: 'Fresh Kala Rahu River Fish (1 KG), Secret Lahori Masala, Mustard Oil, Skewers, Chutneys',
  },
  'soup-19b': {
    cost: 200,
    breakdown: 'Shredded Chicken, Black Mushrooms, Egg Drops, Dark Broth, Seasoning, Bowl Packaging',
  },
  'soup-hot-and-sour': {
    cost: 160,
    breakdown: 'Chicken, Egg Ribbons, Carrots, Cabbage, Chili Vinegar Sauce, Spices, Bowl Packaging',
  },
  'roll-jumbo-paratha': {
    cost: 380,
    breakdown: 'Large Crispy Paratha, Double Chicken Boti, Sliced Red Onions, Garlic Sauce, Wrapper',
  },
  'roll-malai-boti-garlic-cheese': {
    cost: 260,
    breakdown: 'Flaky Paratha, Creamy Malai Boti, Melted Mozzarella & Cheddar, Roasted Garlic Mayo, Wrapper',
  },
  'roll-malai-boti-cheese': {
    cost: 240,
    breakdown: 'Flaky Paratha, Malai Boti, Melted Cheese, Mint Sauce, Foil Wrapper',
  },
  'roll-malai-boti-garlic': {
    cost: 230,
    breakdown: 'Paratha, Malai Boti, Garlic Sauce Spread, Crispy Onions, Wrapper',
  },
  'roll-malai-boti': {
    cost: 210,
    breakdown: 'Flaky Paratha, Charcoal Malai Boti, Mint Chutney, Sliced Onions, Wrapper',
  },
  'roll-chicken-tikka-boti': {
    cost: 190,
    breakdown: 'Paratha, Charcoal Chicken Tikka Boti, Spices, Mint Raita Sauce, Wrapper',
  },
  'roll-chicken-kabab': {
    cost: 180,
    breakdown: 'Paratha, Chicken Seekh Kabab, Sliced Onions, Garlic Mayo Sauce, Wrapper',
  },
  'gt-peshawari-qehwa': {
    cost: 35,
    breakdown: 'Authentic Green Tea Leaves, Green Cardamom, Fresh Mint, Rock Candies, Serving Glass',
  },
  'gt-cardamom-mint': {
    cost: 40,
    breakdown: 'Green Tea, Crushed Elaichi Pods, Wild Mint, Glass',
  },
  'gt-lemon-honey': {
    cost: 45,
    breakdown: 'Green Tea, Fresh Lemon Juice, Pure Natural Honey, Glass',
  },

  // Ice Cream & Desserts
  'waffle-cone-classic': {
    cost: 35,
    breakdown: 'Soft Serve Dairy Mix, Fresh Rolled Waffle Cone, Chocolate Drizzle, Napkin',
  },
  'sundae-banana-split': {
    cost: 150,
    breakdown: '2 Scoops Dairy Ice Cream, Fresh Banana, Syrups, Sprinkles, Boat Dish',
  },
  'sundae-banana-split-deluxe': {
    cost: 200,
    breakdown: '2-3 Scoops Ice Cream, Banana, Whipped Cream, Fruit Puree, Deluxe Boat',
  },
  'sundae-frosty-super-cup': {
    cost: 180,
    breakdown: '3 Scoops Pure Cream Ice Cream, Waffle Crisps, Syrups, Toppings, Super Cup',
  },
  'sundae-mango-signature': {
    cost: 140,
    breakdown: 'Vanilla & Mango Scoops, Fresh Mango Pulp/Puree, White Choc Chips, Cup',
  },
  'sundae-layered-super': {
    cost: 170,
    breakdown: 'Layered Ice Cream Scoops, Chocolate Brownie Bites, Hot Fudge, Tall Cup',
  },
  'kulfi-traditional': {
    cost: 35,
    breakdown: 'Thickened Whole Milk, Khoya, Pistachio, Cardamom, Kulfi Mold & Wooden Stick',
  },
  'shake-oreo': {
    cost: 160,
    breakdown: 'Pure Dairy Milk, Vanilla Ice Cream, 4 Oreo Cookies, Drizzle, Clear Cup',
  },
  'shake-fruit': {
    cost: 150,
    breakdown: 'Seasonal Real Fruit Pulp, Whole Milk, Ice Cream Base, Tall Cup & Straw',
  },
  'soda-chiller': {
    cost: 65,
    breakdown: 'Fizzy Soda Base, Premium Fruit/Mint Syrup, Crushed Ice, 500ml Cup & Straw',
  },
  'coffee-spanish-latte': {
    cost: 195,
    breakdown: 'Double Espresso Shot, Condensed Milk, Steamed Whole Milk, Ice Cup',
  },
  'coffee-mocha-frappe': {
    cost: 200,
    breakdown: 'Espresso Blend, Cocoa, Whipped Cream, Ice Cream Scoop, Frappe Dome Cup',
  },
};

/**
 * Get stored custom ingredient costs
 */
export function getStoredIngredientCosts(): Record<string, { cost: number; breakdown: string }> {
  try {
    const raw = localStorage.getItem(COGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_RECIPE_COSTS, ...parsed };
    }
  } catch (err) {
    console.error('Failed to parse stored COGS:', err);
  }
  return DEFAULT_RECIPE_COSTS;
}

/**
 * Save / update ingredient cost for a specific menu item
 */
export function saveItemIngredientCost(
  itemId: string,
  newCost: number,
  breakdown?: string
): Record<string, { cost: number; breakdown: string }> {
  const current = getStoredIngredientCosts();
  const existingBreakdown = current[itemId]?.breakdown || 'Raw Materials & Packing';
  const updated = {
    ...current,
    [itemId]: {
      cost: Math.max(0, newCost),
      breakdown: breakdown !== undefined ? breakdown : existingBreakdown,
    },
  };

  try {
    localStorage.setItem(COGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save COGS to localStorage:', err);
  }
  return updated;
}

/**
 * Reset all recipe costs back to default verified benchmarks
 */
export function resetIngredientCostsToDefault(): Record<string, { cost: number; breakdown: string }> {
  try {
    localStorage.removeItem(COGS_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset COGS:', err);
  }
  return DEFAULT_RECIPE_COSTS;
}

/**
 * Get accurate making cost (COGS) for any menu item
 */
export function getItemCogsCost(
  itemId: string,
  itemName: string,
  price: number,
  customCosts?: Record<string, { cost: number; breakdown: string }>
): number {
  const costs = customCosts || getStoredIngredientCosts();

  // 1. Direct ID match
  if (costs[itemId]) {
    return costs[itemId].cost;
  }

  // 2. Fuzzy name match
  const lowerName = itemName.toLowerCase();
  for (const [key, val] of Object.entries(costs)) {
    if (lowerName.includes(key.replace(/^(ff-|bbq-|sundae-|shake-|coffee-|side-)/, ''))) {
      return val.cost;
    }
  }

  // 3. Fallback benchmark based on category and retail price
  if (lowerName.includes('burger') || lowerName.includes('wrap') || lowerName.includes('taco')) {
    return Math.round((price || 500) * 0.48); // ~48% for meat & packaging
  }
  if (lowerName.includes('cone') || lowerName.includes('kulfi')) {
    return Math.round((price || 150) * 0.35); // ~35% for dairy soft serve / kulfi
  }
  if (lowerName.includes('soda') || lowerName.includes('chai')) {
    return Math.round((price || 200) * 0.32); // ~32% for beverages
  }
  return Math.round((price || 400) * 0.4); // Standard 40% benchmark
}

/**
 * Sample Initial Fixed & Operational Expenses for Green City Store
 */
const INITIAL_DEMO_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    title: 'Store Rent - Green City Commercial (8B Commercial)',
    category: 'Rent',
    amount: 85000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    notes: 'Monthly commercial shop lease payment for Green City location',
    paidBy: 'Owner / Bank Transfer',
  },
  {
    id: 'exp-2',
    title: 'Kitchen & Service Staff Salaries (5 Staff Members)',
    category: 'Staff Wages',
    amount: 110000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    notes: '2 Grill Master Chefs, 2 Ice Cream Scoopers/Cashiers, 1 Utility Helper',
    paidBy: 'Cash Payroll',
  },
  {
    id: 'exp-3',
    title: 'Electricity Bill (LESCO Freezers & Air Conditioning)',
    category: 'Utilities (Electricity & Gas)',
    amount: 48500,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    notes: 'Commercial meter for ice cream blast freezers, display cabinets, & indoor chillers',
    paidBy: 'Online Banking',
  },
  {
    id: 'exp-4',
    title: 'Gas & Charcoal Refill (LPG Cylinders & Tandoor Charcoal)',
    category: 'Utilities (Electricity & Gas)',
    amount: 22000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 12).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    notes: '3x 45kg commercial LPG cylinders for grills & premium babool charcoal for BBQ',
    paidBy: 'Cash',
  },
  {
    id: 'exp-5',
    title: 'Backup Diesel / Petrol Generator Fuel',
    category: 'Generator Fuel',
    amount: 16500,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    notes: 'Backup generator fuel for uninterrupted freezer temperature during load shedding',
    paidBy: 'Cash',
  },
  {
    id: 'exp-6',
    title: 'Branded Takeout Packaging & Disposable Cutlery',
    category: 'Packaging & Disposables',
    amount: 14000,
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 18).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    notes: 'Navy meal boxes, ice cream cups, spoons, greaseproof burger wraps, napkins',
    paidBy: 'Cash',
  },
];

/**
 * Get stored operational expenses
 */
export function getStoredExpenses(): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_EXPENSES));
      return INITIAL_DEMO_EXPENSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_EXPENSES;
  } catch (err) {
    console.error('Failed to read expenses from localStorage:', err);
    return INITIAL_DEMO_EXPENSES;
  }
}

/**
 * Add new expense record
 */
export function addExpenseRecord(
  newExp: Omit<ExpenseRecord, 'id' | 'createdAt'>
): ExpenseRecord[] {
  const current = getStoredExpenses();
  const fullRecord: ExpenseRecord = {
    ...newExp,
    id: `exp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [fullRecord, ...current];
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save expense:', err);
  }
  return updated;
}

/**
 * Delete expense record
 */
export function deleteExpenseRecord(expenseId: string): ExpenseRecord[] {
  const current = getStoredExpenses();
  const updated = current.filter((e) => e.id !== expenseId);
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete expense:', err);
  }
  return updated;
}

/**
 * Helper to test if an order item belongs to Grill or Ice Cream
 */
export function isGrillOrderItem(item: { id: string; name: string }): boolean {
  const id = item.id.toLowerCase();
  const name = item.name.toLowerCase();
  return (
    id.startsWith('ff-') ||
    id.startsWith('bbq-') ||
    id.startsWith('side-') ||
    id.includes('burger') ||
    id.includes('wrap') ||
    id.includes('taco') ||
    id.includes('sandwich') ||
    id.includes('fries') ||
    id.includes('tikka') ||
    id.includes('kabab') ||
    id.includes('boti') ||
    id.includes('chai') ||
    id.includes('naan') ||
    id.includes('roti') ||
    name.includes('burger') ||
    name.includes('wrap') ||
    name.includes('taco') ||
    name.includes('sandwich') ||
    name.includes('fries') ||
    name.includes('bbq') ||
    name.includes('tikka') ||
    name.includes('kabab') ||
    name.includes('boti') ||
    name.includes('chai') ||
    name.includes('naan') ||
    name.includes('roti')
  );
}

/**
 * Comprehensive Financial & Operations Performance Summary Engine
 */
export function calculateFinancialSummary(
  orders: OrderRecord[],
  timeframe: 'today' | 'week' | 'month' | 'all' | 'custom',
  customRange?: { start: string; end: string },
  customCosts?: Record<string, { cost: number; breakdown: string }>,
  expensesList?: ExpenseRecord[]
) {
  const now = new Date();
  const cogsMap = customCosts || getStoredIngredientCosts();
  const expenses = expensesList || getStoredExpenses();

  // Define date bounds
  let startTime = 0;
  let endTime = Number.MAX_SAFE_INTEGER;

  if (timeframe === 'today') {
    const startOfToday = new Date(now);
    // 3:00 AM business day cutoff
    if (now.getHours() < 3) {
      startOfToday.setDate(startOfToday.getDate() - 1);
    }
    startOfToday.setHours(3, 0, 0, 0);
    startTime = startOfToday.getTime();
  } else if (timeframe === 'week') {
    const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    startTime = past7Days.getTime();
  } else if (timeframe === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startTime = startOfMonth.getTime();
  } else if (timeframe === 'custom' && customRange?.start && customRange?.end) {
    startTime = new Date(customRange.start).setHours(0, 0, 0, 0);
    endTime = new Date(customRange.end).setHours(23, 59, 59, 999);
  }

  // Filter orders by timeframe and non-cancelled status
  const filteredOrders = orders.filter((order) => {
    if (order.status === 'Cancelled') return false;
    const orderTime = order.createdAt ? new Date(order.createdAt).getTime() : 0;
    return orderTime >= startTime && orderTime <= endTime;
  });

  // Calculate top-line metrics
  let grossRevenue = 0;
  let totalCogs = 0;
  let deliveryFeesCollected = 0;

  // Category aggregations
  let grillRevenue = 0;
  let grillCogs = 0;
  let grillItemCount = 0;

  let iceCreamRevenue = 0;
  let iceCreamCogs = 0;
  let iceCreamItemCount = 0;

  // Order type breakdown
  const orderTypeMetrics = {
    delivery: { count: 0, revenue: 0, cogs: 0, profit: 0, paragonCount: 0, greenCityCount: 0 },
    dinein: { count: 0, revenue: 0, cogs: 0, profit: 0 },
    takeaway: { count: 0, revenue: 0, cogs: 0, profit: 0 },
  };

  // Item-level performance tracking
  const itemPerfMap: Record<
    string,
    {
      id: string;
      name: string;
      category: 'grill' | 'ice-cream';
      unitsSold: number;
      revenue: number;
      cogs: number;
      profit: number;
    }
  > = {};

  for (const order of filteredOrders) {
    grossRevenue += order.totalAmount;
    if (order.deliveryFee) {
      deliveryFeesCollected += order.deliveryFee;
    }

    let orderCogs = 0;

    for (const item of order.items || []) {
      const unitCogs = getItemCogsCost(item.id, item.name, item.price, cogsMap);
      const lineCogs = unitCogs * (item.quantity || 1);
      const lineRevenue = item.price * (item.quantity || 1);
      const isGrill = isGrillOrderItem(item);

      orderCogs += lineCogs;

      if (isGrill) {
        grillRevenue += lineRevenue;
        grillCogs += lineCogs;
        grillItemCount += item.quantity || 1;
      } else {
        iceCreamRevenue += lineRevenue;
        iceCreamCogs += lineCogs;
        iceCreamItemCount += item.quantity || 1;
      }

      // Track item performance
      if (!itemPerfMap[item.id]) {
        itemPerfMap[item.id] = {
          id: item.id,
          name: item.name,
          category: isGrill ? 'grill' : 'ice-cream',
          unitsSold: 0,
          revenue: 0,
          cogs: 0,
          profit: 0,
        };
      }
      itemPerfMap[item.id].unitsSold += item.quantity || 1;
      itemPerfMap[item.id].revenue += lineRevenue;
      itemPerfMap[item.id].cogs += lineCogs;
      itemPerfMap[item.id].profit += lineRevenue - lineCogs;
    }

    totalCogs += orderCogs;

    // Order Type Aggregation
    const type = order.orderType || 'takeaway';
    if (orderTypeMetrics[type]) {
      orderTypeMetrics[type].count += 1;
      orderTypeMetrics[type].revenue += order.totalAmount;
      orderTypeMetrics[type].cogs += orderCogs;
      orderTypeMetrics[type].profit += order.totalAmount - orderCogs;
      if (type === 'delivery') {
        if (order.deliveryZone === 'paragon' || (order.address || '').toLowerCase().includes('paragon')) {
          orderTypeMetrics.delivery.paragonCount += 1;
        } else {
          orderTypeMetrics.delivery.greenCityCount += 1;
        }
      }
    }
  }

  // Top-Line Profit & Margin
  const netProfit = grossRevenue - totalCogs;
  const profitMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // Category Profit & Margin
  const grillNetProfit = grillRevenue - grillCogs;
  const grillMarginPercent = grillRevenue > 0 ? (grillNetProfit / grillRevenue) * 100 : 0;

  const iceCreamNetProfit = iceCreamRevenue - iceCreamCogs;
  const iceCreamMarginPercent = iceCreamRevenue > 0 ? (iceCreamNetProfit / iceCreamRevenue) * 100 : 0;

  // Filter expenses matching the timeframe
  const filteredExpenses = expenses.filter((exp) => {
    const expTime = new Date(exp.date).getTime();
    return expTime >= startTime && expTime <= endTime;
  });

  const totalOperatingExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = netProfit - totalOperatingExpenses;
  const netOperatingMarginPercent = grossRevenue > 0 ? (netOperatingProfit / grossRevenue) * 100 : 0;

  // Sorted Item Leaders
  const rankedItems = Object.values(itemPerfMap);
  const topProfitLeaders = [...rankedItems].sort((a, b) => b.profit - a.profit).slice(0, 5);
  const topVolumeLeaders = [...rankedItems].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);

  return {
    orderCount: filteredOrders.length,
    grossRevenue,
    totalCogs,
    netProfit,
    profitMarginPercent,
    deliveryFeesCollected,
    // Category Breakdown
    grill: {
      revenue: grillRevenue,
      cogs: grillCogs,
      netProfit: grillNetProfit,
      marginPercent: grillMarginPercent,
      itemCount: grillItemCount,
    },
    iceCream: {
      revenue: iceCreamRevenue,
      cogs: iceCreamCogs,
      netProfit: iceCreamNetProfit,
      marginPercent: iceCreamMarginPercent,
      itemCount: iceCreamItemCount,
    },
    // Order Type Breakdown
    orderTypes: orderTypeMetrics,
    // Expenses & Net Operating Profit
    expenses: filteredExpenses,
    totalOperatingExpenses,
    netOperatingProfit,
    netOperatingMarginPercent,
    // Item Leaders
    topProfitLeaders,
    topVolumeLeaders,
    allItemRankings: rankedItems,
  };
}
