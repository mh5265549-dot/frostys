import React, { useState, useEffect } from 'react';
import { MenuItem, CartItem, OrderRecord, Review, Complaint, Category } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustSection } from './components/TrustSection';
import { MenuSection } from './components/MenuSection';
import { FlameTransitionOverlay } from './components/FlameTransitionOverlay';
import { FrostTransitionOverlay } from './components/FrostTransitionOverlay';
import { FrostysFlameViewPage } from './components/FrostysFlameViewPage';
import { AboutSection } from './components/AboutSection';
import { LocationHoursSection } from './components/LocationHoursSection';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { ItemDetailModal, CustomizationDetails } from './components/ItemDetailModal';
import { OrderModal } from './components/OrderModal';
import { CallModal } from './components/CallModal';
import { InventoryManagerModal } from './components/InventoryManagerModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { FloatingCartBar } from './components/FloatingCartBar';
import { FeedbackModal } from './components/FeedbackModal';
import { ComplaintModal } from './components/ComplaintModal';
import { FloatingFeedbackButton } from './components/FloatingFeedbackButton';
import { validateItemCustomizationContainer } from './utils/categoryUtils';
import {
  getStoredInventory,
  saveInventory,
  deductStockFromOrder,
  countLowStockItems,
} from './utils/inventory';
import {
  getStoredOrderHistory,
  saveNewOrderRecord,
  updateOrderStatus,
} from './utils/orderHistory';
import {
  getStoredMenuItems,
  updateSingleMenuItem,
  resetMenuCatalogToDefault,
} from './utils/menuStore';
import { getStoredFeedback, saveFeedback } from './utils/feedbackStore';
import {
  getStoredComplaints,
  saveComplaint,
  updateComplaintStatus,
} from './utils/complaintStore';

