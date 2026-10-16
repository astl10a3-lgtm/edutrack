import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GradebookTab } from './components/GradebookTab';
import { CompetencyTab } from './components/CompetencyTab';
import { GoalsDirectoryTab } from './components/GoalsDirectoryTab';
import { AiGoalAnalyzerTab } from './components/AiGoalAnalyzerTab';
import { RoadmapsTab } from './components/RoadmapsTab';
import { TeacherGradingTab } from './components/TeacherGradingTab';
import { AdminApprovalTab } from './components/AdminApprovalTab';
import { PsychologistTab } from './components/PsychologistTab';
import { AuthModal } from './components/AuthModal';
import { 
  initialProfile, 
  initialSubjects, 
  defaultGoals, 
  defaultTeacher,
  initialStudentsRoster,
  StudentRecord 
} from './data/defaultData';
import { 
  StudentProfile, 
  SubjectGrade, 
  CompetitionGoal, 
  StudyRoadmap,
  UserSession,
  TeacherComment,
  RegistrationRequest
} from './types';
import { 
  calculateOverallGpa, 
  classifyAcademicRank, 
  evaluateCompetency,
  calculateSubjectAverage
} from './utils/gradeCalculations';
import { 
  syncRequestsWithCloud, 
  saveCloudRequests, 
  subscribeCloudRequests 
} from './services/cloudSync';
import { ShieldCheck, LogOut, GraduationCap } from 'lucide-react';

