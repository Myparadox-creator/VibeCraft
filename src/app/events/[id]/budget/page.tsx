"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  DollarSign,
  Plus,
  Trash2,
  PieChart as PieChartIcon,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Check,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { useEventContext } from "@/context/EventContext";
import { EventHeader } from "@/components/navigation/EventHeader";
import { AICoPilotDrawer } from "@/components/ai/AICoPilotDrawer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, calculateBudgetMetrics } from "@/lib/utils";
import { PaymentStatus, BudgetItem } from "@/types/event";

const COLORS = ["#d946ef", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#64748b"];

export default function EventBudgetPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { events, currentEvent, budgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useEventContext();

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New item form
  const [newCategory, setNewCategory] = useState("Venue & Rentals");
  const [newItemName, setNewItemName] = useState("");
  const [newAllocated, setNewAllocated] = useState<number>(1000);
  const [newActual, setNewActual] = useState<number>(0);
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [newNotes, setNewNotes] = useState("");

  const event = events.find((e) => e.id === eventId) || currentEvent;

  if (!event) return null;

  const { allocated, actual, remaining, percentageSpent, isOverBudget } = calculateBudgetMetrics(
    budgetItems,
    event.total_budget
  );

  // Group by category for Pie Chart
  const categoryMap: Record<string, number> = {};
  budgetItems.forEach((item) => {
    const val = Number(item.actual_amount) || Number(item.allocated_amount) || 0;
    categoryMap[item.category] = (categoryMap[item.category] || 0) + val;
  });

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Bar chart comparison data
  const barData = budgetItems.slice(0, 6).map((item) => ({
    name: item.category.length > 10 ? `${item.category.slice(0, 10)}...` : item.category,
    Allocated: item.allocated_amount,
    Actual: item.actual_amount,
  }));

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addBudgetItem({
      category: newCategory,
      item_name: newItemName,
      allocated_amount: Number(newAllocated) || 0,
      actual_amount: Number(newActual) || 0,
      payment_status: newPaymentStatus,
      notes: newNotes,
    });

    setNewItemName("");
    setNewAllocated(1000);
    setNewActual(0);
    setNewNotes("");
    setIsAddModalOpen(false);
  };

  const handleStatusChange = (id: string, current: PaymentStatus) => {
    const next: Record<PaymentStatus, PaymentStatus> = {
      unpaid: "deposit_paid",
      deposit_paid: "paid_in_full",
      paid_in_full: "unpaid",
    };
    updateBudgetItem(id, { payment_status: next[current] });
  };

  return (
    <div>
      <EventHeader event={event} onOpenAIChat={() => setIsAIChatOpen(true)} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Top Ledger Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Financial Ledger & Budget Analytics
            </h2>
            <p className="text-sm text-slate-400">
              Track actual payments, allocated projections, and AI-optimized category limits.
            </p>
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} variant="glow" size="md" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Expense Line</span>
          </Button>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-xs text-slate-400 uppercase font-medium">Total Event Budget</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(event.total_budget, event.currency)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Preset baseline cap</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-xs text-slate-400 uppercase font-medium">Total Allocated</p>
              <p className="text-2xl font-bold text-fuchsia-400 mt-1">
                {formatCurrency(allocated, event.currency)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {allocated > event.total_budget ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Allocated exceeds cap!
                  </span>
                ) : (
                  `${formatCurrency(event.total_budget - allocated, event.currency)} unallocated`
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-xs text-slate-400 uppercase font-medium">Actual Paid Out</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {formatCurrency(actual, event.currency)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{percentageSpent}% of total budget</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-xs text-slate-400 uppercase font-medium">Remaining Liquidity</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  isOverBudget ? "text-rose-400" : "text-amber-400"
                }`}
              >
                {formatCurrency(remaining, event.currency)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {isOverBudget ? "Over budget limit" : "Safe operational buffer"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-800 bg-slate-900/70 p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-fuchsia-400" />
                Category Distribution
              </CardTitle>
              <CardDescription className="text-xs">Relative spend weight across vendors</CardDescription>
            </CardHeader>
            <div className="h-64 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [formatCurrency(Number(val) || 0, event.currency), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  No data to chart yet
                </div>
              )}
            </div>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70 p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Allocated vs Actual Paid
              </CardTitle>
              <CardDescription className="text-xs">
                Budget variance comparison by line item
              </CardDescription>
            </CardHeader>
            <div className="h-64 w-full">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [formatCurrency(Number(val) || 0, event.currency), ""]}
                    />
                    <Bar dataKey="Allocated" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  No data to chart yet
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Detailed Expense Ledger</CardTitle>
              <CardDescription className="text-xs">
                Click payment status to toggle between Unpaid, Deposit Paid, and Paid in Full.
              </CardDescription>
            </div>
            <Badge variant="glow">{budgetItems.length} Line Items</Badge>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-y border-slate-800">
                <tr>
                  <th className="px-4 py-3">Category & Item</th>
                  <th className="px-4 py-3">Allocated</th>
                  <th className="px-4 py-3">Actual Paid</th>
                  <th className="px-4 py-3">Variance</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {budgetItems.map((item) => {
                  const variance = (item.allocated_amount || 0) - (item.actual_amount || 0);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-100 block">{item.item_name}</span>
                        <span className="text-[11px] text-fuchsia-400">{item.category}</span>
                        {item.notes && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs mt-0.5">
                            {item.notes}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-300">
                        {formatCurrency(item.allocated_amount, event.currency)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-100">
                        {formatCurrency(item.actual_amount, event.currency)}
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        <span className={variance >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {variance >= 0 ? "+" : ""}
                          {formatCurrency(variance, event.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleStatusChange(item.id, item.payment_status)}
                          className="focus:outline-none"
                        >
                          <Badge
                            variant={
                              item.payment_status === "paid_in_full"
                                ? "success"
                                : item.payment_status === "deposit_paid"
                                ? "warning"
                                : "secondary"
                            }
                            className="cursor-pointer hover:opacity-80 capitalize"
                          >
                            {item.payment_status.replace(/_/g, " ")}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => deleteBudgetItem(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Line Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Expense Line"
        description="Insert an allocated or actual expenditure line into your event ledger."
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Category</label>
            <select
              aria-label="Expense Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="Venue & Rentals">Venue & Rentals</option>
              <option value="Catering & Bar">Catering & Bar</option>
              <option value="Photography & Film">Photography & Film</option>
              <option value="Florals & Decor">Florals & Decor</option>
              <option value="Music & Entertainment">Music & Entertainment</option>
              <option value="Attire & Beauty">Attire & Beauty</option>
              <option value="Stationery & Invites">Stationery & Invites</option>
              <option value="Contingency & Tips">Contingency & Tips</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Item Name</label>
            <Input
              required
              placeholder="e.g. Acoustic Guitar Ceremony Duo"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Allocated Budget</label>
              <Input
                type="number"
                min={0}
                value={newAllocated}
                onChange={(e) => setNewAllocated(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Actual Paid</label>
              <Input
                type="number"
                min={0}
                value={newActual}
                onChange={(e) => setNewActual(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Payment Status</label>
            <select
              aria-label="Payment Status"
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="unpaid">Unpaid</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="paid_in_full">Paid in Full</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Notes / Due Date</label>
            <Input
              placeholder="e.g. Balance due 14 days before ceremony"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow">
              Add Expense
            </Button>
          </div>
        </form>
      </Modal>

      <AICoPilotDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        event={event}
      />
    </div>
  );
}
