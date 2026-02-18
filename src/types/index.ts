export interface Semester {
  id: string;
  name: string;
  classes: Class[];
}

export interface Class {
  id: string;
  semesterId: string;
  name: string;
  modules: Module[];
}

export interface Module {
  id: string;
  classId: string;
  name: string;
  assignmentGrade: number | null;
  examGrade: number | null;
}

export interface GradeStats {
  average: number;
  totalModules: number;
  completedModules: number;
}