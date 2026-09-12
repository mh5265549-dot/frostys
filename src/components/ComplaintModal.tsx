import React, { useState } from 'react';
import { Complaint } from '../types';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitComplaint: (
    newComplaint: Omit<Complaint, 'id' | 'ticketNumber' | 'timestamp' | 'status'>
  ) => { ticketNumber: string };
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmitComplaint,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [category, setCategory] = useState<Complaint['category']>('Food Quality & Taste');
  const [description, setDescription] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Please enter your name so our store manager can contact you.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMsg('Please enter a valid phone or WhatsApp number.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg('Please provide a brief description of the issue (at least 10 characters).');
      return;
    }

    const { ticketNumber } = onSubmitComplaint({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderId: orderId.trim() || undefined,
      category,
      description: description.trim(),
    });

    setSubmittedTicket(ticketNumber);
  };

  const handleCloseAndReset = () => {
    setSubmittedTicket(null);
    setCustomerName('');
    setCustomerPhone('');
    setOrderId('');
    setCategory('Food Quality & Taste');
    setDescription('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-stone-900 w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 text-lg font-bold shadow-2xs">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-stone-900">
                Register a Complaint
              </h3>
              <p className="text-xs text-stone-500">
                We take quality seriously. Let us resolve your issue right away.
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {submittedTicket ? (
            <div className="py-8 text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-2xs">
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600">
                  Complaint Received
                </span>
                <h4 className="font-heading font-black text-2xl text-stone-900">
                  Ticket #{submittedTicket}
                </h4>
              </div>
              <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200">
                Thank you, <strong>{customerName}</strong>. Your complaint has been logged, saved in the Admin Panel, and an <strong>instant email notification</strong> has been dispatched to store management (<code>owner@frostys.pk</code>). We will contact you at <strong>{customerPhone}</strong> shortly.
              </p>
              <button
                onClick={handleCloseAndReset}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Complaint Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Complaint['category'])}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF4B72] cursor-pointer"
                >
                  <option value="Late Delivery">🚀 Late Delivery / Cold Food</option>
                  <option value="Food Quality & Taste">🍨 Food Quality & Taste Issue</option>
                  <option value="Missing Item">📦 Missing Item in Order</option>
                  <option value="Incorrect Order">❌ Incorrect Item Delivered</option>
                  <option value="Packaging / Spills">🍧 Packaging Damage or Melted</option>
                  <option value="Staff / Service Behavior">👨‍🍳 Staff or Rider Behavior</option>
                  <option value="Other">💬 Other Issue</option>
                </select>
              </div>

              {/* Name & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Usman Chaudhry"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                  />
                </div>
              </div>

              {/* Order ID (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Order ID / Receipt #</span>
                  <span className="text-[10px] text-stone-400 normal-case">(Optional, if available)</span>
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-1722883921"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Describe the Issue <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what went wrong so we can investigate and fix it immediately..."
                  className="w-full px-3.5 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B72]"
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-rose-500 text-sm shrink-0"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseAndReset}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF4B72] hover:bg-[#E63956] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Submit Formal Complaint</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
