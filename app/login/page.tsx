"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Lock,
  User,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { RadarRealisticIcon } from "@/components/RealisticIcons";
import { toast } from "@/components/ToastContext";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capsLockActive, setCapsLockActive] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Sesión iniciada correctamente.");
        setTimeout(() => {
          window.location.replace(redirect || "/");
        }, 150);
      } else {
        setErrorMessage(data.error || "Usuario o contraseña incorrectos.");
        toast.error("No se pudo iniciar sesión.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setErrorMessage("Ocurrió un error al procesar la solicitud.");
      toast.error("Ocurrió un error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
      {/* Decorative Outer Aura */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-teal-500/20 rounded-[32px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />

      {/* Main Glass Card */}
      <div className="relative bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-blue-900/10 space-y-6">
        {/* Header with animated Radar halo */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center">
            {/* Subtle glow halo */}
            <span className="absolute -inset-1.5 rounded-2xl bg-blue-500/25 blur-lg animate-pulse" />
            <img
              src="/icon.svg?v=3"
              alt="Bizorbis Favicon"
              className="relative w-16 h-16 rounded-2xl shadow-xl shadow-blue-950/40 border border-slate-800/60 transition-transform hover:scale-105"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Acceso Seguro SSL · Bizorbis B2B</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Bizorbis
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Plataforma de Inteligencia Comercial & Captación
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {/* Campo Usuario */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Usuario de Acceso
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                autoFocus
                className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 text-base sm:text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Contraseña
              </label>
              {capsLockActive && (
                <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                  Bloq Mayús activo
                </span>
              )}
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyDown}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-3 sm:py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-slate-900 text-base sm:text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Botón de Entrada Dinámico */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando credenciales...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión en el Radar</span>
              </>
            )}
          </button>
        </form>

        {/* Security footnote */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] text-slate-500 font-medium">
            Sesión cifrada con algoritmo HMAC-SHA256
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white relative overflow-hidden">
      {/* Background radial dot grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Dynamic ambient floating gradient orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute top-1/2 -right-24 -translate-y-1/2 w-96 h-96 bg-indigo-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative floating concentric rings in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-slate-200/50 pointer-events-none -z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full border border-slate-200/30 pointer-events-none -z-0" />

      <Suspense fallback={<div className="text-slate-600 text-xs font-semibold">Cargando acceso...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
