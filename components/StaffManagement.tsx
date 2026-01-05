
import React, { useState } from 'react';
import { 
  UserCog, 
  Stethoscope, 
  Plus, 
  MapPin, 
  Trash2, 
  Edit,
  Shield,
  X,
  CheckCircle,
  Building,
  Lock,
  ChevronDown,
  ImageIcon
} from 'lucide-react';
import { Professional, User, UserRole, Sede } from '../types';

interface StaffManagementProps {
  professionals: Professional[];
  users: User[];
  sedes: Sede[];
  onAddProfessional: (p: Professional) => void;
  onAddUser: (u: User) => void;
  currentCompanyId: string;
  userRole?: UserRole;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ 
  professionals, 
  users, 
  sedes,
  onAddProfessional,
  onAddUser,
  currentCompanyId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'specialists' | 'staff'>('specialists');
  const [showModal, setShowModal] = useState<'specialist' | 'staff' | null>(null);
  
  const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  const [specialistForm, setSpecialistForm] = useState({
    name: '',
    specialty: '',
    email: '',
    accessKey: '',
    avatar: '',
    selectedSedes: [] as string[]
  });

  const [staffForm, setStaffForm] = useState({
    name: '',
    accessKey: '',
    role: UserRole.RECEPCIONIST,
    avatar: '',
    selectedSedes: [] as string[]
  });

  const handleAddSpecialist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const userId = crypto.randomUUID();
    const avatarUrl = specialistForm.avatar || `https://i.pravatar.cc/150?u=${specialistForm.email || userId}`;
    
    const newUser: User = {
      id: userId,
      name: specialistForm.name,
      email: specialistForm.email,
      accessKey: specialistForm.accessKey,
      role: UserRole.SPECIALIST,
      companyId: currentCompanyId,
      sedeIds: specialistForm.selectedSedes,
      avatar: avatarUrl
    };
    const newProf: Professional = {
      id: 'p-' + Math.random().toString(36).substr(2, 5),
      name: specialistForm.name,
      specialty: specialistForm.specialty,
      sedeIds: specialistForm.selectedSedes,
      companyId: currentCompanyId,
      userId: userId,
      avatar: avatarUrl
    };
    onAddUser(newUser);
    onAddProfessional(newProf);
    setShowModal(null);
    setSpecialistForm({ name: '', specialty: '', email: '', accessKey: '', avatar: '', selectedSedes: [] });
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const userId = crypto.randomUUID();
    const avatarUrl = staffForm.avatar || `https://i.pravatar.cc/150?u=${staffForm.accessKey || userId}`;

