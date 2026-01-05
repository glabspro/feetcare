
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

/**
 * ⚡ SCRIPT SQL PARA SUPABASE (Ejecutar en SQL Editor)
 * --------------------------------------------------
 * -- Este script asegura que la columna email sea opcional y que los nulos no cuenten como duplicados
 * 
 * create table if not exists companies (id text primary key, name text, primary_color text, logo text, portal_hero text);
 * create table if not exists sedes (id text primary key, name text, address text, phone text, whatsapp text, availability jsonb, company_id text);
 * create table if not exists users (
 *    id text primary key, 
 *    name text not null, 
 *    email text unique, 
 *    access_key text, 
 *    role text, 
 *    company_id text, 
 *    sede_ids text[], 
 *    avatar text
 * );
 * create table if not exists professionals (id text primary key, name text, specialty text, avatar text, sede_ids text[], user_id text, company_id text);
 * create table if not exists patients (id text primary key, name text, email text, phone text, document_id text, birth_date text, company_id text);
 * create table if not exists appointments (id text primary key, patient_id text, patient_name text, patient_phone text, patient_dni text, date text, time text, status text, sede_id text, company_id text, booking_code text, service_id text, professional_id text, notes text);
 * create table if not exists clinical_history (id text primary key, patient_id text, date text, professional_id text, diagnosis text, notes text, recommendations text, appointment_id text);
 * 
 * alter table users disable row level security;
 * alter table companies disable row level security;
 * alter table sedes disable row level security;
 * alter table professionals disable row level security;
 * alter table patients disable row level security;
 * alter table appointments disable row level security;
 * alter table clinical_history disable row level security;
 */

const CLINIC_ID = "feet-care-main";

const INITIAL_CLINIC_CONFIG: Company = {
  id: CLINIC_ID,
  name: "Feet Care",
  primaryColor: "#00BFA5",
  logo: "https://i.ibb.co/L6VvS9Z/bee-logo.png",
  portalHero: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053"
};

