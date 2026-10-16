import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Calendar, 
  Save, 
  Share2, 
  RotateCcw, 
  FileText, 
  Flame, 
  Check, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { CompetitionGoal, StudentProfile, SubjectGrade, StudyRoadmap } from '../types';

interface AiGoalAnalyzerTabProps {
  profile: StudentProfile;
  subjects: SubjectGrade[];
  onGoalSaved: (newGoal: CompetitionGoal) => void;
  onActivateRoadmap: (roadmap: StudyRoadmap) => void;
  onNavigateToRoadmapsTab: () => void;
  prefilledGoal?: {
    title: string;
    category: string;
    description: string;
  };
}

export const AiGoalAnalyzerTab: React.FC<AiGoalAnalyzerTabProps> = ({
  profile,
  subjects,
  onGoalSaved,
  onActivateRoadmap,
  onNavigateToRoadmapsTab,
  prefilledGoal,
}) => {
  const [title, setTitle] = useState(prefilledGoal?.title || '');
  const [category, setCategory] = useState(prefilledGoal?.category || 'exam');
  const [description, setDescription] = useState(prefilledGoal?.description || '');
  const [notes, setNotes] = useState('');
  const [shareToCommunity, setShareToCommunity] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [selectedRoadmapIndex, setSelectedRoadmapIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);

  // Mẫu mục tiêu nhanh
  const samplePrompts = [
    {
      label: '🏆 Kỳ thi Học Sinh Giỏi Môn Toán Cấp Tỉnh',
      category: 'exam',
      title: 'Kỳ thi Học Sinh Giỏi Môn Toán Cấp Tỉnh 2026',
      desc: 'Kỳ thi tuyển chọn học sinh giỏi cấp tỉnh môn Toán. Cấu trúc bài thi tự luận 180 phút gồm Đại số hàm số, Số học tổ hợp, Hình học phẳng và Bất đẳng thức cực trị. Mục tiêu đạt giải Ba trở lên để xét tuyển thẳng đại học.',
    },
    {
      label: '📈 Gỡ Điểm Môn Hóa & Toán Từ 7.0 Lên 8.5',
      category: 'academic_boost',
      title: 'Kế Hoạch Gỡ Điểm Môn Hóa & Toán Học Kỳ 2',
      desc: 'Điểm kiểm tra hiện tại môn Hóa là 7.3 và Toán là 8.3. Cần kế hoạch ôn luyện 3-4 tuần để gỡ điểm bài kiểm tra định kỳ và thi học kỳ, kéo ĐTBm cả hai môn lên trên 8.5 để đạt học sinh Xuất Sắc.',
    },
    {
      label: '🎓 Săn Học Bổng A-Star / VinUni 80%',
      category: 'scholarship',
      title: 'Học Bổng Toàn Phần Tài Năng Trẻ VinUni / Quốc Tế',
      desc: 'Yêu cầu GPA THPT >= 9.0, IELTS 7.5+, tham gia các dự án đổi mới sáng tạo hoặc nghiên cứu khoa học, kèm bài luận cá nhân thể hiện tinh thần dẫn dắt cộng đồng.',
    },
    {
      label: '📝 Chinh Phục SAT 1450+ Trong 3 Tháng',
      category: 'certificate',
      title: 'Mục Tiêu Thi Chuẩn Hóa SAT Digital 1450+',
      desc: 'Kỳ thi SAT Digital gồm 2 module Math và Reading/Writing. Mục tiêu đạt tối thiểu 750 điểm Toán và 700 điểm Reading/Writing để nộp hồ sơ xét tuyển sớm đại học top đầu.',
    },
  ];

  const handleApplySample = (sample: typeof samplePrompts[0]) => {
    setTitle(sample.title);
    setCategory(sample.category);
    setDescription(sample.desc);
    setError(null);
  };

  const handleAnalyzeWithAi = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tên kỳ thi hoặc mục tiêu!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/ai/analyze-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalInput: {
            title,
            category,
            description,
            notes,
          },
          userProfile: {
            className: profile.classRoom,
            gpa: (subjects.reduce((a, b) => a + b.averageGrade, 0) / subjects.length).toFixed(1),
            academicRank: profile.conduct,
            certificates: profile.certificates,
          },
          userGrades: subjects.map(s => ({
            name: s.name,
            average: s.averageGrade,
            isCore: s.isCoreSubject,
          })),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Lỗi khi phân tích mục tiêu');
      }

      setAnalysisResult(data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra khi kết nối với máy chủ AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndAddGoal = async () => {
    if (!analysisResult) return;

    const newGoal: CompetitionGoal = {
      id: `goal-custom-${Date.now()}`,
      title: analysisResult.title || title,
      category: (analysisResult.category || category) as any,
      description: analysisResult.description || description,
      tags: analysisResult.tags || ['#MụcTiêuMới', '#DoHọcSinhTạo'],
      requiredScore: analysisResult.requiredScore || 800,
      benchmarkWeights: analysisResult.benchmarkWeights || {
        academicGpa: 350,
        coreSubjects: 350,
        languageCert: 150,
        activities: 150,
      },
      criteria: analysisResult.criteria || [],
      recommendedRoadmaps: analysisResult.roadmaps || [],
      createdBy: profile.fullName || 'Học sinh',
      createdAt: new Date().toISOString(),
      isCommunity: shareToCommunity,
    };

    // Lưu vào kho mục tiêu của web
    onGoalSaved(newGoal);

    // Nếu chọn chia sẻ cộng đồng, gửi lên server backend để lưu vào bộ nhớ chung
    if (shareToCommunity) {
      try {
        await fetch('/api/community-goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGoal),
        });
      } catch (e) {
        console.warn('Không thể đồng bộ cộng đồng:', e);
      }
    }

    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            AI Phân Loại Tags & Xây Dựng Hệ Quy Chiếu Tự Động
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Nhập Kỳ Thi Hoặc Mục Tiêu Học Tập Bất Kỳ
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Nếu mục tiêu hoặc kỳ thi của bạn chưa có sẵn trên web, hãy điền tên hoặc dán quy chế tuyển sinh/nội dung thi vào đây. AI sẽ tự động phân loại các thẻ <strong>TAGS</strong>, trích xuất điều kiện, thiết lập thang điểm chuẩn 1000, đánh giá lỗ hổng điểm số của bạn và tạo <strong>3 Lịch trình luyện tập</strong> phong phú để bạn lựa chọn!
          </p>
        </div>
      </div>

      {/* Input Form Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            Gợi Ý Mẫu Mục Tiêu Phổ Biến (Bấm Để Thử Ngay):
          </h3>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => handleApplySample(sp)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 transition cursor-pointer text-slate-700"
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tên Kỳ Thi / Mục Tiêu Cần Đạt *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Kỳ thi Tuyển sinh 10 Chuyên Sư Phạm, Bứt phá điểm Toán 8.5+, SAT 1400..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Phân Loại Mục Tiêu
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="exam">Kỳ thi chính thức / Chuyển cấp</option>
              <option value="academic_boost">Cải thiện điểm số vnEdu</option>
              <option value="scholarship">Săn học bổng tài năng</option>
              <option value="certificate">Chứng chỉ ngoại ngữ / Tin học</option>
              <option value="long_term">Mục tiêu dài hạn cá nhân</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Mô Tả / Thể Lệ / Đề Cương / Yêu Cầu Của Mục Tiêu (Hoặc Dán Nội Dung Vào Đây)
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dán thể lệ kỳ thi, các môn thi, dạng đề, hoặc ghi rõ: 'Em muốn cải thiện điểm môn Hóa và Toán học kỳ 2 để kéo điểm trung bình lên 8.5, mỗi ngày em có thể dành 2 tiếng'..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-normal leading-relaxed"
          />
        </div>

        {/* Share to Web Library Option */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={shareToCommunity}
              onChange={(e) => setShareToCommunity(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span>
              Lưu kỳ thi này vào <strong>Thư viện Mục tiêu Chung của Web</strong> để các bạn học sinh khác cũng có thể xem và lựa chọn
            </span>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              setTitle('');
              setDescription('');
              setAnalysisResult(null);
              setError(null);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
          >
            Làm mới form
          </button>

          <button
            onClick={handleAnalyzeWithAi}
            disabled={isLoading || !title.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang phân tích & thiết lập hệ quy chiếu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>✨ AI Phân Tích & Chuẩn Hóa Hệ Quy Chiếu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Analysis Result Section */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header of Results */}
          <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Kết Quả Chuẩn Hóa AI
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {analysisResult.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đã được AI bóc tách điều kiện, gắn tag và liên kết trực tiếp với sổ điểm vnEdu của bạn.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAndAddGoal}
                  disabled={isSaved}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã lưu vào web thành công</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu kỳ thi này vào thư viện</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Extracted TAGS Badges */}
            <div className="py-4 border-b border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                Các Thẻ TAG Do AI Tự Động Phân Loại:
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.tags?.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Criteria Checklist & Gap Evaluation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4 border-b border-slate-100">
              {/* Criteria */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Điều Kiện & Tiêu Chí Thi AI Bóc Tách:
                </h4>
                <div className="space-y-2">
                  {analysisResult.criteria?.map((cr: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{cr.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cr.importance === 'mandatory' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {cr.importance === 'mandatory' ? 'Bắt buộc' : 'Khuyến nghị'}
                        </span>
                      </div>
                      <p className="text-slate-600">{cr.requirement}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Gap Assessment */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Đối Chiếu Năng Lực Hiện Tại vs Chuẩn 1000đ:
                </h4>
                <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl text-white space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Điểm Của Bạn</span>
                      <div className="text-3xl font-black text-emerald-400 font-mono">
                        {analysisResult.currentEvaluation?.estimatedCurrentScore}đ
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Điểm Chuẩn Cần Đạt</span>
                      <div className="text-2xl font-bold text-amber-300 font-mono">
                        {analysisResult.requiredScore}đ
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-white/10">
                    <span className="text-xs text-slate-300 block font-medium">
                      Lỗ hổng: {analysisResult.currentEvaluation?.gapScore > 0 ? `Còn thiếu ${analysisResult.currentEvaluation?.gapScore} điểm` : 'Đã đạt chuẩn'}
                    </span>
                    <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                      {analysisResult.currentEvaluation?.gapAnalysis}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Generated Roadmaps Options (The user can choose one) */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    AI Đã Tạo Ra {analysisResult.roadmaps?.length || 3} Lịch Trình Luyện Tập Khác Biệt
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hãy bấm chọn lịch trình phù hợp nhất với phong cách và thời gian biểu của bạn:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResult.roadmaps?.map((rd: any, idx: number) => {
                  const isSelected = selectedRoadmapIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedRoadmapIndex(idx)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            {rd.type === 'sprinter' ? '⚡ Tốc hành' : rd.type === 'balanced' ? '⚖️ Cân bằng' : '🎯 Chuyên sâu'}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-600">
                            +{rd.targetIncrease} điểm
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {rd.title}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {rd.overview}
                        </p>

                        <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-3">
                          <span>⏱️ {rd.durationWeeks} tuần</span>
                          <span>📖 {rd.hoursPerDay} giờ/ngày</span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs text-indigo-700 font-semibold">
                          {isSelected ? '✓ Đang chọn' : 'Nhấp để chọn'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoadmapIndex(idx);
                            onActivateRoadmap(rd);
                            onNavigateToRoadmapsTab();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Kích hoạt ngay</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
