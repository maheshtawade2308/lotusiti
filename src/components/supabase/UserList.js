import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Navbar from "../pages/Navbar";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Edit form
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setUsers(data);

    setLoading(false);
  }

  // ----- DELETE USER -----
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    // delete from profiles table
    await supabase.from("profiles").delete().eq("id", id);

    // (optional) delete auth user - only via supabase admin API (server required)

    setUsers(users.filter((u) => u.id !== id));
  };

  // ----- UPDATE USER -----
  const updateUser = async () => {
    const { id, name, mobile, address, gender } = editUser;

    await supabase
      .from("profiles")
      .update({ name, mobile, address, gender })
      .eq("id", id);

    setEditUser(null);
    fetchUsers();
  };

  // ----- FILTERED USERS -----
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.includes(search)
  );

  // ----- PAGINATION LOGIC -----
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedUsers = filteredUsers.slice(start, end);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  return (
    <>
      <Navbar />

      <div className="container mt-4">

        <h2 className="mb-3">👥 Registered Users</h2>

        {/* Search Bar */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search by name, email or mobile..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset pagination after search
          }}
        />

        {loading ? (
          <p>Loading...</p>
        ) : filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Gender</th>
                  <th>Address</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email || "—"}</td>
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
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ⬅ Prev
              </button>

              <span className="fw-bold">
                Page {page} / {totalPages}
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
      </div>

      {/* -------- EDIT MODAL -------- */}
      {editUser && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button className="btn-close" onClick={() => setEditUser(null)}></button>
              </div>

              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Name"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Mobile"
                  value={editUser.mobile}
                  onChange={(e) =>
                    setEditUser({ ...editUser, mobile: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Gender"
                  value={editUser.gender}
                  onChange={(e) =>
                    setEditUser({ ...editUser, gender: e.target.value })
                  }
                />
                <textarea
                  className="form-control"
                  placeholder="Address"
                  value={editUser.address}
                  onChange={(e) =>
                    setEditUser({ ...editUser, address: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditUser(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={updateUser}>
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
