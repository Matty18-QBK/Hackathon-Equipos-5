"use client";
import { useState } from "react";
import { PERFIL_USUARIO } from "@/lib/mockData";
import { useRole } from "@/lib/role";
import { CheckCircle2, Upload, ShieldCheck, Key, FileLock2, AlertCircle } from "lucide-react";

export default function MiCuentaPage() {
  const { role } = useRole();
  const isContribuyente = role === "contribuyente";
  const [crt, setCrt] = useState<string | null>("certificado_arca_juanperez.crt");
  const [key, setKey] = useState<string | null>("private_key_juanperez.key");
  const [vinculado, setVinculado] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi Cuenta</h1>
        <p className="text-sm text-slate-500">{isContribuyente ? "Configurá tus credenciales de ARCA y vinculá tu CUIT" : "Datos de tu perfil profesional"}</p>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${isContribuyente ? "lg:grid-cols-3" : ""}`}>
        <div className={`card p-6 space-y-5 ${isContribuyente ? "lg:col-span-2" : ""}`}>
          <h2 className="text-lg font-bold text-slate-900">Datos del contribuyente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Nombre completo</label><input className="input" defaultValue={PERFIL_USUARIO.nombre} /></div>
            <div><label className="label">CUIT</label><input className="input font-mono" defaultValue={PERFIL_USUARIO.cuit} /></div>
            <div><label className="label">Email</label><input className="input" type="email" defaultValue={PERFIL_USUARIO.email} /></div>
            <div><label className="label">Categoría Monotributo</label><input className="input" defaultValue={`Cat. ${PERFIL_USUARIO.categoria}`} disabled /></div>
            <div><label className="label">Actividad</label><input className="input" defaultValue={PERFIL_USUARIO.actividad} /></div>
            <div><label className="label">Inicio de actividad</label><input className="input" type="date" defaultValue={PERFIL_USUARIO.inicioActividad} /></div>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary">Guardar cambios</button>
          </div>
        </div>

        {isContribuyente && (
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center"><ShieldCheck className="w-5 h-5" /></div>
              <h3 className="font-bold">Estado de la conexión ARCA</h3>
            </div>
            {vinculado ? (
              <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm"><CheckCircle2 className="w-4 h-4" /> Conectado vía Afip SDK</div>
                <p className="text-xs text-emerald-700/80 mt-1">Servicios habilitados: WSAA, WSFE, WSCDC, Padrón A5.</p>
              </div>
            ) : (
              <div className="bg-amber-50 ring-1 ring-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm"><AlertCircle className="w-4 h-4" /> Falta vincular CUIT</div>
              </div>
            )}
            <button onClick={() => setVinculado((v) => !v)} className="btn-outline w-full justify-center">
              {vinculado ? "Desvincular CUIT" : "Vincular CUIT"}
            </button>
          </div>
        )}
      </div>

      {isContribuyente && (
        <div className="card p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Credenciales de ARCA (Afip SDK)</h2>
            <p className="text-sm text-slate-500">Subí el certificado .crt y la clave privada generados en el portal de ARCA.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FileSlot
              label="Certificado .crt"
              icon={FileLock2}
              file={crt}
              onUpload={() => setCrt("certificado_arca_juanperez.crt")}
              onRemove={() => setCrt(null)}
            />
            <FileSlot
              label="Clave privada .key"
              icon={Key}
              file={key}
              onUpload={() => setKey("private_key_juanperez.key")}
              onRemove={() => setKey(null)}
            />
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            🔒 Las credenciales se almacenan cifradas con AES-256 y se utilizan únicamente para autenticarse contra los webservices de ARCA en tu nombre.
          </div>
        </div>
      )}
    </div>
  );
}

function FileSlot({ label, icon: Icon, file, onUpload, onRemove }:
  { label: string; icon: any; file: string | null; onUpload: () => void; onRemove: () => void }) {
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-brand-400 transition">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 grid place-items-center"><Icon className="w-5 h-5" /></div>
        <div className="font-semibold text-slate-900">{label}</div>
      </div>
      {file ? (
        <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
          <div className="text-xs">
            <div className="font-mono text-slate-700">{file}</div>
            <div className="text-emerald-600 mt-0.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Cargado</div>
          </div>
          <button onClick={onRemove} className="text-xs text-rose-600 font-semibold hover:underline">Quitar</button>
        </div>
      ) : (
        <button onClick={onUpload} className="w-full py-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm text-slate-600 inline-flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" /> Subir archivo
        </button>
      )}
    </div>
  );
}