export default function App() {
  // 1. Authentication & Role State - Bắt buộc đăng nhập hoặc đăng ký khi mới vào ứng dụng
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('edutrack_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null; // Mặc định chưa đăng nhập -> buộc đăng nhập/đăng ký
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // 2. Registration Requests State (for Admin approval flow)
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>(() => {
    const saved = localStorage.getItem('edutrack_requests');
    if (saved) return JSON.parse(saved);
    return [
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
  });

  // 3. Class Roster State (All students in 11A1)
  const [studentsRoster, setStudentsRoster] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('edutrack_roster');
    return saved ? JSON.parse(saved) : initialStudentsRoster;
  });

  // 4. Selected Student ID (active student viewed/evaluated)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return initialProfile.id;
  });

  // Current active student record
  const currentStudentRecord = studentsRoster.find(r => r.profile.id === selectedStudentId) || studentsRoster[0];

  // 5. Active Student Profile & Subjects State
  const [profile, setProfile] = useState<StudentProfile>(currentStudentRecord ? currentStudentRecord.profile : initialProfile);
  const [subjects, setSubjects] = useState<SubjectGrade[]>(currentStudentRecord ? currentStudentRecord.subjects : initialSubjects);

  // Sync profile & subjects whenever selected student changes
  useEffect(() => {
    const rec = studentsRoster.find(r => r.profile.id === selectedStudentId);
    if (rec) {
      setProfile(rec.profile);
      setSubjects(rec.subjects);
    }
  }, [selectedStudentId, studentsRoster]);

  // 6. Goals & Competitions Library
  const [goals, setGoals] = useState<CompetitionGoal[]>(() => {
    const saved = localStorage.getItem('edutrack_goals');
    return saved ? JSON.parse(saved) : defaultGoals;
  });

  const [selectedGoalId, setSelectedGoalId] = useState<string>(() => {
    return goals[0]?.id || 'goal-dgnl-hcm';
  });

  // 7. Active Roadmaps
  const [activeRoadmaps, setActiveRoadmaps] = useState<StudyRoadmap[]>(() => {
    const saved = localStorage.getItem('edutrack_roadmaps');
    if (saved) return JSON.parse(saved);
    return defaultGoals[0].recommendedRoadmaps;
  });

  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(() => {
    return activeRoadmaps[0]?.id || '';
  });

  // 8. Navigation Tabs (for non-admin users)
  const [activeTab, setActiveTab] = useState<string>(() => {
    const savedAuth = localStorage.getItem('edutrack_auth');
    if (savedAuth) {
      try {
        const u = JSON.parse(savedAuth);
        if (u.role === 'teacher') return 'teacher-grading';
        if (u.role === 'admin') return 'admin-approval';
      } catch (_) {}
    }
    return 'gradebook';
  });

  // Tự động điều hướng và chỉ cho phép 2 chức năng đối với tài khoản giáo viên: Nhập điểm & Ghi nhận xét
  useEffect(() => {
    if (currentUser?.role === 'teacher' && activeTab !== 'teacher-grading' && activeTab !== 'teacher-comments') {
      setActiveTab('teacher-grading');
    }
  }, [currentUser?.role, activeTab]);

  // 9. Prefill data for AI Tab
  const [prefilledGoalForAi, setPrefilledGoalForAi] = useState<{
    title: string;
    category: string;
    description: string;
  } | undefined>(undefined);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('edutrack_auth', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('edutrack_auth');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('edutrack_requests', JSON.stringify(registrationRequests));
  }, [registrationRequests]);

  useEffect(() => {
    localStorage.setItem('edutrack_roster', JSON.stringify(studentsRoster));
  }, [studentsRoster]);

  useEffect(() => {
    localStorage.setItem('edutrack_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('edutrack_roadmaps', JSON.stringify(activeRoadmaps));
  }, [activeRoadmaps]);

  // Load Community Goals & Sync Registration Requests from Backend Server on mount
  useEffect(() => {
    fetch('/api/community-goals')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.goals && data.goals.length > 0) {
          setGoals(prev => {
            const existingIds = new Set(prev.map(g => g.id));
            const newCommunity = data.goals.filter((cg: any) => !existingIds.has(cg.id));
            return [...prev, ...newCommunity];
          });
        }
      })
      .catch(err => console.log('Community goals offline sync:', err));

    // Robust Multi-Device & Cloud Sync: Merge Server requests, LocalStorage & Cloud Relay
    const syncRequests = async () => {
      try {
        const localSaved = localStorage.getItem('edutrack_requests');
        const localList: RegistrationRequest[] = localSaved ? JSON.parse(localSaved) : [];

        // 1. First sync with Cloud Relay so cross-device requests appear immediately
        const cloudMerged = await syncRequestsWithCloud(localList);
        if (cloudMerged && cloudMerged.length > 0) {
          setRegistrationRequests(cloudMerged);
          localStorage.setItem('edutrack_requests', JSON.stringify(cloudMerged));
        }

        // 2. Also try syncing with local server if server is running
        try {
          const res = await fetch('/api/registration-requests');
          const data = await res.json();
          if (data.success && Array.isArray(data.requests)) {
            const currentList = cloudMerged && cloudMerged.length > 0 ? cloudMerged : localList;
            const map = new Map<string, RegistrationRequest>();
            data.requests.forEach((r: RegistrationRequest) => {
              if (r.username) map.set(r.username.toLowerCase(), r);
            });
            currentList.forEach((r: RegistrationRequest) => {
              if (!r.username) return;
              const key = r.username.toLowerCase();
              if (!map.has(key)) {
                map.set(key, r);
              } else {
                const s = map.get(key)!;
                if (r.status === 'approved' && s.status !== 'approved') {
                  map.set(key, { ...s, ...r });
                }
              }
            });
            const finalMerged = Array.from(map.values());
            setRegistrationRequests(finalMerged);
            localStorage.setItem('edutrack_requests', JSON.stringify(finalMerged));
            saveCloudRequests(finalMerged).catch(() => {});
          }
        } catch (_) {}
      } catch (err) {
        console.log('Requests sync error:', err);
      }
    };

    syncRequests();

    // Realtime Cloud Polling for Multi-Device synchronization
    const unsubscribeCloud = subscribeCloudRequests((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setRegistrationRequests(prev => {
          const map = new Map<string, RegistrationRequest>();
          // Put previous items
          prev.forEach(p => { if (p.username) map.set(p.username.toLowerCase(), p); });
          // Merge incoming cloud items
          cloudList.forEach(c => {
            if (!c || !c.username) return;
            const key = c.username.toLowerCase();
            if (!map.has(key)) {
              map.set(key, c);
            } else {
              const existing = map.get(key)!;
              // If cloud is approved or has newer update
              if (c.status === 'approved' || (c.status !== existing.status && c.processedAt)) {
                map.set(key, { ...existing, ...c });
              }
            }
          });
          const merged = Array.from(map.values());
          localStorage.setItem('edutrack_requests', JSON.stringify(merged));
          return merged;
        });
      }
    }, 5000);

    // Cross-tab synchronization via BroadcastChannel & Storage Event
    const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('edutrack_sync') : null;
    if (bc) {
      bc.onmessage = (event) => {
        if (event.data?.type === 'REGISTRATION_UPDATED' && Array.isArray(event.data.requests)) {
          setRegistrationRequests(event.data.requests);
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'edutrack_requests' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setRegistrationRequests(parsed);
          }
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribeCloud();
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Calculated Metrics
  const overallGpa = calculateOverallGpa(subjects);
  const academicRank = classifyAcademicRank(subjects, overallGpa);
  const currentGoal = goals.find(g => g.id === selectedGoalId) || goals[0];
  const evalResult = currentGoal ? evaluateCompetency(profile, subjects, currentGoal) : null;
  const competencyScore = evalResult ? evalResult.totalScore : 810;

  // Handlers for Authentication
  const handleLoginSuccess = (user: UserSession, targetStudentId?: string) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    if (user.role === 'admin') {
      setActiveTab('admin-approval');
    } else if (user.role === 'teacher') {
      setActiveTab('teacher-grading');
    } else {
      const studentId = targetStudentId || user.id;
      setSelectedStudentId(studentId);
      const matched = studentsRoster.find(r => r.profile.id === studentId || r.profile.username === user.username);
      if (matched) {
        setProfile(matched.profile);
        setSubjects(matched.subjects);
      }
      setActiveTab('gradebook');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('edutrack_auth');
    setIsAuthModalOpen(false);
  };

  const provisionStudentInRoster = (targetReq: RegistrationRequest) => {
    const alreadyInRoster = studentsRoster.some(
      st => (st.profile.username && st.profile.username.toLowerCase() === targetReq.username.toLowerCase()) || st.profile.id === targetReq.id
    );
    if (!alreadyInRoster) {
      const newProfile: StudentProfile = {
        id: targetReq.id,
        username: targetReq.username,
        fullName: targetReq.fullName,
        studentCode: targetReq.studentCode || `HS2026-${Math.floor(1000 + Math.random() * 9000)}`,
        classRoom: targetReq.classRoom || '11A1',
        schoolName: targetReq.schoolName || 'THPT Chu Văn An',
        academicYear: '2025 - 2026',
        semester: 'hk2',
        standard: 'tt22',
        conduct: 'Tốt',
        isGradeLocked: true, // Học sinh không thể tự sửa điểm
        certificates: [],
        achievements: [],
        teacherComments: [],
      };

      const newRecord: StudentRecord = {
        profile: newProfile,
        subjects: initialSubjects.map(s => ({
          ...s,
          regularGrades: [8.0, 8.0],
          midtermGrade: 8.0,
          finalGrade: 8.0,
          averageGrade: 8.0,
        })),
      };

      setStudentsRoster(prev => {
        const updated = [newRecord, ...prev];
        localStorage.setItem('edutrack_roster', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleNewRequestSubmitted = (newReq: RegistrationRequest) => {
    setRegistrationRequests(prev => {
      const updated = [newReq, ...prev.filter(r => r.username.toLowerCase() !== newReq.username.toLowerCase())];
      localStorage.setItem('edutrack_requests', JSON.stringify(updated));
      saveCloudRequests(updated).catch(() => {});
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const ch = new BroadcastChannel('edutrack_sync');
          ch.postMessage({ type: 'REGISTRATION_UPDATED', requests: updated });
          ch.close();
        } catch (_) {}
      }
      return updated;
    });

    if (newReq.status === 'approved' && newReq.role === 'student') {
      provisionStudentInRoster(newReq);
    }
  };

  // Admin Request Handlers
  const handleApproveRequest = async (requestId: string) => {
    // 1. Call server API
    try {
      await fetch(`/api/registration-requests/${requestId}/approve`, {
        method: 'PUT',
      });
    } catch (err) {
      console.log('Approve API offline:', err);
    }

    // 2. Update local requests & Cloud Relay
    const targetReq = registrationRequests.find(r => r.id === requestId);
    setRegistrationRequests(prev => {
      const updated = prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'approved' as const,
            processedAt: new Date().toISOString(),
            processedBy: 'adminedu',
          };
        }
        return r;
      });
      localStorage.setItem('edutrack_requests', JSON.stringify(updated));
      saveCloudRequests(updated).catch(() => {});
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const ch = new BroadcastChannel('edutrack_sync');
          ch.postMessage({ type: 'REGISTRATION_UPDATED', requests: updated });
          ch.close();
        } catch (_) {}
      }
      return updated;
    });

    // 3. If it's a student, provision a StudentRecord in the class roster so teachers can grade them
    if (targetReq && targetReq.role === 'student') {
      provisionStudentInRoster(targetReq);
    }
  };

  const handleBatchApprovePending = async () => {
    const pendingList = registrationRequests.filter(r => r.status === 'pending');
    for (const req of pendingList) {
      try {
        await fetch(`/api/registration-requests/${req.id}/approve`, { method: 'PUT' });
      } catch (_) {}
      if (req.role === 'student') {
        provisionStudentInRoster(req);
      }
    }
    setRegistrationRequests(prev => {
      const updated = prev.map(r => r.status === 'pending' ? {
        ...r,
        status: 'approved' as const,
        processedAt: new Date().toISOString(),
        processedBy: 'adminedu',
      } : r);
      localStorage.setItem('edutrack_requests', JSON.stringify(updated));
      saveCloudRequests(updated).catch(() => {});
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const ch = new BroadcastChannel('edutrack_sync');
          ch.postMessage({ type: 'REGISTRATION_UPDATED', requests: updated });
          ch.close();
        } catch (_) {}
      }
      return updated;
    });
  };

  const handleDirectCreateUser = async (newReq: RegistrationRequest) => {
    const approvedReq: RegistrationRequest = {
      ...newReq,
      status: 'approved',
      processedAt: new Date().toISOString(),
      processedBy: 'adminedu',
    };
    try {
      await fetch('/api/registration-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvedReq),
      });
    } catch (_) {}

    handleNewRequestSubmitted(approvedReq);
  };

  const handleRejectRequest = async (requestId: string, reason?: string) => {
    try {
      await fetch(`/api/registration-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    } catch (err) {
      console.log('Reject API offline:', err);
    }

    setRegistrationRequests(prev => {
      const updated = prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'rejected' as const,
            processedAt: new Date().toISOString(),
            processedBy: 'adminedu',
            rejectionReason: reason || 'Thông tin chưa hợp lệ',
          };
        }
        return r;
      });
      localStorage.setItem('edutrack_requests', JSON.stringify(updated));
      saveCloudRequests(updated).catch(() => {});
      return updated;
    });
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await fetch(`/api/registration-requests/${requestId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.log('Delete API offline:', err);
    }

    setRegistrationRequests(prev => {
      const updated = prev.filter(r => r.id !== requestId);
      localStorage.setItem('edutrack_requests', JSON.stringify(updated));
      saveCloudRequests(updated).catch(() => {});
      return updated;
    });
  };

  const handleRefreshRequests = async () => {
    const localSaved = localStorage.getItem('edutrack_requests');
    const localList: RegistrationRequest[] = localSaved ? JSON.parse(localSaved) : [];
    
    // Sync with Cloud
    const cloudMerged = await syncRequestsWithCloud(localList);
    if (cloudMerged && cloudMerged.length > 0) {
      setRegistrationRequests(cloudMerged);
      localStorage.setItem('edutrack_requests', JSON.stringify(cloudMerged));
    }

    // Try server sync
    try {
      const res = await fetch('/api/registration-requests');
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        const currentList = cloudMerged && cloudMerged.length > 0 ? cloudMerged : localList;
        const map = new Map<string, RegistrationRequest>();
        data.requests.forEach((r: RegistrationRequest) => {
          if (r.username) map.set(r.username.toLowerCase(), r);
        });
        currentList.forEach((r: RegistrationRequest) => {
          if (!r.username) return;
          const key = r.username.toLowerCase();
          if (!map.has(key)) {
            map.set(key, r);
          }
        });
        const merged = Array.from(map.values());
        setRegistrationRequests(merged);
        localStorage.setItem('edutrack_requests', JSON.stringify(merged));
      }
    } catch (err) {
      console.log('Server refresh error:', err);
    }
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
  };

  // Update student grades and immediately recalculate GPA, rank, and synchronize roster & storage
  const handleSaveGradesByTeacher = (studentId: string, updatedSubjects: SubjectGrade[]) => {
    const normalized = updatedSubjects.map(s => ({
      ...s,
      averageGrade: calculateSubjectAverage(s.regularGrades, s.midtermGrade, s.finalGrade),
    }));

    const newGpa = calculateOverallGpa(normalized);
    const newRank = classifyAcademicRank(normalized, newGpa).rank;

    setStudentsRoster(prev => {
      const updatedRoster = prev.map(rec => {
        if (rec.profile.id === studentId) {
          return {
            ...rec,
            profile: {
              ...rec.profile,
              gpa: newGpa,
              academicRank: newRank,
            },
            subjects: normalized,
          };
        }
        return rec;
      });
      localStorage.setItem('edutrack_roster', JSON.stringify(updatedRoster));
      return updatedRoster;
    });

    if (selectedStudentId === studentId) {
      setSubjects(normalized);
      setProfile(prev => ({
        ...prev,
        gpa: newGpa,
        academicRank: newRank,
      }));
    }
  };

  // Gradebook tab updates: sync with current student record in roster & localStorage
  const handleUpdateSubjects: React.Dispatch<React.SetStateAction<SubjectGrade[]>> = (updater) => {
    setSubjects(prevSubs => {
      const resolved = typeof updater === 'function' ? (updater as (prev: SubjectGrade[]) => SubjectGrade[])(prevSubs) : updater;
      const normalized = resolved.map(s => ({
        ...s,
        averageGrade: calculateSubjectAverage(s.regularGrades, s.midtermGrade, s.finalGrade),
      }));

      const newGpa = calculateOverallGpa(normalized);
      const newRank = classifyAcademicRank(normalized, newGpa).rank;

      setProfile(p => ({
        ...p,
        gpa: newGpa,
        academicRank: newRank,
      }));

      setStudentsRoster(roster => {
        const nextRoster = roster.map(rec => {
          if (rec.profile.id === selectedStudentId) {
            return {
              ...rec,
              profile: {
                ...rec.profile,
                gpa: newGpa,
                academicRank: newRank,
              },
              subjects: normalized,
            };
          }
          return rec;
        });
        localStorage.setItem('edutrack_roster', JSON.stringify(nextRoster));
        return nextRoster;
      });

      return normalized;
    });
  };

  // Teacher posts evaluation comment
  const handleSaveCommentByTeacher = (studentId: string, comment: TeacherComment) => {
    setStudentsRoster(prev => prev.map(rec => {
      if (rec.profile.id === studentId) {
        const existingComments = rec.profile.teacherComments || [];
        return {
          ...rec,
          profile: {
            ...rec.profile,
            teacherComments: [comment, ...existingComments.filter(c => c.id !== comment.id)],
          },
        };
      }
      return rec;
    }));
  };

  const handleResetData = () => {
    if (confirm('Khôi phục toàn bộ bảng điểm, hồ sơ và danh sách lớp về dữ liệu mẫu ban đầu?')) {
      setStudentsRoster(initialStudentsRoster);
      setSelectedStudentId(initialStudentsRoster[0].profile.id);
      setProfile(initialStudentsRoster[0].profile);
      setSubjects(initialStudentsRoster[0].subjects);
      setGoals(defaultGoals);
      setActiveRoadmaps(defaultGoals[0].recommendedRoadmaps);
      setSelectedRoadmapId(defaultGoals[0].recommendedRoadmaps[0].id);
      localStorage.removeItem('edutrack_roster');
      localStorage.removeItem('edutrack_goals');
      localStorage.removeItem('edutrack_roadmaps');
    }
  };

  const handleOpenAiPlannerForSubject = (subjectName: string, currentGrade: number) => {
    setPrefilledGoalForAi({
      title: `Chiến Dịch Gỡ Điểm Môn ${subjectName} Lên 8.5+ Học Kỳ Này`,
      category: 'academic_boost',
      description: `Điểm hiện tại của em môn ${subjectName} là ${currentGrade.toFixed(1)}. Em muốn nhờ AI phân tích cấu trúc bài kiểm tra vnEdu, tạo lịch trình ôn luyện 3-4 tuần để gỡ điểm kiểm tra 1 tiết và thi học kỳ lên mức Giỏi.`,
    });
    setActiveTab('ai-analyze');
  };

  const handleActivateRoadmap = (roadmap: StudyRoadmap) => {
    setActiveRoadmaps(prev => {
      const exists = prev.find(r => r.id === roadmap.id);
      if (exists) return prev;
      return [roadmap, ...prev];
    });
    setSelectedRoadmapId(roadmap.id);
  };

  const handleGoalSaved = (newGoal: CompetitionGoal) => {
    setGoals(prev => [newGoal, ...prev]);
    setSelectedGoalId(newGoal.id);
    if (newGoal.recommendedRoadmaps?.length > 0) {
      handleActivateRoadmap(newGoal.recommendedRoadmaps[0]);
    }
  };

  // ==========================================
  // CASE 0: NOT LOGGED IN -> FORCED AUTH GATEWAY
  // "mới vào ứng dụng sẽ buộc người dùng đăng nhập hoặc đăng kí tài khoản"
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
        {/* Background ambient lighting */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-3.5 z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  EduTrack <span className="text-blue-400">AI</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    vnEdu 4.0
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Cổng Thông Tin Sổ Điểm Điện Tử & Đánh Giá Năng Lực Học Sinh
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Yêu cầu đăng nhập hoặc đăng ký</span>
            </div>
          </div>
        </header>

        {/* Center Forced Login/Register Gateway */}
        <main className="flex-1 flex items-center justify-center p-4 py-8 z-10">
          <AuthModal
            isOpen={true}
            isForced={true}
            currentUser={currentUser}
            studentsRoster={studentsRoster}
            onLoginSuccess={handleLoginSuccess}
            onNewRegistrationRequestSubmitted={handleNewRequestSubmitted}
            registrationRequests={registrationRequests}
          />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-md py-4 text-center text-xs text-slate-500 z-20">
          EduTrack AI • Hệ thống Quản lý Học tập & Đánh giá Năng lực Học sinh Chuẩn vnEdu 4.0
        </footer>
      </div>
    );
  }

  // ==========================================
  // CASE 1: ADMIN USER INTERFACE
  // "lưu ý giao diện của tài khoản admin chỉ là duyệt yêu cầu tạo tài khoản của người dùng"
  // ==========================================
  if (currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
        {/* Dedicated Admin Header */}
        <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white">
                    EduTrack <span className="text-indigo-400">Admin</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    vnEdu Auth Core
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Cổng Quản Trị Hệ Thống • Phê Duyệt Yêu Cầu Tạo Tài Khoản Người Dùng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-slate-400">Tài khoản:</span>
                <strong className="text-indigo-300 font-mono">{currentUser.username}</strong>
                <span className="text-slate-500">({currentUser.fullName})</span>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng Xuất Admin</span>
              </button>
            </div>
          </div>
        </header>

        {/* Exclusive Admin Content: Only Approval Management */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <AdminApprovalTab
            currentAdmin={currentUser}
            requests={registrationRequests}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onDeleteRequest={handleDeleteRequest}
            onRefreshRequests={handleRefreshRequests}
            onLogoutAdmin={handleLogout}
            onBatchApprovePending={handleBatchApprovePending}
            onDirectCreateUser={handleDirectCreateUser}
          />
        </main>

        <footer className="bg-slate-950 border-t border-slate-800 py-4 text-xs text-slate-500 text-center">
          EduTrack AI Admin • Giao diện phê duyệt tài khoản Giáo viên & Học sinh vnEdu
        </footer>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          studentsRoster={studentsRoster}
          onLoginSuccess={handleLoginSuccess}
          onNewRegistrationRequestSubmitted={handleNewRequestSubmitted}
          registrationRequests={registrationRequests}
        />
      </div>
    );
  }

  // ==========================================
  // CASE 2: REGULAR PORTAL (TEACHER / STUDENT)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        profile={profile}
        setProfile={setProfile}
        studentsList={studentsRoster}
        selectedStudentId={selectedStudentId}
        onSelectStudent={handleSelectStudent}
        overallGpa={overallGpa}
        academicRank={academicRank}
        competencyScore={competencyScore}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* TEACHER ACCOUNT: Chỉ hiển thị 2 chức năng: 1. Nhập điểm & 2. Ghi nhận xét đánh giá năng lực */}
        {currentUser.role === 'teacher' ? (
          <TeacherGradingTab
            currentTeacher={currentUser}
            studentsRoster={studentsRoster}
            selectedStudentId={selectedStudentId}
            onSelectStudent={handleSelectStudent}
            onSaveGradesByTeacher={handleSaveGradesByTeacher}
            onSaveCommentByTeacher={handleSaveCommentByTeacher}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        ) : (
          <>
            {/* Tab 1: Gradebook & Academic Classification */}
            {activeTab === 'gradebook' && (
              <GradebookTab
                currentUser={currentUser}
                subjects={subjects}
                setSubjects={handleUpdateSubjects}
                profile={profile}
                setProfile={setProfile}
                onOpenAiPlannerForSubject={handleOpenAiPlannerForSubject}
                onResetData={handleResetData}
                onNavigateToTeacherGrading={() => setActiveTab('teacher-grading')}
              />
            )}

            {/* Tab 2: Competency Assessment */}
            {activeTab === 'competency' && (
              <CompetencyTab
                profile={profile}
                setProfile={setProfile}
                subjects={subjects}
                goals={goals}
                selectedGoalId={selectedGoalId}
                setSelectedGoalId={setSelectedGoalId}
                onActivateRoadmap={handleActivateRoadmap}
                onNavigateToRoadmapsTab={() => setActiveTab('roadmaps')}
                onNavigateToAiAnalyzer={() => setActiveTab('ai-analyze')}
              />
            )}

            {/* Tab 3: Goals & Exams Tagged Directory */}
            {activeTab === 'directory' && (
              <GoalsDirectoryTab
                goals={goals}
                selectedGoalId={selectedGoalId}
                setSelectedGoalId={setSelectedGoalId}
                profile={profile}
                subjects={subjects}
                onActivateRoadmap={handleActivateRoadmap}
                onNavigateToRoadmapsTab={() => setActiveTab('roadmaps')}
                onNavigateToAiAnalyzer={() => setActiveTab('ai-analyze')}
              />
            )}

            {/* Tab 4: AI Analyze & Ingest New Goals */}
            {activeTab === 'ai-analyze' && (
              <AiGoalAnalyzerTab
                profile={profile}
                subjects={subjects}
                onGoalSaved={handleGoalSaved}
                onActivateRoadmap={handleActivateRoadmap}
                onNavigateToRoadmapsTab={() => setActiveTab('roadmaps')}
                prefilledGoal={prefilledGoalForAi}
              />
            )}

            {/* Tab 5: AI Roadmaps & Schedules */}
            {activeTab === 'roadmaps' && (
              <RoadmapsTab
                activeRoadmaps={activeRoadmaps}
                setActiveRoadmaps={setActiveRoadmaps}
                selectedRoadmapId={selectedRoadmapId}
                setSelectedRoadmapId={setSelectedRoadmapId}
                onNavigateToAiAnalyzer={() => setActiveTab('ai-analyze')}
              />
            )}

            {/* Tab 6: AI School Psychologist (An Nhiên AI) */}
            {activeTab === 'psychologist' && (
              <PsychologistTab
                currentUser={currentUser}
                studentName={profile.fullName}
                classRoom={profile.classRoom}
                schoolName={profile.schoolName}
              />
            )}
          </>
        )}
      </main>

      {/* Auth Modal for Login / Account Registration Request */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        studentsRoster={studentsRoster}
        onLoginSuccess={handleLoginSuccess}
        onNewRegistrationRequestSubmitted={handleNewRequestSubmitted}
        registrationRequests={registrationRequests}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700">EduTrack AI • Sổ Điểm Điện Tử & Cố Vấn Học Tập Thông Minh</p>
            <p className="text-[11px] text-slate-400">
              Phân quyền chuẩn: Giáo viên nhập & khóa điểm • Học sinh xem điểm & kiểm tra năng lực • Admin duyệt tạo tài khoản.
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Hệ thống Quản lý Học tập & Đánh giá Năng lực vnEdu 4.0
          </div>
        </div>
      </footer>
    </div>
  );
}
