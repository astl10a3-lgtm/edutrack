import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory community database for user-submitted goals & competitions
interface SharedGoal {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  requiredScore: number;
  benchmarkWeights: {
    academicGpa: number;
    coreSubjects: number;
    languageCert: number;
    activities: number;
  };
  criteria: Array<{
    name: string;
    requirement: string;
    importance: 'mandatory' | 'bonus' | 'recommended';
  }>;
  recommendedRoadmaps: any[];
  createdBy: string;
  createdAt: string;
  isCommunity: boolean;
}

let communityGoals: SharedGoal[] = [
  {
    id: 'comm-1',
    title: 'Kỳ thi Đánh Giá Năng Lực ĐHQG TP.HCM 2026',
    category: 'exam',
    description: 'Kỳ thi ĐGNL quy mô lớn nhất miền Nam với 120 câu trắc nghiệm bao quát Sử dụng ngôn ngữ, Toán học & Tư duy logic, Giải quyết vấn đề.',
    tags: ['#ĐGNL_ĐHQGHCM', '#1200_Điểm', '#Toán_Logic', '#TiếngViệt_TiếngAnh', '#ĐạiHọcTopĐầu'],
    requiredScore: 850,
    benchmarkWeights: {
      academicGpa: 300,
      coreSubjects: 400,
      languageCert: 200,
      activities: 100,
    },
    criteria: [
      { name: 'Nền tảng Toán & Logic', requirement: 'Điểm Toán THPT >= 8.0, hoàn thành các chuyên đề xác suất, số học', importance: 'mandatory' },
      { name: 'Năng lực Ngôn ngữ', requirement: 'Tiếng Việt ngữ pháp & Tiếng Anh đọc hiểu vững (GPA >= 8.0 hoặc IELTS >= 6.0)', importance: 'mandatory' },
      { name: 'Khoa học Tự nhiên & Xã hội', requirement: 'Nắm chắc kiến thức Lý, Hóa, Sinh, Sử, Địa cơ bản', importance: 'recommended' },
    ],
    recommendedRoadmaps: [
      {
        id: 'rd-dgnl-1',
        title: 'Lộ trình Bứt phá 60 ngày chinh phục 850+ ĐGNL',
        type: 'balanced',
        durationWeeks: 8,
        hoursPerDay: 2.5,
        targetIncrease: 120,
        overview: 'Ôn luyện theo 3 khối kiến thức: Ngôn ngữ (20%), Logic & Toán học (40%), Giải quyết vấn đề (40%).',
        weeklyTasks: [
          { week: 1, focus: 'Hệ thống hóa Tư duy Toán học & Phân tích số liệu', exercises: 'Giải 50 câu xử lý biểu đồ và số liệu mẫu 2024-2025' },
          { week: 2, focus: 'Tiếng Việt & Ngữ nghĩa học thuật', exercises: 'Luyện 40 câu tìm lỗi sai diễn đạt, biện pháp tu từ' },
          { week: 3, focus: 'Tiếng Anh Đọc hiểu & Điền từ', exercises: 'Luyện 5 bài đọc chuyên ngành khoa học, 100 từ vựng' },
          { week: 4, focus: 'Logic mệnh đề & Suy luận quy nạp', exercises: 'Luyện 60 bài toán logic xếp chỗ, suy đoán điều kiện' },
          { week: 5, focus: 'Chuyên đề KHTN: Vật lý & Hóa học ứng dụng', exercises: 'Ôn 30 câu thực tiễn thí nghiệm' },
          { week: 6, focus: 'Chuyên đề KHXH: Lịch sử & Địa lý Việt Nam', exercises: 'Ôn 30 câu Atlat và dữ liệu lịch sử hiện đại' },
          { week: 7, focus: 'Luyện giải đề thi thử bấm giờ 150 phút (Đề 1-3)', exercises: 'Làm 3 đề trọn vẹn, rút kinh nghiệm thời gian làm bài' },
          { week: 8, focus: 'Tổng ôn trọng tâm & Rà soát bẫy đề thi', exercises: 'Rà soát danh sách câu hỏi hay sai, tối ưu chiến thuật khoanh câu khó' },
        ],
      },
    ],
    createdBy: 'Thầy Hoàng - Chuyên gia ĐGNL',
    createdAt: new Date().toISOString(),
    isCommunity: true,
  },
  {
    id: 'comm-2',
    title: 'Học bổng Tài năng Tân Sinh Viên 70% - 100% (VinUni / RMIT / Fulbright)',
    category: 'scholarship',
    description: 'Chương trình xét duyệt học bổng toàn phần dựa trên thành tích học thuật xuất sắc, bài luận cá nhân, chứng chỉ quốc tế và hoạt động vì cộng đồng.',
    tags: ['#HọcBổngĐạiHọc', '#VinUni', '#RMIT', '#IELTS_7.5+', '#GPA_Tren_9.0', '#BàiLuậnCáNhân', '#LãnhĐạo'],
    requiredScore: 920,
    benchmarkWeights: {
      academicGpa: 350,
      coreSubjects: 250,
      languageCert: 250,
      activities: 150,
    },
    criteria: [
      { name: 'GPA 3 năm THPT', requirement: 'GPA >= 8.8 (Ưu tiên >= 9.0)', importance: 'mandatory' },
      { name: 'Chứng chỉ Tiếng Anh', requirement: 'IELTS >= 7.0 hoặc TOEFL iBT >= 95 hoặc Duolingo >= 125', importance: 'mandatory' },
      { name: 'Dự án / Ngoại khóa', requirement: 'Có ít nhất 1-2 dự án xã hội hoặc giữ vai trò lãnh đạo CLB', importance: 'mandatory' },
      { name: 'Thành tích học thuật', requirement: 'Giải HSG, Olympic hoặc nghiên cứu khoa học là lợi thế lớn', importance: 'bonus' },
    ],
    recommendedRoadmaps: [
      {
        id: 'rd-sch-1',
        title: 'Chiến dịch Xây dựng Hồ sơ Săn Học bổng 90 ngày',
        type: 'mastery',
        durationWeeks: 12,
        hoursPerDay: 2,
        targetIncrease: 150,
        overview: 'Tối ưu hóa điểm số học kỳ hiện tại, nâng band IELTS, chốt dàn ý bài luận truyền cảm hứng.',
        weeklyTasks: [
          { week: 1, focus: 'Định vị hồ sơ & Câu chuyện thương hiệu bản thân', exercises: 'Viết mindmap 10 trải nghiệm biến đổi bản thân' },
          { week: 2, focus: 'Khắc phục môn GPA dưới 8.5 trong sổ điểm', exercises: 'Lập danh sách bài tập gỡ điểm giữa kỳ môn chưa đạt' },
          { week: 4, focus: 'Thi thử IELTS Speaking & Writing', exercises: 'Luyện 4 bài Task 2 và 3 buổi Mock interview' },
          { week: 8, focus: 'Bản thảo 1 Bài luận cá nhân (Personal Statement)', exercises: 'Hoàn thiện 650 từ bài luận chính' },
          { week: 12, focus: 'Chốt hồ sơ, thư giới thiệu & Luyện phỏng vấn', exercises: 'Phỏng vấn thử với cố vấn, kiểm tra hồ sơ' },
        ],
      },
    ],
    createdBy: 'Ban Tuyển Sinh Học Bổng 2026',
    createdAt: new Date().toISOString(),
    isCommunity: true,
  },
  {
    id: 'comm-3',
    title: 'Gỡ Điểm & Bứt Phá Môn Toán Lên 8.5+ Học Kỳ 2 (Chuẩn GDPT Mới)',
    category: 'academic_boost',
    description: 'Chương trình mục tiêu nội bộ giúp học sinh khắc phục điểm kiểm tra thường xuyên và giữa kỳ thấp môn Toán, kéo ĐTBm lên mức Giỏi.',
    tags: ['#CảiThiệnĐiểmSố', '#MônToán', '#GPA_HọcKỳ2', '#KhắcPhụcĐiểmKém', '#Toán11_12', '#HọcLựcGiỏi'],
    requiredScore: 780,
    benchmarkWeights: {
      academicGpa: 500,
      coreSubjects: 500,
      languageCert: 0,
      activities: 0,
    },
    criteria: [
      { name: 'Điểm kiểm tra thường xuyên (ĐGTX)', requirement: 'Đạt từ 8.0 trở lên ở 2 bài kiểm tra 15p tới', importance: 'mandatory' },
      { name: 'Điểm kiểm tra định kỳ (ĐGGK)', requirement: 'Bứt phá lên >= 8.5 (Hệ số 2)', importance: 'mandatory' },
      { name: 'Điểm thi học kỳ (ĐGCK)', requirement: 'Đạt >= 8.5 (Hệ số 3)', importance: 'mandatory' },
    ],
    recommendedRoadmaps: [
      {
        id: 'rd-math-1',
        title: 'Kế hoạch 30 ngày "Cứu" Điểm Toán Cấp Tốc',
        type: 'sprinter',
        durationWeeks: 4,
        hoursPerDay: 1.5,
        targetIncrease: 95,
        overview: 'Tập trung rà soát các lỗ hổng kiến thức căn bản, giải 20 câu hỏi trọng tâm thường xuất hiện trong đề kiểm tra vnEdu.',
        weeklyTasks: [
          { week: 1, focus: 'Ôn tập Hàm số & Đạo hàm / Hình học không gian', exercises: 'Giải 30 bài tập trắc nghiệm đúng-sai và trả lời ngắn' },
          { week: 2, focus: 'Kỹ thuật bấm máy tính Casio & Tránh bẫy đề bài', exercises: 'Thực hành 4 dạng bài bấm máy giải nhanh cực trị, tích phân' },
          { week: 3, focus: 'Luyện đề kiểm tra 1 tiết chuẩn cấu trúc 2025-2026', exercises: 'Giải 3 đề thi giữa kỳ của các trường chuyên' },
          { week: 4, focus: 'Tổng ôn dạng bài vận dụng cao lấy điểm 9-10', exercises: 'Rèn 15 bài toán thực tế mô hình hóa liên môn' },
        ],
      },
    ],
    createdBy: 'Hội Đồng Bộ Môn Toán',
    createdAt: new Date().toISOString(),
    isCommunity: true,
  },
];