const generateUUID = () => crypto.randomUUID();

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

  // Filtered variables for access control
  const filteredSedes = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN) return sedes;
    return sedes.filter(s => currentUser.sedeIds?.includes(s.id));
  }, [sedes, currentUser]);

  const filteredAppointments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN) return appointments;
    const userSedeIds = currentUser.sedeIds || [];
    return appointments.filter(a => userSedeIds.includes(a.sedeId));
  }, [appointments, currentUser]);

  const filteredProfessionals = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN) return professionals;
    const userSedeIds = currentUser.sedeIds || [];
    return professionals.filter(p => 
      p.sedeIds.some(sid => userSedeIds.includes(sid))
    );
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
        
        if (userData.data) {
          setUsers(userData.data.map(u => ({ 
            id: u.id, 
            name: u.name, 
            email: u.email, 
            accessKey: u.access_key, 
            role: u.role as UserRole, 
            sedeIds: u.sede_ids || [], 
            companyId: u.company_id || CLINIC_ID,
            avatar: u.avatar
          })));
        }

        if (profData.data) {
          setProfessionals(profData.data.map(p => ({ 
            ...p, 
            sedeIds: p.sede_ids || [], 
            userId: p.user_id,
            companyId: p.company_id || CLINIC_ID 
          })));
        }
        
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
            companyId: p.company_id || CLINIC_ID,
            history: (historyMap[p.id] || []).sort((a,b) => b.date.localeCompare(a.date))
          })));
        }

        if (aData.data) {
          setAppointments(aData.data.map(a => ({
            ...a, 
            patientName: a.patient_name, 
            patientPhone: a.patient_phone, 
            patientDni: a.patient_dni, 
            patientId: a.patient_id, 
            serviceId: a.service_id, 
            sedeId: a.sede_id, 
            professionalId: a.professional_id, 
            bookingCode: a.booking_code, 
            companyId: a.company_id || CLINIC_ID
          })));
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateCompany = async (c: Company) => {
    try {
      const { error } = await supabase.from('companies').update({ 
        name: c.name, 
        primary_color: c.primaryColor, 
        logo: c.logo, 
        portal_hero: c.portalHero 
      }).eq('id', c.id);
      if (error) throw error;
      setClinicConfig(c);
      alert("✅ Configuración de marca actualizada.");
      return true;
    } catch (err: any) {
      alert("❌ Error: " + (err.message || JSON.stringify(err)));
      return false;
    }
  };

  const handleAddUser = async (user: User) => {
    try {
      const dbUser = { 
        id: user.id || generateUUID(), 
        name: user.name, 
        // IMPORTANTE: Si el email es un string vacío, enviamos null para evitar errores de unicidad
        email: (user.email && user.email.trim() !== "") ? user.email.trim() : null, 
        access_key: user.accessKey, 
        role: user.role, 
        company_id: clinicConfig.id, 
        sede_ids: user.sedeIds || [], 
        avatar: user.avatar || ''
      };
      
      const { error } = await supabase.from('users').insert([dbUser]);
      
      if (error) {
        if (error.code === '23505') {
          throw new Error(`El correo "${user.email}" ya está registrado por otro usuario. Por favor usa uno distinto.`);
        }
        throw error;
      }
      
      setUsers(prev => [...prev, { ...user, id: dbUser.id, email: dbUser.email || undefined }]);
      return true;
    } catch (err: any) {
      console.error("DETALLE ERROR USUARIO:", err);
      const msg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      alert("❌ Error al guardar usuario: " + msg);
      return false;
    }
  };

  const handleUpdateUser = async (u: User) => {
    try {
      const { error } = await supabase.from('users').update({ 
        name: u.name, 
        email: (u.email && u.email.trim() !== "") ? u.email.trim() : null, 
        access_key: u.accessKey, 
        role: u.role, 
        sede_ids: u.sedeIds, 
        avatar: u.avatar 
      }).eq('id', u.id);
      
      if (error) {
        if (error.code === '23505') {
          throw new Error(`El correo "${u.email}" ya está en uso por otro usuario.`);
        }
        throw error;
      }

      setUsers(prev => prev.map(it => it.id === u.id ? u : it));
      alert("✅ Usuario actualizado exitosamente.");
      return true;
    } catch (err: any) {
      alert("❌ Error: " + (err.message || JSON.stringify(err)));
      return false;
    }
  };

  const handleAddProfessional = async (p: Professional) => {
    try {
      const { error } = await supabase.from('professionals').insert([{
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        avatar: p.avatar,
        sede_ids: p.sedeIds,
        user_id: p.userId,
        company_id: clinicConfig.id
      }]);
      if (error) throw error;
      setProfessionals(prev => [...prev, p]);
      return true;
    } catch (err: any) {
      alert("❌ Error Especialista: " + (err.message || JSON.stringify(err)));
      return false;
    }
  };

  const handleAddAppointment = async (apt: Appointment) => {
    try {
      const { error } = await supabase.from('appointments').insert([{
        id: apt.id,
        patient_name: apt.patientName,
        patient_phone: apt.patientPhone,
        patient_dni: apt.patientDni,
        patient_id: apt.patientId,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        sede_id: apt.sedeId,
        booking_code: apt.bookingCode,
        company_id: clinicConfig.id,
        service_id: apt.serviceId,
        professional_id: apt.professionalId,
        notes: apt.notes || ''
      }]);
      if (error) throw error;
      setAppointments(prev => [...prev, apt]);
    } catch (err: any) {
      alert("Error Cita: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleUpdateAppointment = async (apt: Appointment) => {
    try {
      const { error } = await supabase.from('appointments').update({
        patient_name: apt.patientName,
        patient_phone: apt.patientPhone,
        patient_dni: apt.patientDni,
        status: apt.status,
        notes: apt.notes
      }).eq('id', apt.id);
      if (error) throw error;
      setAppointments(prev => prev.map(it => it.id === apt.id ? apt : it));
    } catch (err: any) {
      alert("Error Actualizar: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleAddPatient = async (p: Patient) => {
    try {
      const { error } = await supabase.from('patients').insert([{
        id: p.id,
        name: p.name,
        document_id: p.documentId,
        phone: p.phone,
        email: p.email || '',
        birth_date: p.birthDate,
        company_id: clinicConfig.id
      }]);
      if (error) throw error;
      setPatients(prev => [...prev, p]);
    } catch (err: any) {
      alert("Error Paciente: " + (err.message || JSON.stringify(err)));
    }
  };

  const handlePortalBooking = async (data: any) => {
    const patientId = generateUUID();
    const aptId = generateUUID();
    try {
      await handleAddPatient({
        id: patientId,
        name: data.patientName,
        phone: data.patientPhone,
        email: data.patientEmail,
        documentId: data.patientDni || '',
        birthDate: '2000-01-01',
        history: [],
        companyId: clinicConfig.id
      });
      await handleAddAppointment({
        id: aptId,
        patientId,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        patientDni: data.patientDni,
        date: data.date,
        time: data.time,
        status: AppointmentStatus.PENDING,
        sedeId: data.sedeId,
        bookingCode: 'WEB-' + aptId.substring(0, 5).toUpperCase(),
        companyId: clinicConfig.id,
        serviceId: 's1',
        professionalId: 'p1'
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAddHistoryEntry = async (patientId: string, entry: ClinicalHistoryEntry) => {
    try {
      const { error } = await supabase.from('clinical_history').insert([{
        id: entry.id,
        patient_id: patientId,
        date: entry.date,
        professional_id: entry.professionalId,
        diagnosis: entry.diagnosis,
        notes: entry.notes,
        recommendations: entry.recommendations,
        appointment_id: entry.appointmentId
      }]);
      if (error) throw error;
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, history: [entry, ...p.history] } : p));
      
      if (entry.appointmentId) {
        await supabase.from('appointments').update({ status: AppointmentStatus.ATTENDED }).eq('id', entry.appointmentId);
        setAppointments(prev => prev.map(a => a.id === entry.appointmentId ? { ...a, status: AppointmentStatus.ATTENDED } : a));
      }
    } catch (err: any) {
      alert("Error Historia: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleUpdateSede = async (s: Sede) => {
    try {
      const { error } = await supabase.from('sedes').update({
        name: s.name,
        address: s.address,
        phone: s.phone,
        whatsapp: s.whatsapp,
        availability: s.availability
      }).eq('id', s.id);
      if (error) throw error;
      setSedes(prev => prev.map(it => it.id === s.id ? s : it));
    } catch (err: any) {
      alert("Error Sede: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleAddSede = async (s: Sede) => {
    try {
      const id = generateUUID();
      const { error } = await supabase.from('sedes').insert([{
        id,
        name: s.name,
        address: s.address,
        phone: s.phone,
        whatsapp: s.whatsapp,
        availability: s.availability,
        company_id: clinicConfig.id
      }]);
      if (error) throw error;
      const newSede = { ...s, id, companyId: clinicConfig.id };
      setSedes(prev => [...prev, newSede]);
      return newSede;
    } catch (err: any) {
      alert("Error Crear Sede: " + (err.message || JSON.stringify(err)));
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (viewState.currentView === 'portal') {
    return (
      <PatientPortal 
        company={clinicConfig} 
        sedes={sedes} 
        onBack={() => setViewState({ currentView: 'login' })} 
        onPortalBooking={handlePortalBooking} 
      />
    );
  }

  if (viewState.currentView === 'login') {
    return (
      <Login 
        users={users} 
        onLogin={(user) => { setCurrentUser(user); setViewState({ currentView: 'dashboard' }); }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex font-inter text-brand-navy">
      <Sidebar 
        currentView={viewState.currentView} 
        onViewChange={(v) => setViewState({ currentView: v })} 
        userRole={currentUser?.role} 
        onLogout={() => { setCurrentUser(null); setViewState({ currentView: 'login' }); }} 
      />
      
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-10 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-brand-navy font-bold text-sm">{clinicConfig.name}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sedes Operativas: {filteredSedes.length}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-xs font-bold text-brand-navy">{currentUser?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser?.role}</p>
             </div>
             <img 
               src={currentUser?.avatar || `https://i.pravatar.cc/150?u=${currentUser?.id}`} 
               className="w-10 h-10 rounded-xl border-2 border-white shadow-md object-cover" 
               alt="U" 
             />
          </div>
        </header>

        <main className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          {viewState.currentView === 'dashboard' && (
            <Dashboard 
              appointments={filteredAppointments} 
              onNavigate={(v) => setViewState({ currentView: v as any })} 
            />
          )}

          {viewState.currentView === 'appointments' && (
            <AppointmentManager 
              appointments={filteredAppointments} 
              patients={patients} 
              sedes={filteredSedes} 
              onUpdateAppointment={handleUpdateAppointment} 
              onAddAppointment={handleAddAppointment} 
              onStartClinicalSession={(id) => setViewState({ currentView: 'clinical-record', activeAppointmentId: id })} 
              onAddPatient={handleAddPatient} 
            />
          )}

          {viewState.currentView === 'patients' && (
            <PatientDirectory 
              patients={patients} 
              onAddPatient={handleAddPatient} 
              onAddHistoryEntry={handleAddHistoryEntry} 
              onScheduleSessions={(f) => {
                f.forEach(apt => handleAddAppointment(apt));
              }}
              sedes={filteredSedes} 
              professionals={filteredProfessionals} 
            />
          )}

          {viewState.currentView === 'schedules' && (
            <ScheduleManager 
              sedes={filteredSedes} 
              onUpdateSede={handleUpdateSede} 
              onAddSede={handleAddSede} 
            />
          )}

          {viewState.currentView === 'staff-management' && (
            <StaffManagement 
              professionals={filteredProfessionals} 
              users={users} 
              sedes={filteredSedes} 
              onAddProfessional={handleAddProfessional} 
              onAddUser={handleAddUser} 
              currentCompanyId={clinicConfig.id} 
              userRole={currentUser?.role} 
            />
          )}

          {viewState.currentView === 'clinical-record' && viewState.activeAppointmentId && (
            <ClinicalRecordForm 
              appointment={appointments.find(a => a.id === viewState.activeAppointmentId)!}
              onClose={() => setViewState({ currentView: 'appointments' })}
              onSaveRecord={handleAddHistoryEntry}
              onScheduleSessions={(f) => {
                f.forEach(apt => handleAddAppointment(apt));
              }}
            />
          )}

          {viewState.currentView === 'saas-admin' as any && (
            <SaasAdmin 
              companies={[clinicConfig]} 
              users={users} 
              sedes={sedes} 
              onAddCompany={() => {}} 
              onUpdateCompany={handleUpdateCompany} 
              onAddUser={handleAddUser} 
              onUpdateUser={handleUpdateUser} 
              userRole={currentUser?.role} 
              currentCompanyId={clinicConfig.id} 
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
