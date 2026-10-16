import React, { useState } from 'react';
import { 
  CalendarCheck, 
  CheckCircle, 
  Circle, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  ChevronRight, 
  Plus, 
  Check, 
  Flame, 
  FileText, 
  HelpCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { StudyRoadmap, WeeklyTask } from '../types';

interface RoadmapsTabProps {
  activeRoadmaps: StudyRoadmap[];
  setActiveRoadmaps: React.Dispatch<React.SetStateAction<StudyRoadmap[]>>;
  selectedRoadmapId: string;
  setSelectedRoadmapId: (id: string) => void;
  onNavigateToAiAnalyzer: () => void;
}

export const RoadmapsTab: React.FC<RoadmapsTabProps> = ({
  activeRoadmaps,
  setActiveRoadmaps,
  selectedRoadmapId,
  setSelectedRoadmapId,
  onNavigateToAiAnalyzer,
}) => {
  const [selectedTaskForAi, setSelectedTaskForAi] = useState<{
    week: number;
    focus: string;
    exercises: string;
  } | null>(null);

  const [aiTipLoading, setAiTipLoading] = useState(false);
  const [aiTipContent, setAiTipContent] = useState<string | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);
  const [showConfirmDeleteId, setShowConfirmDeleteId] = useState<string | null>(null);

  // Lấy lộ trình đang chọn, nếu không có lấy lộ trình đầu tiên
  const currentRoadmap = activeRoadmaps.find(r => r.id === selectedRoadmapId) || activeRoadmaps[0];

  const handleToggleTask = (roadmapId: string, weekNumber: number) => {
    setActiveRoadmaps(prev => prev.map(rd => {
      if (rd.id !== roadmapId) return rd;
      const updatedTasks = rd.weeklyTasks.map(t => {
        if (t.week === weekNumber) {
          return { ...t, isCompleted: !t.isCompleted };
        }
        return t;
      });

      const completedCount = updatedTasks.filter(t => t.isCompleted).length;
      const progress = Math.round((completedCount / updatedTasks.length) * 100);

      return {
        ...rd,
        weeklyTasks: updatedTasks,
        progressPercent: progress,
        completedTasksCount: completedCount,
      };
    }));
  };

  const handleAskAiForTip = async (task: { week: number; focus: string; exercises: string }) => {
    setSelectedTaskForAi(task);
    setAiTipLoading(true);
    setAiTipContent(null);

    try {
      const response = await fetch('/api/ai/generate-roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalTitle: `Chuyên đề: ${task.focus}`,
          currentScore: 750,
          targetScore: 850,
          gapAnalysis: `Bài tập yêu cầu: ${task.exercises}`,
          preferences: { hoursPerDay: 2, focusStyle: 'Mẹo giải nhanh và bẫy đề thi' },
        }),
      });

      // Nếu API trả về, lấy hướng dẫn
      const resData = await response.json();
      if (resData.roadmaps && resData.roadmaps.length > 0) {
        setAiTipContent(`
💡 CHIẾN THUẬT ÔN LUYỆN TRỌNG TÂM:
- Trọng tâm kiến thức: ${task.focus}
- Lời khuyên của Giáo viên: Hãy chia nhỏ các bài tập ${task.exercises} thành các phiên học Pomodoro 25 phút.
- Mẹo tránh bẫy: Thường các câu hỏi trắc nghiệm hay bẫy về điều kiện xác định và đơn vị quy đổi. Luôn gạch chân từ khóa trong đề.
- Kỹ thuật bấm máy / loại trừ: Dùng phương pháp thử giá trị đặc biệt đối với các bài toán tham số.
        `);
      } else {
        setAiTipContent(`
💡 HƯỚNG DẪN GIẢI QUYẾT BÀI TẬP:
- Chủ đề: ${task.focus}
- Phương pháp: Ôn lại phần lý thuyết cốt lõi trước 15 phút, sau đó làm ngay 10 câu đầu để lấy phản xạ.
- Ghi chép: Mỗi câu làm sai, hãy ghi vào "Sổ tay bẫy đề" để không lặp lại lỗi ở kỳ thi chính thức.
        `);
      }
    } catch (e) {
      setAiTipContent(`
💡 MẸO TẬP TRUNG HỌC TẬP HIỆU QUẢ:
- Dành 45 phút đầu cho các bài tập khó nhất trong phần: "${task.focus}".
- Hoàn thành bài tập "${task.exercises}" theo nhóm 3-5 câu để duy trì động lực.
      `);
    } finally {
      setAiTipLoading(false);
    }
  };

  const handleDeleteRoadmap = (id: string) => {
    if (activeRoadmaps.length <= 1) {
      setDeleteErrorMsg('Bạn cần giữ ít nhất một lộ trình trong danh sách!');
      setTimeout(() => setDeleteErrorMsg(null), 4000);
      return;
    }
    setShowConfirmDeleteId(id);
  };

  const confirmDeleteRoadmap = () => {
    if (!showConfirmDeleteId) return;
    const remaining = activeRoadmaps.filter(r => r.id !== showConfirmDeleteId);
    setActiveRoadmaps(remaining);
    if (remaining.length > 0) {
      setSelectedRoadmapId(remaining[0].id);
    }
    setShowConfirmDeleteId(null);
  };

  if (!currentRoadmap) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <CalendarCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Chưa có lịch trình luyện tập nào</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Hãy vào tab "Kỳ Thi & Mục Tiêu" hoặc "AI Thêm Mục Tiêu Mới" để kích hoạt một lộ trình luyện tập phù hợp.
        </p>
        <button
          onClick={onNavigateToAiAnalyzer}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          Tạo lộ trình với AI ngay
        </button>
      </div>
    );
  }

  const completedCount = currentRoadmap.weeklyTasks.filter(t => t.isCompleted).length;
  const progressPercent = Math.round((completedCount / currentRoadmap.weeklyTasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-emerald-100">
              <CalendarCheck className="w-3.5 h-3.5" />
              Kế Hoạch Rèn Luyện & Bài Tập Cá Nhân Hóa (AI Powered)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Lịch Trình Học Tập Của Bạn
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Các bài tập và nhiệm vụ được sắp xếp theo từng tuần gắn liền với mục tiêu chính. Hoàn thành bài tập để bù đắp điểm năng lực còn thiếu.
            </p>
          </div>

          {/* Quick Metrics in Banner */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shrink-0">
            <div className="text-center">
              <div className="text-xs text-emerald-200">Tiến Độ</div>
              <div className="text-3xl font-black text-amber-300 font-mono mt-0.5">{progressPercent}%</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-xs text-emerald-200">Đã Hoàn Thành</div>
              <div className="text-2xl font-bold text-white font-mono mt-0.5">
                {completedCount}<span className="text-sm font-normal text-emerald-200">/{currentRoadmap.weeklyTasks.length} tuần</span>
              </div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-xs text-emerald-200">Dự Kiến Tăng</div>
              <div className="text-2xl font-bold text-emerald-300 font-mono mt-0.5">
                +{currentRoadmap.targetIncrease}đ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Selector Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Các lịch trình:
          </span>
          {activeRoadmaps.map((rd) => {
            const isSelected = rd.id === currentRoadmap.id;
            return (
              <button
                key={rd.id}
                onClick={() => setSelectedRoadmapId(rd.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{rd.title}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={onNavigateToAiAnalyzer}
          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>+ Tạo lịch trình mới với AI</span>
        </button>
      </div>

      {/* Current Roadmap Details & Weekly Tasks */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {currentRoadmap.type === 'sprinter' ? '⚡ Tốc hành' : currentRoadmap.type === 'balanced' ? '⚖️ Cân bằng' : '🎯 Chuyên sâu'}
              </span>
              <span className="text-xs text-slate-500">
                ⏱️ {currentRoadmap.durationWeeks} tuần • 📖 {currentRoadmap.hoursPerDay} giờ/ngày
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {currentRoadmap.title}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {currentRoadmap.overview}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleDeleteRoadmap(currentRoadmap.id)}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Xóa lộ trình này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Tiến độ hoàn thành nhiệm vụ</span>
            <span className="font-mono text-emerald-600 font-bold">{completedCount}/{currentRoadmap.weeklyTasks.length} tuần ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Weekly Tasks List */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-slate-400">
            Danh Sách Nhiệm Vụ & Bài Tập Theo Tuần (Check để ghi nhận tiến độ):
          </h3>

          <div className="space-y-3">
            {currentRoadmap.weeklyTasks.map((task) => {
              const isDone = !!task.isCompleted;

              return (
                <div
                  key={task.week}
                  className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleToggleTask(currentRoadmap.id, task.week)}
                      className={`mt-0.5 rounded-full p-1 transition cursor-pointer ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                          isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          Tuần {task.week}
                        </span>
                        <h4 className={`text-sm font-bold ${
                          isDone ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}>
                          {task.focus}
                        </h4>
                      </div>

                      <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>Bài tập trọng điểm: <strong>{task.exercises}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Task */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    <button
                      onClick={() => handleAskAiForTip(task)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 border border-indigo-200 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Mẹo giải & Bẫy đề</span>
                    </button>

                    <button
                      onClick={() => handleToggleTask(currentRoadmap.id, task.week)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isDone
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      }`}
                    >
                      {isDone ? 'Đã xong' : 'Đánh dấu xong'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Tips Modal */}
      {selectedTaskForAi && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Gợi Ý & Mẹo Làm Bài Của AI (Tuần {selectedTaskForAi.week})
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskForAi(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs mb-0.5">Trọng tâm:</span>
                <p className="text-slate-700 font-semibold">{selectedTaskForAi.focus}</p>
                <p className="text-slate-500 text-xs mt-1">Bài tập: {selectedTaskForAi.exercises}</p>
              </div>

              {aiTipLoading ? (
                <div className="py-8 text-center text-slate-500 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                  <p className="text-xs">AI đang tổng hợp phương pháp giải và các bẫy đề thi...</p>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-slate-800 text-xs whitespace-pre-line leading-relaxed">
                  {aiTipContent}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedTaskForAi(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Error Toast */}
      {deleteErrorMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <span>⚠️ {deleteErrorMsg}</span>
          <button onClick={() => setDeleteErrorMsg(null)} className="ml-2 text-white/80 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Delete Roadmap Confirmation Modal */}
      {showConfirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Xóa lịch trình luyện tập?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bạn có chắc chắn muốn xóa lộ trình này không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteRoadmap}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-rose-600/25"
              >
                Xóa lộ trình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
