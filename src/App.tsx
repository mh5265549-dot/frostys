import React, { useState } from 'react';
import { MenuItem, CartItem } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { AboutSection } from './components/AboutSection';
import { LocationHoursSection } from './components/LocationHoursSection';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { ItemDetailModal } from './components/ItemDetailModal';
import { OrderModal } from './components/OrderModal';
import { CallModal } from './components/CallModal';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Add Item to Cart
  const handleAddToCart = (
    item: MenuItem,
    quantity: number = 1,
    instructions: string = ''
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (ci) => ci.menuItem.id === item.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * item.price,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            menuItem: item,
            quantity,
            totalPrice: quantity * item.price,
          },
        ];
      }
    });

    triggerToast(`Added ${quantity}x ${item.name} to your order!`);
  };

  // Update Item Quantity in Cart
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.menuItem.id === id) {
            const newQty = ci.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...ci,
              quantity: newQty,
              totalPrice: newQty * ci.menuItem.price,
            };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== id));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#2D1B18] font-sans antialiased selection:bg-[#FF4B72] selection:text-white flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-8 right-4 z-50 bg-[#2D1B18] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#FF4B72] flex items-center gap-3 animate-slideUp">
          <i className="fa-solid fa-[#FF4B72] fa-circle-check text-[#FF4B72] text-lg"></i>
          <span className="text-xs sm:text-sm font-bold text-amber-50">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
        onOpenCallModal={() => setIsCallModalOpen(true)}
      />

      {/* Hero Section */}
      <main className="flex-1">
        <Hero
          onOpenOrderModal={() => setIsOrderModalOpen(true)}
          onOpenCallModal={() => setIsCallModalOpen(true)}
        />

        {/* Menu Section */}
        <MenuSection
          onSelectItem={(item) => setSelectedItem(item)}
          onAddToCart={(item) => handleAddToCart(item, 1)}
        />

        {/* About Section */}
        <AboutSection />

        {/* Location & Hours Section */}
        <LocationHoursSection
          onOpenCallModal={() => setIsCallModalOpen(true)}
        />

        {/* Reviews Section */}
        <ReviewsSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Order Bar (Visible when items in cart) */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#2D1B18]/95 backdrop-blur-md border-t border-[#3D2522] p-3 shadow-2xl sm:hidden">
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#FF4B72] to-[#E63956] text-white font-bold text-sm shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white text-[#E63956] font-extrabold text-xs px-2 py-0.5 rounded-full">
                {cartTotalCount}
              </span>
              <span>View Order</span>
            </div>
            <span className="font-black">Rs. {cartTotalPrice} →</span>
          </button>
        </div>
      )}

      {/* Item Details Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Order / Cart Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Call / Contact Modal */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

    </div>
  );
}
