import React, { useState } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  RotateCcw, 
  Edit3, 
  Sparkles, 
  Info, 
  Save, 
  Trash2, 
  ArrowUpRight,
  Lock,
  MessageSquare,
  UserCheck,
  Award,
  Calendar
} from 'lucide-react';
import { SubjectGrade, StudentProfile, UserSession } from '../types';
import { calculateSubjectAverage, calculateOverallGpa, classifyAcademicRank } from '../utils/gradeCalculations';

interface GradebookTabProps {
  currentUser: UserSession;
  subjects: SubjectGrade[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectGrade[]>>;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  onOpenAiPlannerForSubject?: (subjectName: string, currentGrade: number) => void;
  onResetData: () => void;
  onNavigateToTeacherGrading?: () => void;
}

export const GradebookTab: React.FC<GradebookTabProps> = ({
  currentUser,
  subjects,
  setSubjects,
  profile,
  setProfile,
  onOpenAiPlannerForSubject,
  onResetData,
  onNavigateToTeacherGrading,
}) => {
  const isTeacher = currentUser.role === 'teacher';

  const [editingSubject, setEditingSubject] = useState<SubjectGrade | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState<Partial<SubjectGrade>>({
    name: '',
    code: 'NEW',
    regularGrades: [8.0, 8.0],
    midtermGrade: 8.0,
    finalGrade: 8.0,
    targetGrade: 8.5,
    category: 'natural',
    isCoreSubject: false,
  });

  const overallGpa = calculateOverallGpa(subjects);
  const academicClassification = classifyAcademicRank(subjects, overallGpa);

  // Thống kê điểm
  const sortedSubjects = [...subjects].sort((a, b) => b.averageGrade - a.averageGrade);
  const bestSubject = sortedSubjects[0];
  const lowestSubject = sortedSubjects[sortedSubjects.length - 1];
  const excellentCount = subjects.filter(s => s.averageGrade >= 8.0).length;

  const handleSaveEdit = () => {
    if (!editingSubject || !isTeacher) return;
    const recalculatedAvg = calculateSubjectAverage(
      editingSubject.regularGrades,
      editingSubject.midtermGrade,
      editingSubject.finalGrade
    );

    const updated = {
      ...editingSubject,
      averageGrade: recalculatedAvg,
      lastUpdatedBy: currentUser.fullName,
      lastUpdatedAt: new Date().toLocaleDateString('vi-VN'),
    };

    setSubjects(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingSubject(null);
  };

  const handleAddSubject = () => {
    if (!newSubject.name || !isTeacher) return;
    const tx = newSubject.regularGrades || [8.0];
    const gk = newSubject.midtermGrade || 8.0;
    const ck = newSubject.finalGrade || 8.0;
    const avg = calculateSubjectAverage(tx, gk, ck);

    const subjectToAdd: SubjectGrade = {
      id: `sub-${Date.now()}`,
      name: newSubject.name,
      code: (newSubject.name.substring(0, 4) || 'SUB').toUpperCase(),
      regularGrades: tx,
      midtermGrade: gk,
      finalGrade: ck,
      averageGrade: avg,
      targetGrade: newSubject.targetGrade || 8.5,
      isCoreSubject: newSubject.isCoreSubject || false,
      category: newSubject.category as any || 'natural',
      lastUpdatedBy: currentUser.fullName,
      lastUpdatedAt: new Date().toLocaleDateString('vi-VN'),
    };

    setSubjects(prev => [...prev, subjectToAdd]);
    setShowAddModal(false);
    setNewSubject({
      name: '',
      code: 'NEW',
      regularGrades: [8.0, 8.0],
      midtermGrade: 8.0,
      finalGrade: 8.0,
      targetGrade: 8.5,
      category: 'natural',
    });
  };

  const handleDeleteSubject = (id: string) => {
    if (!isTeacher) return;
    if (confirm('Bạn có chắc muốn xóa môn học này khỏi bảng điểm?')) {
      setSubjects(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Banner / Lock Status Alert */}
      {!isTeacher ? (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">
                Chế độ Học Sinh • Sổ Điểm Điện Tử Đã Được Khóa Chỉnh Sửa
              </span>
              <span className="text-blue-700">
                Bạn đang đăng nhập với tư cách học sinh (<strong>{profile.fullName}</strong>). Bạn chỉ có quyền xem điểm và nhận xét của giáo viên. Chỉ giáo viên bộ môn mới có quyền nhập hoặc thay đổi điểm số.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between text-xs text-purple-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">
                Chế độ Giáo Viên: {currentUser.fullName} ({currentUser.title || 'Giáo Viên'})
              </span>
              <span className="text-purple-700">
                Thầy/Cô có toàn quyền chỉnh sửa điểm, xóa/thêm môn và viết nhận xét đánh giá năng lực cho học sinh này.
              </span>
            </div>
          </div>

          {onNavigateToTeacherGrading && (
            <button
              onClick={onNavigateToTeacherGrading}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Quản lý & Nhập điểm cả lớp</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Top Banner Profile & Academic Summary Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-medium text-blue-100">
              <BookOpen className="w-3.5 h-3.5" />
              Sổ Đánh Giá Kết Quả Học Tập vnEdu (Thông tư 22/2021/TT-BGDĐT)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bảng Điểm Học Sinh: {profile.fullName}
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl">
              Học sinh lớp <strong className="text-white">{profile.classRoom}</strong> • Mã định danh vnEdu: <span className="font-mono bg-blue-900/60 px-2 py-0.5 rounded text-white">{profile.studentCode}</span> • Trạng thái: Đang theo học.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20">
            <div className="text-center p-2 rounded-lg bg-white/5">
              <div className="text-xs text-blue-200">Điểm TB Học Kỳ</div>
              <div className="text-2xl font-black text-amber-300 mt-0.5">{overallGpa.toFixed(1)}</div>
              <div className="text-[10px] text-blue-200/80">Thang điểm 10.0</div>
            </div>

            <div className="text-center p-2 rounded-lg bg-white/5">
              <div className="text-xs text-blue-200">Xếp Loại Học Lực</div>
              <div className="text-base font-bold text-white mt-1.5 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {academicClassification.rank}
              </div>
              <div className="text-[10px] text-blue-200/80">Chuẩn GDPT mới</div>
            </div>

            <div className="text-center p-2 rounded-lg bg-white/5">
              <div className="text-xs text-blue-200">Kết Quả Rèn Luyện</div>
              <div className="text-base font-bold text-emerald-300 mt-1.5">
                {profile.conduct}
              </div>
              <div className="text-[10px] text-blue-200/80">Hạnh kiểm chuẩn</div>
            </div>

            <div className="text-center p-2 rounded-lg bg-white/5">
              <div className="text-xs text-blue-200">Môn Đạt Loại Giỏi</div>
              <div className="text-2xl font-black text-white mt-0.5">
                {excellentCount}<span className="text-sm font-normal text-blue-200">/{subjects.length}</span>
              </div>
              <div className="text-[10px] text-blue-200/80">ĐTB môn &gt;= 8.0</div>
            </div>
          </div>
        </div>

        {/* Footer Guidance in Banner */}
        <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-100">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-300" />
            <span>Công thức tính: <strong>ĐTBm = (Tổng ĐGTX + ĐGGK × 2 + ĐGCK × 3) ÷ (Số bài ĐGTX + 5)</strong></span>
          </div>
          
          {isTeacher && (
            <div className="flex items-center gap-2">
              <button
                onClick={onResetData}
                className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 transition text-white flex items-center gap-1 cursor-pointer"
                title="Khôi phục điểm số mẫu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục mẫu</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-600 font-semibold text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm môn học</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Gradebook Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Chi Tiết Sổ Điểm Điện Tử Học Kỳ
            </h2>
            <p className="text-xs text-slate-500">
              {isTeacher
                ? 'Thầy/Cô có thể bấm vào biểu tượng bút chì để chỉnh sửa trực tiếp điểm của từng môn học.'
                : 'Bảng điểm chính thức do giáo viên cập nhật. Bạn không thể tự ý sửa đổi điểm số của bản thân.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Giỏi (&gt;=8.0)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Khá (&gt;=6.5)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Đạt (&gt;=5.0)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Cần gỡ (&lt;5.0)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <div className="sm:hidden px-4 py-1.5 bg-blue-50/70 border-b border-blue-100 text-[11px] text-blue-700 font-medium flex items-center justify-between">
            <span>👉 Vuốt ngang bảng để xem trọn vẹn điểm ĐGTX, GK, CK</span>
            <span className="text-[10px] text-blue-500 font-mono">10 Môn</span>
          </div>
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[650px]">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4">Môn Học</th>
                <th className="py-3 px-4">ĐGTX (Miệng / 15p) <span className="text-[10px] text-slate-400 font-normal">HS1</span></th>
                <th className="py-3 px-3 text-center">ĐGGK <span className="text-[10px] text-slate-400 font-normal">HS2</span></th>
                <th className="py-3 px-3 text-center">ĐGCK <span className="text-[10px] text-slate-400 font-normal">HS3</span></th>
                <th className="py-3 px-3 text-center font-extrabold text-blue-900 bg-blue-50/60">ĐTBm</th>
                <th className="py-3 px-3 text-center">Mục Tiêu</th>
                <th className="py-3 px-3 text-center">Xếp Loại Môn</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((sub, idx) => {
                const isUnderGoal = sub.targetGrade ? sub.averageGrade < sub.targetGrade : false;
                let badgeClass = 'bg-slate-100 text-slate-700';
                if (sub.averageGrade >= 8.0) badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
                else if (sub.averageGrade >= 6.5) badgeClass = 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold';
                else if (sub.averageGrade >= 5.0) badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold';
                else badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200 font-bold';

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{sub.name}</span>
                        {sub.isCoreSubject && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Trọng tâm
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {sub.regularGrades.map((g, gIdx) => (
                          <span
                            key={gIdx}
                            className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-xs font-mono"
                          >
                            {g.toFixed(1)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                      {sub.midtermGrade.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                      {sub.finalGrade.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-extrabold text-blue-700 text-base bg-blue-50/40">
                      {sub.averageGrade.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-xs text-slate-500">
                      {sub.targetGrade ? `${sub.targetGrade.toFixed(1)}` : '-'}
                      {isUnderGoal && (
                        <span className="block text-[10px] text-rose-500 font-sans font-medium">
                          (-{(sub.targetGrade! - sub.averageGrade).toFixed(1)})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs ${badgeClass}`}>
                        {sub.averageGrade >= 8.0 ? 'Giỏi' : sub.averageGrade >= 6.5 ? 'Khá' : sub.averageGrade >= 5.0 ? 'Đạt' : 'Cần gỡ'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isTeacher ? (
                          <>
                            <button
                              onClick={() => setEditingSubject(sub)}
                              className="p-1.5 rounded-md hover:bg-purple-50 text-purple-600 hover:text-purple-800 transition cursor-pointer"
                              title="Giáo viên chỉnh sửa điểm"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(sub.id)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition cursor-pointer"
                              title="Xóa môn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" /> Đã khóa
                          </span>
                        )}

                        {sub.averageGrade < 8.0 && onOpenAiPlannerForSubject && (
                          <button
                            onClick={() => onOpenAiPlannerForSubject(sub.name, sub.averageGrade)}
                            className="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 transition cursor-pointer ml-1"
                            title="Tạo lộ trình AI cải thiện môn này"
                          >
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Comments & Evaluation Card on Student Screen */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">
                Nhận Xét & Đánh Giá Năng Lực Của Giáo Viên
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Được ghi nhận chính thức vào hồ sơ học bạ điện tử vnEdu của học sinh
            </p>
          </div>

          {isTeacher && onNavigateToTeacherGrading && (
            <button
              onClick={onNavigateToTeacherGrading}
              className="px-3.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer border border-purple-200"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Thầy/Cô viết nhận xét mới</span>
            </button>
          )}
        </div>

        {profile.teacherComments && profile.teacherComments.length > 0 ? (
          <div className="space-y-4">
            {profile.teacherComments.map((tc) => (
              <div 
                key={tc.id} 
                className="p-4 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/30 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      {tc.teacherName.charAt(tc.teacherName.lastIndexOf(' ') + 1) || 'G'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                        {tc.teacherName}
                      </span>
                      <span className="text-[11px] text-purple-700 font-medium">
                        {tc.teacherTitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{tc.semester}</span>
                    <span>Ngày: {tc.date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                  <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-800 block text-xs mb-1 text-purple-900">
                      1. Đánh giá học lực & kết quả các môn:
                    </span>
                    <p className="text-slate-700">{tc.academicComment}</p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                    <span className="font-bold text-slate-800 block text-xs mb-1 text-emerald-900">
                      2. Đánh giá rèn luyện & hạnh kiểm:
                    </span>
                    <p className="text-slate-700">{tc.conductComment}</p>
                  </div>
                </div>

                {tc.competencyEvaluation && (
                  <div className="p-3.5 bg-indigo-50/60 rounded-lg border border-indigo-200/70 text-xs">
                    <span className="font-bold text-indigo-950 block text-xs mb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-600" />
                      3. Đánh giá năng lực chuyên sâu & định hướng thi cử:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{tc.competencyEvaluation}</p>
                  </div>
                )}

                {tc.recommendations && (
                  <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/70 text-xs">
                    <span className="font-bold text-amber-950 block text-xs mb-1">
                      💡 Lời khuyên & Định hướng ôn tập của Giáo viên:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{tc.recommendations}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
            Chưa có nhận xét nào từ giáo viên trong học kỳ này.
          </div>
        )}
      </div>

      {/* Subject Performance & Gap Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong vs Weak Subjects Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Phân Tích Cột Điểm Mạnh - Yếu
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 block">Môn có kết quả cao nhất</span>
                <span className="text-sm font-semibold text-slate-800">{bestSubject?.name}</span>
              </div>
              <div className="text-xl font-extrabold text-emerald-700 font-mono">
                {bestSubject?.averageGrade.toFixed(1)}
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 block">Môn cần chú trọng bồi dưỡng</span>
                <span className="text-sm font-semibold text-slate-800">{lowestSubject?.name}</span>
              </div>
              <div className="text-xl font-extrabold text-amber-700 font-mono">
                {lowestSubject?.averageGrade.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Suggestion Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Đề Xuất Cải Thiện Điểm Số Tự Động
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống phát hiện môn <strong>{lowestSubject?.name}</strong> (hiện tại {lowestSubject?.averageGrade.toFixed(1)}) đang là môn có điểm thấp nhất kéo tụt điểm trung bình chung. Bạn có thể sử dụng Trợ lý AI để tự động tạo kế hoạch bài tập gỡ điểm trước khi kết thúc học kỳ.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-200/60 flex items-center justify-between">
            <span className="text-xs text-indigo-700 font-medium">Mục tiêu đề xuất: &gt;= 8.5</span>
            {onOpenAiPlannerForSubject && lowestSubject && (
              <button
                onClick={() => onOpenAiPlannerForSubject(lowestSubject.name, lowestSubject.averageGrade)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Tạo lịch gỡ môn {lowestSubject.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Subject Modal (Teacher only) */}
      {isTeacher && editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Chỉnh Sửa Điểm Môn: {editingSubject.name} (Giáo viên)
              </h3>
              <button
                onClick={() => setEditingSubject(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Điểm Đánh Giá Thường Xuyên (ĐGTX - Các bài 15p, miệng cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={editingSubject.regularGrades.join(', ')}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .split(',')
                      .map(s => parseFloat(s.trim()))
                      .filter(n => !isNaN(n) && n >= 0 && n <= 10);
                    setEditingSubject({ ...editingSubject, regularGrades: parsed });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  placeholder="Ví dụ: 8.0, 8.5, 9.0"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Điểm Giữa Kỳ (ĐGGK - Hệ số 2)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingSubject.midtermGrade}
                    onChange={(e) => setEditingSubject({ ...editingSubject, midtermGrade: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Điểm Cuối Kỳ (ĐGCK - Hệ số 3)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingSubject.finalGrade}
                    onChange={(e) => setEditingSubject({ ...editingSubject, finalGrade: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Điểm Mục Tiêu (Target)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingSubject.targetGrade || 8.5}
                    onChange={(e) => setEditingSubject({ ...editingSubject, targetGrade: parseFloat(e.target.value) || 8.5 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={editingSubject.isCoreSubject}
                      onChange={(e) => setEditingSubject({ ...editingSubject, isCoreSubject: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span>Môn nòng cốt của kỳ thi</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingSubject(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal (Teacher only) */}
      {isTeacher && showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Thêm Môn Học Mới Vào Bảng Điểm
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên Môn Học *
                </label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="Ví dụ: Giáo Dục Thể Chất, Công Nghệ..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phân Loại Môn
                  </label>
                  <select
                    value={newSubject.category}
                    onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="natural">Khoa học tự nhiên</option>
                    <option value="social">Khoa học xã hội</option>
                    <option value="foreign_lang">Ngoại ngữ</option>
                    <option value="other">Môn học khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Điểm Mục Tiêu
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newSubject.targetGrade}
                    onChange={(e) => setNewSubject({ ...newSubject, targetGrade: parseFloat(e.target.value) || 8.5 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAddSubject}
                disabled={!newSubject.name}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm môn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