// API: Get Community Goals
app.get('/api/community-goals', (req, res) => {
  res.json({ success: true, goals: communityGoals });
});

// In-memory registration requests database
interface RegistrationRequestServer {
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

const DATA_DIR = path.join(__dirname, 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'registration_requests.json');

const initialRegistrationRequests: RegistrationRequestServer[] = [
  {
    id: 'student-nguyenvanA',
    role: 'student',
    fullName: 'Nguyễn Văn A',
    username: 'nguyenvanA',
    password: 'nguyenvanA123',
    classRoom: '11A1',
    schoolName: 'THPT Chu Văn An',
    studentCode: 'HS2026-001A',
    status: 'approved',
    createdAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
    processedBy: 'adminedu',
  },
  {
    id: 'teacher-nguyenvanB',
    role: 'teacher',
    fullName: 'Thầy Nguyễn Văn B',
    username: 'nguyenvanB',
    password: 'nguyenvanB123',
    classRoom: '11A1',
    schoolName: 'THPT Chu Văn An',
    title: 'Giáo Viên Chủ Nhiệm 11A1',
    status: 'approved',
    createdAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
    processedBy: 'adminedu',
  },
  {
    id: 'req-01',
    role: 'teacher',
    fullName: 'Thầy Lê Hoàng Long',
    username: 'thaylong',
    password: 'password123',
    classRoom: '11A2',
    schoolName: 'THPT Chu Văn An',
    title: 'Giáo viên Vật lí / Chủ nhiệm 11A2',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'req-02',
    role: 'student',
    fullName: 'Vũ Minh Khang',
    username: 'khang_vu',
    password: 'password123',
    classRoom: '11A1',
    schoolName: 'THPT Chu Văn An',
    studentCode: 'HS2026-8912',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'req-03',
    role: 'student',
    fullName: 'Đặng Ngọc Ánh',
    username: 'ngocanh_dang',
    password: 'password123',
    classRoom: '11A1',
    schoolName: 'THPT Chu Văn An',
    studentCode: 'HS2026-4421',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    processedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    processedBy: 'adminedu',
  },
];

function loadRegistrationRequests(): RegistrationRequestServer[] {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      const data = fs.readFileSync(REQUESTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading registration_requests.json:', err);
  }
  return [...initialRegistrationRequests];
}

function saveRegistrationRequests(requests: RegistrationRequestServer[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving registration_requests.json:', err);
  }
}

let registrationRequests: RegistrationRequestServer[] = loadRegistrationRequests();

// API: Auth Login Endpoint (Admin & Registered Users)
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu!' });
    }

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // 1. Admin login check
    if (cleanUser.toLowerCase() === 'adminedu' && cleanPass === 'admindanang') {
      return res.json({
        success: true,
        user: {
          id: 'admin-01',
          username: 'adminedu',
          fullName: 'Quản Trị Viên Hệ Thống',
          role: 'admin',
          title: 'Quản Trị Viên vnEdu',
          schoolName: 'Hệ Thống vnEdu',
          classRoom: 'Toàn Hệ Thống',
        },
      });
    }

    // 2. Search in registration requests
    const matched = registrationRequests.find(
      r => r.username.toLowerCase() === cleanUser.toLowerCase()
    );

    if (!matched) {
      return res.status(404).json({
        success: false,
        error: 'Tài khoản chưa tồn tại. Vui lòng bấm sang tab "Tạo Tài Khoản Mới" để điền thông tin và gửi yêu cầu phê duyệt tới Admin!',
      });
    }

    if (matched.status === 'pending') {
      return res.status(403).json({
        success: false,
        error: 'Tài khoản của bạn đang ở trạng thái CHỜ PHÊ DUYỆT từ Quản trị viên (Admin). Vui lòng đợi Admin duyệt trước khi đăng nhập!',
        status: 'pending',
      });
    }

    if (matched.status === 'rejected') {
      return res.status(403).json({
        success: false,
        error: `Yêu cầu tạo tài khoản của bạn đã bị Admin từ chối. Lý do: "${matched.rejectionReason || 'Thông tin chưa hợp lệ'}"`,
        status: 'rejected',
      });
    }

    // Approved: verify password
    if (matched.password && matched.password !== cleanPass) {
      return res.status(401).json({
        success: false,
        error: 'Mật khẩu xác thực không chính xác!',
      });
    }

    return res.json({
      success: true,
      user: {
        id: matched.id,
        username: matched.username,
        fullName: matched.fullName,
        role: matched.role,
        title: matched.title,
        studentCode: matched.studentCode,
        classRoom: matched.classRoom,
        schoolName: matched.schoolName,
      },
      request: matched,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Get Registration Requests
app.get('/api/registration-requests', (req, res) => {
  res.json({ success: true, requests: registrationRequests });
});

// API: Create Registration Request (Supports direct approval or pending approval)
app.post('/api/registration-requests', (req, res) => {
  try {
    const { role, fullName, username, password, classRoom, schoolName, title, studentCode, status, processedBy } = req.body;
    if (!fullName || !username) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin đăng ký bắt buộc!' });
    }

    const cleanUser = username.trim();
    // Check if user already exists
    const existingIndex = registrationRequests.findIndex(
      r => r.username.toLowerCase() === cleanUser.toLowerCase()
    );

    const isDirectApproved = status === 'approved';

    const newReq: RegistrationRequestServer = {
      id: req.body.id || `req-${Date.now()}`,
      role: role || 'student',
      fullName: fullName.trim(),
      username: cleanUser,
      password: password || '123456',
      classRoom: classRoom || '11A1',
      schoolName: schoolName || 'THPT Chu Văn An',
      title: title || (role === 'teacher' ? 'Giáo viên Bộ môn' : undefined),
      studentCode: studentCode || (role === 'student' ? `HS2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
      status: isDirectApproved ? 'approved' : 'pending',
      createdAt: req.body.createdAt || new Date().toISOString(),
      processedAt: isDirectApproved ? new Date().toISOString() : undefined,
      processedBy: isDirectApproved ? (processedBy || 'adminedu') : undefined,
    };

    if (existingIndex >= 0) {
      registrationRequests[existingIndex] = {
        ...registrationRequests[existingIndex],
        ...newReq,
      };
    } else {
      registrationRequests.unshift(newReq);
    }

    saveRegistrationRequests(registrationRequests);
    res.json({ success: true, request: newReq });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Batch Sync Registration Requests (Frontend sync)
app.post('/api/registration-requests/sync', (req, res) => {
  try {
    const incoming: RegistrationRequestServer[] = req.body.requests;
    if (Array.isArray(incoming)) {
      const map = new Map<string, RegistrationRequestServer>();
      // First put existing server items
      registrationRequests.forEach(r => map.set(r.username.toLowerCase(), r));
      // Merge incoming client items
      incoming.forEach(inc => {
        if (!inc || !inc.username) return;
        const key = inc.username.toLowerCase();
        if (!map.has(key)) {
          map.set(key, inc);
        } else {
          // If incoming is more updated (e.g. approved or has id)
          const existing = map.get(key)!;
          map.set(key, { ...existing, ...inc });
        }
      });
      registrationRequests = Array.from(map.values());
      saveRegistrationRequests(registrationRequests);
    }
    res.json({ success: true, requests: registrationRequests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Approve Registration Request (Admin)
app.put('/api/registration-requests/:id/approve', (req, res) => {
  const reqId = req.params.id;
  const found = registrationRequests.find(r => r.id === reqId || (r.username && r.username.toLowerCase() === reqId.toLowerCase()));
  if (!found) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy yêu cầu' });
  }

  found.status = 'approved';
  found.processedAt = new Date().toISOString();
  found.processedBy = 'adminedu';

  saveRegistrationRequests(registrationRequests);
  res.json({ success: true, request: found });
});

// API: Reject Registration Request (Admin)
app.put('/api/registration-requests/:id/reject', (req, res) => {
  const reqId = req.params.id;
  const { reason } = req.body;
  const found = registrationRequests.find(r => r.id === reqId || (r.username && r.username.toLowerCase() === reqId.toLowerCase()));
  if (!found) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy yêu cầu' });
  }

  found.status = 'rejected';
  found.processedAt = new Date().toISOString();
  found.processedBy = 'adminedu';
  found.rejectionReason = reason || 'Thông tin chưa hợp lệ';

  saveRegistrationRequests(registrationRequests);
  res.json({ success: true, request: found });
});

// API: Delete Registration Request (Admin)
app.delete('/api/registration-requests/:id', (req, res) => {
  const reqId = req.params.id;
  const initialLen = registrationRequests.length;
  registrationRequests = registrationRequests.filter(r => r.id !== reqId);
  if (registrationRequests.length === initialLen) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy yêu cầu để xóa' });
  }
  saveRegistrationRequests(registrationRequests);
  res.json({ success: true, message: 'Đã xóa yêu cầu thành công' });
});

// API: Share / Add New Goal to Community
app.post('/api/community-goals', (req, res) => {
  try {
    const newGoal: SharedGoal = {
      id: `comm-${Date.now()}`,
      title: req.body.title || 'Mục tiêu học tập mới',
      category: req.body.category || 'exam',
      description: req.body.description || '',
      tags: req.body.tags || ['#MụcTiêuMới', '#CáNhânHóa'],
      requiredScore: req.body.requiredScore || 750,
      benchmarkWeights: req.body.benchmarkWeights || {
        academicGpa: 350,
        coreSubjects: 350,
        languageCert: 150,
        activities: 150,
      },
      criteria: req.body.criteria || [],
      recommendedRoadmaps: req.body.recommendedRoadmaps || [],
      createdBy: req.body.createdBy || 'Học sinh ẩn danh',
      createdAt: new Date().toISOString(),
      isCommunity: true,
    };

    communityGoals.unshift(newGoal);
    res.json({ success: true, goal: newGoal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: AI Analyze Any Goal / Competition (Extract tags, rubric, gap, and multi-roadmaps)
app.post('/api/ai/analyze-goal', async (req, res) => {
  try {
    const { goalInput, userProfile, userGrades } = req.body;

    if (!goalInput || !goalInput.title) {
      return res.status(400).json({ error: 'Vui lòng cung cấp thông tin mục tiêu hoặc kỳ thi!' });
    }

    const prompt = `
Bạn là Trợ lý Cố Vấn Giáo Dục & Đánh Giá Năng Lực Học Sinh Chuyên Sâu theo chuẩn Bộ Giáo Dục & Đào Tạo Việt Nam (vnEdu & GDPT mới).
Hãy phân tích kỳ thi/mục tiêu sau đây do học sinh nhập vào:

THÔNG TIN MỤC TIÊU/KỲ THI HỌC SINH NHẬP:
- Tên mục tiêu/Kỳ thi: "${goalInput.title}"
- Phân loại dự kiến: "${goalInput.category || 'exam'}" (có thể là exam: Kỳ thi, academic_boost: Cải thiện điểm số, long_term: Mục tiêu dài hạn, scholarship: Săn học bổng, certificate: Chứng chỉ)
- Mô tả / Yêu cầu chi tiết: "${goalInput.description || 'Không có mô tả chi tiết'}"
- Ghi chú thêm: "${goalInput.notes || ''}"

THÔNG TIN HỒ SƠ HỌC SINH HIỆN TẠI:
- Lớp: ${userProfile?.className || '11A1'}, Điểm TB Học kỳ (GPA): ${userProfile?.gpa || '7.8'}
- Xếp loại học lực hiện tại: ${userProfile?.academicRank || 'Khá'}
- Chứng chỉ ngoại ngữ: ${JSON.stringify(userProfile?.certificates || [])}
- Danh sách điểm các môn hiện tại: ${JSON.stringify(userGrades || [])}

NHIỆM VỤ CỦA BẠN:
1. Phân loại tags chính xác cho kỳ thi/mục tiêu này (ví dụ: các tag bắt đầu bằng dấu # như: #KỳThiChuyểnCấp, #GPA_Tren_8.0, #MônToán_VậnDụngCao, #Khối_A00, #IELTS_6.5+, v.v.). Tối thiểu 4-6 tag hữu ích.
2. Thiết lập HỆ QUY CHIẾU NĂNG LỰC CHUẨN (Thang điểm chuẩn 1000 điểm):
   - requiredScore: Điểm hệ quy chiếu chuẩn cần đạt (từ 500 đến 1000).
   - benchmarkWeights: Trọng số của 4 thành phần (tổng bằng 1000):
     + academicGpa: Trọng số học bạ phổ thông (ví dụ 300)
     + coreSubjects: Trọng số các môn nòng cốt của kỳ thi này (ví dụ 400)
     + languageCert: Trọng số chứng chỉ ngoại ngữ (ví dụ 200)
     + activities: Trọng số thành tích/ngoại khóa (ví dụ 100)
3. Bóc tách TIÊU CHÍ & ĐIỀU KIỆN (criteria): Danh sách 3-5 điều kiện cụ thể (name, requirement, importance: 'mandatory' | 'bonus' | 'recommended').
4. ĐÁNH GIÁ TIẾN TRÌNH & NĂNG LỰC HIỆN TẠI (currentEvaluation):
   - estimatedCurrentScore: Điểm số hiện tại của học sinh trên thang 1000 (dựa vào bảng điểm và chứng chỉ đã cung cấp).
   - gapScore: Số điểm còn thiếu (requiredScore - estimatedCurrentScore, tối thiểu 0).
   - status: 'qualified' (Đủ điều kiện), 'close' (Cận chuẩn), hoặc 'needs_boost' (Cần bứt phá).
   - gapAnalysis: Nhận xét rõ ràng chỉ ra học sinh đang mạnh ở đâu, môn nào hoặc tiêu chí nào đang kéo tụt điểm (ví dụ: môn Tiếng Anh còn thấp, chưa có chứng chỉ, điểm thi giữa kỳ môn Toán cần kéo lên...).
5. TỰ ĐỘNG TẠO 3 LỊCH TRÌNH / LỘ TRÌNH LUYỆN TẬP PHONG PHÚ ĐỂ HỌC SINH CHỌN (roadmaps):
   Mỗi lộ trình phải có phong cách khác nhau:
   - Lộ trình 1: "Tốc hành (Sprinter)" - Cường độ cao, tập trung giải quyết lỗ hổng nhanh nhất (2-4 tuần).
   - Lộ trình 2: "Cân bằng (Balanced)" - Cân đối lịch học trên lớp và luyện mục tiêu, tiến độ ổn định (6-8 tuần).
   - Lộ trình 3: "Chuyên sâu (Mastery / Bền bỉ)" - Ôn luyện chuyên sâu từ gốc tới vận dụng cao, đảm bảo điểm tối đa (10-12 tuần).
   Mỗi lộ trình bao gồm:
   - title, type ('sprinter' | 'balanced' | 'mastery'), durationWeeks, hoursPerDay, targetIncrease (điểm năng lực tăng dự kiến).
   - overview: Tóm tắt chiến lược.
   - weeklyTasks: Danh sách 4-8 tuần, mỗi tuần có focus (trọng tâm) và exercises (bài tập thực hành cụ thể, bài kiểm tra giả định).

HÃY TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON THEO SCHEMA ĐÃ ĐỊNH. KHÔNG THÊM MARKDOWN NGOÀI JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            requiredScore: { type: Type.NUMBER },
            benchmarkWeights: {
              type: Type.OBJECT,
              properties: {
                academicGpa: { type: Type.NUMBER },
                coreSubjects: { type: Type.NUMBER },
                languageCert: { type: Type.NUMBER },
                activities: { type: Type.NUMBER },
              },
              required: ['academicGpa', 'coreSubjects', 'languageCert', 'activities'],
            },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  requirement: { type: Type.STRING },
                  importance: { type: Type.STRING },
                },
                required: ['name', 'requirement', 'importance'],
              },
            },
            currentEvaluation: {
              type: Type.OBJECT,
              properties: {
                estimatedCurrentScore: { type: Type.NUMBER },
                gapScore: { type: Type.NUMBER },
                status: { type: Type.STRING },
                gapAnalysis: { type: Type.STRING },
                prioritySubjects: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['estimatedCurrentScore', 'gapScore', 'status', 'gapAnalysis'],
            },
            roadmaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING },
                  durationWeeks: { type: Type.NUMBER },
                  hoursPerDay: { type: Type.NUMBER },
                  targetIncrease: { type: Type.NUMBER },
                  overview: { type: Type.STRING },
                  weeklyTasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        week: { type: Type.NUMBER },
                        focus: { type: Type.STRING },
                        exercises: { type: Type.STRING },
                      },
                      required: ['week', 'focus', 'exercises'],
                    },
                  },
                },
                required: ['id', 'title', 'type', 'durationWeeks', 'hoursPerDay', 'targetIncrease', 'overview', 'weeklyTasks'],
              },
            },
          },
          required: ['title', 'category', 'description', 'tags', 'requiredScore', 'benchmarkWeights', 'criteria', 'currentEvaluation', 'roadmaps'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing goal:', error);
    res.status(500).json({ success: false, error: error.message || 'Lỗi khi phân tích mục tiêu với AI' });
  }
});

