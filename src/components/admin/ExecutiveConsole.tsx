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

  // Active Tab: matching screenshot's left navigation
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'menu' | 'finance' | 'users' | 'security' | 'system'
  >('overview');

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
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError('Please enter admin password');
      return;
    }
    if (checkAdminPassword(passwordInput.trim())) {
      setIsAuthenticated(true);
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
                Frosty's Admin Console
              </h2>
              <p className="text-xs text-[#7A7067] uppercase tracking-widest mt-1 font-bold">
                GREEN CITY X OPERATIONS CONSOLE
              </p>
              <p className="text-xs text-[#8A8177] mt-3">
                Enter your administrative password to access the real-time telemetry, revenue ledger, and KDS dispatch hub.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#4A423A] mb-1.5">
                  Admin Security Password
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

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#1E1915] hover:bg-[#2C241E] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-lock-open text-xs text-[#D99B26]"></i>
                <span>Unlock Operations Console</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowDemoHint(!showDemoHint)}
                  className="text-xs text-[#C25E34] hover:underline font-semibold cursor-pointer"
                >
                  {showDemoHint ? 'Hide demo password' : '🔑 Need demo password?'}
                </button>
                {showDemoHint && (
                  <p className="text-xs font-mono text-[#4A423A] bg-[#FAF8F5] p-2 rounded-lg border border-[#EDE8DF] mt-2">
                    Default: <strong>1234567</strong>
                  </p>
                )}
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

                  {/* Nav Item 5: User & Staff Hub */}
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'users'
                        ? 'bg-[#1E1915] text-white shadow-xs'
                        : 'text-[#6B635B] hover:text-[#1E1915] hover:bg-[#F1ECE3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-user-group text-sm"></i>
                      <span>User & Staff Hub</span>
                    </div>
                    {complaints.filter((c) => c.status === 'Pending').length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white">
                        {complaints.filter((c) => c.status === 'Pending').length}
                      </span>
                    )}
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
                <div className="space-y-6 max-w-4xl mx-auto">
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
