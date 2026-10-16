import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  BookOpen, 
  Save, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Search, 
  Edit3, 
  Check, 
  AlertTriangle,
  Send,
  Calendar,
  Lock,
  History,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { StudentProfile, SubjectGrade, TeacherComment, UserSession } from '../types';
import { calculateSubjectAverage, calculateOverallGpa, classifyAcademicRank } from '../utils/gradeCalculations';
import { StudentRecord } from '../data/defaultData';

interface TeacherGradingTabProps {
  currentTeacher: UserSession;
  studentsRoster: StudentRecord[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  onSaveGradesByTeacher: (studentId: string, updatedSubjects: SubjectGrade[]) => void;
  onSaveCommentByTeacher: (studentId: string, comment: TeacherComment) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const TeacherGradingTab: React.FC<TeacherGradingTabProps> = ({
  currentTeacher,
  studentsRoster,
  selectedStudentId,
  onSelectStudent,
  onSaveGradesByTeacher,
  onSaveCommentByTeacher,
  activeTab = 'teacher-grading',
  onTabChange,
}) => {
  const currentRecord = studentsRoster.find(r => r.profile.id === selectedStudentId) || studentsRoster[0];

  // View mode: 'grading' (Nhập điểm) | 'comments' (Nhận xét đánh giá năng lực) | 'both' (Song song)
  const [viewMode, setViewMode] = useState<'grading' | 'comments' | 'both'>(() => {
    return activeTab === 'teacher-comments' ? 'comments' : 'grading';
  });

  // Sync viewMode when activeTab prop changes
  useEffect(() => {
    if (activeTab === 'teacher-comments') {
      setViewMode('comments');
    } else if (activeTab === 'teacher-grading') {
      setViewMode('grading');
    }
  }, [activeTab]);

  const handleSwitchMode = (mode: 'grading' | 'comments' | 'both') => {
    setViewMode(mode);
    if (mode === 'grading' && onTabChange) {
      onTabChange('teacher-grading');
    } else if (mode === 'comments' && onTabChange) {
      onTabChange('teacher-comments');
    }
  };

  // Local state for editing subjects of the selected student
  const [editingSubjects, setEditingSubjects] = useState<SubjectGrade[]>(currentRecord.subjects);
  const [activeSubjectModal, setActiveSubjectModal] = useState<SubjectGrade | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Local state for teacher comment form
  const [academicComment, setAcademicComment] = useState(
    currentRecord.profile.teacherComments[0]?.academicComment || ''
  );
  const [conductComment, setConductComment] = useState(
    currentRecord.profile.teacherComments[0]?.conductComment || ''
  );
  const [competencyEvaluation, setCompetencyEvaluation] = useState(
    currentRecord.profile.teacherComments[0]?.competencyEvaluation || ''
  );
  const [recommendations, setRecommendations] = useState(
    currentRecord.profile.teacherComments[0]?.recommendations || ''
  );
  const [semesterLabel, setSemesterLabel] = useState('Học kỳ 2');

  // Search in roster
  const [searchRoster, setSearchRoster] = useState('');

  // Sync editingSubjects when selected student changes
  useEffect(() => {
    setEditingSubjects(currentRecord.subjects);
    const existing = currentRecord.profile.teacherComments[0];
    setAcademicComment(existing?.academicComment || '');
    setConductComment(existing?.conductComment || '');
    setCompetencyEvaluation(existing?.competencyEvaluation || '');
    setRecommendations(existing?.recommendations || '');
    setSaveSuccessMsg(null);
  }, [selectedStudentId, currentRecord]);

  const overallGpa = calculateOverallGpa(editingSubjects);
  const academicClassification = classifyAcademicRank(editingSubjects, overallGpa);

  // Class statistics
  const classAvgGpa = (
    studentsRoster.reduce((sum, r) => sum + calculateOverallGpa(r.subjects), 0) /
    (studentsRoster.length || 1)
  ).toFixed(1);

  // Quick Preset Comments
  const presets = [
    {
      label: '🌟 Học sinh Xuất sắc toàn diện',
      academic: 'Tiếp thu bài rất nhanh, tư duy phản biện sắc bén, điểm thi các môn tự nhiên và ngoại ngữ đạt mức xuất sắc.',
      conduct: 'Tự giác, kỷ luật tốt, tích cực hỗ trợ các bạn trong tổ học tập, hạnh kiểm Tốt.',
      competency: 'Năng lực tư duy định lượng & giải quyết vấn đề đạt 920/1000. Rất thích hợp với các kỳ thi tuyển sinh đại học top đầu và săn học bổng.',
      recommend: 'Khuyến khích tham gia đội tuyển học sinh giỏi và hoàn thiện hồ sơ ứng tuyển học bổng quốc tế.',
    },
    {
      label: '📈 Có tiến bộ - Cần bứt phá',
      academic: 'Có tiến bộ rõ rệt so với đầu năm, môn Toán và Vật lý cải thiện điểm tốt. Cần chú trọng bài thi cuối kỳ môn Hóa và Văn.',
      conduct: 'Ý thức học tập tốt, đi học đúng giờ, hăng hái phát biểu xây dựng bài.',
      competency: 'Năng lực tư duy logic đạt 820/1000, tiệm cận điểm chuẩn ĐGNL ĐHQG. Cần rèn luyện thêm kỹ năng làm bài trắc nghiệm dưới áp lực thời gian.',
      recommend: 'Bám sát lộ trình 30 ngày củng cố môn Hóa trên hệ thống EduTrack để khóa chặt danh hiệu học sinh Giỏi.',
    },
    {
      label: '🧠 Thế mạnh Tư duy Logic & Tự nhiên',
      academic: 'Các môn Toán, Lý, Hóa đạt kết quả rất tốt (trên 8.5). Cần đầu tư thêm thời gian cho môn Ngữ văn và Tiếng Anh để kéo đều điểm TB.',
      conduct: 'Chăm ngoan, hòa đồng, lễ phép với thầy cô.',
      competency: 'Thế mạnh nổi trội về tư duy toán học và giải quyết vấn đề định lượng. Khả năng tư duy logic đạt 880/1000.',
      recommend: 'Tập trung bứt phá tổ hợp Khoa học Tự nhiên và trau dồi vốn từ vựng học thuật tiếng Anh.',
    },
    {
      label: '⚠️ Cần củng cố kiến thức môn yếu',
      academic: 'Điểm kiểm tra thường xuyên một số môn còn dưới 7.0, bị hổng kiến thức căn bản ở phần lý thuyết và bài tập vận dụng.',
      conduct: 'Cần chú ý tập trung trong giờ học, hoàn thành đầy đủ bài tập về nhà.',
      competency: 'Năng lực đạt mức 710/1000. Cần nâng điểm các môn nòng cốt để đảm bảo điều kiện xét tốt nghiệp và đại học.',
      recommend: 'Đề nghị phối hợp cùng gia đình và bạn cùng bàn để kèm thêm 2 buổi/tuần, hoàn thành bài tập củng cố.',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setAcademicComment(p.academic);
    setConductComment(p.conduct);
    setCompetencyEvaluation(p.competency);
    setRecommendations(p.recommend);
  };

  const handleSaveSubjectGrade = (updatedSub: SubjectGrade) => {
    const recalculated = calculateSubjectAverage(
      updatedSub.regularGrades,
      updatedSub.midtermGrade,
      updatedSub.finalGrade
    );
    const finalSub = {
      ...updatedSub,
      averageGrade: recalculated,
      lastUpdatedBy: currentTeacher.fullName,
      lastUpdatedAt: new Date().toLocaleDateString('vi-VN'),
    };

    const newSubs = editingSubjects.map(s => s.id === finalSub.id ? finalSub : s);
    setEditingSubjects(newSubs);
    setActiveSubjectModal(null);
    // Tự động lưu và cập nhật ngay vào hồ sơ học sinh và sổ điểm
    onSaveGradesByTeacher(currentRecord.profile.id, newSubs);
    setSaveSuccessMsg(`Đã cập nhật điểm môn ${finalSub.name} thành công (${recalculated.toFixed(1)})!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleCommitGradesToStudent = () => {
    onSaveGradesByTeacher(currentRecord.profile.id, editingSubjects);
    setSaveSuccessMsg(`Đã lưu và đồng bộ toàn bộ bảng điểm vào tài khoản của học sinh ${currentRecord.profile.fullName}! Điểm đã được khóa.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleSaveComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicComment.trim()) return;

    const newComment: TeacherComment = {
      id: `tc-${Date.now()}`,
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.fullName,
      teacherTitle: currentTeacher.title || 'Giáo viên Chủ nhiệm',
      date: new Date().toLocaleDateString('vi-VN'),
      semester: semesterLabel,
      academicComment,
      conductComment: conductComment || 'Hạnh kiểm Tốt',
      competencyEvaluation,
      recommendations,
    };

    onSaveCommentByTeacher(currentRecord.profile.id, newComment);
    setSaveSuccessMsg(`Đã lưu nhận xét và đánh giá năng lực vào sổ học bạ của ${currentRecord.profile.fullName}!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const filteredRoster = studentsRoster.filter(r =>
    r.profile.fullName.toLowerCase().includes(searchRoster.toLowerCase()) ||
    r.profile.studentCode.toLowerCase().includes(searchRoster.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-purple-200">
              <UserCheck className="w-3.5 h-3.5" />
              Cổng Quản Lý Điểm Số & Đánh Giá Năng Lực Dành Cho Giáo Viên
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Sổ Gọi Tên & Ghi Điểm Lớp {currentTeacher.classRoom || '11A1'}
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm max-w-2xl">
              Giáo viên phụ trách: <strong className="text-white">{currentTeacher.fullName}</strong> ({currentTeacher.title}). 
              Tài khoản giáo viên chuyên biệt: chỉ gồm chức năng <strong className="text-amber-300">Nhập điểm</strong> và <strong className="text-amber-300">Ghi nhận xét đánh giá năng lực</strong> học sinh.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 shrink-0">
            <Lock className="w-5 h-5 text-amber-300 shrink-0" />
            <div className="text-left text-xs">
              <span className="text-purple-200 block text-[10px] uppercase font-bold">Quyền hạn giáo viên</span>
              <strong className="text-white font-semibold">Toàn quyền nhập & khóa điểm học sinh</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Function Toggle Tabs (Chỉ 2 chức năng dành cho giáo viên) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => handleSwitchMode('grading')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'grading'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Nhập Điểm Học Sinh</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded ${
              viewMode === 'grading' ? 'bg-purple-800 text-purple-100' : 'bg-slate-200 text-slate-600'
            }`}>
              Bảng điểm TT22
            </span>
          </button>

          <button
            onClick={() => handleSwitchMode('comments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'comments'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>2. Ghi Nhận Xét & Đánh Giá Năng Lực</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded ${
              viewMode === 'comments' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'
            }`}>
              Học bạ & Năng lực
            </span>
          </button>

          <button
            onClick={() => handleSwitchMode('both')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'both'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Xem Song Song</span>
          </button>
        </div>

        {/* Selected Student Pill */}
        <div className="flex items-center gap-2.5 text-xs px-3.5 py-2 bg-purple-50 text-purple-900 rounded-xl border border-purple-200">
          <span className="text-slate-500 font-medium">Học sinh đang chọn:</span>
          <strong className="font-bold text-slate-900">{currentRecord.profile.fullName}</strong>
          <span className="font-mono text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-semibold text-[11px]">
            {currentRecord.profile.studentCode}
          </span>
          <span className="text-slate-300">|</span>
          <span>ĐTB: <strong className="text-purple-700 font-mono">{overallGpa.toFixed(1)}</strong></span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">✕</button>
        </div>
      )}

      {/* Student Roster Selector Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              Danh Sách Học Sinh Trong Lớp ({filteredRoster.length} học sinh):
            </h3>
            <p className="text-[11px] text-slate-500">
              Bấm vào tên học sinh để xem bảng điểm và ghi nhận xét đánh giá năng lực tương ứng.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchRoster}
              onChange={(e) => setSearchRoster(e.target.value)}
              placeholder="Tìm theo tên hoặc mã HS..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Horizontal Student Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredRoster.map((record) => {
            const isSelected = record.profile.id === currentRecord.profile.id;
            const gpa = calculateOverallGpa(record.subjects);
            const rank = classifyAcademicRank(record.subjects, gpa);

            return (
              <button
                key={record.profile.id}
                onClick={() => onSelectStudent(record.profile.id)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{record.profile.fullName}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-purple-600"></span>}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {record.profile.studentCode}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Học lực: <strong className={rank.color}>{rank.rank}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">GPA</span>
                  <span className="text-lg font-black font-mono text-purple-700">{gpa.toFixed(1)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: CHỨC NĂNG NHẬP ĐIỂM HỌC SINH (viewMode === 'grading' || 'both') */}
      {/* ======================================================== */}
      {(viewMode === 'grading' || viewMode === 'both') && (
        <div className={`${viewMode === 'both' ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : 'space-y-4'}`}>
          <div className={`${viewMode === 'both' ? 'lg:col-span-7' : 'w-full'} bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between`}>
            <div>
              {/* Header of Grade Table */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-purple-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                      Chức năng 1: Nhập điểm học sinh
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Quyền khóa điểm
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                    <span>Bảng điểm: {currentRecord.profile.fullName}</span>
                    <span className="font-mono text-xs text-slate-400 font-normal">({currentRecord.profile.studentCode})</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCommitGradesToStudent}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-500/25"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu & Khóa điểm học sinh</span>
                  </button>
                </div>
              </div>

              {/* Quick summary of the selected student */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-4">
                  <span>Điểm TB Học kỳ: <strong className="text-purple-700 font-mono text-base ml-1">{overallGpa.toFixed(1)}</strong></span>
                  <span>Xếp loại học lực: <strong className={`${academicClassification.color} font-bold ml-1`}>{academicClassification.rank}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>Quy chế: <strong className="text-slate-700">Thông tư 22/2021/TT-BGDĐT</strong></span>
                  <span>•</span>
                  <span>Lớp: <strong className="text-slate-700">{currentRecord.profile.classRoom}</strong></span>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-200">
                      <th className="py-3 px-4">Môn Học</th>
                      <th className="py-3 px-3">ĐGTX (Thường xuyên - HS1)</th>
                      <th className="py-3 px-3 text-center">ĐGGK (Giữa kỳ - HS2)</th>
                      <th className="py-3 px-3 text-center">ĐGCK (Cuối kỳ - HS3)</th>
                      <th className="py-3 px-3 text-center font-bold text-purple-900 bg-purple-50">ĐTBm</th>
                      <th className="py-3 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {editingSubjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-purple-50/30 transition">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {sub.name}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1.5">
                            {sub.regularGrades.map((g, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 font-mono font-medium text-[11px] border border-slate-200">
                                {g.toFixed(1)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                          {sub.midtermGrade.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                          {sub.finalGrade.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-purple-700 bg-purple-50/50 text-sm">
                          {sub.averageGrade.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setActiveSubjectModal(sub)}
                            className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 mx-auto border border-purple-200 shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Nhập điểm</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Grade Table Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                * Bấm <strong>"Nhập điểm"</strong> để sửa điểm miệng, 15 phút, giữa kỳ, cuối kỳ của từng môn.
              </span>
              <div className="flex items-center gap-2">
                {viewMode === 'grading' && (
                  <button
                    onClick={() => handleSwitchMode('comments')}
                    className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition flex items-center gap-1.5 cursor-pointer border border-indigo-200"
                  >
                    <span>Sang chức năng Ghi nhận xét năng lực</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleCommitGradesToStudent}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu toàn bộ điểm vào tài khoản HS</span>
                </button>
              </div>
            </div>
          </div>

          {/* If in 'both' mode, comments is the right column */}
          {viewMode === 'both' && (
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    Chức năng 2: Ghi nhận xét đánh giá năng lực
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    Nhận Xét & Đánh Giá Năng Lực Học Sinh
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ghi nhận xét vào học bạ điện tử của em {currentRecord.profile.fullName}
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="pt-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Chọn mẫu nhận xét nhanh:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {presets.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition cursor-pointer text-slate-700"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveComment} className="space-y-3 pt-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      1. Đánh giá học lực & kết quả học tập các môn *
                    </label>
                    <textarea
                      rows={2}
                      value={academicComment}
                      onChange={(e) => setAcademicComment(e.target.value)}
                      placeholder="Đánh giá kết quả học tập các môn..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      2. Đánh giá ý thức rèn luyện & hạnh kiểm *
                    </label>
                    <textarea
                      rows={2}
                      value={conductComment}
                      onChange={(e) => setConductComment(e.target.value)}
                      placeholder="Đánh giá ý thức chấp hành nội quy, rèn luyện..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      3. Đánh giá năng lực chuyên sâu & định hướng thi cử
                    </label>
                    <textarea
                      rows={2}
                      value={competencyEvaluation}
                      onChange={(e) => setCompetencyEvaluation(e.target.value)}
                      placeholder="Đánh giá năng lực tư duy logic, định lượng, giải quyết vấn đề..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      4. Lời khuyên & Định hướng kế hoạch ôn tập
                    </label>
                    <textarea
                      rows={2}
                      value={recommendations}
                      onChange={(e) => setRecommendations(e.target.value)}
                      placeholder="Lời khuyên của giáo viên bộ môn / chủ nhiệm..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed text-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!academicComment.trim()}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-500/20 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Lưu & Gửi Nhận Xét Vào Hồ Sơ Học Sinh</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Giáo viên ký nhận: <strong>{currentTeacher.fullName}</strong> • Ngày cập nhật: {new Date().toLocaleDateString('vi-VN')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: CHỨC NĂNG GHI NHẬN XÉT & ĐÁNH GIÁ NĂNG LỰC (viewMode === 'comments') */}
      {/* ======================================================== */}
      {viewMode === 'comments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          {/* Header */}
          <div className="pb-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md">
                Chức năng 2: Ghi nhận xét & Đánh giá năng lực học sinh
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>Nhận Xét & Đánh Giá Năng Lực Cho: {currentRecord.profile.fullName}</span>
                <span className="font-mono text-sm text-slate-400 font-normal">({currentRecord.profile.studentCode})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nội dung nhận xét sẽ được đồng bộ trực tiếp vào sổ liên lạc điện tử và hồ sơ năng lực của học sinh.
              </p>
            </div>

            <button
              onClick={() => handleSwitchMode('grading')}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Chuyển sang Bảng Nhập Điểm</span>
            </button>
          </div>

          {/* Student Overview Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-bold">Học sinh</span>
              <strong className="text-slate-800 text-sm">{currentRecord.profile.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-bold">Lớp / Trường</span>
              <strong className="text-slate-800">{currentRecord.profile.classRoom} • {currentRecord.profile.schoolName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-bold">Điểm TB Học kỳ (GPA)</span>
              <strong className="text-purple-700 font-mono text-base">{overallGpa.toFixed(1)} / 10</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-bold">Xếp loại học lực</span>
              <strong className={`${academicClassification.color} font-bold text-sm`}>{academicClassification.rank}</strong>
            </div>
          </div>

          {/* Quick Presets Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Các mẫu nhận xét mẫu chuẩn vnEdu (Nhấp để áp dụng nhanh):</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-3 rounded-xl text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 transition cursor-pointer text-slate-800 group"
                >
                  <div className="font-bold text-xs text-indigo-700 group-hover:text-indigo-900 mb-1">
                    {p.label}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {p.academic}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Comment Form */}
          <form onSubmit={handleSaveComment} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-xs">
                  1. Đánh giá kết quả học tập & học lực các môn *
                </label>
                <textarea
                  rows={4}
                  value={academicComment}
                  onChange={(e) => setAcademicComment(e.target.value)}
                  placeholder="Nhập nhận xét cụ thể về tình hình học tập các môn Toán, Văn, Anh, KHTN... của học sinh."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-xs">
                  2. Đánh giá ý thức rèn luyện, nền nếp & hạnh kiểm *
                </label>
                <textarea
                  rows={4}
                  value={conductComment}
                  onChange={(e) => setConductComment(e.target.value)}
                  placeholder="Nhập đánh giá về tinh thần kỷ luật, chuyên cần, quan hệ bạn bè, hạnh kiểm..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-xs">
                  3. Đánh giá năng lực chuyên sâu & Thế mạnh tư duy
                </label>
                <textarea
                  rows={4}
                  value={competencyEvaluation}
                  onChange={(e) => setCompetencyEvaluation(e.target.value)}
                  placeholder="Đánh giá năng lực tư duy logic, định lượng, giải quyết vấn đề, năng khiếu, sự phù hợp với các kỳ thi tuyển sinh/ĐGNL..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-xs">
                  4. Lời khuyên & Định hướng kế hoạch ôn tập cho học sinh
                </label>
                <textarea
                  rows={4}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Lời khuyên của giáo viên: môn cần bứt phá, phương pháp ôn thi, bám sát kế hoạch..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-400">
                Người nhận xét: <strong className="text-slate-600">{currentTeacher.fullName}</strong> ({currentTeacher.title}) • Ngày: {new Date().toLocaleDateString('vi-VN')}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!academicComment.trim()}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/25 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Lưu & Gửi Nhận Xét Vào Hồ Sơ Học Sinh</span>
                </button>
              </div>
            </div>
          </form>

          {/* Past Comments History */}
          {currentRecord.profile.teacherComments && currentRecord.profile.teacherComments.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                <span>Lịch sử các nhận xét đã ghi nhận cho {currentRecord.profile.fullName}:</span>
              </h4>

              <div className="space-y-3">
                {currentRecord.profile.teacherComments.map((cm, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-200/60">
                      <span className="font-bold text-indigo-700">{cm.teacherName} ({cm.teacherTitle})</span>
                      <span>Học kỳ: {cm.semester} • Ngày: {cm.date}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Học lực: </span>
                      <span className="text-slate-600">{cm.academicComment}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Rèn luyện & Hạnh kiểm: </span>
                      <span className="text-slate-600">{cm.conductComment}</span>
                    </div>
                    {cm.competencyEvaluation && (
                      <div>
                        <span className="font-semibold text-slate-700">Đánh giá năng lực: </span>
                        <span className="text-slate-600">{cm.competencyEvaluation}</span>
                      </div>
                    )}
                    {cm.recommendations && (
                      <div>
                        <span className="font-semibold text-slate-700">Khuyến nghị: </span>
                        <span className="text-slate-600">{cm.recommendations}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Edit Subject Grades by Teacher */}
      {activeSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-purple-700 uppercase font-bold">Giáo viên nhập điểm</span>
                <h3 className="text-base font-bold text-slate-900">
                  Môn: {activeSubjectModal.name} - {currentRecord.profile.fullName}
                </h3>
              </div>
              <button
                onClick={() => setActiveSubjectModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Điểm Thường Xuyên (ĐGTX - Các bài 15p, miệng cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={activeSubjectModal.regularGrades.join(', ')}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .split(',')
                      .map(s => parseFloat(s.trim()))
                      .filter(n => !isNaN(n) && n >= 0 && n <= 10);
                    setActiveSubjectModal({ ...activeSubjectModal, regularGrades: parsed });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Điểm Giữa Kỳ (ĐGGK - Hệ số 2)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={activeSubjectModal.midtermGrade}
                    onChange={(e) => setActiveSubjectModal({ ...activeSubjectModal, midtermGrade: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Điểm Cuối Kỳ (ĐGCK - Hệ số 3)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={activeSubjectModal.finalGrade}
                    onChange={(e) => setActiveSubjectModal({ ...activeSubjectModal, finalGrade: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveSubjectModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveSubjectGrade(activeSubjectModal)}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer shadow-xs"
              >
                Cập nhật điểm môn này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