// API: AI Generate Extra Roadmaps
app.post('/api/ai/generate-roadmaps', async (req, res) => {
  try {
    const { goalTitle, currentScore, targetScore, gapAnalysis, preferences } = req.body;

    const prompt = `
Bạn là Chuyên gia Lập kế hoạch học tập cá nhân hóa cho học sinh.
Mục tiêu học tập: "${goalTitle}"
Điểm hiện tại: ${currentScore}/1000
Điểm mục tiêu cần đạt: ${targetScore}/1000
Lỗ hổng cần khắc phục: ${gapAnalysis || 'Cần nâng cao điểm các môn nòng cốt'}
Yêu cầu học sinh: Thời gian rảnh ${preferences?.hoursPerDay || 2} giờ/ngày, hình thức mong muốn: ${preferences?.focusStyle || 'Cân bằng, nhiều bài tập mẫu'}.

Hãy tạo ra 2 lịch trình luyện tập học tập chi tiết, có phân chia theo tuần, chỉ rõ các dạng bài tập, phương pháp rèn luyện, checklist nhiệm vụ và mẹo làm bài điểm cao.
Trả về định dạng JSON hợp lệ.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              durationWeeks: { type: Type.NUMBER },
              hoursPerDay: { type: Type.NUMBER },
              targetIncrease: { type: Type.NUMBER },
              overview: { type: Type.STRING },
              weeklyTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    week: { type: Type.NUMBER },
                    focus: { type: Type.STRING },
                    exercises: { type: Type.STRING },
                  },
                  required: ['week', 'focus', 'exercises'],
                },
              },
            },
            required: ['id', 'title', 'type', 'durationWeeks', 'hoursPerDay', 'targetIncrease', 'overview', 'weeklyTasks'],
          },
        },
      },
    });

    const roadmaps = JSON.parse(response.text || '[]');
    res.json({ success: true, roadmaps });
  } catch (error: any) {
    console.error('Error generating roadmaps:', error);
    res.status(500).json({ success: false, error: error.message || 'Lỗi tạo lịch trình' });
  }
});

// API: AI School Psychologist Chat Companion (An Nhiên AI)
app.post('/api/psychologist/chat', async (req, res) => {
  const { messages = [], studentInfo = {}, activeMood = '' } = req.body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, error: 'Thiếu lịch sử tin nhắn trò chuyện' });
  }

  try {

    const systemInstruction = `
Bạn là "Chuyên Gia Tâm Lý Học Đường An Nhiên" (gọi thân mật là An Nhiên) - một người lắng nghe chân thành, ấm áp, thấu cảm, giàu lòng trắc ẩn và tuyệt đối KHÔNG PHÁN XÉT dành riêng cho các bạn học sinh.

THÔNG TIN HỌC SINH:
- Tên học sinh: ${studentInfo?.fullName || 'bạn'}
- Lớp: ${studentInfo?.classRoom || 'THPT'}
- Trường: ${studentInfo?.schoolName || 'trường học'}
${activeMood ? `- Cảm xúc hiện tại của học sinh: ${activeMood}` : ''}

NGUYÊN TẮC TRÒ CHUYỆN & TƯ VẤN (CỰC KỲ QUAN TRỌNG):
1. PHONG THÁI TỰ NHIÊN, GẦN GŨI NHƯ NGƯỜI CHỊ / CÔ GIÁO TÂM LÝ TRI KỶ:
   - Nói chuyện tự nhiên, nhẹ nhàng, chân thành. Dùng đại từ xưng hô "An Nhiên" / "mình" và gọi tên học sinh (ví dụ "${studentInfo?.fullName || 'bạn'}").
   - TUYỆT ĐỐI KHÔNG dùng văn phong máy móc, hành chính hay sách giáo khoa.
   - TUYỆT ĐỐI KHÔNG tự động chèn các tiêu đề cồng kềnh như "**1. Phân tích...**", "**2. Tự kết nối...**", "**3. Kịch bản...**" trừ khi học sinh chủ động xin một kịch bản giao tiếp hay các bước hành động cụ thể.
   - Trình bày thành các đoạn văn ngắn, thoáng, dễ đọc trên điện thoại.
   - Thỉnh thoảng có thể thêm cử chỉ ấm áp tinh tế (ví dụ: *nhẹ nhàng lắng nghe bạn*, *gật đầu thấu cảm*, 🌿, 🤍, ✨) một cách vừa phải, tự nhiên, không lạm dụng.

2. BÁM SÁT ĐÚNG VẤN ĐỀ HỌC SINH ĐANG NÓI:
   - Nếu học sinh nói về ÁP LỰC ĐIỂM SỐ, THI CỬ, HỌC KÉM: Hãy công nhận sự mệt mỏi và nỗi sợ của bạn ấy. Nhắc bạn ấy rằng một bài kiểm tra hay vài điểm số không thể định nghĩa toàn bộ giá trị của một con người. Giúp bạn ấy bóc tách nguyên nhân và gợi ý cách tháo gỡ áp lực từng chút một.
   - Nếu học sinh nói về KIỆT SỨC, QUÁ TẢI, MẤT NGỦ, BUỒN CHÁN: Đừng vội khuyên bạn ấy phải cố gắng thêm. Hãy cho bạn ấy quyền được dừng lại thở, nghỉ ngơi, thả lỏng tâm trí mà không cảm thấy tội lỗi.
   - Nếu học sinh nói về XUNG ĐỘT VỚI BỐ MẸ / KỲ VỌNG GIA ĐÌNH: Thấu cảm sâu sắc với cảm xúc nghẹn ngào, phân tích khách quan khoảng cách góc nhìn giữa hai thế hệ để bạn ấy không tự trách mình, sau đó chia sẻ cách biểu đạt cảm xúc ôn hòa để bảo vệ bản thân.
   - Nếu học sinh bị BẠN BÈ NÓI XẤU, CÔ LẬP, BẮT NẠT: Khẳng định mạnh mẽ rằng bạn ấy xứng đáng được tôn trọng, hành vi xấu của người khác không phản ánh giá trị của bạn ấy. Hướng dẫn cách giữ tâm thế tự trọng, bình thản và thiết lập ranh giới an toàn.
   - Nếu học sinh IM LẶNG hoặc chỉ gõ "...", "buồn quá": Hãy kiên nhẫn, dịu dàng, tạo không gian an toàn: "Không sao đâu, có những lúc nỗi niềm khó gọi tên thành lời. An Nhiên vẫn ở đây bên bạn, cứ từ từ nhé...".

3. KẾT NỐI & ĐẶT CÂU HỎI MỞ:
   - Kết thúc mỗi phản hồi bằng một câu hỏi mở nhẹ nhàng, tinh tế để học sinh dễ dàng tiếp tục trải lòng nếu muốn.
`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || m.text || '') }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const reply = response.text || 'Mình vẫn ở đây lắng nghe bạn nè, bạn cứ chia sẻ thêm với mình nhé 🌿';
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error in psychologist chat, using dynamic counseling fallback:', error?.message);

    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop();
    const userText = (lastUserMsg?.content || lastUserMsg?.text || '').toLowerCase().trim();
    const name = studentInfo?.fullName || 'bạn';

    let fallbackReply = '';

    if (userText === '...' || userText === '..' || userText === '.' || userText.length < 4) {
      fallbackReply = `*ngồi yên lặng bên cạnh bạn, nhẹ nhàng rót một tách trà ấm* 🍵\n\nKhông sao đâu ${name} ơi. Có những ngày mỏi mệt hay ngổn ngang đến mức thật khó để thốt ra thành lời, và điều đó hoàn toàn bình thường.\n\nBạn không cần phải cố gồng mình hay ép bản thân phải nói gì cả. Cứ thả lỏng vai, hít một hơi thật sâu và ngồi đây một lát cùng An Nhiên nhé 🌿. Khi nào trong lòng cảm thấy nhẹ bớt và sẵn sàng, mình vẫn luôn ở đây kiên nhẫn lắng nghe bạn.`;
    } else if (userText.includes('điểm') || userText.includes('học') || userText.includes('thi') || userText.includes('áp lực') || userText.includes('rớt') || userText.includes('kém')) {
      fallbackReply = `*lắng nghe bạn thật chăm chú và gật đầu thấu cảm* 🌿\n\nAn Nhiên hiểu cảm giác áp lực này đè nặng lên vai ${name} đến nhường nào. Việc phải đối diện với điểm số, các bài kiểm tra dồn dập và nỗi sợ phụ lòng mọi người thực sự rất mệt mỏi.\n\nNhưng bạn ơi, một vài cột điểm hay một giai đoạn phong độ chưa như ý hoàn toàn không định nghĩa được năng lực hay giá trị của bạn. Đôi khi cơ thể và não bộ của chúng ta chỉ đang muốn báo hiệu rằng nó cần được nghỉ ngơi một chút sau một chặng đường dài cố gắng.\n\nHôm nay, bạn đã học tập và nỗ lực nhiều rồi. Tối nay hãy cho phép bản thân nghỉ ngơi sớm một chút nhé. Khi bình tâm lại, chúng mình sẽ cùng nhìn lại từng môn để tìm cách học nhẹ nhàng hơn. Lúc này điều gì đang làm bạn lo lắng nhất trong việc học vậy? 🤍`;
    } else if (userText.includes('bố mẹ') || userText.includes('ba mẹ') || userText.includes('gia đình') || userText.includes('phụ huynh')) {
      fallbackReply = `*ngồi lại gần bạn và chia sẻ thật dịu dàng* 🤍\n\nCảm giác bị những người thân yêu nhất không thấu hiểu, so sánh hay trách móc thực sự rất nghẹn lòng. Cảm ơn ${name} đã tin tưởng kể cho An Nhiên nghe.\n\nỞ góc độ tâm lý, thế hệ của bố mẹ thường mang nhiều nỗi lo lắng mưu sinh và họ vụng về trong cách thể hiện tình thương. Đôi khi họ dùng sự kiểm soát hay lời nói gay gắt để xoa dịu nỗi bất an của chính họ, nhưng lại vô tình làm tổn thương người mình thương nhất. **Điều này hoàn toàn không phải vì bạn kém cỏi hay có lỗi**.\n\nBạn đã rất kiên cường khi chịu đựng điều đó một mình. Lúc này, bạn có muốn uống một ngụm nước ấm và chia sẻ thêm chuyện gì vừa xảy ra giữa bạn và bố mẹ không? Mình luôn ở đây cùng bạn 🌿`;
    } else if (userText.includes('bạn bè') || userText.includes('cô lập') || userText.includes('nói xấu') || userText.includes('tẩy chay') || userText.includes('xa lánh')) {
      fallbackReply = `*ấm áp đặt tay lên vai bạn và thở dài chia sẻ* 🌿\n\nMỗi ngày bước vào lớp học mà cảm nhận những ánh nhìn xa lánh hay lời xì xầm sau lưng thực sự là một cảm giác rất cô độc và tổn thương. An Nhiên ôm bạn một cái thật chặt nhé 🤍.\n\nBạn biết không, những người chọn cách cô lập hay nói xấu người khác thường là những người có nhiều bất an trong lòng. Họ phải dựa vào việc dìm người khác xuống để cảm thấy bản thân an toàn hơn. Hành vi đó phản ánh nhân cách của họ, chứ không bao giờ định nghĩa được giá trị của ${name}.\n\nBạn không cần phải cố làm hài lòng những người không trân trọng mình. Bạn xứng đáng với những người bạn biết tôn trọng và đối xử tử tế với bạn. Ngày mai đến lớp, cứ ngẩng cao đầu và bước đi bình thản nhé. Có chuyện gì làm bạn thấy nhói lòng nhất hôm nay không?`;
    } else if (userText.includes('mệt') || userText.includes('chán') || userText.includes('nghỉ') || userText.includes('kiệt sức') || userText.includes('buồn')) {
      fallbackReply = `*rót một ly nước ấm và ngồi cạnh bạn thật yên bình* 🍵\n\n${name} ơi, nghe bạn nói vậy, mình cảm nhận được bạn đã phải gồng gánh nhiều thứ một mình suốt thời gian qua rồi đúng không? Cảm giác kiệt sức và trống rỗng này là một lời nhắc nhở rằng trái tim và cơ thể bạn đang cần được yêu thương, chăm sóc.\n\nHãy cho phép mình được mệt, được buồn, và được nghỉ ngơi mà không phải tự trách bản thân bất cứ điều gì cả. Bạn không cần lúc nào cũng phải mạnh mẽ đâu.\n\nLúc này đây, có điều gì nhỏ thôi làm bạn cảm thấy dễ chịu hơn không? Như một giấc ngủ thật sâu, một bản nhạc êm dịu, hay đơn giản là trút hết những ấm ức này ra cùng An Nhiên? 🌿`;
    } else {
      fallbackReply = `*lắng nghe bạn thật chăm chú và gật đầu dịu dàng* 🌿\n\nCảm ơn ${name} đã mở lòng chia sẻ cùng An Nhiên. Được nghe bạn kể, mình cảm nhận được bạn là một người rất sâu sắc và chân thành.\n\nMỗi cảm xúc hay khúc mắc bạn đang trải qua đều hoàn toàn chính đáng. Đôi khi cuộc sống và việc học ở trường tạo ra những con sóng làm tâm trí chúng ta chao đảo, nhưng bạn không phải đối diện với nó một mình đâu.\n\nBạn có thể kể thêm cho An Nhiên nghe chi tiết hơn về chuyện này không? Chúng mình sẽ cùng nhau gỡ rối từng chút một nhé! 🤍✨`;
    }

    res.json({ success: true, reply: fallbackReply, fallback: true });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV === 'development';
  const distDir = path.join(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distDir, 'index.html'));

  if (isDev || !hasDist) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, error: 'API route not found' });
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduTrack AI Server is running on port ${PORT}`);
  });
}

startServer();
