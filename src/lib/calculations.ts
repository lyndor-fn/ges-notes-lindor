import { Module, GradeStats } from './types';

export const calculateModuleAverage = (module: Module): number | null => {
  if (module.assignmentGrade === null || module.examGrade === null) return null;
  // 60% assignment, 40% exam
  return (module.assignmentGrade * 0.6) + (module.examGrade * 0.4);
};

export const calculateClassStats = (modules: Module[]): GradeStats => {
  const averages = modules
    .map(calculateModuleAverage)
    .filter((avg): avg is number => avg !== null);

  const total = averages.length > 0 
    ? averages.reduce((acc, curr) => acc + curr, 0) / averages.length 
    : 0;

  return {
    average: total,
    totalModules: modules.length,
    completedModules: averages.length
  };
};

export const calculateSemesterStats = (classes: any[]): GradeStats => {
  const classStats = classes.map(c => calculateClassStats(c.modules));
  const validStats = classStats.filter(s => s.completedModules > 0);
  
  const total = validStats.length > 0
    ? validStats.reduce((acc, curr) => acc + curr.average, 0) / validStats.length
    : 0;

  return {
    average: total,
    totalModules: classStats.reduce((acc, curr) => acc + curr.totalModules, 0),
    completedModules: classStats.reduce((acc, curr) => acc + curr.completedModules, 0)
  };
};

export const formatGrade = (grade: number | null): string => {
  if (grade === null) return '--';
  return grade.toFixed(2);
};