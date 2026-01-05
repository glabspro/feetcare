
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Clock, 
  LogOut,
  ExternalLink,
  Rocket,
  UserCog,
  Settings,
  ChevronRight,
  Check,
  Zap
} from 'lucide-react';
import { ViewState, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState['currentView'];
  onViewChange: (view: ViewState['currentView']) => void;
  userRole?: UserRole;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, userRole = UserRole.RECEPCIONIST, onLogout }) => {
  const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
  const [copied, setCopied] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'appointments', icon: CalendarDays, label: 'Agenda Citas' },
    { id: 'patients', icon: Users, label: 'Expedientes' },
    { id: 'staff-management', icon: UserCog, label: isAdmin ? 'Especialistas' : 'Ver Equipo' },
    { id: 'schedules', icon: Clock, label: isAdmin ? 'Configurar Horarios' : 'Mis Horarios' },
  ];

  const handleCopyLink = () => {
    const portalUrl = `${window.location.origin}/portal`;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-64 fixed h-full bg-[#0D0D33] p-6 flex flex-col border-r border-white/5 z-50">
      <div className="mb-10 px-2 flex items-center gap-3">
         <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-white/10">
            <Zap className="text-white fill-white" size={20} />
         </div>
         <div>
            <h1 className="text-white font-ubuntu font-bold text-xl tracking-tight leading-none">
               Feet<span className="text-brand-primary">Care</span>
            </h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1.5">Podología Clínica</p>
         </div>
      </div>

      <nav className="flex-1 space-y-2">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">Navegación</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as any)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold text-xs group ${
              currentView === item.id 
                ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/10' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={18} className={`${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-brand-primary'}`} />
            {item.label}
          </button>
        ))}

        {userRole === UserRole.SUPER_ADMIN && (
          <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">Configuración Master</p>
            <button
              onClick={() => onViewChange('saas-admin' as any)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold text-xs group ${
                currentView === 'saas-admin' 
                  ? 'bg-brand-purple text-white' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings size={18} />
              Panel Master
            </button>
          </div>
        )}
      </nav>

      <div className="pt-6 border-t border-white/5 space-y-4">
        <button 
          onClick={handleCopyLink}
          className="w-full flex items-center justify-between gap-4 px-4 py-3 bg-white/5 rounded-xl text-slate-300 font-bold text-[10px] hover:bg-white/10 transition-all border border-white/5 group"
        >
          <span className="flex items-center gap-3">
             {copied ? <Check size={14} className="text-green-400" /> : <ExternalLink size={14} className="text-brand-primary" />} 
             {copied ? '¡URL Copiada!' : 'Link Portal Citas'}
          </span>
          <ChevronRight size={12} className="opacity-30 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button 
          onClick={() => onLogout ? onLogout() : window.location.reload()}
          className="w-full flex items-center gap-4 px-4 py-2 text-slate-500 font-bold text-xs hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>

        <div className="pt-4 border-t border-white/5">
           <a 
            href="https://gaorsystem.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest hover:text-brand-purple transition-colors"
           >
             Desarrollado por <span className="text-brand-purple">GaorSystem</span>
           </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
