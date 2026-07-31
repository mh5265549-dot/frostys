import React, { useState } from 'react';
import { MenuItem } from '../types';

export interface CustomizationDetails {
  selectedSyrups: string[];
  selectedToppings: { name: string; price: number }[];
  instructions: string;
  extraCharges: number;
  unitPrice: number;
}

interface ItemDetailModalProps {
  item: MenuItem | null;
  stock?: number;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    customization: CustomizationDetails
  ) => void;
}

const PREMIUM_CHUNKS = ['Mango Chunks', 'Banana Chunks'];

const SYRUP_OPTIONS = [
  { id: 'chocolate_syrup', name: 'Chocolate Syrup', icon: '🍫' },
  { id: 'blueberry_syrup', name: 'Blueberry Syrup', icon: '🫐' },
  { id: 'caramel_syrup', name: 'Caramel Syrup', icon: '🍮' },
  { id: 'strawberry_syrup', name: 'Strawberry Syrup', icon: '🍓' },
  { id: 'nutella_drizzle', name: 'Nutella Drizzle', icon: '🍯' },
  { id: 'biscoff_drizzle', name: 'Lotus Biscoff Drizzle', icon: '🍪' },
];

const TOPPING_OPTIONS = [
  // Standard Toppings (eligible for 2 free choices)
  { id: 'cookies_powder', name: 'Cookies Powder', isPremium: false, icon: '🍪' },
  { id: 'oreo_powder', name: 'Oreo Powder', isPremium: false, icon: '🍫' },
  { id: 'sprinkles', name: 'Rainbow Sprinkles', isPremium: false, icon: '🌈' },
  { id: 'choco_chips', name: 'Chocolate Chips', isPremium: false, icon: '🍫' },
  // Premium Fruit Chunks (Always +50 PKR)
  { id: 'mango_chunks', name: 'Mango Chunks', isPremium: true, icon: '🥭' },
  { id: 'banana_chunks', name: 'Banana Chunks', isPremium: true, icon: '🍌' },
];

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  stock = 15,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const availableStock = stock ?? 15;
  const isSoldOut = availableStock <= 0;

  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  // Customization selection state
  const [selectedSyrups, setSelectedSyrups] = useState<string[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  // Syrup toggle
  const toggleSyrup = (syrupName: string) => {
    if (selectedSyrups.includes(syrupName)) {
      setSelectedSyrups(selectedSyrups.filter((s) => s !== syrupName));
    } else {
      setSelectedSyrups([...selectedSyrups, syrupName]);
    }
  };

  // Topping toggle
  const toggleTopping = (toppingName: string) => {
    if (selectedToppings.includes(toppingName)) {
      setSelectedToppings(selectedToppings.filter((t) => t !== toppingName));
    } else {
      setSelectedToppings([...selectedToppings, toppingName]);
    }
  };

  // Calculate standard selections vs premium fruit chunks
  const selectedStandardToppings = selectedToppings.filter(
    (t) => !PREMIUM_CHUNKS.includes(t)
  );
  const selectedPremiumChunks = selectedToppings.filter((t) =>
    PREMIUM_CHUNKS.includes(t)
  );

  const standardCount = selectedSyrups.length + selectedStandardToppings.length;
  const standardFreeUsed = Math.min(2, standardCount);
  const standardExtraCount = Math.max(0, standardCount - 2);
  const standardExtraCharges = standardExtraCount * 50;

  const premiumCount = selectedPremiumChunks.length;
  const premiumExtraCharges = premiumCount * 50;

  const extraCharges = standardExtraCharges + premiumExtraCharges;

  const unitPrice = item.price + extraCharges;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    if (isSoldOut) return;

    let standardIndex = selectedSyrups.length;
    const toppingsWithPrice = selectedToppings.map((name) => {
      const isPremium = PREMIUM_CHUNKS.includes(name);
      if (isPremium) {
        return { name, price: 50 };
      } else {
        standardIndex += 1;
        const price = standardIndex > 2 ? 50 : 0;
        return { name, price };
      }
    });

    onAddToCart(item, quantity, {
      selectedSyrups,
      selectedToppings: toppingsWithPrice,
      instructions,
      extraCharges,
      unitPrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white text-[#2D1B18] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative flex flex-col max-h-[92vh] animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Header Image */}
        <div className="relative h-56 sm:h-64 overflow-hidden bg-stone-100 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {item.badge && (
            <span className="absolute top-4 left-4 bg-[#FF4B72] text-white text-xs font-black px-3 py-1 rounded-full shadow-md uppercase">
              {item.badge}
            </span>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Header Info */}
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-heading font-black text-2xl text-[#2D1B18]">
                {item.name}
              </h3>
              {item.calories && (
                <span className="text-xs text-stone-500 font-medium">
                  Approx. {item.calories}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="font-heading font-black text-2xl text-[#FF4B72] block">
                Rs. {totalPrice}
              </span>
              {extraCharges > 0 && (
                <span className="text-[11px] text-amber-600 font-bold block">
                  (Includes +Rs. {extraCharges * quantity} add-ons)
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            {item.description}
          </p>

          {/* Prominent Customization Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-900 font-black text-lg flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              ✨
            </div>
            <div className="text-xs space-y-1">
              <p className="font-extrabold text-amber-950 leading-snug">
                Note: Any 2 syrups or standard toppings are free. Additional ones cost 50 PKR extra. Mango chunks and Banana chunks cost 50 PKR extra each, even if they are your first selection.
              </p>
              <div className="text-amber-900/90 text-[11px] font-medium flex flex-wrap gap-x-3 gap-y-0.5">
                <span>
                  • Standard Choices: <strong>{standardCount}</strong> ({standardFreeUsed}/2 FREE
                  {standardExtraCount > 0 ? `, +${standardExtraCharges} PKR` : ''})
                </span>
                {premiumCount > 0 && (
                  <span className="font-bold text-amber-900">
                    • Premium Chunks: <strong>{premiumCount}</strong> (+{premiumExtraCharges} PKR)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 1: SYRUPS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-bottle-droplet text-amber-600"></i>
                <span>Flavor Syrups</span>
              </label>
              <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                {selectedSyrups.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SYRUP_OPTIONS.map((syrup) => {
                const isSelected = selectedSyrups.includes(syrup.name);

                return (
                  <button
                    key={syrup.id}
                    type="button"
                    onClick={() => toggleSyrup(syrup.name)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#2D1B18] text-white border-[#2D1B18] shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{syrup.icon}</span>
                      <span className="truncate">{syrup.name}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
                          isSelected
                            ? 'bg-[#FF4B72] border-[#FF4B72] text-white'
                            : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <i className="fa-solid fa-check"></i>}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: TOPPINGS & ADD-ONS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-cookie-bite text-amber-600"></i>
                <span>Toppings & Extra Chunks</span>
              </label>
              <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                {selectedToppings.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TOPPING_OPTIONS.map((topping) => {
                const isSelected = selectedToppings.includes(topping.name);

                return (
                  <button
                    key={topping.id}
                    type="button"
                    onClick={() => toggleTopping(topping.name)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-950 text-amber-100 border-amber-800 shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>{topping.icon}</span>
                      <span className="truncate">{topping.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                          topping.isPremium
                            ? 'bg-amber-500 text-stone-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {topping.isPremium ? '+50 PKR' : 'Standard'}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${
                          isSelected
                            ? 'bg-amber-500 border-amber-500 text-stone-900'
                            : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <i className="fa-solid fa-check"></i>}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Customization Instructions */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Special Customization / Instructions
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Less sweet, extra napkins, or sauce on side"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
            />
          </div>

          {/* Quantity Controls & Availability */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-200">
            <div>
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Select Quantity
              </span>
              <span
                className={`text-[11px] font-bold ${
                  isSoldOut ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {isSoldOut ? 'Currently Sold Out' : 'Freshly Prepared & Available'}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isSoldOut || quantity <= 1}
                className="w-8 h-8 rounded-lg bg-white text-stone-800 font-bold hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
              >
                <i className="fa-solid fa-minus text-xs"></i>
              </button>
              <span className="font-bold text-base px-2 text-[#2D1B18]">
                {isSoldOut ? 0 : quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={isSoldOut || quantity >= availableStock}
                className="w-8 h-8 rounded-lg bg-white text-stone-800 font-bold hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
              >
                <i className="fa-solid fa-plus text-xs"></i>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3 shrink-0">
          {isSoldOut ? (
            <button
              disabled
              className="w-full py-3.5 rounded-2xl bg-stone-200 text-stone-500 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-ban"></i>
              <span>Out of Stock</span>
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF4B72] to-[#E63956] hover:from-[#E63956] hover:to-[#C92A43] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <i className="fa-solid fa-bag-shopping"></i>
              <span>Add to Order • Rs. {totalPrice}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
