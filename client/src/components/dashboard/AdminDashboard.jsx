import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/employeeService';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import StatusDot from '../common/StatusDot';
import BufferAnimation from '../common/BufferAnimation';
import EmptyState from '../common/EmptyState';
import { Search, UserPlus } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll().then((r) => r.data),
  });

  const employees = data?.employees || [];
  const filtered = employees.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = employees.filter((e) => e.todayStatus === 'present').length;
  const leaveCount = employees.filter((e) => e.todayStatus === 'leave').length;
  const absentCount = employees.filter((e) => e.todayStatus === 'absent').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>
            Here's today's overview for your team.
          </p>
        </div>
        <Button onClick={() => navigate('/onboarding/new-employee')}>
          <UserPlus size={16} />
          Add Employee
        </Button>
      </div>

      {/* Status strip */}
      {!isLoading && !isError && (
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Present', count: presentCount, color: 'var(--status-present)', bg: '#DCFCE7' },
            { label: 'On Leave', count: leaveCount, color: 'var(--status-leave)', bg: '#EDE9FE' },
            { label: 'Absent', count: absentCount, color: 'var(--status-pending)', bg: '#FEF9C3' },
          ].map(({ label, count, color, bg }) => (
            <span key={label} className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ background: bg, color }}>
              {count} {label}
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-muted)' }} />
        <input
          type="search"
          placeholder="Search by name or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[--border-hairline] focus:outline-none focus:ring-2 focus:ring-[--brand-primary] bg-white"
          style={{ color: 'var(--ink-primary)' }}
          aria-label="Search employees"
        />
      </div>

      {/* Grid */}
      {isLoading && <BufferAnimation variant="card-shuffle" size="md" caption="Fetching your team…" />}
      {isError && <EmptyState isError onRetry={refetch} />}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState variant="search" title="No employees match that search"
          description="Try a different name or department." />
      )}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="employee-grid">
          {filtered.map((emp) => (
            <Card
              key={emp.id}
              onClick={() => navigate(`/employees/${emp.id}`)}
              className="relative"
            >
              <div className="absolute top-4 right-4">
                <StatusDot status={emp.todayStatus || 'absent'} />
              </div>
              <div className="flex flex-col items-center text-center gap-3 pt-2">
                <Avatar name={emp.name} src={emp.profilePictureUrl} size="lg" />
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--ink-primary)', fontFamily: 'Sora, sans-serif' }}>
                    {emp.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                    {emp.jobTitle || emp.department || 'Employee'}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--bg-canvas)', color: 'var(--ink-muted)' }}>
                  {emp.department || 'General'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
