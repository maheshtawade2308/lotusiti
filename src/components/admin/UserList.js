import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import RegisterUser from "./RegisterUser";
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

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? This will permanently remove the user from all records.")) return;

    const { error } = await supabase.rpc("delete_user_by_id", { user_id: id });

    if (error) {
      console.error("Delete failed:", error.message);
      alert("Failed to delete user: " + error.message);
      return;
    }

    setUsers(users.filter((u) => u.id !== id));
  };

  const updateUser = async () => {
    const { id, name, mobile, address, balance_points, center_name } = editUser;
    const newBalance = parseInt(balance_points) || 0;

    // Save profile changes and record transaction atomically in PostgreSQL
    const { data, error } = await supabase.rpc("admin_update_profile", {
      p_user_id: id,
      p_name: name,
      p_mobile: mobile,
      p_address: address,
      p_center_name: center_name,
      p_new_balance: newBalance
    });

    if (error || !data?.success) {
      console.error("Error updating user:", error || data?.error);
      alert("Error updating user: " + (error?.message || data?.error));
      return;
    }

    setEditUser(null);
    fetchUsers();
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
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.mobile}</td>
                      <td>{u.center_name || "-"}</td>
                      <td>{u.balance_points || 0}</td>
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

                          {/* Delete */}
                          <button
                            title="Delete User"
                            onClick={() => deleteUser(u.id)}
                            style={{
                              width: 32, height: 32, border: 'none', borderRadius: 8,
                              background: '#fef2f2', color: '#dc2626',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', fontSize: 15, transition: 'all 0.15s',
                              flexShrink: 0,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                          >
                            🗑️
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

        {/* EDIT MODAL */}
        {editUser && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">

                <div className="modal-header">
                  <h5>Edit User</h5>
                  <button
                    className="btn-close"
                    onClick={() => setEditUser(null)}
                  ></button>
                </div>

                <div className="modal-body">
                  <label className="form-label fw-bold">Name</label>
                  <input
                    className="form-control mb-2"
                    value={editUser.name}
                    onChange={(e) =>
                      setEditUser({ ...editUser, name: e.target.value })
                    }
                  />
                  <label className="form-label fw-bold">Mobile</label>
                  <input
                    className="form-control mb-2"
                    value={editUser.mobile}
                    onChange={(e) =>
                      setEditUser({ ...editUser, mobile: e.target.value })
                    }
                  />
                  <label className="form-label fw-bold">Address</label>
                  <textarea
                    className="form-control mb-2"
                    value={editUser.address}
                    onChange={(e) =>
                      setEditUser({ ...editUser, address: e.target.value })
                    }
                  />
                  <div className="input-group mb-2">
                    <span className="input-group-text">Center Name</span>
                    <input
                      type="text"
                      className="form-control"
                      value={editUser.center_name || ""}
                      onChange={(e) =>
                        setEditUser({ ...editUser, center_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group mb-2">
                    <span className="input-group-text">Balance Points</span>
                    <input
                      type="number"
                      className="form-control"
                      value={editUser.balance_points || 0}
                      onChange={(e) =>
                        setEditUser({ ...editUser, balance_points: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditUser(null)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={updateUser}>
                    Save
                  </button>
                </div>

              </div>
            </div>
          </div>
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
