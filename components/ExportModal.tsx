"use client";

import { useState } from "react";
import { X, Check, Download, FileSpreadsheet } from "lucide-react";
import { ExcelIcon } from "@/components/RealisticIcons";
import { toast } from "@/components/ToastContext";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  selectedItems?: any[];
}

const AVAILABLE_COLUMNS = [
  { key: "name", label: "Nombre", defaultChecked: true },
  { key: "category", label: "Rubro / Categoría", defaultChecked: true },
  { key: "address", label: "Dirección", defaultChecked: true },
  { key: "phone", label: "Teléfono", defaultChecked: true },
  { key: "whatsapp", label: "WhatsApp", defaultChecked: true },
  { key: "email", label: "Correo Electrónico", defaultChecked: true },
  { key: "website", label: "Sitio Web", defaultChecked: true },
  { key: "instagram", label: "Instagram", defaultChecked: true },
  { key: "facebook", label: "Facebook", defaultChecked: true },
  { key: "rating", label: "Rating / Reseñas", defaultChecked: true },
  { key: "commercialScore", label: "Score Comercial", defaultChecked: true },
  { key: "opportunityLevel", label: "Nivel de Oportunidad", defaultChecked: true },
  { key: "crmStatus", label: "Estado CRM", defaultChecked: true },
  { key: "notes", label: "Notas / Bitácora", defaultChecked: true },
];

export default function ExportModal({
  isOpen,
  onClose,
  items,
  selectedItems = [],
}: ExportModalProps) {
  const [columns, setColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter((c) => c.defaultChecked).map((c) => c.key)
  );
  const [exportScope, setExportScope] = useState<"all" | "selected">(
    selectedItems.length > 0 ? "selected" : "all"
  );
  const [downloading, setDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  function toggleColumn(key: string) {
    if (columns.includes(key)) {
      if (columns.length > 1) {
        setColumns(columns.filter((c) => c !== key));
      }
    } else {
      setColumns([...columns, key]);
    }
  }

  function handleSelectAllColumns() {
    setColumns(AVAILABLE_COLUMNS.map((c) => c.key));
  }

  async function triggerExport(format: "excel" | "csv") {
    const dataToExport = exportScope === "selected" && selectedItems.length > 0 ? selectedItems : items;
    if (dataToExport.length === 0) {
      toast.warning("Esta acción requiere información adicional.");
      return;
    }

    setDownloading(true);
    try {
      const endpoint = format === "excel" ? "/api/export/excel" : "/api/export/csv";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businesses: dataToExport,
          columns,
        }),
      });

      if (!res.ok) throw new Error("Error en la descarga");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "excel" 
        ? `Radar_Clientes_${new Date().toISOString().split("T")[0]}.xlsx` 
        : `Radar_Clientes_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Archivo exportado correctamente.");
      onClose();
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Ocurrió un error al procesar la solicitud.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <ExcelIcon className="w-6 h-6" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Configurar Exportación</h2>
              <p className="text-xs text-slate-500">Selecciona las columnas y alcance de datos</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Alcance: Seleccionados vs Todos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Alcance de la exportación:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportScope("all")}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  exportScope === "all"
                    ? "border-blue-600 bg-blue-50/60 text-blue-900 font-bold"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Exportar Todos</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    {items.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-normal">Todos los prospectos en vista</p>
              </button>

              <button
                type="button"
                onClick={() => setExportScope("selected")}
                disabled={selectedItems.length === 0}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  selectedItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                } ${
                  exportScope === "selected"
                    ? "border-blue-600 bg-blue-50/60 text-blue-900 font-bold"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Exportar Seleccionados</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    {selectedItems.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-normal">
                  {selectedItems.length > 0 ? `${selectedItems.length} seleccionados con checkbox` : "Sin selección"}
                </p>
              </button>
            </div>
          </div>

          {/* Columnas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Columnas a incluir ({columns.length}/{AVAILABLE_COLUMNS.length}):
              </label>
              <button
                type="button"
                onClick={handleSelectAllColumns}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Marcar todas
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {AVAILABLE_COLUMNS.map((col) => {
                const isChecked = columns.includes(col.key);
                return (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 text-xs p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors text-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className={isChecked ? "font-semibold" : "text-slate-500"}>{col.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerExport("csv")}
              disabled={downloading}
              className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV (Excel)</span>
            </button>

            <button
              onClick={() => triggerExport("excel")}
              disabled={downloading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all hover:scale-102"
            >
              <ExcelIcon className="w-4 h-4" />
              <span>{downloading ? "Generando..." : "Descargar Excel (.xlsx)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
