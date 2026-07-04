import { format, parseISO, differenceInMinutes, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, fmt);
  } catch {
    return '—';
  }
};

export const formatTime = (date) => formatDate(date, 'hh:mm a');

export const formatDateTime = (date) => formatDate(date, 'dd MMM yyyy, hh:mm a');

export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const calcWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const mins = differenceInMinutes(
    typeof checkOut === 'string' ? parseISO(checkOut) : checkOut,
    typeof checkIn === 'string' ? parseISO(checkIn) : checkIn
  );
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

export const getMonthDays = (date = new Date()) => {
  return eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
};

export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const getDayName = (date) => format(date, 'EEE');

export const getStatusForDay = (attendanceRecords, date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return attendanceRecords?.find((r) => r.date?.startsWith(dateStr)) || null;
};
