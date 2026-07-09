export const STATUS_LABELS: Record<string, string> = {
  PLANNING: 'Đang lên kế hoạch',
  GENERATED: 'Đã tạo',
  CONFIRMED: 'Đã xác nhận',
};

export const STATUS_CLASS: Record<string, string> = {
  PLANNING: 'bg-primary/10 text-primary',
  GENERATED: 'bg-cta/10 text-cta',
  CONFIRMED: 'bg-primary text-white',
};

export const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  default: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed', label: 'Hoạt động' },
  food: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed', label: 'Ẩm thực' },
  sightseeing: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed', label: 'Tham quan' },
  nature: { bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed', label: 'Thiên nhiên' },
};

export const ALL_TAGS = [
  'Chill', 'Nature', 'Thư giãn', 'Adventure', 'Phiêu lưu', 
  'Luxury', 'Beach', 'Family', 'Modern', 'Văn hóa', 
  'History', 'Food', 'Ẩm thực'
];
