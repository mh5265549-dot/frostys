import React, { useState } from 'react';
import { CartItem, Review } from '../types';
import { STORE_INFO } from '../data/menuData';
import { isConeCupApplicable } from '../utils/categoryUtils';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderSubmitted?: (orderData: {
    customerName: string;
    customerPhone: string;
    address?: string;
    orderType: 'delivery' | 'takeaway' | 'dinein';
    items: { id: string; name: string; quantity: number; price: number; unit?: string }[];
    totalAmount: number;
    notes?: string;
  }) => void;
  onSaveFeedback?: (newFeedback: Omit<Review, 'id' | 'date'>) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSubmitted,
  onSaveFeedback,
}) => {
  if (!isOpen) return null;

  const [orderType, setOrderType] = useState<'takeaway' | 'dinein' | 'delivery'>('takeaway');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressOrTable, setAddressOrTable] = useState('');
  const [notes, setNotes] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);

  // Post-Order Service Rating State
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [serviceComment, setServiceComment] = useState<string>('');
  const [includeFeedback, setIncludeFeedback] = useState<boolean>(true);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const hasConeInCart = cart.some((item) => {
    // Check if container is selected as Cone
    if (item.selectedContainer === 'Cone') return true;
    // Check if item name / variant indicates cone
    const lowerName = item.menuItem.name.toLowerCase();
    const lowerVariant = (item.selectedVariant?.name || '').toLowerCase();
    if (lowerName.includes('waffle cone') && (item.selectedContainer === 'Cone' || (!item.selectedContainer && !lowerVariant.includes('cup')))) {
      return true;
    }
    return false;
  });

  const validateDeliveryAddress = (address: string): boolean => {
    const normalized = address.toLowerCase().trim();

    // Rule 1: Must explicitly contain Paragon or Green City
    const hasParagon = normalized.includes('paragon');
    const hasGreenCity = normalized.includes('green city') || normalized.includes('greencity');

    if (!hasParagon && !hasGreenCity) {
      return false;
    }

    // Rule 2: If address contains any location, society, or city other than Paragon and Green City, reject
    const forbiddenLocations = [
      'dha', 'askari', 'johar town', 'gulberg', 'model town', 'cantt', 'cavalry',
      'wapda town', 'lake city', 'bahria', 'valancia', 'faisal town', 'iqbal town',
      'allama iqbal town', 'garden town', 'shadman', 'township', 'defense', 'defence', 'air avenue',
      'state life', 'eden', 'central park', 'khayaban', 'suigas', 'tariq gardens', 'architects',
      'bedian', 'ring road', 'fazaia', 'pia society', 'sabzazar', 'subzazar', 'multan road', 'thokar',
      'raiwind', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'sialkot',
      'gujranwala', 'quetta', 'sargodha', 'bahawalpur', 'sheikhupura', 'kasur', 'okara', 'sahiwal',
      'murree', 'taxila', 'wah cantt', 'hyderabad', 'sukkur', 'abbottabad', 'gilgit'
    ];

    const hasForbidden = forbiddenLocations.some((loc) => normalized.includes(loc));
    if (hasForbidden) {
      return false;
    }

    return true;
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    if (cart.length === 0) {
      alert('Your cart is empty! Please add some desserts from the menu first.');
      return;
    }

    if (!customerName || !customerPhone) {
      alert('Please fill in your name and phone number so we can process your order.');
      return;
    }

    if (orderType === 'delivery') {
      // Cone delivery restriction policy
      if (hasConeInCart) {
        const coneRejectionMsg = "Order not accepted for delivery: Cones are strictly available for Dine-In or Takeaway only to prevent melting during transit. Please select Cup container or choose Takeaway/Dine-In.";
        setAddressError(coneRejectionMsg);
        alert(coneRejectionMsg);
        return;
      }

      const isAddressValid = validateDeliveryAddress(addressOrTable);
      if (!isAddressValid) {
        const rejectionMsg = "Order not confirmed. Frosty currently only delivers within Paragon and Green City.";
        setAddressError(rejectionMsg);
        alert(rejectionMsg);
        return;
      }
    }

    // Build WhatsApp message string
    let msg = `🍦 *NEW DESSERT ORDER - FROSTY'S ICE CREAM & DESSERTS* 🍦\n\n`;
    msg += `*Order Type:* ${
      orderType === 'takeaway'
        ? 'Takeaway / Pickup at Store'
        : orderType === 'dinein'
        ? 'Dine-In'
        : 'Home Delivery (Green City, Lahore)'
    }\n`;
    msg += `*Customer Name:* ${customerName}\n`;
    msg += `*Phone:* ${customerPhone}\n`;
    if (addressOrTable) {
      msg += `*${
        orderType === 'dinein' ? 'Table No.' : 'Delivery Address'
      }:* ${addressOrTable}\n`;
    }
    if (notes) {
      msg += `*Notes:* ${notes}\n`;
    }

    msg += `\n*ORDER ITEMS:*\n`;
    cart.forEach((item, idx) => {
      const variantText = item.selectedVariant ? ` (${item.selectedVariant.name})` : item.menuItem.unit ? ` (${item.menuItem.unit})` : '';
      msg += `${idx + 1}. ${item.menuItem.name}${variantText} x${item.quantity} - Rs. ${item.totalPrice}\n`;

      const customizationLines: string[] = [];
      if (item.selectedContainer && isConeCupApplicable(item.menuItem)) {
        customizationLines.push(`   • Container: ${item.selectedContainer === 'Cone' ? 'Crispy Wafer Cone 🍦' : 'Classic Dessert Cup 🍨'}`);
      }
      if (item.selectedFlavors && item.selectedFlavors.length > 0) {
        customizationLines.push(`   • Flavors: ${item.selectedFlavors.join(', ')}`);
      }
      if (item.selectedSodas && item.selectedSodas.length > 0) {
        customizationLines.push(`   • Soda Chillers: ${item.selectedSodas.join(', ')}`);
      }
      if (item.selectedSyrups && item.selectedSyrups.length > 0) {
        customizationLines.push(`   • Syrups: ${item.selectedSyrups.join(', ')}`);
      }
      if (item.selectedToppings && item.selectedToppings.length > 0) {
        const toppingsStr = item.selectedToppings
          .map((t) => (t.price > 0 ? `${t.name} (+Rs.${t.price})` : t.name))
          .join(', ');
        customizationLines.push(`   • Toppings: ${toppingsStr}`);
      }
      if (item.customInstructions) {
        customizationLines.push(`   • Note: ${item.customInstructions}`);
      }
      if (customizationLines.length > 0) {
        msg += customizationLines.join('\n') + '\n';
      }
    });

    msg += `\n*TOTAL AMOUNT:* Rs. ${subtotal}\n\n`;
    msg += `📍 *Store Location:* 8B Commercial, Green City, Lahore\n`;
    msg += `⏰ *Operating Hours:* 4:00 PM – 2:00 AM Daily`;

    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${STORE_INFO.whatsapp}?text=${encodedMsg}`;

    // Log order in history and deduct stock
    if (onOrderSubmitted) {
      onOrderSubmitted({
        customerName,
        customerPhone,
        address: addressOrTable,
        orderType,
        items: cart.map((ci) => {
          const parts: string[] = [];
          if (ci.selectedContainer && isConeCupApplicable(ci.menuItem)) {
            parts.push(`Container: ${ci.selectedContainer}`);
          }
          if (ci.selectedVariant) {
            parts.push(`Size: ${ci.selectedVariant.name}`);
          }
          if (ci.selectedFlavors && ci.selectedFlavors.length > 0) {
            parts.push(`Flavors: ${ci.selectedFlavors.join(', ')}`);
          }
          if (ci.selectedSodas && ci.selectedSodas.length > 0) {
            parts.push(`Soda Chillers: ${ci.selectedSodas.join(', ')}`);
          }
          if (ci.selectedSyrups && ci.selectedSyrups.length > 0) {
            parts.push(`Syrups: ${ci.selectedSyrups.join(', ')}`);
          }
          if (ci.selectedToppings && ci.selectedToppings.length > 0) {
            parts.push(
              `Toppings: ${ci.selectedToppings
                .map((t) => (t.price > 0 ? `${t.name} (+Rs.${t.price})` : t.name))
                .join(', ')}`
            );
          }
          if (ci.customInstructions) {
            parts.push(`Note: ${ci.customInstructions}`);
          }

          return {
            id: ci.menuItem.id,
            name: ci.selectedVariant ? `${ci.menuItem.name} (${ci.selectedVariant.name})` : ci.menuItem.name,
            quantity: ci.quantity,
            price: ci.unitPrice,
            unit: ci.menuItem.unit,
            customizationsText: parts.join(' | '),
          };
        }),
        totalAmount: subtotal,
        notes,
      });
    }

    // Save Post-Order Feedback if provided
    if (onSaveFeedback && includeFeedback) {
      const mainItemName = cart[0]?.menuItem.name || "Frosty's Dessert";
      const commentText = serviceComment.trim() || `Ordered ${cart.length} item(s) via web app. Great experience!`;
      
      onSaveFeedback({
        name: customerName.trim() || 'Verified Customer',
        rating: serviceRating,
        comment: commentText,
        favItem: mainItemName,
        tag: 'Verified Order',
      });
    }

    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white text-[#2D1B18] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-[#2D1B18] text-white flex items-center justify-between border-b border-[#3D2522]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF4B72] text-white flex items-center justify-center font-bold text-lg">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-amber-50">
                Your Frosty's Order
              </h3>
              <span className="text-xs text-amber-200/80">
                8B Commercial, Green City, Lahore • Open 4 PM - 2 AM
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#3D2522] hover:bg-[#4D302C] text-amber-100 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Order Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Select Order Type
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setOrderType('takeaway');
                  setAddressError(null);
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  orderType === 'takeaway'
                    ? 'bg-[#2D1B18] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <i className="fa-solid fa-bag-shopping"></i>
                <span>Takeaway</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderType('dinein');
                  setAddressError(null);
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  orderType === 'dinein'
                    ? 'bg-[#2D1B18] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <i className="fa-solid fa-chair"></i>
                <span>Dine-In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderType('delivery');
                  setAddressError(null);
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  orderType === 'delivery'
                    ? 'bg-[#2D1B18] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <i className="fa-solid fa-motorcycle"></i>
                <span>Delivery</span>
              </button>
            </div>

            {/* Delivery Cone Restriction Notice */}
            {orderType === 'delivery' && hasConeInCart && (
              <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/70 text-amber-950 text-xs flex items-start gap-3 animate-fadeIn">
                <i className="fa-solid fa-triangle-exclamation text-amber-600 text-lg mt-0.5 shrink-0"></i>
                <div>
                  <h5 className="font-extrabold text-amber-950">Cones Cannot Be Delivered (Melting Policy)</h5>
                  <p className="text-[11px] text-amber-900 leading-relaxed mt-0.5">
                    Your cart contains crispy ice cream cone(s). Cones are strictly available for <strong>Dine-In</strong> or <strong>Takeaway</strong> only. Only cups and other desserts can be delivered. Please switch your order type to Takeaway/Dine-In or change container to Cup to proceed with delivery.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Cart Items ({cart.length})
              </span>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-[#E63956] font-semibold hover:underline"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-2">
                <i className="fa-solid fa-basket-shopping text-3xl text-stone-300"></i>
                <p className="text-sm font-semibold text-stone-600">Your cart is currently empty</p>
                <p className="text-xs text-stone-400">
                  Select ice cream scoops, Banana Splits, sundaes, milkshakes, cold coffee, or soda chillers from our menu to build your order!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const itemId = item.cartItemId || item.menuItem.id;
                  return (
                    <div
                      key={itemId}
                      className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover shrink-0 mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading font-bold text-sm text-[#2D1B18] truncate">
                            {item.menuItem.name} {item.selectedVariant && <span className="text-xs font-semibold text-[#FF4B72]">({item.selectedVariant.name})</span>}
                          </h4>
                          <span className="text-xs text-stone-500 font-medium block">
                            Rs. {item.unitPrice} each
                          </span>

                          {/* Render Selected Container */}
                          {item.selectedContainer && isConeCupApplicable(item.menuItem) && (
                            <div className="text-[11px] text-amber-900 font-semibold mt-1">
                              <span>{item.selectedContainer === 'Cone' ? '🍦 Container: ' : '🍨 Container: '}</span>
                              <span className="text-stone-700 font-bold">
                                {item.selectedContainer === 'Cone' ? 'Crispy Wafer Cone' : 'Classic Dessert Cup'}
                              </span>
                            </div>
                          )}

                          {/* Render Selected Flavors */}
                          {item.selectedFlavors && item.selectedFlavors.length > 0 && (
                            <div className="text-[11px] text-amber-900 font-semibold mt-1">
                              <span>🍨 Flavors: </span>
                              <span className="text-stone-700 font-normal">
                                {item.selectedFlavors.join(', ')}
                              </span>
                            </div>
                          )}

                          {/* Render Selected Sodas */}
                          {item.selectedSodas && item.selectedSodas.length > 0 && (
                            <div className="text-[11px] text-amber-900 font-semibold mt-1">
                              <span>🥤 Soda Chillers: </span>
                              <span className="text-stone-700 font-normal">
                                {item.selectedSodas.join(', ')}
                              </span>
                            </div>
                          )}

                          {/* Render Syrups */}
                          {item.selectedSyrups && item.selectedSyrups.length > 0 && (
                            <div className="text-[11px] text-amber-900 font-semibold mt-1">
                              <span>🍯 Syrups: </span>
                              <span className="text-stone-700 font-normal">
                                {item.selectedSyrups.join(', ')}
                              </span>
                            </div>
                          )}

                          {/* Render Toppings */}
                          {item.selectedToppings && item.selectedToppings.length > 0 && (
                            <div className="text-[11px] text-amber-900 font-semibold mt-0.5">
                              <span>🍪 Toppings: </span>
                              <span className="text-stone-700 font-normal">
                                {item.selectedToppings
                                  .map((t) => (t.price > 0 ? `${t.name} (+Rs.${t.price})` : t.name))
                                  .join(', ')}
                              </span>
                            </div>
                          )}

                          {/* Render Instructions */}
                          {item.customInstructions && (
                            <div className="text-[11px] text-stone-500 italic mt-0.5">
                              Note: {item.customInstructions}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-stone-200">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(itemId, -1)}
                            className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(itemId, 1)}
                            className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        {/* Total */}
                        <span className="font-heading font-black text-sm text-[#2D1B18] w-16 text-right">
                          Rs. {item.totalPrice}
                        </span>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(itemId)}
                          className="text-stone-400 hover:text-[#E63956] text-xs p-1"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer Details Form */}
          <form id="order-form" onSubmit={handleSendWhatsApp} className="space-y-4 pt-2 border-t border-stone-200">
            <h4 className="font-heading font-bold text-sm text-[#2D1B18] uppercase tracking-wider">
              Customer Contact Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ali Raza"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:ring-2 focus:ring-[#FF4B72] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 0300 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:ring-2 focus:ring-[#FF4B72] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                {orderType === 'dinein'
                  ? 'Table Number (Optional)'
                  : orderType === 'delivery'
                  ? 'Complete Delivery Address (Paragon or Green City) *'
                  : 'Pickup Time / Vehicle Details (Optional)'}
              </label>
              <input
                type="text"
                required={orderType === 'delivery'}
                value={addressOrTable}
                onChange={(e) => {
                  setAddressOrTable(e.target.value);
                  if (addressError) setAddressError(null);
                }}
                placeholder={
                  orderType === 'dinein'
                    ? 'e.g. Table 4'
                    : orderType === 'delivery'
                    ? 'e.g. House #12, Block B, Green City, Lahore'
                    : 'e.g. Ready in 20 mins'
                }
                className={`w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border text-xs text-stone-800 focus:ring-2 focus:ring-[#FF4B72] focus:outline-none ${
                  addressError ? 'border-red-500 bg-red-50/50' : 'border-stone-200'
                }`}
              />
              {orderType === 'delivery' && !addressError && (
                <p className="text-[11px] text-amber-800/80 mt-1 flex items-center gap-1 font-medium">
                  <i className="fa-solid fa-[#FF4B72] fa-circle-info text-[#FF4B72]"></i>
                  <span>Delivery Zone: Exclusively within <strong>Paragon</strong> & <strong>Green City</strong>.</span>
                </p>
              )}
              {addressError && (
                <div className="mt-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2 animate-shake">
                  <i className="fa-solid fa-triangle-exclamation text-red-500 text-sm mt-0.5 shrink-0"></i>
                  <span>{addressError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                Order Notes / Allergies (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please send extra spoons & napkins"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:ring-2 focus:ring-[#FF4B72] focus:outline-none"
              />
            </div>

            {/* Post-Order Feedback Prompt */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 border border-pink-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF4B72]/15 text-[#FF4B72] flex items-center justify-center text-xs font-bold">
                    <i className="fa-solid fa-star"></i>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#2D1B18] block">
                      How do you rate our service?
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Help us improve! Rating will be published with your order.
                    </span>
                  </div>
                </div>

                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFeedback}
                    onChange={(e) => setIncludeFeedback(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#FF4B72] relative"></div>
                </label>
              </div>

              {includeFeedback && (
                <div className="space-y-2 pt-1 border-t border-pink-200/60 animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setServiceRating(star)}
                        className="text-lg focus:outline-none transition-transform hover:scale-125"
                      >
                        <i
                          className={`fa-solid fa-star ${
                            star <= serviceRating ? 'text-amber-400' : 'text-stone-300'
                          }`}
                        ></i>
                      </button>
                    ))}
                    <span className="text-xs font-bold text-stone-700 ml-2">
                      {serviceRating === 5
                        ? '🌟 Excellent!'
                        : serviceRating === 4
                        ? '😊 Very Good'
                        : serviceRating === 3
                        ? '😐 Average'
                        : '🙁 Could be better'}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={serviceComment}
                    onChange={(e) => setServiceComment(e.target.value)}
                    placeholder="Quick service note (e.g., Easy ordering & polite staff!)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:ring-1 focus:ring-[#FF4B72] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </form>

        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-stone-500 block">Total Amount</span>
            <span className="font-heading font-black text-2xl text-[#2D1B18]">
              Rs. {subtotal}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={`tel:${STORE_INFO.phone}`}
              className="py-3.5 px-4 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              title="Call Store"
            >
              <i className="fa-solid fa-phone text-[#FF4B72]"></i>
              <span className="hidden sm:inline">Call</span>
            </a>

            <button
              type="submit"
              form="order-form"
              disabled={cart.length === 0}
              className={`flex-1 sm:flex-none py-3.5 px-6 rounded-xl font-bold text-xs text-white transition-all shadow-md flex items-center justify-center gap-2.5 ${
                cart.length === 0
                  ? 'bg-stone-300 cursor-not-allowed'
                  : 'bg-[#25D366] hover:bg-[#20ba5a]'
              }`}
            >
              <i className="fa-brands fa-whatsapp text-lg"></i>
              <span>Send Order on WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
