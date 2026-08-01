import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tripApi, aiApi } from '../services/api';
import { BUDGET_VALUES } from '../types/trip';
import { useAuth } from '../context/AuthContext';

type BudgetSlider = 1 | 2 | 3;
type TravelStyle = 'Ẩm thực' | 'Thư giãn' | 'Phiêu lưu' | 'Văn hóa' | 'Mua sắm' | 'Về đêm';

const BUDGET_MAP: Record<BudgetSlider, keyof typeof BUDGET_VALUES> = {
  1: 'budget',
  2: 'standard',
  3: 'luxury',
};

const BUDGET_LABELS: Record<BudgetSlider, string> = {
  1: 'Tiết kiệm',
  2: 'Tiêu chuẩn',
  3: 'Cao cấp',
};

const STYLE_OPTIONS: { icon: string; text: TravelStyle; bgClass: string }[] = [
  { icon: 'restaurant', text: 'Ẩm thực', bgClass: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  { icon: 'nature_people', text: 'Thư giãn', bgClass: 'bg-secondary-fixed text-on-secondary-fixed' },
  { icon: 'hiking', text: 'Phiêu lưu', bgClass: 'bg-primary-fixed text-on-primary-fixed' },
  { icon: 'museum', text: 'Văn hóa', bgClass: 'bg-surface-container-highest text-on-surface' },
  { icon: 'shopping_bag', text: 'Mua sắm', bgClass: 'bg-surface-container-highest text-on-surface' },
  { icon: 'nightlife', text: 'Về đêm', bgClass: 'bg-surface-container-highest text-on-surface' },
];

const TRAVEL_STYLES = STYLE_OPTIONS.map(o => o.text);

export default function PlanTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetSlider, setBudgetSlider] = useState<BudgetSlider>(2);
  const [travelers, setTravelers] = useState(2);
  const [selectedStyles, setSelectedStyles] = useState<TravelStyle[]>(['Thư giãn']);

  // Handle incoming state from Explore page
  useEffect(() => {
    const state = location.state as {
      destination?: string;
      durationDays?: number;
      tags?: string[];
      budget?: number;
    };

    if (state) {
      if (state.destination) setDestination(state.destination);
      if (state.tags) {
        // Map explore tags to TravelStyles
        const validStyles = state.tags.filter(t =>
          TRAVEL_STYLES.includes(t as TravelStyle)
        ) as TravelStyle[];
        if (validStyles.length > 0) setSelectedStyles(validStyles);
      }
      if (state.budget) {
        if (state.budget <= 2000000) setBudgetSlider(1);
        else if (state.budget <= 5000000) setBudgetSlider(2);
        else setBudgetSlider(3);
      }
    }
  }, [location.state]);

  // AI Assist state
  const [aiDescription, setAiDescription] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAiParse = async () => {
    if (!aiDescription.trim()) return;
    setIsParsing(true);
    setError(null);
    try {
      const result = await aiApi.parseTrip(aiDescription);

      if (result.destination) {
        // Only overwrite destination if the field is currently empty or if the parsed destination is explicitly requested (not just suggested by AI)
        if (!destination || !result.destinationIsSuggested) {
          setDestination(result.destination);
        }
      }
      if (result.origin) setOrigin(result.origin);
      if (result.startDate) setStartDate(result.startDate);
      if (result.endDate) setEndDate(result.endDate);
      if (result.travelers) setTravelers(result.travelers);

      if (result.budgetTier) {
        if (result.budgetTier === 'budget') setBudgetSlider(1);
        else if (result.budgetTier === 'standard') setBudgetSlider(2);
        else if (result.budgetTier === 'luxury') setBudgetSlider(3);
      }

      if (result.travelStyles && result.travelStyles.length > 0) {
        setSelectedStyles(result.travelStyles as TravelStyle[]);
      }
    } catch {
      setError('Không thể phân tích mô tả của bạn. Thử lại sau nhé.');
    } finally {
      setIsParsing(false);
    }
  };

  const toggleStyle = (style: TravelStyle) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const buildPreferences = () => {
    const parts: string[] = [];
    if (origin) parts.push(`Khởi hành từ: ${origin}`);
    parts.push(`Số người: ${travelers}`);
    if (selectedStyles.length > 0) parts.push(`Phong cách: ${selectedStyles.join(', ')}`);
    return parts.join('. ');
  };

  const handleGenerate = async () => {
    if (!destination || !startDate || !endDate) {
      setError('Vui lòng điền đầy đủ điểm đến và ngày đi.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('Ngày về phải sau ngày đi.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      if (!user?.id) {
        throw new Error("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      }

      const budgetKey = BUDGET_MAP[budgetSlider];
      const budgetValue = BUDGET_VALUES[budgetKey];

      // Step 1: Create trip
      const trip = await tripApi.create({
        userId: user.id,
        title: `${destination} – ${startDate}`,
        destination,
        startDate,
        endDate,
        budget: budgetValue,
      });

      // Step 2: Generate AI itinerary (now returns candidates)
      await tripApi.generate(trip.id, {
        preferences: buildPreferences(),
        language: 'Vietnamese',
      });

      // Step 3: Navigate to selection view
      navigate(`/selection/${trip.id}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.'
          : 'Không thể kết nối đến server. Vui lòng thử lại.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Warn user if they try to leave while generating
  useEffect(() => {
    if (!isGenerating) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for standard browsers to show the warning
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGenerating]);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

  return (
    <div className="pt-8 pb-24 px-4 flex flex-col items-center min-h-[calc(100vh-64px)]">
      {/* Progress Stepper */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-lg shadow-primary/20">1</div>
            <span className="text-[0.6875rem] font-semibold text-primary uppercase tracking-widest">Cơ bản</span>
          </div>
          <div className="flex-1 h-[2px] bg-primary-container mx-4 mb-6"></div>
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface font-bold">2</div>
            <span className="text-[0.6875rem] font-semibold text-on-surface uppercase tracking-widest">Đoàn người</span>
          </div>
          <div className="flex-1 h-[2px] bg-surface-container-highest mx-4 mb-6"></div>
          <div className="flex flex-col items-center gap-2 opacity-30">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface font-bold">3</div>
            <span className="text-[0.6875rem] font-semibold text-on-surface uppercase tracking-widest">Sở thích</span>
          </div>
        </div>
      </div>

      {/* Wizard Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Form Area (Left) */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-sm border border-outline-variant/10">
          <section className="space-y-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-on-surface">Bạn muốn đi đâu?</h1>
              <p className="text-on-surface-variant">Cho chúng tôi biết điểm xuất phát và điểm đến mơ ước.</p>
            </div>

            {/* AI Assist Box */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Trợ lý AI</h3>
              </div>
              <div className="relative group">
                <textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="Ví dụ: Tôi muốn đi du lịch Đà Lạt 3 ngày vào cuối tuần này với người yêu, mức giá trung bình, thích ăn uống và chụp ảnh..."
                  className="w-full bg-surface-container-highest/50 border-none rounded-2xl p-6 text-sm focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px] resize-none outline-none pr-16"
                />
                <button
                  onClick={handleAiParse}
                  disabled={isParsing || !aiDescription.trim()}
                  title={isParsing ? 'Đang phân tích...' : 'Gửi cho trợ lý'}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all z-10"
                >
                  {isParsing ? (
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">send</span>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant italic pl-2 opacity-70 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">tips_and_updates</span>
                Mô tả kỳ nghỉ bằng tiếng Việt tự nhiên, AI sẽ tự động điền các ô phía dưới.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center justify-between gap-3 bg-error-container/20 border border-error/20 text-on-error-container rounded-xl px-4 py-3 text-sm font-medium">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-error">error</span>
                  {error}
                </div>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-error/10 text-error rounded-lg font-bold hover:bg-error/20 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface pl-1">Khởi hành từ</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">my_location</span>
                  <input
                    type="text"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    placeholder="vd. Hồ Chí Minh"
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest rounded-lg border-none focus:ring-0 focus:bg-surface-container-lowest focus:border-b-2 focus:border-primary transition-all placeholder:text-outline/60 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface pl-1">Đến điểm đến <span className="text-error">*</span></label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">explore</span>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="vd. Hội An, Việt Nam"
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest rounded-lg border-none focus:ring-0 focus:bg-surface-container-lowest focus:border-b-2 focus:border-primary transition-all placeholder:text-outline/60 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface pl-1">Ngày khởi hành <span className="text-error">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">calendar_today</span>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    max={maxDate}
                    onChange={e => {
                      const val = e.target.value;
                      const year = val.split('-')[0];
                      if (year.length <= 4) setStartDate(val);
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest rounded-lg border-none focus:ring-0 focus:bg-surface-container-lowest focus:border-b-2 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface pl-1">Ngày trở về <span className="text-error">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">calendar_month</span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    max={maxDate}
                    onChange={e => {
                      const val = e.target.value;
                      const year = val.split('-')[0];
                      if (year.length <= 4) setEndDate(val);
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest rounded-lg border-none focus:ring-0 focus:bg-surface-container-lowest focus:border-b-2 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {(startDate && endDate) && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg border border-primary/10 w-fit">
                <span className="material-symbols-outlined text-primary text-sm">info</span>
                <span className="text-sm font-medium text-primary">
                  Thời gian: {(() => {
                    const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
                    const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    return `${days} ngày ${days > 1 ? days - 1 : 0} đêm`;
                  })()}
                </span>
              </div>
            )}

            <div className="pt-6">
              <h2 className="text-2xl font-semibold mb-6">Đoàn &amp; Ngân sách</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-on-surface">Mức ngân sách</label>
                    <span className="text-primary font-bold">{BUDGET_LABELS[budgetSlider]}</span>
                  </div>
                  <div className="px-2">
                    <input
                      type="range"
                      min="1"
                      max="3"
                      value={budgetSlider}
                      onChange={e => setBudgetSlider(Number(e.target.value) as BudgetSlider)}
                      className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary outline-none"
                    />
                    <div className="flex justify-between mt-4 text-[0.6875rem] font-bold text-outline uppercase tracking-tighter">
                      <span>Tiết kiệm</span>
                      <span>Tiêu chuẩn</span>
                      <span>Cao cấp</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-on-surface">Số người</label>
                  <div className="flex items-center justify-between bg-surface-container-low p-4 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setTravelers(t => Math.max(1, t - 1))}
                      className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold">{travelers}</span>
                      <span className="text-[0.6875rem] text-outline font-medium">Người</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTravelers(t => Math.min(20, t + 1))}
                      className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h2 className="text-2xl font-semibold mb-6">Phong cách du lịch</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STYLE_OPTIONS.map(style => {
                  const isSelected = selectedStyles.includes(style.text);
                  return (
                    <button
                      key={style.text}
                      type="button"
                      onClick={() => toggleStyle(style.text)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border transition-all group ${isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant/20 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${style.bgClass}`}>
                        <span className="material-symbols-outlined">{style.icon}</span>
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'group-hover:text-primary'}`}>
                        {style.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-10 flex flex-col items-center gap-6">
              <button
                id="btn-generate-itinerary"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all group disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    AI đang lên kế hoạch...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    Tạo Lịch Trình AI
                  </>
                )}
              </button>
            </div>
          </section>
        </div>

        {/* Contextual Sidebar (Right) */}
        <div className="md:col-span-4 space-y-8">
          <div className="bg-surface-container-low rounded-2xl p-8 space-y-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-on-surface">Khám phá Việt Nam</h3>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Điểm đến đề xuất</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'Hạ Long', province: 'Quảng Ninh', img: '/assets/destinations/halong.png' },
                { name: 'Đà Lạt', province: 'Lâm Đồng', img: '/assets/destinations/dalat.png' },
                { name: 'Sapa', province: 'Lào Cai', img: '/assets/destinations/sapa.png' },
                { name: 'Đà Nẵng', province: 'Đà Nẵng', img: '/assets/destinations/danang.png' }
              ].map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => setDestination(`${loc.name}, Việt Nam`)}
                  className="group relative h-32 w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <img
                    src={loc.img}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                    <span className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">{loc.name}</span>
                    <span className="text-white/70 text-[10px] font-medium uppercase tracking-widest">{loc.province}</span>
                  </div>
                </button>
              ))}
            </div>

            <ul className="space-y-4 pt-4 border-t border-outline-variant/30">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">Gợi ý cá nhân hóa dựa trên <span className="font-semibold text-on-surface">phong cách của bạn</span>.</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm">eco</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">Ưu tiên trải nghiệm địa phương và điểm đến xanh.</p>
              </li>
            </ul>
          </div>

          {/* Help Card */}
          <div className="p-8 bg-primary/5 rounded-2xl border border-primary/10">
            <h4 className="font-bold text-on-surface mb-2">Bạn chưa biết đi đâu?</h4>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">Hãy để AI của chúng tôi gợi ý những điểm đến "ẩn mình" cực chất tại Việt Nam cho bạn.</p>
            <button className="w-full py-3 px-4 bg-surface-container-lowest text-primary border border-primary/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm">
              Tìm cảm hứng mới <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
