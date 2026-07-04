import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { CheckCircle, XCircle, Info } from 'lucide-react';

// Mock feed – replace with real API call via useQuery in production
const mockFeed = [
  { id: 1, type: 'approved', message: 'Your leave request for Jul 5–6 was approved.', time: '2h ago' },
  { id: 2, type: 'info', message: "Don't forget to check in today!", time: '8h ago' },
  { id: 3, type: 'rejected', message: 'Leave on Jun 28 was rejected. See admin comments.', time: 'Yesterday' },
];

const icons = {
  approved: <CheckCircle size={16} style={{ color: 'var(--status-present)' }} />,
  rejected: <XCircle size={16} style={{ color: 'var(--status-danger)' }} />,
  info: <Info size={16} style={{ color: 'var(--brand-primary)' }} />,
};

export default function ActivityFeed() {
  const feed = mockFeed; // Swap for useQuery result

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-hairline)' }}>
        <h2 className="font-semibold text-base" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--ink-primary)' }}>
          Recent Activity
        </h2>
      </div>
      {feed.length === 0 ? (
        <EmptyState variant="empty" title="All caught up!" description="No recent alerts or notifications." />
      ) : (
        <ul className="divide-y" style={{ '--tw-divide-color': 'var(--border-hairline)' }}>
          {feed.map((item) => (
            <li key={item.id} className="flex items-start gap-3 px-5 py-4">
              <span className="mt-0.5 flex-shrink-0">{icons[item.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--ink-primary)' }}>{item.message}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