export default function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getStoredMenuItems());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isOrderHistoryModalOpen, setIsOrderHistoryModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category['id']>('all');
  const [isFlameTransitioning, setIsFlameTransitioning] = useState(false);
  const [isFrostTransitioning, setIsFrostTransitioning] = useState(false);
  const [isFrostysFlameView, setIsFrostysFlameView] = useState(false);

  // Trigger smooth cinematic heat/flame transition to Frosty's Grill Teaser
  const handleNavigateToFrostysFlame = () => {
    setIsFlameTransitioning(true);
    setTimeout(() => {
      setIsFrostysFlameView(true);
      setIsFlameTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
  };

  // Return smoothly to Frosty's Ice Cream Shop with custom Frozen Screen transition
  const handleBackToDessertStore = () => {
    setIsFrostTransitioning(true);
    setTimeout(() => {
      setIsFrostysFlameView(false);
      setActiveCategory('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setIsFrostTransitioning(false);
      }, 500);
    }, 450);
  };

  // Persistent Feedback State
  const [reviews, setReviews] = useState<Review[]>(() => getStoredFeedback());

  // Persistent Complaint State
  const [complaints, setComplaints] = useState<Complaint[]>(() => getStoredComplaints());

  // Handle New Feedback Submission
  const handleNewFeedbackSubmitted = (newFeedback: Omit<Review, 'id' | 'date'>) => {
    const updated = saveFeedback(newFeedback);
    setReviews(updated);
    triggerToast('🌟 Thank you! Your feedback has been published.');
  };

  // Handle New Complaint Submission
  const handleNewComplaintSubmitted = (
    newComplaint: Omit<Complaint, 'id' | 'ticketNumber' | 'timestamp' | 'status'>
  ) => {
    const { updatedList, newComplaint: created } = saveComplaint(newComplaint);
    setComplaints(updatedList);
    triggerToast(`⚠️ Complaint ticket #${created.ticketNumber} registered.`);
    return { ticketNumber: created.ticketNumber };
  };

  // Handle Updating Complaint Status from Admin
  const handleUpdateComplaintStatus = (
    complaintId: string,
    status: Complaint['status'],
    resolutionNotes?: string
  ) => {
    const updated = updateComplaintStatus(complaintId, status, resolutionNotes);
    setComplaints(updated);
    triggerToast(`Ticket status updated to ${status}`);
  };


  // Persistent Inventory & Order History State
  const [inventory, setInventory] = useState<{ [itemId: string]: number }>(() =>
    getStoredInventory()
  );
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>(() =>
    getStoredOrderHistory()
  );

  // Sync menu updates
  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    const newCatalog = updateSingleMenuItem(updatedItem);
    setMenuItems(newCatalog);
    triggerToast(`Updated ${updatedItem.name} in menu catalog!`);
  };

  // Reset menu catalog
  const handleResetMenuCatalog = () => {
    const defaultCatalog = resetMenuCatalogToDefault();
    setMenuItems(defaultCatalog);
    triggerToast('Reset menu items back to default catalog!');
  };

  // Sync inventory changes
  const handleUpdateStock = (itemId: string, newStock: number) => {
    const updated = { ...inventory, [itemId]: newStock };
    setInventory(updated);
    saveInventory(updated);
  };

  // Sync order status changes
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: OrderRecord['status']
  ) => {
    const updated = updateOrderStatus(orderId, newStatus);
    setOrderHistory(updated);
  };

  // Handle WhatsApp order submission - deduct stock & store order log
  const handleOrderSubmitted = (orderData: {
    customerName: string;
    customerPhone: string;
    address?: string;
    orderType: 'delivery' | 'takeaway' | 'dinein';
    items: { id: string; name: string; quantity: number; price: number; unit?: string }[];
    totalAmount: number;
    notes?: string;
  }) => {
    // 1. Save new order record to local storage
    const newRecord = saveNewOrderRecord({
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      address: orderData.address,
      orderType: orderData.orderType,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      notes: orderData.notes,
      status: 'Received (WhatsApp)',
    });

    setOrderHistory((prev) => [newRecord, ...prev]);

    // 2. Automatically decrement stock quantities
    const updatedInventory = deductStockFromOrder(
      orderData.items.map((i) => ({ id: i.id, quantity: i.quantity }))
    );
    setInventory(updatedInventory);

    // 3. Clear active cart
    setCart([]);

    // 4. Show success notification
    triggerToast(`🎉 Order #${newRecord.id} sent on WhatsApp! Inventory stock updated.`);
  };

  // Re-order past order items
  const handleReorder = (order: OrderRecord) => {
    let readdedCount = 0;
    order.items.forEach((item) => {
      const menuItem = menuItems.find((m) => m.id === item.id);
      if (menuItem) {
        const availableStock = inventory[menuItem.id] ?? 15;
        if (availableStock > 0) {
          handleAddToCart(menuItem, item.quantity);
          readdedCount++;
        }
      }
    });

    if (readdedCount > 0) {
      triggerToast(`Re-added items from Order #${order.id} to your cart!`);
      setIsOrderHistoryModalOpen(false);
      setIsOrderModalOpen(true);
    } else {
      alert('Sorry, the items from this past order are currently out of stock.');
    }
  };

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add Item to Cart with optional Customizations
  const handleAddToCart = (
    item: MenuItem,
    quantity: number = 1,
    customization?: CustomizationDetails
  ) => {
    if (item.isComingSoon) {
      triggerToast(`⚠️ ${item.name} is launching soon! Ordering is currently locked.`);
      return;
    }

    const itemStock = inventory[item.id] ?? 15;
    if (itemStock <= 0) {
      alert(`Sorry, ${item.name} is currently out of stock!`);
      return;
    }

    const selectedContainer = validateItemCustomizationContainer(
      item,
      customization?.selectedContainer
    );
    const selectedVariant = customization?.selectedVariant;
    const selectedFlavors = customization?.selectedFlavors || [];
    const selectedSodas = customization?.selectedSodas || [];
    const selectedSyrups = customization?.selectedSyrups || [];
    const selectedToppings = customization?.selectedToppings || [];
    const customInstructions = customization?.instructions || '';
    const extraCharges = customization?.extraCharges || 0;
    const unitPrice = customization?.unitPrice || (item.price + extraCharges);

    // Unique cart item identifier
    const cartItemId = `${item.id}_${selectedContainer || ''}_${selectedVariant?.name || ''}_${selectedFlavors.join('-')}_${selectedSodas.join('-')}_${selectedSyrups.join('-')}_${selectedToppings
      .map((t) => t.name)
      .join('-')}_${customInstructions}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (ci) => ci.cartItemId === cartItemId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(itemStock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            menuItem: item,
            quantity: Math.min(itemStock, quantity),
            selectedContainer,
            selectedVariant,
            selectedFlavors,
            selectedSodas,
            selectedSyrups,
            selectedToppings,
            customInstructions,
            extraCharges,
            unitPrice,
            totalPrice: Math.min(itemStock, quantity) * unitPrice,
          },
        ];
      }
    });

    const nameToDisplay = selectedVariant ? `${item.name} (${selectedVariant.name})` : item.name;
    triggerToast(`Added ${quantity}x ${nameToDisplay} to your order!`);
  };

  // Update Item Quantity in Cart
  const handleUpdateQuantity = (idKey: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.cartItemId === idKey || ci.menuItem.id === idKey) {
            const itemStock = inventory[ci.menuItem.id] ?? 15;
            const newQty = ci.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > itemStock) {
              triggerToast(`Only ${itemStock} units available in stock!`);
              return ci;
            }
            return {
              ...ci,
              quantity: newQty,
              totalPrice: newQty * ci.unitPrice,
            };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove Item
  const handleRemoveItem = (idKey: string) => {
    setCart((prev) => prev.filter((ci) => ci.cartItemId !== idKey && ci.menuItem.id !== idKey));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = countLowStockItems(inventory);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#2D1B18] font-sans antialiased selection:bg-[#FF4B72] selection:text-white flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-8 right-4 z-50 bg-[#2D1B18] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#FF4B72] flex items-center gap-3 animate-slideUp max-w-sm">
          <i className="fa-solid fa-circle-check text-[#38D39F] text-xl"></i>
          <span className="text-xs sm:text-sm font-bold text-amber-50">{toastMessage}</span>
        </div>
      )}

      {/* Flame Heat Transition Overlay */}
      <FlameTransitionOverlay isActive={isFlameTransitioning} />

      {/* Frozen Screen Transition Overlay when returning to Ice Cream Parlor */}
      <FrostTransitionOverlay isActive={isFrostTransitioning} />

      {/* Complete View Swap: Frosty's Flame Teaser View vs Main Ice Cream Shop View */}
      {isFrostysFlameView ? (
        <FrostysFlameViewPage
          onBackToDesserts={handleBackToDessertStore}
          triggerToast={triggerToast}
        />
      ) : (
        <>
          {/* Navigation Bar */}
          <Navbar
            cartCount={cartTotalCount}
            onOpenOrderModal={() => setIsOrderModalOpen(true)}
            onOpenCallModal={() => setIsCallModalOpen(true)}
            onOpenInventoryModal={() => setIsInventoryModalOpen(true)}
            onOpenOrderHistoryModal={() => setIsOrderHistoryModalOpen(true)}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onNavigateToFrostysFlame={handleNavigateToFrostysFlame}
            lowStockCount={lowStockCount}
            ordersCount={orderHistory.length}
          />

          <main className="flex-1">
            {/* Mobile-First Hero Section with Search Bar */}
            <Hero
              onOpenOrderModal={() => setIsOrderModalOpen(true)}
              onOpenCallModal={() => setIsCallModalOpen(true)}
              searchQuery={globalSearchQuery}
              onSearchChange={(query) => setGlobalSearchQuery(query)}
              onQuickSearch={(term) => setGlobalSearchQuery(term)}
            />

            {/* Local Trust Elements Section */}
            <TrustSection />

            {/* Product Catalog & Category Tabs Section */}
            <MenuSection
              items={menuItems}
              onSelectItem={(item) => setSelectedItem(item)}
              onAddToCart={(item) => handleAddToCart(item, 1)}
              searchQuery={globalSearchQuery}
              onSearchChange={(query) => setGlobalSearchQuery(query)}
              inventory={inventory}
              activeCategory={activeCategory}
              onCategoryChange={(cat) => setActiveCategory(cat)}
              onNavigateToFrostysFlame={handleNavigateToFrostysFlame}
              triggerToast={triggerToast}
            />

            {/* About Section */}
            <AboutSection />

            {/* Location & Hours Section */}
            <LocationHoursSection
              onOpenCallModal={() => setIsCallModalOpen(true)}
            />

            {/* Reviews & Help Center Section */}
            <ReviewsSection
              reviews={reviews}
              complaints={complaints}
              onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
              onOpenComplaintModal={() => setIsComplaintModalOpen(true)}
            />
          </main>

          {/* Footer */}
          <Footer onOpenAdminModal={() => setIsAdminModalOpen(true)} />

          {/* Floating Interactive Cart Bar / Drawer Trigger */}
          <FloatingCartBar
            cart={cart}
            onOpenOrderModal={() => setIsOrderModalOpen(true)}
          />

          {/* Floating Feedback Trigger Button */}
          <FloatingFeedbackButton
            onClick={() => setIsFeedbackModalOpen(true)}
            feedbackCount={reviews.length}
          />
        </>
      )}

      {/* Item Details Modal */}
      <ItemDetailModal
        item={selectedItem}
        stock={selectedItem ? inventory[selectedItem.id] : 15}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Order / Cart Modal with Free WhatsApp Checkout */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderSubmitted={handleOrderSubmitted}
        onSaveFeedback={handleNewFeedbackSubmitted}
      />

      {/* Call / Contact Modal */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

      {/* Stock & Inventory Manager Modal */}
      <InventoryManagerModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        inventory={inventory}
        onUpdateStock={handleUpdateStock}
      />

      {/* Order History & Past Orders Modal */}
      <OrderHistoryModal
        isOpen={isOrderHistoryModalOpen}
        onClose={() => setIsOrderHistoryModalOpen(false)}
        orders={orderHistory}
        onUpdateStatus={handleUpdateOrderStatus}
        onReorder={handleReorder}
      />

      {/* Secure Owner Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        menuItems={menuItems}
        onUpdateMenuItem={handleUpdateMenuItem}
        onResetMenu={handleResetMenuCatalog}
        inventory={inventory}
        onUpdateStock={handleUpdateStock}
        orders={orderHistory}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        reviews={reviews}
        complaints={complaints}
        onUpdateComplaintStatus={handleUpdateComplaintStatus}
      />

      {/* Customer Feedback Modal Form */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmitFeedback={handleNewFeedbackSubmitted}
      />

      {/* Customer Complaint Registration Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSubmitComplaint={handleNewComplaintSubmitted}
      />


    </div>
  );
}
