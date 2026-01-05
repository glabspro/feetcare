
import React, { useState } from 'react';
import { Key, ArrowRight, Rocket, AlertCircle, Loader2, Zap } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Simulamos una pequeña demora para feedback visual
    setTimeout(() => {
      const code = accessCode.trim().toUpperCase();
      
      // 1. Verificación de códigos maestros de emergencia
      if (code === 'SUPER123') {
        onLogin({
          id: 'master-admin',
          name: 'Super Administrador',
          role: UserRole.SUPER_ADMIN,
          companyId: 'feet-care-main',
          avatar: 'https://i.pravatar.cc/150?u=master'
        });
        return;
      }

      // 2. Verificación contra usuarios de la base de datos (Supabase)
      const foundUser = users.find(u => u.accessKey?.toUpperCase() === code);

      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError(true);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 sm:p-6 font-inter">
      <div className="max-w-[1100px] w-full bg-white rounded-4xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row min-h-[660px]">
        
        {/* PANEL IZQUIERDO: BRANDING */}
        <div className="w-full md:w-[45%] bg-[#0D0D33] p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg mb-14 border border-white/10">
               <Zap className="text-white fill-white" size={32} />
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                 <div className="h-[2px] w-6 bg-brand-primary"></div>
                 <span className="text-brand-primary font-bold text-[10px] uppercase tracking-[0.4em]">Clínica Profesional</span>
              </div>
              <h1 className="text-white text-7xl font-ubuntu font-bold tracking-tight">
                Feet<span className="text-brand-primary italic">Care</span>
              </h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
                Ecosistema de Gestión Podológica
              </p>
            </div>
            
            <p className="text-slate-300/80 text-base font-medium leading-relaxed max-w-[320px] mt-12">
              Bienvenido al sistema de gestión clínica especializada. Ingrese su clave de acceso para continuar.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
              <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Zap size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-[11px] tracking-wide">Acceso Seguro</span>
                <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Protocolo SSL v3.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: FORMULARIO */}
        <div className="flex-1 bg-white p-12 lg:p-20 flex flex-col justify-center relative">
          <div className="absolute top-10 right-10 flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Servidor Activo</span>
          </div>

          <div className="max-w-md mx-auto w-full">
            <div className="mb-14 text-left">
              <h2 className="text-5xl font-ubuntu font-bold text-[#0D0D33] tracking-tight">
                Acceso Personal
              </h2>
              <p className="text-slate-400 font-medium mt-4 text-base leading-relaxed">
                Usa la clave corporativa asignada por tu administración.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-1">
                  Clave de Acceso
                </label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary">
                    <Key size={22} />
                  </div>
                  <input 
                    type="password"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      if (error) setError(false);
                    }}
                    className={`w-full pl-16 pr-8 py-5 bg-white border-2 rounded-3xl outline-none font-bold text-[#0D0D33] text-xl transition-all placeholder:text-slate-200 shadow-sm ${error ? 'border-red-200 focus:border-red-400' : 'border-brand-primary/10 focus:border-brand-primary/40'}`}
                    placeholder="Escribe tu clave..."
                    required
                    autoFocus
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-2 text-red-500 animate-fade-in">
                    <AlertCircle size={14}/>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Credenciales no válidas</p>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={isLoading || !accessCode}
                className="w-full py-6 bg-brand-navy text-white rounded-[1.75rem] font-bold text-lg flex items-center justify-center gap-4 hover:bg-brand-primary transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 group"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <span>Entrar al Sistema</span>
                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-20 text-center space-y-4">
               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] flex items-center justify-center gap-4">
                  <div className="w-6 h-px bg-slate-100"></div>
                  Feet Care Enterprise v2.5
                  <div className="w-6 h-px bg-slate-100"></div>
               </span>
               <div className="flex justify-center">
                  <a 
                    href="https://gaorsystem.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-purple transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-100"
                  >
                    Desarrollado por <span className="text-brand-purple">GaorSystem</span>
                  </a>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
