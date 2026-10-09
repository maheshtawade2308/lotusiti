import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import '../../styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const PAGE_SIZE = 10;

const Transactions = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // Read URL params (set when navigating from UserList)
  const [searchParams] = useSearchParams();
  const paramUserId   = searchParams.get('userId')   || '';
  const paramUserName = searchParams.get('userName') || '';

  const [rows,           setRows]           = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [typeFilter,     setTypeFilter]     = useState('all');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [page,           setPage]           = useState(1);
  const [total,          setTotal]          = useState(0);
  // Admin-only: filter by user name (pre-filled from URL param)
  const [userNameFilter, setUserNameFilter] = useState(paramUserName);
  const [allUsers,       setAllUsers]       = useState([]); // for admin dropdown

  // Admin-only: User details modal state
  const [selectedUser,   setSelectedUser]   = useState(null);
  const [modalLoading,   setModalLoading]   = useState(false);
  const [savingUser,     setSavingUser]     = useState(false);

  const openUserDetails = async (userId) => {
    if (!userId) return;
    setModalLoading(true);
    setSelectedUser(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setSelectedUser(data);
    } else {
      console.error('Failed to load user details:', error);
      alert('Failed to load user details');
    }
    setModalLoading(false);
  };

  const updateSelectedUser = async () => {
    if (!selectedUser) return;
    setSavingUser(true);
    const { id, name, mobile, address, balance_points, center_name } = selectedUser;
    const newBalance = parseInt(balance_points) || 0;

    // Use atomic stored procedure to update profile & balance with transaction record
    const { data, error } = await supabase.rpc('admin_update_profile', {
      p_user_id: id,
      p_name: name,
      p_mobile: mobile,
      p_address: address,
      p_center_name: center_name,
      p_new_balance: newBalance
    });

    if (error || !data?.success) {
      console.error('Error updating user:', error || data?.error);
      alert('Error updating user: ' + (error?.message || data?.error));
      setSavingUser(false);
      return;
    }

    // Refresh transactions table so any logged balance transaction reflects immediately
    fetchTransactions();
    setSavingUser(false);
    setSelectedUser(null);
  };

  // ── Fetch all users for admin name-filter dropdown ─────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'user')
      .order('name')
      .then(({ data }) => setAllUsers(data || []));
  }, [isAdmin]);

  // ── Fetch transactions ────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    if (!profile) return;
    setLoading(true);

    // Determine which user_id to filter on:
    // 1. If navigated from UserList (paramUserId set in URL) → pin that user
    // 2. Else if admin picked a name from dropdown → resolve to that user's id
    // 3. Else if regular user → always their own id
    let resolvedUserId = '';
    if (paramUserId) {
      resolvedUserId = paramUserId;
    } else if (isAdmin && userNameFilter) {
      const matched = allUsers.find(u => u.name === userNameFilter);
      if (matched) resolvedUserId = matched.id;
    } else if (!isAdmin) {
      resolvedUserId = profile.id;
    }

    let query = supabase
      .from('transactions')
      .select(
        isAdmin
          ? '*, profiles!transactions_user_id_fkey(name)'
          : '*',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Apply user filter
    if (resolvedUserId) {
      query = query.eq('user_id', resolvedUserId);
    }

    // Type filter
    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter);
    }

    // Date range
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo)   query = query.lte('created_at', dateTo + 'T23:59:59');

    // Description search
    if (search.trim()) {
      query = query.ilike('description', `%${search.trim()}%`);
    }

    // Pagination
    const from = (page - 1) * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (!error) {
      setRows(data || []);
      setTotal(count || 0);
    } else {
      console.error('Transactions fetch error:', error);
    }
    setLoading(false);
  }, [profile, isAdmin, paramUserId, userNameFilter, allUsers, typeFilter, dateFrom, dateTo, search, page]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // Apply filter button handler
  const applyFilter = () => { setPage(1); fetchTransactions(); };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const shortId = (id) => id?.slice(0, 8).toUpperCase() ?? '—';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container mt-4 pb-5">

      {/* Header */}
      <div className="lotus-page-header mb-4">
        <div>
          <h4>💳 Transactions</h4>
          <p className="mb-0 text-light opacity-75" style={{ fontSize: '0.9rem' }}>
            {paramUserId && paramUserName
              ? `Showing transactions for: ${paramUserName}`
              : isAdmin
                ? 'All user point transactions'
                : 'Your point transaction history'}
          </p>
        </div>
        <div className="d-flex gap-2">
          {paramUserId && (
            <Link to="/user-list" className="btn-switch-module">← Back to Users</Link>
          )}
          <Link to="/dashboard" className="btn-switch-module">← Dashboard</Link>
        </div>
      </div>

      {/* Pinned-user banner (when coming from UserList) */}
      {paramUserId && paramUserName && (
        <div className="alert d-flex align-items-center gap-2 mb-3 py-2 px-3"
          style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10 }}>
          <span style={{ fontSize: '1.1rem' }}>👤</span>
          <span className="small fw-semibold" style={{ color: '#0369a1' }}>
            Filtered for user: <strong>{paramUserName}</strong>
          </span>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-3 shadow-sm border p-3 mb-4">
        <div className="row g-2 align-items-end">

          {/* Admin: User Name dropdown (hidden when pinned via URL) */}
          {isAdmin && !paramUserId && (
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold mb-1">👤 Filter by User</label>
              <select
                className="form-select form-select-sm"
                value={userNameFilter}
                onChange={e => { setUserNameFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Users</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Search description */}
          <div className={`col-12 ${isAdmin && !paramUserId ? 'col-md-3' : 'col-md-4'}`}>
            <label className="form-label small fw-semibold mb-1">🔍 Search Description</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Farmer ID, Kamgar ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilter()}
            />
          </div>

          {/* Type filter */}
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold mb-1">Type</label>
            <select
              className="form-select form-select-sm"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            >
              <option value="all">All</option>
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          {/* Date From */}
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold mb-1">From</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            />
          </div>

          {/* Date To */}
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold mb-1">To</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
            />
          </div>

          {/* Buttons */}
          <div className="col-6 col-md-2 d-flex gap-2">
            <button className="btn btn-primary btn-sm flex-fill" onClick={applyFilter}>Apply</button>
            <button
              className="btn btn-outline-secondary btn-sm flex-fill"
              onClick={() => {
                setSearch(''); setTypeFilter('all');
                setDateFrom(''); setDateTo('');
                setUserNameFilter(''); setPage(1);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-3 shadow-sm border overflow-hidden">
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Loading transactions…
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div style={{ fontSize: '2.5rem' }}>📭</div>
            <p className="mt-2 mb-0">No transactions found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Transaction ID</th>
                  <th>Date &amp; Time</th>
                  <th>Description</th>
                  <th className="text-center">Type</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end pe-3">Balance After</th>
                  {isAdmin && <th>Transaction By</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td className="ps-3">
                      <span
                        className="badge bg-light text-secondary border fw-normal font-monospace"
                        title={row.id}
                        style={{ cursor: 'help', letterSpacing: '0.03em' }}
                      >
                        #{shortId(row.id)}
                      </span>
                    </td>
                    <td className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(row.created_at)}
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <span className="text-truncate d-block" title={row.description}>
                        {row.description || '—'}
                      </span>
                    </td>
                    <td className="text-center">
                      {row.type === 'debit' ? (
                        <span className="badge rounded-pill" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                          ↓ Debit
                        </span>
                      ) : (
                        <span className="badge rounded-pill" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                          ↑ Credit
                        </span>
                      )}
                    </td>
                    <td className="text-end fw-semibold">
                      <span style={{ color: row.type === 'debit' ? '#dc2626' : '#16a34a' }}>
                        {row.type === 'debit' ? '−' : '+'}{row.amount}
                      </span>
                    </td>
                    <td className="text-end pe-3 fw-bold text-primary">
                      {row.balance_after}
                    </td>
                    {isAdmin && (
                      <td>
                        {row.user_id ? (
                          <button
                            type="button"
                            onClick={() => openUserDetails(row.user_id)}
                            className="badge bg-light text-primary border fw-normal text-decoration-none btn p-1 px-2"
                            style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                            title="Click to view and edit user details"
                          >
                            👤 {row.profiles?.name ?? '—'}
                          </button>
                        ) : (
                          <span className="badge bg-light text-dark border fw-normal">
                            👤 {row.profiles?.name ?? '—'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top bg-light">
            <span className="small text-muted">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} records
            </span>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >‹ Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="btn btn-sm disabled text-muted">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >Next ›</button>
            </div>
          </div>
        )}
        {/* ── User Details Modal ── */}
        {modalLoading && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-center py-4">
                <div className="spinner-border text-primary mx-auto mb-2" role="status" />
                <p className="mb-0 text-muted">Loading user details...</p>
              </div>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit User Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedUser(null)}
                  />
                </div>

                <div className="modal-body">
                  <label className="form-label fw-bold">Name</label>
                  <input
                    className="form-control mb-2"
                    value={selectedUser.name || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, name: e.target.value })
                    }
                  />

                  <label className="form-label fw-bold">Email</label>
                  <input
                    type="email"
                    disabled
                    className="form-control mb-2 bg-light text-muted"
                    value={selectedUser.email || ""}
                  />

                  <label className="form-label fw-bold">Mobile</label>
                  <input
                    className="form-control mb-2"
                    value={selectedUser.mobile || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, mobile: e.target.value })
                    }
                  />

                  <label className="form-label fw-bold">Address</label>
                  <textarea
                    className="form-control mb-2"
                    value={selectedUser.address || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, address: e.target.value })
                    }
                  />

                  <div className="input-group mb-2">
                    <span className="input-group-text">Center Name</span>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedUser.center_name || ""}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, center_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="input-group mb-2">
                    <span className="input-group-text">Balance Points</span>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedUser.balance_points || 0}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          balance_points: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedUser(null)}
                    disabled={savingUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={updateSelectedUser}
                    disabled={savingUser}
                  >
                    {savingUser ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
