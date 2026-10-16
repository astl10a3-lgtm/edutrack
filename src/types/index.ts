export type EvaluationStandard = 'tt22' | 'tt58';
export type UserRole = 'admin' | 'teacher' | 'student';

export interface RegistrationRequest {
  id: string;
  role: 'teacher' | 'student';
  fullName: string;
  username: string;
  password?: string;
  classRoom: string;
  schoolName: string;
  title?: string;
  studentCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  title?: string; // Ví dụ: 'Giáo viên Chủ nhiệm & Tổ trưởng Toán 11A1'
  studentCode?: string;
  classRoom: string;
  schoolName: string;
  avatarUrl?: string;
}

export interface TeacherComment {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherTitle: string;
  date: string;
  semester: string;
  academicComment: string;      // Nhận xét học lực môn học & kết quả chung
  conductComment: string;       // Nhận xét thái độ, ý thức rèn luyện
  competencyEvaluation: string; // Đánh giá năng lực chuyên biệt & điểm mạnh/yếu
  recommendations: string;      // Định hướng & lời khuyên mục tiêu thi cử
}

export interface SubjectGrade {
  id: string;
  name: string;
  code: string;
  regularGrades: number[]; // Điểm đánh giá thường xuyên (15p, miệng - HS 1)
  midtermGrade: number;    // Điểm giữa kỳ (HS 2)
  finalGrade: number;      // Điểm cuối kỳ (HS 3)
  averageGrade: number;    // Điểm trung bình môn (ĐTBm)
  targetGrade?: number;    // Mục tiêu điểm muốn đạt
  isCoreSubject?: boolean; // Môn nòng cốt theo khối/mục tiêu
  category: 'natural' | 'social' | 'foreign_lang' | 'other';
  lastUpdatedBy?: string;  // Tên giáo viên đã nhập điểm gần nhất
  lastUpdatedAt?: string;
}

export interface LanguageCertificate {
  type: 'IELTS' | 'TOEIC' | 'HSK' | 'JLPT' | 'SAT' | 'VSTEP' | 'OTHER';
  score: string | number;
  dateAcquired?: string;
  equivalentCompetencyScore: number; // Điểm quy đổi sang hệ quy chiếu (max 200)
}

export interface ExtracurricularAchievement {
  id: string;
  title: string;
  category: 'academic' | 'sport' | 'volunteer' | 'leadership' | 'stem';
  level: 'school' | 'district' | 'province' | 'national' | 'international';
  year: string;
  points: number; // Điểm năng lực (max 100)
}

export interface StudentProfile {
  id: string;
  username?: string;
  studentCode: string; // Mã học sinh vnEdu
  fullName: string;
  avatarUrl?: string;
  classRoom: string;
  schoolName: string;
  academicYear: string;
  semester: 'hk1' | 'hk2' | 'year';
  standard: EvaluationStandard;
  conduct: 'Tốt' | 'Khá' | 'Đạt';
  subjects?: SubjectGrade[];
  certificates: LanguageCertificate[];
  achievements: ExtracurricularAchievement[];
  teacherComments: TeacherComment[];
  isGradeLocked?: boolean; // Khóa điểm đối với học sinh
}

export interface BenchmarkWeights {
  academicGpa: number;   // Trọng số học bạ phổ thông (thang điểm 1000)
  coreSubjects: number;  // Trọng số các môn nòng cốt của kỳ thi
  languageCert: number;  // Trọng số chứng chỉ ngoại ngữ
  activities: number;    // Trọng số hoạt động ngoại khóa / giải thưởng
}

export interface CriteriaItem {
  name: string;
  requirement: string;
  importance: 'mandatory' | 'bonus' | 'recommended';
  isMet?: boolean;
}

export interface WeeklyTask {
  week: number;
  focus: string;
  exercises: string;
  isCompleted?: boolean;
  notes?: string;
}

export interface StudyRoadmap {
  id: string;
  goalId?: string;
  title: string;
  type: 'sprinter' | 'balanced' | 'mastery' | 'steady';
  durationWeeks: number;
  hoursPerDay: number;
  targetIncrease: number; // Điểm năng lực dự kiến tăng
  overview: string;
  weeklyTasks: WeeklyTask[];
  isActive?: boolean;
  progressPercent?: number;
  completedTasksCount?: number;
}

export interface CompetitionGoal {
  id: string;
  title: string;
  category: 'exam' | 'academic_boost' | 'long_term' | 'scholarship' | 'certificate';
  description: string;
  tags: string[];
  requiredScore: number; // Điểm chuẩn hệ quy chiếu (thang 1000)
  benchmarkWeights: BenchmarkWeights;
  criteria: CriteriaItem[];
  recommendedRoadmaps: StudyRoadmap[];
  createdBy: string;
  createdAt: string;
  isCommunity?: boolean;
  notes?: string;
}

export interface CompetencyEvaluation {
  totalScore: number;
  requiredScore: number;
  gapScore: number;
  status: 'qualified' | 'close' | 'needs_boost';
  pillars: {
    gpaScore: { current: number; max: number };
    coreScore: { current: number; max: number };
    languageScore: { current: number; max: number };
    activityScore: { current: number; max: number };
  };
  gapAnalysis: string;
  prioritySubjects: string[];
}
