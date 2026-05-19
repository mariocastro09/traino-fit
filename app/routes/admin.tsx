import { useEffect, useState } from "react";
import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useNavigate, useSearchParams } from "react-router";
import {
  LogOut, Plus, Clock, Calendar, List, Grid, Users, BookOpen, CalendarDays, DollarSign, Settings
} from "lucide-react";
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
  isActive: boolean;
}

// API is served from the same origin via Hono adapter
const API_URL = '';

export default function Admin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active section management
  const [activeSection, setActiveSection] = useState<'schedules' | 'classTypes' | 'students' | 'plans' | 'settings'>('schedules');

  // Schedules state
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClassSchedule>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobile, setIsMobile] = useState(false);

  // Class types state
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);

  // Students state  
  const [students, setStudents] = useState<Student[]>([]);

  // Plans state
  const [plans, setPlans] = useState<any[]>([]);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '10:30', '12:00', '17:00', '18:00', '19:00', '20:00'];

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

    const sessionToken = searchParams.get('session');
    if (sessionToken) {
      setSession(sessionToken);
      localStorage.setItem('admin_session', sessionToken);
      checkSession(sessionToken);
    } else {
      const storedSession = localStorage.getItem('admin_session');
      if (storedSession) {
        setSession(storedSession);
        checkSession(storedSession);
      } else {
        setLoading(false);
      }
    }
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

  const checkSession = async (sessionToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/session?session=${sessionToken}`);
      if (response.ok) {
        setAuthenticated(true);
        loadSchedules(sessionToken);
        loadClassTypes(sessionToken);
        loadStudents(sessionToken);
        loadPlans(sessionToken);
      } else {
        setAuthenticated(false);
        localStorage.removeItem('admin_session');
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async (sessionToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/schedule`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json() as ClassSchedule[];
        setSchedules(data);
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const loadClassTypes = async (sessionToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/class-types`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
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
    window.location.href = `${API_URL}/api/auth/login`;
  };

  const handleLogout = async () => {
    if (session) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session}`,
        },
      });
    }
    localStorage.removeItem('admin_session');
    setSession(null);
    setAuthenticated(false);
    navigate('/');
  };

  const handleEdit = (schedule: ClassSchedule) => {
    setEditingId(schedule.id);
    setEditForm(schedule);
  };

  const handleSave = async () => {
    if (!session || !editingId) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/schedule/${editingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await loadSchedules(session);
        setEditingId(null);
        setEditForm({});
      }
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!session || !confirm('¿Estás seguro de eliminar este horario?')) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/schedule/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session}`,
        },
      });

      if (response.ok) {
        await loadSchedules(session);
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const handleAdd = async () => {
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await loadSchedules(session);
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
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/schedule/${schedule.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...schedule, isActive: !schedule.isActive }),
      });

      if (response.ok) {
        await loadSchedules(session);
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

    if (!over || !session) {
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
          headers: {
            'Authorization': `Bearer ${session}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...activeSchedule,
            dayOfWeek: day,
            time: time,
          }),
        });

        if (response.ok) {
          await loadSchedules(session);
        }
      } catch (error) {
        console.error('Failed to update schedule:', error);
      }
    }

    setActiveId(null);
  };

  // ==================== CLASS TYPES CRUD ====================
  const handleAddClassType = async (classType: Partial<ClassType>) => {
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/class-types`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classType),
      });

      if (response.ok) {
        await loadClassTypes(session);
      }
    } catch (error) {
      console.error('Failed to add class type:', error);
    }
  };

  const handleUpdateClassType = async (id: number, classType: Partial<ClassType>) => {
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/class-types/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classType),
      });

      if (response.ok) {
        await loadClassTypes(session);
      }
    } catch (error) {
      console.error('Failed to update class type:', error);
    }
  };

  const handleDeleteClassType = async (id: number) => {
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/class-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session}`,
        },
      });

      if (response.ok) {
        await loadClassTypes(session);
      }
    } catch (error) {
      console.error('Failed to delete class type:', error);
    }
  };

  // ==================== STUDENTS CRUD ====================
  const loadStudents = async (sessionToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/students`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
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
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });

      if (response.ok) {
        await loadStudents(session);
      }
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const handleUpdateStudent = async (id: number, student: Partial<Student>) => {
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/students/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(student),
      });

      if (response.ok) {
        await loadStudents(session);
      }
    } catch (error) {
      console.error('Failed to update student:', error);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session}`,
        },
      });

      if (response.ok) {
        await loadStudents(session);
      }
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  // ==================== PLANS CRUD ====================
  const loadPlans = async (sessionToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/plans`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
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
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });

      if (response.ok) {
        await loadPlans(session);
      }
    } catch (error) {
      console.error('Failed to add plan:', error);
    }
  };

  const handleUpdatePlan = async (id: number, plan: any) => {
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });

      if (response.ok) {
        await loadPlans(session);
      }
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session}`,
        },
      });

      if (response.ok) {
        await loadPlans(session);
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
    <Layout>
      <Section className="section-sm">
        {/* Header with Title & Logout */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Panel de <span className="text-gradient">Administración</span>
              </h1>
              <p className="text-xs text-light/40 mt-1 uppercase font-bold tracking-widest">TrainoFit Backoffice</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 font-bold"
            >
              <LogOut size={16} className="mr-2" />
              Salir
            </Button>
          </div>

          {/* Dashboard Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

          {/* Tab Navigation */}
          <div className="flex p-1 bg-zinc-900/80 border border-white/5 rounded-xl gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveSection('schedules')}
              className={`flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${activeSection === 'schedules'
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]'
                : 'text-light/60 hover:text-light hover:bg-white/5'
                }`}
            >
              <CalendarDays size={16} />
              Horarios
            </button>
            <button
              onClick={() => setActiveSection('classTypes')}
              className={`flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${activeSection === 'classTypes'
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]'
                : 'text-light/60 hover:text-light hover:bg-white/5'
                }`}
            >
              <BookOpen size={16} />
              Tipos de Clases
            </button>
            <button
              onClick={() => setActiveSection('students')}
              className={`flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${activeSection === 'students'
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]'
                : 'text-light/60 hover:text-light hover:bg-white/5'
                }`}
            >
              <Users size={16} />
              Alumnos
            </button>
            <button
              onClick={() => setActiveSection('plans')}
              className={`flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${activeSection === 'plans'
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]'
                : 'text-light/60 hover:text-light hover:bg-white/5'
                }`}
            >
              <DollarSign size={16} />
              Planes
            </button>
            <button
              onClick={() => setActiveSection('settings')}
              className={`flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${activeSection === 'settings'
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]'
                : 'text-light/60 hover:text-light hover:bg-white/5'
                }`}
            >
              <Settings size={16} />
              Configuración
            </button>
          </div>
        </div>

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
          <SettingsManager sessionToken={session} />
        )}
      </Section>
    </Layout>
  );
}
