export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  return timeStr.substring(0, 5); // "HH:mm:ss" → "HH:mm"
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
}
