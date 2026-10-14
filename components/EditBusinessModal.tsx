"use client";

import { useState, useEffect } from "react";
import {
  X,
  Save,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  FileText,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "@/components/ToastContext";

interface EditBusinessModalProps {
  business: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedBusiness: any) => void;
  onDeleted?: (id: string) => void;
}

const CRM_STAGES = [
  { id: "NUEVO", label: "Nuevo" },
  { id: "CONTACTADO", label: "Contactado" },
  { id: "INTERESADO", label: "Interesado" },
  { id: "COTIZACION", label: "Cotización" },
  { id: "SEGUIMIENTO", label: "Seguimiento" },
  { id: "GANADO", label: "Ganado" },
  { id: "PERDIDO", label: "Perdido" },
];

export default function EditBusinessModal({
  business,
  isOpen,
  onClose,
  onSaved,
  onDeleted,
}: EditBusinessModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    priority: "MEDIA",
    crmStatus: "NUEVO",
    assignedTo: "Sin asignar",
    nextFollowUp: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        category: business.category || "",
        phone: business.phone || "",
        email: business.email || "",
        website: business.website || "",
        address: business.address || "",
        city: business.city || "",
        priority: business.priority || "MEDIA",
        crmStatus: business.crmStatus || "NUEVO",
        assignedTo: business.assignedTo || "Sin asignar",
        nextFollowUp: (() => {
          if (!business.nextFollowUp) return "";
          try {
            const d = new Date(business.nextFollowUp);
            return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
          } catch {
            return "";
          }
        })(),
        notes: business.notes || "",
      });
      setError(null);
    }
  }, [business]);

  if (!isOpen || !business) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("El nombre del negocio es obligatorio.");
      toast.warning("Esta acción requiere información adicional.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          website: formData.website.trim() || null,
          address: formData.address.trim() || null,
          city: formData.city.trim() || null,
          priority: formData.priority,
          crmStatus: formData.crmStatus,
          assignedTo: formData.assignedTo.trim() || "Sin asignar",
          nextFollowUp: formData.nextFollowUp ? formData.nextFollowUp : null,
          notes: formData.notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.business) {
        toast.success("Registro actualizado correctamente.");
        onSaved(data.business);
        onClose();
      } else {
        setError(data.error || "Error al guardar cambios.");
        toast.error("No se pudo guardar los cambios.");
      }
    } catch (err: any) {
      setError(err.message || "Error de red al actualizar.");
      toast.error("No se pudo guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              <Pencil className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Editar Datos del Prospecto
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Actualiza la información comercial y de contacto en el CRM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-slate-700">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grid 2 Columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Nombre de la Empresa / Negocio *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej. Inversiones del Norte S.A.C."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            {/* Rubro */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold">Rubro / Categoría</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej. Restaurante, Ferretería, Hotel..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Teléfono / WhatsApp</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej. 987654321 o +51 987..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Correo Electrónico */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>Correo Electrónico</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@empresa.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Sitio Web */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Sitio Web</span>
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://empresa.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Dirección */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Dirección</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Av. Principal 123..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Ciudad */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold">Ciudad / Distrito</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Piura, Sechura, Lima..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Estado CRM */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold">Estado del Pipeline CRM</label>
              <select
                value={formData.crmStatus}
                onChange={(e) => setFormData({ ...formData, crmStatus: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                {CRM_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prioridad */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold">Prioridad Comercial</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>

            {/* Próximo Seguimiento */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Fecha de Próximo Seguimiento</span>
              </label>
              <input
                type="date"
                value={formData.nextFollowUp}
                onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Notas Internas */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-700 font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Notas Comerciales / Observaciones</span>
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detalles de contacto, requerimientos específicos, comentarios..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
            {onDeleted ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm("¿Estás seguro de eliminar este prospecto del CRM?")) {
                    onDeleted(business.id);
                    onClose();
                  }
                }}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Prospecto</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
