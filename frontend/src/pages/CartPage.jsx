import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderApi';
import { useState } from 'react';

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const [processing, setProcessing] = useState(false);

  const totalPrice = cart?.items?.reduce((sum, item) => sum + item.variant.price * item.quantity, 0) || 0;

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const { data } = await createOrder();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi tạo đơn hàng');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-4">
      <h3 className="ds-section-title">Giỏ hàng</h3>
      {!cart?.items?.length ? (
        <div className="text-center py-5">
          <p className="text-muted">Giỏ hàng trống</p>
          <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-8">
            {cart.items.map(item => (
              <div key={item._id} className="card mb-3">
                <div className="card-body d-flex align-items-center">
                  <img
                    src={item.product?.images?.[0] ? `http://localhost:5000${item.product.images[0]}` : 'https://via.placeholder.com/80'}
                    width={80} height={80}
                    className="rounded me-3"
                    style={{ objectFit: 'cover' }}
                    alt=""
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">
                      <Link to={`/products/${item.product?.slug}`}>{item.product?.name}</Link>
                    </h6>
                    <small className="text-muted">Gói: {item.variant?.name}</small>
                    <div className="mt-1 fw-bold text-danger">
                      {(item.variant?.price * item.quantity).toLocaleString('vi-VN')} VND
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '70px' }}
                      min={1}
                      value={item.quantity}
                      onChange={e => updateItem(item._id, Number(e.target.value))}
                    />
                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeItem(item._id)}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5>Tổng cộng</h5>
                <h3 className="text-danger">{totalPrice.toLocaleString('vi-VN')} VND</h3>
                <button
                  className="btn btn-success w-100 mt-3"
                  onClick={handleCheckout}
                  disabled={processing}
                >
                  {processing ? 'Đang xử lý...' : 'Thanh toán VNPay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
