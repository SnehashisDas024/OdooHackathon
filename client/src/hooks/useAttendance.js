import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function useAttendance(options = {}) {
  const qc = useQueryClient();
  const today = format(new Date(), 'yyyy-MM');

  const query = useQuery({
    queryKey: ['attendance', 'me', today],
    queryFn: () => attendanceService.getOwn({ month: today }).then((r) => r.data),
    ...options,
  });

  const todayQuery = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => attendanceService.getTodayStatus().then((r) => r.data),
    staleTime: 30_000,
  });

  const checkIn = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      qc.invalidateQueries(['attendance']);
      toast.success('Checked in! Have a great day.');
    },
    onError: () => toast.error('Check-in failed. Try again.'),
  });

  const checkOut = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      qc.invalidateQueries(['attendance']);
      toast.success('Checked out. See you tomorrow!');
    },
    onError: () => toast.error('Check-out failed. Try again.'),
  });

  return {
    ...query,
    todayRecord: todayQuery.data?.record,
    checkIn,
    checkOut,
  };
}
