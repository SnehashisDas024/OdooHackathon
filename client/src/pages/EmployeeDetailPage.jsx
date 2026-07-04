import { useParams } from 'react-router-dom';
import ProfileView from '../components/profile/ProfileView';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  return (
    <div className="flex flex-col gap-4">
      <ProfileView employeeId={id} readOnly={false} />
    </div>
  );
}
