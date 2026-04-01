import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "desc" });
  const [roleFilter, setRoleFilter] = useState("all"); // 'all', 'etudiant', 'enseignant', 'admin'
  const [editingUser, setEditingUser] = useState(null); // user being edited
  const [editData, setEditData] = useState({ nom: "", email: "", role: "" });

  const navigate = useNavigate();

  // Fetch all users
  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:8001/api/admin/courses/all-users/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Erreur lors du chargement");

        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchUsers();
  }, [navigate]);

  // Sorting & filtering
  const filteredUsers = useMemo(() => {
    let result = users;

    if (roleFilter !== "all") result = result.filter((u) => u.role.toLowerCase() === roleFilter);

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (u) =>
          u.nom.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "courses") {
          const aTitles = aValue?.map((c) => c.title).join(",") || "";
          const bTitles = bValue?.map((c) => c.title).join(",") || "";
          aValue = aTitles.toLowerCase();
          bValue = bTitles.toLowerCase();
        } else if (sortConfig.key === "last_online" || sortConfig.key === "date_registered") {
          aValue = aValue ? new Date(aValue) : new Date(0);
          bValue = bValue ? new Date(bValue) : new Date(0);
        } else {
          if (typeof aValue === "string") aValue = aValue.toLowerCase();
          if (typeof bValue === "string") bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, query, sortConfig, roleFilter]);

  function handleSort(key) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key ? (prev.direction === "desc" ? "asc" : "desc") : "desc",
    }));
  }

  function renderArrow(key) {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "desc" ? " ↓" : " ↑";
  }

  // --- ACTIONS ---
  async function handleDelete(userId, role) {
    if (role === "admin") {
      alert("Vous ne pouvez pas supprimer un autre admin.");
      return;
    }

    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8001/api/admin/users/${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(user) {
    if (user.role === "admin") {
      alert("Vous ne pouvez pas modifier un autre admin.");
      return;
    }
    setEditingUser(user);
    setEditData({ nom: user.nom, email: user.email, role: user.role });
  }

  async function submitEdit() {
    if (!editingUser) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8001/api/admin/users/${editingUser.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
        nom: editData.nom,       // <- map to backend field
        email: editData.email,
        role: editData.role,
        }),
      })
      if (!res.ok) throw new Error("Erreur lors de la modification");
      const updatedUser = await res.json();
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setEditingUser(null);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Tous les utilisateurs</h1>
          <p className="teacher-subtitle">Consultez et gérez les enseignants, étudiants et autres admins.</p>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="teacher-toolbar" style={{ marginBottom: "10px" }}>
        <div className="searchInline">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un utilisateur..." />
        </div>

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ marginLeft: "10px" }}>
          <option value="all">Tous les rôles</option>
          <option value="etudiant">Étudiant</option>
          <option value="enseignant">Enseignant</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="admin-students-table__head">
        <span onClick={() => handleSort("nom")} style={{ cursor: "pointer" }}>Nom{renderArrow("nom")}</span>
        <span onClick={() => handleSort("role")} style={{ cursor: "pointer" }}>Rôle{renderArrow("role")}</span>
        <span onClick={() => handleSort("courses")} style={{ cursor: "pointer" }}>Courses / Progression{renderArrow("courses")}</span>
        <span onClick={() => handleSort("last_online")} style={{ cursor: "pointer" }}>Dernière connexion{renderArrow("last_online")}</span>
        <span onClick={() => handleSort("date_registered")} style={{ cursor: "pointer" }}>Inscrit le{renderArrow("date_registered")}</span>
        <span>Actions</span>
      </div>

      {filteredUsers.map((user, index) => (
        <div key={index} className="admin-students-table__row">
          <div className="admin-student-user">
            <div className="admin-student-avatar">{user.nom.charAt(0)}</div>
            <div>
              <div className="teacher-row__title">{user.nom}</div>
              <div className="teacher-row__meta">{user.email}</div>
            </div>
          </div>

          <div className="teacher-student-role">{user.role}</div>

          <div className="admin-student-courses">
            {user.courses?.length ? (
              <ul>
                {user.courses.map((c) => (
                  <li key={c.id}>{c.title} {c.progress !== undefined ? `(${c.progress}%)` : ""}</li>
                ))}
              </ul>
            ) : "-"}
          </div>

          <div>{user.last_online ? new Date(user.last_online).toLocaleString() : "—"}</div>
          <div>{user.date_registered ? new Date(user.date_registered).toLocaleDateString() : "—"}</div>

          <div className="admin-student-actions">
            <button className="btn btn--ghost" onClick={() => startEdit(user)}>Modifier</button>
            <button className="btn btn--soft" onClick={() => handleDelete(user.id, user.role)}>Supprimer</button>
          </div>
        </div>
      ))}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Modifier {editingUser.nom}</h2>
            <label>
              Nom: <input value={editData.nom} onChange={(e) => setEditData({ ...editData, nom: e.target.value })} />
            </label>
            <label>
              Email: <input value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
            </label>
            <label>
              Rôle:
              <select
                value={editData.role}
                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              >
                <option value="etudiant">Étudiant</option>
                <option value="enseignant">Enseignant</option>
              </select>
            </label>
            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setEditingUser(null)}>Annuler</button>
              <button className="btn btn--soft" onClick={submitEdit}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}