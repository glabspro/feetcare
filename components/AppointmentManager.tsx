
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Stethoscope, 
  Calendar as CalendarIcon,
  CheckCircle,
  X,
  Search,
  User,
  IdCard,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  FileText,
  Mail,
  Phone,
  Hash,
  AtSign,
  Save,
  AlertCircle,
  MessageCircle,
  Zap,
  ExternalLink
} from 'lucide-react';
import { Appointment, AppointmentStatus, Patient, Sede } from '../types';
import { MOCK_SERVICES, STATUS_COLORS } from '../constants';

interface AppointmentManagerProps {
  appointments: Appointment[];
  patients: Patient[];
  sedes: Sede[];
  onUpdateAppointment: (apt: Appointment) => void;
  onAddAppointment: (apt: Appointment) => void;
  onStartClinicalSession: (appointmentId: string) => void;
  onAddPatient: (patient: Patient) => void;
}

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ 
  appointments, 
  patients,
  sedes,
  onUpdateAppointment, 
  onAddAppointment, 
  onStartClinicalSession,
  onAddPatient 
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'TODOS'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Appointment | null>(null);
  
  const [editForm, setEditForm] = useState({
    patientName: '',
    patientPhone: '',
    patientDni: '',
    patientEmail: '',
    notes: ''
  });

  useEffect(() => {
    if (showEditModal) {
      setEditForm({
        patientName: showEditModal.patientName || '',
        patientPhone: showEditModal.patientPhone || '',
        patientDni: showEditModal.patientDni || '',
        patientEmail: showEditModal.patientEmail || '',
        notes: showEditModal.notes || ''
      });
    }
  }, [showEditModal]);

  const [formData, setFormData] = useState({
    patientName: '',
    patientDni: '',
    patientEmail: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    sedeId: sedes[0]?.id || '',
    notes: ''
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days };
  };

  const { firstDay, days } = getDaysInMonth(currentDate);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    if (dayNumber > 0 && dayNumber <= days) {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    }
    return null;
  });

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesStatus = statusFilter === 'TODOS' || apt.status === statusFilter;
      const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            apt.bookingCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  const handleDayClick = (date: string) => {
    setFormData(prev => ({ 
      ...prev, 
      date,
      patientName: '',
      patientDni: '',
      patientEmail: '',
      notes: ''
    }));
    setShowAddModal(true);
  };

  const handleUpdateStatus = (apt: Appointment, status: AppointmentStatus) => {
    onUpdateAppointment({ ...apt, status });
    setShowEditModal(null);
  };

  const handleSaveChanges = () => {
    if (!showEditModal) return;
    const updatedApt: Appointment = {
      ...showEditModal,
      patientName: editForm.patientName,
      patientPhone: editForm.patientPhone,
      patientDni: editForm.patientDni,
      patientEmail: editForm.patientEmail,
      notes: editForm.notes
    };
    onUpdateAppointment(updatedApt);
  };

  const handleWhatsAppChat = () => {
    if (!showEditModal) return;
    const cleanPhone = editForm.patientPhone.replace(/\D/g, '');
    const activeSede = sedes.find(s => s.id === showEditModal.sedeId);
    // El mensaje sale del número de la sede hacia el cliente
    const message = encodeURIComponent(`Hola ${editForm.patientName}, le escribimos de Feet Care para confirmar su cita.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: Appointment = {
      id: 'apt-' + Math.random().toString(36).substr(2, 9),
      patientName: formData.patientName,
      patientPhone: '', 
      patientDni: formData.patientDni,
      patientEmail: formData.patientEmail || undefined,
      serviceId: MOCK_SERVICES[0]?.id || 's1', 
      sedeId: formData.sedeId,
      professionalId: 'p1', 
      date: formData.date,
      time: formData.time,
      status: AppointmentStatus.CONFIRMED,
      notes: formData.notes,
      bookingCode: 'BEE-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      companyId: sedes.find(s => s.id === formData.sedeId)?.companyId || 'bee-main'
    };
    onAddAppointment(newApt);
    setShowAddModal(false);
  };

  const activeSede = useMemo(() => {
    if (!showEditModal) return null;
    return sedes.find(s => s.id === showEditModal.sedeId);
  }, [showEditModal, sedes]);

  const renderCalendarView = () => (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden clinical-shadow animate-fade-in">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-6">
          <div>
             <h3 className="text-2xl font-ubuntu font-bold text-brand-navy capitalize leading-none">{monthName}</h3>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Agenda Interactiva</p>
          </div>
          <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100 shadow-inner">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white text-slate-400 hover:text-brand-secondary transition-all rounded-lg"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 text-[10px] font-bold text-brand-navy hover:text-brand-secondary transition-all uppercase tracking-widest">Hoy</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white text-slate-400 hover:text-brand-secondary transition-all rounded-lg"><ChevronRight size={16} /></button>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="w-12 h-12 bg-brand-secondary text-white rounded-2xl flex items-center justify-center hover:bg-brand-secondary/90 transition-all shadow-lg shadow-brand-secondary/20">
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-7 bg-slate-50/30 border-b border-slate-100">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="h-36 border-b border-r border-slate-50 bg-slate-50/[0.1]" />;
          
          const dateStr = date.toISOString().split('T')[0];
          const dayAppointments = appointments.filter(a => a.date === dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div 
              key={dateStr} 
              className={`h-36 border-b border-r border-slate-100 p-3 transition-all group relative overflow-hidden ${
                isToday ? 'bg-brand-secondary/[0.02]' : 'hover:bg-slate-50/20'
              }`}
            >
              <div 
                className="absolute inset-0 z-0 cursor-pointer"
                onClick={() => handleDayClick(dateStr)}
              />

              <div className="relative z-10 flex justify-between items-start mb-3 pointer-events-none">
                <span className={`text-sm font-ubuntu font-bold w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                  isToday 
                  ? 'bg-brand-secondary text-white shadow-lg' 
                  : 'text-slate-400 group-hover:text-brand-navy'
                }`}>
                  {date.getDate()}
                </span>
              </div>
              
              <div className="relative z-10 space-y-1.5 overflow-y-auto max-h-[70px] custom-scrollbar pr-0.5">
                {dayAppointments.map(apt => (
                  <button 
                    key={apt.id} 
                    onClick={(e) => { e.stopPropagation(); setShowEditModal(apt); }}
                    className={`w-full px-2.5 py-2 rounded-lg text-[9px] font-bold truncate text-left transition-all hover:scale-[1.02] border shadow-sm ${STATUS_COLORS[apt.status]}`}
                  >
                    {apt.time} {apt.patientName}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in">
      {filteredAppointments.length > 0 ? (
        filteredAppointments.map((apt) => {
          const sede = sedes.find(s => s.id === apt.sedeId);
          const isPending = apt.status === AppointmentStatus.PENDING;

          return (
            <div 
              key={apt.id} 
              className={`bg-white rounded-[2rem] border p-8 transition-all group relative clinical-shadow ${
                isPending ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100 hover:border-brand-secondary shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner ${
                    isPending ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {apt.patientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy text-xl leading-tight truncate max-w-[180px]">
                      {apt.patientName}
                    </h4>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">
                       {apt.bookingCode}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-bold border tracking-widest ${STATUS_COLORS[apt.status]}`}>
                  {apt.status}
                </span>
              </div>

              <div className="space-y-4 mb-8 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                   <span className="text-slate-400 font-bold uppercase tracking-widest">Horario</span>
                   <span className="text-brand-navy font-bold">{apt.date} • {apt.time}</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-slate-400 font-bold uppercase tracking-widest">Sede</span>
                   <span className="text-brand-secondary font-bold uppercase">{sede?.name}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {isPending ? (
                  <button 
                    onClick={() => handleUpdateStatus(apt, AppointmentStatus.CONFIRMED)}
                    className="w-full py-4 bg-brand-secondary text-white rounded-2xl font-bold text-sm hover:shadow-xl transition-all"
                  >
                    Confirmar Cita
                  </button>
                ) : (
                  <button 
                    onClick={() => onStartClinicalSession(apt.id)}
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      apt.status === AppointmentStatus.ATTENDED 
                      ? 'bg-teal-50 text-teal-600 border border-teal-100' 
                      : 'bg-brand-navy text-white hover:bg-brand-navy/90 shadow-lg'
                    }`}
                  >
                    <Stethoscope size={18} /> {apt.status === AppointmentStatus.ATTENDED ? 'Atendiendo' : 'Atender'}
                  </button>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowEditModal(apt)}
                    className="flex-1 py-3.5 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold text-[11px] hover:bg-slate-50 transition-all"
                  >
                    Gestionar
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full py-28 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
          <p className="text-slate-400 text-base font-medium">No se encontraron turnos activos.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl font-ubuntu font-bold text-brand-navy tracking-tight">Agenda Maestra</h2>
          <p className="text-slate-400 font-medium mt-3 text-base">Panel operativo de agendamiento clínico centralizado.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
             <button onClick={() => setViewMode('calendar')} className={`px-6 py-3 rounded-xl flex items-center gap-2 text-[11px] font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400 hover:text-brand-navy'}`}>
                <CalendarIcon size={16} /> Calendario
             </button>
             <button onClick={() => setViewMode('list')} className={`px-6 py-3 rounded-xl flex items-center gap-2 text-[11px] font-bold transition-all ${viewMode === 'list' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-400 hover:text-brand-navy'}`}>
                <LayoutGrid size={16} /> Lista
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-2">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {['TODOS', ...Object.values(AppointmentStatus)].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-brand-secondary text-white border-brand-secondary shadow-xl shadow-brand-secondary/10' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-brand-secondary hover:text-brand-secondary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por paciente o código..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm w-full md:w-72 focus:ring-2 focus:ring-brand-secondary outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="min-h-[600px]">
        {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
      </div>

      {/* QUICK ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] bg-brand-navy/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in border border-slate-100">
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-brand-lightSecondary text-brand-secondary rounded-2xl flex items-center justify-center shadow-inner">
                   <CalendarIcon size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-ubuntu font-bold text-brand-navy leading-none">Agendar Turno</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Nueva cita administrativa</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-brand-navy transition-colors p-3"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleSaveAppointment} className="p-10 space-y-8 overflow-y-auto max-h-[85vh] custom-scrollbar">
               <div className="space-y-6">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <User size={14} className="text-brand-secondary" /> Nombre del Paciente
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej: Carlos Rodríguez" 
                      required 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-bold text-sm text-brand-navy outline-none shadow-inner"
                      value={formData.patientName}
                      onChange={e => setFormData({...formData, patientName: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <IdCard size={14} className="text-brand-primary" /> DNI / Identificación
                      </label>
                      <input 
                        type="text" 
                        placeholder="12345678" 
                        required 
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm font-bold outline-none shadow-inner"
                        value={formData.patientDni}
                        onChange={e => setFormData({...formData, patientDni: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 text-slate-300">
                         <Mail size={14} /> Email (Opcional)
                      </label>
                      <input 
                        type="email" 
                        placeholder="ejemplo@correo.com" 
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm font-medium outline-none shadow-inner"
                        value={formData.patientEmail}
                        onChange={e => setFormData({...formData, patientEmail: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <CalendarIcon size={14} className="text-brand-primary" /> Fecha
                      </label>
                      <input 
                        type="date" 
                        required 
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm font-bold outline-none shadow-inner"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Clock size={14} className="text-brand-accent" /> Hora
                      </label>
                      <input 
                        type="time" 
                        required 
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm font-bold outline-none shadow-inner"
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <MapPin size={14} className="text-brand-secondary" /> Centro de Atención
                    </label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm font-bold outline-none shadow-inner appearance-none"
                      value={formData.sedeId}
                      onChange={e => setFormData({...formData, sedeId: e.target.value})}
                    >
                      {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
               </div>
               
               <button type="submit" className="w-full py-6 bg-brand-secondary text-white rounded-[2rem] font-bold text-base shadow-2xl shadow-brand-secondary/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3">
                  <CheckCircle size={22} /> Confirmar Cita
               </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE GESTIÓN Y EDICIÓN DE CITA - REDISEÑADO PARA SER MÁS ANCHO Y BALANCEADO */}
      {showEditModal && (
        <div className="fixed inset-0 z-[60] bg-brand-navy/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-fade-in overflow-hidden">
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-white/20 relative overflow-hidden flex flex-col animate-fade-in">
             
             {/* HEADER DEL MODAL */}
             <div className="p-8 pb-4 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/20">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center font-ubuntu font-bold text-4xl text-brand-navy shadow-sm border border-slate-100 shrink-0">
                    {editForm.patientName.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                       <h3 className="text-3xl font-ubuntu font-bold text-brand-navy leading-none">
                        {editForm.patientName || 'Gestión de Cita'}
                      </h3>
                      {activeSede && (
                        <div className="px-3 py-1.5 bg-brand-lightPrimary text-brand-primary text-[10px] font-bold uppercase tracking-widest rounded-xl border border-brand-primary/20 flex items-center gap-2">
                           <MapPin size={12} /> SEDE: {activeSede.name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-5 text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">
                       <span className="flex items-center gap-1.5"><CalendarIcon size={14} className="text-brand-primary" /> {showEditModal.date}</span>
                       <span className="flex items-center gap-1.5"><Clock size={14} className="text-brand-secondary" /> {showEditModal.time}</span>
                       <span className="flex items-center gap-1.5 text-brand-primary"><FileText size={14} /> ID: {showEditModal.bookingCode}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(null)} className="text-slate-300 hover:text-brand-navy p-3 transition-colors"><X size={32} /></button>
             </div>

             {/* CONTENIDO DEL MODAL EN DOS COLUMNAS */}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   
                   {/* Columna Izquierda: Información de Registro */}
                   <div className="space-y-6">
                      <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-6">
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3 flex items-center gap-2">
                            <User size={14} className="text-brand-primary" /> Ficha del Paciente
                         </h4>
                         
                         <div className="space-y-4">
                            <div className="space-y-1.5">
                               <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                               <input 
                                 type="text" 
                                 className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm font-bold text-brand-navy outline-none shadow-sm transition-all"
                                 value={editForm.patientName}
                                 onChange={e => setEditForm({...editForm, patientName: e.target.value})}
                               />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1.5">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">DNI / Identificación</label>
                                  <input 
                                    type="text" 
                                    className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm font-bold text-brand-navy outline-none shadow-sm transition-all"
                                    value={editForm.patientDni}
                                    onChange={e => setEditForm({...editForm, patientDni: e.target.value})}
                                  />
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                  <input 
                                    type="tel" 
                                    className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm font-bold text-brand-navy outline-none shadow-sm transition-all"
                                    value={editForm.patientPhone}
                                    onChange={e => setEditForm({...editForm, patientPhone: e.target.value})}
                                  />
                               </div>
                            </div>

                            <div className="space-y-1.5">
                               <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                               <input 
                                 type="email" 
                                 placeholder="pendiente@correo.com"
                                 className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm font-bold text-brand-navy outline-none shadow-sm transition-all"
                                 value={editForm.patientEmail}
                                 onChange={e => setEditForm({...editForm, patientEmail: e.target.value})}
                               />
                            </div>

                            <button 
                              onClick={() => { handleSaveChanges(); alert("Datos sincronizados."); }}
                              className="w-full py-3.5 bg-white border border-slate-200 text-brand-navy rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            >
                              <Save size={14} /> Guardar Cambios
                            </button>
                         </div>
                      </div>

                      {/* Botones de Cambio de Estado Rápidos */}
                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => handleUpdateStatus(showEditModal, AppointmentStatus.CONFIRMED)} 
                           className="py-4 bg-teal-50 text-teal-700 rounded-2xl font-bold text-[10px] flex items-center justify-center gap-3 hover:bg-teal-500 hover:text-white transition-all border border-teal-100 uppercase tracking-widest"
                         >
                           <CheckCircle size={16} /> Confirmar
                         </button>
                         <button 
                           onClick={() => handleUpdateStatus(showEditModal, AppointmentStatus.CANCELLED)} 
                           className="py-4 bg-red-50 text-red-700 rounded-2xl font-bold text-[10px] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all border border-red-100 uppercase tracking-widest"
                         >
                           <X size={16} /> Anular
                         </button>
                      </div>
                   </div>

                   {/* Columna Derecha: Acciones y Comunicación */}
                   <div className="flex flex-col gap-6">
                      <div className="p-8 bg-brand-lightPrimary/40 rounded-[2.5rem] border border-brand-primary/10 flex-1 flex flex-col justify-center text-center items-center">
                         <div className="w-16 h-16 bg-brand-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-lg mb-6">
                            <Zap size={32} />
                         </div>
                         <h4 className="text-xl font-ubuntu font-bold text-brand-navy mb-2">Canal de Comunicación</h4>
                         <p className="text-slate-500 text-xs font-medium max-w-[240px] leading-relaxed mb-8">
                            Inicia una conversación directa con el cliente desde el número de soporte de esta sede.
                         </p>
                         
                         <button 
                           onClick={handleWhatsAppChat}
                           className="w-full py-5 bg-green-500 text-white rounded-[2rem] font-bold text-sm flex items-center justify-center gap-4 hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95 group"
                         >
                           <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
                           Contactar vía WhatsApp
                         </button>
                      </div>

                      <div className="p-8 bg-brand-navy rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                               <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                  <Stethoscope size={18} className="text-brand-secondary" />
                               </div>
                               <h5 className="text-white font-ubuntu font-bold">Atención Clínica</h5>
                            </div>
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
                               Inicia el proceso de evolución médica y registro de historia para esta cita.
                            </p>
                            <button 
                               onClick={() => { 
                                 handleSaveChanges(); 
                                 onStartClinicalSession(showEditModal.id); 
                                 setShowEditModal(null); 
                               }} 
                               className="w-full py-4 bg-brand-secondary text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:shadow-2xl transition-all shadow-lg active:scale-95"
                            >
                               Abrir Expediente Médico <ExternalLink size={14} />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="absolute -right-32 -bottom-32 w-80 h-80 bg-brand-lightPrimary rounded-full blur-[80px] opacity-40 -z-10"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;
