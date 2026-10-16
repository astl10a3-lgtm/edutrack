import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  User, 
  School, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw,
  LogOut,
  Sparkles,
  Trash2,
  PlusCircle,
  UserPlus
} from 'lucide-react';
import { RegistrationRequest, UserSession } from '../types';

interface AdminApprovalTabProps {
  currentAdmin: UserSession;
  requests: RegistrationRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason?: string) => void;
  onRefreshRequests: () => void;
  onLogoutAdmin: () => void;
  onDeleteRequest?: (requestId: string) => void;
  onBatchApprovePending?: () => void;
  onDirectCreateUser?: (req: RegistrationRequest) => void;
}

export const AdminApprovalTab: React.FC<AdminApprovalTabProps> = ({
  currentAdmin,
  requests,
  onApproveRequest,
  onRejectRequest,
  onRefreshRequests,
  onLogoutAdmin,
  onDeleteRequest,
  onBatchApprovePending,
  onDirectCreateUser,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'teacher' | 'student'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Thông tin trường lớp chưa rõ ràng');
  const [deletingReqId, setDeletingReqId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Direct Account Creation Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRole, setCreateRole] = useState<'student' | 'teacher'>('student');
  const [createFullName, setCreateFullName] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('123456');
  const [createClassRoom, setCreateClassRoom] = useState('11A1');
  const [createSchool, setCreateSchool] = useState('THPT Chu Văn An');
  const [createTitle, setCreateTitle] = useState('');
  const [createStudentCode, setCreateStudentCode] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Statistics
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const filteredRequests = requests.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchRole = filterRole === 'all' || r.role === filterRole;
    const matchQuery = !searchQuery ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.classRoom.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchRole && matchQuery;
  });

  const handleApprove = (id: string, name: string) => {
    onApproveRequest(id);
    setSuccessToast(`Đã phê duyệt thành công yêu cầu tạo tài khoản của "${name}"!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleConfirmReject = () => {
    if (!rejectingReqId) return;
    onRejectRequest(rejectingReqId, rejectReason);
    setRejectingReqId(null);
    setSuccessToast(`Đã từ chối yêu cầu tạo tài khoản.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleRefreshWithToast = () => {
    onRefreshRequests();
    setSuccessToast('Đã làm mới và đồng bộ danh sách tài khoản thành công!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDirectCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const nameClean = createFullName.trim();
    const userClean = createUsername.trim();
    const passClean = createPassword.trim();
    const classClean = createClassRoom.trim();
    const schoolClean = createSchool.trim();

    if (!nameClean) {
      setCreateError('Vui lòng nhập họ và tên!');
      return;
    }
    if (!userClean || userClean.length < 3) {
      setCreateError('Tên đăng nhập phải có ít nhất 3 ký tự!');
      return;
    }
    if (requests.some(r => r.username.toLowerCase() === userClean.toLowerCase())) {
      setCreateError('Tên đăng nhập này đã tồn tại trong hệ thống!');
      return;
    }
    if (!passClean) {
      setCreateError('Vui lòng nhập mật khẩu!');
      return;
    }

    const newReq: RegistrationRequest = {
      id: `req-${Date.now()}`,
      role: createRole,
      fullName: nameClean,
      username: userClean,
      password: passClean,
      classRoom: classClean || '11A1',
      schoolName: schoolClean || 'THPT Chu Văn An',
      title: createRole === 'teacher' ? (createTitle.trim() || 'Giáo viên Bộ môn') : undefined,
      studentCode: createRole === 'student' ? (createStudentCode.trim() || `HS2026-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
      status: 'approved',
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      processedBy: 'adminedu',
    };

    if (onDirectCreateUser) {
      onDirectCreateUser(newReq);
    } else {
      onApproveRequest(newReq.id);
    }

    setShowCreateModal(false);
    setCreateFullName('');
    setCreateUsername('');
    setCreatePassword('123456');
    setCreateTitle('');
    setCreateStudentCode('');
    setSuccessToast(`Đã cấp và kích hoạt thành công tài khoản cho "${nameClean}"!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Bảng Điều Khiển Quản Trị Viên (Admin) • vnEdu Auth Core
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Phê Duyệt Yêu Cầu Tạo Tài Khoản Người Dùng
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Tài khoản Admin: <strong className="text-white font-mono">{currentAdmin.username}</strong> ({currentAdmin.fullName}). Giao diện quản trị này chuyên trách kiểm duyệt, xác nhận hoặc từ chối các yêu cầu đăng ký tài khoản từ Giáo viên và Học sinh.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => {
                setShowCreateModal(true);
                setCreateError(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/40"
              title="Cấp tài khoản mới cho giáo viên hoặc học sinh"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>➕ Cấp Tài Khoản Mới</span>
            </button>

            <button
              onClick={handleRefreshWithToast}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Làm mới và đồng bộ danh sách"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đồng bộ & Làm mới</span>
            </button>

            <button
              onClick={onLogoutAdmin}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-xs text-slate-400 font-semibold uppercase">Tổng yêu cầu</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{requests.length}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-xs text-amber-300 font-semibold uppercase flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Chờ phê duyệt
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{pendingCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-xs text-emerald-300 font-semibold uppercase flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã chấp nhận
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{approvedCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
            <div className="text-xs text-rose-300 font-semibold uppercase flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Đã từ chối
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* Alert Banner for Pending Requests */}
      {pendingCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Có {pendingCount} yêu cầu tạo tài khoản đang chờ phê duyệt!</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">MỚI</span>
              </h4>
              <p className="text-xs text-amber-300/90 mt-0.5">
                Nhấn "✅ Chấp nhận phê duyệt" trên từng tài khoản hoặc nhấn nút bên phải để kích hoạt toàn bộ.
              </p>
            </div>
          </div>

          {onBatchApprovePending && (
            <button
              onClick={() => {
                onBatchApprovePending();
                setSuccessToast(`Đã phê duyệt thành công toàn bộ ${pendingCount} yêu cầu!`);
                setTimeout(() => setSuccessToast(null), 3500);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0 self-stretch sm:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>Duyệt Tất Cả ({pendingCount} yêu cầu)</span>
            </button>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo họ tên, username, trường, lớp..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-black bg-white placeholder:text-slate-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: `Chờ duyệt (${pendingCount})` },
              { id: 'approved', label: 'Đã duyệt' },
              { id: 'rejected', label: 'Bị từ chối' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 text-slate-700"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="teacher">Chỉ Giáo viên</option>
              <option value="student">Chỉ Học sinh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Không có yêu cầu đăng ký nào phù hợp</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các yêu cầu tạo tài khoản mới từ người dùng sẽ hiển thị tại đây để bạn phê duyệt.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-xs ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-400/20'
                    : isApproved
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                {/* Left: User Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                      req.role === 'teacher'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {req.role === 'teacher' ? <UserCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {req.role === 'teacher' ? 'Yêu cầu: Giáo Viên' : 'Yêu cầu: Học Sinh'}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      isPending
                        ? 'bg-amber-100 text-amber-800'
                        : isApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isPending && <Clock className="w-3 h-3" />}
                      {isApproved && <Check className="w-3 h-3" />}
                      {isRejected && <X className="w-3 h-3" />}
                      {isPending ? 'Đang chờ Admin duyệt' : isApproved ? 'Đã kích hoạt tài khoản' : 'Đã từ chối'}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      Thời gian gửi: {new Date(req.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>{req.fullName}</span>
                      <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        username: {req.username}
                      </span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                      <span>Trường: <strong>{req.schoolName}</strong></span>
                      <span>Lớp: <strong className="text-indigo-700">{req.classRoom}</strong></span>
                      {req.title && <span>Chức danh: <em>{req.title}</em></span>}
                      {req.studentCode && <span>Mã HS: <span className="font-mono font-semibold">{req.studentCode}</span></span>}
                    </div>

                    {req.rejectionReason && (
                      <div className="mt-2 text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        Lý do từ chối: <strong>{req.rejectionReason}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  {onDeleteRequest && (
                    <button
                      onClick={() => setDeletingReqId(req.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Xóa yêu cầu này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {isPending ? (
                    <>
                      <button
                        onClick={() => {
                          setRejectingReqId(req.id);
                          setRejectReason('Thông tin trường lớp chưa rõ ràng');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>

                      <button
                        onClick={() => handleApprove(req.id, req.fullName)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>✅ Chấp nhận phê duyệt</span>
                      </button>
                    </>
                  ) : isApproved ? (
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Tài khoản đã hoạt động
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApprove(req.id, req.fullName)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
                    >
                      Duyệt lại
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectingReqId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              Lý Do Từ Chối Yêu Cầu Tạo Tài Khoản
            </h3>

            <div className="py-4 space-y-3 text-xs sm:text-sm">
              <label className="block font-bold text-slate-700">
                Nhập lý do gửi đến người dùng:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Thông tin trường lớp chưa khớp với hồ sơ vnEdu, trùng username..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-xs font-medium text-black bg-white placeholder:text-slate-400"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Thông tin trường lớp chưa rõ ràng',
                  'Tên đăng nhập không phù hợp',
                  'Chưa được phân công phụ trách lớp này',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-rose-50 text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setRejectingReqId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReqId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Xóa Yêu Cầu Này?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              Hành động này sẽ xóa vĩnh viễn yêu cầu này khỏi hệ thống.
            </p>

            <div className="flex items-center gap-2 pt-5">
              <button
                onClick={() => setDeletingReqId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  if (onDeleteRequest && deletingReqId) {
                    onDeleteRequest(deletingReqId);
                    setSuccessToast('Đã xóa yêu cầu thành công!');
                    setTimeout(() => setSuccessToast(null), 3000);
                  }
                  setDeletingReqId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-rose-900/20"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Direct Create & Activate User by Admin */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Cấp / Tạo Tài Khoản Mới
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kích hoạt ngay không cần chờ duyệt
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleDirectCreateSubmit} className="space-y-3.5 mt-4 text-xs">
              {/* Role Switcher */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vai trò người dùng *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCreateRole('student')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      createRole === 'student'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>👨‍🎓 Học Sinh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateRole('teacher')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      createRole === 'teacher'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>👩‍🏫 Giáo Viên</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={createFullName}
                  onChange={(e) => setCreateFullName(e.target.value)}
                  placeholder={createRole === 'teacher' ? 'Thầy Nguyễn Văn C' : 'Trần Minh Anh'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-black bg-white focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    placeholder="user2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-medium text-black bg-white focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mật khẩu khởi tạo *
                  </label>
                  <input
                    type="text"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-black bg-white focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lớp *
                  </label>
                  <input
                    type="text"
                    value={createClassRoom}
                    onChange={(e) => setCreateClassRoom(e.target.value)}
                    placeholder="11A1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-black bg-white focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Trường học *
                  </label>
                  <input
                    type="text"
                    value={createSchool}
                    onChange={(e) => setCreateSchool(e.target.value)}
                    placeholder="THPT Chu Văn An"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-black bg-white focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {createRole === 'teacher' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chức danh / Bộ môn giảng dạy
                  </label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="Giáo viên Bộ môn Hóa học"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-black bg-white focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã học sinh vnEdu (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={createStudentCode}
                    onChange={(e) => setCreateStudentCode(e.target.value)}
                    placeholder="HS2026-9900"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-medium text-black bg-white focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Tạo & Kích Hoạt Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
