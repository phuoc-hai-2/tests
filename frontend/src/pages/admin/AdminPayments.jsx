import { useEffect, useState } from 'react';
import { getTransactions, refundOrder } from '../../api/adminApi';

export default function AdminPayments() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [refundModal, setRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  const statusColors = { pending: 'warning', paid: 'primary', completed: 'success', failed: 'danger', cancelled: 'secondary', refunded: 'info' };

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (status) params.status = status;
      const { data } = await getTransactions(params);
      setTransactions(data.transactions);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status]);

  const handleRefund = async () => {
    if (!refundReason.trim()) return alert('Nhập lý do hoàn tiền');
    try {
      await refundOrder(refundModal._id, refundReason);
      setRefundModal(null);
      setRefundReason('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi hoàn tiền');
    }
  };

  return (
    <div>
      <h3 className="ds-section-title mb-4">Quản lý thanh toán</h3>

      <select className="form-select mb-3" style={{ width: 200 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
        <option value="">Tất cả</option>
        <option value="paid">Đã thanh toán</option>
        <option value="refunded">Đã hoàn</option>
        <option value="pending">Chờ TT</option>
        <option value="failed">Thất bại</option>
      </select>

      {loading ? <div className="text-center py-5"><div className="spinner-border"></div></div> : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>PT Thanh toán</th>
                <th>VNPay TX</th>
                <th>Trạng thái</th>
                <th>Ngày TT</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id}>
                  <td><small>{t._id.slice(-8)}</small></td>
                  <td>{t.user?.name || '—'}</td>
                  <td>{t.totalPrice?.toLocaleString('vi-VN')} VND</td>
                  <td>{t.paymentMethod}</td>
                  <td><small>{t.vnpayTransactionId || '—'}</small></td>
                  <td><span className={`badge bg-${statusColors[t.status] || 'secondary'}`}>{t.status}</span></td>
                  <td><small>{t.paidAt ? new Date(t.paidAt).toLocaleDateString('vi-VN') : '—'}</small></td>
                  <td>
                    {(t.status === 'paid' || t.status === 'completed') && (
                      <button className="btn btn-sm btn-outline-warning" onClick={() => setRefundModal(t)}>Hoàn tiền</button>
                    )}
                    {t.status === 'refunded' && <small className="text-muted">{t.refundReason}</small>}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={8} className="text-center text-muted">Không có giao dịch</td></tr>}
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

      {refundModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Hoàn tiền đơn #{refundModal._id.slice(-8)}</h5>
                <button className="btn-close" onClick={() => { setRefundModal(null); setRefundReason(''); }}></button>
              </div>
              <div className="modal-body">
                <p>Số tiền: <strong>{refundModal.totalPrice?.toLocaleString()} VND</strong></p>
                <div className="mb-3">
                  <label className="form-label">Lý do hoàn tiền *</label>
                  <textarea className="form-control" rows="3" value={refundReason} onChange={e => setRefundReason(e.target.value)}></textarea>
                </div>
                <button className="btn btn-warning" onClick={handleRefund}>Xác nhận hoàn tiền</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
