import React, { useState } from 'react';
import { MenuItem } from '../types';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, instructions: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  const handleAdd = () => {
    onAddToCart(item, quantity, instructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-[#2D1B18] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Header Image */}
        <div className="relative h-64 overflow-hidden bg-stone-100">
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

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
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
            <span className="font-heading font-black text-2xl text-[#FF4B72]">
              Rs. {item.price * quantity}
            </span>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed font-normal">
            {item.description}
          </p>

          {/* Tags */}
          {item.tags && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Special Customization / Instructions (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Extra Nutella drizzle, less sweet, or Oreos on side"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
            />
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Select Quantity
            </span>
            <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white text-stone-800 font-bold hover:bg-stone-200 flex items-center justify-center transition-colors shadow-sm"
              >
                <i className="fa-solid fa-minus text-xs"></i>
              </button>
              <span className="font-bold text-base px-2 text-[#2D1B18]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white text-stone-800 font-bold hover:bg-stone-200 flex items-center justify-center transition-colors shadow-sm"
              >
                <i className="fa-solid fa-plus text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3">
          <button
            onClick={handleAdd}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF4B72] to-[#E63956] hover:from-[#E63956] hover:to-[#C92A43] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-bag-shopping"></i>
            <span>Add to Order (Rs. {item.price * quantity})</span>
          </button>
        </div>

      </div>
    </div>
  );
};
