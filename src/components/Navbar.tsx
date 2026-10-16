import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  Compass, 
  Sparkles, 
  CalendarCheck, 
  Award,
  ChevronDown,
  UserCheck,
  User,
  Lock,
  Users,
  LogOut,
  ArrowRightLeft,
  LogIn,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { StudentProfile, UserSession } from '../types';
import { StudentRecord } from '../data/defaultData';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserSession;
  onOpenAuthModal: () => void;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  studentsList: StudentRecord[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  overallGpa: number;
  academicRank: {
    rank: string;
    color: string;
    badgeBg: string;
  };
  competencyScore: number;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuthModal,
  profile,
  setProfile,
  studentsList,
  selectedStudentId,
  onSelectStudent,
  overallGpa,
  academicRank,
  competencyScore,
  onLogout,
}) => {
  const isTeacher = currentUser.role === 'teacher';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner / Student vnEdu Info */}
      <div className={`text-white text-xs px-4 py-2 ${
        isTeacher 
          ? 'bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-800/40' 
          : 'bg-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Cổng vnEdu 4.0
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300 font-medium truncate max-w-[150px] sm:max-w-none">Trường: {profile.schoolName}</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-300 hidden sm:inline">Năm học: {profile.academicYear}</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* If Teacher, Quick Student Switcher */}
            {isTeacher && (
              <div className="flex items-center gap-1.5 bg-purple-900/80 px-2.5 py-1 rounded-md text-purple-200 border border-purple-700/60">
                <span className="text-purple-300 font-semibold">Xem học sinh:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => onSelectStudent(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer max-w-36"
                >
                  {studentsList.map(st => (
                    <option key={st.profile.id} value={st.profile.id} className="bg-slate-900 text-white">
                      {st.profile.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md text-slate-200 border border-slate-700">
              <span className="text-slate-400">Học kỳ:</span>
              <select
                value={profile.semester}
                onChange={(e) => setProfile(prev => ({ ...prev, semester: e.target.value as any }))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="hk1" className="bg-slate-900 text-white">Học kỳ 1</option>
                <option value="hk2" className="bg-slate-900 text-white">Học kỳ 2</option>
                <option value="year" className="bg-slate-900 text-white">Cả năm</option>
              </select>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-md">
              <Award className="w-3.5 h-3.5" />
              <span>Học lực: <strong className="text-emerald-200">{academicRank.rank}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  EduTrack <span className="text-blue-600">AI</span>
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isTeacher ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isTeacher ? 'GV Quản Lý' : 'vnEdu Core'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Sổ điểm chuẩn • Nhận xét năng lực • Lộ trình cá nhân hóa
              </p>
            </div>
          </div>

          {/* Quick Metrics Header Pill */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-1.5">
            {isTeacher ? (
              <>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-semibold text-purple-600">Học sinh đang chọn</p>
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-36">{profile.fullName}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">ĐTB (GPA)</p>
                  <p className="text-base font-bold text-purple-700 leading-tight">{overallGpa.toFixed(1)} / 10</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Học lực</p>
                  <p className="text-xs font-bold text-emerald-600 leading-tight">{academicRank.rank}</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Điểm TBhk (GPA)</p>
                  <p className="text-base font-bold text-blue-700 leading-tight">{overallGpa.toFixed(1)} / 10</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Điểm Năng Lực</p>
                  <p className="text-base font-bold text-indigo-700 leading-tight">{competencyScore} <span className="text-xs font-normal text-slate-500">/ 1000</span></p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Mã Học Sinh</p>
                  <p className="text-xs font-semibold text-slate-700">{profile.studentCode}</p>
                </div>
              </>
            )}
          </div>

          {/* User profile & Login switch capsule */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                isTeacher 
                  ? 'bg-purple-100 border border-purple-300 text-purple-700' 
                  : 'bg-blue-100 border border-blue-300 text-blue-700'
              }`}>
                {isTeacher ? 'GV' : profile.fullName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {isTeacher ? currentUser.fullName : profile.fullName}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isTeacher ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isTeacher ? 'Giáo viên' : 'Học sinh'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {isTeacher ? currentUser.title || 'GVCN 11A1' : profile.classRoom}
                </div>
              </div>
            </div>

            {/* Auth Switcher & Logout Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAuthModal}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isTeacher
                    ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
                title="Đổi tài khoản khác"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Đổi tài khoản</span>
                <span className="sm:hidden">Đổi TK</span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 -mb-px scrollbar-none border-t border-slate-100 pt-1.5">
          {/* TEACHER ONLY NAVIGATION: Chức năng 1 (Nhập điểm) và Chức năng 2 (Ghi nhận xét đánh giá năng lực) */}
          {isTeacher ? (
            <>
              <button
                onClick={() => setActiveTab('teacher-grading')}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'teacher-grading'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <BookOpen className="w-4 h-4 text-purple-200" />
                <span>1. Nhập Điểm Học Sinh</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-800 text-purple-100">
                  Chuẩn TT22
                </span>
              </button>

              <button
                onClick={() => setActiveTab('teacher-comments')}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'teacher-comments'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <UserCheck className="w-4 h-4 text-indigo-200" />
                <span>2. Ghi Nhận Xét & Đánh Giá Năng Lực</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-800 text-indigo-100">
                  Học bạ & Năng lực
                </span>
              </button>
            </>
          ) : (
            <>
              {/* STUDENT NAVIGATION */}
              <button
                onClick={() => setActiveTab('gradebook')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'gradebook'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Sổ Điểm & Xếp Loại</span>
              </button>

              <button
                onClick={() => setActiveTab('competency')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'competency'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Kiểm Tra Năng Lực</span>
              </button>

              <button
                onClick={() => setActiveTab('directory')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'directory'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Kỳ Thi & Mục Tiêu (Tags)</span>
              </button>

              <button
                onClick={() => setActiveTab('ai-analyze')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'ai-analyze'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Thêm Mục Tiêu Mới</span>
              </button>

              <button
                onClick={() => setActiveTab('roadmaps')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'roadmaps'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Lộ Trình Cải Thiện AI</span>
              </button>

              <button
                onClick={() => setActiveTab('psychologist')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'psychologist'
                    ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs ring-1 ring-teal-400'
                    : 'text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${activeTab === 'psychologist' ? 'text-rose-300 fill-rose-300' : 'text-teal-600 fill-teal-600/20'}`} />
                <span>Chuyên Gia Tâm Lý AI</span>
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Mới
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

