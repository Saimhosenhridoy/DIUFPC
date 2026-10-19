import { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/admin");
      } else {
        setError("Additional verification required. Check Clerk settings.");
      }
    } catch (err) {
      setError(
        err?.errors?.[0]?.longMessage || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center bg-[#020916] text-[#F4F8FF]">
      <div className="app-card w-full max-w-md p-6 border border-[#2775D5]/50 bg-[#071A32]/95 shadow-[0_20px_65px_rgba(2,9,22,0.7),0_0_35px_rgba(19,120,255,0.12)]">
        <Link to="/" className="text-sm font-bold text-[#B8CCE8] hover:text-[#64B5FF] hover:underline transition">
          ← Back to Home
        </Link>

        <h1 className="text-2xl font-extrabold text-[#F4F8FF] mt-3">
          Admin Login
        </h1>
        <p className="text-sm text-[#B8CCE8] mt-1">
          Only authorized admins can sign in.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            type="email"
            placeholder="Admin email"
            className="w-full px-4 py-2 border border-[#285B95] rounded-lg bg-[#0C2343] text-[#F4F8FF] placeholder:text-[#8EA9CC] outline-none focus:border-[#3998FF] focus:ring-2 focus:ring-[#1378FF]/25"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-[#285B95] rounded-lg bg-[#0C2343] text-[#F4F8FF] placeholder:text-[#8EA9CC] outline-none focus:border-[#3998FF] focus:ring-2 focus:ring-[#1378FF]/25"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-[#FF9EAA] font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[#1378FF] text-white font-semibold hover:bg-[#3998FF] shadow-[0_8px_25px_rgba(19,120,255,0.3)] transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
