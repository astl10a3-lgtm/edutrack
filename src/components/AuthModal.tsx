import React, { useState } from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  X, 
  User, 
  UserPlus, 
  LogIn, 
  School,
  Building,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { UserSession, UserRole, RegistrationRequest } from '../types';
import { StudentRecord } from '../data/defaultData';
import { syncRequestsWithCloud, fetchCloudRequests, saveCloudRequests } from '../services/cloudSync';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isForced?: boolean;
  currentUser: UserSession | null;
  studentsRoster: StudentRecord[];
  onLoginSuccess: (user: UserSession, selectedStudentId?: string) => void;
  onNewRegistrationRequestSubmitted?: (newReq: RegistrationRequest) => void;
  registrationRequests: RegistrationRequest[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isForced = false,
  currentUser,
  studentsRoster,
  onLoginSuccess,
  onNewRegistrationRequestSubmitted,
  registrationRequests,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');

  // Login form fields (completely empty by default, no pre-filled sample accounts)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regClassRoom, setRegClassRoom] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regStudentCode, setRegStudentCode] = useState('');

  // State for submission confirmation
  const [submittedRequest, setSubmittedRequest] = useState<RegistrationRequest | null>(null);
  const [regCreationMode, setRegCreationMode] = useState<'instant' | 'approval'>('instant');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const userClean = loginUsername.trim();
    const passClean = loginPassword.trim();

    if (!userClean) {
      setErrorMsg('Vui lòng nhập tên đăng nhập!');
      return;
    }

    if (!passClean) {
      setErrorMsg('Vui lòng nhập mật khẩu xác thực!');
      return;
    }

    // 1. Direct Check for Admin credentials as instructed
    if (userClean.toLowerCase() === 'adminedu' && passClean === 'admindanang') {
      const adminSession: UserSession = {
        id: 'admin-01',
        username: 'adminedu',
        fullName: 'Quản Trị Viên Hệ Thống',
        role: 'admin',
        title: 'Quản trị viên vnEdu',
        schoolName: 'Hệ Thống vnEdu',
        classRoom: 'Ban Quản Trị',
      };
      onLoginSuccess(adminSession);
      onClose?.();
      return;
    }

    setIsLoading(true);

    try {
      // Try backend API first
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userClean, password: passClean }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user, data.user.id);
        setIsLoading(false);
        onClose?.();
        return;
      } else if (data.status === 'pending') {
        // Double check if local storage or registrationRequests has approved this user
        const localMatched = registrationRequests.find(r => r.username.toLowerCase() === userClean.toLowerCase());
        if (localMatched && localMatched.status === 'approved' && (!localMatched.password || localMatched.password === passClean)) {
          // Local approval is authoritative - sync to server in background
          fetch(`/api/registration-requests/${localMatched.id}/approve`, { method: 'PUT' }).catch(() => {});
          const session: UserSession = {
            id: localMatched.id,
            username: localMatched.username,
            fullName: localMatched.fullName,
            role: localMatched.role,
            title: localMatched.title,
            studentCode: localMatched.studentCode,
            classRoom: localMatched.classRoom,
            schoolName: localMatched.schoolName,
          };
          onLoginSuccess(session, localMatched.id);
          setIsLoading(false);
          onClose?.();
          return;
        }

        setErrorMsg('⛔ Tài khoản này đang chờ Quản trị viên (Admin) phê duyệt. Bạn chưa thể đăng nhập cho đến khi Admin chấp nhận yêu cầu tạo tài khoản!');
        setIsLoading(false);
        return;
      } else if (data.status === 'rejected') {
        setErrorMsg(data.error || '⛔ Yêu cầu tạo tài khoản đã bị Admin từ chối.');
        setIsLoading(false);
        return;
      } else {
        // Fallback check in local registrationRequests state
        checkLocalRequestsAndLogin(userClean, passClean);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      // Offline fallback: check local requests
      checkLocalRequestsAndLogin(userClean, passClean);
      setIsLoading(false);
    }
  };

  const checkLocalRequestsAndLogin = (userClean: string, passClean: string) => {
    // Special support for pre-approved accounts: nguyenvanA and nguyenvanB
    if (userClean.toLowerCase() === 'nguyenvana' && passClean === 'nguyenvanA123') {
      const studentSession: UserSession = {
        id: 'student-nguyenvanA',
        username: 'nguyenvanA',
        fullName: 'Nguyễn Văn A',
        role: 'student',
        studentCode: 'HS2026-001A',
        classRoom: '11A1',
        schoolName: 'THPT Chu Văn An',
      };
      onLoginSuccess(studentSession, 'student-nguyenvanA');
      onClose?.();
      return;
    }

    if (userClean.toLowerCase() === 'nguyenvanb' && passClean === 'nguyenvanB123') {
      const teacherSession: UserSession = {
        id: 'teacher-nguyenvanB',
        username: 'nguyenvanB',
        fullName: 'Thầy Nguyễn Văn B',
        role: 'teacher',
        title: 'Giáo Viên Chủ Nhiệm 11A1',
        classRoom: '11A1',
        schoolName: 'THPT Chu Văn An',
      };
      onLoginSuccess(teacherSession);
      onClose?.();
      return;
    }

    // Check locally in registrationRequests
    const matched = registrationRequests.find(
      r => r.username.toLowerCase() === userClean.toLowerCase()
    );

    if (!matched) {
      setErrorMsg('Tài khoản không tồn tại. Nếu bạn chưa có tài khoản, vui lòng bấm sang tab "Đăng Ký Tài Khoản" để điền thông tin và gửi yêu cầu phê duyệt tới Admin!');
      return;
    }

    if (matched.status === 'pending') {
      setErrorMsg('⛔ Tài khoản của bạn đang ở trạng thái CHỜ PHÊ DUYỆT từ Quản trị viên (Admin). Vui lòng đợi Admin duyệt trước khi đăng nhập!');
      return;
    }

    if (matched.status === 'rejected') {
      setErrorMsg(`⛔ Yêu cầu tạo tài khoản đã bị Admin từ chối. Lý do: "${matched.rejectionReason || 'Thông tin chưa hợp lệ'}"`);
      return;
    }

    if (matched.password && matched.password !== passClean) {
      setErrorMsg('Mật khẩu xác thực không chính xác!');
      return;
    }

    const session: UserSession = {
      id: matched.id,
      username: matched.username,
      fullName: matched.fullName,
      role: matched.role,
      title: matched.title,
      studentCode: matched.studentCode,
      classRoom: matched.classRoom,
      schoolName: matched.schoolName,
    };

    onLoginSuccess(session, matched.id);
    onClose?.();
  };

  // Handle Register New Account
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fullNameClean = regFullName.trim();
    const userClean = regUsername.trim();
    const passClean = regPassword.trim();
    const classRoomClean = regClassRoom.trim();
    const schoolClean = regSchool.trim();

    if (!fullNameClean) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn!');
      return;
    }
    if (!userClean) {
      setErrorMsg('Vui lòng chọn tên đăng nhập!');
      return;
    }
    if (userClean.length < 3) {
      setErrorMsg('Tên đăng nhập phải có ít nhất 3 ký tự!');
      return;
    }
    if (userClean.toLowerCase() === 'adminedu') {
      setErrorMsg('Tên đăng nhập "adminedu" dành riêng cho Quản trị viên hệ thống!');
      return;
    }
    if (!passClean || passClean.length < 4) {
      setErrorMsg('Mật khẩu cần tối thiểu 4 ký tự!');
      return;
    }
    if (passClean !== regConfirmPassword.trim()) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (!classRoomClean) {
      setErrorMsg('Vui lòng nhập tên lớp (Ví dụ: 10A1, 11A2, 12A3...)!');
      return;
    }
    if (!schoolClean) {
      setErrorMsg('Vui lòng nhập tên trường học!');
      return;
    }

    // Check if username already exists in requests
    const exists = registrationRequests.some(
      r => r.username.toLowerCase() === userClean.toLowerCase()
    );
    if (exists) {
      setErrorMsg('Tên đăng nhập này đã được sử dụng hoặc đang chờ phê duyệt. Vui lòng chọn tên khác!');
      return;
    }

    setIsLoading(true);

    const generatedCode = selectedRole === 'student' 
      ? (regStudentCode.trim() || `HS2026-${Math.floor(1000 + Math.random() * 9000)}`) 
      : undefined;

    const isInstant = regCreationMode === 'instant';

    const newRequest: RegistrationRequest = {
      id: `req-${Date.now()}`,
      role: selectedRole,
      fullName: fullNameClean,
      username: userClean,
      password: passClean,
      classRoom: classRoomClean,
      schoolName: schoolClean,
      title: selectedRole === 'teacher' ? (regTitle.trim() || 'Giáo viên Bộ môn') : undefined,
      studentCode: generatedCode,
      status: isInstant ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      processedAt: isInstant ? new Date().toISOString() : undefined,
      processedBy: isInstant ? 'Hệ Thống vnEdu (Tự động kích hoạt)' : undefined,
    };

    try {
      // Post to backend server
      const res = await fetch('/api/registration-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
      const data = await res.json();
      const finalRequest = (data.success && data.request) ? data.request : newRequest;

      if (onNewRegistrationRequestSubmitted) {
        onNewRegistrationRequestSubmitted(finalRequest);
      }

      if (isInstant) {
        // Automatically sign in the user directly!
        const userSession: UserSession = {
          id: finalRequest.id,
          username: finalRequest.username,
          fullName: finalRequest.fullName,
          role: finalRequest.role,
          title: finalRequest.title,
          studentCode: finalRequest.studentCode,
          classRoom: finalRequest.classRoom,
          schoolName: finalRequest.schoolName,
        };
        onLoginSuccess(userSession, finalRequest.id);
        onClose?.();
        return;
      } else {
        setSubmittedRequest(finalRequest);
      }
    } catch (err) {
      // Local fallback
      if (onNewRegistrationRequestSubmitted) {
        onNewRegistrationRequestSubmitted(newRequest);
      }
      if (isInstant) {
        const userSession: UserSession = {
          id: newRequest.id,
          username: newRequest.username,
          fullName: newRequest.fullName,
          role: newRequest.role,
          title: newRequest.title,
          studentCode: newRequest.studentCode,
          classRoom: newRequest.classRoom,
          schoolName: newRequest.schoolName,
        };
        onLoginSuccess(userSession, newRequest.id);
        onClose?.();
        return;
      } else {
        setSubmittedRequest(newRequest);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetModal = () => {
    setSubmittedRequest(null);
    setAuthMode('login');
    setErrorMsg(null);
    setRegFullName('');
    setRegUsername('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegClassRoom('');
    setRegSchool('');
    setRegTitle('');
    setRegStudentCode('');
  };

  const modalCard = (
    <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
      {/* Close Button (only if not forced) */}
      {!isForced && onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Modal Brand Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isForced ? 'Cổng Xác Thực vnEdu 4.0' : 'Hệ Thống vnEdu 4.0'}
          </h2>
          <p className="text-xs text-slate-500">
            {isForced 
              ? 'Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục truy cập' 
              : 'Đăng nhập tài khoản hoặc Đăng ký yêu cầu phê duyệt từ Admin'}
          </p>
        </div>
      </div>

        {/* CASE: SUBMITTED REGISTRATION PENDING NOTICE */}
        {submittedRequest ? (
          <div className="space-y-5 py-2">
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-amber-900">
                    Đã Gửi Yêu Cầu Tạo Tài Khoản Đến Admin!
                  </h3>
                  <p className="text-xs text-amber-800">
                    Trạng thái: <strong className="font-bold underline">Chờ Quản Trị Viên Phê Duyệt</strong>
                  </p>
                </div>
              </div>

              <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Họ và tên:</span>
                  <span className="font-bold text-slate-900">{submittedRequest.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tên đăng nhập:</span>
                  <span className="font-mono font-bold text-indigo-700">{submittedRequest.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vai trò yêu cầu:</span>
                  <span className="font-bold text-purple-700">
                    {submittedRequest.role === 'teacher' ? '👩‍🏫 Giáo Viên' : '👨‍🎓 Học Sinh'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lớp:</span>
                  <span className="font-bold text-slate-900">{submittedRequest.classRoom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trường học:</span>
                  <span className="font-bold text-slate-900">{submittedRequest.schoolName}</span>
                </div>
                {submittedRequest.studentCode && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã học sinh:</span>
                    <span className="font-mono text-slate-700">{submittedRequest.studentCode}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-100/70 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Quy trình phê duyệt xác thực tài khoản:
                </p>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Thông báo đã được gửi đến tài khoản <strong>Quản trị viên (adminedu)</strong>. Tài khoản của bạn sẽ chỉ có thể đăng nhập sau khi Admin duyệt xác nhận tạo tài khoản thành công.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {/* Option 1: Quick Admin Login to Approve */}
              <button
                type="button"
                onClick={() => {
                  const adminSession: UserSession = {
                    id: 'admin-01',
                    username: 'adminedu',
                    fullName: 'Quản Trị Viên Hệ Thống',
                    role: 'admin',
                    title: 'Quản trị viên vnEdu',
                    schoolName: 'Hệ Thống vnEdu',
                    classRoom: 'Ban Quản Trị',
                  };
                  onLoginSuccess(adminSession);
                  onClose?.();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2 border border-slate-700"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>🔑 Đăng Nhập Admin (adminedu) Để Duyệt Ngay</span>
              </button>

              {/* Option 2: Instant Activate & Login */}
              <button
                type="button"
                onClick={() => {
                  const approvedReq: RegistrationRequest = {
                    ...submittedRequest,
                    status: 'approved',
                    processedAt: new Date().toISOString(),
                    processedBy: 'Hệ Thống (Kích hoạt nhanh)',
                  };
                  if (onNewRegistrationRequestSubmitted) {
                    onNewRegistrationRequestSubmitted(approvedReq);
                  }
                  fetch(`/api/registration-requests/${submittedRequest.id}/approve`, { method: 'PUT' }).catch(() => {});
                  const userSession: UserSession = {
                    id: approvedReq.id,
                    username: approvedReq.username,
                    fullName: approvedReq.fullName,
                    role: approvedReq.role,
                    title: approvedReq.title,
                    studentCode: approvedReq.studentCode,
                    classRoom: approvedReq.classRoom,
                    schoolName: approvedReq.schoolName,
                  };
                  onLoginSuccess(userSession, approvedReq.id);
                  onClose?.();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>⚡ Kích Hoạt & Đăng Nhập Tài Khoản Này Ngay</span>
              </button>

              <button
                type="button"
                onClick={handleResetModal}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                Quay Lại Màn Hình Đăng Nhập
              </button>
              {!isForced && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-slate-500 hover:text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Auth Mode Tabs: Login vs Register */}
            <div className="flex items-center border-b border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg(null);
                }}
                className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  authMode === 'login'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg(null);
                }}
                className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  authMode === 'register'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Đăng Ký Tạo Tài Khoản</span>
              </button>
            </div>

            {/* Error Notice */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* FORM 1: LOGIN */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập của bạn..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-black bg-white placeholder:text-slate-400"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Mật khẩu xác thực
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full pl-3.5 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-black bg-white placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                      title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl font-bold text-white text-xs sm:text-sm transition cursor-pointer shadow-md bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
                  </button>
                </div>

                <div className="pt-1 text-center text-xs text-slate-500">
                  <span>Chưa có tài khoản? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg(null);
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Điền thông tin đăng ký để Admin duyệt →
                  </button>
                </div>
              </form>
            )}

            {/* FORM 2: REGISTER */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs sm:text-sm">
                {/* Creation Mode Switcher: Instant vs Approval */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="block font-bold text-slate-800 text-xs">
                    Hình thức tạo tài khoản *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegCreationMode('instant')}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        regCreationMode === 'instant'
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kích hoạt dùng ngay</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Tự động duyệt • Đăng nhập ngay lập tức
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegCreationMode('approval')}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        regCreationMode === 'approval'
                          ? 'bg-indigo-50/90 border-indigo-500 shadow-xs ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Gửi duyệt Admin</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        Chờ Admin xác nhận phê duyệt
                      </p>
                    </button>
                  </div>
                </div>

                {/* Role Switcher */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                    Bạn đăng ký tạo tài khoản với vai trò gì? *
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedRole === 'student'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>👨‍🎓 Học Sinh</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('teacher')}
                      className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedRole === 'teacher'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>👩‍🏫 Giáo Viên</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Họ và Tên đầy đủ *
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={selectedRole === 'teacher' ? 'Ví dụ: Thầy Trần Minh Tuấn' : 'Ví dụ: Nguyễn Văn An'}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-black bg-white placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs">
                      Tên đăng nhập mong muốn *
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="user123"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono font-medium text-black bg-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs">
                      Tên lớp *
                    </label>
                    <input
                      type="text"
                      value={regClassRoom}
                      onChange={(e) => setRegClassRoom(e.target.value)}
                      placeholder="Ví dụ: 10A1, 11A1, 12A3..."
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-black bg-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs">
                      Mật khẩu *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Tối thiểu 4 ký tự"
                        className="w-full pl-3.5 pr-9 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-black bg-white placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-0.5 cursor-pointer"
                        title={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs">
                      Nhập lại mật khẩu *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full pl-3.5 pr-9 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-black bg-white placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-0.5 cursor-pointer"
                        title={showRegConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    Tên trường học *
                  </label>
                  <input
                    type="text"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    placeholder="Ví dụ: THPT Chu Văn An, THPT Chuyên Lê Quý Đôn..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-black bg-white placeholder:text-slate-400"
                  />
                </div>

                {selectedRole === 'teacher' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs">
                      Chức danh / Bộ môn giảng dạy
                    </label>
                    <input
                      type="text"
                      value={regTitle}
                      onChange={(e) => setRegTitle(e.target.value)}
                      placeholder="Ví dụ: Giáo viên Chủ nhiệm & Tổ trưởng Môn Toán"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-black bg-white placeholder:text-slate-400"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs">
                      Mã học sinh vnEdu (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={regStudentCode}
                      onChange={(e) => setRegStudentCode(e.target.value)}
                      placeholder="Ví dụ: HS2026-8912 (để trống nếu chưa có)"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono font-medium text-black bg-white placeholder:text-slate-400"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2.5 rounded-xl font-bold text-white text-xs sm:text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                      regCreationMode === 'instant'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                        : selectedRole === 'teacher'
                        ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                    }`}
                  >
                    {regCreationMode === 'instant' ? (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span>{isLoading ? 'Đang tạo tài khoản...' : '⚡ Tạo & Đăng Nhập Tài Khoản Ngay'}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>{isLoading ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Phê Duyệt Đến Admin'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                  regCreationMode === 'instant'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {regCreationMode === 'instant' ? (
                    <>
                      ✨ <strong>Kích hoạt trực tiếp:</strong> Tài khoản của bạn sẽ được kích hoạt ngay lập tức. Sau khi bấm, bạn sẽ đăng nhập thẳng vào hệ thống mà không cần chờ Admin duyệt.
                    </>
                  ) : (
                    <>
                      ⚠️ <strong>Chờ Admin duyệt:</strong> Yêu cầu tạo tài khoản sẽ được chuyển đến <strong>Quản trị viên (adminedu)</strong> để kiểm tra và phê duyệt. Bạn có thể đăng nhập sau khi Admin xác nhận.
                    </>
                  )}
                </div>

                <div className="pt-1 text-center text-xs text-slate-500">
                  <span>Đã có tài khoản được duyệt? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg(null);
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Quay lại đăng nhập →
                  </button>
                </div>
              </form>
            )}
          </>
        )}
    </div>
  );

  if (isForced) {
    return (
      <div className="w-full flex justify-center">
        {modalCard}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {modalCard}
    </div>
  );
};
