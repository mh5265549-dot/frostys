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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#2D1B18] text-white w-full max-w-lg rounded-3xl border border-red-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#3D2522] to-[#2D1B18] border-b border-[#52332E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xl font-bold">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-amber-50">
                Register a Complaint
              </h3>
              <p className="text-xs text-amber-200/70">
                We take quality seriously. Let us resolve your issue right away.
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="w-8 h-8 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {submittedTicket ? (
            <div className="py-8 text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-3xl mx-auto">
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                  Complaint Received
                </span>
                <h4 className="font-heading font-extrabold text-2xl text-amber-50">
                  Ticket #{submittedTicket}
                </h4>
              </div>
              <p className="text-xs text-amber-100/80 max-w-sm mx-auto leading-relaxed bg-[#3D2522]/60 p-4 rounded-2xl border border-[#52332E]">
                Thank you, <strong>{customerName}</strong>. Your complaint has been logged, saved in the Admin Panel, and an <strong>instant email notification</strong> has been dispatched to store owner (<code>owner@frostys.pk</code>). We will contact you at <strong>{customerPhone}</strong> shortly.
              </p>
              <button
                onClick={handleCloseAndReset}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-lg transition-all"
              >
                Done / Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                  Complaint Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Complaint['category'])}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1A100E] border border-[#52332E] text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  <label className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Usman Chaudhry"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A100E] border border-[#52332E] text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                    Phone / WhatsApp <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A100E] border border-[#52332E] text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Order ID (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-100 uppercase tracking-wider flex items-center justify-between">
                  <span>Order ID / Receipt #</span>
                  <span className="text-[10px] text-amber-200/50 normal-case">(Optional, if available)</span>
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-1722883921"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A100E] border border-[#52332E] text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                  Describe the Issue <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what went wrong so we can investigate and fix it..."
                  className="w-full px-3.5 py-3 rounded-xl bg-[#1A100E] border border-[#52332E] text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/90 border border-red-700 text-red-200 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-red-400 text-sm shrink-0"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseAndReset}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-100 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
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
