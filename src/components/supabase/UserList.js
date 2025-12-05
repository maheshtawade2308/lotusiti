import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Navbar from "../pages/Navbar";

// Excel export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// PDF export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [editUser, setEditUser] = useState(null);

  

  useEffect(() => {
    fetchUsers();
  }, []);

   // If non-admin tries to open this page
  
  async function fetchUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "user")
      .order("created_at", { ascending: false });

    if (!error) setUsers(data);
    setLoading(false);
  }

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await supabase.from("profiles").delete().eq("id", id);
    setUsers(users.filter((u) => u.id !== id));
  };

  const updateUser = async () => {
    const { id, name, mobile, address, gender } = editUser;

    await supabase
      .from("profiles")
      .update({ name, mobile, address, gender })
      .eq("id", id);

    setEditUser(null);
    fetchUsers();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.includes(search)
  );

  const start = (page - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(start, start + pageSize);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

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
      head: [["Name", "Email", "Mobile", "Gender", "address"]],
      body: users.map((u) => [
        u.name,
        u.email,
        u.mobile,
        u.gender,
        u.address,
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
      <Navbar />

      <div className="container mt-4">

        <div className="d-flex justify-content-between align-items-center">
          <h2>👥 Registered Users</h2>

          {/* Export buttons */}
          <div>
            <button className="btn btn-success me-2" onClick={exportExcel}>
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Gender</th>
                  <th>City</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.mobile}</td>
                    <td>{u.gender}</td>
                    <td>{u.address}</td>
                    <td>{new Date(u.created_at).toLocaleString()}</td>

                    <td>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => setEditUser(u)}
                      >
                        ✏ Edit
                      </button>

                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => sendWhatsApp(u.mobile)}
                      >
                        📩 WhatsApp
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteUser(u.id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ⬅ Previous
              </button>

              <span className="fw-bold">
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next ➡
              </button>
            </div>
          </>
        )}

        {/* EDIT MODAL */}
        {editUser && (
          <div className="modal show d-block">
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header">
                  <h5>Edit User</h5>
                  <button
                    className="btn-close"
                    onClick={() => setEditUser(null)}
                  ></button>
                </div>

                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    value={editUser.name}
                    onChange={(e) =>
                      setEditUser({ ...editUser, name: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-2"
                    value={editUser.mobile}
                    onChange={(e) =>
                      setEditUser({ ...editUser, mobile: e.target.value })
                    }
                  />
                  <textarea
                    className="form-control mb-2"
                    value={editUser.address}
                    onChange={(e) =>
                      setEditUser({ ...editUser, address: e.target.value })
                    }
                  />
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
      </div>
    </>
  );
}
