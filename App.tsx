
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, Appointment, Patient, Sede, User, UserRole, Professional, Company, ClinicalHistoryEntry, AppointmentStatus } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AppointmentManager from './components/AppointmentManager';
import PatientDirectory from './components/PatientDirectory';
import PatientPortal from './components/PatientPortal';
import ScheduleManager from './components/ScheduleManager';
import ClinicalRecordForm from './components/ClinicalRecordForm';
import StaffManagement from './components/StaffManagement';
import SaasAdmin from './components/SaasAdmin';
import Login from './components/Login';
import { supabase } from './services/supabaseClient';

const CLINIC_ID = "feet-care-main";

const INITIAL_CLINIC_CONFIG: Company = {
  id: CLINIC_ID,
  name: "Feet Care",
  primaryColor: "#00BFA5",
  logo: "https://i.ibb.co/L6VvS9Z/bee-logo.png",
  portalHero: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053"
};

const generateUUID = () => crypto.randomUUID();

const formatSupabaseError = (err: any): string => {
  if (!err) return "Error desconocido";
  if (typeof err === 'string') return err;
  return err.message || JSON.stringify(err);
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<ViewState>({ currentView: 'login' });
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clinicConfig, setClinicConfig] = useState<Company>(INITIAL_CLINIC_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // --- DETECCIÓN DE URL PARA PORTAL PÚBLICO ---
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/portal')) {
      setViewState({ currentView: 'portal' });
    }
  }, []);

  const filteredSedes = useMemo(() => {
    if (viewState.currentView === 'portal') return sedes;
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) return sedes;
    return sedes.filter(s => currentUser.sedeIds?.includes(s.id));
  }, [sedes, currentUser, viewState.currentView]);

  const filteredAppointments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) return appointments;
    return appointments.filter(a => currentUser.sedeIds?.includes(a.sedeId));
  }, [appointments, currentUser]);

  const filteredProfessionals = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) return professionals;
    return professionals.filter(p => p.sedeIds.some(sid => currentUser.sedeIds?.includes(sid)));
  }, [professionals, currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let { data: configData } = await supabase.from('companies').select('*').eq('id', CLINIC_ID).maybeSingle();
        if (configData) {
          setClinicConfig({
            id: configData.id,
            name: configData.name,
            primaryColor: configData.primary_color || "#00BFA5",
            logo: configData.logo || "https://i.ibb.co/L6VvS9Z/bee-logo.png",
            portalHero: configData.portal_hero
          });
        }

        const [sData, aData, pData, profData, userData, hData] = await Promise.all([
          supabase.from('sedes').select('*'),
          supabase.from('appointments').select('*'),
          supabase.from('patients').select('*'),
          supabase.from('professionals').select('*'),
          supabase.from('users').select('*'),
          supabase.from('clinical_history').select('*')
        ]);

        if (sData.data) setSedes(sData.data);
        if (userData.data) setUsers(userData.data.map(u => ({ 
          id: u.id, name: u.name, email: u.email, accessKey: u.access_key, role: u.role as UserRole, sedeIds: u.sede_ids || [], companyId: u.company_id, avatar: u.avatar || `https://i.pravatar.cc/150?u=${u.id}`
        })));
        if (profData.data) setProfessionals(profData.data.map(p => ({ ...p, sedeIds: p.sede_ids || [], userId: p.user_id })));
        
        // Mapear historial clínico a pacientes
        if (pData.data) {
          const historyMap: Record<string, ClinicalHistoryEntry[]> = {};
          if (hData.data) {
            hData.data.forEach(h => {
              if (!historyMap[h.patient_id]) historyMap[h.patient_id] = [];
              historyMap[h.patient_id].push({
                id: h.id,
                date: h.date,
                diagnosis: h.diagnosis,
                notes: h.notes,
                recommendations: h.recommendations,
                professionalId: h.professional_id,
                appointmentId: h.appointment_id
              });
            });
          }

          setPatients(pData.data.map(p => ({ 
            ...p, 
            documentId: p.document_id, 
            birthDate: p.birth_date, 
            history: (historyMap[p.id] || []).sort((a,b) => b.date.localeCompare(a.date))
          })));
        }

        if (aData.data) setAppointments(aData.data.map(a => ({
          ...a, patientName: a.patient_name, patientPhone: a.patient_phone, patientDni: a.patient_dni, patientId: a.patient_id, serviceId: a.service_id, sedeId: a.sede_id, professionalId: a.professional_id, bookingCode: a.booking_code, companyId: a.company_id
        })));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- LÓGICA DE REGISTRO DESDE EL PORTAL ---
  const handlePortalBooking = async (bookingData: any) => {
    const patientId = generateUUID();
    const appointmentId = generateUUID();

    try {
      const { error: pError } = await supabase.from('patients').insert([{
        id: patientId,
        name: bookingData.patientName,
        phone: bookingData.patientPhone,
        email: bookingData.patientEmail || null,
        document_id: bookingData.patientDni || null,
        company_id: clinicConfig.id
      }]);
      if (pError) console.warn("Paciente existente o error menor:", pError);

      const { error: aError } = await supabase.from('appointments').insert([{
        id: appointmentId,
        patient_id: patientId,
        patient_name: bookingData.patientName,
        patient_phone: bookingData.patientPhone,
        patient_dni: bookingData.patientDni || null,
        date: bookingData.date,
        time: bookingData.time,
        status: AppointmentStatus.PENDING,
        sede_id: bookingData.sedeId,
        company_id: clinicConfig.id,
        booking_code: 'WEB-' + Math.random().toString(36).substr(2, 5).toUpperCase()
      }]);

      if (aError) throw aError;

      const newApt: Appointment = {
        id: appointmentId,
        patientId,
        patientName: bookingData.patientName,
        patientPhone: bookingData.patientPhone,
        patientDni: bookingData.patientDni,
        date: bookingData.date,
        time: bookingData.time,
        status: AppointmentStatus.PENDING,
        sedeId: bookingData.sedeId,
        bookingCode: 'WEB-' + appointmentId.substr(0,4).toUpperCase(),
        companyId: clinicConfig.id,
        serviceId: 's1',
        professionalId: 'p1'
      };
      setAppointments(prev => [...prev, newApt]);
      return true;
    } catch (err: any) {
      alert(`Error al procesar reserva: ${formatSupabaseError(err)}`);
      return false;
    }
  };

  const handleLogin = (user: User) => { setCurrentUser(user); setViewState({ currentView: 'dashboard' }); };
  const handleLogout = () => { setCurrentUser(null); setViewState({ currentView: 'login' }); };

  const handleUpdateCompany = async (c: Company) => {
    const { error } = await supabase.from('companies').update({ name: c.name, primary_color: c.primaryColor, logo: c.logo, portal_hero: c.portalHero }).eq('id', c.id);
    if (!error) setClinicConfig(c);
  };

  const handleAddUser = async (user: User) => {
    const id = generateUUID();
    const { error } = await supabase.from('users').insert([{ id, name: user.name, email: user.email, access_key: user.accessKey, role: user.role, company_id: clinicConfig.id, sede_ids: user.sedeIds, avatar: user.avatar }]);
    if (!error) setUsers(prev => [...prev, { ...user, id }]);
  };

  const handleUpdateUser = async (u: User) => {
    const { error } = await supabase.from('users').update({ name: u.name, email: u.email, access_key: u.accessKey, role: u.role, sede_ids: u.sedeIds, avatar: u.avatar }).eq('id', u.id);
    if (!error) setUsers(prev => prev.map(it => it.id === u.id ? u : it));
  };

  const handleAddSede = async (s: Sede) => {
    const id = generateUUID();
    const { error } = await supabase.from('sedes').insert([{ id, name: s.name, address: s.address, phone: s.phone, whatsapp: s.whatsapp, availability: s.availability, company_id: clinicConfig.id }]);
    if (!error) { const res = { ...s, id, companyId: clinicConfig.id }; setSedes(prev => [...prev, res]); return res; }
    return null;
  };

  const handleAddAppointment = async (apt: Appointment) => {
    const { error } = await supabase.from('appointments').insert([{ id: apt.id, patient_name: apt.patientName, patient_phone: apt.patientPhone, patient_dni: apt.patientDni, date: apt.date, time: apt.time, status: apt.status, sede_id: apt.sedeId, booking_code: apt.bookingCode, company_id: clinicConfig.id }]);
    if (!error) setAppointments(prev => [...prev, apt]);
  };

  const handleUpdateAppointment = async (apt: Appointment) => {
    const { error } = await supabase.from('appointments').update({ patient_name: apt.patientName, status: apt.status, notes: apt.notes }).eq('id', apt.id);
    if (!error) setAppointments(prev => prev.map(it => it.id === apt.id ? apt : it));
  };

  const handleAddPatient = async (p: Patient) => {
    const { error } = await supabase.from('patients').insert([{ id: p.id, name: p.name, document_id: p.documentId, phone: p.phone, email: p.email, birth_date: p.birthDate, company_id: clinicConfig.id }]);
    if (!error) setPatients(prev => [...prev, p]);
  };

  const handleAddHistoryEntry = async (pid: string, e: ClinicalHistoryEntry) => {
    const { error } = await supabase.from('clinical_history').insert([{ 
      id: e.id, 
      patient_id: pid, 
      date: e.date, 
      diagnosis: e.diagnosis, 
      notes: e.notes, 
      recommendations: e.recommendations,
      appointment_id: e.appointmentId,
      professional_id: e.professionalId
    }]);
    
    // Si la entrada viene de una cita, marcarla como ATENDIDA
    if (e.appointmentId) {
      await supabase.from('appointments').update({ status: AppointmentStatus.ATTENDED }).eq('id', e.appointmentId);
      setAppointments(prev => prev.map(a => a.id === e.appointmentId ? { ...a, status: AppointmentStatus.ATTENDED } : a));
    }

    if (!error) setPatients(prev => prev.map(p => p.id === pid ? { ...p, history: [e, ...p.history] } : p));
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-brand-bg"><div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>;

  if (viewState.currentView === 'portal') return <PatientPortal company={clinicConfig} sedes={sedes} onBack={() => setViewState({ currentView: 'login' })} onPortalBooking={handlePortalBooking} />;
  if (viewState.currentView === 'login') return <Login users={users} onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-brand-bg flex font-inter">
      <Sidebar currentView={viewState.currentView} onViewChange={(v) => setViewState({ currentView: v })} userRole={currentUser?.role} onLogout={handleLogout} />
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-10 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-brand-navy font-bold text-sm">{clinicConfig.name}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Sedes: {filteredSedes.length}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-xs font-bold text-brand-navy">{currentUser?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{currentUser?.role}</p>
             </div>
             <img src={currentUser?.avatar} className="w-10 h-10 rounded-xl border-2 border-white shadow-md" alt="U" />
          </div>
        </header>
        <main className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          {viewState.currentView === 'dashboard' && <Dashboard appointments={filteredAppointments} onNavigate={(v) => setViewState({ currentView: v as any })} />}
          {viewState.currentView === 'appointments' && <AppointmentManager appointments={filteredAppointments} patients={patients} sedes={filteredSedes} onUpdateAppointment={handleUpdateAppointment} onAddAppointment={handleAddAppointment} onStartClinicalSession={(id) => setViewState({ currentView: 'clinical-record', activeAppointmentId: id })} onAddPatient={handleAddPatient} />}
          {viewState.currentView === 'patients' && <PatientDirectory patients={patients} onAddPatient={handleAddPatient} onAddHistoryEntry={handleAddHistoryEntry} onScheduleSessions={(f) => setAppointments(p => [...p, ...f])} sedes={filteredSedes} professionals={filteredProfessionals} />}
          {viewState.currentView === 'schedules' && <ScheduleManager sedes={filteredSedes} onUpdateSede={async (s) => { const { error } = await supabase.from('sedes').update(s).eq('id', s.id); if(!error) setSedes(p => p.map(it => it.id === s.id ? s : it)); }} onAddSede={handleAddSede} />}
          {viewState.currentView === 'staff-management' && <StaffManagement professionals={filteredProfessionals} users={users} sedes={filteredSedes} onAddProfessional={async (p) => { await supabase.from('professionals').insert(p); setProfessionals(prev => [...prev, p]); }} onAddUser={handleAddUser} currentCompanyId={clinicConfig.id} userRole={currentUser?.role} />}
          {viewState.currentView === 'clinical-record' && viewState.activeAppointmentId && (
            <ClinicalRecordForm 
              appointment={appointments.find(a => a.id === viewState.activeAppointmentId)!}
              onClose={() => setViewState({ currentView: 'appointments' })}
              onSaveRecord={handleAddHistoryEntry}
              onScheduleSessions={(f) => setAppointments(p => [...p, ...f])}
            />
          )}
          {viewState.currentView === 'saas-admin' as any && <SaasAdmin companies={[clinicConfig]} users={users} sedes={sedes} onAddCompany={() => {}} onUpdateCompany={handleUpdateCompany} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} userRole={currentUser?.role} currentCompanyId={clinicConfig.id} />}
        </main>
      </div>
    </div>
  );
};

export default App;
