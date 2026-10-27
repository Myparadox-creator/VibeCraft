"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  HeartHandshake,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  CheckSquare,
  Sparkles,
  UserCheck,
  FileText,
  DollarSign,
} from "lucide-react";
import { useEventContext } from "@/context/EventContext";
import { EventHeader } from "@/components/navigation/EventHeader";
import { AICoPilotDrawer } from "@/components/ai/AICoPilotDrawer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { VendorStatus, VendorTask } from "@/types/event";

export default function EventVendorsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { events, currentEvent, vendors, updateVendorStatus, toggleVendorTask, addVendor } = useEventContext();

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // New vendor form
  const [category, setCategory] = useState("Catering & Bar");
  const [vendorName, setVendorName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contractStatus, setContractStatus] = useState<VendorStatus>("prospect");
  const [estimatedCost, setEstimatedCost] = useState<number>(3000);
  const [notes, setNotes] = useState("");

  const event = events.find((e) => e.id === eventId) || currentEvent;

  if (!event) return null;

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) return;

    addVendor({
      category,
      vendor_name: vendorName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      contract_status: contractStatus,
      estimated_cost: Number(estimatedCost) || 0,
      notes,
      checklist_tasks: [
        { id: `t-1-${Date.now()}`, text: "Initial intro & availability check", done: true },
        { id: `t-2-${Date.now()}`, text: "Request itemized contract & deposit terms", done: false },
        { id: `t-3-${Date.now()}`, text: "Confirm day-of load-in & certificate of insurance", done: false },
      ],
    });

    setVendorName("");
    setContactEmail("");
    setContactPhone("");
    setNotes("");
    setIsAddModalOpen(false);
  };

  const bookedCount = vendors.filter((v) => v.contract_status === "booked").length;
  const quotedCount = vendors.filter((v) => v.contract_status === "quoted").length;

  const categories = ["all", ...Array.from(new Set(vendors.map((v) => v.category)))];

  const filteredVendors = vendors.filter((v) => {
    if (filterCategory === "all") return true;
    return v.category === filterCategory;
  });

  return (
    <div>
      <EventHeader event={event} onOpenAIChat={() => setIsAIChatOpen(true)} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Vendor CRM & Execution Checklists
            </h2>
            <p className="text-sm text-slate-400">
              Track vendor proposals, signed agreements, contact details, and contract deliverable checklists.
            </p>
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} variant="glow" size="md" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Vendor Candidate</span>
          </Button>
        </div>

        {/* Status Pipeline Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Total Vendors</span>
            <p className="text-xl font-bold text-white mt-1">{vendors.length}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Booked & Locked</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">{bookedCount}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Awaiting Quotes</span>
            <p className="text-xl font-bold text-amber-400 mt-1">{quotedCount}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Prospects</span>
            <p className="text-xl font-bold text-fuchsia-400 mt-1">
              {vendors.filter((v) => v.contract_status === "prospect").length}
            </p>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-fuchsia-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVendors.map((v) => (
            <Card
              key={v.id}
              className="border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="glow" className="text-[10px]">
                    {v.category}
                  </Badge>

                  {/* Status Dropdown */}
                  <select
                    aria-label="Vendor Contract Status"
                    value={v.contract_status}
                    onChange={(e) => updateVendorStatus(v.id, e.target.value as VendorStatus)}
                    className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 capitalize font-medium focus:ring-1 focus:ring-fuchsia-500"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="booked">Booked (Signed)</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                <CardTitle className="text-xl font-bold text-white mt-2">
                  {v.vendor_name}
                </CardTitle>

                {/* Contact info row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  {v.contact_email && (
                    <a
                      href={`mailto:${v.contact_email}`}
                      className="flex items-center gap-1 hover:text-fuchsia-400"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>{v.contact_email}</span>
                    </a>
                  )}
                  {v.contact_phone && (
                    <a
                      href={`tel:${v.contact_phone}`}
                      className="flex items-center gap-1 hover:text-fuchsia-400"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{v.contact_phone}</span>
                    </a>
                  )}
                </div>

                {v.notes && (
                  <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mt-3 leading-relaxed">
                    💡 {v.notes}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {/* Embedded Checklist */}
                <div className="space-y-1.5 border-t border-slate-800 pt-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    Contract & RFP Action Checklist
                  </span>
                  {v.checklist_tasks.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-start gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none py-1"
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleVendorTask(v.id, task.id)}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-fuchsia-600 focus:ring-fuchsia-500"
                      />
                      <span className={task.done ? "line-through text-slate-500" : ""}>
                        {task.text}
                      </span>
                    </label>
                  ))}
                </div>

                {v.estimated_cost && (
                  <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-800/60">
                    <span className="text-slate-500">Estimated Cost:</span>
                    <span className="font-semibold text-emerald-400">
                      {formatCurrency(v.estimated_cost, event.currency)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Vendor Candidate"
        description="Add a new venue, catering team, photographer, or performer to track in your CRM."
      >
        <form onSubmit={handleCreateVendor} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Category</label>
            <select
              aria-label="Vendor Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="Venue & Rentals">Venue & Rentals</option>
              <option value="Catering & Bar">Catering & Bar</option>
              <option value="Photography & Film">Photography & Film</option>
              <option value="Florals & Decor">Florals & Decor</option>
              <option value="Music & Entertainment">Music & Entertainment</option>
              <option value="Hair & Makeup">Hair & Makeup</option>
              <option value="Transportation">Transportation</option>
              <option value="Other Specialist">Other Specialist</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Vendor Business Name</label>
            <Input
              required
              placeholder="e.g. Luminary String Quartet"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Contact Email</label>
              <Input
                type="email"
                placeholder="contact@vendor.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Contact Phone</label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Initial Pipeline Status</label>
              <select
                aria-label="Initial Pipeline Status"
                value={contractStatus}
                onChange={(e) => setContractStatus(e.target.value as VendorStatus)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              >
                <option value="prospect">Prospect</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="booked">Booked</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Estimated Quote</label>
              <Input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Key Terms / Specific Notes</label>
            <Textarea
              placeholder="e.g. Requires 2 power outlets and shaded tent if outdoors."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow">
              Add to CRM
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
