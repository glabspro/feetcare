
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  ShieldCheck, 
  Palette, 
  X,
  Save,
  Users,
  UserPlus,
  Type,
  Image as ImageIcon,
  MapPin,
  CheckCircle,
  UserCog,
  Trash2,
  Lock,
  Globe,
  Key,
  Loader2
} from 'lucide-react';
import { Company, User, UserRole, Sede } from '../types';

interface SaasAdminProps {
  companies: Company[];
  users: User[];
  sedes: Sede[];
  onAddCompany: (c: Company) => void;
  onUpdateCompany: (c: Company) => Promise<boolean>;
  onAddUser: (u: User) => Promise<boolean>;
  onUpdateUser: (u: User) => Promise<boolean>;
  userRole?: UserRole;
  currentCompanyId?: string;
}

const SaasAdmin: React.FC<SaasAdminProps> = ({ 
  companies = [], 
  users = [],
  sedes = [],
  onUpdateCompany,
  onAddUser,
  onUpdateUser,
  userRole = UserRole.ADMIN,
  currentCompanyId 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'users'>('settings');
  const [showUserModal, setShowUserModal] = useState<Partial<User> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeClinic = useMemo(() => 
    companies.find(c => c.id === currentCompanyId), 
    [companies, currentCompanyId]
  );

  const [brandForm, setBrandForm] = useState<Partial<Company>>({});

  useEffect(() => {
    if (activeClinic) setBrandForm(activeClinic);
  }, [activeClinic]);

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brandForm.id) {
      setIsSaving(true);
      await onUpdateCompany(brandForm as Company);
      setIsSaving(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUserModal?.name || isSaving) return;

    setIsSaving(true);
    const userToSave: User = {
      id: showUserModal.id || crypto.randomUUID(),
      name: showUserModal.name,
      email: showUserModal.email || '',
      accessKey: showUserModal.accessKey || '', 
      role: showUserModal.role || UserRole.RECEPCIONIST,
      sedeIds: showUserModal.sedeIds || [],
      companyId: currentCompanyId || 'feet-care-main',
      avatar: showUserModal.avatar || `https://i.pravatar.cc/150?u=${showUserModal.id || showUserModal.name}`
    };

    let success = false;
    if (showUserModal.id) {
      success = await onUpdateUser(userToSave);
    } else {
      success = await onAddUser(userToSave);
    }

    if (success) {
      setShowUserModal(null);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 text-brand-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-3">
             <ShieldCheck size={14} className="text-brand-primary" /> Configuración Master – Super Admin
          </div>
          <h2 className="text-5xl font-ubuntu font-bold text-brand-navy tracking-tight">Panel de Control</h2>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner">
            <button onClick={() => setActiveSubTab('settings')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'settings' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
              <Palette size={14} /> Marca y Sistema
            </button>
            <button onClick={() => setActiveSubTab('users')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'users' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400'}`}>
              <Users size={14} /> Accesos y Sedes
            </button>
        </div>
      </header>

      <div className="px-4">
        {activeSubTab === 'settings' && (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-10 space-y-10">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-brand-lightPrimary rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
                       <Palette size={28} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">Identidad Corporativa</h3>
                       <p className="text-slate-400 text-xs font-medium">Configura el logo y colores de Feet Care.</p>
                    </div>
                 </div>

                 <form onSubmit={handleUpdateBrand} className="space-y-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre de la Clínica</label>
                          <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none shadow-inner" value={brandForm.name || ''} onChange={e => setBrandForm({...brandForm, name: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Color de Marca (HEX)</label>
                          <div className="flex gap-4">
                             <input className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-brand-navy outline-none shadow-inner" value={brandForm.primaryColor || ''} onChange={e => setBrandForm({...brandForm, primaryColor: e.target.value})} />
                             <div className="w-14 h-14 rounded-2xl border border-slate-100 shadow-inner shrink-0" style={{ backgroundColor: brandForm.primaryColor }}></div>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL del Logotipo</label>
                          <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none shadow-inner" value={brandForm.logo || ''} onChange={e => setBrandForm({...brandForm, logo: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL Imagen Portada Portal</label>
                          <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none shadow-inner" value={brandForm.portalHero || ''} onChange={e => setBrandForm({...brandForm, portalHero: e.target.value})} />
                       </div>
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full py-5 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-brand-primary transition-all disabled:opacity-50">
                       {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
                       {isSaving ? 'Actualizando...' : 'Guardar Cambios en Sistema'}
                    </button>
                 </form>
              </div>

              <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl min-h-[400px] flex flex-col justify-between self-start">
                 <div className="absolute inset-0 opacity-40">
                    <img src={brandForm.portalHero || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000"} className="w-full h-full object-cover blur-[2px]" alt="Preview" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                 <div className="relative z-10 flex justify-between items-start">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-[9px] font-bold uppercase tracking-widest">Vista Previa Portal</div>
                    <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center shadow-xl overflow-hidden">
                       <img src={brandForm.logo} className="max-w-full max-h-full object-contain" alt="Logo" />
                    </div>
                 </div>
                 <div className="relative z-10 text-center py-10">
                    <h4 className="text-4xl font-ubuntu font-bold">{brandForm.name}</h4>
                    <p className="mt-4 text-white/60 text-sm">Podología Clínica Profesional</p>
                 </div>
              </div>
           </div>
        )}

        {activeSubTab === 'users' && (
           <div className="space-y-10 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-ubuntu font-bold text-brand-navy">Control de Accesos</h3>
                  <p className="text-slate-400 mt-2 text-lg font-medium">Crea usuarios y asigna a qué sedes tienen permiso para entrar.</p>
                </div>
                <button 
                  onClick={() => setShowUserModal({ role: UserRole.RECEPCIONIST, sedeIds: [] })}
                  className="h-fit bg-brand-navy text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:bg-brand-primary transition-all"
                >
                  <UserPlus size={20} /> Crear Nuevo Acceso
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {users.map(user => (
                   <div key={user.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 flex flex-col items-center group hover:shadow-xl transition-all clinical-shadow">
                      <div className="w-20 h-20 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 mb-6 shadow-inner">
                        <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} className="w-full h-full object-cover" alt={user.name} />
                      </div>
                      <h4 className="font-ubuntu font-bold text-xl text-brand-navy">{user.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">{user.role}</p>
                      
                      <div className="w-full mt-8 pt-6 border-t border-slate-50 space-y-4">
                         <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                            <Lock size={14} className="text-brand-secondary" /> Clave: {user.accessKey || '---'}
                         </div>
                         <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Sedes con acceso:</p>
                         <div className="flex flex-wrap gap-1.5">
                           {(user.sedeIds || []).map(sid => {
                             const sede = sedes.find(s => s.id === sid);
                             return <span key={sid} className="px-2 py-1 bg-slate-50 text-slate-500 text-[8px] font-bold rounded-lg border border-slate-100">{sede?.name || 'Sede'}</span>;
                           })}
                           {(!user.sedeIds || user.sedeIds.length === 0) && <span className="text-[8px] text-slate-300 italic">Sin sedes asignadas</span>}
                         </div>
                      </div>

                      <div className="w-full mt-6 pt-6 flex gap-3">
                         <button onClick={() => setShowUserModal(user)} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-bold hover:bg-brand-lightPrimary hover:text-brand-primary transition-all">Editar</button>
                         <button className="p-3 bg-red-50 text-red-300 rounded-xl hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}
      </div>

      {showUserModal && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy">{showUserModal.id ? 'Editar Acceso' : 'Nuevo Acceso'}</h3>
              <button onClick={() => { if(!isSaving) setShowUserModal(null); }} className="text-slate-300 hover:text-brand-navy"><X size={32} /></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-10 space-y-6">
              
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-[2rem] border-4 border-slate-50 overflow-hidden shadow-inner bg-slate-50 flex items-center justify-center">
                   {(showUserModal.avatar) ? (
                     <img src={showUserModal.avatar} className="w-full h-full object-cover" alt="Preview" />
                   ) : (
                     <ImageIcon size={32} className="text-slate-200" />
                   )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                   <input required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-sm text-brand-navy outline-none shadow-inner" value={showUserModal.name || ''} onChange={e => setShowUserModal({...showUserModal, name: e.target.value})} placeholder="Nombre completo" />
                </div>
                
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL de Foto (Avatar)</label>
                   <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary text-xs font-medium outline-none shadow-inner" value={showUserModal.avatar || ''} onChange={e => setShowUserModal({...showUserModal, avatar: e.target.value})} placeholder="https://ejemplo.com/foto.jpg" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email (Opcional)</label>
                      <input type="email" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-sm text-brand-navy outline-none shadow-inner" value={showUserModal.email || ''} onChange={e => setShowUserModal({...showUserModal, email: e.target.value})} placeholder="email@feetcare.com" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Clave de Acceso</label>
                      <input required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-bold text-sm text-brand-navy outline-none shadow-inner" value={showUserModal.accessKey || ''} onChange={e => setShowUserModal({...showUserModal, accessKey: e.target.value})} placeholder="Ej: STAFF01" />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rol de Usuario</label>
                   <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary font-bold text-xs shadow-inner appearance-none" value={showUserModal.role || UserRole.RECEPCIONIST} onChange={e => setShowUserModal({...showUserModal, role: e.target.value as UserRole})}>
                     <option value={UserRole.ADMIN}>Administrador de Clínica</option>
                     <option value={UserRole.RECEPCIONIST}>Recepcionista</option>
                     <option value={UserRole.SPECIALIST}>Especialista</option>
                   </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sedes Autorizadas</label>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100 max-h-40 overflow-y-auto custom-scrollbar shadow-inner">
                    {sedes.map(s => (
                      <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg border-slate-200 text-brand-primary focus:ring-brand-primary" 
                          checked={showUserModal.sedeIds?.includes(s.id)}
                          onChange={e => {
                            const ids = showUserModal.sedeIds || [];
                            const newList = e.target.checked ? [...ids, s.id] : ids.filter(id => id !== s.id);
                            setShowUserModal({...showUserModal, sedeIds: newList});
                          }}
                        />
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-navy transition-colors">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-6 bg-brand-navy text-white rounded-3xl font-bold text-sm shadow-xl hover:bg-brand-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                {isSaving ? 'Procesando...' : 'Guardar Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaasAdmin;
