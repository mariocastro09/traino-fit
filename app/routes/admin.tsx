import { useEffect, useState } from "react";
import { Layout } from "~/components/layout";
import { Section } from "~/components/ui/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useNavigate, useSearchParams } from "react-router";
import { 
  LogOut, Plus, Clock, Calendar, List, Grid, Users, BookOpen, CalendarDays
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
  const [activeSection, setActiveSection] = useState<'schedules' | 'classTypes' | 'students'>('schedules');
  
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
        switch(e.key) {
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
        <Section className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Panel de Administración</CardTitle>
              <CardDescription>
                Inicia sesión con tu cuenta de Google autorizada para acceder al panel de administración.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogin} className="w-full">
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
        {/* Header with Tabs */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Panel de <span className="text-gradient">Administración</span>
            </h1>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveSection('schedules')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeSection === 'schedules'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-light/70 hover:text-light'
              }`}
            >
              <CalendarDays size={18} />
              Horarios
            </button>
            <button
              onClick={() => setActiveSection('classTypes')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeSection === 'classTypes'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-light/70 hover:text-light'
              }`}
            >
              <BookOpen size={18} />
              Tipos de Clases
            </button>
            <button
              onClick={() => setActiveSection('students')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeSection === 'students'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-light/70 hover:text-light'
              }`}
            >
              <Users size={18} />
              Alumnos
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
      </Section>
    </Layout>
  );
}
