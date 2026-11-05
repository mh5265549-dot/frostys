import React, { useState, useMemo, useEffect } from 'react';
import { MenuItem, OrderRecord, Complaint } from '../../types';
import {
  checkAdminPassword,
  saveAdminPassword,
} from '../../utils/menuStore';
import {
  getStoreOperationalSettings,
  saveStoreOperationalSettings,
} from '../../utils/operationalStore';
import {
  saveItemIngredientCost,
  DEFAULT_RECIPE_COSTS,
} from '../../utils/costAndFinance';
import {
  grillFishImg,
  parathaRollsImg,
  soupImg,
  greenTeaImg,
  waffleConeFreshImg,
  superCupImg,
  sundaeCupsImg,
  oreoShakeImg,
  grilledChickenBurgerImg,
  grilledChickenWrapImg,
  friesSupremeImg,
  karakChaiImg,
  greekGyroImg,
  kashmiriPinkChaiImg,
} from '../../data/menuData';
import { RealTimeOrderDispatchHub } from './RealTimeOrderDispatchHub';
import { RecipeCostManager } from './RecipeCostManager';
import { DeliveryZonesSettings } from './DeliveryZonesSettings';

interface ExecutiveConsoleProps {
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
  complaints?: Complaint[];
  onUpdateComplaintStatus?: (
    complaintId: string,
    status: Complaint['status'],
    resolutionNotes?: string
  ) => void;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  picture: string;
  contactNumber: string;
  emergencyContact: string;
  emergencyRelation?: string;
  arrivalTime: string;
  arrivalDate?: string;
  status: 'On Duty' | 'Checked In' | 'Off Duty';
}

const DEFAULT_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Tariq Mehmood',
    role: 'Head Charcoal Grill Master',
    picture: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    contactNumber: '0300 4821950',
    emergencyContact: '0321 9876543 (Brother - Aslam)',
    emergencyRelation: 'Brother',
    arrivalTime: '09:30 AM PKT',
    arrivalDate: 'Today',
    status: 'On Duty',
  },
  {
    id: 'staff-2',
    name: 'Muhammad Ali',
    role: 'Ice Cream & Dessert Artisan',
    picture: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80',
    contactNumber: '0321 5567890',
    emergencyContact: '0302 4433221 (Father - Ghulam)',
    emergencyRelation: 'Father',
    arrivalTime: '09:45 AM PKT',
    arrivalDate: 'Today',
    status: 'On Duty',
  },
  {
    id: 'staff-3',
    name: 'Usman Javed',
    role: 'Dispatch Lead & Courier Rider',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    contactNumber: '0333 8765432',
    emergencyContact: '0312 9988776 (Uncle - Rafiq)',
    emergencyRelation: 'Uncle',
    arrivalTime: '10:00 AM PKT',
    arrivalDate: 'Today',
    status: 'On Duty',
  },
  {
    id: 'staff-4',
    name: 'Zainab Bibi',
    role: 'Cashier & Front Desk Host',
    picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    contactNumber: '0304 1122334',
    emergencyContact: '0300 7766554 (Mother - Parveen)',
    emergencyRelation: 'Mother',
    arrivalTime: '09:15 AM PKT',
    arrivalDate: 'Today',
    status: 'On Duty',
  },
];

// Hourly PKT sales curve data points matching the screenshot
interface HourlyDataPoint {
  timeLabel: string;
  hour: number;
  revenue: number;
  ordersCount: number;
}

const TODAY_HOURLY_DATA: HourlyDataPoint[] = [
  { timeLabel: '10 AM', hour: 10, revenue: 13200, ordersCount: 8 },
  { timeLabel: '12 PM', hour: 12, revenue: 18400, ordersCount: 11 },
  { timeLabel: '2 PM', hour: 14, revenue: 14100, ordersCount: 9 },
  { timeLabel: '4 PM', hour: 16, revenue: 22600, ordersCount: 14 },
  { timeLabel: '6 PM', hour: 18, revenue: 34800, ordersCount: 21 },
  { timeLabel: '8 PM', hour: 20, revenue: 28900, ordersCount: 17 },
  { timeLabel: '10 PM', hour: 22, revenue: 48500, ordersCount: 29 }, // Peak rush!
  { timeLabel: '12 AM', hour: 0, revenue: 38200, ordersCount: 23 },
  { timeLabel: '1 AM', hour: 1, revenue: 19100, ordersCount: 12 },
];

const YESTERDAY_HOURLY_DATA: HourlyDataPoint[] = [
  { timeLabel: '10 AM', hour: 10, revenue: 11200, ordersCount: 7 },
  { timeLabel: '12 PM', hour: 12, revenue: 16400, ordersCount: 10 },
  { timeLabel: '2 PM', hour: 14, revenue: 13100, ordersCount: 8 },
  { timeLabel: '4 PM', hour: 16, revenue: 19600, ordersCount: 12 },
  { timeLabel: '6 PM', hour: 18, revenue: 31800, ordersCount: 19 },
  { timeLabel: '8 PM', hour: 20, revenue: 26900, ordersCount: 16 },
  { timeLabel: '10 PM', hour: 22, revenue: 42500, ordersCount: 26 },
  { timeLabel: '12 AM', hour: 0, revenue: 33200, ordersCount: 20 },
  { timeLabel: '1 AM', hour: 1, revenue: 15100, ordersCount: 9 },
];

const SEVEN_DAYS_HOURLY_DATA: HourlyDataPoint[] = [
  { timeLabel: '10 AM', hour: 10, revenue: 84200, ordersCount: 52 },
  { timeLabel: '12 PM', hour: 12, revenue: 124400, ordersCount: 78 },
  { timeLabel: '2 PM', hour: 14, revenue: 98100, ordersCount: 61 },
  { timeLabel: '4 PM', hour: 16, revenue: 154600, ordersCount: 96 },
  { timeLabel: '6 PM', hour: 18, revenue: 238800, ordersCount: 148 },
  { timeLabel: '8 PM', hour: 20, revenue: 201900, ordersCount: 125 },
  { timeLabel: '10 PM', hour: 22, revenue: 335500, ordersCount: 208 },
  { timeLabel: '12 AM', hour: 0, revenue: 262200, ordersCount: 163 },
  { timeLabel: '1 AM', hour: 1, revenue: 131100, ordersCount: 82 },
];

