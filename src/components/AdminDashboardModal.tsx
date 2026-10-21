import React from 'react';
import { MenuItem, OrderRecord, Review, Complaint } from '../types';
import { ExecutiveConsole } from './admin/ExecutiveConsole';

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

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = (props) => {
  return <ExecutiveConsole {...props} />;
};
