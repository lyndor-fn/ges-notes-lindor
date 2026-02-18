import { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, BookOpen, GraduationCap, TrendingUp, Search, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';

// Types
interface Module {
  id: string;
  name: string;
  assignmentGrade: number | '';
  examGrade: number | '';
  coefficient: number;
}

// Helper to calculate module average
const calculateModuleAverage = (module: Module): number | null => {
  if (module.assignmentGrade === '' || module.examGrade === '') return null;
  return (Number(module.assignmentGrade) * 0.6) + (Number(module.examGrade) * 0.4);
};

export default function App() {
  const [modules, setModules] = useState<Module[]>(() => {
    const saved = localStorage.getItem('grade-tracker-modules');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');

  useEffect(() => {
    localStorage.setItem('grade-tracker-modules', JSON.stringify(modules));
  }, [modules]);

  const addModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;
    
    const newModule: Module = {
      id: crypto.randomUUID(),
      name: newModuleName,
      assignmentGrade: '',
      examGrade: '',
      coefficient: 1,
    };
    
    setModules([...modules, newModule]);
    setNewModuleName('');
    setIsAdding(false);
    toast.success('Module ajouté avec succès');
  };

  const deleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
    toast.error('Module supprimé');
  };

  const updateGrade = (id: string, field: 'assignmentGrade' | 'examGrade' | 'coefficient', value: string) => {
    setModules(modules.map(m => {
      if (m.id === id) {
        if (field === 'coefficient') {
          return { ...m, [field]: value === '' ? 1 : Number(value) };
        }
        const numVal = value === '' ? '' : Math.min(20, Math.max(0, Number(value)));
        return { ...m, [field]: numVal };
      }
      return m;
    }));
  };

  const filteredModules = modules.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateGeneralAverage = () => {
    const modulesWithGrades = modules.filter(m => m.assignmentGrade !== '' && m.examGrade !== '');
    if (modulesWithGrades.length === 0) return 0;
    
    const totalWeightedSum = modulesWithGrades.reduce((sum, m) => {
      const avg = calculateModuleAverage(m) || 0;
      return sum + (avg * m.coefficient);
    }, 0);
    
    const totalCoeff = modulesWithGrades.reduce((sum, m) => sum + m.coefficient, 0);
    return totalCoeff > 0 ? totalWeightedSum / totalCoeff : 0;
  };

  const generalAverage = calculateGeneralAverage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar/Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">Gestionnaire de Notes</h1>
              <p className="text-xs text-slate-500 font-medium">Session Académique 2024-2025</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Rechercher un module..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Module</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                <Calculator className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Moyenne Générale</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className={`text-4xl font-black ${generalAverage >= 10 ? 'text-blue-600' : 'text-rose-500'}`}>
                {generalAverage.toFixed(2)}
              </h2>
              <span className="text-slate-400 font-medium">/ 20</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(generalAverage / 20) * 100}%` }}
                  className={`h-full rounded-full ${generalAverage >= 10 ? 'bg-blue-500' : 'bg-rose-500'}`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Modules Inscrits</span>
            </div>
            <h2 className="text-4xl font-black text-slate-800">{modules.length}</h2>
            <p className="text-sm text-slate-500 mt-2">
              {modules.filter(m => m.assignmentGrade !== '' && m.examGrade !== '').length} modules complétés
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Répartition</span>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400">Devoir</p>
                  <p className="text-lg font-bold text-slate-800">60%</p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Examen</p>
                  <p className="text-lg font-bold text-slate-800">40%</p>
                </div>
              </div>
            </div>
            <img 
              src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/4ff3ec14-3ffb-409e-8cfb-cff3a5ed08ee/dashboard-illustration-dddcf561-1771446267357.webp" 
              alt="Decorative" 
              className="absolute -right-4 -bottom-4 w-24 h-24 object-cover opacity-20 rotate-12"
            />
          </motion.div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredModules.map((module) => {
              const moduleAvg = calculateModuleAverage(module);
              return (
                <motion.div
                  layout
                  key={module.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{module.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase">
                          Coeff: {module.coefficient}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteModule(module.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Devoir (60%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="20"
                          step="0.25"
                          placeholder="0.00"
                          className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                          value={module.assignmentGrade}
                          onChange={(e) => updateGrade(module.id, 'assignmentGrade', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Examen (40%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="20"
                          step="0.25"
                          placeholder="0.00"
                          className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                          value={module.examGrade}
                          onChange={(e) => updateGrade(module.id, 'examGrade', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-slate-500">Moyenne Module</span>
                        <span className={`text-lg font-black ${moduleAvg !== null ? (moduleAvg >= 10 ? 'text-blue-600' : 'text-rose-500') : 'text-slate-300'}`}>
                          {moduleAvg !== null ? moduleAvg.toFixed(2) : '--.--'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${moduleAvg ? (moduleAvg / 20) * 100 : 0}%` }}
                          className={`h-full ${moduleAvg && moduleAvg >= 10 ? 'bg-blue-500' : 'bg-rose-400'}`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {modules.length === 0 && !isAdding && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="bg-white p-6 rounded-full mb-4 shadow-sm border border-slate-100">
                <BookOpen className="w-12 h-12 text-slate-200" />
              </div>
              <p className="text-lg font-medium">Aucun module pour le moment</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Commencer par ajouter votre premier module
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add Module Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Ajouter un module</h2>
              <p className="text-slate-500 mb-6 text-sm">Entrez le nom du module pour commencer à suivre vos notes.</p>
              
              <form onSubmit={addModule} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">Nom du module</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="ex: Mathématiques, Économie..."
                    className="w-full bg-slate-100 border-none rounded-2xl py-3 px-4 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                  >
                    Ajouter le module
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-20 border-t border-slate-200 bg-white py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <GraduationCap className="w-5 h-5" />
            <span className="text-sm font-bold">GradeTracker Pro</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-xs text-slate-400">
               <Info className="w-3 h-3" />
               <span>Calcul: (Devoir × 0.6) + (Examen × 0.4)</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}