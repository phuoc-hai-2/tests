import { useEffect, useState } from 'react';
import { getAdminUsers, getAdminUserDetail, toggleBanUser } from '../../api/adminApi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers({ page, limit: 15, keyword: search });
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleBan = async (id) => {
    if (!window.confirm('Xác nhận ban/unban người dùng?')) return;
    try {
      await toggleBanUser(id);
      load();
      if (detail?._id === id) viewDetail(id);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const viewDetail = async (id) => {
    try {
      const { data } = await getAdminUserDetail(id);
      setDetail(data);
    } catch (err) {
      alert('Lỗi tải thông tin');
    }
  };

  return (
    <div>
      <h3 className="ds-section-title mb-4">Quản lý người dùng</h3>

      <form onSubmit={handleSearch} className="input-group mb-3" style={{ maxWidth: 400 }}>
        <input className="form-control" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm email, tên..." />
        <button className="btn btn-outline-secondary">Tìm</button>
      </form>

      {loading ? <div className="text-center py-5"><div className="spinner-border"></div></div> : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Avatar</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Ngày ĐK</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    {u.avatar ? (
                      <img src={`http://localhost:5000${u.avatar}`} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : <span className="badge bg-secondary">N/A</span>}
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>{u.role}</span></td>
                  <td>
                    {u.isBanned ? <span className="badge bg-danger">Banned</span> : <span className="badge bg-success">Active</span>}
                  </td>
                  <td><small>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</small></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => viewDetail(u._id)}>Chi tiết</button>
                    {u.role !== 'admin' && (
                      <button className={`btn btn-sm ${u.isBanned ? 'btn-outline-success' : 'btn-outline-danger'}`} onClick={() => handleBan(u._id)}>
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={7} className="text-center text-muted">Không có người dùng</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {detail && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết: {detail.user?.name}</h5>
                <button className="btn-close" onClick={() => setDetail(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p><strong>Email:</strong> {detail.user?.email}</p>
                    <p><strong>Phone:</strong> {detail.user?.phone || '—'}</p>
                    <p><strong>Role:</strong> {detail.user?.role}</p>
                    <p><strong>Banned:</strong> {detail.user?.isBanned ? 'Có' : 'Không'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Tổng đơn:</strong> {detail.orders?.length || 0}</p>
                    <p><strong>Tổng chi tiêu:</strong> {(detail.totalSpent || 0).toLocaleString('vi-VN')} VND</p>
                    <p><strong>Ngày ĐK:</strong> {new Date(detail.user?.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                <h6>Đơn hàng gần đây</h6>
                <table className="table table-sm">
                  <thead><tr><th>Mã</th><th>Tổng</th><th>Trạng thái</th><th>Ngày</th></tr></thead>
                  <tbody>
                    {detail.orders?.slice(0, 10).map(o => (
                      <tr key={o._id}>
                        <td><small>{o._id.slice(-8)}</small></td>
                        <td>{o.totalPrice?.toLocaleString()} VND</td>
                        <td><span className="badge bg-secondary">{o.status}</span></td>
                        <td><small>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</small></td>
                      </tr>
                    ))}
                    {(!detail.orders || detail.orders.length === 0) && <tr><td colSpan={4} className="text-muted">Chưa có đơn</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
