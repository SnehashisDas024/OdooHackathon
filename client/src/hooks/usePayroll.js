import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '../services/payrollService';
import toast from 'react-hot-toast';

export function usePayroll(employeeId) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['payroll', employeeId || 'me'],
    queryFn: () =>
      employeeId
        ? payrollService.getByEmployee(employeeId).then((r) => r.data)
        : payrollService.getOwn().then((r) => r.data),
  });

  const update = useMutation({
    mutationFn: (data) => payrollService.update(employeeId, data),
    onSuccess: () => {
      qc.invalidateQueries(['payroll', employeeId]);
      toast.success('Salary structure updated.');
    },
    onError: () => toast.error('Could not update payroll. Try again.'),
  });

  const payroll = query.data?.payroll || query.data;

  return {
    payroll,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    update,
  };
}
