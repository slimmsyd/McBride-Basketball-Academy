"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import {
  getAllSessionTypes,
  createSessionType,
  updateSessionType,
  toggleSessionTypeActive,
} from "@/lib/admin-actions";

type SessionType = {
  id: string;
  name: string;
  grade: string;
  defaultTime: string;
  durationMinutes: number;
  price: number;
  capacity: number;
  color: string;
  active: boolean;
  sortOrder: number;
};

const EMPTY_FORM = {
  name: "",
  grade: "",
  defaultTime: "",
  price: 20,
  capacity: 10,
  color: "#2979FF",
};

export default function AdminProgramsPage() {
  const [types, setTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    const data = await getAllSessionTypes();
    setTypes(data.map((t) => ({ ...t, price: Number(t.price) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (t: SessionType) => {
    setCreating(false);
    setEditingId(t.id);
    setForm({
      name: t.name,
      grade: t.grade,
      defaultTime: t.defaultTime,
      price: t.price,
      capacity: t.capacity,
      color: t.color,
    });
  };

  const handleCreate = () => {
    setEditingId(null);
    setCreating(true);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (creating) {
      await createSessionType({
        ...form,
        durationMinutes: 60,
        sortOrder: types.length + 1,
      });
    } else if (editingId) {
      await updateSessionType(editingId, form);
    }
    setEditingId(null);
    setCreating(false);
    setForm(EMPTY_FORM);
    await load();
  };

  const handleToggle = async (id: string) => {
    await toggleSessionTypeActive(id);
    await load();
  };

  const handleCancel = () => {
    setEditingId(null);
    setCreating(false);
    setForm(EMPTY_FORM);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#2979FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-headline)] text-2xl font-extrabold text-[#18181B]">
          Session Types
        </h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#2979FF] text-white font-[family-name:var(--font-body)] text-sm font-semibold hover:bg-[#2979FF]/90 transition-colors"
        >
          <Plus size={16} />
          Create Session Type
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <FormCard
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onCancel={handleCancel}
          title="New Session Type"
        />
      )}

      {/* Session type cards */}
      <div className="flex flex-col gap-3">
        {types.map((t) =>
          editingId === t.id ? (
            <FormCard
              key={t.id}
              form={form}
              setForm={setForm}
              onSave={handleSave}
              onCancel={handleCancel}
              title={`Edit: ${t.name}`}
            />
          ) : (
            <div
              key={t.id}
              className={`flex items-center justify-between p-5 bg-white rounded-xl border border-[#E4E4E7] ${
                !t.active ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <div className="flex flex-col gap-1">
                  <span className="font-[family-name:var(--font-headline)] text-base font-bold text-[#18181B]">
                    {t.name}
                  </span>
                  <span className="font-[family-name:var(--font-body)] text-sm text-[#52525B]">
                    {t.grade} &middot; {t.defaultTime} &middot; {t.capacity} cap &middot; ${t.price}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(t.id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full font-[family-name:var(--font-body)] ${
                    t.active
                      ? "bg-[#22C55E]/10 text-[#22C55E]"
                      : "bg-[#A1A1AA]/10 text-[#A1A1AA]"
                  }`}
                >
                  {t.active ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => handleEdit(t)}
                  className="font-[family-name:var(--font-body)] text-sm font-medium text-[#2979FF] hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function FormCard({
  form,
  setForm,
  onSave,
  onCancel,
  title,
}: {
  form: typeof EMPTY_FORM;
  setForm: (f: typeof EMPTY_FORM) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#2979FF] p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-headline)] text-base font-bold text-[#18181B]">
          {title}
        </span>
        <button onClick={onCancel} className="text-[#A1A1AA] hover:text-[#18181B]">
          <X size={18} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. MIDDLE SCHOOL TRAINING" />
        <Field label="Grade" value={form.grade} onChange={(v) => setForm({ ...form, grade: v })} placeholder="e.g. 6th – 8th Grade" />
        <Field label="Default Time" value={form.defaultTime} onChange={(v) => setForm({ ...form, defaultTime: v })} placeholder="e.g. 5:00 PM – 6:00 PM" />
        <Field label="Price ($)" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) || 0 })} type="number" />
        <Field label="Capacity" value={String(form.capacity)} onChange={(v) => setForm({ ...form, capacity: Number(v) || 0 })} type="number" />
        <div className="flex flex-col gap-1.5">
          <label className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-[#52525B]">Color</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full h-10 rounded-lg border border-[#E4E4E7] cursor-pointer"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-2">
        <button
          onClick={onCancel}
          className="h-9 px-5 rounded-lg border border-[#E4E4E7] font-[family-name:var(--font-body)] text-sm font-medium text-[#52525B] hover:bg-[#F4F4F5] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!form.name || !form.grade || !form.defaultTime}
          className="h-9 px-5 rounded-lg bg-[#2979FF] text-white font-[family-name:var(--font-body)] text-sm font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-[family-name:var(--font-body)] text-[13px] font-semibold text-[#52525B]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3.5 bg-[#F4F4F5] rounded-lg border border-[#E4E4E7] text-sm font-[family-name:var(--font-body)] text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#2979FF] transition-colors"
      />
    </div>
  );
}
