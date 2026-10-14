import { useEffect, useState } from "react";
import { api, getSession } from "../../services/api";
import "./AdminPage.css";
export default function AdminPage({ navigate }) {
  const [stats, setStats] = useState(null),
    [users, setUsers] = useState([]),
    [error, setError] = useState("");
  const admin = getSession()?.user?.role === "ADMIN";
  useEffect(() => {
    if (!admin) return;
    Promise.all([api("/admin/stats"), api("/admin/users")])
      .then(([s, u]) => {
        setStats(s);
        setUsers(u.content);
      })
      .catch((e) => setError(e.message));
  }, [admin]);
  async function patchUser(user, patch) {
    try {
      const updated = await api(`/admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setUsers((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    } catch (e) {
      setError(e.message);
    }
  }
  if (!admin)
    return (
      <main className="adminPage">
        <h1>Administrator access required</h1>
        <button onClick={() => navigate("/login")}>Sign in</button>
      </main>
    );
  return (
    <main className="adminPage">
      <header>
        <small>ADMINISTRATION</small>
        <h1>Learning operations</h1>
        <p>Manage application access. Authentication activity is managed in Neon Auth.</p>
      </header>
      {error && (
        <p role="alert" className="adminError">
          {error}
        </p>
      )}
      {stats && (
        <section className="adminStats">
          {[
            ["Total users", stats.users],
            ["Active users", stats.activeUsers],
            ["Progress records", stats.progressRecords],
            ["Completed articles", stats.completedArticles],
          ].map(([label, value]) => (
            <article key={label}>
              <span>{label}</span>
              <b>{value}</b>
            </article>
          ))}
        </section>
      )}
      <section className="adminPanel">
        <h2>Users</h2>
        <p>Showing the latest 50 application users.</p>
        <div className="adminTable">
          <div className="adminRow heading">
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
          </div>
          {users.map((user) => (
            <div className="adminRow" key={user.id}>
              <span>{user.displayName}</span>
              <span>{user.email}</span>
              <select
                aria-label={`Role for ${user.email}`}
                disabled={user.id === getSession()?.user.id}
                value={user.role}
                onChange={(e) => patchUser(user, { role: e.target.value })}
              >
                <option>USER</option>
                <option>ADMIN</option>
              </select>
              <button
                disabled={user.id === getSession()?.user.id}
                onClick={() => patchUser(user, { active: !user.active })}
              >
                {user.active ? "Active" : "Disabled"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
