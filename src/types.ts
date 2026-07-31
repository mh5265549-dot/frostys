export interface MenuItem {
  id: string;
  name: string;
  category: 'scoops' | 'sundaes' | 'deals' | 'shakes' | 'kulfi' | 'coffees' | 'sodas';
  price: number; // In PKR
  originalPrice?: number; // Original PKR price before discount
  description: string;
  image: string;
  popular?: boolean;
  badge?: string;
  rating?: number;
  calories?: string;
  unit?: string;
  stock?: number;
  tags?: string[];
  variants?: { name: string; price: number; scoopsCount?: number }[];
  allowFlavors?: boolean;
  maxFlavors?: number;
  allowSodas?: boolean;
  maxSodas?: number;
  customizations?: {
    name: string;
    options: { label: string; price: number }[];
  }[];
}

export interface Category {
  id: 'all' | 'scoops' | 'sundaes' | 'deals' | 'shakes' | 'kulfi' | 'coffees' | 'sodas';
  name: string;
  icon: string;
  description: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedVariant?: { name: string; price: number; scoopsCount?: number };
  selectedFlavors?: string[];
  selectedSodas?: string[];
  selectedSyrups?: string[];
  selectedToppings?: { name: string; price: number }[];
  customInstructions?: string;
  extraCharges?: number;
  unitPrice: number;
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
    customizationsText?: string;
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
