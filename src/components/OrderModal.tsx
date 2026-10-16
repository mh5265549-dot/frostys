import React, { useState } from 'react';
import { CartItem, Review, ShopMode } from '../types';
import { STORE_INFO } from '../data/menuData';
import { isConeCupApplicable } from '../utils/categoryUtils';
import { generateThermalReceiptText } from '../utils/receiptFormatter';
import { SlideFillButton } from './SlideFillButton';

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
  activeShop?: ShopMode;
  onSwitchShop?: (shop: ShopMode) => void;
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
  activeShop,
  onSwitchShop,
}) => {
  const [orderType, setOrderType] = useState<'takeaway' | 'dinein' | 'delivery'>('takeaway');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressOrTable, setAddressOrTable] = useState('');
  const [selectedDeliveryZone, setSelectedDeliveryZone] = useState<'greencity' | 'paragon'>('greencity');
  const [notes, setNotes] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);

  // Post-Order Service Rating State
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [serviceComment, setServiceComment] = useState<string>('');
  const [includeFeedback, setIncludeFeedback] = useState<boolean>(true);
  const [showReceiptPreview, setShowReceiptPreview] = useState<boolean>(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const normalizedAddress = addressOrTable.toLowerCase();
  const isParagon = orderType === 'delivery' && (
    selectedDeliveryZone === 'paragon' || 
    normalizedAddress.includes('paragon')
  );
  const deliveryFee = orderType === 'delivery' ? (isParagon ? 100 : 0) : 0;
  const deliveryZoneLabel = isParagon ? 'Paragon' : 'Green City';
  const grandTotal = subtotal + deliveryFee;

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
        const coneRejectionMsg = "Order not accepted for delivery: Cones are not available for delivery to prevent melting during transit. Please select Cup container or choose Takeaway/Dine-In.";
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

    // Check what categories are present in cart
    const isGrillItem = (ci: CartItem) => {
      if (ci.menuItem.category === 'fast-food-bbq') return true;
      const name = ci.menuItem.name.toLowerCase();
      const tags = (ci.menuItem.tags || []).map((t) => t.toLowerCase());
      return (
        name.includes('burger') ||
        name.includes('sandwich') ||
        name.includes('taco') ||
        name.includes('wrap') ||
        name.includes('fries') ||
        name.includes('chai') ||
        name.includes('grill') ||
        tags.some((t) =>
          ['burger', 'sandwich', 'taco', 'wrap', 'fries', 'chai', 'grill', 'fast food'].some((k) =>
            t.includes(k)
          )
        )
      );
    };

    const isDessertItem = (ci: CartItem) => {
      if (['scoops', 'sundaes', 'shakes', 'kulfi', 'coffees', 'sodas'].includes(ci.menuItem.category)) return true;
      const name = ci.menuItem.name.toLowerCase();
      const tags = (ci.menuItem.tags || []).map((t) => t.toLowerCase());
      return (
        name.includes('ice cream') ||
        name.includes('scoop') ||
        name.includes('cone') ||
        name.includes('sundae') ||
        name.includes('shake') ||
        name.includes('kulfi') ||
        name.includes('chiller') ||
        tags.some((t) =>
          ['ice cream', 'scoop', 'cone', 'sundae', 'shake', 'kulfi', 'dessert', 'soda'].some((k) =>
            t.includes(k)
          )
        )
      );
    };

    const hasGrill = cart.some(isGrillItem);
    const hasDessert = cart.some(isDessertItem);

    // Generate thermal receipt pattern for WhatsApp message
    const { whatsappMessage } = generateThermalReceiptText({
      cart,
      orderType,
      customerName,
      customerPhone,
      addressOrTable,
      notes,
      subtotal,
      deliveryFee,
      deliveryZone: orderType === 'delivery' ? deliveryZoneLabel : undefined,
    });

    const encodedMsg = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${STORE_INFO.whatsapp}?text=${encodedMsg}`;

    // Log order in history and deduct stock
    if (onOrderSubmitted) {
      onOrderSubmitted({
        customerName,
        customerPhone,
        address: addressOrTable,
        orderType,
        deliveryFee: orderType === 'delivery' ? deliveryFee : undefined,
        deliveryZone: orderType === 'delivery' ? (isParagon ? 'paragon' : 'greencity') : undefined,
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
        totalAmount: grandTotal,
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
      <div className="bg-white text-stone-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-white text-stone-900 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-stone-900">
                Your Frosty's Order
              </h3>
              <span className="text-xs text-stone-500">
                8B Commercial, Green City, Lahore • Open 5 PM - 2 AM
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
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
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'takeaway'
                    ? 'bg-stone-900 text-white shadow-xs'
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
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'dinein'
                    ? 'bg-stone-900 text-white shadow-xs'
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
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  orderType === 'delivery'
                    ? 'bg-blue-600 text-white shadow-xs'
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
                  <h5 className="font-extrabold text-amber-950">Cones Are Not Available For Delivery</h5>
                  <p className="text-[11px] text-amber-900 leading-relaxed mt-0.5">
                    Your cart contains crispy ice cream cone(s). <strong>Cones are not available for delivery</strong>. Only cups and other desserts can be delivered. Please switch your order type to Takeaway/Dine-In or change container to Cup to proceed with delivery.
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
                  className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                <i className="fa-solid fa-basket-shopping text-3xl text-stone-300"></i>
                <p className="text-sm font-semibold text-stone-600">Your cart is currently empty</p>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Browse our menu to select fresh waffle cones, sundaes, shakes, burgers, and delicious treats!
                </p>
                <div className="flex items-center justify-center pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-ice-cream"></i>
                    <span>Explore Menu</span>
                  </button>
                </div>
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-heading font-bold text-sm text-[#2D1B18] truncate">
                              {item.menuItem.name} {item.selectedVariant && <span className="text-xs font-semibold text-blue-700">({item.selectedVariant.name})</span>}
                            </h4>
                          </div>
                          <span className="text-xs text-stone-500 font-medium block mt-0.5">
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

                        {/* Delete / Remove */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(itemId)}
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 text-xs flex items-center justify-center cursor-pointer transition-colors"
                          title="Remove product from order"
                          aria-label={`Remove ${item.menuItem.name} from order`}
                        >
                          <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Cross-Shop Suggestion Banner */}
                {onSwitchShop && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {cart.some((c) => c.menuItem.category === 'fast-food-bbq') ? '🍦' : '🔥'}
                      </span>
                      <span className="text-stone-700 font-semibold text-[11px]">
                        {cart.some((c) => c.menuItem.category === 'fast-food-bbq')
                          ? 'Want ice cream scoops or a shake with your food?'
                          : 'Want burgers, tikka or fries with your ice cream?'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSwitchShop(
                          cart.some((c) => c.menuItem.category === 'fast-food-bbq')
                            ? 'ice-cream'
                            : 'grill'
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl text-white font-black text-[11px] shadow-sm shrink-0 transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer ${
                        cart.some((c) => c.menuItem.category === 'fast-food-bbq')
                          ? 'bg-[#FF4B72]'
                          : 'bg-orange-600'
                      }`}
                    >
                      <span>
                        {cart.some((c) => c.menuItem.category === 'fast-food-bbq')
                          ? "Switch to Ice Cream"
                          : "Switch to Grill"}
                      </span>
                      <i className="fa-solid fa-arrow-right text-[9px]"></i>
                    </button>
                  </div>
                )}
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

            {/* Delivery Area Selector (Only Paragon is 100 Rs; Green City is Free) */}
            {orderType === 'delivery' && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 border border-blue-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                    <i className="fa-solid fa-truck-fast text-blue-600"></i>
                    <span>Delivery Area (Paragon or Green City) *</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Official Delivery Zone
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDeliveryZone('greencity');
                      if (addressError) setAddressError(null);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      !isParagon
                        ? 'bg-white border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                        : 'bg-white/60 border-stone-200 hover:bg-white text-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-stone-900">Green City</span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">FREE</span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5 font-medium">Rs. 0 Delivery Charge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDeliveryZone('paragon');
                      if (addressError) setAddressError(null);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isParagon
                        ? 'bg-amber-50/90 border-amber-600 shadow-xs ring-2 ring-amber-600/30'
                        : 'bg-white/60 border-stone-200 hover:bg-white text-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-stone-900">Paragon</span>
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Rs. 100</span>
                    </div>
                    <span className="text-[11px] text-amber-800 block mt-0.5 font-medium">+Rs. 100 Delivery Charges</span>
                  </button>
                </div>

                <div className="text-[11px] text-stone-600 flex items-center gap-1.5 pt-0.5 font-medium">
                  <i className="fa-solid fa-circle-info text-blue-600 text-xs shrink-0"></i>
                  <span>There is <strong>Rs. 100 delivery charges only in Paragon</strong>. Delivery in <strong>Green City is completely FREE</strong>!</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                {orderType === 'dinein'
                  ? 'Table Number (Optional)'
                  : orderType === 'delivery'
                  ? `Complete Delivery Address (${isParagon ? 'Paragon' : 'Green City'}) *`
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
                    ? (isParagon ? 'e.g. House #14, Imperial Block, Paragon City, Lahore' : 'e.g. House #12, Block B, Green City, Lahore')
                    : 'e.g. Ready in 20 mins'
                }
                className={`w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border text-xs text-stone-800 focus:ring-2 focus:ring-[#FF4B72] focus:outline-none ${
                  addressError ? 'border-red-500 bg-red-50/50' : 'border-stone-200'
                }`}
              />
              {orderType === 'delivery' && !addressError && (
                <p className="text-[11px] text-stone-600 mt-1 flex items-center gap-1 font-medium">
                  <i className="fa-solid fa-location-dot text-blue-600"></i>
                  <span>
                    Delivering to <strong>{isParagon ? 'Paragon City (Rs. 100 delivery fee applies)' : 'Green City (Free delivery)'}</strong>.
                  </span>
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

            {/* Order Price Summary Breakdown */}
            <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Items Subtotal ({cart.length} item{cart.length === 1 ? '' : 's'})</span>
                <span className="font-bold text-stone-800">Rs. {subtotal}</span>
              </div>

              {orderType === 'delivery' && (
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-stone-600">
                    <i className="fa-solid fa-truck-fast text-stone-400"></i>
                    <span>Delivery Charges ({isParagon ? 'Paragon' : 'Green City'})</span>
                  </span>
                  <span className={`font-extrabold ${deliveryFee > 0 ? 'text-amber-700' : 'text-emerald-600'}`}>
                    {deliveryFee > 0 ? `+Rs. ${deliveryFee}` : 'FREE (Rs. 0)'}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm font-black text-stone-900">
                <span>Total Payable</span>
                <span className="text-[#FF4B72] font-heading font-black text-lg">Rs. {grandTotal}</span>
              </div>
            </div>

            {/* WhatsApp Receipt Pattern Preview */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowReceiptPreview(!showReceiptPreview)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-receipt text-[#FF4B72]"></i>
                  <span>WhatsApp Receipt Preview</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-stone-600 font-semibold border border-stone-200">
                    Thermal Print Style
                  </span>
                </div>
                <i className={`fa-solid fa-chevron-${showReceiptPreview ? 'up' : 'down'} text-xs text-stone-400`}></i>
              </button>

              {showReceiptPreview && (
                <div className="mt-2.5 p-4 rounded-xl bg-stone-900 text-stone-100 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner border border-stone-700 whitespace-pre">
                  {generateThermalReceiptText({
                    cart,
                    orderType,
                    customerName: customerName || 'Valued Guest',
                    customerPhone: customerPhone || '03XX-XXXXXXX',
                    addressOrTable,
                    notes,
                    subtotal,
                    deliveryFee,
                    deliveryZone: orderType === 'delivery' ? deliveryZoneLabel : undefined,
                  }).plainReceipt}
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
              Rs. {grandTotal}
            </span>
            {orderType === 'delivery' && (
              <span className="text-[11px] font-bold block mt-0.5">
                {deliveryFee > 0 ? (
                  <span className="text-amber-700">Includes Rs. 100 Paragon delivery charge</span>
                ) : (
                  <span className="text-emerald-700">Includes Free Delivery (Green City)</span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SlideFillButton
              href={`tel:${STORE_INFO.phone}`}
              fill="#e7e5e4"
              textColor="#1c1917"
              hoverFill="#dc2626"
              hoverTextColor="#ffffff"
              direction="up"
              rounded={12}
              padding="12px 16px"
              className="text-xs font-bold"
              title="Call Store"
            >
              <i className="fa-solid fa-phone"></i>
              <span className="hidden sm:inline">Call</span>
            </SlideFillButton>

            <SlideFillButton
              type="submit"
              form="order-form"
              disabled={cart.length === 0}
              fill={cart.length === 0 ? '#d6d3d1' : '#25D366'}
              textColor="#ffffff"
              hoverFill="#128C7E"
              hoverTextColor="#ffffff"
              direction="up"
              rounded={12}
              padding="14px 22px"
              className="flex-1 sm:flex-none text-xs shadow-md"
            >
              <i className="fa-brands fa-whatsapp text-lg"></i>
              <span>Send Order on WhatsApp</span>
            </SlideFillButton>
          </div>
        </div>

      </div>
    </div>
  );
};
