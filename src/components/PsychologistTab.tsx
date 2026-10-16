import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Sparkles,
  Send,
  RefreshCw,
  ShieldCheck,
  Smile,
  Frown,
  Meh,
  Wind,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Compass,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Volume2,
  Flower2
} from 'lucide-react';
import { UserSession } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  moodTag?: string;
}

interface PsychologistTabProps {
  currentUser: UserSession | null;
  studentName?: string;
  classRoom?: string;
  schoolName?: string;
}

const QUICK_TOPICS = [
  {
    icon: '📚',
    title: 'Áp lực điểm số & kỳ vọng',
    prompt: 'Dạo này mình cảm thấy áp lực học tập và kỳ vọng của gia đình quá nặng nề, lúc nào cũng sợ bị điểm kém...',
  },
  {
    icon: '👥',
    title: 'Bị bạn bè cô lập / nói xấu',
    prompt: 'Mình cảm thấy dường như các bạn trong lớp đang xa lánh, bàn tán và nói xấu sau lưng mình...',
  },
  {
    icon: '🏠',
    title: 'Xung đột, cãi vã với phụ huynh',
    prompt: 'Mình vừa cãi nhau với bố mẹ, bố mẹ không chịu lắng nghe và luôn áp đặt suy nghĩ lên mình...',
  },
  {
    icon: '🌧️',
    title: 'Một chuyện vừa làm mình rất buồn',
    prompt: 'Hôm nay mình vừa gặp phải một chuyện khiến bản thân rất buồn và suy sụp, mình không biết phải làm sao...',
  },
  {
    icon: '🛡️',
    title: 'Cách ứng xử khi gặp lại người làm đau mình',
    prompt: 'Ngày mai mình phải gặp lại người đã làm tổn thương và nói những lời cay nghiệt với mình. Xin chuyên gia hướng dẫn cách nói chuyện và giữ bình tĩnh...',
  },
  {
    icon: '🍵',
    title: 'Chỉ muốn im lặng một chút...',
    prompt: '...',
  },
];

