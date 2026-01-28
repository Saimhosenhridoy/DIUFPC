import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-2xl border bg-white p-8">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Welcome, <span className="font-medium">{user?.name}</span>
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/dashboard/submissions"
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            My Submissions
          </Link>
          <Link
            to="/events"
            className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
          >
            Register for Events
          </Link>
        </div>
      </div>
    </div>
  );
}
