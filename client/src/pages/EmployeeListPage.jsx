import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { formatDate } from '../utils/dateHelpers';
import BufferAnimation from '../components/common/BufferAnimation';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import StatusDot from '../components/common/StatusDot';
import Badge from '../components/common/Badge';
import { useState } from 'react';
import { Search, UserPlus, ChevronUp, ChevronDown } from 'lucide-react';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll().then((r) => r.data),
  });

  const employees = data?.employees || [];

  const filtered = employees
    .filter((e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase()) ||
      e.jobTitle?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const va = a[sortKey] || '';
      const vb = b[sortKey] || '';
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
    : null;

  const cols = [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'jobTitle', label: 'Job Position' },
    { key: 'dateOfJoining', label: 'Date of Joining' },
    { key: 'todayStatus', label: 'Status' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Employees</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>
            {employees.length} total employees
          </p>
        </div>
        <Button onClick={() => navigate('/onboarding/new-employee')}>
          <UserPlus size={16} />Add Employee
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-muted)' }} />
        <input
          type="search"
          placeholder="Search by name, department, or position…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[--border-hairline] focus:outline-none focus:ring-2 focus:ring-[--brand-primary] bg-white"
          style={{ color: 'var(--ink-primary)' }}
        />
      </div>

      {isLoading && <BufferAnimation variant="card-shuffle" size="md" caption="Fetching employees…" />}
      {isError && <EmptyState isError onRetry={refetch} />}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState variant="search" title="No employees match that search" description="Try a different keyword." />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-hairline)' }}>
                  {cols.map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer hover:bg-[--bg-canvas] transition-colors select-none"
                      style={{ color: 'var(--ink-muted)' }}
                    >
                      <span className="flex items-center gap-1">{label}<SortIcon k={key} /></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="border-b last:border-0 hover:bg-[--bg-canvas] transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} src={emp.profilePictureUrl} size="sm" />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>{emp.name}</p>
                          <p className="text-xs font-mono" style={{ color: 'var(--ink-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>{emp.empCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--ink-muted)' }}>{emp.department || '—'}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--ink-muted)' }}>{emp.jobTitle || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-muted)' }}>
                      {formatDate(emp.dateOfJoining)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <StatusDot status={emp.todayStatus || 'absent'} />
                        <span className="text-xs capitalize" style={{ color: 'var(--ink-muted)' }}>
                          {emp.todayStatus || 'absent'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
