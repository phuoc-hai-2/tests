import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const params = Object.fromEntries(searchParams.entries());
        const { data } = await API.get('/orders/vnpay-return', { params });
        setResult(data);
      } catch {
        setResult({ success: false, message: 'Xác minh thanh toán thất bại' });
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [searchParams]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-5">
      <div className="ds-result-card text-center">
      {result?.success ? (
        <div>
          <div className="ds-result-icon success">✓</div>
          <h2 style={{ fontWeight: 800, color: 'var(--success)' }} className="mb-3">Thanh toán thành công!</h2>
          <p className="text-muted mb-4">Đơn hàng <strong>#{result.order?._id}</strong> đã được thanh toán.</p>
          <Link to={`/orders/${result.order?._id}`} className="btn btn-primary me-2">Xem đơn hàng</Link>
          <Link to="/products" className="btn btn-outline-secondary">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div>
          <div className="ds-result-icon error">✕</div>
          <h2 style={{ fontWeight: 800, color: 'var(--danger)' }} className="mb-3">Thanh toán thất bại</h2>
          <p className="text-muted mb-4">{result?.message}</p>
          <Link to="/cart" className="btn btn-primary">Quay lại giỏ hàng</Link>
        </div>
      )}
      </div>
    </div>
  );
}
