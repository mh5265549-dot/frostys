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
  defaultFlavor?: string;
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
  selectedContainer?: 'Cone' | 'Cup';
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

export interface Complaint {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  orderId?: string;
  category: 'Late Delivery' | 'Food Quality & Taste' | 'Missing Item' | 'Incorrect Order' | 'Staff / Service Behavior' | 'Packaging / Spills' | 'Other';
  description: string;
  timestamp: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  resolutionNotes?: string;
}

