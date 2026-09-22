import { CartItem } from '../types';
import { isConeCupApplicable } from './categoryUtils';

export interface ReceiptData {
  cart: CartItem[];
  orderType: 'delivery' | 'takeaway' | 'dinein';
  customerName: string;
  customerPhone: string;
  addressOrTable: string;
  notes?: string;
  subtotal: number;
  receiptNumber?: string;
}

/**
 * Pads a string to a given length with trailing spaces.
 */
function padEnd(str: string, length: number): string {
  if (str.length >= length) return str.slice(0, length);
  return str + ' '.repeat(length - str.length);
}

/**
 * Pads a string to a given length with leading spaces.
 */
function padStart(str: string, length: number): string {
  if (str.length >= length) return str.slice(0, length);
  return ' '.repeat(length - str.length) + str;
}

/**
 * Formats a WhatsApp receipt message following the exact thermal paper receipt pattern:
 *
 *            BURGERS  •  FRIES  •  SHAKES
 * 
 * Store       : Frostys Green City        Receipt No: #45872
 * Date        : 26-08-2025                Table     : 3
 * Time        : 07:14 PM
 * Order Type  : [ ] Pick Up   [✓] Take Away   [ ] Delivery
 * Table       : -
 * --------------------------------------------------
 * Item                               Qty       Price
 * --------------------------------------------------
 * ...
 * --------------------------------------------------
 *                   Subtotal                   Rs. 0
 *                   Tax (5%)                   Rs. 0
 *                   Total                      Rs. 0
 * --------------------------------------------------
 * Payment Method:                               Cash
 * Received:                                    Rs. 0
 * Change:                                      Rs. 0
 * --------------------------------------------------
 *          THANK YOU FOR VISITING FROSTYS!
 */
export function generateThermalReceiptText(data: ReceiptData): { plainReceipt: string; whatsappMessage: string } {
  const { cart, orderType, customerName, customerPhone, addressOrTable, notes, subtotal, receiptNumber } = data;

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${day}-${month}-${year}`;

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const receiptNo = receiptNumber || `#${Math.floor(10000 + (Date.now() % 90000))}`;
  const tableVal = orderType === 'dinein' && addressOrTable ? addressOrTable.trim() : '-';

  const isPickUp = orderType === 'takeaway' || orderType === 'dinein';
  const isTakeAway = orderType === 'takeaway';
  const isDelivery = orderType === 'delivery';

  // Checkboxes
  const pickUpBox = orderType === 'dinein' ? '[✓] Pick Up' : '[ ] Pick Up';
  const takeAwayBox = isTakeAway ? '[✓] Take Away' : '[ ] Take Away';
  const deliveryBox = isDelivery ? '[✓] Delivery' : '[ ] Delivery';

  const lineWidth = 50;
  const divider = '--------------------------------------------------';

  const lines: string[] = [];

  // Header
  lines.push('           BURGERS  •  FRIES  •  SHAKES');
  lines.push('');
  lines.push(`Store       : Frostys Green City        Receipt No: ${receiptNo}`);
  lines.push(`Date        : ${dateStr}                Table     : ${tableVal}`);
  lines.push(`Time        : ${timeStr}`);
  lines.push(`Order Type  : ${pickUpBox}   ${takeAwayBox}   ${deliveryBox}`);
  lines.push(`Table       : ${tableVal}`);

  if (customerName.trim()) {
    lines.push(`Customer    : ${customerName.trim()}`);
  }
  if (customerPhone.trim()) {
    lines.push(`Phone       : ${customerPhone.trim()}`);
  }
  if (isDelivery && addressOrTable.trim()) {
    lines.push(`Address     : ${addressOrTable.trim()}`);
  }
  if (notes && notes.trim()) {
    lines.push(`Notes       : ${notes.trim()}`);
  }

  lines.push(divider);
  lines.push('Item                               Qty       Price');
  lines.push(divider);

  // Items
  cart.forEach((item) => {
    let itemName = item.menuItem.name;
    if (item.selectedVariant) {
      itemName += ` (${item.selectedVariant.name})`;
    } else if (item.menuItem.unit && !item.menuItem.unit.includes('(')) {
      itemName += ` (${item.menuItem.unit})`;
    }

    // Name column (34 chars), Qty (6 chars), Price (10 chars)
    const truncatedName = itemName.length > 33 ? itemName.slice(0, 32) + '…' : itemName;
    const itemCol = padEnd(truncatedName, 34);
    const qtyCol = padStart(String(item.quantity), 5);
    const priceCol = padStart(`Rs. ${item.totalPrice}`, 11);

    lines.push(`${itemCol}${qtyCol}${priceCol}`);

    // Customizations
    if (item.selectedContainer && isConeCupApplicable(item.menuItem)) {
      lines.push(`   • Container: ${item.selectedContainer === 'Cone' ? 'Crispy Wafer Cone' : 'Dessert Cup'}`);
    }
    if (item.selectedFlavors && item.selectedFlavors.length > 0) {
      lines.push(`   • Flavors: ${item.selectedFlavors.join(', ')}`);
    }
    if (item.selectedSodas && item.selectedSodas.length > 0) {
      lines.push(`   • Soda Chillers: ${item.selectedSodas.join(', ')}`);
    }
    if (item.selectedSyrups && item.selectedSyrups.length > 0) {
      lines.push(`   • Syrups: ${item.selectedSyrups.join(', ')}`);
    }
    if (item.selectedToppings && item.selectedToppings.length > 0) {
      const topStr = item.selectedToppings
        .map((t) => (t.price > 0 ? `${t.name} (+${t.price})` : t.name))
        .join(', ');
      lines.push(`   • Toppings: ${topStr}`);
    }
    if (item.customInstructions && item.customInstructions.trim()) {
      lines.push(`   • Note: ${item.customInstructions.trim()}`);
    }
  });

  lines.push(divider);

  // Subtotal, Tax, Total
  const subtotalLabel = padStart('Subtotal', 26);
  const subtotalVal = padStart(`Rs. ${subtotal}`, 24);
  lines.push(`${subtotalLabel}${subtotalVal}`);

  const taxLabel = padStart('Tax (5%)', 26);
  const taxVal = padStart('Rs. 0', 24);
  lines.push(`${taxLabel}${taxVal}`);

  const totalLabel = padStart('Total', 26);
  const totalVal = padStart(`Rs. ${subtotal}`, 24);
  lines.push(`${totalLabel}${totalVal}`);

  lines.push(divider);

  // Payment
  lines.push(`Payment Method: ${padStart('Cash', 34)}`);
  lines.push(`Received:       ${padStart(`Rs. ${subtotal}`, 34)}`);
  lines.push(`Change:         ${padStart('Rs. 0', 34)}`);

  lines.push(divider);
  lines.push('         THANK YOU FOR VISITING FROSTYS!');

  const plainReceipt = lines.join('\n');
  const whatsappMessage = `\`\`\`\n${plainReceipt}\n\`\`\``;

  return { plainReceipt, whatsappMessage };
}
