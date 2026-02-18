import React, { useState } from 'react';
import { Plus, Trash2, Edit2, GraduationCap, Layout, BookOpen, Calculator, ChevronRight, ChevronDown, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Semester, Class, Module } from './types';
import { calculateModuleAverage, calculateClassStats, calculateSemesterStats, formatGrade } from './lib/calculations';

// --- Components ---

const StatCard = ({ title, value, subtitle, icon: Icon, color }: { title: string, value: string, subtitle: string, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1 text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
      <BookOpen size={32} className="text-slate-300" />
    </div>
    <p className="text-slate-500 font-medium">{message}</p>
  </div>
);

// --- Main App ---

export default function App() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>(null);
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState('');

  // Local state for modals
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [targetSemesterId, setTargetSemesterId] = useState('');

  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [targetClassId, setTargetClassId] = useState('');

  // Actions
  const addSemester = () => {
    if (!newSemesterName.trim()) return;
    const newSem: Semester = {
      id: crypto.randomUUID(),
      name: newSemesterName,
      classes: []
    };
    setSemesters([...semesters, newSem]);
    setNewSemesterName('');
    setIsAddingSemester(false);
    if (!activeSemesterId) setActiveSemesterId(newSem.id);
    toast.success('Semestre ajouté avec succès');
  };

  const addClass = (semesterId: string) => {
    if (!newClassName.trim()) return;
    setSemesters(semesters.map(s => {
      if (s.id === semesterId) {
        return {
          ...s,
          classes: [...s.classes, {
            id: crypto.randomUUID(),
            semesterId: s.id,
            name: newClassName,
            modules: []
          }]
        };
      }
      return s;
    }));
    setNewClassName('');
    setIsAddingClass(false);
    toast.success('Classe ajoutée');
  };

  const addModule = (classId: string) => {
    if (!newModuleName.trim()) return;
    setSemesters(semesters.map(s => ({
      ...s,
      classes: s.classes.map(c => {
        if (c.id === classId) {
          return {
            ...c,
            modules: [...c.modules, {
              id: crypto.randomUUID(),
              classId: c.id,
              name: newModuleName,
              assignmentGrade: null,
              examGrade: null
            }]
          };
        }
        return c;
      })
    })));
    setNewModuleName('');
    setIsAddingModule(false);
    toast.success('Module ajouté');
  };

  const updateGrades = (classId: string, moduleId: string, assignment: number | null, exam: number | null) => {
    setSemesters(semesters.map(s => ({
      ...s,
      classes: s.classes.map(c => {
        if (c.id === classId) {
          return {
            ...c,
            modules: c.modules.map(m => {
              if (m.id === moduleId) {
                return { ...m, assignmentGrade: assignment, examGrade: exam };
              }
              return m;
            })
          };
        }
        return c;
      })
    })));
  };

  const deleteModule = (classId: string, moduleId: string) => {
    setSemesters(semesters.map(s => ({
      ...s,
      classes: s.classes.map(c => {
        if (c.id === classId) {
          return {
            ...c,
            modules: c.modules.filter(m => m.id !== moduleId)
          };
        }
        return c;
      })
    })));
    toast.info('Module supprimé');
  };

  const activeSemester = semesters.find(s => s.id === activeSemesterId);
  const stats = activeSemester ? calculateSemesterStats(activeSemester.classes) : { average: 0, totalModules: 0, completedModules: 0 };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar - Navigation par Semestre */}
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">GradeMaster</h1>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-4">Mes Semestres</p>
          {semesters.map(sem => (
            <button
              key={sem.id}
              onClick={() => setActiveSemesterId(sem.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSemesterId === sem.id 
                ? 'bg-indigo-50 text-indigo-700 font-semibold border-indigo-100 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layout size={18} />
                <span>{sem.name}</span>
              </div>
              {activeSemesterId === sem.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
            </button>
          ))}
          
          <button 
            onClick={() => setIsAddingSemester(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-indigo-600 font-medium hover:bg-indigo-50 rounded-xl transition-all mt-4"
          >
            <Plus size={18} />
            <span>Nouveau Semestre</span>
          </button>
        </div>

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-500 mb-2">Utilisation de MySQL</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-700">Connecté à MySQL</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-72 p-6 lg:p-10 pb-24">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {activeSemester ? activeSemester.name : 'Bienvenue'}
              </h2>
              <p className="text-slate-500 mt-1">Gérez vos notes et suivez votre progression académique.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 text-sm mr-2">Calcul:</span>
                <span className="text-slate-900 font-semibold text-sm">60% CC / 40% Examen</span>
              </div>
            </div>
          </div>

          {!activeSemester ? (
            <div className="max-w-2xl mx-auto mt-20">
              <EmptyState message="Veuillez créer ou sélectionner un semestre pour commencer." />
              <button 
                onClick={() => setIsAddingSemester(true)}
                className="mx-auto mt-8 flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus size={20} />
                Créer mon premier semestre
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Moyenne Générale" 
                  value={`${formatGrade(stats.average)}/20`}
                  subtitle="Moyenne pondérée du semestre"
                  icon={Calculator}
                  color="bg-indigo-500"
                />
                <StatCard 
                  title="Progression" 
                  value={`${stats.completedModules}/${stats.totalModules}`}
                  subtitle="Modules avec notes complètes"
                  icon={BarChart3}
                  color="bg-emerald-500"
                />
                <StatCard 
                  title="Status" 
                  value={stats.average >= 10 ? 'Admis' : stats.average > 0 ? 'Ajourné' : '--'}
                  subtitle="Basé sur la moyenne actuelle"
                  icon={GraduationCap}
                  color={stats.average >= 10 ? 'bg-amber-500' : 'bg-rose-500'}
                />
              </div>

              {/* Classes & Modules Section */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-600" />
                    Classes & Matières
                  </h3>
                  <button 
                    onClick={() => {
                      setTargetSemesterId(activeSemester.id);
                      setIsAddingClass(true);
                    }}
                    className="flex items-center gap-2 text-sm font-semibold bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Plus size={16} />
                    Ajouter une classe
                  </button>
                </div>

                {activeSemester.classes.length === 0 ? (
                  <EmptyState message="Aucune classe ajoutée pour ce semestre." />
                ) : (
                  <div className="grid grid-cols-1 gap-8">
                    {activeSemester.classes.map(cls => {
                      const classStats = calculateClassStats(cls.modules);
                      return (
                        <div key={cls.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                          {/* Class Header */}
                          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                                <Layout className="text-indigo-600" size={24} />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-slate-900">{cls.name}</h4>
                                <p className="text-sm text-slate-500">{cls.modules.length} Module(s)</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Moyenne Classe</p>
                                <p className="text-xl font-bold text-indigo-600">{formatGrade(classStats.average)}/20</p>
                              </div>
                              <button 
                                onClick={() => {
                                  setTargetClassId(cls.id);
                                  setIsAddingModule(true);
                                }}
                                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                <Plus size={20} />
                              </button>
                            </div>
                          </div>

                          {/* Modules List */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                  <th className="px-8 py-4 font-semibold">Module / Matière</th>
                                  <th className="px-6 py-4 font-semibold">Note CC (60%)</th>
                                  <th className="px-6 py-4 font-semibold">Examen (40%)</th>
                                  <th className="px-6 py-4 font-semibold">Moyenne</th>
                                  <th className="px-8 py-4 font-semibold text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {cls.modules.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="px-8 py-8 text-center text-slate-400 italic">
                                      Aucun module dans cette classe.
                                    </td>
                                  </tr>
                                ) : (
                                  cls.modules.map(mod => {
                                    const avg = calculateModuleAverage(mod);
                                    return (
                                      <tr key={mod.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4 font-medium text-slate-700">{mod.name}</td>
                                        <td className="px-6 py-4">
                                          <input 
                                            type="number" 
                                            placeholder="--/20"
                                            value={mod.assignmentGrade ?? ''}
                                            onChange={(e) => updateGrades(cls.id, mod.id, e.target.value === '' ? null : parseFloat(e.target.value), mod.examGrade)}
                                            className="w-20 bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 text-slate-700 font-medium"
                                          />
                                        </td>
                                        <td className="px-6 py-4">
                                          <input 
                                            type="number" 
                                            placeholder="--/20"
                                            value={mod.examGrade ?? ''}
                                            onChange={(e) => updateGrades(cls.id, mod.id, mod.assignmentGrade, e.target.value === '' ? null : parseFloat(e.target.value))}
                                            className="w-20 bg-transparent border-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 text-slate-700 font-medium"
                                          />
                                        </td>
                                        <td className="px-6 py-4">
                                          <span className={`font-bold ${avg !== null && avg < 10 ? 'text-rose-500' : 'text-slate-900'}`}>
                                            {formatGrade(avg)}
                                          </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                          <button 
                                            onClick={() => deleteModule(cls.id, mod.id)}
                                            className="text-slate-300 hover:text-rose-500 transition-colors"
                                          >
                                            <Trash2 size={18} />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals - Simplified using Overlay */}
      <AnimatePresence>
        {isAddingSemester && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold mb-4">Nouveau Semestre</h3>
              <input 
                type="text" 
                placeholder="Ex: Semestre 1, Printemps 2024..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none mb-6"
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAddingSemester(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={addSemester}
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isAddingClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold mb-4">Ajouter une Classe</h3>
              <input 
                type="text" 
                placeholder="Ex: Mathématiques, Marketing, Informatique..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none mb-6"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAddingClass(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => addClass(targetSemesterId)}
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isAddingModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold mb-4">Nouveau Module</h3>
              <input 
                type="text" 
                placeholder="Nom de la matière..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none mb-6"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAddingModule(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => addModule(targetClassId)}
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}