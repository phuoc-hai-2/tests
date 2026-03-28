import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/adminApi';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [deliveryFile, setDeliveryFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const statusOptions = ['pending', 'paid', 'completed', 'failed', 'cancelled', 'refunded'];
  const statusColors = { pending: 'warning', paid: 'primary', completed: 'success', failed: 'danger', cancelled: 'secondary', refunded: 'info' };

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (status) params.status = status;
      const { data } = await getAllOrders(params);
      setOrders(data.orders);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      if (deliveryFile) fd.append('deliveryFile', deliveryFile);
      await updateOrderStatus(orderId, fd);
      setDetail(null);
      setDeliveryFile(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <h3 className="ds-section-title mb-4">Quản lý đơn hàng</h3>

      <div className="mb-3 d-flex gap-2">
        <select className="form-select" style={{ width: 200 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div className="text-center py-5"><div className="spinner-border"></div></div> : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><small>{o._id.slice(-8)}</small></td>
                  <td>{o.user?.name || '—'}</td>
                  <td>
                    {o.orderItems?.map((item, i) => (
                      <div key={i}><small>{item.productName} ({item.variant?.name})</small></div>
                    ))}
                  </td>
                  <td>{o.totalPrice?.toLocaleString('vi-VN')} VND</td>
                  <td><span className={`badge bg-${statusColors[o.status] || 'secondary'}`}>{o.status}</span></td>
                  <td><small>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</small></td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setDetail(o)}>Chi tiết</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="text-center text-muted">Không có đơn hàng</td></tr>}
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
                <h5 className="modal-title">Chi tiết đơn #{detail._id.slice(-8)}</h5>
                <button className="btn-close" onClick={() => { setDetail(null); setDeliveryFile(null); }}></button>
              </div>
              <div className="modal-body">
                <p><strong>Khách:</strong> {detail.user?.name} ({detail.user?.email})</p>
                <p><strong>Tổng tiền:</strong> {detail.totalPrice?.toLocaleString()} VND</p>
                <p><strong>PT Thanh toán:</strong> {detail.paymentMethod}</p>
                <p><strong>VNPay TX:</strong> {detail.vnpayTransactionId || '—'}</p>
                <p><strong>Ghi chú:</strong> {detail.note || '—'}</p>

                <h6>Sản phẩm</h6>
                <ul>
                  {detail.orderItems?.map((item, i) => (
                    <li key={i}>{item.productName} - {item.variant?.name} - {item.price?.toLocaleString()} VND</li>
                  ))}
                </ul>

                {detail.deliveryFile && (
                  <p><strong>File giao:</strong> <a href={`http://localhost:5000${detail.deliveryFile}`} target="_blank" rel="noreferrer">{detail.deliveryFile}</a></p>
                )}

                <hr />
                <h6>Cập nhật trạng thái</h6>
                <div className="mb-2">
                  <label className="form-label">File giao hàng (nếu completed)</label>
                  <input type="file" className="form-control" onChange={e => setDeliveryFile(e.target.files[0])} />
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {statusOptions.filter(s => s !== detail.status).map(s => (
                    <button key={s} className={`btn btn-sm btn-outline-${statusColors[s]}`} disabled={updating}
                      onClick={() => handleStatusUpdate(detail._id, s)}>
                      → {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
