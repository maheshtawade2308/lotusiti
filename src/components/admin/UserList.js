import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import RegisterUser from "./RegisterUser";
import EditUserModal from "./EditUserModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

// Excel export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// PDF export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function UserList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramSearch = searchParams.get("search") || "";

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState(paramSearch);
  const [loading, setLoading] = useState(true);

  const [editUser,     setEditUser]     = useState(null);
  const [showAddUser,  setShowAddUser]  = useState(false);
  const [lastLoginSort, setLastLoginSort] = useState('none'); // 'none' | 'asc' | 'desc'

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("user_profiles_with_last_login")
      .select("*")
      .eq("role", "user")
      .order("created_at", { ascending: false });

    if (!error) setUsers(data);
    setLoading(false);
  }

  // Soft Delete: Toggle Block / Unblock user
  const toggleBlockUser = async (user) => {
    const newStatus = !user.is_blocked;
    const actionText = newStatus ? "Block (Soft delete)" : "Unblock";

    if (!window.confirm(`Are you sure you want to ${actionText} user "${user.name}"?`)) return;

    const { data, error } = await supabase.rpc("toggle_user_blocked", {
      p_user_id: user.id,
      p_blocked: newStatus
    });

    if (error || !data?.success) {
      console.error("Block toggle failed:", error || data?.error);
      alert("Failed to update user status: " + (error?.message || data?.error));
      return;
    }

    setUsers(users.map((u) => u.id === user.id ? { ...u, is_blocked: newStatus } : u));
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.includes(search)
  );

  // Sort by last_sign_in_at — nulls always go to the bottom
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (lastLoginSort === 'none') return 0;
    const ta = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : null;
    const tb = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : null;
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;   // a has no login → push down
    if (tb === null) return -1;  // b has no login → push down
    return lastLoginSort === 'asc' ? ta - tb : tb - ta;
  });

  // ---------------- EXPORT TO EXCEL -------------------
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "registered_users.xlsx");
  };

  // ---------------- EXPORT TO PDF ---------------------
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Registered Users", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Name", "Email", "Mobile", "Center", "Balance"]],
      body: users.map((u) => [
        u.name,
        u.email,
        u.mobile,
        u.center_name || "-",
        u.balance_points || 0,
      ]),
    });

    doc.save("registered_users.pdf");
  };

  // ---------------- WHATSAPP MESSAGE ------------------
  const sendWhatsApp = (mobile) => {
    const message = encodeURIComponent(
      "Hello! This message is from Lotus Computer Institute."
    );

    window.open(`https://wa.me/91${mobile}?text=${message}`, "_blank");
  };

  return (
    <>
      <div className="container mt-4">

        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <h2 className="mb-0">👥 Registered Users</h2>
            <span
              className="badge rounded-pill bg-primary fs-6 px-3 py-2 shadow-sm"
              style={{ fontWeight: "600", letterSpacing: "0.5px" }}
              title={search ? "Filtered / Total users" : "Total registered users"}
            >
              {search
                ? `Showing ${sortedUsers.length} of ${users.length}`
                : `Total Users: ${users.length}`}
            </span>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => setShowAddUser(true)}>
              ➕ Add User
            </button>
            <button className="btn btn-success" onClick={exportExcel}>
              📗 Export Excel
            </button>
            <button className="btn btn-danger" onClick={exportPDF}>
              📕 Export PDF
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          className="form-control mt-3 mb-3"
          placeholder="Search by name, email, mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div
              className="table-responsive shadow-sm rounded border"
              style={{ maxHeight: "65vh", overflowY: "auto", overflowX: "auto" }}
            >
              <table className="table table-bordered table-striped table-hover mb-0">
                <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 2 }}>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Center Name</th>
                    <th>Balance</th>
                    <th className="text-center">Status</th>
                    <th style={{ whiteSpace: 'nowrap' }}>
                      <div className="d-flex align-items-center gap-2">
                        <span>Last Logged On</span>
                        <button
                          title={lastLoginSort === 'none' ? 'Sort' : lastLoginSort === 'desc' ? 'Newest first' : 'Oldest first'}
                          onClick={() => {
                            setLastLoginSort(s => s === 'none' ? 'desc' : s === 'desc' ? 'asc' : 'none');
                          }}
                          style={{
                            width: 20, height: 20,
                            padding: 0, border: '1px solid #cbd5e1',
                            borderRadius: 4, background: lastLoginSort !== 'none' ? '#4f46e5' : '#f8fafc',
                            color: lastLoginSort !== 'none' ? '#fff' : '#64748b',
                            fontSize: 11, lineHeight: 1,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0,
                            transition: 'all 0.15s',
                          }}
                        >
                          {lastLoginSort === 'desc' ? '↓' : lastLoginSort === 'asc' ? '↑' : '↕'}
                        </button>
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedUsers.map((u) => (
                    <tr key={u.id} className={u.is_blocked ? "table-danger text-muted" : ""}>
                      <td>
                        <span className="fw-semibold">{u.name}</span>
                        {u.is_blocked && (
                          <span className="badge bg-danger ms-2" style={{ fontSize: '0.68rem' }}>Blocked</span>
                        )}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.mobile}</td>
                      <td>{u.center_name || "-"}</td>
                      <td>{u.balance_points || 0}</td>
                      <td className="text-center">
                        {u.is_blocked ? (
                          <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle">
                            🚫 Blocked
                          </span>
                        ) : (
                          <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle">
                            ✓ Active
                          </span>
                        )}
                      </td>
                      <td>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}</td>

                      <td>
                        <div className="d-flex align-items-center gap-1" style={{ flexWrap: 'nowrap' }}>
                          {/* Edit */}
                          <button
                            title="Edit User"
                            onClick={() => setEditUser(u)}
                            style={{
                              width: 32, height: 32, border: 'none', borderRadius: 8,
                              background: '#eff6ff', color: '#2563eb',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontSize: 15, transition: 'all 0.15s',
                              flexShrink: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                          >
                            ✏️
                          </button>

                          {/* Block / Unblock (Soft Delete) */}
                          <button
                            title={u.is_blocked ? "Unblock User" : "Block User (Soft Delete)"}
                            onClick={() => toggleBlockUser(u)}
                            style={{
                              width: 32, height: 32, border: 'none', borderRadius: 8,
                              background: u.is_blocked ? '#fef3c7' : '#fee2e2',
                              color: u.is_blocked ? '#d97706' : '#dc2626',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontSize: 14, transition: 'all 0.15s',
                              flexShrink: 0,
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = u.is_blocked ? '#d97706' : '#dc2626';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = u.is_blocked ? '#fef3c7' : '#fee2e2';
                              e.currentTarget.style.color = u.is_blocked ? '#d97706' : '#dc2626';
                            }}
                          >
                            {u.is_blocked ? "🔓" : "🚫"}
                          </button>

                          {/* WhatsApp */}
                          <button
                            title="Send WhatsApp"
                            onClick={() => sendWhatsApp(u.mobile)}
                            style={{
                              width: 32, height: 32, border: 'none', borderRadius: 8,
                              background: '#f0fdf4', color: '#16a34a',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontSize: 15, transition: 'all 0.15s',
                              flexShrink: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#16a34a'; }}
                          >
                            <FaWhatsapp size={17} />
                          </button>

                          {/* Transactions */}
                          <button
                            title="View Transactions"
                            onClick={() => navigate(`/transactions?userId=${u.id}&userName=${encodeURIComponent(u.name)}`)}
                            style={{
                              width: 32, height: 32, border: 'none', borderRadius: 8,
                              background: '#ecfeff', color: '#0891b2',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontSize: 15, transition: 'all 0.15s',
                              flexShrink: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#0891b2'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#ecfeff'; e.currentTarget.style.color = '#0891b2'; }}
                          >
                            💳
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* EDIT USER MODAL */}
        {editUser && (
          <EditUserModal
            user={editUser}
            onClose={() => setEditUser(null)}
            onSaved={() => {
              setEditUser(null);
              fetchUsers();
            }}
            onDeleted={(deletedId) => {
              setUsers(users.filter((u) => u.id !== deletedId));
              setEditUser(null);
            }}
          />
        )}

        {/* ADD USER MODAL — reuses RegisterUser component */}
        {showAddUser && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">➕ Add New User</h5>
                  <button className="btn-close" onClick={() => setShowAddUser(false)}></button>
                </div>

                <div className="modal-body">
                  <RegisterUser
                    isModal={true}
                    onSuccess={() => {
                      setShowAddUser(false);
                      fetchUsers();
                    }}
                  />
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
