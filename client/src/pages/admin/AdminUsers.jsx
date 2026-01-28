 
 import { useEffect, useState } from "react";
import { gsAdmin } from "../../api/admin.gs";
import { useAuth } from "../../hooks/useAuth";

export default function AdminUsers() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const data = await gsAdmin.listUsers();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed");
    }
  }

  useEffect(() => { load(); }, []);

  const addOrUpdate = async () => {
    try {
      await gsAdmin.upsertUser({
        email, name, role, status: "ACTIVE", updatedBy: user?.email || "admin",
      });
      setEmail(""); setName(""); setRole("ADMIN");
      load();
    } catch (e) {
      alert(e.message || "Upsert failed");
    }
  };

  const setRoleFn = async (id, r) => {
    try {
      await gsAdmin.updateUserRole(id, r, user?.email || "admin");
      load();
    } catch (e) {
      alert(e.message || "Role update failed");
    }
  };

  return (
    <div className="app-card p-6">
      <div className="text-xl font-extrabold text-slate-900">Users & Roles</div>
      <div className="contact-underline mt-2" />
      {err && <div className="mt-4 text-red-700 font-bold">{err}</div>}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="contact-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="contact-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="contact-input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </select>
      </div>

      <button onClick={addOrUpdate} className="mt-3 px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition">
        Add/Update User
      </button>

      <div className="mt-5 space-y-2">
        {items.map((x) => (
          <div key={x.id} className="app-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="font-extrabold text-slate-900">{x.email}</div>
              <div className="text-sm text-slate-700">{x.name || "—"} • Role: <b>{x.role}</b></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRoleFn(x.id, "ADMIN")} className="px-3 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500">
                Make ADMIN
              </button>
              <button onClick={() => setRoleFn(x.id, "USER")} className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500">
                Make USER
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