export const ExecutiveConsole: React.FC<ExecutiveConsoleProps> = ({
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
  complaints = [],
  onUpdateComplaintStatus,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showDemoHint, setShowDemoHint] = useState(false);

  // Active Tab: matching screenshot's left navigation + Add Product tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'menu' | 'add-product' | 'finance' | 'users' | 'security' | 'system'
  >('overview');

  // Add Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<string>('');
  const [newProductCost, setNewProductCost] = useState<string>('');
  const [newProductPicture, setNewProductPicture] = useState(grillFishImg);
  const [newProductCustomUrl, setNewProductCustomUrl] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'fast-food' | 'grill' | 'drinks' | 'ice-cream' | 'green-teas'>('grill');
  const [newProductUnit, setNewProductUnit] = useState('Per Piece');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductStock, setNewProductStock] = useState<number>(25);
  const [newProductBadge, setNewProductBadge] = useState('');
  const [productAddedSuccess, setProductAddedSuccess] = useState<string | null>(null);

  const [catalogSubMode, setCatalogSubMode] = useState<'add' | 'edit'>('add');
  const [selectedEditItemId, setSelectedEditItemId] = useState<string | null>(null);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');

  // Staff Attendance & Directory State
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      const stored = localStorage.getItem('frostys_staff_roster_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_STAFF_MEMBERS;
  });
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Kitchen / Service Specialist');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmergency, setNewStaffEmergency] = useState('');
  const [newStaffArrivalTime, setNewStaffArrivalTime] = useState('');
  const [newStaffPicture, setNewStaffPicture] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80');

  const saveStaffList = (updated: StaffMember[]) => {
    setStaffList(updated);
    try {
      localStorage.setItem('frostys_staff_roster_v2', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save staff roster:', e);
    }
  };

  const PRESET_PICTURES = [
    { label: 'Grill Fish (Kala Rahu)', img: grillFishImg },
    { label: 'Chicken Paratha Roll', img: parathaRollsImg },
    { label: '19B / Hot Sour Soup', img: soupImg },
    { label: 'Peshawari Green Tea', img: greenTeaImg },
    { label: 'Crispy Waffle Cone', img: waffleConeFreshImg },
    { label: 'Frosty Super Cup', img: superCupImg },
    { label: 'Sundae Cups / Split', img: sundaeCupsImg },
    { label: 'Thick Oreo Shake', img: oreoShakeImg },
    { label: 'Grilled Chicken Burger', img: grilledChickenBurgerImg },
    { label: 'Grilled Chicken Wrap', img: grilledChickenWrapImg },
    { label: 'Fries Supreme', img: friesSupremeImg },
    { label: 'Greek Gyro', img: greekGyroImg },
    { label: 'Hot Karak Chai', img: karakChaiImg },
    { label: 'Kashmiri Pink Chai', img: kashmiriPinkChaiImg },
  ];

  // Time Range Filter: Today | Yesterday | 7 Days
  const [timeRange, setTimeRange] = useState<'today' | 'yesterday' | '7days'>('today');

  // Role: Super Admin vs Kitchen Staff
  const [role, setRole] = useState<'admin' | 'staff'>(() => {
    return getStoreOperationalSettings().roleView || 'admin';
  });

  // Global search input in top header
  const [searchQuery, setSearchQuery] = useState('');

  // Hovered data point on sales curve for interactive tooltip
  const [hoveredPoint, setHoveredPoint] = useState<HourlyDataPoint | null>(null);

  // Live PKT Time Display
  const [currentTimePKT, setCurrentTimePKT] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: 'Asia/Karachi',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        };
        setCurrentTimePKT(new Intl.DateTimeFormat([], options).format(now));
      } catch {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        setCurrentTimePKT(`${hrs}:${mins}`);
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Password change state in User Hub
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // In-app alert for reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Live order counts
  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  }, [orders]);

  // Handle password login
  const handleLogin = (
    e?: React.FormEvent,
    targetTab: 'overview' | 'orders' | 'menu' | 'add-product' | 'finance' | 'users' | 'security' | 'system' = 'overview'
  ) => {
    if (e) e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Please enter the password (Default: 1234567)');
      return;
    }
    if (checkAdminPassword(passwordInput.trim())) {
      setIsAuthenticated(true);
      setActiveTab(targetTab);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Invalid password. (Default is 1234567)');
    }
  };

  const handleRoleChange = (newRole: 'admin' | 'staff') => {
    setRole(newRole);
    saveStoreOperationalSettings({ roleView: newRole });
    if (newRole === 'staff') {
      setActiveTab('orders');
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAdminPassword(oldPassword)) {
      setPassMessage({ text: 'Current password does not match.', type: 'error' });
      return;
    }
    if (newPassword.trim().length < 6 || newPassword.trim().length > 12) {
      setPassMessage({ text: 'New password must be between 6 and 12 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    saveAdminPassword(newPassword.trim());
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassMessage({ text: 'Password successfully updated!', type: 'success' });
  };

  const handleSelectProductForEdit = (item: MenuItem) => {
    setSelectedEditItemId(item.id);
    setCatalogSubMode('edit');
    setNewProductName(item.name);
    setNewProductPrice(String(item.price));
    setNewProductCost(String(item.makingCost ?? (DEFAULT_RECIPE_COSTS[item.id]?.cost ?? Math.round(item.price * 0.45))));
    const catStr = String(item.category || '');
    setNewProductCategory(
      (catStr === 'fast-food' || catStr === 'burgers' || catStr === 'fast-food-bbq')
        ? 'fast-food'
        : (catStr === 'grill' || catStr === 'bbq' || catStr === 'bbq-main' || catStr === 'bbq-sides')
        ? 'grill'
        : (catStr === 'drinks' || catStr === 'shakes' || catStr === 'coffees' || catStr === 'sodas' || catStr === 'chai')
        ? 'drinks'
        : catStr === 'green-teas'
        ? 'green-teas'
        : 'ice-cream'
    );
    setNewProductUnit(item.unit || 'Per Piece');
    setNewProductDescription(item.description || '');
    setNewProductStock(inventory[item.id] ?? 20);
    setNewProductBadge(item.badge || '');
    setNewProductCustomUrl(item.image || '');
    
    // Smooth scroll to top of form
    const formEl = document.getElementById('product-form-container');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResetCatalogForm = () => {
    setSelectedEditItemId(null);
    setCatalogSubMode('add');
    setNewProductName('');
    setNewProductPrice('');
    setNewProductCost('');
    setNewProductCustomUrl('');
    setNewProductDescription('');
    setNewProductBadge('');
    setNewProductStock(25);
  };

  const handleUpdateExistingProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditItemId) return;
    const existing = menuItems.find((m) => m.id === selectedEditItemId);
    if (!existing) return;

    const priceNum = parseFloat(newProductPrice);
    if (!priceNum || priceNum <= 0) {
      alert('Please enter a valid retail price in Rs.');
      return;
    }
    const costNum = parseFloat(newProductCost) || 0;
    const finalImage = newProductCustomUrl.trim() || newProductPicture;

    const updatedItem: MenuItem = {
      ...existing,
      name: newProductName.trim() || existing.name,
      price: priceNum,
      makingCost: costNum,
      category: newProductCategory,
      image: finalImage,
      description: newProductDescription.trim() || existing.description,
      unit: newProductUnit,
      badge: newProductBadge.trim() || undefined,
    };

    onUpdateMenuItem(updatedItem);
    onUpdateStock(selectedEditItemId, newProductStock);
    saveItemIngredientCost(selectedEditItemId, costNum, 'Updated via Admin Console');

    setProductAddedSuccess(`Updated "${updatedItem.name}" successfully!`);
    setTimeout(() => setProductAddedSuccess(null), 6000);
  };

  const handleDeleteExistingProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently remove "${name}" from Frosty's menu?`)) {
      if (onDeleteProduct) {
        onDeleteProduct(id);
      }
      if (selectedEditItemId === id) {
        handleResetCatalogForm();
      }
      setProductAddedSuccess(`Removed "${name}" from menu catalog.`);
      setTimeout(() => setProductAddedSuccess(null), 6000);
    }
  };

  // Staff Attendance Methods
  const handleStaffClockIn = (staffId: string) => {
    const updated = staffList.map((s) => {
      if (s.id === staffId) {
        const arrivalStr = currentTimePKT ? `${currentTimePKT} PKT` : 'Just Now';
        return {
          ...s,
          arrivalTime: arrivalStr,
          arrivalDate: 'Today',
          status: 'On Duty' as const,
        };
      }
      return s;
    });
    saveStaffList(updated);
  };

  const handleToggleStaffStatus = (staffId: string) => {
    const updated = staffList.map((s) => {
      if (s.id === staffId) {
        const nextStatus = s.status === 'On Duty' ? ('Off Duty' as const) : ('On Duty' as const);
        return {
          ...s,
          status: nextStatus,
        };
      }
      return s;
    });
    saveStaffList(updated);
  };

  const handleAddStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) {
      alert('Please enter staff name');
      return;
    }
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      role: newStaffRole.trim() || 'Service Specialist',
      picture: newStaffPicture.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      contactNumber: newStaffPhone.trim() || '0300 0000000',
      emergencyContact: newStaffEmergency.trim() || 'Not Provided',
      arrivalTime: newStaffArrivalTime.trim() || (currentTimePKT ? `${currentTimePKT} PKT` : '10:00 AM PKT'),
      arrivalDate: 'Today',
      status: 'On Duty',
    };
    const updated = [newStaff, ...staffList];
    saveStaffList(updated);
    setShowAddStaffModal(false);
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffEmergency('');
    setNewStaffArrivalTime('');
  };

  const handleDeleteStaffMember = (staffId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the staff roster?`)) {
      const updated = staffList.filter((s) => s.id !== staffId);
      saveStaffList(updated);
    }
  };

  // Selected curve data based on timeRange
  const curveData = useMemo(() => {
    if (timeRange === 'yesterday') return YESTERDAY_HOURLY_DATA;
    if (timeRange === '7days') return SEVEN_DAYS_HOURLY_DATA;
    return TODAY_HOURLY_DATA;
  }, [timeRange]);

  // KPI Calculations matching screenshot
  const kpiMetrics = useMemo(() => {
    if (timeRange === 'yesterday') {
      return {
        revenue: 'Rs. 128,400',
        revenueGrowth: '+9.4%',
        target: 'Target: Rs. 125,000',
        totalOrders: 76,
        ordersGrowth: '+5',
        ordersBreakdown: '42 Dine-In • 20 Takeaway • 14 Del',
        occupancy: '14 / 22',
        occupancyPercent: '64% Full',
        prepTime: '12.4m',
        prepDelta: '-0.8m',
        gstAmount: 'Rs. 20,540',
      };
    }
    if (timeRange === '7days') {
      return {
        revenue: 'Rs. 984,200',
        revenueGrowth: '+18.6%',
        target: 'Weekly Target: Rs. 900,000',
        totalOrders: 592,
        ordersGrowth: '+48',
        ordersBreakdown: '330 Dine-In • 154 Takeaway • 108 Del',
        occupancy: '19 / 22',
        occupancyPercent: '86% Peak',
        prepTime: '11.8m',
        prepDelta: '-1.1m',
        gstAmount: 'Rs. 157,472',
      };
    }
    // Default Today
    return {
      revenue: 'Rs. 142,500',
      revenueGrowth: '+14.2%',
      target: 'Target: Rs. 130,000',
      totalOrders: 84,
      ordersGrowth: '+8',
      ordersBreakdown: '48 Dine-In • 22 Takeaway • 14 Del',
      occupancy: '16 / 22',
      occupancyPercent: '73% Full',
      prepTime: '11.2m',
      prepDelta: '-1.4m',
      gstAmount: 'Rs. 22,800',
    };
  }, [timeRange]);

  // Donut chart segments for Category Revenue Share
  // Fast Food / Burgers: 38% (#C25E34), Ice Cream & Cones: 28% (#D99B26), Loaded Fries: 16% (#3E2723), Shakes & Sundaes: 12% (#E07A5F), Sodas: 6% (#E6CCB2)
  const categorySlices = [
    { name: 'Flame Burgers & Wraps', percent: 38, color: '#C25E34' },
    { name: 'Ice Cream Scoops & Cones', percent: 28, color: '#D99B26' },
    { name: 'Loaded Fries & Sides', percent: 16, color: '#3E2723' },
    { name: 'Shakes & Sundaes', percent: 12, color: '#E07A5F' },
    { name: 'Sodas & Chillers', percent: 6, color: '#E6CCB2' },
  ];

  // SVG dimensions for Sales Curve
  const chartWidth = 620;
  const chartHeight = 260;
  const paddingLeft = 60;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 35;
  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  // Max value for y axis (e.g. 50k for today/yesterday or 350k for 7days)
  const maxRevenue = timeRange === '7days' ? 350000 : 50000;
  const yTicks = timeRange === '7days'
    ? [350000, 300000, 250000, 200000, 150000, 100000, 50000]
    : [50000, 45000, 40000, 35000, 30000, 25000, 20000, 15000, 10000];

  // Convert points to pixel coordinates
  const points = useMemo(() => {
    return curveData.map((d, index) => {
      const x = paddingLeft + (index / (curveData.length - 1)) * usableWidth;
      const normalizedY = Math.min(1, Math.max(0, d.revenue / maxRevenue));
      const y = paddingTop + usableHeight - normalizedY * usableHeight;
      return { x, y, data: d };
    });
  }, [curveData, usableWidth, usableHeight, maxRevenue]);

  // Construct smooth cubic Bezier path string
  const { pathString, areaString } = useMemo(() => {
    if (points.length < 2) return { pathString: '', areaString: '' };

    let p = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) * 0.55;
      const cpY2 = p1.y;
      p += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const last = points[points.length - 1];
    const first = points[0];
    const baseY = paddingTop + usableHeight;
    const a = `${p} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;

    return { pathString: p, areaString: a };
  }, [points, usableHeight]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF8F5] text-[#1E1915] flex flex-col font-sans select-none overflow-hidden animate-fadeIn">
      {/* 1. PASSWORD SIGN-IN MODAL (IF NOT AUTHENTICATED) */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#FAF8F5]">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#EDE8DF] shadow-xl p-8 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1E1915] text-[#D99B26] flex items-center justify-center text-2xl shadow-md">
              <i className="fa-solid fa-ice-cream"></i>
            </div>

            <div>
              <h2 className="font-heading font-black text-2xl text-[#1E1915]">
                Frosty's Admin & Staff Entrance
              </h2>
              <p className="text-xs text-[#7A7067] uppercase tracking-widest mt-1 font-bold">
                GREEN CITY X OPERATIONS & TEAM CONSOLE
              </p>
              <p className="text-xs text-[#8A8177] mt-2.5">
                Enter security password to access live telemetry, orders, menu CRUD, or staff attendance.
              </p>
            </div>

            <form onSubmit={(e) => handleLogin(e, 'overview')} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#4A423A] mb-1.5 flex items-center justify-between">
                  <span>Security Password</span>
                  <span className="text-[11px] text-[#7A7067] font-normal">Default: 1234567</span>
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  autoFocus
                  placeholder="Enter 6-12 char password"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-sm font-mono text-[#1E1915] focus:outline-none focus:border-[#C25E34] focus:ring-2 focus:ring-[#C25E34]/20 transition-all"
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                {/* 1. Staff Entrance Button (Prominent) */}
                <button
                  type="button"
                  onClick={() => {
                    if (!passwordInput.trim()) {
                      // Convenience helper: if password empty, autofill default password for staff ease
                      setPasswordInput('1234567');
                      setTimeout(() => {
                        if (checkAdminPassword('1234567')) {
                          setIsAuthenticated(true);
                          setActiveTab('users');
                          setPasswordError('');
                          setPasswordInput('');
                        }
                      }, 50);
                    } else {
                      handleLogin(undefined, 'users');
                    }
                  }}
                  id="btn-staff-entrance-direct"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-[#C25E34] to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2.5 border border-amber-400/30 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <i className="fa-solid fa-id-badge text-sm text-amber-200"></i>
                  <span>Staff Entrance (Shift & Attendance Hub)</span>
                </button>

                {/* 2. Full Admin Operations Console Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#1E1915] hover:bg-[#2C241E] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-lock-open text-xs text-[#D99B26]"></i>
                  <span>Unlock Full Operations Console</span>
                </button>
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordInput('1234567');
                    setShowDemoHint(true);
                  }}
                  className="text-xs text-[#C25E34] hover:underline font-semibold cursor-pointer"
                >
                  {showDemoHint ? '✓ Demo password filled (1234567)' : '🔑 Auto-fill demo password'}
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-[#EDE8DF] flex justify-center">
              <button
                onClick={onClose}
                className="text-xs text-[#7A7067] hover:text-[#1E1915] font-bold cursor-pointer"
              >
                &larr; Back to Storefront
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. AUTHENTICATED EXECUTIVE DASHBOARD */
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAF8F5]">
          
          {/* TOP HEADER BAR */}
          <header className="shrink-0 h-16 border-b border-[#EDE8DF] bg-[#FAF8F5] px-4 sm:px-6 flex items-center justify-between gap-4 z-30">
            {/* Search Input */}
            <div className="flex-1 max-w-md relative hidden sm:block">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9287] text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, menu, users..."
                className="w-full pl-9 pr-12 py-2 rounded-xl bg-[#F1ECE3] border border-[#E4DDD2] text-xs text-[#1E1915] placeholder:text-[#9C9287] focus:outline-none focus:border-[#C25E34] transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#7A7067] bg-[#E5DFD4] px-1.5 py-0.5 rounded border border-[#D5CDC0]">
                ⌘K
              </span>
            </div>

            {/* Right Controls: Role, Clock, Theme, Storefront, Exit */}
            <div className="flex items-center gap-3 shrink-0 ml-auto">
              {/* Role Dropdown */}
              <div className="flex items-center gap-2 bg-[#F1ECE3] border border-[#E4DDD2] px-3 py-1.5 rounded-xl">
                <span className="text-[11px] text-[#7A7067] font-bold">ROLE:</span>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as 'admin' | 'staff')}
                  className="text-xs font-extrabold text-[#1E1915] bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="admin">👑 Super Admin</option>
                  <option value="staff">👨‍🍳 Kitchen Staff</option>
                </select>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700">
                  {role === 'admin' ? 'SUPER ADMIN' : 'KITCHEN KDS'}
                </span>
              </div>

              {/* Live PKT Clock */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1ECE3] border border-[#E4DDD2] text-xs font-mono font-bold text-[#4A423A]">
                <i className="fa-solid fa-lock text-[10px] text-[#C25E34]"></i>
                <span>{currentTimePKT || '14:59'}</span>
              </div>

              {/* Theme icon toggle */}
              <div
                className="w-8 h-8 rounded-xl bg-[#F1ECE3] border border-[#E4DDD2] text-[#6B635B] flex items-center justify-center text-xs"
                title="Light Mode Active"
              >
                <i className="fa-regular fa-moon"></i>
              </div>

              {/* Top Bar Staff Entrance Shortcut */}
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  activeTab === 'users'
                    ? 'bg-[#1E1915] text-white border-[#1E1915] font-black'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                }`}
                title="Open Staff Attendance & Roster"
              >
                <i className="fa-solid fa-id-badge text-xs text-amber-600"></i>
                <span className="hidden sm:inline font-bold">Staff Entrance</span>
              </button>

              {/* View Storefront Button */}
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-[#E4DDD2] bg-[#FAF8F5] hover:bg-[#F1ECE3] text-[#1E1915] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>View Storefront</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </button>

              {/* Lock / Logout Button */}
              <button
                onClick={() => setIsAuthenticated(false)}
                className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 flex items-center justify-center text-xs transition-colors cursor-pointer"
                title="Lock Console"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          </header>

          {/* Mobile Responsive Navigation Strip (< md screens) */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto p-2 bg-[#F6F2EB] border-b border-[#EDE8DF] shrink-0 no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: 'fa-border-all' },
              { id: 'orders', label: 'Live Orders', icon: 'fa-bell-concierge', badge: activeOrdersCount > 0 ? `${activeOrdersCount}` : undefined },
              { id: 'menu', label: 'Menu Catalog', icon: 'fa-utensils' },
              { id: 'add-product', label: 'Add Product', icon: 'fa-circle-plus' },
              { id: 'finance', label: 'Financials', icon: 'fa-coins' },
              { id: 'users', label: 'Staff Entrance', icon: 'fa-id-badge', isStaff: true },
              { id: 'security', label: 'Security', icon: 'fa-shield-halved' },
              { id: 'system', label: 'Settings', icon: 'fa-sliders' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#1E1915] text-white shadow-xs'
                      : tab.isStaff
                      ? 'bg-amber-100 text-amber-950 font-black border border-amber-300'
                      : 'bg-white text-[#6B635B] hover:text-[#1E1915] border border-[#E4DDD2]'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} ${tab.isStaff && !isActive ? 'text-amber-700' : 'text-xs'}`}></i>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#C25E34] text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* MAIN WRAPPER: SIDEBAR + CONTENT AREA */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            
            {/* LEFT SIDEBAR NAVIGATION */}
            <aside className="w-64 shrink-0 border-r border-[#EDE8DF] bg-[#FAF8F5] p-4 flex flex-col justify-between overflow-y-auto hidden md:flex">
              <div className="space-y-6">
                
                {/* Brand Logo and Title */}
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-xl bg-[#1E1915] text-[#D99B26] flex items-center justify-center text-lg font-black shadow-sm shrink-0">
                    <i className="fa-solid fa-ice-cream"></i>
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="font-heading font-black text-sm text-[#1E1915] leading-tight truncate">
                      Frosty's Admin
                    </h1>
                    <p className="text-[10px] text-[#C25E34] font-black uppercase tracking-wider truncate">
                      GREEN CITY X OPERATIONS
                    </p>
                  </div>
                </div>

                {/* Section Header */}
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-black text-[#9C9287] uppercase tracking-wider mb-2">
                    PLATFORM CONTROL
                  </div>

                  {/* Nav Item 1: Overview & Metrics */}
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-[#1E1915] text-white shadow-xs'
                        : 'text-[#6B635B] hover:text-[#1E1915] hover:bg-[#F1ECE3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-border-all text-sm"></i>
                      <span>Overview & Metrics</span>
                    </div>
                  </button>

                  {/* Nav Item 2: Live Orders (KDS) */}
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'orders'
                        ? 'bg-[#1E1915] text-white shadow-xs'
                        : 'text-[#6B635B] hover:text-[#1E1915] hover:bg-[#F1ECE3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-bell-concierge text-sm"></i>
                      <span>Live Orders (KDS)</span>
                    </div>
                    {activeOrdersCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#C25E34] text-white shadow-2xs">
                        {activeOrdersCount} Live
                      </span>
                    )}
                  </button>

                  {/* Nav Item 3: Menu & Catalog CRUD */}
                  <button
                    onClick={() => setActiveTab('menu')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'menu'
                        ? 'bg-[#1E1915] text-white shadow-xs'
                        : 'text-[#6B635B] hover:text-[#1E1915] hover:bg-[#F1ECE3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-utensils text-sm"></i>
                      <span>Menu & Catalog CRUD</span>
                    </div>
                  </button>

                  {/* Nav Item: Add Product */}
                  <button
                    onClick={() => setActiveTab('add-product')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'add-product'
                        ? 'bg-[#1E1915] text-white shadow-xs'
                        : 'text-[#6B635B] hover:text-[#1E1915] hover:bg-[#F1ECE3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-circle-plus text-sm text-[#C25E34]"></i>
                      <span>Add Product</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      New
                    </span>
                  </button>

                  {/* Nav Item 4: Financials & Costs */}
                  <button
                    onClick={() => setActiveTab('finance')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'finance'
                        ? 'bg-[#1E1915] text-white shadow-xs'
                        : 'text-[#6B635B] hover:text-[#1E1915] hover:bg-[#F1ECE3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-coins text-sm"></i>
                      <span>Financials & Costs</span>
                    </div>
                  </button>

                  {/* Nav Item 5: Staff Entrance (Team Roster & Attendance) */}
                  <button
                    onClick={() => setActiveTab('users')}
                    id="sidebar-staff-entrance-btn"
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'users'
                        ? 'bg-[#1E1915] text-white shadow-xs'
                        : 'text-[#6B635B] hover:text-[#1E1915] hover:bg-[#F1ECE3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <i className={`fa-solid fa-id-badge text-sm ${activeTab === 'users' ? 'text-[#D99B26]' : 'text-amber-600'}`}></i>
                      <span className="font-extrabold">Staff Entrance</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/10 text-amber-800 border border-amber-500/20">
                      Attendance Hub
                    </span>
                  </button>

                  {/* Nav Item 6: Security Audit Logs */}
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'security'
                        ? 'bg-[#1E1915] text-white shadow-xs'
                        : 'text-[#6B635B] hover:text-[#1E1915] hover:bg-[#F1ECE3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-shield-halved text-sm"></i>
                      <span>Security Audit Logs</span>
                    </div>
                  </button>

                  {/* Nav Item 7: System & Feature Flags */}
                  <button
                    onClick={() => setActiveTab('system')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'system'
                        ? 'bg-[#1E1915] text-white shadow-xs'
                        : 'text-[#6B635B] hover:text-[#1E1915] hover:bg-[#F1ECE3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-sliders text-sm"></i>
                      <span>System & Feature Flags</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bottom Kitchen Online Telemetry Badge (Matching screenshot) */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EDE8DF] shadow-2xs space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-black text-xs text-[#1E1915]">
                    Green City Kitchen
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="text-[11px] text-[#7A7067]">
                  Timings: 1:00 PM – 3:00 AM PKT
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#9C9287] font-mono pt-1 border-t border-[#EDE8DF]">
                  <span>Latency: 14ms</span>
                  <span>Build: v2.4.0</span>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT WORKSPACE */}
            <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-7 space-y-6">
              
              {/* TAB 1: OVERVIEW & METRICS (MATCHING SCREENSHOT PERFECTLY) */}
              {activeTab === 'overview' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  
                  {/* Page Title & Time Range Filter Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
                        Operations Overview & Analytics
                      </h2>
                      <p className="text-xs sm:text-sm text-[#7A7067] mt-0.5">
                        Real-time telemetry and revenue ledger for Frosty's Green City branch.
                      </p>
                    </div>

                    {/* Time Range Pills: Today | Yesterday | 7 Days */}
                    <div className="flex items-center gap-1.5 bg-[#F1ECE3] border border-[#E4DDD2] p-1 rounded-xl self-start sm:self-auto">
                      {(['today', 'yesterday', '7days'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setTimeRange(r)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            timeRange === r
                              ? 'bg-[#1E1915] text-white shadow-xs'
                              : 'text-[#6B635B] hover:text-[#1E1915]'
                          }`}
                        >
                          {r === 'today' ? 'Today' : r === 'yesterday' ? 'Yesterday' : '7 Days'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5 TOP METRICS CARDS (EXACT MATCH) */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    
                    {/* CARD 1: TODAY'S REVENUE */}
                    <div className="bg-white rounded-2xl border border-[#EDE8DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-[#8A8177] uppercase tracking-wider mb-2">
                          {timeRange === '7days' ? 'WEEK REVENUE' : timeRange === 'yesterday' ? "YESTERDAY'S REVENUE" : "TODAY'S REVENUE"}
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-heading font-black text-xl sm:text-2xl text-[#C25E34]">
                            {kpiMetrics.revenue}
                          </span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            ▲ {kpiMetrics.revenueGrowth}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#8A8177] mt-3 font-medium">
                        {kpiMetrics.target}
                      </div>
                    </div>

                    {/* CARD 2: TOTAL ORDERS */}
                    <div className="bg-white rounded-2xl border border-[#EDE8DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-[#8A8177] uppercase tracking-wider mb-2">
                          TOTAL ORDERS
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-heading font-black text-xl sm:text-2xl text-[#1E1915]">
                            {kpiMetrics.totalOrders}
                          </span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            ▲ {kpiMetrics.ordersGrowth}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#8A8177] mt-3 font-medium truncate">
                        {kpiMetrics.ordersBreakdown}
                      </div>
                    </div>

                    {/* CARD 3: TABLE OCCUPANCY */}
                    <div className="bg-white rounded-2xl border border-[#EDE8DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-[#8A8177] uppercase tracking-wider mb-2">
                          TABLE OCCUPANCY
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-heading font-black text-xl sm:text-2xl text-[#1E1915]">
                            {kpiMetrics.occupancy}
                          </span>
                          <span className="text-[10px] font-black text-[#D97706]">
                            {kpiMetrics.occupancyPercent}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#8A8177] mt-3 font-medium">
                        6 Balcony • 10 Indoor
                      </div>
                    </div>

                    {/* CARD 4: AVG PREP TIME */}
                    <div className="bg-white rounded-2xl border border-[#EDE8DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-[#8A8177] uppercase tracking-wider mb-2">
                          AVG PREP TIME
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-heading font-black text-xl sm:text-2xl text-[#1E1915]">
                            {kpiMetrics.prepTime}
                          </span>
                          <span className="text-[10px] font-black text-amber-600">
                            ⚡ {kpiMetrics.prepDelta}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#8A8177] mt-3 font-medium">
                        KDS Kitchen Benchmark
                      </div>
                    </div>

                    {/* CARD 5: 16% PUNJAB GST */}
                    <div className="bg-white rounded-2xl border border-[#EDE8DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-[#8A8177] uppercase tracking-wider mb-2">
                          16% PUNJAB GST
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-heading font-black text-xl sm:text-2xl text-[#1E1915]">
                            {kpiMetrics.gstAmount}
                          </span>
                          <span className="text-[10px] font-bold text-[#8A8177]">
                            PRA
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#8A8177] mt-3 font-medium">
                        Tax Compliant Ledger
                      </div>
                    </div>

                  </div>

                  {/* 2 LARGE CHARTS ROW: SALES CURVE + CATEGORY REVENUE SHARE */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* CHART 1: FROSTY'S SALES CURVE (HOURLY PKT) (7 COLS) */}
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EDE8DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-heading font-black text-base sm:text-lg text-[#1E1915]">
                              Frosty's Sales Curve (Hourly PKT)
                            </h3>
                            <p className="text-xs text-[#7A7067] mt-0.5">
                              Afternoon scoop spike, 8 PM dinner rush, and 11 PM late night grill rush.
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-[#C25E34]">
                              Peak: <strong className="font-black">10 PM</strong>
                            </span>
                          </div>
                        </div>

                        {/* Interactive SVG Chart Container */}
                        <div className="relative mt-4 w-full overflow-x-auto">
                          <svg
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            className="w-full h-auto min-w-[500px] overflow-visible"
                          >
                            <defs>
                              <linearGradient id="curveAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#C25E34" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#C25E34" stopOpacity="0.01" />
                              </linearGradient>
                            </defs>

                            {/* Horizontal Grid lines & Y-Axis labels */}
                            {yTicks.map((tick) => {
                              const norm = tick / maxRevenue;
                              const y = paddingTop + usableHeight - norm * usableHeight;
                              const label = tick >= 1000 ? `Rs. ${tick / 1000}k` : `Rs. ${tick}`;
                              return (
                                <g key={tick}>
                                  <line
                                    x1={paddingLeft}
                                    y1={y}
                                    x2={chartWidth - paddingRight}
                                    y2={y}
                                    stroke="#F1ECE3"
                                    strokeWidth="1"
                                    strokeDasharray="3 3"
                                  />
                                  <text
                                    x={paddingLeft - 8}
                                    y={y + 3.5}
                                    textAnchor="end"
                                    className="text-[9px] fill-[#9C9287] font-mono select-none"
                                  >
                                    {label}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Gradient Area under curve */}
                            {areaString && (
                              <path
                                d={areaString}
                                fill="url(#curveAreaGrad)"
                              />
                            )}

                            {/* Smooth Spline Path */}
                            {pathString && (
                              <path
                                d={pathString}
                                fill="none"
                                stroke="#C25E34"
                                strokeWidth="2.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}

                            {/* Points / Circles on the curve */}
                            {points.map((pt, idx) => {
                              const isHovered = hoveredPoint?.hour === pt.data.hour;
                              return (
                                <g key={idx}>
                                  {/* X-axis time marks */}
                                  <text
                                    x={pt.x}
                                    y={paddingTop + usableHeight + 18}
                                    textAnchor="middle"
                                    className="text-[10px] fill-[#7A7067] font-bold select-none"
                                  >
                                    {pt.data.timeLabel}
                                  </text>

                                  {/* Interactive Circle Marker */}
                                  <circle
                                    cx={pt.x}
                                    y={pt.y}
                                    r={isHovered ? 6 : 4}
                                    fill="#FFFFFF"
                                    stroke="#C25E34"
                                    strokeWidth={isHovered ? 3 : 2}
                                    className="cursor-pointer transition-all"
                                    onMouseEnter={() => setHoveredPoint(pt.data)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                  />
                                </g>
                              );
                            })}
                          </svg>

                          {/* Hover Tooltip Popup */}
                          {hoveredPoint && (
                            <div className="absolute top-2 right-4 bg-[#1E1915] text-white p-2.5 rounded-xl shadow-lg text-xs pointer-events-none animate-fadeIn border border-[#3E342D]">
                              <div className="font-bold text-[#D99B26]">
                                {hoveredPoint.timeLabel} Rush Slot
                              </div>
                              <div className="text-white font-black text-sm">
                                Rs. {hoveredPoint.revenue.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-[#A89F93]">
                                {hoveredPoint.ordersCount} completed orders
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#EDE8DF] mt-3 flex items-center justify-between text-xs text-[#7A7067]">
                        <span>Peak register interval: 9:30 PM – 11:30 PM PKT</span>
                        <span className="font-bold text-[#C25E34]">99.4% Dispatch Accuracy</span>
                      </div>
                    </div>

                    {/* CHART 2: CATEGORY REVENUE SHARE (5 COLS) */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EDE8DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-heading font-black text-base sm:text-lg text-[#1E1915]">
                          Category Revenue Share
                        </h3>
                        <p className="text-xs text-[#7A7067] mt-0.5 mb-6">
                          Percentage of gross sales today.
                        </p>

                        {/* Donut Chart Visual */}
                        <div className="flex items-center justify-center my-4">
                          <svg viewBox="0 0 160 160" className="w-48 h-48 transform -rotate-90">
                            {/* Circumference = 2 * PI * 52 = ~326.7 */}
                            {/* Slice 1: Burgers 38% -> 124.1 */}
                            <circle
                              cx="80"
                              cy="80"
                              r="52"
                              fill="transparent"
                              stroke="#C25E34"
                              strokeWidth="24"
                              strokeDasharray="124.1 326.7"
                              strokeDashoffset="0"
                            />
                            {/* Slice 2: Ice cream 28% -> 91.5 */}
                            <circle
                              cx="80"
                              cy="80"
                              r="52"
                              fill="transparent"
                              stroke="#D99B26"
                              strokeWidth="24"
                              strokeDasharray="91.5 326.7"
                              strokeDashoffset="-124.1"
                            />
                            {/* Slice 3: Fries 16% -> 52.3 */}
                            <circle
                              cx="80"
                              cy="80"
                              r="52"
                              fill="transparent"
                              stroke="#3E2723"
                              strokeWidth="24"
                              strokeDasharray="52.3 326.7"
                              strokeDashoffset="-215.6"
                            />
                            {/* Slice 4: Shakes 12% -> 39.2 */}
                            <circle
                              cx="80"
                              cy="80"
                              r="52"
                              fill="transparent"
                              stroke="#E07A5F"
                              strokeWidth="24"
                              strokeDasharray="39.2 326.7"
                              strokeDashoffset="-267.9"
                            />
                            {/* Slice 5: Sodas 6% -> 19.6 */}
                            <circle
                              cx="80"
                              cy="80"
                              r="52"
                              fill="transparent"
                              stroke="#E6CCB2"
                              strokeWidth="24"
                              strokeDasharray="19.6 326.7"
                              strokeDashoffset="-307.1"
                            />
                          </svg>
                        </div>

                        {/* Category Legend Pills matching screenshot */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-[#4A423A] pt-2">
                          {categorySlices.map((c) => (
                            <div key={c.name} className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-sm shrink-0"
                                style={{ backgroundColor: c.color }}
                              ></span>
                              <span className="truncate text-[11px] font-medium">{c.name}</span>
                              <span className="font-bold text-[11px] ml-auto">{c.percent}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Insight Note at Bottom */}
                      <div className="pt-4 border-t border-[#EDE8DF] mt-4 text-xs text-[#7A7067] text-center">
                        Signature <strong className="text-[#1E1915]">Grilled Chicken Burger</strong> remains highest volume driver (38%).
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: LIVE ORDERS (KDS) */}
              {activeTab === 'orders' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#EDE8DF]">
                    <div>
                      <h3 className="font-heading font-black text-lg text-[#1E1915]">
                        Live Kitchen & Counter Dispatch (KDS)
                      </h3>
                      <p className="text-xs text-[#7A7067]">
                        Track incoming orders, scoop prep, dispatch handoff, and send automated WhatsApp alerts.
                      </p>
                    </div>
                  </div>
                  <RealTimeOrderDispatchHub
                    orders={orders}
                    onUpdateOrderStatus={onUpdateOrderStatus}
                    isStaffMode={role === 'staff'}
                  />
                </div>
              )}

              {/* TAB 3: MENU & CATALOG CRUD */}
              {activeTab === 'menu' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EDE8DF]">
                    <div>
                      <h3 className="font-heading font-black text-lg text-[#1E1915]">
                        Menu Catalog & Perishable Stock Management
                      </h3>
                      <p className="text-xs text-[#7A7067]">
                        Toggle stock availability, configure delivery restrictions for cones, and update prices.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
                    >
                      Reset Catalog to Factory
                    </button>
                  </div>

                  {/* Menu Table */}
                  <div className="bg-white rounded-2xl border border-[#EDE8DF] overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-[#EDE8DF] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E1915]">
                        All Menu Products ({menuItems.length} items)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF8F5] text-[#7A7067] uppercase font-bold border-b border-[#EDE8DF]">
                          <tr>
                            <th className="p-3.5">Item</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Price</th>
                            <th className="p-3.5">Delivery Restriction</th>
                            <th className="p-3.5">Stock Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EDE8DF]">
                          {menuItems
                            .filter((item) =>
                              searchQuery
                                ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
                                : true
                            )
                            .map((item) => {
                              const isOutOfStock = (inventory[item.id] ?? 15) <= 0;
                              const isCone = item.tags?.some((t) =>
                                t.toLowerCase().includes('cone')
                              );
                              return (
                                <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                                  <td className="p-3.5 font-bold text-[#1E1915]">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-10 h-10 rounded-xl object-cover border border-[#EDE8DF] shrink-0"
                                      />
                                      <div>
                                        <div className="font-heading font-black">{item.name}</div>
                                        <div className="text-[10px] text-[#8A8177] truncate max-w-xs">
                                          {item.description}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3.5 capitalize font-medium text-[#7A7067]">
                                    {item.category.replace('-', ' ')}
                                  </td>
                                  <td className="p-3.5 font-mono font-bold text-[#C25E34]">
                                    Rs. {item.price}
                                  </td>
                                  <td className="p-3.5">
                                    {isCone ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                        Dine-In / Pickup Only (No Delivery)
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        All Channels Allowed
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onUpdateStock(item.id, isOutOfStock ? 15 : 0)
                                      }
                                      className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                                        isOutOfStock
                                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}
                                    >
                                      {isOutOfStock ? '🔴 Out of Stock' : '🟢 In Stock'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ADD NEW PRODUCT (Direct User Requirement 1) */}
              {activeTab === 'add-product' && (
                <div className="space-y-6 max-w-5xl mx-auto" id="product-form-container">
                  {/* Header & Mode Switcher */}
                  <div className="bg-white p-5 rounded-2xl border border-[#EDE8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C25E34]"></span>
                        <h3 className="font-heading font-black text-xl text-[#1E1915]">
                          {catalogSubMode === 'edit'
                            ? 'Edit or Remove Existing Menu Product'
                            : "Add New Product to Frosty's Menu"}
                        </h3>
                      </div>
                      <p className="text-xs text-[#7A7067] mt-1">
                        {catalogSubMode === 'edit'
                          ? 'Modify retail price, recipe cost, photos, categories, or permanently remove products from the catalog.'
                          : 'Add items with retail selling price, ingredient making cost, category, and photo. Live profit margins are automatically calibrated.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      {/* Sub-mode Toggle */}
                      <div className="flex items-center p-1 bg-[#FAF8F5] rounded-xl border border-[#E4DDD2]">
                        <button
                          type="button"
                          onClick={handleResetCatalogForm}
                          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            catalogSubMode === 'add'
                              ? 'bg-[#1E1915] text-white shadow-xs'
                              : 'text-[#6B635B] hover:text-[#1E1915]'
                          }`}
                        >
                          <i className="fa-solid fa-plus text-[10px]"></i>
                          <span>Add New</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCatalogSubMode('edit');
                            if (!selectedEditItemId && menuItems.length > 0) {
                              handleSelectProductForEdit(menuItems[0]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            catalogSubMode === 'edit'
                              ? 'bg-[#C25E34] text-white shadow-xs'
                              : 'text-[#6B635B] hover:text-[#1E1915]'
                          }`}
                        >
                          <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                          <span>Edit & Remove ({menuItems.length})</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {catalogSubMode === 'edit' && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse shrink-0"></span>
                        <span className="font-black text-amber-950">Select Item to Modify:</span>
                        <span className="font-bold text-amber-800 truncate">
                          {selectedEditItemId
                            ? menuItems.find((m) => m.id === selectedEditItemId)?.name
                            : 'Choose from dropdown below'}
                        </span>
                      </div>
                      <select
                        value={selectedEditItemId || ''}
                        onChange={(e) => {
                          const it = menuItems.find((m) => m.id === e.target.value);
                          if (it) handleSelectProductForEdit(it);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-[#1E1915] max-w-xs focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Choose item to edit or delete --</option>
                        {menuItems.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} (Rs. {m.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {productAddedSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in shadow-xs">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-check text-base text-emerald-600"></i>
                        <span>{productAddedSuccess}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT 2 COLS: Form Inputs */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#EDE8DF] shadow-xs space-y-5">
                      <form
                        onSubmit={catalogSubMode === 'edit' ? handleUpdateExistingProduct : (e) => {
                          e.preventDefault();
                          if (!newProductName.trim()) {
                            alert('Please enter a product name');
                            return;
                          }
                          const priceNum = parseFloat(newProductPrice);
                          if (!priceNum || priceNum <= 0) {
                            alert('Please enter a valid retail price in Rs.');
                            return;
                          }
                          const costNum = parseFloat(newProductCost) || 0;
                          const finalImage = newProductCustomUrl.trim() || newProductPicture;

                          const newId = `product-${Date.now()}`;
                          const newItem: MenuItem = {
                            id: newId,
                            name: newProductName.trim(),
                            price: priceNum,
                            makingCost: costNum,
                            category: newProductCategory,
                            image: finalImage,
                            description:
                              newProductDescription.trim() ||
                              `${newProductName.trim()} prepared fresh to order at Frosty's.`,
                            unit: newProductUnit,
                            popular: false,
                            badge: newProductBadge.trim() || undefined,
                            rating: 5.0,
                            isConeCupAllowed:
                              newProductCategory === 'ice-cream' &&
                              newProductName.toLowerCase().includes('cone'),
                            isBeverage:
                              newProductCategory === 'drinks' || newProductCategory === 'green-teas',
                            tags: [
                              newProductCategory === 'fast-food'
                                ? 'Fast Food'
                                : newProductCategory === 'grill'
                                ? 'Grill'
                                : newProductCategory === 'drinks'
                                ? 'Drinks'
                                : newProductCategory === 'ice-cream'
                                ? 'Ice Cream'
                                : "Green Tea's",
                              newProductName.trim(),
                            ],
                          };

                          if (onAddNewProduct) {
                            onAddNewProduct(newItem, newProductStock);
                          }
                          saveItemIngredientCost(newId, costNum, 'Custom item added via Admin');

                          setProductAddedSuccess(`Added "${newItem.name}" to menu catalog & COGS ledger!`);
                          setTimeout(() => setProductAddedSuccess(null), 6000);

                          setNewProductName('');
                          setNewProductPrice('');
                          setNewProductCost('');
                          setNewProductCustomUrl('');
                          setNewProductDescription('');
                          setNewProductBadge('');
                        }}
                        className="space-y-4"
                      >
                        {/* 1. Product Name */}
                        <div>
                          <label className="block text-xs font-bold text-[#1E1915] mb-1">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            placeholder="e.g. Grill Fish (Kala Rahu), Jumbo Paratha Roll, Soft Serve Cone"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-semibold text-[#1E1915] focus:outline-none focus:border-[#C25E34]"
                          />
                        </div>

                        {/* 2. Retail Price & Cost to Make Per Piece (Requested Options) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-[#1E1915] mb-1">
                              Retail Selling Price (Rs.) *
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8A8177]">
                                Rs.
                              </span>
                              <input
                                type="number"
                                required
                                min="1"
                                step="any"
                                value={newProductPrice}
                                onChange={(e) => setNewProductPrice(e.target.value)}
                                placeholder="e.g. 600"
                                className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-bold text-[#1E1915] focus:outline-none focus:border-[#C25E34]"
                              />
                            </div>
                            <span className="text-[10px] text-[#8A8177] mt-0.5 block">
                              Customer selling price on the menu
                            </span>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#1E1915] mb-1">
                              Cost to Make Per Piece (Rs.) *
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8A8177]">
                                Rs.
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={newProductCost}
                                onChange={(e) => setNewProductCost(e.target.value)}
                                placeholder="e.g. 320"
                                className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-bold text-[#1E1915] focus:outline-none focus:border-[#C25E34]"
                              />
                            </div>
                            <span className="text-[10px] text-[#8A8177] mt-0.5 block">
                              Raw ingredients, preparation & packaging
                            </span>
                          </div>
                        </div>

                        {/* 3. Category & Unit */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-[#1E1915] mb-1">
                              Menu Category *
                            </label>
                            <select
                              value={newProductCategory}
                              onChange={(e) =>
                                setNewProductCategory(
                                  e.target.value as
                                    | 'fast-food'
                                    | 'grill'
                                    | 'drinks'
                                    | 'ice-cream'
                                    | 'green-teas'
                                )
                              }
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-bold text-[#1E1915] focus:outline-none focus:border-[#C25E34]"
                            >
                              <option value="fast-food">fast food (Burgers, Rolls, Fries, Wraps)</option>
                              <option value="grill">grill (Fish Kala Rahu, BBQ Boti, Wings, Soups, Sides)</option>
                              <option value="drinks">drinks (hot/cold beverages) (Shakes, Coffees, Soda, Chai)</option>
                              <option value="ice-cream">ice cream (Super Cups, Sundaes, Cones)</option>
                              <option value="green-teas">Green tea's (Peshawari Qehwa, Mint & Honey Green Tea)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#1E1915] mb-1">
                              Serving Unit / Portion
                            </label>
                            <input
                              type="text"
                              value={newProductUnit}
                              onChange={(e) => setNewProductUnit(e.target.value)}
                              placeholder="e.g. Per Piece, Per KG, Single Bowl, Hot Cup"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-semibold text-[#1E1915] focus:outline-none focus:border-[#C25E34]"
                            />
                          </div>
                        </div>

                        {/* 4. Picture (Requested Option: Presets + File Upload + Custom URL) */}
                        <div className="space-y-2 pt-1 border-t border-[#EDE8DF]">
                          <label className="block text-xs font-bold text-[#1E1915]">
                            Product Picture *
                          </label>

                          {/* Quick 1-Click Preset Gallery */}
                          <div>
                            <span className="text-[11px] font-bold text-[#8A8177] mb-1.5 block">
                              Select from High-Definition Photo Presets:
                            </span>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                              {PRESET_PICTURES.map((preset) => {
                                const isSelected =
                                  newProductPicture === preset.img && !newProductCustomUrl;
                                return (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => {
                                      setNewProductPicture(preset.img);
                                      setNewProductCustomUrl('');
                                    }}
                                    className={`relative p-1 rounded-xl border text-left transition-all cursor-pointer group ${
                                      isSelected
                                        ? 'border-[#C25E34] ring-2 ring-[#C25E34]/20 bg-amber-50/50'
                                        : 'border-[#EDE8DF] hover:border-[#8A8177]'
                                    }`}
                                  >
                                    <img
                                      src={preset.img}
                                      alt={preset.label}
                                      className="w-full h-12 object-cover rounded-lg"
                                    />
                                    <div className="text-[9px] font-bold text-[#1E1915] mt-1 line-clamp-1">
                                      {preset.label}
                                    </div>
                                    {isSelected && (
                                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C25E34] text-white flex items-center justify-center text-[8px]">
                                        <i className="fa-solid fa-check"></i>
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Upload from Device or Custom URL */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div>
                              <span className="text-[11px] font-bold text-[#6B635B] block mb-1">
                                Or Upload Image from Device:
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === 'string') {
                                        setNewProductCustomUrl(reader.result);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="w-full text-xs text-[#6B635B] file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#F1ECE3] file:text-[#1E1915] hover:file:bg-[#E4DDD2] cursor-pointer"
                              />
                            </div>

                            <div>
                              <span className="text-[11px] font-bold text-[#6B635B] block mb-1">
                                Or Image URL:
                              </span>
                              <input
                                type="url"
                                value={newProductCustomUrl}
                                onChange={(e) => setNewProductCustomUrl(e.target.value)}
                                placeholder="https://example.com/item.jpg"
                                className="w-full px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-mono text-[#1E1915] focus:outline-none focus:border-[#C25E34]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 5. Description & Initial Stock */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-[#1E1915] mb-1">
                              Appetizing Description
                            </label>
                            <textarea
                              rows={2}
                              value={newProductDescription}
                              onChange={(e) => setNewProductDescription(e.target.value)}
                              placeholder="Describe fresh ingredients, marinade, and serving details..."
                              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs text-[#1E1915] focus:outline-none focus:border-[#C25E34]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#1E1915] mb-1">
                              Initial Stock Count
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={newProductStock}
                              onChange={(e) => setNewProductStock(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-bold text-[#1E1915] focus:outline-none focus:border-[#C25E34]"
                            />
                            <label className="block text-xs font-bold text-[#1E1915] mt-2 mb-1">
                              Optional Ribbon Badge
                            </label>
                            <input
                              type="text"
                              value={newProductBadge}
                              onChange={(e) => setNewProductBadge(e.target.value)}
                              placeholder="e.g. 🔥 Best Seller"
                              className="w-full px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-semibold text-[#1E1915]"
                            />
                          </div>
                        </div>

                        {/* Submit & Edit Buttons */}
                        <div className="pt-3 border-t border-[#EDE8DF]">
                          {catalogSubMode === 'edit' ? (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedEditItemId) {
                                    const it = menuItems.find((m) => m.id === selectedEditItemId);
                                    handleDeleteExistingProduct(selectedEditItemId, it?.name || newProductName);
                                  }
                                }}
                                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
                              >
                                <i className="fa-solid fa-trash-can text-xs"></i>
                                <span>Delete / Remove Item</span>
                              </button>

                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={handleResetCatalogForm}
                                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#4A423A] font-bold text-xs cursor-pointer transition-colors"
                                >
                                  Cancel Edit
                                </button>
                                <button
                                  type="submit"
                                  className="px-6 py-2.5 rounded-xl bg-[#C25E34] hover:bg-[#a54c25] active:scale-95 text-white font-heading font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                                >
                                  <i className="fa-solid fa-check text-xs"></i>
                                  <span>Save & Update Item</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end">
                              <button
                                type="submit"
                                className="px-6 py-3 rounded-2xl bg-[#C25E34] hover:bg-[#a54c25] active:scale-95 text-white font-heading font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                              >
                                <i className="fa-solid fa-plus text-xs"></i>
                                <span>Add Product to Live Menu</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* RIGHT COL: Live Profit & Margin Telemetry Card */}
                    <div className="space-y-4">
                      {/* Product Preview Card */}
                      <div className="bg-white p-5 rounded-3xl border border-[#EDE8DF] shadow-xs space-y-4">
                        <div className="text-[10px] font-black text-[#8A8177] uppercase tracking-wider">
                          Live Product Card Preview
                        </div>

                        <div className="rounded-2xl border border-[#EDE8DF] overflow-hidden bg-[#FAF8F5] flex flex-col">
                          <div className="relative h-36 bg-stone-200">
                            <img
                              src={newProductCustomUrl.trim() || newProductPicture}
                              alt={newProductName || 'Preview'}
                              className="w-full h-full object-cover"
                            />
                            {newProductBadge && (
                              <span className="absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs bg-red-600">
                                {newProductBadge}
                              </span>
                            )}
                            <span className="absolute bottom-2 right-2 bg-white/95 text-stone-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                              <i className="fa-solid fa-star text-amber-400 text-[9px] mr-0.5"></i> 5.0
                            </span>
                          </div>

                          <div className="p-3.5 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-heading font-black text-sm text-[#1E1915] truncate">
                                {newProductName.trim() || 'Product Name Preview'}
                              </h4>
                              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 uppercase">
                                {newProductCategory}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#7A7067] line-clamp-2">
                              {newProductDescription.trim() || 'Delicious freshly prepared item.'}
                            </p>
                            <div className="pt-2 border-t border-[#EDE8DF] flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-[#8A8177] block">Selling Price</span>
                                <span className="font-heading font-black text-sm text-[#1E1915]">
                                  Rs. {newProductPrice ? Number(newProductPrice).toLocaleString() : '0'}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                In Stock ({newProductStock})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Profit Telemetry */}
                        {(() => {
                          const priceVal = parseFloat(newProductPrice) || 0;
                          const costVal = parseFloat(newProductCost) || 0;
                          const unitProfit = Math.max(0, priceVal - costVal);
                          const marginPercent = priceVal > 0 ? ((unitProfit / priceVal) * 100).toFixed(1) : '0';
                          const isHighMargin = parseFloat(marginPercent) >= 50;

                          return (
                            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E4DDD2] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#1E1915]">
                                  Financial Breakdown
                                </span>
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    isHighMargin
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {isHighMargin ? 'High Margin Item' : 'Standard Margin'}
                                </span>
                              </div>

                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-[#6B635B]">
                                  <span>Retail Price:</span>
                                  <span className="font-bold text-[#1E1915]">Rs. {priceVal.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-[#6B635B]">
                                  <span>Ingredient/Unit Cost:</span>
                                  <span className="font-bold text-rose-600">- Rs. {costVal.toLocaleString()}</span>
                                </div>
                                <div className="pt-1.5 border-t border-[#E4DDD2] flex items-center justify-between text-xs font-black">
                                  <span className="text-[#1E1915]">Net Profit Per Unit:</span>
                                  <span className="text-emerald-700 font-heading text-sm">
                                    Rs. {unitProfit.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[#6B635B]">Profit Margin %:</span>
                                  <span className="font-extrabold text-[#C25E34]">{marginPercent}%</span>
                                </div>
                              </div>

                              {/* Visual Margin Bar */}
                              <div className="w-full h-2 rounded-full bg-[#E4DDD2] overflow-hidden mt-1">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.max(0, parseFloat(marginPercent)))}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* DIRECT USER REQUIREMENT: Live Directory to Change/Edit or Remove Any Item */}
                  <div className="bg-white p-6 rounded-3xl border border-[#EDE8DF] shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-heading font-black text-lg text-[#1E1915] flex items-center gap-2">
                          <i className="fa-solid fa-list-check text-[#C25E34]"></i>
                          <span>Live Menu Catalog (Click Any Item to Edit or Remove)</span>
                        </h4>
                        <p className="text-xs text-[#7A7067]">
                          Quickly search, modify prices, or delete items permanently from the active customer menu.
                        </p>
                      </div>

                      <div className="w-full sm:w-64 relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8A8177]"></i>
                        <input
                          type="text"
                          value={catalogSearchQuery}
                          onChange={(e) => setCatalogSearchQuery(e.target.value)}
                          placeholder="Search any menu item..."
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-semibold text-[#1E1915] focus:outline-none focus:border-[#C25E34]"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#EDE8DF]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#EDE8DF] bg-[#FAF8F5] text-[#8A8177] font-mono text-[10px] uppercase">
                            <th className="p-3">Product Name & Category</th>
                            <th className="p-3">Retail Price</th>
                            <th className="p-3">Making Cost</th>
                            <th className="p-3">Stock Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EDE8DF]">
                          {menuItems
                            .filter((item) =>
                              catalogSearchQuery
                                ? item.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                                  item.category.toLowerCase().includes(catalogSearchQuery.toLowerCase())
                                : true
                            )
                            .map((item) => {
                              const isOutOfStock = (inventory[item.id] ?? 15) <= 0;
                              const isCurrentlyEditing = selectedEditItemId === item.id;
                              const cost = item.makingCost ?? (DEFAULT_RECIPE_COSTS[item.id]?.cost ?? Math.round(item.price * 0.45));
                              return (
                                <tr
                                  key={item.id}
                                  className={`transition-colors ${
                                    isCurrentlyEditing
                                      ? 'bg-amber-50/80 font-bold'
                                      : 'hover:bg-[#FAF8F5]/80'
                                  }`}
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-10 h-10 rounded-xl object-cover border border-[#EDE8DF] shrink-0"
                                      />
                                      <div>
                                        <div className="font-heading font-black text-[#1E1915] flex items-center gap-1.5">
                                          <span>{item.name}</span>
                                          {item.badge && (
                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">
                                              {item.badge}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-[#8A8177] capitalize">
                                          {item.category.replace('-', ' ')} • {item.unit || 'Standard'}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 font-mono font-bold text-[#1E1915]">
                                    Rs. {item.price}
                                  </td>
                                  <td className="p-3 font-mono text-stone-600">
                                    Rs. {cost}
                                  </td>
                                  <td className="p-3">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateStock(item.id, isOutOfStock ? 15 : 0)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                        isOutOfStock
                                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}
                                    >
                                      {isOutOfStock ? '🔴 Out of Stock' : '🟢 In Stock'}
                                    </button>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleSelectProductForEdit(item)}
                                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1"
                                        title="Edit this item"
                                      >
                                        <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteExistingProduct(item.id, item.name)}
                                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1"
                                        title="Permanently remove this item"
                                      >
                                        <i className="fa-solid fa-trash text-[10px]"></i>
                                        <span>Remove</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FINANCIALS & COSTS */}
              {activeTab === 'finance' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="bg-white p-4 rounded-2xl border border-[#EDE8DF]">
                    <h3 className="font-heading font-black text-lg text-[#1E1915]">
                      Recipe & Ingredient Cost Management (COGS)
                    </h3>
                    <p className="text-xs text-[#7A7067]">
                      Configure cost per item to calculate live unit profit and net gross margin across ice cream and grill.
                    </p>
                  </div>
                  <RecipeCostManager menuItems={menuItems} />
                </div>
              )}

              {/* TAB 5: USER & STAFF HUB */}
              {activeTab === 'users' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  {/* DIRECT USER REQUIREMENT: Staff Management Hub with Name, Picture, Contact, Emergency Contact, and Arrival Time */}
                  <div className="bg-white p-6 rounded-3xl border border-[#EDE8DF] shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EDE8DF] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#C25E34]"></span>
                          <h3 className="font-heading font-black text-xl text-[#1E1915]">
                            Frosty's Staff Directory & Shift Attendance Hub
                          </h3>
                        </div>
                        <p className="text-xs text-[#7A7067] mt-1">
                          Track when staff reached at Frosty's, manage phone numbers, emergency contact protocols, and active shift rosters.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setNewStaffArrivalTime(currentTimePKT ? `${currentTimePKT} PKT` : '10:00 AM PKT');
                            setShowAddStaffModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#C25E34] hover:bg-[#a54c25] text-white text-xs font-heading font-black cursor-pointer flex items-center gap-2 shadow-xs transition-colors"
                        >
                          <i className="fa-solid fa-user-plus text-xs"></i>
                          <span>Add Staff Member</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Shift Summary Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DF]">
                        <span className="text-[10px] font-bold text-[#8A8177] uppercase block">Total Roster</span>
                        <span className="font-heading font-black text-lg text-[#1E1915]">{staffList.length} Members</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block">On Duty Now</span>
                        <span className="font-heading font-black text-lg text-emerald-900">
                          {staffList.filter((s) => s.status === 'On Duty').length} Active
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                        <span className="text-[10px] font-bold text-blue-700 uppercase block">Current PKT Time</span>
                        <span className="font-mono font-bold text-lg text-blue-900">{currentTimePKT || 'Live PKT'}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-700 uppercase block">Store Location</span>
                        <span className="font-heading font-bold text-xs text-amber-950 mt-1 block">Green City & Paragon</span>
                      </div>
                    </div>

                    {/* Add Staff Modal / Inline Card */}
                    {showAddStaffModal && (
                      <div className="p-5 rounded-3xl bg-[#FAF8F5] border-2 border-[#C25E34]/30 space-y-4 animate-fade-in shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-heading font-black text-sm text-[#1E1915] flex items-center gap-2">
                            <i className="fa-solid fa-id-card text-[#C25E34]"></i>
                            <span>Register New Staff Member</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowAddStaffModal(false)}
                            className="text-stone-400 hover:text-stone-700 text-sm cursor-pointer"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>

                        <form onSubmit={handleAddStaffMember} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-[#1E1915] mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={newStaffName}
                                onChange={(e) => setNewStaffName(e.target.value)}
                                placeholder="e.g. Tariq Mehmood"
                                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E4DDD2] text-xs font-bold text-[#1E1915]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-[#1E1915] mb-1">
                                Role / Designation *
                              </label>
                              <input
                                type="text"
                                required
                                value={newStaffRole}
                                onChange={(e) => setNewStaffRole(e.target.value)}
                                placeholder="e.g. Head Charcoal Grill Master, Ice Cream Specialist"
                                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E4DDD2] text-xs font-bold text-[#1E1915]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-[#1E1915] mb-1">
                                Contact Number *
                              </label>
                              <input
                                type="text"
                                required
                                value={newStaffPhone}
                                onChange={(e) => setNewStaffPhone(e.target.value)}
                                placeholder="e.g. 0300 4821950"
                                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E4DDD2] text-xs font-mono font-bold text-[#1E1915]"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-[#1E1915] mb-1">
                                Emergency Contact Number & Name/Relation *
                              </label>
                              <input
                                type="text"
                                required
                                value={newStaffEmergency}
                                onChange={(e) => setNewStaffEmergency(e.target.value)}
                                placeholder="e.g. 0321 9876543 (Brother - Aslam)"
                                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E4DDD2] text-xs font-mono font-bold text-rose-700"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-[#1E1915] mb-1">
                                Time Reached at Frosty's *
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  required
                                  value={newStaffArrivalTime}
                                  onChange={(e) => setNewStaffArrivalTime(e.target.value)}
                                  placeholder="e.g. 09:30 AM PKT"
                                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E4DDD2] text-xs font-bold text-[#1E1915]"
                                />
                                <button
                                  type="button"
                                  onClick={() => setNewStaffArrivalTime(currentTimePKT ? `${currentTimePKT} PKT` : 'Just Now')}
                                  className="px-3 py-2 rounded-xl bg-[#1E1915] text-white text-[11px] font-bold shrink-0 cursor-pointer"
                                  title="Stamp current time"
                                >
                                  Now
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-[#1E1915] mb-1">
                                Profile Picture URL
                              </label>
                              <input
                                type="url"
                                value={newStaffPicture}
                                onChange={(e) => setNewStaffPicture(e.target.value)}
                                placeholder="https://example.com/photo.jpg"
                                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E4DDD2] text-xs text-[#1E1915]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4DDD2]">
                            <button
                              type="button"
                              onClick={() => setShowAddStaffModal(false)}
                              className="px-4 py-2 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl bg-[#C25E34] hover:bg-[#a54c25] text-white font-heading font-black text-xs cursor-pointer shadow-xs"
                            >
                              Save Staff Member
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Staff Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {staffList.map((staff) => (
                        <div
                          key={staff.id}
                          className="p-4 rounded-2xl bg-white border border-[#EDE8DF] shadow-2xs hover:border-[#C25E34]/40 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={staff.picture}
                                alt={staff.name}
                                className="w-13 h-13 rounded-2xl object-cover border border-[#EDE8DF] shrink-0"
                              />
                              <div>
                                <div className="font-heading font-black text-sm text-[#1E1915]">
                                  {staff.name}
                                </div>
                                <div className="text-[11px] font-bold text-[#7A7067]">
                                  {staff.role}
                                </div>
                                <div className="mt-1">
                                  <span
                                    className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                      staff.status === 'On Duty'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-stone-100 text-stone-600'
                                    }`}
                                  >
                                    ● {staff.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteStaffMember(staff.id, staff.name)}
                              className="text-stone-300 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                              title="Remove from roster"
                            >
                              <i className="fa-solid fa-trash-can text-xs"></i>
                            </button>
                          </div>

                          {/* Shift Arrival Time Display */}
                          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <i className="fa-solid fa-clock text-blue-600 text-sm"></i>
                              <div>
                                <span className="text-[10px] text-blue-700 font-bold block uppercase tracking-wider">
                                  Reached at Frosty's
                                </span>
                                <span className="text-xs font-black text-blue-950 font-mono">
                                  {staff.arrivalTime || 'Not Marked Yet'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleStaffClockIn(staff.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer shadow-2xs flex items-center gap-1 transition-colors"
                              title="Record current time as arrival"
                            >
                              <i className="fa-solid fa-location-dot text-[9px]"></i>
                              <span>Record Arrival</span>
                            </button>
                          </div>

                          {/* Contact Details */}
                          <div className="space-y-1.5 text-xs pt-1 border-t border-[#EDE8DF]">
                            <div className="flex items-center justify-between text-[#6B635B]">
                              <span className="flex items-center gap-1.5 font-medium">
                                <i className="fa-solid fa-phone text-stone-400 text-[10px]"></i>
                                <span>Phone:</span>
                              </span>
                              <span className="font-mono font-bold text-[#1E1915]">{staff.contactNumber}</span>
                            </div>

                            <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-200/60 flex items-center justify-between gap-2 text-rose-950 text-xs">
                              <span className="flex items-center gap-1.5 font-bold text-rose-800 text-[11px]">
                                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-[10px]"></i>
                                <span>Emergency:</span>
                              </span>
                              <span className="font-mono font-bold text-rose-900 text-[11px] truncate max-w-[200px]">
                                {staff.emergencyContact}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => handleToggleStaffStatus(staff.id)}
                              className="text-[11px] font-bold text-stone-500 hover:text-[#1E1915] cursor-pointer"
                            >
                              {staff.status === 'On Duty' ? 'Mark Shift Ended' : 'Set as On-Duty'}
                            </button>
                            <span className="text-[10px] text-stone-400">Green City Askari X</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Super Admin Security Password Section */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EDE8DF] space-y-4">
                    <h3 className="font-heading font-black text-lg text-[#1E1915]">
                      Super Admin Security & Password
                    </h3>
                    <p className="text-xs text-[#7A7067]">
                      Update the master owner password (between 6 and 12 characters).
                    </p>

                    <form onSubmit={handlePasswordUpdate} className="space-y-3 max-w-md">
                      <div>
                        <label className="block text-xs font-bold text-[#4A423A] mb-1">
                          Current Password *
                        </label>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-mono text-[#1E1915]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#4A423A] mb-1">
                          New Password (6–12 chars) *
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          maxLength={12}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-mono text-[#1E1915]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#4A423A] mb-1">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          maxLength={12}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E4DDD2] text-xs font-mono text-[#1E1915]"
                        />
                      </div>

                      {passMessage && (
                        <div
                          className={`p-3 rounded-xl text-xs font-bold ${
                            passMessage.type === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {passMessage.text}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#1E1915] text-white text-xs font-black cursor-pointer shadow-xs"
                      >
                        Update Master Password
                      </button>
                    </form>
                  </div>

                  {/* Customer Resolution Desk */}
                  <div className="bg-white p-5 rounded-3xl border border-[#EDE8DF] space-y-3">
                    <h3 className="font-heading font-black text-lg text-[#1E1915]">
                      Customer Complaints & Resolution Desk ({complaints.length})
                    </h3>
                    {complaints.length === 0 ? (
                      <p className="text-xs text-[#7A7067]">No customer complaints filed. All guests satisfied!</p>
                    ) : (
                      <div className="divide-y divide-[#EDE8DF]">
                        {complaints.map((c) => (
                          <div key={c.id} className="py-3 flex items-start justify-between gap-4">
                            <div>
                              <div className="font-bold text-xs text-[#1E1915] flex items-center gap-2">
                                <span>{c.customerName}</span>
                                <span className="font-mono text-[10px] text-[#7A7067]">({c.customerPhone})</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                  c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {c.status}
                                </span>
                              </div>
                              <p className="text-xs text-[#4A423A] mt-1">{c.description}</p>
                            </div>
                            {onUpdateComplaintStatus && c.status === 'Pending' && (
                              <button
                                onClick={() => onUpdateComplaintStatus(c.id, 'Resolved', 'Resolved by manager')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold cursor-pointer shrink-0"
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SECURITY AUDIT LOGS */}
              {activeTab === 'security' && (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="bg-white p-5 rounded-3xl border border-[#EDE8DF] space-y-4">
                    <h3 className="font-heading font-black text-lg text-[#1E1915]">
                      Security Audit Trail
                    </h3>
                    <p className="text-xs text-[#7A7067]">
                      Cryptographic access logs, authentication attempts, and system privilege elevations.
                    </p>

                    <div className="space-y-2 font-mono text-xs text-[#4A423A]">
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE8DF] flex items-center justify-between">
                        <span>[PKT {currentTimePKT}] Super Admin session initialized from Green City terminal</span>
                        <span className="text-emerald-600 font-bold">200 OK</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE8DF] flex items-center justify-between">
                        <span>[PKT 03:00] Automatic 3:00 AM Register rollover completed</span>
                        <span className="text-blue-600 font-bold">ARCHIVED</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE8DF] flex items-center justify-between">
                        <span>[PKT 13:00] Store opened for daily shift operations</span>
                        <span className="text-emerald-600 font-bold">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: SYSTEM & FEATURE FLAGS */}
              {activeTab === 'system' && (
                <div className="space-y-4 max-w-7xl mx-auto">
                  <div className="bg-white p-4 rounded-2xl border border-[#EDE8DF]">
                    <h3 className="font-heading font-black text-lg text-[#1E1915]">
                      Delivery Zones & Store Radius Configuration
                    </h3>
                    <p className="text-xs text-[#7A7067]">
                      Set up delivery fees, neighborhood coverage (Green City, Paragon City), and store open/closed master switch.
                    </p>
                  </div>
                  <DeliveryZonesSettings />
                </div>
              )}

            </main>
          </div>

          {/* Reset Menu Confirmation Modal */}
          {showResetConfirm && (
            <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white border border-[#EDE8DF] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-xl">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <h4 className="font-heading font-black text-lg text-[#1E1915]">
                    Reset Catalog to Factory Defaults?
                  </h4>
                  <p className="text-xs text-[#7A7067] mt-1">
                    This will restore all default burgers, cones, sundaes, shakes, and base prices.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E4DDD2] text-xs font-bold text-[#4A423A] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetMenu();
                      setShowResetConfirm(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black cursor-pointer shadow-md"
                  >
                    Yes, Reset Catalog
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
