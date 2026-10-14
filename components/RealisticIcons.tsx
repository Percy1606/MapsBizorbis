import React from "react";

// 1. Icono realista de Microsoft Excel (Verde corporativo con relieve y "X" característica)
export function ExcelIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="excel-grad-back" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#107C41" />
          <stop offset="100%" stopColor="#0A5A2F" />
        </linearGradient>
        <linearGradient id="excel-grad-front" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#185C37" />
          <stop offset="100%" stopColor="#107C41" />
        </linearGradient>
        <filter id="excel-shadow" x="-2" y="-2" width="24" height="24" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Hoja de cálculo de fondo */}
      <rect x="7" y="3" width="21" height="26" rx="2.5" fill="url(#excel-grad-back)" />
      {/* Cuadrícula de tabla interior */}
      <rect x="14" y="8" width="11" height="3" rx="0.5" fill="#33C481" opacity="0.9" />
      <rect x="14" y="13" width="11" height="3" rx="0.5" fill="#FFFFFF" opacity="0.85" />
      <rect x="14" y="18" width="11" height="3" rx="0.5" fill="#FFFFFF" opacity="0.85" />
      <rect x="14" y="23" width="11" height="3" rx="0.5" fill="#FFFFFF" opacity="0.85" />
      {/* Cuadro frontal flotante con la 'X' */}
      <rect x="4" y="8" width="15" height="16" rx="2" fill="url(#excel-grad-front)" filter="url(#excel-shadow)" />
      <path
        d="M8.2 12.2L10.7 16L8 19.8H9.8L11.5 17.2L13.2 19.8H15L12.3 16L14.8 12.2H13L11.5 14.6L10 12.2H8.2Z"
        fill="#FFFFFF"
        fontWeight="bold"
      />
    </svg>
  );
}

// 2. Icono realista de WhatsApp (Esfera verde con degradado, sombra interior y teléfono blanco)
export function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wa-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#29E267" />
          <stop offset="60%" stopColor="#25D366" />
          <stop offset="100%" stopColor="#128C7E" />
        </linearGradient>
        <filter id="wa-shadow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#128C7E" floodOpacity="0.35" />
        </filter>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#wa-grad)" filter="url(#wa-shadow)" />
      <path
        d="M16 6.5C10.75 6.5 6.5 10.75 6.5 16C6.5 17.85 7.02 19.6 7.95 21.1L6.75 25.5L11.25 24.32C12.7 25.18 14.32 25.5 16 25.5C21.25 25.5 25.5 21.25 25.5 16C25.5 10.75 21.25 6.5 16 6.5ZM21.2 19.8C20.98 20.42 20.12 20.95 19.45 21.08C18.98 21.17 18.38 21.23 16.32 20.38C13.68 19.29 12 16.6 11.87 16.42C11.75 16.25 10.8 14.98 10.8 13.67C10.8 12.35 11.47 11.72 11.73 11.45C11.95 11.22 12.3 11.12 12.63 11.12C12.73 11.12 12.83 11.12 12.92 11.13C13.18 11.15 13.32 11.17 13.48 11.57C13.7 12.1 14.23 13.4 14.3 13.53C14.37 13.67 14.43 13.85 14.33 14.03C14.25 14.22 14.18 14.3 14.05 14.45C13.92 14.6 13.8 14.72 13.67 14.88C13.53 15.03 13.38 15.2 13.55 15.48C13.72 15.77 14.3 16.72 15.17 17.48C16.28 18.47 17.2 18.78 17.52 18.92C17.77 19.02 18.07 19 18.25 18.8C18.48 18.55 18.77 18.13 19.07 17.72C19.28 17.42 19.55 17.38 19.83 17.48C20.12 17.58 21.65 18.33 21.97 18.48C22.28 18.63 22.5 18.72 22.57 18.83C22.63 18.95 22.63 19.52 21.2 19.8Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 3. Pin realista de Google Maps (Estilo tridimensional multicolor característico)
export function GoogleMapsRealisticIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gmap-red" x1="16" y1="2" x2="16" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EA4335" />
          <stop offset="100%" stopColor="#D93025" />
        </linearGradient>
        <filter id="gmap-shadow" x="4" y="2" width="24" height="28" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>
      <path
        d="M16 2C10.48 2 6 6.48 6 12C6 19.5 16 30 16 30C16 30 26 19.5 26 12C26 6.48 21.52 2 16 2Z"
        fill="url(#gmap-red)"
        filter="url(#gmap-shadow)"
      />
      {/* Segmentos de color auténticos de Google Maps */}
      <path d="M16 2C12.5 2 9.5 4 8 7L16 16.5L24 7C22.5 4 19.5 2 16 2Z" fill="#EA4335" />
      <path d="M6.5 10C6.2 10.6 6 11.3 6 12C6 16 11 23 16 28V16.5L6.5 10Z" fill="#4285F4" />
      <path d="M16 28C21 23 26 16 26 12C26 11.3 25.8 10.6 25.5 10L16 16.5V28Z" fill="#34A853" />
      <path d="M8 7L6.5 10L16 16.5L16 7L8 7Z" fill="#FBBC04" />
      {/* Círculo central blanco con relieve */}
      <circle cx="16" cy="11.5" r="4.2" fill="#FFFFFF" />
      <circle cx="16" cy="11.5" r="2.8" fill="#D93025" />
    </svg>
  );
}

