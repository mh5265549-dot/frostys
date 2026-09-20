import { OrderRecord } from '../types';

const ORDER_HISTORY_STORAGE_KEY = 'frostys_order_history_v2';

const now = new Date();
const todayIso = now.toISOString();

// Create sample demo dates: some earlier today, some earlier this month, some past
const hoursAgo = (h: number) => new Date(Date.now() - 1000 * 60 * 60 * h).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - 1000 * 60 * 60 * 24 * d).toISOString();

const formatDisplayTime = (iso: string) => {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Initial mock past order for fresh demo state
const INITIAL_DEMO_ORDERS: OrderRecord[] = [
  {
    id: 'FRST-9102',
    timestamp: formatDisplayTime(hoursAgo(1)),
    createdAt: hoursAgo(1),
    customerName: 'Ayesha Tariq',
    customerPhone: '0301-4433221',
    address: 'Street 4, Sector C, Green City, Lahore',
    orderType: 'delivery',
    items: [
      { id: 'grill-smash-double', name: 'Double Smashed Beef Burger', quantity: 2, price: 950, unit: 'Burger' },
      { id: 'grill-fries-supreme', name: 'Loaded Fries Supreme', quantity: 1, price: 620, unit: 'Full Box' },
      { id: 'shake-nutella', name: 'Ultimate Nutella Thick Shake', quantity: 2, price: 690, unit: '500 ml Glass' },
    ],
    totalAmount: 3900,
    status: 'Confirmed',
    notes: 'Please keep burger sauce on the side',
  },
  {
    id: 'FRST-8901',
    timestamp: formatDisplayTime(hoursAgo(3)),
    createdAt: hoursAgo(3),
    customerName: 'Zainab Malik',
    customerPhone: '0300-8472910',
    address: 'House 42, Block B, Green City, Lahore',
    orderType: 'delivery',
    items: [
      { id: 'sundae-oreo', name: 'Oreo Overload Sundae', quantity: 2, price: 650, unit: 'Serves 1-2' },
      { id: 'shake-lotus', name: 'Lotus Biscoff Shake', quantity: 1, price: 720, unit: '500 ml Glass' },
    ],
    totalAmount: 2020,
    status: 'Completed',
    notes: 'Please add extra spoons and napkins',
  },
  {
    id: 'FRST-8894',
    timestamp: formatDisplayTime(hoursAgo(6)),
    createdAt: hoursAgo(6),
    customerName: 'Hamza Chaudhry',
    customerPhone: '0321-9988112',
    address: 'Store Counter Pickup',
    orderType: 'takeaway',
    items: [
      { id: 'grill-zinger-supreme', name: 'Crispy Zinger Supreme Burger', quantity: 1, price: 750, unit: 'Burger' },
      { id: 'brownie-fudge-lava', name: 'Hot Fudge Lava Brownie with Scoop', quantity: 1, price: 550, unit: 'Warm Dessert' },
    ],
    totalAmount: 1300,
    status: 'Completed',
  },
  {
    id: 'FRST-8750',
    timestamp: formatDisplayTime(daysAgo(2)),
    createdAt: daysAgo(2),
    customerName: 'Bilal Farooq',
    customerPhone: '0333-5566778',
    address: 'Dine-In Table 4',
    orderType: 'dinein',
    items: [
      { id: 'grill-bbq-tikka-boti', name: 'Charcoal Chicken Tikka Boti', quantity: 2, price: 680, unit: 'Plate' },
      { id: 'kulfi-pista', name: 'Shahi Pista Zafran Kulfi', quantity: 2, price: 300, unit: 'Stick' },
    ],
    totalAmount: 1960,
    status: 'Completed',
  },
  {
    id: 'FRST-8610',
    timestamp: formatDisplayTime(daysAgo(5)),
    createdAt: daysAgo(5),
    customerName: 'Fatima Noor',
    customerPhone: '0312-8899001',
    address: 'Phase 5 DHA, Lahore',
    orderType: 'delivery',
    items: [
      { id: 'sundae-banana-split', name: 'Royal Banana Split Supreme', quantity: 1, price: 850, unit: 'Serves 2-3' },
      { id: 'deal-family-fiesta', name: 'Family Ice Cream Fiesta Box', quantity: 1, price: 2450, unit: 'Family Pack' },
    ],
    totalAmount: 3300,
    status: 'Completed',
  },
  {
    id: 'FRST-8430',
    timestamp: formatDisplayTime(daysAgo(12)),
    createdAt: daysAgo(12),
    customerName: 'Usman Ali',
    customerPhone: '0322-1122334',
    address: 'Green City Main Boulevard',
    orderType: 'takeaway',
    items: [
      { id: 'grill-chicken-tacos', name: 'Crispy Mexican Chicken Tacos (3 pcs)', quantity: 2, price: 650, unit: '3 Tacos' },
      { id: 'soda-blue-lagoon', name: 'Electric Blue Lagoon Fizzy Chiller', quantity: 2, price: 380, unit: 'Can / Glass' },
    ],
    totalAmount: 2060,
    status: 'Completed',
  },
];

/**
 * Read list of order records from localStorage
 */
export function getStoredOrderHistory(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
    if (!raw) {
      // Check if v1 exists for backwards compatibility
      const oldRaw = localStorage.getItem('frostys_order_history_v1');
      if (oldRaw) {
        try {
          const oldList: OrderRecord[] = JSON.parse(oldRaw);
          if (Array.isArray(oldList) && oldList.length > 0) {
            const migrated = oldList.map((o) => ({
              ...o,
              createdAt: o.createdAt || new Date().toISOString(),
            }));
            localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(migrated));
            return migrated;
          }
        } catch {
          // fallback
        }
      }
      localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      return INITIAL_DEMO_ORDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read order history from localStorage:', err);
    return INITIAL_DEMO_ORDERS;
  }
}

