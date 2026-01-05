
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  ArrowLeft,
  Phone,
  User as UserIcon,
  MessageCircle,
  ArrowRight,
  IdCard,
  Navigation,
  CheckCircle2,
  Loader2,
  CalendarCheck,
  Zap,
  AlertCircle,
  Heart,
  ExternalLink
} from 'lucide-react';
import { Sede, Company } from '../types';

type Step = 'sede' | 'info' | 'schedule' | 'confirm' | 'success';

interface PatientPortalProps {
  company: Company;
  sedes: Sede[];
  onBack: () => void;
  onPortalBooking: (data: any) => Promise<boolean>;
}

const PatientPortal: React.FC<PatientPortalProps> = ({ company, sedes, onBack, onPortalBooking }) => {
  const [step, setStep] = useState<Step>('sede');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState({
    sede: null as Sede | null,
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientDni: '',
    countryCode: '+51',
    date: new Date().toISOString().split('T')[0],
    time: ''
  });

  const primaryColor = company.primaryColor || '#00BFA5';

  const isPhoneValid = useMemo(() => {
    const digits = booking.patientPhone.replace(/\D/g, '');
    return digits.length === 9;
  }, [booking.patientPhone]);

  const isInfoStepComplete = useMemo(() => {
    return booking.patientName.trim().length >= 3 && isPhoneValid;
  }, [booking.patientName, isPhoneValid]);

  const generateWaUrl = () => {
    const clinicWhatsapp = booking.sede?.whatsapp || "51900000000"; 
    const message = `Hola! Reservé una cita en ${company.name}:\n\n👤 *Nombre:* ${booking.patientName}\n📍 *Sede:* ${booking.sede?.name}\n📅 *Fecha:* ${booking.date}\n⏰ *Hora:* ${booking.time}\n\nEspero confirmación!`;
    return `https://wa.me/${clinicWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    const success = await onPortalBooking({
      patientName: booking.patientName,
      patientPhone: `${booking.countryCode}${booking.patientPhone}`,
      patientEmail: booking.patientEmail,
      patientDni: booking.patientDni,
      date: booking.date,
      time: booking.time,
      sedeId: booking.sede?.id
    });

    if (success) {
      // Intentamos abrir WhatsApp
      const waUrl = generateWaUrl();
      try {
        window.open(waUrl, '_blank');
      } catch (e) {
        console.warn("Popup blocked by browser");
      }
      
      // En lugar de llamar a onBack() que redirige al login, mostramos la pantalla de éxito
      setStep('success');
    } else {
      alert("Hubo un problema al procesar su cita. Por favor intente nuevamente.");
    }
    setIsSubmitting(false);
  };

  const getMapsUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const steps: Step[] = ['sede', 'info', 'schedule', 'confirm'];
  const currentIdx = steps.indexOf(step === 'success' ? 'confirm' : step);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-inter overflow-x-hidden text-brand-navy">
      {/* Header Fijo Minimalista */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-center sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm transition-transform active:scale-95">
            <img src={company.logo} alt="Logo" className="w-full h-full object-contain p-1.5" />
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <span className="font-ubuntu font-bold text-brand-navy text-lg leading-none tracking-tight">{company.name}</span>
            <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-slate-400 mt-0.5 text-center sm:text-left">Citas Online</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        {step !== 'success' && (
          <div className="w-full h-[360px] md:h-[480px] relative overflow-hidden flex items-center justify-center bg-[#0D0D33]">
             <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D33]/60 via-[#0D0D33]/80 to-[#F8FAFC]"></div>
             <div className="relative z-10 text-center px-6 max-w-2xl animate-fade-in flex flex-col items-center">
                <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-2xl mb-8 border border-white/10 animate-pulse">
                  <Zap className="text-white fill-white" size={32} />
                </div>
                <h1 className="text-white text-4xl md:text-7xl font-ubuntu font-bold tracking-tight drop-shadow-2xl text-balance leading-[1.1]">
                  Cuidado experto <br/> para tus <span className="text-brand-primary italic">pies</span>
                </h1>
                <p className="text-slate-300 font-medium text-base md:text-2xl mt-8 max-w-md mx-auto leading-relaxed drop-shadow-lg">
                  Agenda tu atención profesional hoy mismo desde tu celular.
                </p>
             </div>
          </div>
        )}

        {/* Flujo Principal */}
        <div className={`max-w-4xl w-full relative z-20 px-4 pb-24 ${step === 'success' ? 'mt-10 md:mt-20' : '-mt-16'}`}>
            
            {/* Indicador de Progreso (Oculto en Success) */}
            {step !== 'success' && (
              <div className="flex items-center justify-between gap-2 mb-8 overflow-x-auto no-scrollbar py-5 bg-white/95 backdrop-blur-md rounded-[2.5rem] px-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-white">
              {steps.map((s, idx) => (
                  <React.Fragment key={s}>
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <div 
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-bold transition-all duration-500 ${
                              idx < currentIdx ? 'bg-green-100 text-brand-primary' : 
                              idx === currentIdx ? 'text-white shadow-xl scale-110 ring-4 ring-brand-primary/10' : 
                              'bg-slate-50 text-slate-300'
                              }`} 
                              style={{ backgroundColor: idx === currentIdx ? primaryColor : undefined }}
                          >
                              {idx < currentIdx ? <CheckCircle2 size={18} /> : idx + 1}
                          </div>
                      </div>
                      {idx < steps.length - 1 && (
                          <div className={`flex-1 min-w-[20px] h-[2px] rounded-full transition-all duration-500 ${idx < currentIdx ? 'opacity-100' : 'bg-slate-100'}`} style={{ backgroundColor: idx < currentIdx ? primaryColor : undefined }} />
                      )}
                  </React.Fragment>
              ))}
              </div>
            )}

            {/* Tarjeta de Formulario */}
            <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.08)] border border-slate-50 overflow-hidden flex flex-col min-h-[550px]">
                
                {/* Paso 1: Sedes */}
                {step === 'sede' && (
                  <div className="p-8 md:p-14 space-y-10 animate-fade-in flex-1">
                      <div className="text-center">
                        <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">¿Dónde te atenderás?</h2>
                        <p className="text-slate-400 text-sm font-medium mt-2">Selecciona la sede más conveniente para ti.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sedes.map(s => (
                            <div key={s.id} className="group relative">
                              <div className="w-full p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-brand-primary/20 transition-all text-left flex flex-col h-full">
                                  <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                                        <MapPin size={28} />
                                    </div>
                                    <a 
                                      href={getMapsUrl(s.address)} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-brand-primary hover:text-white transition-all border border-slate-100"
                                    >
                                      <Navigation size={20} />
                                    </a>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-ubuntu font-bold text-xl group-hover:text-brand-primary transition-colors mb-2">{s.name}</h4>
                                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{s.address}</p>
                                  </div>
                                  <button 
                                    onClick={() => { setBooking(prev => ({...prev, sede: s})); setStep('info'); }}
                                    className="mt-8 w-full py-5 rounded-[1.5rem] text-white font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 hover:brightness-110"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    Seleccionar Sede <ArrowRight size={16} />
                                  </button>
                              </div>
                            </div>
                        ))}
                      </div>
                  </div>
                )}

                {/* Paso 2: Información del Paciente */}
                {step === 'info' && (
                  <div className="p-8 md:p-14 space-y-10 animate-fade-in max-w-xl mx-auto w-full flex-1 flex flex-col justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">Tus Datos</h2>
                      <p className="text-slate-400 text-sm font-medium mt-2">Completa tu información para agendar tu atención.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <UserIcon size={12} style={{ color: primaryColor }} /> Nombre Completo <span className="text-red-400">*</span>
                            </label>
                            <input 
                              type="text" 
                              value={booking.patientName} 
                              onChange={(e) => setBooking(prev => ({...prev, patientName: e.target.value}))} 
                              className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.25rem] focus:ring-2 font-bold text-brand-navy outline-none shadow-inner text-base placeholder:text-slate-300 transition-all" 
                              style={{ '--tw-ring-color': primaryColor } as any} 
                              placeholder="Ej: Juan Pérez" 
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Phone size={12} style={{ color: primaryColor }} /> WhatsApp <span className="text-red-400">*</span>
                              </label>
                              <div className="flex gap-2">
                                <div className="bg-slate-50 px-4 py-5 rounded-[1.25rem] font-bold text-slate-400 shadow-inner flex items-center text-sm">+51</div>
                                <input 
                                  type="tel" 
                                  value={booking.patientPhone} 
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                                    setBooking(prev => ({...prev, patientPhone: val}));
                                  }} 
                                  className={`flex-1 px-6 py-5 bg-slate-50 border-2 rounded-[1.25rem] focus:ring-2 font-bold text-brand-navy outline-none shadow-inner text-base placeholder:text-slate-300 transition-all ${
                                    booking.patientPhone.length > 0 && !isPhoneValid ? 'border-red-200' : 'border-transparent'
                                  }`} 
                                  style={{ '--tw-ring-color': primaryColor } as any} 
                                  placeholder="987654321" 
                                />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <IdCard size={12} style={{ color: primaryColor }} /> DNI <span className="text-slate-300 font-normal italic lowercase">(Opcional)</span>
                              </label>
                              <input 
                                type="text" 
                                value={booking.patientDni} 
                                onChange={(e) => setBooking(prev => ({...prev, patientDni: e.target.value.replace(/\D/g, '').slice(0, 12)}))} 
                                className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.25rem] focus:ring-2 font-bold text-brand-navy outline-none shadow-inner text-base placeholder:text-slate-300 transition-all" 
                                style={{ '--tw-ring-color': primaryColor } as any} 
                                placeholder="DNI del paciente" 
                              />
                          </div>
                        </div>

                        <div className="pt-6">
                          <button 
                            disabled={!isInfoStepComplete} 
                            onClick={() => setStep('schedule')} 
                            className="w-full py-6 text-white rounded-[2rem] font-bold text-[13px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 hover:brightness-110" 
                            style={{ backgroundColor: primaryColor }}
                          >
                            Ver Disponibilidad <ArrowRight size={20} />
                          </button>
                        </div>
                        <button onClick={() => setStep('sede')} className="w-full text-slate-300 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 mt-6">
                          <ArrowLeft size={12} /> Regresar a Sedes
                        </button>
                    </div>
                  </div>
                )}

                {/* Paso 3: Horarios */}
                {step === 'schedule' && (
                  <div className="p-8 md:p-14 space-y-10 animate-fade-in max-w-2xl mx-auto w-full text-center flex-1 flex flex-col justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">Horarios Disponibles</h2>
                      <p className="text-slate-400 text-sm font-medium mt-2">Selecciona la fecha y hora de tu preferencia.</p>
                    </div>
                    <div className="space-y-8">
                      <div className="relative max-w-xs mx-auto">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary" size={22} />
                        <input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]} 
                          value={booking.date} 
                          onChange={(e) => setBooking(prev => ({...prev, date: e.target.value}))} 
                          className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[1.25rem] focus:ring-2 font-bold text-brand-navy outline-none text-base shadow-inner appearance-none transition-all" 
                          style={{ '--tw-ring-color': primaryColor } as any} 
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(t => (
                              <button 
                                key={t} 
                                onClick={() => setBooking(prev => ({...prev, time: t}))} 
                                className={`py-5 rounded-[1.25rem] font-ubuntu font-bold text-base border-2 transition-all duration-300 active:scale-95 ${booking.time === t ? 'text-white shadow-xl' : 'bg-white text-slate-400 border-slate-50 hover:border-brand-primary/30'}`} 
                                style={{ 
                                  backgroundColor: booking.time === t ? primaryColor : undefined, 
                                  borderColor: booking.time === t ? primaryColor : undefined 
                                }}
                              >
                                {t}
                              </button>
                          ))}
                      </div>
                      <div className="pt-6">
                        <button 
                          disabled={!booking.time} 
                          onClick={() => setStep('confirm')} 
                          className="w-full py-6 text-white rounded-[2rem] font-bold text-[13px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 hover:brightness-110" 
                          style={{ backgroundColor: primaryColor }}
                        >
                          Confirmar Selección <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 4: Confirmación Final */}
                {step === 'confirm' && (
                  <div className="p-8 md:p-14 space-y-10 animate-fade-in max-w-xl mx-auto w-full flex-1 flex flex-col justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-ubuntu font-bold text-brand-navy">Resumen de Cita</h2>
                      <p className="text-slate-400 text-sm font-medium mt-2">Verifica los detalles antes de finalizar.</p>
                    </div>
                    <div className="bg-slate-50/70 rounded-[2.5rem] p-8 border border-slate-100 shadow-inner space-y-6 text-left">
                        <div className="flex items-center gap-5 pb-6 border-b border-slate-200">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-navy shadow-sm border border-slate-100 font-ubuntu font-bold text-3xl">
                            {booking.patientName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</p>
                            <p className="text-xl font-ubuntu font-bold text-brand-navy leading-tight">{booking.patientName}</p>
                          </div>
                        </div>
                        <div className="space-y-5">
                          <div className="flex items-start gap-4">
                            <MapPin size={20} className="text-brand-primary shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sede</p>
                                <p className="font-bold text-brand-navy text-base">{booking.sede?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <CalendarCheck size={20} className="text-brand-primary shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha y Hora</p>
                                <p className="font-ubuntu font-bold text-lg" style={{ color: primaryColor }}>{booking.date} — {booking.time}</p>
                            </div>
                          </div>
                        </div>
                    </div>
                    <button 
                      disabled={isSubmitting} 
                      onClick={handleConfirmBooking} 
                      className="w-full py-6 text-white rounded-[2rem] font-bold text-lg shadow-[0_20px_50px_-10px_rgba(34,197,94,0.4)] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 hover:brightness-110" 
                      style={{ backgroundColor: '#22C55E' }}
                    >
                        {isSubmitting ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : (
                          <><MessageCircle size={32} /> Confirmar en WhatsApp</>
                        )}
                    </button>
                  </div>
                )}

                {/* Paso 5: Éxito Final (NUEVO) */}
                {step === 'success' && (
                  <div className="p-8 md:p-16 space-y-12 animate-fade-in text-center flex-1 flex flex-col justify-center items-center">
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center shadow-xl mb-6">
                      <CheckCircle2 size={56} />
                    </div>
                    <div>
                      <h2 className="text-4xl font-ubuntu font-bold text-brand-navy">¡Cita Registrada!</h2>
                      <p className="text-slate-500 text-base font-medium mt-4 max-w-md mx-auto leading-relaxed">
                        Tu solicitud ha sido enviada con éxito. Para asegurar tu espacio, <b>debes confirmar</b> con la sede vía WhatsApp.
                      </p>
                    </div>

                    <div className="w-full space-y-4">
                      <a 
                        href={generateWaUrl()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-6 bg-green-500 text-white rounded-[2rem] font-bold text-lg flex items-center justify-center gap-4 hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95"
                      >
                        <MessageCircle size={32} /> Abrir WhatsApp Ahora <ExternalLink size={18} />
                      </a>
                      
                      <button 
                        onClick={onBack}
                        className="w-full py-5 bg-slate-100 text-slate-400 rounded-[2rem] font-bold text-sm hover:bg-slate-200 transition-all uppercase tracking-widest"
                      >
                        Volver al Inicio
                      </button>
                    </div>

                    <div className="pt-8 flex items-center justify-center gap-2 text-slate-300">
                      <Heart size={14} className="fill-current" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Gracias por elegir {company.name}</span>
                    </div>
                  </div>
                )}
            </div>

            {/* Créditos Refinados */}
            <div className="mt-16 text-center animate-fade-in">
              <div className="inline-flex flex-col items-center gap-4">
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.4em] mb-1">Healthcare Management Ecosystem</p>
                <a 
                  href="https://gaorsystem.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 bg-white px-10 py-5 rounded-[2.5rem] shadow-[0_15px_35px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-[#0D0D33] rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                     <Zap className="text-brand-primary fill-brand-primary" size={26} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Desarrollado con excelencia por</p>
                    <p className="text-lg font-ubuntu font-bold text-[#0D0D33] group-hover:text-brand-purple transition-colors">Gaor<span className="text-brand-purple">System</span></p>
                  </div>
                </a>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default PatientPortal;
