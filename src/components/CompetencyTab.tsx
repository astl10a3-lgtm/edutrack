import React, { useState } from 'react';
import { 
  Compass, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  FileCheck, 
  BookOpen, 
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { StudentProfile, SubjectGrade, CompetitionGoal, LanguageCertificate, ExtracurricularAchievement } from '../types';
import { evaluateCompetency } from '../utils/gradeCalculations';

interface CompetencyTabProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  subjects: SubjectGrade[];
  goals: CompetitionGoal[];
  selectedGoalId: string;
  setSelectedGoalId: (id: string) => void;
  onActivateRoadmap: (roadmap: any) => void;
  onNavigateToRoadmapsTab: () => void;
  onNavigateToAiAnalyzer: () => void;
}

export const CompetencyTab: React.FC<CompetencyTabProps> = ({
  profile,
  setProfile,
  subjects,
  goals,
  selectedGoalId,
  setSelectedGoalId,
  onActivateRoadmap,
  onNavigateToRoadmapsTab,
  onNavigateToAiAnalyzer,
}) => {
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [showAddAchModal, setShowAddAchModal] = useState(false);

  const [newCert, setNewCert] = useState<Partial<LanguageCertificate>>({
    type: 'IELTS',
    score: 7.0,
    equivalentCompetencyScore: 170,
  });

  const [newAch, setNewAch] = useState<Partial<ExtracurricularAchievement>>({
    title: '',
    category: 'academic',
    level: 'school',
    year: '2026',
    points: 25,
  });

  // Tìm mục tiêu đang chọn, hoặc lấy mục tiêu đầu tiên
  const currentGoal = goals.find(g => g.id === selectedGoalId) || goals[0];

  // Tính toán năng lực theo hệ quy chiếu mục tiêu
  const evaluation = evaluateCompetency(profile, subjects, currentGoal);

  const handleAddCert = () => {
    if (!newCert.score) return;
    const cert: LanguageCertificate = {
      type: newCert.type as any || 'IELTS',
      score: newCert.score,
      equivalentCompetencyScore: Number(newCert.equivalentCompetencyScore) || 150,
      dateAcquired: '2026',
    };
    setProfile(prev => ({
      ...prev,
      certificates: [...prev.certificates, cert],
    }));
    setShowAddCertModal(false);
  };

  const handleAddAch = () => {
    if (!newAch.title) return;
    const ach: ExtracurricularAchievement = {
      id: `ach-${Date.now()}`,
      title: newAch.title,
      category: newAch.category as any || 'academic',
      level: newAch.level as any || 'school',
      year: newAch.year || '2026',
      points: Number(newAch.points) || 20,
    };
    setProfile(prev => ({
      ...prev,
      achievements: [...prev.achievements, ach],
    }));
    setShowAddAchModal(false);
    setNewAch({ title: '', category: 'academic', level: 'school', points: 25 });
  };

  const progressPercent = Math.min(100, Math.round((evaluation.totalScore / evaluation.requiredScore) * 100));

  return (
    <div className="space-y-6">
      {/* Goal Selector Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Hệ Quy Chiếu Năng Lực Chuẩn Hóa
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            Chọn Mục Tiêu / Kỳ Thi Để Đo Lường Năng Lực
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy đổi thành tích học bạ, môn nòng cốt, chứng chỉ ngoại ngữ và giải thưởng sang thang 1000 điểm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentGoal?.id}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 max-w-xs"
          >
            {goals.map(g => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>

          <button
            onClick={onNavigateToAiAnalyzer}
            className="px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Mục tiêu mới (AI)</span>
          </button>
        </div>
      </div>

      {/* Main Competency Scorecard */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Big Score Display (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs text-indigo-300 font-medium">
              <Award className="w-3.5 h-3.5" />
              Đang đối chiếu: {currentGoal.category === 'exam' ? 'Kỳ thi chuẩn' : 'Mục tiêu học tập'}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {currentGoal.title}
            </h3>

            <div className="flex items-baseline gap-3 pt-2">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400 block">Điểm Năng Lực Của Bạn</span>
                <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
                  {evaluation.totalScore}
                </span>
              </div>
              <div className="text-slate-400 text-2xl font-light">/</div>
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400 block">Điểm Chuẩn Cần Đạt</span>
                <span className="text-3xl sm:text-4xl font-bold text-amber-300 font-mono">
                  {evaluation.requiredScore}
                </span>
              </div>
            </div>

            {/* Gap Score Alert Badge */}
            <div className="pt-1">
              {evaluation.gapScore === 0 ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ĐÃ ĐẠT CHUẨN ĐIỀU KIỆN KỲ THI
                </div>
              ) : evaluation.gapScore <= 80 ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  CẬN CHUẨN • CHỈ CÒN THIẾU {evaluation.gapScore} ĐIỂM
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  CẦN BỨT PHÁ • CÒN THIẾU {evaluation.gapScore} ĐIỂM NĂNG LỰC
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar & Visual Representation (7 cols) */}
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>Tiến trình hoàn thành hệ quy chiếu</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">{progressPercent}%</span>
            </div>

            {/* Main Progress Bar */}
            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Gap Analysis Text Box */}
            <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <div className="font-bold text-white flex items-center gap-1.5 mb-1 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Đánh Giá Lỗ Hổng & Điểm Trọng Tâm:
              </div>
              {evaluation.gapAnalysis}
            </div>

            {/* Quick Action Button to Roadmaps */}
            {evaluation.gapScore > 0 && currentGoal.recommendedRoadmaps?.length > 0 && (
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <span className="text-xs text-slate-400">
                  Có sẵn {currentGoal.recommendedRoadmaps.length} lịch trình bù điểm cho mục tiêu này
                </span>
                <button
                  onClick={() => {
                    onActivateRoadmap(currentGoal.recommendedRoadmaps[0]);
                    onNavigateToRoadmapsTab();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs w-full sm:w-auto justify-center"
                >
                  <span>Xem lịch trình luyện tập</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Benchmark Pillars Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Phân Tích 4 Trụ Cột Năng Lực Chi Tiết
          </h3>
          <span className="text-xs text-slate-500">
            Dựa trên trọng số của: <strong>{currentGoal.title}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Academic GPA */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Trụ cột 1</span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Học Bạ THPT (GPA)</h4>
              <p className="text-[11px] text-slate-500">Dựa vào bảng điểm các môn vnEdu</p>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-blue-600 font-mono">
                {evaluation.pillars.gpaScore.current}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {evaluation.pillars.gpaScore.max} điểm
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.round((evaluation.pillars.gpaScore.current / evaluation.pillars.gpaScore.max) * 100)}%` }}
              />
            </div>
          </div>

          {/* Pillar 2: Core Focus Subjects */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Trụ cột 2</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Môn Nòng Cốt Kỳ Thi</h4>
              <p className="text-[11px] text-slate-500">Toán, KHTN hoặc tổ hợp xét tuyển</p>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-indigo-600 font-mono">
                {evaluation.pillars.coreScore.current}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {evaluation.pillars.coreScore.max} điểm
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.round((evaluation.pillars.coreScore.current / evaluation.pillars.coreScore.max) * 100)}%` }}
              />
            </div>
          </div>

          {/* Pillar 3: Language & Certificates */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Trụ cột 3</span>
              <FileCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Chứng Chỉ Ngoại Ngữ</h4>
              <p className="text-[11px] text-slate-500">IELTS, TOEIC, SAT, HSK quy đổi</p>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-emerald-600 font-mono">
                {evaluation.pillars.languageScore.current}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {evaluation.pillars.languageScore.max} điểm
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.round((evaluation.pillars.languageScore.current / (evaluation.pillars.languageScore.max || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Pillar 4: Extracurricular & Awards */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Trụ cột 4</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Thành Tích & Ngoại Khóa</h4>
              <p className="text-[11px] text-slate-500">Giải HSG, KHKT, Hoạt động CLB</p>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {evaluation.pillars.activityScore.current}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {evaluation.pillars.activityScore.max} điểm
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${Math.round((evaluation.pillars.activityScore.current / (evaluation.pillars.activityScore.max || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Certificates & Achievements Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language Certificates Box */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Chứng Chỉ Ngoại Ngữ Của Bạn
              </h4>
              <p className="text-xs text-slate-500">Quy đổi cộng trực tiếp vào hệ quy chiếu</p>
            </div>
            <button
              onClick={() => setShowAddCertModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm chứng chỉ</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {profile.certificates.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Chưa có chứng chỉ ngoại ngữ</p>
            ) : (
              profile.certificates.map((c, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 text-sm mr-2">{c.type}</span>
                    <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                      Band / Score: {c.score}
                    </span>
                  </div>
                  <span className="text-emerald-600 font-semibold font-mono">
                    +{c.equivalentCompetencyScore} điểm quy đổi
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Extracurricular Achievements Box */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Giải Thưởng & Thành Tích Ngoại Khóa
              </h4>
              <p className="text-xs text-slate-500">Giải HSG, dự án KHKT, hoạt động cộng đồng</p>
            </div>
            <button
              onClick={() => setShowAddAchModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm thành tích</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {profile.achievements.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Chưa có hoạt động ghi nhận</p>
            ) : (
              profile.achievements.map((a) => (
                <div key={a.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">{a.title}</span>
                    <span className="text-[10px] text-slate-400">Năm {a.year} • Cấp {a.level}</span>
                  </div>
                  <span className="text-amber-600 font-semibold font-mono whitespace-nowrap ml-2">
                    +{a.points} điểm
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Suggested Roadmaps for this Goal */}
      {currentGoal.recommendedRoadmaps && currentGoal.recommendedRoadmaps.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Lịch Trình Đề Xuất Bù Điểm Cho Mục Tiêu Này
              </h3>
              <p className="text-xs text-slate-500">
                Lựa chọn lộ trình phù hợp với thời gian rảnh và phong cách học tập của bạn
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentGoal.recommendedRoadmaps.map((rd) => (
              <div 
                key={rd.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition bg-slate-50/50 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {rd.type === 'sprinter' ? '⚡ Tốc hành' : rd.type === 'balanced' ? '⚖️ Cân bằng' : '🎯 Chuyên sâu'}
                    </span>
                    <span className="text-xs text-emerald-600 font-bold font-mono">
                      +{rd.targetIncrease} điểm
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {rd.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {rd.overview}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-3">
                    <span>⏱️ {rd.durationWeeks} tuần</span>
                    <span>📖 {rd.hoursPerDay} giờ/ngày</span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-200 flex items-center justify-end">
                  <button
                    onClick={() => {
                      onActivateRoadmap(rd);
                      onNavigateToRoadmapsTab();
                    }}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Kích hoạt lịch trình này</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Certificate Modal */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Thêm Chứng Chỉ Ngoại Ngữ
            </h3>
            <div className="space-y-4 py-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loại chứng chỉ</label>
                <select
                  value={newCert.type}
                  onChange={(e) => setNewCert({ ...newCert, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="IELTS">IELTS</option>
                  <option value="TOEIC">TOEIC</option>
                  <option value="SAT">SAT</option>
                  <option value="HSK">HSK (Tiếng Trung)</option>
                  <option value="JLPT">JLPT (Tiếng Nhật)</option>
                  <option value="VSTEP">VSTEP</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Điểm / Band Đạt Được</label>
                <input
                  type="text"
                  value={newCert.score}
                  onChange={(e) => setNewCert({ ...newCert, score: e.target.value })}
                  placeholder="Ví dụ: 7.0 hoặc 850 hoặc 1400"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Điểm năng lực quy đổi dự kiến (Max 200)</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={newCert.equivalentCompetencyScore}
                  onChange={(e) => setNewCert({ ...newCert, equivalentCompetencyScore: parseFloat(e.target.value) || 150 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddCertModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAddCert}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Lưu chứng chỉ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {showAddAchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Thêm Giải Thưởng / Hoạt Động Ngoại Khóa
            </h3>
            <div className="space-y-4 py-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Thành Tích / Dự Án</label>
                <input
                  type="text"
                  value={newAch.title}
                  onChange={(e) => setNewAch({ ...newAch, title: e.target.value })}
                  placeholder="Ví dụ: Giải Nhì HSG Toán Tỉnh, Trưởng CLB..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cấp độ</label>
                  <select
                    value={newAch.level}
                    onChange={(e) => setNewAch({ ...newAch, level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="school">Cấp Trường</option>
                    <option value="district">Cấp Quận / Cụm</option>
                    <option value="province">Cấp Tỉnh / TP</option>
                    <option value="national">Cấp Quốc Gia</option>
                    <option value="international">Quốc Tế</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Điểm cộng năng lực</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={newAch.points}
                    onChange={(e) => setNewAch({ ...newAch, points: parseFloat(e.target.value) || 20 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddAchModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAddAch}
                disabled={!newAch.title}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Lưu thành tích
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