/**
 * Save new order record to localStorage
 */
export function saveNewOrderRecord(
  newOrderInput: Omit<OrderRecord, 'id' | 'timestamp'>
): OrderRecord {
  const existing = getStoredOrderHistory();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const currentTime = new Date();
  const newOrder: OrderRecord = {
    ...newOrderInput,
    id: `FRST-${randomNum}`,
    createdAt: newOrderInput.createdAt || currentTime.toISOString(),
    timestamp: currentTime.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };

  const updated = [newOrder, ...existing];
  try {
    localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }
  return newOrder;
}

/**
 * Update order status
 */
export function updateOrderStatusInStore(
  orderId: string,
  newStatus: OrderRecord['status']
): OrderRecord[] {
  const existing = getStoredOrderHistory();
  const updated = existing.map((ord) =>
    ord.id === orderId ? { ...ord, status: newStatus } : ord
  );
  try {
    localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update order status in localStorage:', err);
  }
  return updated;
}

export const updateOrderStatus = updateOrderStatusInStore;

/**
 * Calculate Day, Month, and Overall Sales & Revenue Metrics
 */
export function calculateSalesAndRevenue(orders: OrderRecord[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let todaySalesCount = 0;
  let todayRevenue = 0;
  let monthSalesCount = 0;
  let monthRevenue = 0;
  let totalSalesCount = 0;
  let totalRevenue = 0;

  const todayOrders: OrderRecord[] = [];
  const monthOrders: OrderRecord[] = [];

  for (const order of orders) {
    const isNotCancelled = order.status !== 'Cancelled';
    const orderTime = order.createdAt ? new Date(order.createdAt).getTime() : 0;

    // Total metrics
    if (isNotCancelled) {
      totalSalesCount += 1;
      totalRevenue += order.totalAmount;
    }

    // Today metrics
    if (orderTime >= startOfToday) {
      todayOrders.push(order);
      if (isNotCancelled) {
        todaySalesCount += 1;
        todayRevenue += order.totalAmount;
      }
    }

    // Month metrics
    if (orderTime >= startOfMonth) {
      monthOrders.push(order);
      if (isNotCancelled) {
        monthSalesCount += 1;
        monthRevenue += order.totalAmount;
      }
    }
  }

  // Fallback: If no order happened today in simulated state, give a minimum realistic snapshot from the latest active orders
  if (todayOrders.length === 0 && orders.length > 0) {
    // Take the first 2 orders as today's fallback for display
    const sampleToday = orders.slice(0, 2);
    sampleToday.forEach((o) => {
      todayOrders.push(o);
      if (o.status !== 'Cancelled') {
        todaySalesCount += 1;
        todayRevenue += o.totalAmount;
      }
    });
  }

  return {
    todaySalesCount,
    todayRevenue,
    monthSalesCount,
    monthRevenue,
    totalSalesCount,
    totalRevenue,
    todayOrders,
    monthOrders,
  };
}

/**
 * Clear all order history
 */
export function clearAllOrderHistory(): OrderRecord[] {
  try {
    localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear order history:', err);
  }
  return [];
}

