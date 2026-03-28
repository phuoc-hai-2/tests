import { useEffect, useState } from 'react';
import { getAdminReviews, toggleHideReview, adminDeleteReview, replyReview } from '../../api/adminApi';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter === 'hidden') params.isHidden = true;
      const { data } = await getAdminReviews(params);
      setReviews(data.reviews);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filter]);

  const handleToggleHide = async (id) => {
    try {
      await toggleHideReview(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá đánh giá?')) return;
    try {
      await adminDeleteReview(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await replyReview(replyModal._id, replyText);
      setReplyModal(null);
      setReplyText('');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div>
      <h3 className="ds-section-title mb-4">Quản lý đánh giá</h3>

      <select className="form-select mb-3" style={{ width: 200 }} value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
        <option value="">Tất cả</option>
        <option value="hidden">Đã ẩn</option>
      </select>

      {loading ? <div className="text-center py-5"><div className="spinner-border"></div></div> : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Sản phẩm</th>
                <th>Người đánh giá</th>
                <th>Rating</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Admin Reply</th>
                <th>Ngày</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r._id}>
                  <td>{r.product?.name || '—'}</td>
                  <td>{r.user?.name || '—'}</td>
                  <td className="text-warning">{renderStars(r.rating)}</td>
                  <td style={{ maxWidth: 200 }}>
                    <small>{r.comment?.substring(0, 80)}{r.comment?.length > 80 ? '...' : ''}</small>
                  </td>
                  <td>
                    {r.isHidden ? <span className="badge bg-secondary">Ẩn</span> : <span className="badge bg-success">Hiện</span>}
                  </td>
                  <td><small>{r.adminReply || '—'}</small></td>
                  <td><small>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</small></td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className={`btn ${r.isHidden ? 'btn-outline-success' : 'btn-outline-secondary'}`} onClick={() => handleToggleHide(r._id)}>
                        {r.isHidden ? 'Hiện' : 'Ẩn'}
                      </button>
                      <button className="btn btn-outline-primary" onClick={() => { setReplyModal(r); setReplyText(r.adminReply || ''); }}>
                        Reply
                      </button>
                      <button className="btn btn-outline-danger" onClick={() => handleDelete(r._id)}>Xoá</button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && <tr><td colSpan={8} className="text-center text-muted">Không có đánh giá</td></tr>}
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

      {replyModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Trả lời đánh giá</h5>
                <button className="btn-close" onClick={() => { setReplyModal(null); setReplyText(''); }}></button>
              </div>
              <div className="modal-body">
                <p><strong>{replyModal.user?.name}</strong>: {replyModal.comment}</p>
                <div className="mb-3">
                  <label className="form-label">Phản hồi Admin</label>
                  <textarea className="form-control" rows="3" value={replyText} onChange={e => setReplyText(e.target.value)}></textarea>
                </div>
                <button className="btn btn-primary" onClick={handleReply}>Gửi phản hồi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
