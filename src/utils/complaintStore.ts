import { Complaint } from '../types';
import { sendComplaintEmailNotification } from './emailNotifier';

const COMPLAINT_STORAGE_KEY = 'frostys_customer_complaints_v1';

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-101',
    ticketNumber: 'FROSTY-CMP-001',
    customerName: 'Muhammad Hamza',
    customerPhone: '03001234567',
    orderId: 'ORD-1722883921',
    category: 'Late Delivery',
    description: 'Rider took 50 minutes to deliver to Green City Block B instead of 25 mins. The ice cream was slightly soft on top.',
    timestamp: 'Aug 4, 2026, 09:15 PM',
    status: 'Resolved',
    resolutionNotes: 'Issued a Rs. 200 discount coupon on WhatsApp and apologized for the peak hour rider delay.',
  },
  {
    id: 'cmp-102',
    ticketNumber: 'FROSTY-CMP-002',
    customerName: 'Ayesha Malik',
    customerPhone: '03219876543',
    orderId: 'ORD-1722910482',
    category: 'Missing Item',
    description: 'Ordered 2 Kulfa Sundaes and 1 Chocolate Scoop. The extra chocolate syrup bottle was missing in the bag.',
    timestamp: 'Aug 5, 2026, 08:30 PM',
    status: 'In Progress',
    resolutionNotes: 'Contacted customer via phone. Arranged free complimentary topping on next order.',
  },
];

export function getStoredComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(COMPLAINT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COMPLAINTS;
  } catch (err) {
    console.error('Failed to load complaints:', err);
    return INITIAL_COMPLAINTS;
  }
}

export function saveComplaint(
  newComplaintData: Omit<Complaint, 'id' | 'ticketNumber' | 'timestamp' | 'status'>
): { updatedList: Complaint[]; newComplaint: Complaint } {
  const currentList = getStoredComplaints();
  
  const formattedTimestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `FROSTY-CMP-${randomNum}`;

  const newComplaint: Complaint = {
    id: `cmp-${Date.now()}`,
    ticketNumber,
    customerName: newComplaintData.customerName.trim() || 'Valued Customer',
    customerPhone: newComplaintData.customerPhone.trim(),
    orderId: newComplaintData.orderId?.trim() || undefined,
    category: newComplaintData.category,
    description: newComplaintData.description.trim(),
    timestamp: formattedTimestamp,
    status: 'Pending',
  };

  const updatedList = [newComplaint, ...currentList];
  try {
    localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(updatedList));
    // Trigger instant email notification to store owner (owner@frostys.pk)
    sendComplaintEmailNotification(newComplaint).catch((err) => {
      console.warn('Email dispatch warning:', err);
    });
  } catch (err) {
    console.error('Failed to save complaint to localStorage:', err);
  }

  return { updatedList, newComplaint };
}

export function updateComplaintStatus(
  complaintId: string,
  newStatus: Complaint['status'],
  resolutionNotes?: string
): Complaint[] {
  const currentList = getStoredComplaints();
  const updatedList = currentList.map((cmp) => {
    if (cmp.id === complaintId) {
      return {
        ...cmp,
        status: newStatus,
        resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : cmp.resolutionNotes,
      };
    }
    return cmp;
  });

  try {
    localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to update complaint status:', err);
  }

  return updatedList;
}
