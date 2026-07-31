import { OrderRecord } from '../types';

const ORDER_HISTORY_STORAGE_KEY = 'frostys_order_history_v1';

// Initial mock past order for fresh demo state
const INITIAL_DEMO_ORDERS: OrderRecord[] = [
  {
    id: 'FRST-8901',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    customerName: 'Zainab Malik',
    customerPhone: '0300-8472910',
    address: 'House 42, Block B, Green City, Lahore',
    orderType: 'delivery',
    items: [
      { id: 'sundae-oreo', name: 'Oreo Overload Sundae', quantity: 2, price: 650, unit: 'Serves 1-2' },
      { id: 'shake-nutella', name: 'Ultimate Nutella Thick Shake', quantity: 1, price: 690, unit: '500 ml Glass' },
    ],
    totalAmount: 1990,
    status: 'Confirmed',
    notes: 'Please add extra spoons and napkins',
  },
  {
    id: 'FRST-8894',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    customerName: 'Hamza Chaudhry',
    customerPhone: '0321-9988112',
    address: 'Store Counter Pickup',
    orderType: 'takeaway',
    items: [
      { id: 'waffle-nutella', name: 'Warm Nutella Belgian Waffle', quantity: 1, price: 750, unit: 'Full Waffle' },
      { id: 'brownie-fudge-lava', name: 'Hot Fudge Lava Brownie with Scoop', quantity: 1, price: 550, unit: 'Warm Dessert' },
    ],
    totalAmount: 1300,
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
  const newOrder: OrderRecord = {
    ...newOrderInput,
    id: `FRST-${randomNum}`,
    timestamp: new Date().toLocaleString('en-US', {
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
