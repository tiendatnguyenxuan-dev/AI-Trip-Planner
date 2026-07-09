export default function GeneratingOverlay() {
  return (
    <div className="p-8 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-primary-container border-t-primary animate-spin"></div>
        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-on-surface">AI đang lên kế hoạch...</h2>
        <p className="text-on-surface-variant">Đang phân tích điểm đến và tạo lịch trình tối ưu</p>
      </div>
      <div className="flex gap-2">
        {['Nghiên cứu địa điểm', 'Tối ưu lộ trình', 'Tính toán ngân sách'].map((step, i) => (
          <span key={i} className="text-xs bg-surface-container px-3 py-1 rounded-full text-on-surface-variant animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