const MOOD_OPTIONS = [
  { id: 'anxious', label: 'Lo âu, căng thẳng', icon: '😰', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'sad', label: 'Buồn bã, muốn khóc', icon: '😢', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'angry', label: 'Uất ức, tức giận', icon: '😡', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'empty', label: 'Mệt mỏi, trống rỗng', icon: '🥀', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { id: 'confused', label: 'Bối rối, mất phương hướng', icon: '🤯', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'calm', label: 'Đang dần bình tâm', icon: '🌿', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
];

export const PsychologistTab: React.FC<PsychologistTabProps> = ({
  currentUser,
  studentName = 'Bạn',
  classRoom = '11A1',
  schoolName = 'THPT Chu Văn An',
}) => {
  const displayName = currentUser?.fullName || studentName || 'Bạn';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('edutrack_psychologist_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        content: `Chào ${displayName} nha! Mình là An Nhiên - chuyên gia tâm lý học đường kiêm người bạn tâm giao của bạn 🌿\n\n*ấm áp mỉm cười và kéo một chiếc ghế êm ái lại gần bạn*\n\nNơi đây là một góc nhỏ hoàn toàn riêng tư, bí mật và an toàn 100%. Bạn không cần phải gồng mình, không sợ bị phán xét hay chê trách bất cứ điều gì cả. Dù là một nỗi buồn thầm kín, áp lực thi cử, hay xích mích với ai đó... bạn cứ thoải mái trút bầu tâm sự với mình nhé. Hoặc nếu bạn chỉ muốn ngồi yên lặng thở một hơi thật sâu bên tách trà ấm, mình cũng luôn ở đây cùng bạn! 🍵✨`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [breathingStep, setBreathingStep] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(4);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('edutrack_psychologist_chat', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Breathing exercise timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showBreathingModal) {
      timer = setInterval(() => {
        setBreathingCount((prev) => {
          if (prev > 1) return prev - 1;
          if (breathingStep === 'inhale') {
            setBreathingStep('hold');
            return 7;
          } else if (breathingStep === 'hold') {
            setBreathingStep('exhale');
            return 8;
          } else {
            setBreathingStep('inhale');
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showBreathingModal, breathingStep]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      moodTag: selectedMood,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/psychologist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role === 'model' ? 'model' : 'user',
            content: m.content,
          })),
          studentInfo: {
            fullName: displayName,
            classRoom: classRoom,
            schoolName: schoolName,
          },
          activeMood: selectedMood,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const botMessage: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Lỗi kết nối');
      }
    } catch (err) {
      // Dynamic empathetic response closely matching the student's actual message
      const lower = text.toLowerCase();
      let contextualReply = '';
      if (lower.includes('điểm') || lower.includes('thi') || lower.includes('học') || lower.includes('áp lực')) {
        contextualReply = `Mình rất hiểu cảm giác nặng nề này của bạn. Điểm số hay một vài bài thi tạm thời không hề định nghĩa giá trị hay tương lai của bạn đâu. Bạn đã luôn nỗ lực rất nhiều rồi. Hãy cho phép bản thân nghỉ ngơi một chút, uống một ngụm nước ấm và thở đều nhé. Khi bạn bình tâm lại, chúng mình sẽ cùng chia nhỏ từng bài học để giải quyết nhẹ nhàng hơn. Bạn có muốn tâm sự thêm về môn học đang khiến bạn lo lắng nhất không?`;
      } else if (lower.includes('bạn') || lower.includes('xa lánh') || lower.includes('nói xấu') || lower.includes('cô lập')) {
        contextualReply = `Nghe bạn kể mình thấy thương bạn vô cùng. Bị bạn bè xa lánh hay bàn tán sau lưng thực sự là một cảm giác rất tủi thân và cô đơn. Nhưng bạn hãy nhớ rằng: lời nói hay cách đối xử của người khác phản ánh vấn đề ở họ, chứ không phải do bạn có lỗi hay kém cỏi. Bạn luôn xứng đáng được tôn trọng và yêu thương. Mình luôn ở đây cùng bạn, hãy kể cho mình nghe chuyện gì đã xảy ra nhé.`;
      } else if (lower.includes('bố') || lower.includes('mẹ') || lower.includes('gia đình') || lower.includes('cãi')) {
        contextualReply = `Khoảng cách thế hệ và sự bất đồng quan điểm giữa cha mẹ với chúng mình đôi khi tạo ra những cuộc cãi vã làm tổn thương cả hai phía. Mình hiểu bạn đang vừa buồn vừa bức bối vì cảm thấy không được lắng nghe. Lúc này cả hai bên đều đang có cảm xúc dâng trào, tạm thời hãy giữ khoảng cách tĩnh lặng để nguội bớt nhé. Bạn có muốn trải lòng thêm về điều bạn mong muốn bố mẹ thấu hiểu nhất lúc này không?`;
      } else {
        contextualReply = `Mình đang lắng nghe bạn đây. Từng dòng chữ của bạn mình đều đọc rất kỹ và cảm nhận được sự trăn trở trong lòng bạn lúc này. Bạn không cần phải một mình gánh gồng tất cả đâu. Hãy hít một hơi thật sâu, thả lỏng đôi vai xuống một chút nhé. Bất cứ điều gì bạn muốn nói tiếp, mình đều ở đây đồng hành cùng bạn 🌿`;
      }

      const fallbackMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        content: contextualReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setShowResetModal(true);
  };

  const confirmResetChat = () => {
    const freshWelcome: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      role: 'model',
      content: `Chào ${displayName}! Mình là An Nhiên đây 🌿\n\n*nhẹ nhàng mỉm cười và rót một tách trà ấm*\n\nCuộc trò chuyện mới đã sẵn sàng. Hôm nay của bạn thế nào rồi? Có điều gì trong lòng bạn muốn cùng mình chia sẻ hay tháo gỡ không?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([freshWelcome]);
    localStorage.removeItem('edutrack_psychologist_chat');
    setShowResetModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Info */}
      <div className="bg-gradient-to-r from-teal-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute left-1/3 -top-10 w-48 h-48 bg-teal-400/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-teal-100 flex items-center gap-1.5 border border-white/20">
                <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300 animate-pulse" />
                Chuyên Gia Tâm Lý Học Đường AI
              </span>
              <span className="px-3 py-1 bg-emerald-500/30 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Trực tuyến 24/7 • Luôn bên bạn
              </span>
              <span className="px-2.5 py-1 bg-amber-400/20 rounded-full text-[11px] font-medium text-amber-200 flex items-center gap-1 border border-amber-300/30">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                Bảo mật riêng tư 100%
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              An Nhiên AI • Người Bạn Thấu Cảm & Tư Vấn Tâm Lý
            </h1>
            <p className="text-sm text-teal-100/90 leading-relaxed font-normal">
              Không gian an toàn tuyệt đối để bạn trải lòng, không ngần ngại bày tỏ, được lắng nghe không phán xét, hiểu rõ tâm lý của đối phương và tìm lại sự bình an nội tại.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setShowBreathingModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs sm:text-sm font-bold backdrop-blur-sm transition flex items-center gap-2 cursor-pointer shadow-sm text-white"
            >
              <Wind className="w-4 h-4 text-teal-200" />
              <span>Xoa dịu khẩn cấp (Thở 4-7-8)</span>
            </button>

            <button
              onClick={handleResetChat}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer text-teal-100"
              title="Làm mới cuộc trò chuyện"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Trò chuyện mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Chat on Left, Mental Tools on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chat Room (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[640px] max-h-[820px]">
          {/* Chat Header Bar */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Flower2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">Chuyên gia An Nhiên</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lắng nghe • Thấu cảm • Phân tích tâm lý • Hướng dẫn cách ứng xử
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <Coffee className="w-4 h-4 text-amber-600" />
              <span>Tâm sự như hai người bạn</span>
            </div>
          </div>

          {/* Quick Mood Bar */}
          <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-indigo-500" />
              Cảm xúc lúc này:
            </span>
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.id}
                type="button"
                onClick={() => setSelectedMood(selectedMood === mood.label ? '' : mood.label)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedMood === mood.label
                    ? `${mood.color} ring-2 ring-indigo-400 font-bold shadow-xs`
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{mood.icon}</span>
                <span>{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 bg-gradient-to-b from-slate-50/40 to-white">
            {messages.map((msg) => {
              const isMe = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[88%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 pt-0.5">
                    {isMe ? (
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-purple-600 text-white flex items-center justify-center text-xs shadow-xs">
                        <Flower2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1">
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                          : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-none font-normal'
                      }`}
                    >
                      {/* Format expressions and body gracefully */}
                      <div className="whitespace-pre-wrap space-y-2">
                        {msg.content.split('\n\n').map((para, idx) => {
                          const isExpression = para.startsWith('*') && para.endsWith('*');
                          return (
                            <p
                              key={idx}
                              className={
                                isExpression
                                  ? 'italic font-medium text-purple-700 bg-purple-50/70 px-2.5 py-1 rounded-lg border border-purple-200/50'
                                  : ''
                              }
                            >
                              {para}
                            </p>
                          );
                        })}
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                        isMe ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.moodTag && isMe && (
                        <span className="text-indigo-600 font-semibold">• {msg.moodTag}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-purple-600 text-white flex items-center justify-center text-xs shrink-0">
                  <Flower2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-teal-900 text-xs sm:text-sm rounded-tl-none flex items-center gap-2 shadow-xs">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="italic font-medium text-teal-800">
                    An Nhiên đang chăm chú lắng nghe và đồng cảm cùng bạn...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Topics Starters */}
          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold text-slate-600">Gợi ý chủ đề tâm sự thường gặp:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(topic.prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition flex items-center gap-2 cursor-pointer shadow-2xs group text-xs text-slate-800"
                >
                  <span className="text-sm shrink-0">{topic.icon}</span>
                  <span className="truncate font-semibold text-slate-700 group-hover:text-indigo-700">
                    {topic.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input & Send Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder={`Hãy nói với An Nhiên bất cứ điều gì bạn đang cảm thấy... (Enter để gửi)`}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/20 text-xs sm:text-sm font-medium text-black bg-white placeholder:text-slate-400 resize-none outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className={`p-3.5 rounded-2xl font-bold transition flex items-center justify-center shrink-0 cursor-pointer shadow-md ${
                  inputText.trim() && !isLoading
                    ? 'bg-gradient-to-tr from-teal-600 to-indigo-600 text-white hover:opacity-95 shadow-indigo-600/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
                title="Gửi tâm sự"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>💡 Nhấn Enter để gửi tin nhắn, Shift+Enter để xuống dòng</span>
              <span>🌿 Cuộc trò chuyện được giữ kín tuyệt đối</span>
            </div>
          </div>
        </div>

        {/* Right Column: Psychological Toolkit & Guidance (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Box 1: Core Guidance for Addressing Pain Causing Figures */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-700">
              <Compass className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Chiến Lược Ứng Xử Khi Đối Diện</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Khi phải gặp lại người khiến bản thân buồn đau (bố mẹ gay gắt, bạn bè cô lập, người làm tổn thương):
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/70 space-y-1">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  1. Tách Rời Hành Vi Của Họ
                </span>
                <p className="text-xs text-teal-900 leading-relaxed font-normal">
                  Lời nói cay nghiệt phản ánh sự bất an và giới hạn của chính họ, <strong>hoàn toàn không phản ánh giá trị hay nhân cách của bạn</strong>.
                </p>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200/70 space-y-1">
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  2. Kỹ Thuật "Lá Chắn 3 Giây"
                </span>
                <p className="text-xs text-purple-900 leading-relaxed font-normal">
                  Hít một hơi sâu trong 3 giây trước khi phản hồi. Không tranh cãi trong cơn tức giận; im lặng bình thản cũng là một câu trả lời đầy tự trọng.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200/70 space-y-1">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  3. Mẫu Câu Phi Bạo Lực (NVC)
                </span>
                <p className="text-xs text-blue-900 leading-relaxed font-normal">
                  <em>"Khi nghe những lời đó, con/mình cảm thấy rất buồn và tổn thương. Con/mình cần một cuộc trò chuyện tôn trọng, nên chúng ta hãy nói lại khi cả hai đã bình tĩnh hơn."</em>
                </p>
              </div>
            </div>
          </div>

          {/* Box 2: Emotional First-Aid Button */}
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-teal-200" />
              <h3 className="font-bold text-sm">Hít Thở Điều Hòa Cảm Xúc</h3>
            </div>
            <p className="text-xs text-teal-100 leading-relaxed">
              Khi tim đập nhanh, nghẹn ngào hoặc tức giận, phương pháp thở 4-7-8 kích hoạt hệ thần kinh phó giao cảm giúp nhịp tim hạ xuống tức thì.
            </p>
            <button
              onClick={() => setShowBreathingModal(true)}
              className="w-full py-2.5 rounded-xl bg-white text-teal-800 font-bold text-xs hover:bg-teal-50 transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <Wind className="w-4 h-4" />
              <span>Bắt Đầu Thở Cùng An Nhiên</span>
            </button>
          </div>

          {/* Box 3: SOS Helpline for School Safety */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <PhoneCall className="w-4 h-4" />
              <h3 className="font-bold text-xs text-slate-800">Đường Dây Nóng Hỗ Trợ Khẩn Cấp</h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Nếu bạn hoặc bạn bè đang trong tình huống nguy hiểm, bạo lực học đường hay ý nghĩ tiêu cực nghiêm trọng, hãy gọi ngay:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <span className="font-semibold text-rose-900">Tổng đài Quốc gia Trẻ Em:</span>
                <span className="font-extrabold text-rose-600 font-mono text-sm">111 (Miễn phí 24/7)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Tư vấn Tâm lý Học đường:</span>
                <span className="font-extrabold text-indigo-600 font-mono text-sm">1900 1567</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breathing 4-7-8 Interactive Modal */}
      {showBreathingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                <Wind className="w-4 h-4 text-teal-600" />
                <span>Liệu Pháp Thở Sâu 4-7-8</span>
              </div>
              <button
                onClick={() => setShowBreathingModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              {/* Dynamic Breathing Circle */}
              <div
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white transition-all duration-1000 shadow-xl ${
                  breathingStep === 'inhale'
                    ? 'scale-110 bg-teal-500 shadow-teal-500/30'
                    : breathingStep === 'hold'
                    ? 'scale-105 bg-indigo-600 shadow-indigo-600/30 ring-4 ring-indigo-200'
                    : 'scale-90 bg-purple-600 shadow-purple-600/30'
                }`}
              >
                <span className="text-xs uppercase font-extrabold tracking-wider">
                  {breathingStep === 'inhale' ? 'HÍT VÀO' : breathingStep === 'hold' ? 'GIỮ HƠI' : 'THỞ RA'}
                </span>
                <span className="text-4xl font-extrabold font-mono mt-1">{breathingCount}s</span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">
                  {breathingStep === 'inhale'
                    ? 'Hít sâu bằng mũi, căng lồng ngực'
                    : breathingStep === 'hold'
                    ? 'Giữ hơi lại trong lồng ngực'
                    : 'Thở chậm rãi ra bằng miệng'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Tập trung vào cảm giác của hơi thở. Hãy để mọi muộn phiền tan biến theo từng nhịp thở.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <button
                onClick={() => setShowBreathingModal(false)}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-teal-600/20"
              >
                Tôi Đã Cảm Thấy Dễ Chịu Hơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Chat Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Bắt đầu trò chuyện mới?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Lịch sử trao đổi trước đó sẽ được làm mới để bạn bắt đầu một buổi tâm sự hoàn toàn thảnh thơi cùng An Nhiên.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Giữ lại
              </button>
              <button
                onClick={confirmResetChat}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-teal-600/25"
              >
                Bắt đầu mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
