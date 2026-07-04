import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Clock, PlaneTakeoff } from 'lucide-react';
import Card from '../common/Card';
import ActivityFeed from './ActivityFeed';

const quickItems = [
  { label: 'My Profile', desc: 'View and edit your details', icon: User, path: '/profile', color: '#EEF2FF', iconColor: 'var(--brand-primary)' },
  { label: 'Attendance', desc: 'Check in or view your records', icon: Clock, path: '/attendance', color: '#F0FDF4', iconColor: 'var(--status-present)' },
  { label: 'Time Off', desc: 'Apply for or view your leaves', icon: PlaneTakeoff, path: '/leave', color: '#EDE9FE', iconColor: 'var(--status-leave)' },
];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
          Here's what's waiting for you today.
        </p>
      </div>

      {/* Quick access cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickItems.map(({ label, desc, icon: Icon, path, color, iconColor }) => (
          <Card key={label} onClick={() => navigate(path)} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: color }}>
              <Icon size={22} style={{ color: iconColor }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>{desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Activity feed */}
      <ActivityFeed />
    </div>
  );
}
