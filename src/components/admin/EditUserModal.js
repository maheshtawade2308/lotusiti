import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";

/**
 * Shared EditUserModal component
 * Used across UserList and Transactions pages for editing profiles,
 * updating points, and performing permanent deletion.
 *
 * Props:
 * - user: object (the user profile being edited)
 * - onClose: func (callback when modal is closed)
 * - onSaved: func (callback with updatedUser when changes are saved)
 * - onDeleted: func (optional callback with userId when user is permanently deleted)
 */
export default function EditUserModal({ user, onClose, onSaved, onDeleted }) {
  const [formData, setFormData] = useState({
    id: user?.id,
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    address: user?.address || "",
    center_name: user?.center_name || "",
    balance_points: user?.balance_points || 0,
    is_blocked: user?.is_blocked || false,
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "balance_points" ? (parseInt(value, 10) || 0) : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { id, name, mobile, address, balance_points, center_name } = formData;
    const newBalance = parseInt(balance_points, 10) || 0;

    // Execute atomic stored procedure: updates profile fields + logs balance diff
    const { data, error } = await supabase.rpc("admin_update_profile", {
      p_user_id: id,
      p_name: name,
      p_mobile: mobile,
      p_address: address,
      p_center_name: center_name,
      p_new_balance: newBalance,
    });

    if (error || !data?.success) {
      console.error("Error saving user:", error || data?.error);
      alert("Error saving user: " + (error?.message || data?.error));
      setSaving(false);
      return;
    }

    setSaving(false);
    if (onSaved) {
      onSaved({ ...formData, balance_points: newBalance });
    }
    onClose();
  };

  const handlePermanentDelete = async () => {
    const confirmPrompt = window.confirm(
      `⚠️ PERMANENT DELETE WARNING: This will permanently erase "${formData.name}" and all associated data from the database. This action CANNOT be undone. Are you absolutely sure?`
    );
    if (!confirmPrompt) return;

    setDeleting(true);
    const { error } = await supabase.rpc("delete_user_by_id", {
      user_id: formData.id,
    });

    if (error) {
      console.error("Delete failed:", error.message);
      alert("Failed to permanently delete user: " + error.message);
      setDeleting(false);
      return;
    }

    setDeleting(false);
    if (onDeleted) {
      onDeleted(formData.id);
    }
    onClose();
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.55)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow border-0">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">✏️ Edit User Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={saving || deleting}
            />
          </div>

          <div className="modal-body">
            {formData.is_blocked && (
              <div className="alert alert-warning py-2 mb-3 d-flex align-items-center gap-2">
                <span>⚠️</span>
                <small>
                  <strong>Account is Blocked.</strong> User cannot log in or
                  generate ID cards.
                </small>
              </div>
            )}

            <div className="mb-2">
              <label className="form-label fw-semibold small mb-1">Full Name</label>
              <input
                name="name"
                className="form-control form-control-sm"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold small mb-1">Email</label>
              <input
                type="email"
                disabled
                className="form-control form-control-sm bg-light text-muted"
                value={formData.email}
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold small mb-1">Mobile Number</label>
              <input
                name="mobile"
                className="form-control form-control-sm"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile"
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold small mb-1">Address / City</label>
              <textarea
                name="address"
                rows="2"
                className="form-control form-control-sm"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
              />
            </div>

            <div className="input-group input-group-sm mb-2">
              <span className="input-group-text fw-semibold">Center Name</span>
              <input
                type="text"
                name="center_name"
                className="form-control"
                value={formData.center_name}
                onChange={handleChange}
                placeholder="e.g. Lotus Computer Institute"
              />
            </div>

            <div className="input-group input-group-sm mb-1">
              <span className="input-group-text fw-semibold">Balance Points</span>
              <input
                type="number"
                name="balance_points"
                min="0"
                className="form-control fw-bold text-primary"
                value={formData.balance_points}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer d-flex justify-content-between">
            {/* Permanent Delete Option */}
            <button
              type="button"
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
              onClick={handlePermanentDelete}
              disabled={saving || deleting}
              title="Permanently remove user from auth and database records"
            >
              🗑️ {deleting ? "Deleting..." : "Permanently Delete"}
            </button>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
                disabled={saving || deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={saving || deleting}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
