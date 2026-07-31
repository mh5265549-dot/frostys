import React, { useState } from 'react';
import { CartItem } from '../types';
import { STORE_INFO } from '../data/menuData';

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
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSubmitted,
}) => {
  if (!isOpen) return null;

  const [orderType, setOrderType] = useState<'takeaway' | 'dinein' | 'delivery'>('takeaway');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressOrTable, setAddressOrTable] = useState('');
  const [notes, setNotes] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your cart is empty! Please add some desserts from the menu first.');
      return;
    }

    if (!customerName || !customerPhone) {
      alert('Please fill in your name and phone number so we can process your order.');
      return;
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
      const unitText = item.menuItem.unit ? ` (${item.menuItem.unit})` : '';
      msg += `${idx + 1}. ${item.menuItem.name}${unitText} x${item.quantity} - Rs. ${item.totalPrice}\n`;
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
        items: cart.map((ci) => ({
          id: ci.menuItem.id,
          name: ci.menuItem.name,
          quantity: ci.quantity,
          price: ci.menuItem.price,
          unit: ci.menuItem.unit,
        })),
        totalAmount: subtotal,
        notes,
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
                onClick={() => setOrderType('takeaway')}
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
                onClick={() => setOrderType('dinein')}
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
                onClick={() => setOrderType('delivery')}
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
                  Select signature sundaes, thick shakes, warm Belgian waffles, or gelato scoops from our dessert menu to build your order!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-heading font-bold text-sm text-[#2D1B18]">
                          {item.menuItem.name}
                        </h4>
                        <span className="text-xs text-stone-500 font-medium">
                          Rs. {item.menuItem.price} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-stone-200">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.menuItem.id, -1)}
                          className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.menuItem.id, 1)}
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
                        onClick={() => onRemoveItem(item.menuItem.id)}
                        className="text-stone-400 hover:text-[#E63956] text-xs p-1"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))}
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
                  ? 'Complete Delivery Address in Lahore *'
                  : 'Pickup Time / Vehicle Details (Optional)'}
              </label>
              <input
                type="text"
                required={orderType === 'delivery'}
                value={addressOrTable}
                onChange={(e) => setAddressOrTable(e.target.value)}
                placeholder={
                  orderType === 'dinein'
                    ? 'e.g. Table 4'
                    : orderType === 'delivery'
                    ? 'e.g. House #12, Block B, Green City, Lahore'
                    : 'e.g. Ready in 20 mins'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:ring-2 focus:ring-[#FF4B72] focus:outline-none"
              />
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