    const newUser: User = {
      id: userId,
      name: staffForm.name,
      accessKey: staffForm.accessKey,
      role: staffForm.role,
      companyId: currentCompanyId,
      sedeIds: staffForm.selectedSedes,
      avatar: avatarUrl
    };
    onAddUser(newUser);
    setShowModal(null);
    setStaffForm({ name: '', accessKey: '', role: UserRole.RECEPCIONIST, avatar: '', selectedSedes: [] });
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-ubuntu font-bold text-brand-navy tracking-tight">
            {isAdmin ? 'Gestión de Talento' : 'Nuestro Equipo'}
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            {isAdmin ? 'Administra especialistas y personal administrativo.' : 'Visualiza a los miembros de tu equipo de trabajo.'}
          </p>
        </div>
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
           <button 
            onClick={() => setActiveTab('specialists')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'specialists' ? 'bg-white text-brand-secondary shadow-md' : 'text-slate-400 hover:text-brand-navy'}`}
           >
             <Stethoscope size={14} /> Especialistas
           </button>
           <button 
            onClick={() => setActiveTab('staff')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'staff' ? 'bg-white text-brand-navy shadow-md' : 'text-slate-400 hover:text-brand-navy'}`}
           >
             <UserCog size={14} /> Personal Staff
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isAdmin && (
          <button 
              onClick={() => setShowModal(activeTab === 'specialists' ? 'specialist' : 'staff')}
              className="group h-full min-h-[250px] bg-white rounded-[3rem] border-2 border-dashed border-slate-200 hover:border-brand-secondary hover:bg-brand-secondary/[0.02] transition-all flex flex-col items-center justify-center p-10 space-y-4 shadow-sm"
          >
              <div className="w-20 h-20 rounded-full bg-slate-50 group-hover:bg-brand-secondary/10 flex items-center justify-center text-slate-300 group-hover:text-brand-secondary transition-all">
                  <Plus size={40} />
              </div>
              <p className="font-ubuntu font-bold text-slate-400 group-hover:text-brand-navy text-center">Registrar {activeTab === 'specialists' ? 'Especialista' : 'Usuario'}</p>
          </button>
        )}

        {activeTab === 'specialists' ? (
          professionals.map(p => (
            <div key={p.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 clinical-shadow group relative overflow-hidden">
               {isAdmin && (
                 <div className="absolute right-0 top-0 p-6 flex gap-2 translate-x-10 group-hover:translate-x-0 transition-transform">
                    <button className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"><Trash2 size={16} /></button>
                 </div>
               )}
               <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                     <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-ubuntu font-bold text-xl text-brand-navy">{p.name}</h4>
                    <p className="text-brand-secondary text-xs font-bold uppercase tracking-widest">{p.specialty}</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-medium bg-slate-50 p-3 rounded-2xl">
                     <Building size={16} /> {p.sedeIds.length} Sedes asignadas
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {p.sedeIds.map(sid => {
                        const sede = sedes.find(s => s.id === sid);
                        return <span key={sid} className="px-3 py-1 bg-brand-lightSecondary text-brand-secondary text-[9px] font-bold rounded-full border border-brand-secondary/20">{sede?.name || sid}</span>
                     })}
                  </div>
               </div>
            </div>
          ))
        ) : (
          users.map(u => (
            <div key={u.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 clinical-shadow group">
               <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner">
                     <img src={u.avatar || `https://i.pravatar.cc/150?u=${u.id}`} alt={u.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-ubuntu font-bold text-xl text-brand-navy">{u.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <Shield size={14} className="text-brand-accent" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</span>
                    </div>
                  </div>
               </div>
               <div className="space-y-3 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                     <Lock size={16} className="text-brand-secondary" /> {isAdmin ? `Clave: ${u.accessKey}` : 'Acceso Restringido'}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-visible shadow-2xl border border-slate-100 animate-fade-in relative">
              <button onClick={() => setShowModal(null)} className="absolute top-8 right-8 text-slate-300 hover:text-brand-navy p-2"><X size={32} /></button>
              <div className="w-full px-10 pt-10 pb-6">
                 <h3 className="text-3xl font-ubuntu font-bold text-brand-navy">Nuevo Registro</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Configuración de Acceso y Foto</p>
              </div>
              <form onSubmit={activeTab === 'specialists' ? handleAddSpecialist : handleAddStaff} className="px-10 pb-12 space-y-6">
                 
                 {/* PREVIEW DE FOTO */}
                 <div className="flex justify-center mb-2">
                    <div className="w-24 h-24 rounded-[2rem] border-4 border-slate-100 overflow-hidden shadow-inner bg-slate-50 flex items-center justify-center">
                        {(activeTab === 'specialists' ? specialistForm.avatar : staffForm.avatar) ? (
                            <img src={activeTab === 'specialists' ? specialistForm.avatar : staffForm.avatar} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <ImageIcon size={32} className="text-slate-200" />
                        )}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <input 
                        required 
                        className="w-full px-7 py-4 bg-[#F8FAFC] border-none rounded-3xl focus:ring-2 focus:ring-brand-secondary/30 font-bold text-brand-navy outline-none"
                        placeholder="Nombre Completo"
                        value={activeTab === 'specialists' ? specialistForm.name : staffForm.name}
                        onChange={e => activeTab === 'specialists' ? setSpecialistForm({...specialistForm, name: e.target.value}) : setStaffForm({...staffForm, name: e.target.value})}
                    />
                    <input 
                        className="w-full px-7 py-4 bg-[#F8FAFC] border-none rounded-3xl focus:ring-2 focus:ring-brand-secondary/30 font-medium text-brand-navy text-xs outline-none"
                        placeholder="URL de Foto (Avatar)"
                        value={activeTab === 'specialists' ? specialistForm.avatar : staffForm.avatar}
                        onChange={e => activeTab === 'specialists' ? setSpecialistForm({...specialistForm, avatar: e.target.value}) : setStaffForm({...staffForm, avatar: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <input 
                        required 
                        className="w-full px-7 py-4 bg-[#F8FAFC] border-none rounded-3xl focus:ring-2 focus:ring-brand-secondary/30 font-bold text-brand-navy outline-none"
                        placeholder={activeTab === 'specialists' ? 'Especialidad' : 'Clave Acceso'}
                        value={activeTab === 'specialists' ? specialistForm.specialty : staffForm.accessKey}
                        onChange={e => activeTab === 'specialists' ? setSpecialistForm({...specialistForm, specialty: e.target.value}) : setStaffForm({...staffForm, accessKey: e.target.value})}
                    />
                    {activeTab === 'specialists' ? (
                       <input 
                          required 
                          className="w-full px-7 py-4 bg-[#F8FAFC] border-none rounded-3xl focus:ring-2 focus:ring-brand-secondary/30 font-bold text-brand-navy outline-none"
                          placeholder="Clave Acceso"
                          value={specialistForm.accessKey}
                          onChange={e => setSpecialistForm({...specialistForm, accessKey: e.target.value})}
                       />
                    ) : (
                       <select 
                          className="w-full px-7 py-4 bg-[#F8FAFC] border-none rounded-3xl focus:ring-2 focus:ring-brand-navy/30 font-bold text-brand-navy outline-none appearance-none"
                          value={staffForm.role}
                          onChange={e => setStaffForm({...staffForm, role: e.target.value as UserRole})}
                       >
                          <option value={UserRole.RECEPCIONIST}>Recepcionista</option>
                          <option value={UserRole.ADMIN}>Administrador</option>
                       </select>
                    )}
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sedes Autorizadas</label>
                    <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-6 rounded-[2.5rem] shadow-inner max-h-40 overflow-y-auto custom-scrollbar">
                       {sedes.map(s => (
                         <label key={s.id} className="flex items-center gap-4 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="w-6 h-6 rounded-lg border-slate-200 text-brand-navy focus:ring-brand-navy/20"
                                checked={(activeTab === 'specialists' ? specialistForm.selectedSedes : staffForm.selectedSedes).includes(s.id)}
                                onChange={(e) => {
                                    const list = activeTab === 'specialists' ? specialistForm.selectedSedes : staffForm.selectedSedes;
                                    const newList = e.target.checked ? [...list, s.id] : list.filter(id => id !== s.id);
                                    activeTab === 'specialists' ? setSpecialistForm({...specialistForm, selectedSedes: newList}) : setStaffForm({...staffForm, selectedSedes: newList});
                                }}
                            />
                            <span className="text-xs font-bold text-slate-500">{s.name}</span>
                         </label>
                       ))}
                    </div>
                 </div>
                 <button type="submit" className="w-full py-6 bg-brand-navy text-white rounded-[2rem] font-bold flex items-center justify-center gap-3">
                    <CheckCircle size={20} /> Guardar Cambios
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
