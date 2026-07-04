import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveService } from '../services/leaveService';
import toast from 'react-hot-toast';

export function useLeave() {
  const qc = useQueryClient();

  const ownQuery = useQuery({
    queryKey: ['myLeaves'],
    queryFn: () => leaveService.getOwn().then((r) => r.data),
  });

  const balancesQuery = useQuery({
    queryKey: ['leaveBalances'],
    queryFn: () => leaveService.getBalances().then((r) => r.data),
  });

  const apply = useMutation({
    mutationFn: leaveService.apply,
    onSuccess: () => {
      qc.invalidateQueries(['myLeaves']);
      qc.invalidateQueries(['leaveBalances']);
      toast.success('Leave request submitted!');
    },
    onError: () => toast.error('Could not submit your request. Try again.'),
  });

  const approve = useMutation({
    mutationFn: ({ id, comment }) => leaveService.approve(id, comment),
    onSuccess: () => { qc.invalidateQueries(['myLeaves']); toast.success('Leave approved.'); },
    onError: () => toast.error('Could not approve. Try again.'),
  });

  const reject = useMutation({
    mutationFn: ({ id, comment }) => leaveService.reject(id, comment),
    onSuccess: () => { qc.invalidateQueries(['myLeaves']); toast.success('Leave rejected.'); },
    onError: () => toast.error('Could not reject. Try again.'),
  });

  return {
    leaves: ownQuery.data?.leaves || [],
    isLoading: ownQuery.isLoading,
    isError: ownQuery.isError,
    refetch: ownQuery.refetch,
    balances: balancesQuery.data,
    apply,
    approve,
    reject,
  };
}
