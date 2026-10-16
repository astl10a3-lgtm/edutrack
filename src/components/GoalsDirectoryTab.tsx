import React, { useState } from 'react';
import { 
  Target, 
  Search, 
  Tag, 
  Filter, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Layers, 
  Calendar, 
  ExternalLink, 
  Check, 
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';
import { CompetitionGoal, StudentProfile, SubjectGrade } from '../types';
import { evaluateCompetency } from '../utils/gradeCalculations';

interface GoalsDirectoryTabProps {
  goals: CompetitionGoal[];
  selectedGoalId: string;
  setSelectedGoalId: (id: string) => void;
  profile: StudentProfile;
  subjects: SubjectGrade[];
  onActivateRoadmap: (roadmap: any) => void;
  onNavigateToRoadmapsTab: () => void;
  onNavigateToAiAnalyzer: () => void;
}

export const GoalsDirectoryTab: React.FC<GoalsDirectoryTabProps> = ({
  goals,
  selectedGoalId,
  setSelectedGoalId,
  profile,
  subjects,
  onActivateRoadmap,
  onNavigateToRoadmapsTab,
  onNavigateToAiAnalyzer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'community' | 'official'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'score_asc' | 'score_desc'>('default');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalGoal, setActiveModalGoal] = useState<CompetitionGoal | null>(null);

  // Thống kê số lượng
  const communityCount = goals.filter(g => g.isCommunity).length;
  const officialCount = goals.filter(g => !g.isCommunity).length;

  // Tập hợp tất cả các tags độc nhất
  const allTags = Array.from(
    new Set(goals.flatMap(g => g.tags || []))
  );

  // Lọc và sắp xếp danh sách mục tiêu
  const filteredGoals = goals.filter(g => {
    const matchCategory = selectedCategory === 'all'
      ? true
      : selectedCategory === 'community'
      ? g.isCommunity
      : g.category === selectedCategory;

    const matchSource = sourceFilter === 'all'
      ? true
      : sourceFilter === 'community'
      ? g.isCommunity
      : !g.isCommunity;

    const matchTag = !selectedTag || (g.tags && g.tags.includes(selectedTag));
    const matchQuery = !searchQuery || 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchSource && matchTag && matchQuery;
  }).sort((a, b) => {
    if (sortBy === 'score_asc') return (a.requiredScore || 0) - (b.requiredScore || 0);
    if (sortBy === 'score_desc') return (b.requiredScore || 0) - (a.requiredScore || 0);
    return 0;
  });

  return (
    <div className="space-y-5 max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Thư Viện Kỳ Thi & Mục Tiêu Học Tập
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Hệ Thống Phân Loại Mục Tiêu & Kỳ Thi (Tags vnEdu)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Khám phá các kỳ thi chuẩn hóa, mục tiêu gỡ điểm và các kỳ thi do cộng đồng chia sẻ. Chọn mục tiêu để đối chiếu hệ quy chiếu 1000 điểm.
          </p>
        </div>

        <button
          onClick={onNavigateToAiAnalyzer}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20 whitespace-nowrap self-stretch sm:self-auto shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>+ Nhập Kỳ Thi / Mục Tiêu Mới (AI)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên kỳ thi, tag (#Khối_A00, #IELTS...)"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
            />
          </div>

          {/* Source Filter (Community vs Official) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                sourceFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({goals.length})
            </button>
            <button
              onClick={() => setSourceFilter('community')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                sourceFilter === 'community' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Cộng đồng chia sẻ ({communityCount})</span>
            </button>
            <button
              onClick={() => setSourceFilter('official')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                sourceFilter === 'official' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chính thức ({officialCount})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-auto">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="default">Mặc định</option>
              <option value="score_asc">Điểm chuẩn: Thấp → Cao</option>
              <option value="score_desc">Điểm chuẩn: Cao → Thấp</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-2.5">
          {[
            { id: 'all', label: 'Tất cả chủ đề' },
            { id: 'community', label: '🌟 Mục tiêu cộng đồng' },
            { id: 'exam', label: '🏛️ Kỳ thi chuẩn hóa' },
            { id: 'academic_boost', label: '📈 Cải thiện điểm số' },
            { id: 'scholarship', label: '🎓 Săn học bổng' },
            { id: 'certificate', label: '📜 Chứng chỉ ngoại ngữ' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tag Badges Cloud */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Tag className="w-3 h-3 text-indigo-500" /> Lọc theo Tag:
          </span>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer shrink-0"
            >
              ✕ Bỏ lọc tag: {selectedTag}
            </button>
          )}
          {allTags.slice(0, 12).map((tag, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredGoals.map((goal) => {
          const evalResult = evaluateCompetency(profile, subjects, goal);
          const isSelected = selectedGoalId === goal.id;

          let categoryBadge = 'bg-blue-100 text-blue-800';
          let categoryName = 'Kỳ thi chuẩn hóa';
          if (goal.category === 'academic_boost') {
            categoryBadge = 'bg-emerald-100 text-emerald-800';
            categoryName = 'Cải thiện điểm số vnEdu';
          } else if (goal.category === 'scholarship') {
            categoryBadge = 'bg-purple-100 text-purple-800';
            categoryName = 'Học bổng đại học';
          } else if (goal.category === 'certificate') {
            categoryBadge = 'bg-amber-100 text-amber-800';
            categoryName = 'Chứng chỉ ngoại ngữ';
          }

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-2xl p-5 border transition flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                isSelected 
                  ? 'border-blue-600 ring-2 ring-blue-500/20' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                {/* Card Top Pill */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${categoryBadge}`}>
                    {categoryName}
                  </span>
                  {goal.isCommunity ? (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <Users className="w-3 h-3" /> Người dùng đóng góp
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">
                      Chính thức
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-2">
                  {goal.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {goal.description}
                </p>

                {/* TAGS Badges Section */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-1.5">
                    <Tag className="w-3 h-3" /> Các thẻ TAG yêu cầu:
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                    {goal.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        onClick={() => setSelectedTag(tag)}
                        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Assessment & Action */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                {/* Score vs Target Comparison */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Năng lực của bạn</span>
                    <span className="font-black font-mono text-slate-800 text-sm">
                      {evalResult.totalScore} <span className="text-slate-400 text-xs font-normal">/ {goal.requiredScore}đ</span>
                    </span>
                  </div>

                  <div>
                    {evalResult.gapScore === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> Đạt chuẩn
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" /> Thiếu {evalResult.gapScore}đ
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setActiveModalGoal(goal)}
                    className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Xem tag & Yêu cầu</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedGoalId(goal.id);
                      if (goal.recommendedRoadmaps?.length > 0) {
                        onActivateRoadmap(goal.recommendedRoadmaps[0]);
                      }
                      setActiveModalGoal(goal);
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold text-xs transition flex items-center gap-1 cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {isSelected ? 'Đang chọn' : 'Đặt mục tiêu'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Detail Modal (Shows all TAGS, Criteria & System Benchmark) */}
      {activeModalGoal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {activeModalGoal.category === 'exam' ? 'Kỳ thi chính thức' : 'Mục tiêu học tập'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {activeModalGoal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalGoal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 py-4 text-xs sm:text-sm">
              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wider text-slate-400">
                  Mô Tả & Thông Tin Kỳ Thi
                </h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {activeModalGoal.description}
                </p>
              </div>

              {/* All TAGS in Detail */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Hệ Thống Thẻ TAGS & Điều Kiện Quy Chiếu
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeModalGoal.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specific Criteria Checklist */}
              {activeModalGoal.criteria && activeModalGoal.criteria.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Điều Kiện & Tiêu Chí Cần Đạt
                  </h4>
                  <div className="space-y-2">
                    {activeModalGoal.criteria.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                          item.importance === 'mandatory'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.importance === 'mandatory' ? 'Bắt buộc' : 'Ưu tiên'}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">{item.name}</span>
                          <span className="text-xs text-slate-600">{item.requirement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benchmark Weights */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Cấu Trúc Hệ Quy Chiếu Năng Lực (Thang 1000 Điểm)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-[10px] text-blue-700 font-semibold">Học bạ GPA</div>
                    <div className="text-base font-black text-blue-900">{activeModalGoal.benchmarkWeights.academicGpa}đ</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200">
                    <div className="text-[10px] text-indigo-700 font-semibold">Môn nòng cốt</div>
                    <div className="text-base font-black text-indigo-900">{activeModalGoal.benchmarkWeights.coreSubjects}đ</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-700 font-semibold">Ngoại ngữ</div>
                    <div className="text-base font-black text-emerald-900">{activeModalGoal.benchmarkWeights.languageCert}đ</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="text-[10px] text-amber-700 font-semibold">Ngoại khóa</div>
                    <div className="text-base font-black text-amber-900">{activeModalGoal.benchmarkWeights.activities}đ</div>
                  </div>
                </div>
              </div>

              {/* Recommended Roadmaps Section */}
              {activeModalGoal.recommendedRoadmaps && activeModalGoal.recommendedRoadmaps.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Các Lịch Trình Luyện Tập Có Sẵn Cho Kỳ Thi Này
                  </h4>
                  <div className="space-y-2">
                    {activeModalGoal.recommendedRoadmaps.map((rd, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              {rd.type}
                            </span>
                            <span className="font-bold text-slate-800 text-xs">{rd.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            ⏱️ {rd.durationWeeks} tuần • {rd.hoursPerDay} giờ/ngày • Dự kiến tăng +{rd.targetIncrease} điểm
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            onActivateRoadmap(rd);
                            setActiveModalGoal(null);
                            onNavigateToRoadmapsTab();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer whitespace-nowrap shadow-xs"
                        >
                          Kích hoạt lộ trình
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveModalGoal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  setSelectedGoalId(activeModalGoal.id);
                  setActiveModalGoal(null);
                }}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Đặt làm mục tiêu theo dõi chính
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
