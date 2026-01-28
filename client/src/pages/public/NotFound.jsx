import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <Link to="/" className="inline-block mt-4 underline">
        Go Home
      </Link>
    </div>
  );
}
