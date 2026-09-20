import React, { useState, useMemo, useRef } from 'react';
import { MenuItem, OrderRecord, Review, Complaint, Category } from '../types';
import {
  getStoredAdminPassword,
  saveAdminPassword,
  checkAdminPassword,
} from '../utils/menuStore';
import { calculateSalesAndRevenue } from '../utils/orderHistory';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onUpdateMenuItem: (updatedItem: MenuItem) => void;
  onAddNewProduct?: (newItem: MenuItem, initialStock?: number) => void;
  onDeleteProduct?: (itemId: string) => void;
  onResetMenu: () => void;
  inventory: { [itemId: string]: number };
  onUpdateStock: (itemId: string, newStock: number) => void;
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
  reviews?: Review[];
  complaints?: Complaint[];
  onUpdateComplaintStatus?: (
    complaintId: string,
    status: Complaint['status'],
    resolutionNotes?: string
  ) => void;
}

// Preset photo options for quick photo selection when adding a new product
const PRESET_PICTURES = [
  {
    label: 'Flame Burger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    category: 'fast-food-bbq',
  },
  {
    label: 'Zinger Chicken',
    url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
    category: 'fast-food-bbq',
  },
  {
    label: 'Loaded Fries',
    url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
    category: 'fast-food-bbq',
  },
  {
    label: 'Charcoal Tikka',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    category: 'fast-food-bbq',
  },
  {
    label: 'Waffle Cone',
    url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80',
    category: 'scoops',
  },
  {
    label: 'Lava Sundae',
    url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
    category: 'sundaes',
  },
  {
    label: 'Thick Shake',
    url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
    category: 'shakes',
  },
  {
    label: 'Shahi Kulfi',
    url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
    category: 'kulfi',
  },
  {
    label: 'Soda Chiller',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    category: 'sodas',
  },
];

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  onUpdateMenuItem,
  onAddNewProduct,
  onDeleteProduct,
  onResetMenu,
  inventory,
  onUpdateStock,
  orders,
  onUpdateOrderStatus,
  reviews = [],
  complaints = [],
  onUpdateComplaintStatus,
}) => {
  // Auth state - only asks for password (up to 12 characters)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(false);

  // Change Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [previousPassword, setPreviousPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    'sales' | 'inventory' | 'add-product' | 'complaints' | 'compliments' | 'orders'
  >('sales');

  // Sales time range filter: 'all' | 'today' | 'month'
  const [salesTimeRange, setSalesTimeRange] = useState<'today' | 'month' | 'all'>('today');

  // Inventory filters & search
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'out' | 'low' | 'in' | 'grill' | 'ice-cream'>('all');

  // Resolution note state for complaints
  const [editingResolution, setEditingResolution] = useState<{ id: string; note: string } | null>(null);

  // Form State for Adding a New Product
  const [newProdPicture, setNewProdPicture] = useState(
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
  );
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<MenuItem['category']>('fast-food-bbq');
  const [newProdPrice, setNewProdPrice] = useState<number | ''>('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState<number | ''>('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Serving');
  const [newProdInitialStock, setNewProdInitialStock] = useState<number>(15);
  const [newProdTag, setNewProdTag] = useState('Burger');
  const [addProductSuccessMsg, setAddProductSuccessMsg] = useState('');
  const [addProductErrorMsg, setAddProductErrorMsg] = useState('');

  // Item detail editing state (for editing options directly in kitchen inventory)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [editOriginalPrice, setEditOriginalPrice] = useState<number | ''>('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editStockUnits, setEditStockUnits] = useState<number>(15);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered inventory list
  const filteredInventoryItems = useMemo(() => {
    return menuItems.filter((item) => {
      const stock = inventory[item.id] ?? 15;
      const isGrill = item.category === 'fast-food-bbq';
      const q = inventorySearch.trim().toLowerCase();

      // Search matching
      if (q && !item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) {
        return false;
      }

      // Filter matching
      if (inventoryFilter === 'out') return stock <= 0;
      if (inventoryFilter === 'low') return stock > 0 && stock <= 5;
      if (inventoryFilter === 'in') return stock > 5;
      if (inventoryFilter === 'grill') return isGrill;
      if (inventoryFilter === 'ice-cream') return !isGrill;
      return true;
    });
  }, [menuItems, inventory, inventorySearch, inventoryFilter]);

  // Compliments: 4 & 5 stars reviews
  const complimentsList = useMemo(() => {
    return reviews.filter((r) => r.rating >= 4);
  }, [reviews]);

  if (!isOpen) return null;

  // Calculate day + month sales & revenue
  const salesMetrics = calculateSalesAndRevenue(orders);

  // Authentication Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Please enter your admin password (6 to 12 characters).');
      return;
    }
    if (checkAdminPassword(passwordInput.trim())) {
      setIsAuthenticated(true);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Incorrect password. Please verify your admin password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    setPasswordError('');
    setIsChangingPassword(false);
  };

  // Change Password Handler
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    // 1. Verify previous password
    if (!checkAdminPassword(previousPassword.trim())) {
      setPasswordChangeError('Incorrect previous password. Verification failed.');
      return;
    }

    const trimmedNew = newPassword.trim();
    // 2. Enforce more than 5 characters and less than or equal to 12 characters
    if (trimmedNew.length <= 5 || trimmedNew.length > 12) {
      setPasswordChangeError('New password must be more than 5 characters and less than or equal to 12 characters (6–12 chars).');
      return;
    }

    // 3. Confirm match
    if (trimmedNew !== confirmPassword.trim()) {
      setPasswordChangeError('New password and confirmation do not match.');
      return;
    }

    // 4. Save new password
    const success = saveAdminPassword(trimmedNew);
    if (success) {
      setPasswordChangeSuccess('Admin password changed successfully! Your new password is now active.');
      setPreviousPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordChangeSuccess('');
      }, 2000);
    } else {
      setPasswordChangeError('Failed to save new password. Password must be between 6 and 12 characters.');
    }
  };

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAddProductErrorMsg('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewProdPicture(reader.result);
          setAddProductErrorMsg('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Adding New Product
  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddProductErrorMsg('');
    setAddProductSuccessMsg('');

    if (!newProdName.trim()) {
      setAddProductErrorMsg('Product name is required.');
      return;
    }
    if (!newProdPrice || Number(newProdPrice) <= 0) {
      setAddProductErrorMsg('Please enter a valid price in PKR.');
      return;
    }
    if (!newProdPicture.trim()) {
      setAddProductErrorMsg('Please provide a picture for the product.');
      return;
    }

    const generatedId = `custom-${newProdCategory}-${Date.now().toString(36)}`;
    const tagsList: string[] = [newProdCategory];
    if (newProdCategory === 'fast-food-bbq' && newProdTag) {
      tagsList.push(newProdTag);
    }
    if (newProdBadge) {
      tagsList.push(newProdBadge);
    }

    const newMenuItem: MenuItem = {
      id: generatedId,
      name: newProdName.trim(),
      category: newProdCategory,
      price: Number(newProdPrice),
      originalPrice: newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
      description: newProdDescription.trim() || `${newProdName.trim()} freshly prepared with quality ingredients.`,
      image: newProdPicture.trim(),
      badge: newProdBadge.trim() || undefined,
      unit: newProdUnit.trim() || undefined,
      rating: 5.0,
      tags: tagsList,
      stock: newProdInitialStock,
    };

    if (onAddNewProduct) {
      onAddNewProduct(newMenuItem, newProdInitialStock);
    }

    setAddProductSuccessMsg(`Product "${newMenuItem.name}" added to menu catalog with ${newProdInitialStock} units in stock!`);
    
    // Reset form
    setNewProdName('');
    setNewProdPrice('');
    setNewProdOriginalPrice('');
    setNewProdDescription('');
    setNewProdBadge('');
  };

  // Open item edit modal/drawer
  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setEditPrice(item.price);
    setEditOriginalPrice(item.originalPrice ?? '');
    setEditName(item.name);
    setEditDescription(item.description);
    setEditBadge(item.badge ?? '');
    setEditStockUnits(inventory[item.id] ?? 15);
    setEditSuccessMsg('');
  };

  // Save edited product options
  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editName.trim()) return;
    if (!editPrice || Number(editPrice) <= 0) return;

    const updated: MenuItem = {
      ...editingItem,
      name: editName.trim(),
      price: Number(editPrice),
      originalPrice: editOriginalPrice ? Number(editOriginalPrice) : undefined,
      description: editDescription.trim(),
      badge: editBadge.trim() || undefined,
    };

    if (onUpdateMenuItem) {
      onUpdateMenuItem(updated);
    }
    onUpdateStock(editingItem.id, Number(editStockUnits));
    setEditSuccessMsg(`Saved options for "${updated.name}"!`);
    setTimeout(() => {
      setEditingItem(null);
      setEditSuccessMsg('');
    }, 900);
  };

  // Bulk Restock All Kitchen Items
  const handleRestockAllItems = () => {
    if (window.confirm('Restock all kitchen items to 15 units?')) {
      menuItems.forEach((item) => {
        onUpdateStock(item.id, 15);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-fadeIn">
      <div className="bg-[#1C1413] text-stone-100 w-full max-w-6xl rounded-3xl border border-stone-800 shadow-2xl overflow-hidden flex flex-col h-[94vh] max-h-[94vh]">
        
        {/* TOP HEADER */}
        <div className="shrink-0 p-4 sm:p-5 bg-[#140D0C] border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-[#FF4B72] flex items-center justify-center text-white shadow-md">
              <i className="fa-solid fa-lock text-base"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-lg sm:text-xl text-amber-50 tracking-wide">
                  Frosty's Owner Admin Portal
                </h2>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <i className="fa-solid fa-shield-halved text-[9px]"></i> Owner Control
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Live sales, daily/monthly revenue, kitchen stock & new product management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isChangingPassword
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border-stone-700'
                  }`}
                  title="Change Admin Password (6-12 chars)"
                >
                  <i className="fa-solid fa-key text-xs text-amber-400"></i>
                  <span className="hidden sm:inline">Change Password</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold transition-all border border-rose-900/60 flex items-center gap-1.5 cursor-pointer"
                  title="Lock Admin Portal"
                >
                  <i className="fa-solid fa-lock text-xs text-rose-400"></i>
                  <span className="hidden sm:inline">Lock Portal</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* 1. PASSWORD SIGN-IN SCREEN (WHEN NOT AUTHENTICATED) */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-14 text-center flex flex-col items-center justify-center my-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-b from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl shadow-lg relative">
              <i className="fa-solid fa-lock"></i>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                <i className="fa-solid fa-shield"></i>
              </div>
            </div>

            <div className="max-w-md">
              <h3 className="font-heading font-black text-2xl text-amber-100">
                Owner Password Access
              </h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Please enter your <strong className="text-amber-300 font-semibold">admin password</strong> (more than 5 and up to 12 characters) to unlock sales, revenue reports, complaints, compliments, kitchen stock, and new product publishing.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-stone-300">
                  Admin Password (6–12 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    maxLength={12}
                    placeholder="Enter Admin Password"
                    autoFocus
                    className="w-full tracking-wider font-mono text-base py-3.5 pl-4 pr-12 rounded-2xl bg-[#140D0C] border border-stone-700 text-amber-300 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 text-sm cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                
                {/* Character Counter */}
                <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
                  <span>Accepts alphabets, numerals, symbols</span>
                  <span className={`font-mono font-bold ${passwordInput.trim().length > 5 && passwordInput.trim().length <= 12 ? 'text-emerald-400' : 'text-stone-400'}`}>
                    {passwordInput.length} / 12 chars (min 6)
                  </span>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-bold flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-rose-400 shrink-0"></i>
                  <span>{passwordError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF4B72] hover:brightness-110 text-white font-black text-sm shadow-lg shadow-orange-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <i className="fa-solid fa-lock-open text-xs"></i>
                <span>Unlock Owner Portal</span>
              </button>

              {/* Demo Password Hint Box */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDemoHint(!showDemoHint)}
                  className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  {showDemoHint ? 'Hide Default Password Hint' : '🔑 Need Demo Password?'}
                </button>
                {showDemoHint && (
                  <div className="text-xs text-stone-300 mt-2 bg-[#140D0C] p-3 rounded-xl border border-stone-800 text-center space-y-1">
                    <p className="text-stone-400 text-[11px]">Default Owner Password:</p>
                    <p className="font-mono font-black text-amber-300 text-sm tracking-wider select-all">
                      FrostyPass12
                    </p>
                    <p className="text-[10px] text-stone-500">
                      (You can change this password anytime in the dashboard to any 6 to 12 character password)
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* 2. AUTHENTICATED OWNER DASHBOARD */
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            
            {/* CHANGE PASSWORD SUB-FORM (ASK PREVIOUS PASSWORD FIRST) */}
            {isChangingPassword && (
              <div className="shrink-0 p-4 sm:p-5 bg-[#140D0C] border-b border-amber-900/40 animate-slideDown overflow-y-auto max-h-[40vh]">
                <div className="max-w-xl mx-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-sm text-amber-200 flex items-center gap-2">
                      <i className="fa-solid fa-key text-amber-400"></i>
                      <span>Change Admin Password (6–12 Characters)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordChangeError('');
                        setPasswordChangeSuccess('');
                      }}
                      className="text-xs text-stone-400 hover:text-white cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>

                  <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Previous Password */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 mb-1">
                          1. Previous Password *
                        </label>
                        <input
                          type="password"
                          value={previousPassword}
                          onChange={(e) => setPreviousPassword(e.target.value)}
                          placeholder="Current password"
                          maxLength={12}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* New Password */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-stone-400">
                            2. New Password *
                          </label>
                          <span className={`text-[10px] font-mono ${newPassword.trim().length > 5 && newPassword.trim().length <= 12 ? 'text-emerald-400 font-bold' : 'text-stone-500'}`}>
                            {newPassword.length}/12 (min 6)
                          </span>
                        </div>
                        <input
                          type="text"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="6 to 12 characters"
                          maxLength={12}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 mb-1">
                          3. Confirm New Password *
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          maxLength={12}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {passwordChangeError && (
                      <p className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <span>{passwordChangeError}</span>
                      </p>
                    )}

                    {passwordChangeSuccess && (
                      <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>{passwordChangeSuccess}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-xs cursor-pointer shadow"
                      >
                        Verify Previous & Save New Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* HIGH-LEVEL SALES & REVENUE KPI CARDS (DAY + MONTH) - ALL CLICKABLE TO JUMP TO SECTIONS */}
            <div className="shrink-0 p-3 sm:p-4 bg-[#160E0D] border-b border-stone-800 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              
              {/* Today's Sales & Revenue Card */}
              <div 
                onClick={() => {
                  setActiveTab('sales');
                  setSalesTimeRange('today');
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                  activeTab === 'sales' && salesTimeRange === 'today'
                    ? 'bg-[#2a1b18] border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-[#241715] hover:bg-[#2c1d1a] border-amber-900/40 hover:border-amber-500/70'
                }`}
                title="Click to view Today's detailed sales breakdown"
              >
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 group-hover:text-amber-300">
                    <i className="fa-solid fa-sun text-xs text-amber-400"></i>
                    Today's Revenue
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded">
                    DAY
                  </span>
                </div>
                <div className="font-heading font-black text-lg sm:text-2xl text-amber-300">
                  Rs. {salesMetrics.todayRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5 flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-receipt text-[10px] text-amber-500"></i>
                    {salesMetrics.todaySalesCount} orders today
                  </span>
                  <span className="text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    View &rarr;
                  </span>
                </div>
              </div>

              {/* This Month's Sales & Revenue Card */}
              <div 
                onClick={() => {
                  setActiveTab('sales');
                  setSalesTimeRange('month');
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                  activeTab === 'sales' && salesTimeRange === 'month'
                    ? 'bg-[#182333] border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-[#241715] hover:bg-[#1a2333] border-blue-900/40 hover:border-blue-500/70'
                }`}
                title="Click to view This Month's detailed sales breakdown"
              >
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span className="font-bold text-blue-400 flex items-center gap-1.5 group-hover:text-blue-300">
                    <i className="fa-solid fa-calendar-days text-xs text-blue-400"></i>
                    This Month's Revenue
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black px-1.5 py-0.5 rounded">
                    MONTH
                  </span>
                </div>
                <div className="font-heading font-black text-lg sm:text-2xl text-blue-200">
                  Rs. {salesMetrics.monthRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5 flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-chart-line text-[10px] text-blue-400"></i>
                    {salesMetrics.monthSalesCount} orders this month
                  </span>
                  <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    View &rarr;
                  </span>
                </div>
              </div>

              {/* Compliments vs Complaints Ratio Card */}
              <div 
                onClick={() => setActiveTab('compliments')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                  activeTab === 'compliments' || activeTab === 'complaints'
                    ? 'bg-[#182620] border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-[#241715] hover:bg-[#1c2a23] border-emerald-900/40 hover:border-emerald-500/70'
                }`}
                title="Click to view Customer Praise and Feedback"
              >
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 group-hover:text-emerald-300">
                    <i className="fa-solid fa-heart text-xs text-emerald-400"></i>
                    Compliments
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('complaints');
                    }}
                    className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-900/50 cursor-pointer"
                    title="Jump to Complaints"
                  >
                    {complaints.length} Complaints
                  </button>
                </div>
                <div className="font-heading font-black text-lg sm:text-2xl text-emerald-300">
                  {complimentsList.length} Praise
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5 flex items-center justify-between font-semibold">
                  <span>{complaints.filter((c) => c.status === 'Resolved').length} complaints resolved</span>
                  <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    View &rarr;
                  </span>
                </div>
              </div>

              {/* Kitchen Physical Stock Card */}
              <div 
                onClick={() => setActiveTab('inventory')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                  activeTab === 'inventory'
                    ? 'bg-[#2b1c18] border-orange-500 shadow-md shadow-orange-500/10'
                    : 'bg-[#241715] hover:bg-[#2b1c18] border-orange-900/40 hover:border-orange-500/70'
                }`}
                title="Click to manage Kitchen Stock and Out-of-Stock items"
              >
                <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                  <span className="font-bold text-orange-400 flex items-center gap-1.5 group-hover:text-orange-300">
                    <i className="fa-solid fa-boxes-stacked text-xs text-orange-400"></i>
                    Kitchen Stock
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold">
                    {menuItems.length} Products
                  </span>
                </div>
                <div className="font-heading font-black text-lg sm:text-2xl text-orange-300">
                  {menuItems.filter((i) => (inventory[i.id] ?? 15) <= 0).length} Out of Stock
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5 flex items-center justify-between font-semibold">
                  <span>{menuItems.filter((i) => (inventory[i.id] ?? 15) > 0 && (inventory[i.id] ?? 15) <= 5).length} items running low</span>
                  <span className="text-[10px] text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Manage &rarr;
                  </span>
                </div>
              </div>

            </div>

            {/* ADMIN NAVIGATION TABS - NEVER COLLAPSES, ALWAYS VISIBLE & INTERACTIVE */}
            <div className="shrink-0 min-h-[58px] border-b border-stone-800 bg-[#140D0C] px-3 sm:px-6 overflow-x-auto no-scrollbar flex items-center gap-2 py-2.5 z-20">
              
              {/* Tab: Sales & Revenue */}
              <button
                type="button"
                onClick={() => setActiveTab('sales')}
                className={`shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  activeTab === 'sales'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-amber-500/20 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <i className="fa-solid fa-chart-pie text-sm"></i>
                <span>Day + Month Sales</span>
              </button>

              {/* Tab: Kitchen Stock */}
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  activeTab === 'inventory'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-stone-950 shadow-orange-500/20 shadow-md ring-2 ring-orange-400/50'
                    : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <i className="fa-solid fa-warehouse text-sm"></i>
                <span>Kitchen Stock</span>
                {menuItems.filter((i) => (inventory[i.id] ?? 15) <= 0).length > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === 'inventory' ? 'bg-stone-950 text-orange-400' : 'bg-rose-500 text-white'
                  }`}>
                    {menuItems.filter((i) => (inventory[i.id] ?? 15) <= 0).length} Out
                  </span>
                )}
              </button>

              {/* Tab: Add New Product Interface */}
              <button
                type="button"
                onClick={() => setActiveTab('add-product')}
                className={`shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  activeTab === 'add-product'
                    ? 'bg-gradient-to-r from-[#FF4B72] to-rose-600 text-white shadow-pink-500/20 shadow-md ring-2 ring-pink-400/50'
                    : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <i className="fa-solid fa-plus-circle text-sm"></i>
                <span>Add New Product</span>
              </button>

              {/* Tab: Compliments */}
              <button
                type="button"
                onClick={() => setActiveTab('compliments')}
                className={`shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  activeTab === 'compliments'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-stone-950 shadow-emerald-500/20 shadow-md ring-2 ring-emerald-400/50'
                    : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <i className="fa-solid fa-heart text-sm"></i>
                <span>Compliments ({complimentsList.length})</span>
              </button>

              {/* Tab: Complaints */}
              <button
                type="button"
                onClick={() => setActiveTab('complaints')}
                className={`shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  activeTab === 'complaints'
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/20 shadow-md ring-2 ring-rose-400/50'
                    : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <i className="fa-solid fa-triangle-exclamation text-sm"></i>
                <span>Complaints ({complaints.length})</span>
                {complaints.filter((c) => c.status === 'Pending').length > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    activeTab === 'complaints' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white animate-pulse'
                  }`}>
                    {complaints.filter((c) => c.status === 'Pending').length}
                  </span>
                )}
              </button>

              {/* Tab: Full Order Log */}
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`shrink-0 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/20 shadow-md ring-2 ring-blue-400/50'
                    : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <i className="fa-solid fa-clock-rotate-left text-sm"></i>
                <span>All Orders ({orders.length})</span>
              </button>

            </div>

            {/* TAB CONTENTS CONTAINER */}
            <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto">
              
              {/* TAB 1: SALES & REVENUE (DAY + MONTH DETAILED BREAKDOWN) */}
              {activeTab === 'sales' && (
                <div className="space-y-6 animate-panel-enter">
                  
                  {/* Filter Sub-Bar for Day vs Month */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#140D0C] p-4 rounded-2xl border border-stone-800">
                    <div>
                      <h3 className="font-heading font-black text-lg text-amber-100 flex items-center gap-2">
                        <i className="fa-solid fa-money-bill-trend-up text-amber-400"></i>
                        <span>Sales & Revenue Tracker</span>
                      </h3>
                      <p className="text-xs text-stone-400">
                        Select a timeframe to inspect detailed order revenue and physical kitchen sales.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-700">
                      <button
                        onClick={() => setSalesTimeRange('today')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          salesTimeRange === 'today'
                            ? 'bg-amber-500 text-stone-950 shadow-sm'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Today ({salesMetrics.todayOrders.length})
                      </button>
                      <button
                        onClick={() => setSalesTimeRange('month')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          salesTimeRange === 'month'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        This Month ({salesMetrics.monthOrders.length})
                      </button>
                      <button
                        onClick={() => setSalesTimeRange('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          salesTimeRange === 'all'
                            ? 'bg-stone-700 text-white shadow-sm'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        All Time ({orders.length})
                      </button>
                    </div>
                  </div>

                  {/* Orders List for selected Time Range */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-stone-300 flex items-center gap-2">
                        <span>
                          {salesTimeRange === 'today'
                            ? "Today's Orders & Transactions"
                            : salesTimeRange === 'month'
                            ? "This Month's Orders & Transactions"
                            : 'All Order History Records'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                          {salesTimeRange === 'today'
                            ? salesMetrics.todayOrders.length
                            : salesTimeRange === 'month'
                            ? salesMetrics.monthOrders.length
                            : orders.length} orders
                        </span>
                      </h4>

                      <div className="text-xs text-amber-300 font-bold">
                        Period Revenue: Rs.{' '}
                        {salesTimeRange === 'today'
                          ? salesMetrics.todayRevenue.toLocaleString()
                          : salesTimeRange === 'month'
                          ? salesMetrics.monthRevenue.toLocaleString()
                          : salesMetrics.totalRevenue.toLocaleString()}
                      </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-[#140D0C] rounded-2xl border border-stone-800 overflow-hidden shadow">
                      {(salesTimeRange === 'today'
                        ? salesMetrics.todayOrders
                        : salesTimeRange === 'month'
                        ? salesMetrics.monthOrders
                        : orders
                      ).length === 0 ? (
                        <div className="p-8 text-center text-stone-500 text-xs">
                          No orders logged in this timeframe.
                        </div>
                      ) : (
                        <div className="divide-y divide-stone-800">
                          {(salesTimeRange === 'today'
                            ? salesMetrics.todayOrders
                            : salesTimeRange === 'month'
                            ? salesMetrics.monthOrders
                            : orders
                          ).map((order) => (
                            <div
                              key={order.id}
                              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-stone-900/40 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-black text-xs text-amber-400">
                                    #{order.id}
                                  </span>
                                  <span className="text-xs font-bold text-stone-200">
                                    {order.customerName}
                                  </span>
                                  <span className="text-[11px] text-stone-400">
                                    ({order.customerPhone})
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 uppercase">
                                    {order.orderType}
                                  </span>
                                </div>
                                <div className="text-xs text-stone-400">
                                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                                </div>
                                <div className="text-[10px] text-stone-500">
                                  <i className="fa-solid fa-clock text-[9px] mr-1"></i>
                                  {order.timestamp}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                <div className="text-right">
                                  <div className="font-heading font-black text-base text-amber-300">
                                    Rs. {order.totalAmount}
                                  </div>
                                </div>

                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    onUpdateOrderStatus(order.id, e.target.value as OrderRecord['status'])
                                  }
                                  className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                                    order.status === 'Completed'
                                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                      : order.status === 'Cancelled'
                                      ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                                      : 'bg-amber-950/60 text-amber-300 border-amber-800'
                                  }`}
                                >
                                  <option value="Received (WhatsApp)">Received</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Preparing">Preparing</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PHYSICAL KITCHEN STOCK & OUT OF STOCK MANAGEMENT */}
              {activeTab === 'inventory' && (
                <div className="space-y-5 animate-panel-enter">
                  
                  {/* Controls Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#140D0C] p-4 rounded-2xl border border-stone-800">
                    <div>
                      <h3 className="font-heading font-black text-lg text-orange-100 flex items-center gap-2">
                        <i className="fa-solid fa-boxes-packing text-orange-400"></i>
                        <span>Physical Kitchen Inventory Control</span>
                      </h3>
                      <p className="text-xs text-stone-400">
                        Mark items Out of Stock with 1-click when finished in kitchen, restock, or edit options & details.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Direct Tab & Option Switchers */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('add-product')}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#FF4B72] to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                        title="Add a new product to catalog"
                      >
                        <i className="fa-solid fa-plus-circle"></i>
                        <span>Add New Product</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('sales')}
                        className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        title="View Day + Month Sales"
                      >
                        <i className="fa-solid fa-chart-pie"></i>
                        <span>Sales</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        title="View Orders Log"
                      >
                        <i className="fa-solid fa-clock-rotate-left"></i>
                        <span>Orders</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRestockAllItems}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-arrows-rotate"></i>
                        <span>Restock All to 15</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Reset catalog back to initial default items?')) {
                            onResetMenu();
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer border border-stone-700"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="Search product by name..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#140D0C] border border-stone-700 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-orange-500"
                      />
                      <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"></i>
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'out', label: 'Out of Stock' },
                        { id: 'low', label: 'Low Stock (<=5)' },
                        { id: 'grill', label: "Grill Only" },
                        { id: 'ice-cream', label: "Ice Cream Only" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setInventoryFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                            inventoryFilter === tab.id
                              ? 'bg-orange-600 text-white'
                              : 'bg-stone-800 text-stone-400 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inventory Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredInventoryItems.map((item) => {
                      const stock = inventory[item.id] ?? 15;
                      const isOutOfStock = stock <= 0;
                      const isLowStock = stock > 0 && stock <= 5;
                      const isGrill = item.category === 'fast-food-bbq';

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isOutOfStock
                              ? 'bg-rose-950/20 border-rose-900/60'
                              : isLowStock
                              ? 'bg-amber-950/20 border-amber-900/60'
                              : 'bg-[#140D0C] border-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 ${
                                isOutOfStock ? 'grayscale opacity-60' : ''
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-heading font-black text-sm text-stone-100 truncate">
                                  {item.name}
                                </h4>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                    isGrill
                                      ? 'bg-orange-500/20 text-orange-300'
                                      : 'bg-pink-500/20 text-[#FF4B72]'
                                  }`}
                                >
                                  {isGrill ? 'Grill' : 'Ice Cream'}
                                </span>
                              </div>
                              <div className="text-xs text-amber-300 font-bold mt-0.5">
                                Rs. {item.price}
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    isOutOfStock
                                      ? 'bg-rose-600 text-white animate-pulse'
                                      : isLowStock
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-emerald-500/20 text-emerald-300'
                                  }`}
                                >
                                  {isOutOfStock
                                    ? 'OUT OF STOCK'
                                    : `${stock} Units in Kitchen`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stock Controls & Out of Stock Toggles */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {/* Fast Out-of-Stock Toggle */}
                            {isOutOfStock ? (
                              <button
                                onClick={() => onUpdateStock(item.id, 15)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow cursor-pointer flex items-center gap-1"
                                title="Set stock to 15"
                              >
                                <i className="fa-solid fa-circle-check text-xs"></i>
                                <span>Add Back In Stock</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onUpdateStock(item.id, 0)}
                                className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-black text-xs cursor-pointer flex items-center gap-1"
                                title="Instantly mark 0 stock in kitchen"
                              >
                                <i className="fa-solid fa-ban text-xs text-rose-400"></i>
                                <span>Mark Out of Stock</span>
                              </button>
                            )}

                            {/* Stepper +/- */}
                            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
                              <button
                                onClick={() => onUpdateStock(item.id, Math.max(0, stock - 1))}
                                className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center justify-center font-bold cursor-pointer"
                                title="Decrease 1 unit"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-mono font-bold text-amber-200">
                                {stock}
                              </span>
                              <button
                                onClick={() => onUpdateStock(item.id, stock + 1)}
                                className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center justify-center font-bold cursor-pointer"
                                title="Increase 1 unit"
                              >
                                +
                              </button>
                            </div>

                            {/* Actions: Edit Options & Remove */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditItem(item)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Change price, discount, name, badge or stock details"
                              >
                                <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                                <span>Edit Options</span>
                              </button>

                              {onDeleteProduct && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to permanently remove "${item.name}" from the menu catalog?`)) {
                                      onDeleteProduct(item.id);
                                    }
                                  }}
                                  className="text-[11px] text-stone-500 hover:text-rose-400 underline font-medium cursor-pointer"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* EDIT ITEM OPTIONS MODAL DIALOG */}
                  {editingItem && (
                    <div className="fixed inset-0 z-[60] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
                      <div className="bg-[#1C1413] border border-amber-500/40 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                              <i className="fa-solid fa-pen-to-square text-sm"></i>
                            </div>
                            <div>
                              <h4 className="font-heading font-black text-base text-amber-100">
                                Edit Product Options
                              </h4>
                              <p className="text-[11px] text-stone-400">
                                Update price, stock, name, and details for "{editingItem.name}"
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingItem(null)}
                            className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center text-xs cursor-pointer"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>

                        <form onSubmit={handleSaveItemEdit} className="space-y-3.5">
                          {/* Name */}
                          <div>
                            <label className="block text-xs font-bold text-stone-300 mb-1">
                              Product Name *
                            </label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              required
                              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Price & Original Price */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-stone-300 mb-1">
                                Selling Price (PKR Rs.) *
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                required
                                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-stone-300 mb-1">
                                Original Price (Discount)
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={editOriginalPrice}
                                onChange={(e) => setEditOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="e.g. 550"
                                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Stock Units & Badge */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-stone-300 mb-1">
                                Kitchen Stock Units *
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={editStockUnits}
                                onChange={(e) => setEditStockUnits(Math.max(0, Number(e.target.value)))}
                                required
                                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-stone-300 mb-1">
                                Badge / Highlight
                              </label>
                              <input
                                type="text"
                                value={editBadge}
                                onChange={(e) => setEditBadge(e.target.value)}
                                placeholder="e.g. Chef's Pick"
                                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-xs font-bold text-stone-300 mb-1">
                              Description & Ingredients
                            </label>
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-none"
                            ></textarea>
                          </div>

                          {editSuccessMsg && (
                            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <i className="fa-solid fa-circle-check"></i>
                              <span>{editSuccessMsg}</span>
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                            <button
                              type="button"
                              onClick={() => setEditingItem(null)}
                              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-xs cursor-pointer shadow"
                            >
                              Save Product Options
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DEDICATED "ADD NEW PRODUCT" INTERFACE */}
              {activeTab === 'add-product' && (
                <div className="space-y-6 max-w-4xl mx-auto animate-panel-enter">
                  
                  <div className="bg-[#140D0C] p-5 rounded-3xl border border-stone-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF4B72] to-amber-500 flex items-center justify-center text-white">
                        <i className="fa-solid fa-circle-plus text-base"></i>
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-amber-100">
                          Create & Publish New Product
                        </h3>
                        <p className="text-xs text-stone-400">
                          Provide picture, product name, category, and price to make it instantly live on the menu.
                        </p>
                      </div>
                    </div>

                    {addProductSuccessMsg && (
                      <div className="p-4 my-3 rounded-2xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-xs font-bold flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-emerald-400 text-base"></i>
                        <span>{addProductSuccessMsg}</span>
                      </div>
                    )}

                    {addProductErrorMsg && (
                      <div className="p-4 my-3 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-bold flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-rose-400 text-base"></i>
                        <span>{addProductErrorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleAddNewProductSubmit} className="space-y-6 pt-3">
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* LEFT COLUMN: 1. PICTURE INPUT */}
                        <div className="lg:col-span-5 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-amber-200 mb-1.5 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-black flex items-center justify-center">1</span>
                              <span>Product Picture *</span>
                            </label>
                            
                            {/* Live Image Preview Box */}
                            <div className="relative h-48 w-full rounded-2xl overflow-hidden border-2 border-dashed border-stone-700 bg-stone-950 flex items-center justify-center group">
                              {newProdPicture ? (
                                <>
                                  <img
                                    src={newProdPicture}
                                    alt="Preview"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => fileInputRef.current?.click()}
                                      className="px-3 py-1.5 rounded-xl bg-white text-stone-900 text-xs font-bold shadow"
                                    >
                                      Change Photo
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center p-4 text-stone-500">
                                  <i className="fa-solid fa-image text-3xl mb-1 text-stone-600"></i>
                                  <p className="text-xs">No image selected</p>
                                </div>
                              )}
                            </div>

                            {/* File Upload Button & URL input */}
                            <div className="space-y-2 mt-2.5">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-stone-700"
                              >
                                <i className="fa-solid fa-cloud-arrow-up text-amber-400"></i>
                                <span>Upload Image from Device / Camera</span>
                              </button>

                              <div className="relative">
                                <input
                                  type="url"
                                  value={newProdPicture}
                                  onChange={(e) => setNewProdPicture(e.target.value)}
                                  placeholder="Or paste image URL (https://...)"
                                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Quick Preset Library */}
                          <div>
                            <span className="text-[11px] font-bold text-stone-400 block mb-1.5">
                              Or pick from quick preset photography:
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                              {PRESET_PICTURES.map((preset, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setNewProdPicture(preset.url);
                                    setNewProdCategory(preset.category as any);
                                  }}
                                  className={`p-1 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer truncate ${
                                    newProdPicture === preset.url
                                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                                      : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-white'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: 2. NAME, 3. CATEGORY, 4. PRICE */}
                        <div className="lg:col-span-7 space-y-4">
                          
                          {/* 2. PRODUCT NAME */}
                          <div>
                            <label className="block text-xs font-bold text-amber-200 mb-1.5 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-black flex items-center justify-center">2</span>
                              <span>Product Name *</span>
                            </label>
                            <input
                              type="text"
                              value={newProdName}
                              onChange={(e) => setNewProdName(e.target.value)}
                              placeholder="e.g. Crispy Zinger Club Burger, Belgian Lotus Waffle Cone..."
                              required
                              className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm font-bold text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* 3. CATEGORY */}
                          <div>
                            <label className="block text-xs font-bold text-amber-200 mb-1.5 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-black flex items-center justify-center">3</span>
                              <span>Product Category *</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { id: 'fast-food-bbq', label: "Grill & BBQ", icon: 'fa-fire' },
                                { id: 'scoops', label: 'Scoops & Cones', icon: 'fa-ice-cream' },
                                { id: 'sundaes', label: 'Sundaes', icon: 'fa-bowl-food' },
                                { id: 'shakes', label: 'Shakes', icon: 'fa-glass-water' },
                                { id: 'kulfi', label: 'Shahi Kulfi', icon: 'fa-snowflake' },
                                { id: 'coffees', label: 'Cold Coffee', icon: 'fa-mug-hot' },
                                { id: 'sodas', label: 'Soda Chillers', icon: 'fa-spray-can-sparkles' },
                                { id: 'deals', label: 'Special Deals', icon: 'fa-tag' },
                              ].map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setNewProdCategory(cat.id as any)}
                                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                                    newProdCategory === cat.id
                                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-sm'
                                      : 'border-stone-800 bg-stone-900/80 text-stone-400 hover:text-white'
                                  }`}
                                >
                                  <i className={`fa-solid ${cat.icon} text-xs text-amber-400`}></i>
                                  <span className="truncate">{cat.label}</span>
                                </button>
                              ))}
                            </div>

                            {/* Sub-tag for Grill category */}
                            {newProdCategory === 'fast-food-bbq' && (
                              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] text-stone-400 font-bold">Grill Tag:</span>
                                {['Burger', 'Sandwich', 'Wrap', 'Tacos', 'BBQ', 'Fries', 'Chai', 'Combo'].map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setNewProdTag(t)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                      newProdTag === t
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-stone-800 text-stone-400 hover:text-white'
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 4. PRICE & OPTIONAL ORIGINAL PRICE */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-amber-200 mb-1.5 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[11px] font-black flex items-center justify-center">4</span>
                                <span>Selling Price (PKR / Rs.) *</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  value={newProdPrice}
                                  onChange={(e) => setNewProdPrice(e.target.value ? Number(e.target.value) : '')}
                                  placeholder="e.g. 750"
                                  required
                                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm font-black text-amber-300 focus:outline-none focus:border-amber-500"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs font-bold">
                                  Rs.
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-stone-400 mb-1.5">
                                Original Price (Optional Strikethrough)
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  value={newProdOriginalPrice}
                                  onChange={(e) => setNewProdOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                                  placeholder="e.g. 900"
                                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm font-bold text-stone-400 focus:outline-none focus:border-amber-500"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs font-bold">
                                  Rs.
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Complementary Details: Description & Initial Stock */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-stone-400 mb-1">
                                Short Description
                              </label>
                              <input
                                type="text"
                                value={newProdDescription}
                                onChange={(e) => setNewProdDescription(e.target.value)}
                                placeholder="Ingredients, taste profile, freshly grilled or scooped..."
                                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-400 mb-1">
                                Initial Stock (Units)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={newProdInitialStock}
                                onChange={(e) => setNewProdInitialStock(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Complementary Details: Badge & Serving Unit */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-stone-400 mb-1">
                                Promotional Badge (Optional)
                              </label>
                              <input
                                type="text"
                                value={newProdBadge}
                                onChange={(e) => setNewProdBadge(e.target.value)}
                                placeholder="e.g. Chef's Special, Flame-Grilled, New"
                                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-stone-400 mb-1">
                                Serving Unit (Optional)
                              </label>
                              <input
                                type="text"
                                value={newProdUnit}
                                onChange={(e) => setNewProdUnit(e.target.value)}
                                placeholder="e.g. Single Cone, Full Platter, 500ml"
                                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Submit Action Button */}
                          <div className="pt-2">
                            <button
                              type="submit"
                              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF4B72] hover:brightness-110 text-white font-black text-sm shadow-lg shadow-orange-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                            >
                              <i className="fa-solid fa-check text-xs"></i>
                              <span>Publish New Product to Live Menu</span>
                            </button>
                          </div>

                        </div>

                      </div>

                    </form>
                  </div>

                </div>
              )}

              {/* TAB 4: COMPLIMENTS & PRAISE */}
              {activeTab === 'compliments' && (
                <div className="space-y-4 animate-panel-enter">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#140D0C] p-4 rounded-2xl border border-stone-800">
                    <div>
                      <h3 className="font-heading font-black text-lg text-emerald-100 flex items-center gap-2">
                        <i className="fa-solid fa-heart text-emerald-400"></i>
                        <span>Customer Compliments & 5-Star Praises</span>
                      </h3>
                      <p className="text-xs text-stone-400">
                        Real positive feedback, reviews, and favorite dishes shared by satisfied customers.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 font-black border border-emerald-800">
                        {complimentsList.length} Positive Compliments
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {complimentsList.length === 0 ? (
                      <div className="p-8 text-center text-stone-500 text-xs col-span-2">
                        No compliments recorded yet.
                      </div>
                    ) : (
                      complimentsList.map((review) => (
                        <div
                          key={review.id}
                          className="bg-[#140D0C] p-4 rounded-2xl border border-stone-800/80 space-y-2.5 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-heading font-black text-sm text-stone-100">
                                {review.name}
                              </h4>
                              <div className="text-[11px] text-stone-500">
                                {review.date}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                              {[...Array(review.rating)].map((_, i) => (
                                <i key={i} className="fa-solid fa-star text-[11px]"></i>
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-stone-300 leading-relaxed italic">
                            "{review.comment}"
                          </p>

                          {review.favItem && (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold pt-1 border-t border-stone-900">
                              <i className="fa-solid fa-utensils text-[10px]"></i>
                              <span>Favorite: {review.favItem}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: COMPLAINTS REGISTER & RESOLUTION */}
              {activeTab === 'complaints' && (
                <div className="space-y-4 animate-panel-enter">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#140D0C] p-4 rounded-2xl border border-stone-800">
                    <div>
                      <h3 className="font-heading font-black text-lg text-rose-100 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-rose-400"></i>
                        <span>Customer Complaints Register</span>
                      </h3>
                      <p className="text-xs text-stone-400">
                        Review customer issues, update ticket status, and record official resolutions.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-3 py-1.5 rounded-xl bg-rose-950/60 text-rose-300 font-black border border-rose-800">
                        {complaints.filter((c) => c.status === 'Pending').length} Pending Action
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {complaints.length === 0 ? (
                      <div className="p-8 text-center text-stone-500 text-xs bg-[#140D0C] rounded-2xl border border-stone-800">
                        No customer complaints filed. All customers are satisfied!
                      </div>
                    ) : (
                      complaints.map((complaint) => (
                        <div
                          key={complaint.id}
                          className="bg-[#140D0C] p-4 rounded-2xl border border-stone-800 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-xs text-rose-400">
                                Ticket #{complaint.ticketNumber}
                              </span>
                              <span className="text-xs font-bold text-stone-100">
                                {complaint.customerName}
                              </span>
                              <span className="text-[11px] text-stone-400">
                                ({complaint.customerPhone})
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-900/60">
                                {complaint.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={complaint.status}
                                onChange={(e) => {
                                  if (onUpdateComplaintStatus) {
                                    onUpdateComplaintStatus(
                                      complaint.id,
                                      e.target.value as Complaint['status'],
                                      complaint.resolutionNotes
                                    );
                                  }
                                }}
                                className={`text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none ${
                                  complaint.status === 'Resolved'
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                    : complaint.status === 'In Progress'
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                    : 'bg-rose-950/60 text-rose-300 border-rose-800'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-stone-950/60 text-xs text-stone-300 border border-stone-800/80 leading-relaxed">
                            {complaint.description}
                          </div>

                          {/* Resolution Notes */}
                          <div className="flex items-center justify-between gap-3 text-xs pt-1">
                            <span className="text-[10px] text-stone-500">
                              Filed on: {complaint.timestamp}
                            </span>
                            {complaint.resolutionNotes && (
                              <span className="text-[11px] text-emerald-400 font-semibold">
                                Resolution: {complaint.resolutionNotes}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: ALL ORDERS LOG */}
              {activeTab === 'orders' && (
                <div className="space-y-4 animate-panel-enter">
                  <div className="flex items-center justify-between bg-[#140D0C] p-4 rounded-2xl border border-stone-800">
                    <div>
                      <h3 className="font-heading font-black text-lg text-stone-100">
                        Complete Order History
                      </h3>
                      <p className="text-xs text-stone-400">
                        Total {orders.length} orders recorded.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#140D0C] rounded-2xl border border-stone-800 divide-y divide-stone-800 overflow-hidden">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-xs text-amber-400">
                              #{order.id}
                            </span>
                            <span className="text-xs font-bold text-stone-100">
                              {order.customerName}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              ({order.customerPhone})
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 uppercase">
                              {order.orderType}
                            </span>
                          </div>
                          <div className="text-xs text-stone-400">
                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {order.timestamp}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="font-heading font-black text-base text-amber-300">
                            Rs. {order.totalAmount}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              onUpdateOrderStatus(order.id, e.target.value as OrderRecord['status'])
                            }
                            className="text-xs font-bold px-2.5 py-1 rounded-xl bg-stone-900 text-stone-200 border border-stone-700 cursor-pointer"
                          >
                            <option value="Received (WhatsApp)">Received</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
