export interface MenuItem {
  id: string;
  name: string;
  category: 'sundaes' | 'shakes' | 'waffles' | 'scoops' | 'brownies' | 'combos';
  price: number; // In PKR
  description: string;
  image: string;
  popular?: boolean;
  badge?: string;
  rating?: number;
  calories?: string;
  unit?: string;
  stock?: number;
  tags?: string[];
  customizations?: {
    name: string;
    options: { label: string; price: number }[];
  }[];
}

export interface Category {
  id: 'all' | 'sundaes' | 'shakes' | 'waffles' | 'scoops' | 'brownies' | 'combos';
  name: string;
  icon: string;
  description: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedOptions?: { [key: string]: string };
  totalPrice: number;
}

export interface OrderRecord {
  id: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  address?: string;
  orderType: 'delivery' | 'takeaway' | 'dinein';
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    unit?: string;
  }[];
  totalAmount: number;
  status: 'Received (WhatsApp)' | 'Confirmed' | 'Preparing' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  favItem: string;
  tag: string;
}
