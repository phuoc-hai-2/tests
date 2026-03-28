import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductBySlug } from '../api/productApi';
import { getProductReviews } from '../api/reviewApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProductBySlug(slug);
        setProduct(data);
        if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
        if (data.images?.length > 0) setMainImage(data.images[0]);
        const reviewRes = await getProductReviews(data._id);
        setReviews(reviewRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      await addToCart(product._id, selectedVariant, 1);
      setAddedMsg('Đã thêm vào giỏ hàng!');
      setTimeout(() => setAddedMsg(''), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  if (!product) return <div className="container py-5"><p>Sản phẩm không tồn tại.</p></div>;

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-5 mb-4">
          <div className="ds-product-image">
            <img
              src={mainImage ? `http://localhost:5000${mainImage}` : 'https://via.placeholder.com/500x400?text=No+Image'}
              className="img-fluid w-100"
              alt={product.name}
              style={{ objectFit: 'cover', maxHeight: '420px' }}
            />
          </div>
          <div className="d-flex gap-2 flex-wrap mt-3">
            {product.images?.map((img, i) => (
              <div
                key={i}
                className={`ds-thumb ${mainImage === img ? 'active' : ''}`}
                onClick={() => setMainImage(img)}
              >
                <img
                  src={`http://localhost:5000${img}`}
                  width={60}
                  height={60}
                  style={{ objectFit: 'cover', display: 'block' }}
                  alt=""
                />
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-7">
          <h2 style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>{product.name}</h2>
          <div className="mb-2">
            <StarRating rating={product.averageRating} />
            <span className="ms-2 text-muted">({product.numReviews} đánh giá)</span>
          </div>
          <span className="badge bg-primary bg-opacity-10 text-primary mb-3" style={{ fontSize: '0.8rem' }}>{product.category?.name}</span>
          <p className="mb-3" style={{ whiteSpace: 'pre-wrap', color: 'var(--gray-600)' }}>{product.description}</p>
          <h6 style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)', fontSize: '0.8rem' }}>Chọn gói</h6>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {product.variants?.map(v => (
              <button
                key={v._id}
                className={`ds-variant-btn ${selectedVariant?._id === v._id ? 'active' : ''}`}
                onClick={() => setSelectedVariant(v)}
              >
                {v.name} - {v.price.toLocaleString('vi-VN')} ₫
              </button>
            ))}
          </div>
          {selectedVariant && (
            <div className="ds-price mb-3" style={{ fontSize: '1.5rem' }}>{selectedVariant.price.toLocaleString('vi-VN')} ₫</div>
          )}
          {user ? (
            <button className="btn btn-success btn-lg" onClick={handleAddToCart}>
              🛒 Thêm vào giỏ hàng
            </button>
          ) : (
            <a href="/login" className="btn btn-outline-primary btn-lg">Đăng nhập để mua</a>
          )}
          {addedMsg && <div className="alert alert-success mt-3">{addedMsg}</div>}
        </div>
      </div>

      <hr className="my-4" style={{ borderColor: 'var(--gray-200)' }} />
      <h4 className="ds-section-title">Đánh giá ({reviews.length})</h4>
      {reviews.length === 0 ? (
        <p className="text-muted">Chưa có đánh giá nào.</p>
      ) : (
        reviews.map(r => (
          <div key={r._id} className="ds-review-card mb-3">
            <div className="d-flex align-items-center mb-2">
              <strong className="me-2">{r.user?.name}</strong>
              <StarRating rating={r.rating} size="0.9rem" />
                <small className="text-muted ms-2">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</small>
              </div>
              <p>{r.comment}</p>
              {r.images?.length > 0 && (
                <div className="d-flex gap-2">
                  {r.images.map((img, i) => (
                    <img key={i} src={`http://localhost:5000${img}`} width={80} height={80} className="rounded" style={{ objectFit: 'cover' }} alt="" />
                  ))}
                </div>
              )}
              {r.adminReply && (
                <div className="bg-light p-2 rounded mt-2 border-start border-3 border-primary">
                  <small className="fw-bold text-primary">Admin trả lời:</small>
                  <p className="mb-0 small">{r.adminReply}</p>
                </div>
              )}
          </div>
        ))
      )}
    </div>
  );
}
