
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  FileText, 
  ChevronRight, 
  Plus,
  History,
  Phone,
  Calendar,
  Stethoscope,
  X,
  IdCard,
  User as UserIcon,
  Save,
  Trash2,
  Clock,
  Zap,
  ChevronDown,
  CalendarDays,
  ClipboardCheck,
  MapPin,
  ClipboardList,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileSearch,
  // Add missing Activity icon import
  Activity
} from 'lucide-react';
import { Patient, ClinicalHistoryEntry, Appointment, AppointmentStatus, Sede, Professional } from '../types';

interface PatientDirectoryProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onAddHistoryEntry: (patientId: string, entry: ClinicalHistoryEntry) => void;
  onScheduleSessions?: (apts: Appointment[]) => void;
  sedes?: Sede[];
  professionals?: Professional[];
}

interface SessionDraft {
  id: string;
  date: string;
  time: string;
}

const PatientDirectory: React.FC<PatientDirectoryProps> = ({ 
  patients, 
  onAddPatient, 
  onAddHistoryEntry,
  onScheduleSessions,
  sedes = [],
  professionals = []
}) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'age'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(1);

  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    documentId: '',
    email: '',
    phone: '',
    birthDate: ''
  });

  const [newEntryForm, setNewEntryForm] = useState({
    diagnosis: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    isTreatmentPlan: false,
    numSessions: 3,
    frequency: 7, 
    sedeId: '',
    professionalId: '',
    sessions: [] as SessionDraft[]
  });

  useEffect(() => {
    if (showNewEntryModal) {
      setCurrentStep(1);
      if (sedes.length > 0 && !newEntryForm.sedeId) {
        setNewEntryForm(prev => ({ ...prev, sedeId: sedes[0].id }));
      }
      if (professionals.length > 0 && !newEntryForm.professionalId) {
        setNewEntryForm(prev => ({ ...prev, professionalId: professionals[0].id }));
      }
    }
  }, [showNewEntryModal, sedes, professionals]);

  useEffect(() => {
    if (newEntryForm.isTreatmentPlan) {
      const drafts: SessionDraft[] = [];
      const startDate = new Date();
      for (let i = 1; i <= newEntryForm.numSessions; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + (i * newEntryForm.frequency));
        drafts.push({
          id: `draft-${Date.now()}-${i}`,
          date: nextDate.toISOString().split('T')[0],
          time: "09:00"
        });
      }
      setNewEntryForm(prev => ({ ...prev, sessions: drafts }));
    } else {
      setNewEntryForm(prev => ({ ...prev, sessions: [] }));
    }
  }, [newEntryForm.isTreatmentPlan, newEntryForm.numSessions, newEntryForm.frequency]);

  const filteredAndSortedPatients = useMemo(() => {
    return patients
      .filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.documentId.includes(searchTerm)
      )
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'recent') {
          comparison = b.id.localeCompare(a.id);
        } else if (sortBy === 'age') {
          comparison = a.birthDate.localeCompare(b.birthDate);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [patients, searchTerm, sortBy, sortOrder]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: 'pat-' + Math.random().toString(36).substr(2, 9),
      name: newPatientForm.name,
      documentId: newPatientForm.documentId,
      email: newPatientForm.email || undefined,
      phone: newPatientForm.phone,
      birthDate: newPatientForm.birthDate,
      history: [],
      companyId: 'current-company' 
    };
    onAddPatient(newPatient);
    setNewPatientForm({ name: '', documentId: '', email: '', phone: '', birthDate: '' });
    setShowNewPatientModal(false);
  };

  const handleCreateEntry = () => {
    if (!selectedPatient) return;
    
    const newEntry: ClinicalHistoryEntry = {
      id: 'entry-' + Math.random().toString(36).substr(2, 9),
      date: newEntryForm.date,
      professionalId: newEntryForm.professionalId || 'p1',
      diagnosis: newEntryForm.diagnosis,
      notes: newEntryForm.notes,
      recommendations: newEntryForm.isTreatmentPlan ? `Plan de ${newEntryForm.sessions.length} sesiones.` : ''
    };
    
    onAddHistoryEntry(selectedPatient.id, newEntry);

    if (newEntryForm.isTreatmentPlan && onScheduleSessions) {
      const futureApts: Appointment[] = newEntryForm.sessions.map(s => ({
        id: 'apt-' + Math.random().toString(36).substr(2, 9),
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        patientDni: selectedPatient.documentId,
        patientId: selectedPatient.id,
        serviceId: 's1',
        sedeId: newEntryForm.sedeId,
        professionalId: newEntryForm.professionalId,
        date: s.date,
        time: s.time,
        status: AppointmentStatus.CONFIRMED,
        bookingCode: 'BEE-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        companyId: selectedPatient.companyId
      }));
      onScheduleSessions(futureApts);
    }
    
    setNewEntryForm(prev => ({ 
      ...prev, 
      diagnosis: '', 
      notes: '', 
      isTreatmentPlan: false,
      sessions: [] 
    }));
    setShowNewEntryModal(false);
    setCurrentStep(1);
  };

  const updateSession = (id: string, field: keyof SessionDraft, value: string) => {
    setNewEntryForm(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const steps = [
    { number: 1, title: 'Hallazgos', desc: 'Diagnóstico clínico', icon: FileSearch },
    { number: 2, title: 'Operación', desc: 'Asignación médica', icon: Activity },
    { number: 3, title: 'Plan (Opc)', desc: 'Agendamiento', optional: true, icon: Calendar }
  ];

  return (
    <div className="space-y-10 animate-fade-in h-[calc(100vh-10rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-ubuntu font-bold text-brand-navy tracking-tight">Directorio Clínico</h2>
          <p className="text-slate-500 font-medium mt-1">Gestión de expedientes y analítica de pacientes.</p>
        </div>
        <button 
          onClick={() => setShowNewPatientModal(true)}
          className="bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 hover:bg-brand-primary/90 shadow-xl transition-all active:scale-95"
        >
          <Plus size={20} /> Nuevo Expediente
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full overflow-hidden">
        {/* Sidebar Lista Pacientes */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col shadow-sm">
          <div className="p-8 border-b border-slate-100 space-y-4 bg-slate-50/20">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por DNI o Nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-secondary text-sm outline-none shadow-sm transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {filteredAndSortedPatients.map(p => (
              <button 
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                  selectedPatient?.id === p.id 
                    ? 'bg-brand-secondary/[0.04] border-brand-secondary shadow-md' 
                    : 'bg-white border-transparent hover:bg-slate-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-ubuntu font-bold text-lg ${selectedPatient?.id === p.id ? 'bg-brand-secondary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {p.name.charAt(0)}
                </div>
                <div className="text-left flex-1 truncate">
                  <p className="font-bold text-brand-navy text-sm truncate">{p.name}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{p.documentId}</p>
                </div>
                <ChevronRight size={14} className={selectedPatient?.id === p.id ? 'text-brand-secondary' : 'text-slate-200'} />
              </button>
            ))}
          </div>
        </div>

        {/* Detalle del Paciente */}
        <div className="lg:col-span-8 overflow-y-auto custom-scrollbar pr-2 h-full">
          {selectedPatient ? (
            <div className="space-y-8 animate-fade-in pb-20">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="w-24 h-24 rounded-3xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary text-4xl font-ubuntu font-bold shadow-inner">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-ubuntu font-bold text-brand-navy leading-none">{selectedPatient.name}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><IdCard size={14} className="text-brand-primary" /> {selectedPatient.documentId}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-accent" /> {calculateAge(selectedPatient.birthDate)} Años</span>
                    <span className="flex items-center gap-1.5"><Phone size={14} className="text-brand-secondary" /> {selectedPatient.phone}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNewEntryModal(true)}
                  className="bg-brand-navy text-white px-8 py-4 rounded-[2rem] font-bold text-xs flex items-center gap-3 hover:bg-brand-navy/90 shadow-xl transition-all active:scale-95"
                >
                  <ClipboardCheck size={18} className="text-brand-secondary" /> Evolución Manual
                </button>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-10">
                <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                   <h4 className="font-ubuntu font-bold text-2xl text-brand-navy flex items-center gap-3">
                     <History className="text-brand-secondary" /> Historial Clínico
                   </h4>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl">{selectedPatient.history.length} Registros</span>
                </div>
                <div className="space-y-10">
                  {selectedPatient.history.length > 0 ? (
                    selectedPatient.history.map((entry) => (
                      <div key={entry.id} className="relative pl-12 border-l-2 border-slate-100 last:border-transparent pb-10">
                        <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-white border-4 border-brand-secondary shadow-sm"></div>
                        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest bg-brand-lightSecondary px-3 py-1 rounded-lg border border-brand-secondary/10 flex items-center gap-2">
                               <Calendar size={12} /> {entry.date}
                            </span>
                          </div>
                          <h5 className="font-ubuntu font-bold text-brand-navy text-lg">{entry.diagnosis}</h5>
                          <p className="text-sm text-slate-500 italic leading-relaxed bg-white p-5 rounded-2xl border border-slate-50 shadow-inner">{entry.notes}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-slate-300">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                         <FileText size={48} className="opacity-20" />
                      </div>
                      <p className="font-bold text-sm text-slate-400">No hay evoluciones registradas aún.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 p-20 text-center">
              <Users size={80} className="mb-6 opacity-10" />
              <h3 className="text-2xl font-ubuntu font-bold text-brand-navy/20">Selecciona un Paciente</h3>
              <p className="mt-2 font-medium">Gestiona expedientes médicos de forma centralizada.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL EVOLUCIÓN MANUAL - REDISEÑADO PARA SER MÁS ANCHO Y BALANCEDO */}
      {showNewEntryModal && selectedPatient && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in overflow-hidden">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[85vh] shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-white/20 flex overflow-hidden animate-fade-in relative">
             
             {/* PANEL IZQUIERDO: INDICADOR DE PASOS */}
             <div className="w-72 bg-slate-50/50 border-r border-slate-100 p-10 flex flex-col shrink-0">
                <div className="mb-12">
                   <div className="w-16 h-16 bg-brand-navy text-white rounded-3xl flex items-center justify-center shadow-lg mb-6">
                      <ClipboardList size={32} className="text-brand-secondary" />
                   </div>
                   <h3 className="text-2xl font-ubuntu font-bold text-brand-navy leading-tight">Registro Médico</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 truncate">{selectedPatient.name}</p>
                </div>

                <div className="space-y-10 flex-1">
                   {steps.map((s) => {
                     const isDone = currentStep > s.number;
                     const isCurrent = currentStep === s.number;
                     return (
                       <div key={s.number} className={`flex gap-4 items-center transition-all ${isCurrent || isDone ? 'opacity-100' : 'opacity-30'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-ubuntu font-bold text-xs transition-all ${
                            isDone ? 'bg-brand-secondary text-white shadow-md' : isCurrent ? 'bg-brand-navy text-white shadow-md' : 'bg-white text-slate-300 border border-slate-100'
                          }`}>
                             {isDone ? <CheckCircle2 size={18} /> : s.number}
                          </div>
                          <div>
                             <p className={`text-xs font-bold tracking-wide transition-all ${isCurrent ? 'text-brand-navy' : 'text-slate-400'}`}>{s.title}</p>
                             <p className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">{s.desc}</p>
                          </div>
                       </div>
                     );
                   })}
                </div>

                <button 
                  onClick={() => setShowNewEntryModal(false)}
                  className="flex items-center gap-3 text-slate-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-all mt-auto"
                >
                  <X size={16} /> Cancelar Registro
                </button>
             </div>

             {/* CONTENIDO PRINCIPAL EN COLUMNA CENTRAL */}
             <div className="flex-1 flex flex-col bg-white">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                   {currentStep === 1 && (
                     <div className="space-y-10 animate-fade-in">
                        <div>
                           <h4 className="text-3xl font-ubuntu font-bold text-brand-navy">Hallazgos Médicos</h4>
                           <p className="text-slate-400 text-sm font-medium mt-1">Ingresa el diagnóstico y las notas detalladas de la sesión.</p>
                        </div>
                        
                        <div className="space-y-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                 <IdCard size={14} className="text-brand-secondary" /> Título / Diagnóstico Corto
                              </label>
                              <input 
                                 required 
                                 placeholder="Ej: Evaluación de rutina / Tratamiento correctivo..." 
                                 className="w-full px-7 py-5 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-brand-secondary font-bold text-base text-brand-navy shadow-inner outline-none transition-all placeholder:text-slate-300"
                                 value={newEntryForm.diagnosis}
                                 onChange={e => setNewEntryForm({...newEntryForm, diagnosis: e.target.value})}
                              />
                           </div>
                           
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                 <FileText size={14} className="text-brand-primary" /> Notas Detalladas de Evolución
                              </label>
                              <textarea 
                                 required 
                                 placeholder="Ingresa los detalles clínicos observados..." 
                                 className="w-full px-8 py-7 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-brand-primary text-sm font-medium text-slate-700 min-h-[280px] shadow-inner resize-none outline-none transition-all placeholder:text-slate-300 leading-relaxed"
                                 value={newEntryForm.notes}
                                 onChange={e => setNewEntryForm({...newEntryForm, notes: e.target.value})}
                              />
                           </div>
                        </div>
                     </div>
                   )}

                   {currentStep === 2 && (
                     <div className="space-y-10 animate-fade-in">
                        <div>
                           <h4 className="text-3xl font-ubuntu font-bold text-brand-navy">Configuración de Operación</h4>
                           <p className="text-slate-400 text-sm font-medium mt-1">Define el especialista y centro de atención.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                 <MapPin size={14} className="text-brand-accent" /> Centro de Atención (Sede)
                              </label>
                              <div className="relative">
                                 <select 
                                    className="w-full pl-12 pr-10 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none font-bold text-sm appearance-none text-brand-navy cursor-pointer shadow-inner"
                                    value={newEntryForm.sedeId}
                                    onChange={e => setNewEntryForm({...newEntryForm, sedeId: e.target.value})}
                                 >
                                    {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                 </select>
                                 <MapPin size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                 <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                 <UserIcon size={14} className="text-brand-secondary" /> Profesional a Cargo
                              </label>
                              <div className="relative">
                                 <select 
                                    className="w-full pl-12 pr-10 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary outline-none font-bold text-sm appearance-none text-brand-navy cursor-pointer shadow-inner"
                                    value={newEntryForm.professionalId}
                                    onChange={e => setNewEntryForm({...newEntryForm, professionalId: e.target.value})}
                                 >
                                    {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                 </select>
                                 <Stethoscope size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                 <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                              </div>
                           </div>
                        </div>

                        <div className="p-10 bg-brand-lightSecondary/40 rounded-[3rem] border border-brand-secondary/10 flex items-center justify-between">
                           <div className="flex items-center gap-6">
                              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg ${newEntryForm.isTreatmentPlan ? 'bg-brand-secondary text-white' : 'bg-white text-slate-300'}`}>
                                 <Zap size={32} />
                              </div>
                              <div>
                                 <span className="text-lg font-ubuntu font-bold text-brand-navy block">¿Activar Plan de Tratamiento?</span>
                                 <span className="text-xs font-medium text-slate-500">Programa automáticamente sesiones de seguimiento futuro.</span>
                              </div>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer scale-125">
                              <input type="checkbox" checked={newEntryForm.isTreatmentPlan} onChange={() => setNewEntryForm(p => ({...p, isTreatmentPlan: !p.isTreatmentPlan}))} className="sr-only peer" />
                              <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-brand-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 shadow-inner"></div>
                           </label>
                        </div>
                     </div>
                   )}

                   {currentStep === 3 && (
                     <div className="space-y-10 animate-fade-in">
                        <div>
                           <h4 className="text-3xl font-ubuntu font-bold text-brand-navy">Proyección de Sesiones</h4>
                           <p className="text-slate-400 text-sm font-medium mt-1">Configura la frecuencia y el total de visitas proyectadas.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 bg-slate-50 p-10 rounded-[2.5rem] shadow-inner">
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Total de Sesiones</label>
                              <input type="number" min="1" max="15" className="w-full px-6 py-4 bg-white rounded-2xl text-base font-bold border-none focus:ring-2 focus:ring-brand-secondary shadow-sm" value={newEntryForm.numSessions} onChange={e => setNewEntryForm(p => ({...p, numSessions: parseInt(e.target.value) || 1}))} />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Frecuencia cada (Días)</label>
                              <input type="number" min="1" max="30" className="w-full px-6 py-4 bg-white rounded-2xl text-base font-bold border-none focus:ring-2 focus:ring-brand-secondary shadow-sm" value={newEntryForm.frequency} onChange={e => setNewEntryForm(p => ({...p, frequency: parseInt(e.target.value) || 1}))} />
                           </div>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                           {newEntryForm.sessions.map((s, idx) => (
                              <div key={s.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-6 group hover:shadow-md transition-all">
                                 <span className="w-10 h-10 bg-brand-navy text-white text-[11px] flex items-center justify-center font-bold rounded-xl shrink-0 shadow-lg">{idx + 1}</span>
                                 <div className="grid grid-cols-2 gap-4 flex-1">
                                    <input type="date" value={s.date} onChange={e => updateSession(s.id, 'date', e.target.value)} className="bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-brand-navy outline-none" />
                                    <input type="time" value={s.time} onChange={e => updateSession(s.id, 'time', e.target.value)} className="bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-brand-navy outline-none" />
                                 </div>
                                 <button onClick={() => setNewEntryForm(prev => ({...prev, sessions: prev.sessions.filter(it => it.id !== s.id)}))} className="text-slate-200 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
                              </div>
                           ))}
                        </div>
                     </div>
                   )}
                </div>

                {/* PIE DE PÁGINA: ACCIONES */}
                <div className="px-12 py-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
                   {currentStep > 1 ? (
                     <button 
                        onClick={() => setCurrentStep(prev => prev - 1)} 
                        className="flex items-center gap-3 px-8 py-4 text-slate-500 font-bold text-xs hover:text-brand-navy transition-all uppercase tracking-[0.2em]"
                     >
                        <ChevronLeft size={20} /> Atrás
                     </button>
                   ) : <div />}

                   <div className="flex gap-4">
                     {currentStep < (newEntryForm.isTreatmentPlan ? 3 : 2) ? (
                        <button 
                           onClick={() => {
                              if (currentStep === 1 && (!newEntryForm.diagnosis || !newEntryForm.notes)) return alert("Por favor ingresa diagnóstico y notas.");
                              setCurrentStep(prev => prev + 1);
                           }}
                           className="bg-brand-navy text-white px-12 py-5 rounded-[2rem] font-bold text-sm flex items-center gap-4 hover:shadow-2xl transition-all shadow-xl active:scale-95"
                        >
                           Continuar <ArrowRight size={20} className="text-brand-secondary" />
                        </button>
                     ) : (
                        <button 
                           onClick={handleCreateEntry}
                           className="bg-brand-secondary text-white px-14 py-5 rounded-[2rem] font-bold text-sm flex items-center gap-4 shadow-2xl shadow-brand-secondary/30 hover:scale-[1.02] transition-all active:scale-95"
                        >
                           <Save size={20} /> Registrar Atención Clínica
                        </button>
                     )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Expediente - Manteniendo Estilo */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-[60] bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-[0_40px_80px_rgba(0,0,0,0.3)] border border-slate-100 relative">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-ubuntu font-bold text-brand-navy leading-none">Nuevo Expediente</h3>
                 <button onClick={() => setShowNewPatientModal(false)} className="text-slate-300 hover:text-brand-navy"><X size={28} /></button>
              </div>
              <form onSubmit={handleCreatePatient} className="space-y-6">
                 <div className="space-y-4">
                    <input required placeholder="Nombre Completo" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner outline-none transition-all" value={newPatientForm.name} onChange={e => setNewPatientForm({...newPatientForm, name: e.target.value})} />
                    <input required placeholder="DNI / Documento" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner outline-none transition-all" value={newPatientForm.documentId} onChange={e => setNewPatientForm({...newPatientForm, documentId: e.target.value})} />
                    <input placeholder="Correo Electrónico" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner outline-none transition-all" value={newPatientForm.email} onChange={e => setNewPatientForm({...newPatientForm, email: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                       <input required placeholder="Teléfono" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-medium text-sm shadow-inner outline-none transition-all" value={newPatientForm.phone} onChange={e => setNewPatientForm({...newPatientForm, phone: e.target.value})} />
                       <input required type="date" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-secondary font-bold text-xs shadow-inner outline-none transition-all" value={newPatientForm.birthDate} onChange={e => setNewPatientForm({...newPatientForm, birthDate: e.target.value})} />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-brand-primary text-white rounded-[2rem] font-bold shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] transition-all mt-4">Desplegar Expediente Médico</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PatientDirectory;