// 4. Icono realista de Google Gemini (Destello cuántico con gradiente cósmico)
export function GeminiRealisticIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gemini-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4E82EE" />
          <stop offset="35%" stopColor="#7E57C2" />
          <stop offset="70%" stopColor="#9C27B0" />
          <stop offset="100%" stopColor="#E91E63" />
        </linearGradient>
        <filter id="gemini-glow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#7E57C2" floodOpacity="0.45" />
        </filter>
      </defs>
      <path
        d="M16 2C16 9.73 9.73 16 2 16C9.73 16 16 22.27 16 30C16 22.27 22.27 16 30 16C22.27 16 16 9.73 16 2Z"
        fill="url(#gemini-grad)"
        filter="url(#gemini-glow)"
      />
      <circle cx="16" cy="16" r="3" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );
}

// 5. Icono realista de Auditoría Web y PageSpeed (Velocímetro de alto rendimiento)
export function SpeedGaugeRealisticIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gauge-grad" x1="4" y1="18" x2="28" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00C853" />
          <stop offset="50%" stopColor="#FFD600" />
          <stop offset="100%" stopColor="#FF3D00" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="13" fill="#0F172A" />
      <path
        d="M7 21C6.4 19.5 6 17.8 6 16C6 10.5 10.5 6 16 6C21.5 6 26 10.5 26 16C26 17.8 25.6 19.5 25 21"
        stroke="url(#gauge-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Aguja dinámica */}
      <circle cx="16" cy="18" r="3.2" fill="#FFFFFF" />
      <line x1="16" y1="18" x2="22" y2="11" stroke="#00E676" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 6. Base de datos MySQL realista (Cilindro volumétrico 3D metálico con LED verde de actividad)
export function DatabaseRealisticIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="db-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>
      {/* Capa superior */}
      <ellipse cx="16" cy="7" rx="12" ry="4" fill="#38BDF8" />
      {/* Nivel 1 */}
      <path d="M4 7V13C4 15.2 9.4 17 16 17C22.6 17 28 15.2 28 13V7C28 9.2 22.6 11 16 11C9.4 11 4 9.2 4 7Z" fill="url(#db-grad)" />
      {/* Nivel 2 */}
      <path d="M4 14V20C4 22.2 9.4 24 16 24C22.6 24 28 22.2 28 20V14C28 16.2 22.6 18 16 18C9.4 18 4 16.2 4 14Z" fill="#0284C7" />
      {/* Nivel 3 */}
      <path d="M4 21V26C4 28.2 9.4 30 16 30C22.6 30 28 28.2 28 26V21C28 23.2 22.6 25 16 25C9.4 25 4 23.2 4 21Z" fill="#0369A1" />
      {/* LED verde status */}
      <circle cx="23" cy="14" r="1.5" fill="#4ADE80" />
      <circle cx="23" cy="21" r="1.5" fill="#4ADE80" />
      <circle cx="23" cy="27" r="1.5" fill="#4ADE80" />
    </svg>
  );
}

// 7. Icono realista de Radar de Prospección B2B (Pantalla de radar táctico con haz de barrido y clientes detectados)
export function RadarRealisticIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="radar-bezel" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <radialGradient id="radar-scope" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#042F2E" />
          <stop offset="65%" stopColor="#022020" />
          <stop offset="100%" stopColor="#011414" />
        </radialGradient>
        <linearGradient id="radar-sweep" x1="16" y1="16" x2="27.5" y2="9.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#065F46" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#042F2E" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="blip-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="40%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
        <filter id="radar-shadow" x="-2" y="-2" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Bisel metálico y pantalla táctica */}
      <circle cx="16" cy="16" r="14.5" fill="url(#radar-bezel)" stroke="#475569" strokeWidth="0.8" filter="url(#radar-shadow)" />
      <circle cx="16" cy="16" r="12.5" fill="url(#radar-scope)" stroke="#0D9488" strokeWidth="0.6" />

      {/* Anillos concéntricos de rango */}
      <circle cx="16" cy="16" r="9.5" stroke="#14B8A6" strokeWidth="0.6" strokeDasharray="1.5 1.5" opacity="0.45" />
      <circle cx="16" cy="16" r="6" stroke="#14B8A6" strokeWidth="0.65" opacity="0.6" />
      <circle cx="16" cy="16" r="2.5" stroke="#14B8A6" strokeWidth="0.5" opacity="0.5" />

      {/* Retícula de mira (Crosshairs) */}
      <line x1="3.5" y1="16" x2="28.5" y2="16" stroke="#0D9488" strokeWidth="0.6" opacity="0.55" />
      <line x1="16" y1="3.5" x2="16" y2="28.5" stroke="#0D9488" strokeWidth="0.6" opacity="0.55" />

      {/* Haz de barrido giratorio */}
      <path d="M 16 16 L 27.5 9.5 A 12.5 12.5 0 0 0 16 3.5 Z" fill="url(#radar-sweep)" opacity="0.65" />
      <line x1="16" y1="16" x2="27.5" y2="9.5" stroke="#34D399" strokeWidth="1.2" strokeLinecap="round" />

      {/* Leads detectados (Blips de radar) */}
      <circle cx="21.5" cy="11.5" r="3" fill="#34D399" opacity="0.3" />
      <circle cx="21.5" cy="11.5" r="1.5" fill="url(#blip-glow)" />
      <circle cx="21.5" cy="11.5" r="0.7" fill="#FFFFFF" />

      <circle cx="10" cy="20.5" r="2.2" fill="#38BDF8" opacity="0.25" />
      <circle cx="10" cy="20.5" r="1.2" fill="#38BDF8" />
      <circle cx="10" cy="20.5" r="0.5" fill="#FFFFFF" />

      {/* Punto de origen central */}
      <circle cx="16" cy="16" r="1.2" fill="#34D399" />
      <circle cx="16" cy="16" r="0.6" fill="#FFFFFF" />
    </svg>
  );
}

// Exportar también como BizorbisRealisticIcon para compatibilidad total
export const BizorbisRealisticIcon = RadarRealisticIcon;
