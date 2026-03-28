import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/orderApi';

const statusMap = {
  pending: { label: 'Chờ thanh toán', color: 'warning' },
  paid: { label: 'Đã thanh toán', color: 'info' },
  completed: { label: 'Hoàn thành', color: 'success' },
  failed: { label: 'Thất bại', color: 'danger' },
  cancelled: { label: 'Đã hủy', color: 'secondary' }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-4">
      <h3 className="ds-section-title">Đơn hàng của tôi</h3>
      {orders.length === 0 ? (
        <p className="text-muted">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><code>{o._id.slice(-8)}</code></td>
                  <td>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="text-danger fw-bold">{o.totalPrice.toLocaleString('vi-VN')} VND</td>
                  <td>
                    <span className={`badge bg-${statusMap[o.status]?.color || 'secondary'}`}>
                      {statusMap[o.status]?.label || o.status}
                    </span>
                  </td>
                  <td><Link to={`/orders/${o._id}`} className="btn btn-sm btn-outline-primary">Chi tiết</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
