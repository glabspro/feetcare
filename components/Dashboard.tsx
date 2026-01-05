import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  CreditCard, 
  TrendingUp,
  Clock,
  ChevronRight,
  ArrowRight,
  Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { STATUS_COLORS } from '../constants';
import { AppointmentStatus, Appointment, ViewState } from '../types';

const emptyData = [
  { name: 'Lun', citas: 0, ingresos: 0 },
  { name: 'Mar', citas: 0, ingresos: 0 },
  { name: 'Mie', citas: 0, ingresos: 0 },
  { name: 'Jue', citas: 0, ingresos: 0 },
  { name: 'Vie', citas: 0, ingresos: 0 },
  { name: 'Sab', citas: 0, ingresos: 0 },
];

const StatCard = ({ icon: Icon, label, value, colorClass, iconColorClass, trend, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl border border-slate-100 clinical-shadow hover:shadow-lg transition-all text-left group w-full"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorClass} ${iconColorClass} shadow-inner`}>
        <Icon size={22} />
      </div>
      {trend !== undefined && (
        <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
          {trend}%
        </span>
      )}
    </div>
    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{label}</p>
    <h3 className="text-3xl font-ubuntu font-bold text-brand-navy mt-1">{value}</h3>
    <div className="mt-3 flex items-center gap-1 text-[9px] font-bold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
       Gestionar <ArrowRight size={10} />
    </div>
  </button>
);

interface DashboardProps {
  appointments: Appointment[];
  onNavigate: (view: ViewState['currentView']) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appointments, onNavigate }) => {
  const pendingCount = appointments.filter(a => a.status === AppointmentStatus.PENDING).length;

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-ubuntu font-bold text-brand-navy tracking-tight">Panel de Control</h2>
          <p className="text-slate-500 mt-2 text-base font-medium">Bienvenido al sistema de gestión clínica Feet Care.</p>
        </div>
        <div className="flex bg-brand-lightPrimary px-4 py-2 rounded-xl border border-brand-primary/20 items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>
           <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Producción v2.5</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={CalendarCheck} 
          label="Citas hoy" 
          value={appointments.length.toString()} 
          colorClass="bg-slate-50" 
          iconColorClass="text-brand-gray"
          trend={0} 
          onClick={() => onNavigate('appointments')} 
        />
        <StatCard 
          icon={Users} 
          label="Total Pacientes" 
          value="0" 
          colorClass="bg-brand-lightPrimary" 
          iconColorClass="text-brand-primary"
          trend={0} 
          onClick={() => onNavigate('patients')} 
        />
        <StatCard 
          icon={CreditCard} 
          label="Solicitudes Web" 
          value={pendingCount.toString()} 
          colorClass="bg-brand-lightAccent" 
          iconColorClass="text-brand-accent"
          onClick={() => onNavigate('appointments')} 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Tasa Asistencia" 
          value="0%" 
          colorClass="bg-brand-navy/5" 
          iconColorClass="text-brand-navy"
          onClick={() => onNavigate('schedules')} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-3xl border border-slate-100 clinical-shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h3 className="font-ubuntu font-bold text-2xl text-brand-navy">Tendencias Semanales</h3>
              <p className="text-slate-400 text-sm mt-1 font-medium">Análisis de flujo de pacientes.</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emptyData}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00BFA5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#00BFA5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(13,13,75,0.05)', padding: '16px'}}
                />
                <Area type="monotone" dataKey="citas" stroke="#00BFA5" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-3xl border border-slate-100 clinical-shadow flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-ubuntu font-bold text-2xl text-brand-navy">Agenda</h3>
              <p className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-widest">Turnos del día</p>
            </div>
            <button onClick={() => onNavigate('appointments')} className="w-9 h-9 bg-brand-lightPrimary text-brand-primary rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-inner">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar max-h-[350px]">
            {appointments.length > 0 ? (
              appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition-all border border-transparent hover:border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-brand-lightPrimary flex-shrink-0 flex items-center justify-center text-brand-primary shadow-inner font-ubuntu font-bold text-lg">
                    {apt.patientName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-navy truncate text-sm">{apt.patientName}</p>
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                      <Clock size={10} className="text-brand-primary" /> {apt.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-200">
                    <CalendarCheck size={24} />
                 </div>
                 <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest">Sin citas activas</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => onNavigate('appointments')}
            className="w-full mt-8 py-5 bg-brand-navy text-white font-bold text-xs flex items-center justify-center gap-3 hover:bg-brand-navy/90 rounded-xl transition-all active:scale-95"
          >
            Ver Agenda Completa <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;