
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Stethoscope, 
  ArrowLeft, 
  Save, 
  Activity,
  AlertCircle,
  Sparkles,
  Loader2,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Trash2,
  MapPin,
  User,
  Zap,
  CheckCircle2,
  ArrowRight,
  IdCard,
  FileSearch,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Appointment, AppointmentStatus, ClinicalHistoryEntry } from '../types';
import { summarizeClinicalNotes, suggestDiagnosis } from '../services/geminiService';

interface SessionDraft {
  id: string;
  date: string;
  time: string;
}

interface ClinicalRecordFormProps {
  appointment: Appointment;
  onClose: () => void;
  onSaveRecord: (patientId: string, entry: ClinicalHistoryEntry) => void;
  onScheduleSessions: (apts: Appointment[]) => void;
}

const ClinicalRecordForm: React.FC<ClinicalRecordFormProps> = ({ 
  appointment, 
  onClose, 
  onSaveRecord, 
  onScheduleSessions 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isTreatmentPlan, setIsTreatmentPlan] = useState(false);
  const [numSessions, setNumSessions] = useState(3);
  const [frequency, setFrequency] = useState(7);
  const [sessions, setSessions] = useState<SessionDraft[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const steps = [
    { number: 1, title: 'Hallazgos', desc: 'Diagnóstico clínico', icon: FileSearch },
    { number: 2, title: 'Procedimiento', desc: 'Acciones médicas', icon: Activity },
    { number: 3, title: 'Plan (Opc)', desc: 'Seguimiento futuro', icon: Calendar }
  ];

  useEffect(() => {
    if (isTreatmentPlan && sessions.length === 0) {
      generateDefaultSessions();
    }
  }, [isTreatmentPlan]);

  const generateDefaultSessions = () => {
    const drafts: SessionDraft[] = [];
    const startDate = new Date();
    for (let i = 1; i <= numSessions; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + (i * frequency));
      drafts.push({
        id: `draft-${Date.now()}-${i}`,
        date: nextDate.toISOString().split('T')[0],
        time: appointment.time
      });
    }
    setSessions(drafts);
  };

  const handleAiAssistant = async () => {
    if (!notes || notes.length < 10) {
      alert("Por favor ingrese más detalles para que el asistente pueda analizarlos.");
      return;
    }
    setIsAiLoading(true);
    try {
      const summary = await summarizeClinicalNotes(notes);
      const aiSuggestions = await suggestDiagnosis(notes);
      
      setRecommendations(prev => prev + (prev ? '\n\n' : '') + "💡 Recomendación IA:\n" + summary);
      
      if (aiSuggestions?.suggestions?.length > 0) {
        if (!diagnosis) setDiagnosis(aiSuggestions.suggestions[0]);
        else alert(`Sugerencia de diagnóstico: ${aiSuggestions.suggestions.join(', ')}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = () => {
    if (!diagnosis || !notes) {
      setCurrentStep(1);
      alert("El diagnóstico y las notas de evolución son obligatorios.");
      return;
    }

    const entry: ClinicalHistoryEntry = {
      id: 'entry-' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      professionalId: appointment.professionalId,
      diagnosis,
      notes,
      recommendations,
      appointmentId: appointment.id
    };

    onSaveRecord(appointment.patientId || 'unknown', entry);

    if (isTreatmentPlan && sessions.length > 0) {
      const futureApts: Appointment[] = sessions.map(s => ({
        id: 'apt-' + Math.random().toString(36).substr(2, 9),
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
        patientDni: appointment.patientDni,
        patientId: appointment.patientId,
        serviceId: appointment.serviceId,
        sedeId: appointment.sedeId,
        professionalId: appointment.professionalId,
        date: s.date,
        time: s.time,
        status: AppointmentStatus.CONFIRMED,
        bookingCode: 'BEE-PLAN-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        notes: `Plan iniciado el ${entry.date}`,
        companyId: appointment.companyId
      }));
      onScheduleSessions(futureApts);
    }

    onClose();
  };

  const updateSession = (id: string, field: keyof SessionDraft, value: string) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-100 flex items-center justify-center p-0 md:p-8 animate-fade-in">
      <div className="bg-white w-full max-w-6xl h-full md:h-[90vh] rounded-none md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20">
        
        {/* SIDEBAR DE CONTROL CLÍNICO */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 p-10 flex flex-col shrink-0">
          <div className="mb-12">
            <div className="w-16 h-16 bg-brand-navy rounded-[1.75rem] flex items-center justify-center shadow-xl shadow-brand-navy/10 mb-6">
              <Stethoscope size={32} className="text-brand-primary" />
            </div>
            <h3 className="text-3xl font-ubuntu font-bold text-brand-navy leading-none">Evolución</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-3">Registro de Atención</p>
          </div>

          <nav className="space-y-10 flex-1">
            {steps.map((s) => {
              const isDone = currentStep > s.number;
              const isCurrent = currentStep === s.number;
              const Icon = s.icon;
              return (
                <div key={s.number} className={`flex items-center gap-5 transition-all duration-500 ${isCurrent || isDone ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-ubuntu font-bold transition-all duration-500 ${
                    isDone ? 'bg-brand-primary text-white shadow-lg' : isCurrent ? 'bg-brand-navy text-white shadow-xl' : 'bg-white text-slate-300 border border-slate-100'
                  }`}>
                    {isDone ? <CheckCircle2 size={24} /> : s.number}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold tracking-wide ${isCurrent ? 'text-brand-navy' : 'text-slate-400'}`}>{s.title}</h4>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto space-y-6">
            <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-brand-lightPrimary rounded-full -mr-8 -mt-8 opacity-40 group-hover:scale-150 transition-transform"></div>
               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-3 relative z-10">Paciente Actual</p>
               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-brand-lightPrimary text-brand-primary rounded-xl flex items-center justify-center font-bold text-lg">
                    {appointment.patientName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-brand-navy text-sm truncate">{appointment.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{appointment.bookingCode}</p>
                  </div>
               </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="w-full flex items-center justify-center gap-3 text-slate-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-[0.2em] transition-all p-3"
            >
              <ArrowLeft size={16} /> Cancelar Atención
            </button>
          </div>
        </div>

        {/* ÁREA DE TRABAJO MÉDICO */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-16">
            
            {currentStep === 1 && (
              <div className="max-w-3xl mx-auto space-y-12 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-4xl font-ubuntu font-bold text-brand-navy tracking-tight">Registro de Hallazgos</h2>
                    <p className="text-slate-500 font-medium text-lg mt-2">Detalla los hallazgos clínicos de la sesión de hoy.</p>
                  </div>
                  <button 
                    onClick={handleAiAssistant}
                    disabled={isAiLoading || !notes}
                    className="flex items-center gap-3 bg-brand-lightPrimary text-brand-primary px-8 py-4 rounded-2xl font-bold text-xs hover:bg-brand-primary hover:text-white transition-all shadow-sm group disabled:opacity-50"
                  >
                    {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
                    Analítica IA
                  </button>
                </div>
                
                <div className="space-y-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                      <IdCard size={14} className="text-brand-primary" /> Diagnóstico Preliminar
                    </label>
                    <input 
                      required 
                      placeholder="Ej: Onicocriptosis bilateral leve" 
                      className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-brand-primary font-bold text-xl text-brand-navy shadow-inner outline-none transition-all placeholder:text-slate-200"
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                      <FileText size={14} className="text-brand-secondary" /> Notas Médicas de Evolución
                    </label>
                    <textarea 
                      required 
                      placeholder="Ingresa los hallazgos, síntomas y observaciones relevantes observadas en el paciente..." 
                      className="w-full px-10 py-10 bg-slate-50 border-none rounded-[3rem] focus:ring-2 focus:ring-brand-secondary text-base font-medium text-slate-700 min-h-[350px] shadow-inner resize-none outline-none transition-all leading-relaxed placeholder:text-slate-200"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="max-w-3xl mx-auto space-y-12 animate-fade-in">
                <div>
                  <h2 className="text-4xl font-ubuntu font-bold text-brand-navy tracking-tight">Operación Médica</h2>
                  <p className="text-slate-500 font-medium text-lg mt-2">Recomendaciones y plan terapéutico inmediato.</p>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                      <AlertCircle size={14} className="text-brand-accent" /> Indicaciones y Cuidados
                    </label>
                    <textarea 
                      placeholder="Ingresa las indicaciones para el paciente, medicamentos o ejercicios de recuperación..." 
                      className="w-full px-10 py-8 bg-slate-50 border-none rounded-[2.5rem] focus:ring-2 focus:ring-brand-accent text-base font-medium text-slate-600 min-h-[200px] shadow-inner resize-none outline-none transition-all leading-relaxed"
                      value={recommendations}
                      onChange={e => setRecommendations(e.target.value)}
                    />
                  </div>

                  <div className="p-10 bg-brand-lightPrimary/50 rounded-[3.5rem] border border-brand-primary/10 flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="flex items-center gap-6">
                      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl transition-all duration-500 ${isTreatmentPlan ? 'bg-brand-primary text-white scale-110' : 'bg-white text-slate-300'}`}>
                        <Zap size={36} />
                      </div>
                      <div className="text-center md:text-left">
                        <h4 className="text-2xl font-ubuntu font-bold text-brand-navy">Plan de Continuidad</h4>
                        <p className="text-sm font-medium text-slate-500 mt-1">Habilita esta opción para programar sesiones de seguimiento futuras.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer scale-150">
                      <input type="checkbox" checked={isTreatmentPlan} onChange={() => setIsTreatmentPlan(!isTreatmentPlan)} className="sr-only peer" />
                      <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-brand-primary transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="max-w-3xl mx-auto space-y-12 animate-fade-in">
                <div>
                  <h2 className="text-4xl font-ubuntu font-bold text-brand-navy tracking-tight">Proyección de Sesiones</h2>
                  <p className="text-slate-500 font-medium text-lg mt-2">Configuración masiva de visitas de seguimiento.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-10 rounded-[3rem] shadow-inner border border-slate-100/50">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Frecuencia de Atención</label>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100">
                      <input 
                        type="number" 
                        min="1" 
                        className="flex-1 p-3 bg-transparent border-none text-brand-navy font-bold focus:ring-0 text-center" 
                        value={frequency} 
                        onChange={e => setFrequency(parseInt(e.target.value) || 1)} 
                      />
                      <span className="text-[10px] font-bold text-slate-300 uppercase pr-4">Días</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cantidad de Visitas</label>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100">
                      <input 
                        type="number" 
                        min="1" 
                        max="20" 
                        className="flex-1 p-3 bg-transparent border-none text-brand-navy font-bold focus:ring-0 text-center" 
                        value={numSessions} 
                        onChange={e => setNumSessions(parseInt(e.target.value) || 1)} 
                      />
                      <span className="text-[10px] font-bold text-slate-300 uppercase pr-4">Sesiones</span>
                    </div>
                  </div>
                  <button onClick={generateDefaultSessions} className="md:col-span-2 py-3 text-brand-primary font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-lightPrimary rounded-xl transition-all">
                    <Plus size={14} /> Regenerar Proyección Automática
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar p-1">
                  {sessions.map((s, idx) => (
                    <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-6 group hover:shadow-xl hover:border-brand-primary transition-all translate-y-0 hover:-translate-y-1">
                      <div className="w-12 h-12 bg-brand-navy text-white text-[12px] flex items-center justify-center font-bold rounded-2xl shrink-0 shadow-lg">
                        {idx + 1}
                      </div>
                      <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="relative">
                           <input type="date" value={s.date} onChange={e => updateSession(s.id, 'date', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl py-3 px-5 text-xs font-bold text-brand-navy outline-none" />
                        </div>
                        <div className="relative">
                           <input type="time" value={s.time} onChange={e => updateSession(s.id, 'time', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl py-3 px-5 text-xs font-bold text-brand-navy outline-none" />
                        </div>
                      </div>
                      <button onClick={() => setSessions(prev => prev.filter(it => it.id !== s.id))} className="text-slate-200 hover:text-red-500 p-3 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BARRA DE CONTROL INFERIOR */}
          <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            {currentStep > 1 ? (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)} 
                className="flex items-center gap-3 px-10 py-5 text-slate-400 font-bold text-xs hover:text-brand-navy transition-all uppercase tracking-[0.3em]"
              >
                <ChevronLeft size={20} /> Retroceder
              </button>
            ) : <div />}

            <div className="flex gap-6">
              {currentStep < (isTreatmentPlan ? 3 : 2) ? (
                <button 
                  onClick={() => {
                    if (currentStep === 1 && (!diagnosis || !notes)) return alert("Completa el diagnóstico y las notas antes de seguir.");
                    setCurrentStep(prev => prev + 1);
                  }}
                  className="bg-brand-navy text-white px-12 py-5 rounded-[2rem] font-bold text-sm flex items-center gap-5 shadow-2xl hover:bg-brand-navy/90 transition-all active:scale-[0.98] border border-white/5"
                >
                  Continuar <ArrowRight size={20} className="text-brand-primary" />
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  className="bg-brand-primary text-white px-14 py-6 rounded-[2.5rem] font-bold text-base flex items-center gap-5 shadow-[0_20px_50px_rgba(0,191,165,0.3)] hover:scale-[1.03] transition-all active:scale-95 border border-white/10"
                >
                  <Save size={24} /> Finalizar Registro Médico
                </button>
              )}
            </div>
          </div>
          
          <div className="absolute top-20 right-[-100px] w-64 h-64 bg-brand-lightPrimary rounded-full blur-[100px] opacity-20 -z-10"></div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalRecordForm;
