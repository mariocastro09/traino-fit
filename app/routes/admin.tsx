import { useEffect, useState } from "react";
import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useNavigate, useSearchParams, Link } from "react-router";
import {
  LogOut, Plus, Clock, Calendar, List, Grid, Users, BookOpen, CalendarDays, DollarSign, Settings, Bot, Menu, X, Package, Image as ImageIcon
} from "lucide-react";
import { AIChatWidget } from "~/components/ai-chat-widget";
import { RoutinesManager } from "~/components/admin/routines-manager";
import { WorkoutsManager } from "~/components/admin/workouts-manager";
import { FlyerGenerator } from "~/components/admin/flyer-generator";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { DroppableCell } from "~/components/admin/droppable-cell";
import { ScheduleCard } from "~/components/admin/schedule-card";
import { ScheduleForm } from "~/components/admin/schedule-form";
import { ScheduleListView } from "~/components/admin/schedule-list-view";
import { EditScheduleDialog } from "~/components/admin/edit-schedule-dialog";
import { ClassTypesManager } from "~/components/admin/class-types-manager";
import { StudentsManager } from "~/components/admin/students-manager";
import { PlansManager } from "~/components/admin/plans-manager";
import { SettingsManager } from "~/components/admin/settings-manager";
import { EquipmentManager } from "~/components/admin/equipment-manager";

export function meta() {
  return [
    { title: "Panel de Administración - Trainofit" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

interface ClassSchedule {
  id: number;
  dayOfWeek: string;
  time: string;
  className: string;
  level?: string;
  coach?: string;
  maxCapacity?: number;
  isActive: boolean;
}

interface ClassType {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalConditions?: string;
  membershipType?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  notes?: string;
  planId?: number;
  isActive: boolean;
}

// API is served from the same origin via Hono adapter
const API_URL = '';

function SidebarTabButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${active
        ? 'bg-primary text-white shadow-lg shadow-primary/10 scale-[1.01]'
        : 'text-light/50 hover:text-white hover:bg-white/5'
        }`}
    >
      <span className={active ? 'text-white' : 'text-light/40'}>{icon}</span>
      {label}
    </button>
  );
}

function MobileTabButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${active
        ? 'bg-primary text-white'
        : 'text-light/50 hover:text-white hover:bg-white/5'
        }`}
    >
      <span className={active ? 'text-white' : 'text-light/40'}>{icon}</span>
      {label}
    </button>
  );
}

