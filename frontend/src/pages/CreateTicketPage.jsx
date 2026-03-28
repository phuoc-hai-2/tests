import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../api/ticketApi';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await createTicket(form);
      navigate(`/tickets/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo ticket thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 d-flex justify-content-center">
    <div className="ds-auth-card" style={{ maxWidth: '600px', width: '100%' }}>
      <h3 className="ds-section-title">Tạo yêu cầu hỗ trợ</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Tiêu đề</label>
          <input type="text" className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Mô tả chi tiết</label>
          <textarea className="form-control" rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Mức độ ưu tiên</label>
          <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
          </select>
        </div>
        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </form>
    </div>
    </div>
  );
}
