import { useSubmissions } from "../../hooks/useSubmissions";

export default function MySubmissions() {
  const { mySubmissions, loadingSubs, reloadMySubmissions } = useSubmissions();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold">My Submissions</h2>
        <button
          onClick={reloadMySubmissions}
          className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
        >
          Refresh
        </button>
      </div>

      {loadingSubs ? (
        <div className="mt-6">Loading...</div>
      ) : (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {mySubmissions.length === 0 ? (
            <div className="text-gray-600">No submissions yet.</div>
          ) : (
            mySubmissions.map((s) => (
              <div key={s.id} className="rounded-2xl border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{s.title}</div>
                  <span className="text-xs px-2 py-1 rounded-full border">
                    {s.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Event: {s.eventTitle} • Category: {s.category}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  File: {s.fileName || "N/A"}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