export default function Admin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active section management
  const [activeSection, setActiveSection] = useState<'schedules' | 'classTypes' | 'students' | 'plans' | 'settings' | 'coach' | 'equipment' | 'flyer'>('schedules');

  // Schedules state
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClassSchedule>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Class types state
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);

  // Students state  
  const [students, setStudents] = useState<Student[]>([]);

  // Plans state
  const [plans, setPlans] = useState<any[]>([]);

  // Routines state trigger
  const [routinesRefreshTrigger, setRoutinesRefreshTrigger] = useState(0);
  const [coachSubTab, setCoachSubTab] = useState<'assistant' | 'workouts'>('assistant');
  const [workoutsRefreshTrigger, setWorkoutsRefreshTrigger] = useState(0);
  const [showRoutinesSidebar, setShowRoutinesSidebar] = useState(true);
  const handleRoutinesUpdated = () => {
    setRoutinesRefreshTrigger(prev => prev + 1);
  };

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '10:30', '11:00', '12:00', '13:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'classTypes' || tabParam === 'schedules' || tabParam === 'students' || tabParam === 'plans') {
      setActiveSection(tabParam);
    }

    // Session is now managed via HttpOnly cookie — just verify with the server
    // Also clean up any legacy localStorage sessions
    localStorage.removeItem('admin_session');
    checkSession();
  }, [searchParams]);

  // Mobile detection and responsive view mode
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Force list view on mobile
      if (mobile && viewMode === 'grid') {
        setViewMode('list');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setShowAddForm(true);
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowAddForm(false);
        setEditingId(null);
      }
    };

    if (authenticated) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [authenticated]);

  // Session is carried via HttpOnly cookie — no token needed in JS
  const checkSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/session`, {
        credentials: 'include', // send the HttpOnly cookie
      });
      if (response.ok) {
        setAuthenticated(true);
        loadSchedules();
        loadClassTypes();
        loadStudents();
        loadPlans();
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/schedule`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json() as ClassSchedule[];
        setSchedules(data);
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const loadClassTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/class-types`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json() as ClassType[];
        setClassTypes(data);
      }
    } catch (error) {
      console.error('Failed to load class types:', error);
    }
  };

  const handleLogin = () => {
    // Direct navigation to the login route which sets the HttpOnly cookie
    window.location.href = `${API_URL}/api/auth/login`;
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include', // clears the HttpOnly cookie server-side
    });
    setAuthenticated(false);
    navigate('/');
  };

  const handleEdit = (schedule: ClassSchedule) => {
    setEditingId(schedule.id);
    setEditForm(schedule);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/schedule/${editingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await loadSchedules();
        setEditingId(null);
        setEditForm({});
      }
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/schedule/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await loadSchedules();
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/schedule`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await loadSchedules();
        setShowAddForm(false);
        setEditForm({});
      }
    } catch (error) {
      console.error('Failed to add schedule:', error);
    }
  };

  const handleDuplicate = (schedule: ClassSchedule) => {
    const { id, ...rest } = schedule;
    setEditForm(rest);
    setShowAddForm(true);
  };

  const handleToggleActive = async (schedule: ClassSchedule) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/schedule/${schedule.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...schedule, isActive: !schedule.isActive }),
      });

      if (response.ok) {
        await loadSchedules();
      }
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeSchedule = schedules.find(s => s.id === active.id);
    if (!activeSchedule) return;

    // Parse the droppable id (format: "day-time")
    const [day, time] = (over.id as string).split('-');

    if (day && time && (activeSchedule.dayOfWeek !== day || activeSchedule.time !== time)) {
      try {
        const response = await fetch(`${API_URL}/api/admin/schedule/${active.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...activeSchedule,
            dayOfWeek: day,
            time: time,
          }),
        });

        if (response.ok) {
          await loadSchedules();
        }
      } catch (error) {
        console.error('Failed to update schedule:', error);
      }
    }

    setActiveId(null);
  };

  // ==================== CLASS TYPES CRUD ====================
  const handleAddClassType = async (classType: Partial<ClassType>) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/class-types`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classType),
      });

      if (response.ok) {
        await loadClassTypes();
      }
    } catch (error) {
      console.error('Failed to add class type:', error);
    }
  };

  const handleUpdateClassType = async (id: number, classType: Partial<ClassType>) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/class-types/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classType),
      });

      if (response.ok) {
        await loadClassTypes();
      }
    } catch (error) {
      console.error('Failed to update class type:', error);
    }
  };

  const handleDeleteClassType = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/class-types/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await loadClassTypes();
      }
    } catch (error) {
      console.error('Failed to delete class type:', error);
    }
  };

  // ==================== STUDENTS CRUD ====================
  const loadStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/students`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json() as Student[];
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const handleAddStudent = async (student: Partial<Student>) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/students`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });

      if (response.ok) {
        await loadStudents();
      }
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const handleUpdateStudent = async (id: number, student: Partial<Student>) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/students/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });

      if (response.ok) {
        await loadStudents();
      }
    } catch (error) {
      console.error('Failed to update student:', error);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/students/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await loadStudents();
      }
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  // ==================== PLANS CRUD ====================
  const loadPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/plans`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data as any[]);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const handleAddPlan = async (plan: any) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/plans`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });

      if (response.ok) {
        await loadPlans();
      }
    } catch (error) {
      console.error('Failed to add plan:', error);
    }
  };

  const handleUpdatePlan = async (id: number, plan: any) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/plans/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });

      if (response.ok) {
        await loadPlans();
      }
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const handleDeletePlan = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/plans/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await loadPlans();
      }
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Section className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-light/70">Verificando sesión...</p>
          </div>
        </Section>
      </Layout>
    );
  }

  if (!authenticated) {
    return (
      <Layout>
        <Section className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Background Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <Card className="max-w-md w-full bg-zinc-950/80 border border-white/10 backdrop-blur-xl relative z-10 shadow-2xl shadow-black/80">
            <CardHeader className="text-center pt-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-0.5 shadow-lg shadow-primary/20 mx-auto mb-6 flex items-center justify-center">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                  <Users size={24} className="text-primary animate-pulse" />
                </div>
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-wider text-white">Panel de Control</CardTitle>
              <CardDescription className="text-light/50 mt-2 text-sm">
                Inicia sesión con tu cuenta de Google autorizada para gestionar TrainoFit.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <Button
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary/90 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-bold py-6 text-base shadow-lg shadow-primary/10"
              >
                Iniciar Sesión con Google
              </Button>
            </CardContent>
          </Card>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout hideFooter={true} hideHeader={true} hideWhatsApp={true}>
      <div className="flex min-h-screen bg-zinc-950 text-light relative overflow-hidden w-full">
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl flex-shrink-0 relative z-20">
          {/* Sidebar Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
            <div className="relative bg-primary/10 p-1.5 rounded-xl border border-primary/20">
              <img
                src="/traino-svg.svg"
                alt="Trainofit Logo"
                className="h-6 w-6 brightness-0 invert opacity-90"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(77%) sepia(18%) saturate(1247%) hue-rotate(8deg) brightness(95%) contrast(88%)",
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider text-white uppercase">TRAINOFIT</span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary leading-none">Panel administrador</span>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-grow py-6 px-4 space-y-1.5">
            <SidebarTabButton
              active={activeSection === 'schedules'}
              icon={<CalendarDays size={16} />}
              label="Horarios"
              onClick={() => setActiveSection('schedules')}
            />
            <SidebarTabButton
              active={activeSection === 'classTypes'}
              icon={<BookOpen size={16} />}
              label="Tipos de Clases"
              onClick={() => setActiveSection('classTypes')}
            />
            <SidebarTabButton
              active={activeSection === 'students'}
              icon={<Users size={16} />}
              label="Alumnos"
              onClick={() => setActiveSection('students')}
            />
            <SidebarTabButton
              active={activeSection === 'plans'}
              icon={<DollarSign size={16} />}
              label="Planes"
              onClick={() => setActiveSection('plans')}
            />
            <SidebarTabButton
              active={activeSection === 'settings'}
              icon={<Settings size={16} />}
              label="Configuración"
              onClick={() => setActiveSection('settings')}
            />
            <SidebarTabButton
              active={activeSection === 'coach'}
              icon={<Bot size={16} />}
              label="Coach IA"
              onClick={() => setActiveSection('coach')}
            />
            <SidebarTabButton
              active={activeSection === 'equipment'}
              icon={<Package size={16} />}
              label="Equipamiento"
              onClick={() => setActiveSection('equipment')}
            />
            <SidebarTabButton
              active={activeSection === 'flyer'}
              icon={<ImageIcon size={16} />}
              label="Creador de Flyers"
              onClick={() => setActiveSection('flyer')}
            />
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5 bg-zinc-950/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">Administrador</span>
                <span className="text-[9px] text-light/40 truncate">mapplerak@gmail.com</span>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-2 rounded-lg text-light/40 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Header (Fixed Top) */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-3">
            <img
              src="/traino-svg.svg"
              alt="Trainofit Logo"
              className="h-6 w-6 brightness-0 invert opacity-90"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(77%) sepia(18%) saturate(1247%) hue-rotate(8deg) brightness(95%) contrast(88%)",
              }}
            />
            <span className="text-sm font-black uppercase text-white tracking-wide">TRAINOFIT</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-light hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed top-16 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 py-4 px-6 space-y-2 z-30 flex flex-col shadow-2xl">
            <MobileTabButton
              active={activeSection === 'schedules'}
              icon={<CalendarDays size={16} />}
              label="Horarios"
              onClick={() => { setActiveSection('schedules'); setMobileMenuOpen(false); }}
            />
            <MobileTabButton
              active={activeSection === 'classTypes'}
              icon={<BookOpen size={16} />}
              label="Tipos de Clases"
              onClick={() => { setActiveSection('classTypes'); setMobileMenuOpen(false); }}
            />
            <MobileTabButton
              active={activeSection === 'students'}
              icon={<Users size={16} />}
              label="Alumnos"
              onClick={() => { setActiveSection('students'); setMobileMenuOpen(false); }}
            />
            <MobileTabButton
              active={activeSection === 'plans'}
              icon={<DollarSign size={16} />}
              label="Planes"
              onClick={() => { setActiveSection('plans'); setMobileMenuOpen(false); }}
            />
            <MobileTabButton
              active={activeSection === 'settings'}
              icon={<Settings size={16} />}
              label="Configuración"
              onClick={() => { setActiveSection('settings'); setMobileMenuOpen(false); }}
            />
            <MobileTabButton
              active={activeSection === 'coach'}
              icon={<Bot size={16} />}
              label="Coach IA"
              onClick={() => { setActiveSection('coach'); setMobileMenuOpen(false); }}
            />
            <MobileTabButton
              active={activeSection === 'equipment'}
              icon={<Package size={16} />}
              label="Equipamiento"
              onClick={() => { setActiveSection('equipment'); setMobileMenuOpen(false); }}
            />
            <MobileTabButton
              active={activeSection === 'flyer'}
              icon={<ImageIcon size={16} />}
              label="Creador de Flyers"
              onClick={() => { setActiveSection('flyer'); setMobileMenuOpen(false); }}
            />
            <div className="border-t border-white/5 pt-3 mt-2 flex justify-between items-center">
              <span className="text-[10px] text-light/40 uppercase tracking-widest font-bold">Admin Console</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 bg-red-500/10"
              >
                <LogOut size={12} /> Salir
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-900/10 pt-16 lg:pt-0 relative z-10 overflow-x-hidden">
          {/* Content Header (Breadcrumbs / Status Bar) */}
          <div className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-white/5 bg-zinc-950/25">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-light/40">Consola</span>
              <span className="text-light/20">/</span>
              <span className="text-primary uppercase tracking-wider">{
                activeSection === 'schedules' ? 'Horarios y Clases' :
                  activeSection === 'classTypes' ? 'Tipos de Clases' :
                    activeSection === 'students' ? 'Directorio de Alumnos' :
                      activeSection === 'plans' ? 'Planes de Suscripción' :
                        activeSection === 'settings' ? 'Configuración General' :
                          activeSection === 'equipment' ? 'Inventario de Equipamiento' :
                            activeSection === 'flyer' ? 'Generador de Flyers' :
                            'Asistente de Rutinas Coach IA'
              }</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Conectado
              </span>
              <Link
                to="/"
                className="px-3 py-1.5 border border-white/5 hover:border-white/20 rounded-lg text-xs font-extrabold uppercase tracking-wider text-light/80 hover:text-white transition-all bg-zinc-950"
              >
                Ver Sitio Público
              </Link>
            </div>
          </div>

          {/* Scrollable Container — adapts based on section */}
          <div className={`flex-1 min-h-0 ${activeSection === 'coach'
            ? 'flex flex-col overflow-hidden'
            : 'overflow-y-auto px-4 sm:px-8 py-6 w-full mx-auto space-y-6 max-w-7xl'
            }`}>

            {/* Dashboard Stats Overview (rendered in all sections except coach/settings/flyer) */}
            {activeSection !== 'coach' && activeSection !== 'settings' && activeSection !== 'flyer' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Horarios / Clases Activas */}
                <div className="relative p-5 rounded-2xl bg-zinc-950/40 border border-white/5 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(212,160,23,0.05)] overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-transparent" />
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] uppercase font-black tracking-wider text-light/90">Clases Activas</span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                      <CalendarDays size={16} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {schedules.filter(s => s.isActive).length}
                    </span>
                    <span className="text-[10px] text-primary/70 font-bold">
                      / {schedules.length} total
                    </span>
                  </div>
                </div>

                {/* Card 2: Tipos de Clases */}
                <div className="relative p-5 rounded-2xl bg-zinc-950/40 border border-white/5 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-yellow-500/20 hover:shadow-[0_0_20px_rgba(234,179,8,0.05)] overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-500 to-transparent" />
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] uppercase font-black tracking-wider text-light/90">Tipos de Clases</span>
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen size={16} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {classTypes.filter(c => c.isActive).length}
                    </span>
                    <span className="text-[10px] text-yellow-500/70 font-bold">
                      / {classTypes.length} total
                    </span>
                  </div>
                </div>

                {/* Card 3: Alumnos Activos */}
                <div className="relative p-5 rounded-2xl bg-zinc-950/40 border border-white/5 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] uppercase font-black tracking-wider text-light/90">Alumnos Activos</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {students.filter(s => s.isActive).length}
                    </span>
                    <span className="text-[10px] text-emerald-400/70 font-bold">
                      / {students.length} total
                    </span>
                  </div>
                </div>

                {/* Card 4: Planes Online */}
                <div className="relative p-5 rounded-2xl bg-zinc-950/40 border border-white/5 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.05)] overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] uppercase font-black tracking-wider text-light/90">Planes Online</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300">
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {plans.filter(p => p.isActive).length}
                    </span>
                    <span className="text-[10px] text-purple-400/70 font-bold">
                      / {plans.length} total
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Schedules Section */}
            {activeSection === 'schedules' && (
              <>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <p className="text-sm text-light/70">
                      {isMobile ? 'Toca para editar' : 'Arrastra para reorganizar'}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {!isMobile && (
                      <>
                        <Button
                          size="sm"
                          variant={viewMode === 'grid' ? 'default' : 'outline'}
                          onClick={() => setViewMode('grid')}
                        >
                          <Grid size={16} className="sm:mr-1" />
                          <span className="hidden sm:inline">Grid</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={viewMode === 'list' ? 'default' : 'outline'}
                          onClick={() => setViewMode('list')}
                        >
                          <List size={16} className="sm:mr-1" />
                          <span className="hidden sm:inline">Lista</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-6">
                  <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="w-full sm:w-auto">
                    <Plus size={16} className="mr-1" />
                    <span>Nuevo</span>
                    <span className="hidden sm:inline ml-1">(Ctrl+N)</span>
                  </Button>
                  <div className="text-xs text-light/50 text-center sm:text-left sm:ml-2">
                    {schedules.length} clases • {schedules.filter(s => s.isActive).length} activas
                  </div>
                </div>

                {/* Add Form */}
                {showAddForm && (
                  <div className="mb-6 transition-all">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Nueva Clase</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScheduleForm
                          form={editForm}
                          setForm={setEditForm}
                          daysOfWeek={daysOfWeek}
                          classTypes={classTypes}
                          timeSlots={timeSlots}
                          onSave={handleAdd}
                          onCancel={() => {
                            setShowAddForm(false);
                            setEditForm({});
                          }}
                          isMobile={isMobile}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Main Content */}
                {viewMode === 'grid' && !isMobile ? (
                  <>
                    {/* Edit Dialog for Desktop */}
                    <EditScheduleDialog
                      open={editingId !== null}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingId(null);
                          setEditForm({});
                        }
                      }}
                      form={editForm}
                      setForm={setEditForm}
                      daysOfWeek={daysOfWeek}
                      classTypes={classTypes}
                      timeSlots={timeSlots}
                      onSave={handleSave}
                      onCancel={() => {
                        setEditingId(null);
                        setEditForm({});
                      }}
                    />

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="overflow-x-auto">
                        <div className="min-w-[1000px] card p-4">
                          <div className="grid grid-cols-8 gap-2">
                            {/* Header */}
                            <div className="font-semibold text-xs text-light/50 flex items-center justify-center">
                              <Clock size={14} />
                            </div>
                            {daysOfWeek.map((day) => (
                              <div key={day} className="font-bold text-sm text-primary text-center">
                                {day.slice(0, 3)}
                              </div>
                            ))}

                            {/* Time Grid */}
                            {timeSlots.map((time) => (
                              <div key={time} className="contents">
                                <div className="text-xs text-light/60 flex items-start justify-end pr-2 pt-2 border-t border-white/5">
                                  {time}
                                </div>
                                {daysOfWeek.map((day) => {
                                  const cellId = `${day}-${time}`;
                                  const classesAtSlot = schedules.filter(
                                    (s) => s.dayOfWeek === day && s.time === time
                                  );

                                  return (
                                    <DroppableCell key={cellId} id={cellId}>
                                      <div className="space-y-1">
                                        {classesAtSlot.map((schedule) => (
                                          <ScheduleCard
                                            key={schedule.id}
                                            schedule={schedule}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onDuplicate={handleDuplicate}
                                            onToggleActive={handleToggleActive}
                                            isEditing={editingId === schedule.id}
                                            editForm={editForm}
                                            setEditForm={setEditForm}
                                            onSave={handleSave}
                                            onCancelEdit={() => {
                                              setEditingId(null);
                                              setEditForm({});
                                            }}
                                            daysOfWeek={daysOfWeek}
                                            classTypes={classTypes}
                                            timeSlots={timeSlots}
                                            isMobile={false}
                                          />
                                        ))}
                                      </div>
                                    </DroppableCell>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <DragOverlay>
                        {activeId ? (
                          <div className="card p-2 opacity-80 cursor-grabbing">
                            {schedules.find(s => s.id === activeId)?.className}
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </>
                ) : (
                  <ScheduleListView
                    schedules={schedules}
                    daysOfWeek={daysOfWeek}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onToggleActive={handleToggleActive}
                    editingId={editingId}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    onSave={handleSave}
                    onCancelEdit={() => {
                      setEditingId(null);
                      setEditForm({});
                    }}
                    classTypes={classTypes}
                    timeSlots={timeSlots}
                    isMobile={isMobile}
                  />
                )}
              </>
            )}

            {/* Class Types Section */}
            {activeSection === 'classTypes' && (
              <ClassTypesManager
                classTypes={classTypes}
                onAdd={handleAddClassType}
                onUpdate={handleUpdateClassType}
                onDelete={handleDeleteClassType}
              />
            )}

            {/* Students Section */}
            {activeSection === 'students' && (
              <StudentsManager
                students={students}
                plans={plans}
                onAdd={handleAddStudent}
                onUpdate={handleUpdateStudent}
                onDelete={handleDeleteStudent}
              />
            )}

            {/* Plans Section */}
            {activeSection === 'plans' && (
              <PlansManager
                plans={plans}
                onAdd={handleAddPlan}
                onUpdate={handleUpdatePlan}
                onDelete={handleDeletePlan}
              />
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <SettingsManager />
            )}

            {/* Equipment Section — inventory management for AI context */}
            {activeSection === 'equipment' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Package size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">Inventario de Equipamiento</h2>
                    <p className="text-[10px] text-light/50">El Coach IA usa este inventory para sugerir ejercicios realizables con el equipo disponible</p>
                  </div>
                </div>
                <EquipmentManager />
              </div>
            )}

            {/* Flyer Generator Section */}
            {activeSection === 'flyer' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <ImageIcon size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">Generador de Flyers Sociales</h2>
                    <p className="text-[10px] text-light/50">Crea, edita y descarga flyers listos para tus redes sociales a partir de tus planificaciones</p>
                  </div>
                </div>
                <FlyerGenerator />
              </div>
            )}

            {/* Coach IA Section — ISO 27001 A.9.1: only accessible inside authenticated admin session */}
            {activeSection === 'coach' && (
              <div className="flex flex-col flex-1 min-h-0 px-4 sm:px-6 py-4 gap-4">
                {/* Sub-tabs selector */}
                <div className="flex gap-2 p-1 bg-zinc-900/60 rounded-xl border border-white/5 self-start">
                  <button
                    onClick={() => setCoachSubTab('assistant')}
                    className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${coachSubTab === 'assistant'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10'
                      : 'text-light/50 hover:text-white'
                      }`}
                  >
                    Asistente y Rutinas
                  </button>
                  <button
                    onClick={() => setCoachSubTab('workouts')}
                    className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${coachSubTab === 'workouts'
                      ? 'bg-primary text-white shadow-lg shadow-primary/10'
                      : 'text-light/50 hover:text-white'
                      }`}
                  >
                    Workouts Alumnos (Magic Links)
                  </button>
                </div>

                {coachSubTab === 'assistant' ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-end mb-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRoutinesSidebar(!showRoutinesSidebar)}
                        className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-light/80 hover:text-white flex items-center gap-2 cursor-pointer font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-md"
                      >
                        <span className="lg:inline hidden">
                          {showRoutinesSidebar ? "Ocultar Base de Rutinas" : "Mostrar Base de Rutinas"}
                        </span>
                        <span className="lg:hidden inline">
                          {showRoutinesSidebar ? "Ir al Chat" : "Ver Base de Rutinas"}
                        </span>
                      </Button>
                    </div>

                    <div className={`flex-1 min-h-0 ${showRoutinesSidebar ? "grid grid-cols-1 lg:grid-cols-12 gap-5" : "flex"} items-stretch`}>
                      {/* Left: Routines Manager */}
                      {showRoutinesSidebar && (
                        <div className="col-span-1 lg:col-span-5 flex flex-col min-h-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 w-full lg:flex">
                          <RoutinesManager
                            onRefreshTrigger={routinesRefreshTrigger}
                            onRoutinesUpdated={handleRoutinesUpdated}
                          />
                        </div>
                      )}

                      {/* Right: AI Chat — fills remaining height */}
                      <div className={`flex flex-col min-h-0 overflow-hidden lg:flex-1 ${
                        showRoutinesSidebar 
                          ? "col-span-1 lg:col-span-7 lg:flex" 
                          : "flex-1"
                      } ${showRoutinesSidebar ? "hidden lg:flex" : "flex"}`}>
                        <AIChatWidget
                          embedded
                          onRoutineSaved={() => {
                            handleRoutinesUpdated();
                            setWorkoutsRefreshTrigger(prev => prev + 1);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <WorkoutsManager
                      refreshTrigger={workoutsRefreshTrigger}
                      onWorkoutsUpdated={() => {
                        setWorkoutsRefreshTrigger(prev => prev + 1);
                        handleRoutinesUpdated();
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}
