import React, { useState } from 'react';
import { ExpenseRecord } from '../../types';
import {
  getStoredExpenses,
  addExpenseRecord,
  deleteExpenseRecord,
} from '../../utils/costAndFinance';

interface ExpenseTrackerProps {
  grossProfit: number;
  onExpensesChanged?: () => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  grossProfit,
  onExpensesChanged,
}) => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => getStoredExpenses());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseRecord['category']>('Rent');
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newPaidBy, setNewPaidBy] = useState('Cash');
  const [newNotes, setNewNotes] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || typeof newAmount !== 'number' || newAmount <= 0) return;

    const updated = addExpenseRecord({
      title: newTitle.trim(),
      category: newCategory,
      amount: newAmount,
      date: newDate,
      paidBy: newPaidBy,
      notes: newNotes.trim(),
    });

    setExpenses(updated);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewAmount('');
    setNewNotes('');
    if (onExpensesChanged) onExpensesChanged();
  };

  const [deletingExpense, setDeletingExpense] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (id: string, title: string) => {
    setDeletingExpense({ id, title });
  };

  const confirmDeleteExpense = () => {
    if (!deletingExpense) return;
    const updated = deleteExpenseRecord(deletingExpense.id);
    setExpenses(updated);
    setDeletingExpense(null);
    if (onExpensesChanged) onExpensesChanged();
  };

  // Calculations
  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategoryFilter !== 'all' && e.category !== selectedCategoryFilter) return false;
    return true;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = grossProfit - totalExpenses;

  // Breakdown by category
  const categoryTotals: Record<string, number> = {};
  for (const exp of expenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  }

  return (
    <div className="space-y-6 animate-panel-enter">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#140D0C] p-4 sm:p-5 rounded-2xl border border-stone-800">
        <div>
          <h3 className="font-heading font-black text-lg sm:text-xl text-amber-100 flex items-center gap-2">
            <i className="fa-solid fa-file-invoice-dollar text-amber-400"></i>
            <span>Operational Overhead & Expense Tracker</span>
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl">
            Track fixed and recurring restaurant overheads (Green City shop rent, staff wages, LESCO electricity for freezers, and gas/charcoal) to calculate true <strong>Net Operating Profit</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-stone-950 font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Log New Expense</span>
        </button>
      </div>

      {/* True Bottom-Line Operating Profit KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Gross Profit Before Overheads */}
        <div className="p-4 rounded-2xl bg-[#1C1210] border border-amber-900/50">
          <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
            Total Gross Profit (Revenue - COGS)
          </span>
          <div className="font-heading font-black text-2xl text-amber-300">
            Rs. {grossProfit.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Material margin available to cover operations
          </p>
        </div>

        {/* Total Operational Overheads */}
        <div className="p-4 rounded-2xl bg-[#20151a] border border-rose-950">
          <span className="text-[10px] uppercase font-bold text-rose-300 block mb-1">
            Total Operational Overheads
          </span>
          <div className="font-heading font-black text-2xl text-rose-300">
            Rs. {totalExpenses.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            {expenses.length} logged expense items (Rent, Payroll, Utilities)
          </p>
        </div>

        {/* True Net Operating Profit */}
        <div
          className={`p-4 rounded-2xl border ${
            netOperatingProfit >= 0
              ? 'bg-[#14231b] border-emerald-500/60 shadow-lg shadow-emerald-950/30'
              : 'bg-[#291418] border-rose-600/60 shadow-lg shadow-rose-950/30'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span
              className={`font-black uppercase tracking-wider text-[10px] ${
                netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              True Net Operating Profit
            </span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                netOperatingProfit >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
              }`}
            >
              BOTTOM LINE
            </span>
          </div>
          <div
            className={`font-heading font-black text-2xl sm:text-3xl ${
              netOperatingProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            Rs. {netOperatingProfit.toLocaleString()}
          </div>
          <p className="text-[11px] text-stone-300 mt-1">
            {netOperatingProfit >= 0
              ? 'Business operating in net surplus after all expenses'
              : 'Overheads currently exceed sales margin'}
          </p>
        </div>
      </div>

      {/* Expense Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { key: 'Rent', icon: 'fa-building', label: 'Rent' },
          { key: 'Staff Wages', icon: 'fa-users', label: 'Salaries' },
          { key: 'Utilities (Electricity & Gas)', icon: 'fa-bolt', label: 'Utilities' },
          { key: 'Generator Fuel', icon: 'fa-gas-pump', label: 'Gen Fuel' },
          { key: 'Packaging & Disposables', icon: 'fa-box-open', label: 'Packaging' },
          { key: 'Maintenance & Repairs', icon: 'fa-wrench', label: 'Repairs' },
        ].map((cat) => (
          <div
            key={cat.key}
            onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat.key ? 'all' : cat.key)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              selectedCategoryFilter === cat.key
                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                : 'bg-[#140D0C] border-stone-800 hover:border-stone-700 text-stone-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
              <i className={`fa-solid ${cat.icon} text-amber-400 text-[10px]`}></i>
              <span className="font-bold truncate">{cat.label}</span>
            </div>
            <div className="font-mono font-black text-sm text-stone-100">
              Rs. {(categoryTotals[cat.key] || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Expense Records List */}
      <div className="bg-[#140D0C] rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="font-heading font-black text-sm text-stone-100">
              Logged Overheads & Outflows
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
              {filteredExpenses.length} Records
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Filter Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-300 focus:outline-none"
            >
              <option value="all">All Overheads</option>
              <option value="Rent">Rent</option>
              <option value="Staff Wages">Staff Wages</option>
              <option value="Utilities (Electricity & Gas)">Utilities (Electricity & Gas)</option>
              <option value="Generator Fuel">Generator Fuel</option>
              <option value="Packaging & Disposables">Packaging & Disposables</option>
              <option value="Maintenance & Repairs">Maintenance & Repairs</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#1C1210] text-[11px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-medium">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#1A1110] transition-colors">
                  <td className="py-3 px-4 font-mono text-stone-400 whitespace-nowrap">
                    {exp.date}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-heading font-black text-stone-100 block">
                      {exp.title}
                    </span>
                    {exp.notes && (
                      <span className="text-[11px] text-stone-400 block truncate max-w-md">
                        {exp.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-[10px] font-bold text-amber-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-400">{exp.paidBy || 'Cash'}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-rose-300 text-sm whitespace-nowrap">
                    Rs. {exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(exp.id, exp.title)}
                      className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-300 border border-stone-800 hover:border-rose-800 transition-colors cursor-pointer inline-flex items-center justify-center"
                      title="Delete expense record"
                    >
                      <i className="fa-solid fa-trash text-[11px]"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#181110] text-stone-100 w-full max-w-md rounded-3xl border border-amber-500/50 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h4 className="font-heading font-black text-base text-amber-200">
                  Log Restaurant Operational Expense
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Record fixed rent, staff payroll, utilities, or maintenance
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Expense Title / Payee *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. LESCO Electricity Bill for Freezers & AC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ExpenseRecord['category'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Rent">Rent (Green City)</option>
                    <option value="Staff Wages">Staff Wages</option>
                    <option value="Utilities (Electricity & Gas)">Utilities (Electricity & Gas)</option>
                    <option value="Generator Fuel">Generator Fuel</option>
                    <option value="Packaging & Disposables">Packaging & Disposables</option>
                    <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="50"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 48000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-mono font-bold text-rose-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={newPaidBy}
                    onChange={(e) => setNewPaidBy(e.target.value)}
                    placeholder="Cash / Bank Transfer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Operational Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Paid to commercial landlord for month of October"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-stone-950 font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1C1210] text-stone-100 w-full max-w-sm rounded-3xl border border-rose-500/50 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-trash"></i>
            </div>
            <div className="text-center">
              <h4 className="font-heading font-black text-base text-rose-200">
                Delete Expense Record?
              </h4>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed font-mono">
                "{deletingExpense.title}"
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteExpense}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
