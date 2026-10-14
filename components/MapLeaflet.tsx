"use client";

import { useEffect, useRef } from "react";

export interface MapItem {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  category?: string;
  commercialScore?: number;
  opportunityLevel?: "ALTA" | "MEDIA" | "BAJA";
  address?: string;
  website?: string;
  phone?: string;
  googleMapsUrl?: string;
  onOpenFicha?: () => void;
  onProspectar?: () => void;
}

interface MapLeafletProps {
  items: MapItem[];
  selectedItem?: MapItem | null;
  onSelectItem?: (item: MapItem) => void;
  center?: [number, number];
  zoom?: number;
}

export default function MapLeaflet({
  items,
  selectedItem,
  onSelectItem,
  center = [-5.5568, -80.8222], // Default Sechura, Piura
  zoom = 13,
}: MapLeafletProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const leafletModuleRef = useRef<any>(null);

  // 1. Initialize map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = leafletModuleRef.current || (await import("leaflet")).default;
      leafletModuleRef.current = L;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center,
          zoom,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Update markers
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = leafletModuleRef.current || (await import("leaflet")).default;
      leafletModuleRef.current = L;
      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;

      markersLayer.clearLayers();
      markersMapRef.current.clear();

      const validItems = items.filter(
        (i) => i.latitude && i.longitude && !isNaN(i.latitude) && !isNaN(i.longitude)
      );

      if (validItems.length === 0) return;

      const latLngs: [number, number][] = [];

      validItems.forEach((item) => {
        const isSelected = selectedItem?.name === item.name;
        const score = item.commercialScore || 50;

        // Visual distinction by opportunity
        const isHigh = score >= 70;
        const isMid = score >= 45 && score < 70;
        const markerColor = isHigh ? "#ef4444" : isMid ? "#2563eb" : "#64748b";
        const badgeLabel = isHigh ? "OPORTUNIDAD ALTA" : isMid ? "MEDIA" : "BAJA";

        const iconHtml = `
          <div style="
            background: ${markerColor};
            width: ${isSelected ? "32px" : "24px"};
            height: ${isSelected ? "32px" : "24px"};
            border-radius: 50%;
            border: 2.5px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${isSelected ? "11px" : "10px"};
            font-weight: 700;
            cursor: pointer;
            transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          ">
            ${score}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-leaflet-marker",
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });

        // Rich Mini Ficha popup
        const popupContent = `
          <div style="font-family: 'Inter', system-ui, sans-serif; font-size: 12px; min-width: 220px; max-width: 280px; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px;">
              <span style="font-weight: 700; color: #0f172a; font-size: 13px; line-height: 1.2;">${item.name}</span>
            </div>
            
            <div style="display: inline-block; background: ${markerColor}15; color: ${markerColor}; border: 1px solid ${markerColor}30; border-radius: 6px; padding: 2px 6px; font-weight: 700; font-size: 10px; margin-bottom: 6px;">
              ${badgeLabel} · Score ${score}/100
            </div>

            <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">
              <b>${item.category || "Negocio"}</b>
            </div>

            <div style="color: #475569; font-size: 11px; margin-bottom: 4px;">
              ${item.address || "Ubicación registrada"}
            </div>

            <div style="color: ${item.phone ? '#047857' : '#94a3b8'}; font-size: 11px; margin-bottom: 4px; font-weight: 500;">
              ${item.phone ? `Teléfono: ${item.phone}` : 'Teléfono: No detectado'}
            </div>

            <div style="color: ${item.website ? '#2563eb' : '#dc2626'}; font-size: 11px; margin-bottom: 8px; font-weight: 500;">
              ${item.website ? `Con sitio web oficial` : 'Sin página web (Oportunidad)'}
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; gap: 6px;">
              ${item.phone ? `
                <a href="https://wa.me/${item.phone.replace(/[^0-9]/g, '')}" target="_blank" style="flex: 1; text-align: center; background: #10b981; color: white; padding: 4px 6px; border-radius: 6px; font-size: 10px; font-weight: bold; text-decoration: none;">
                  WhatsApp
                </a>
              ` : ''}
              ${item.googleMapsUrl ? `
                <a href="${item.googleMapsUrl}" target="_blank" style="flex: 1; text-align: center; background: #f1f5f9; color: #334155; padding: 4px 6px; border-radius: 6px; font-size: 10px; font-weight: bold; text-decoration: none; border: 1px solid #cbd5e1;">
                  Google Maps
                </a>
              ` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          if (onSelectItem) onSelectItem(item);
        });

        markersLayer.addLayer(marker);
        markersMapRef.current.set(item.name, marker);
        latLngs.push([item.latitude, item.longitude]);
      });

      if (latLngs.length > 0 && !selectedItem) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }

    updateMarkers();
  }, [items, selectedItem, onSelectItem]);

  // 3. Pan to selected item
  useEffect(() => {
    if (selectedItem && mapInstanceRef.current && selectedItem.latitude && selectedItem.longitude) {
      mapInstanceRef.current.setView([selectedItem.latitude, selectedItem.longitude], 16, {
        animate: true,
        duration: 0.8,
      });

      const marker = markersMapRef.current.get(selectedItem.name);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedItem]);

  return (
    <div className="relative w-full h-full min-h-[350px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />
      
      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] flex items-center gap-3 shadow-md">
        <span className="flex items-center gap-1.5 font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse"></span> Oportunidad Alta (&gt;70)
        </span>
        <span className="flex items-center gap-1.5 font-bold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Media (45-69)
        </span>
        <span className="flex items-center gap-1.5 font-medium text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> Estándar (&lt;45)
        </span>
      </div>
    </div>
  );
}
