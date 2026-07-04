import ProfileView from '../components/profile/ProfileView';

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>My Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>View and update your personal details.</p>
      </div>
      <ProfileView />
    </div>
  );
}
