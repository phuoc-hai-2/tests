import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTickets } from '../api/ticketApi';

const statusColors = { open: 'primary', 'in-progress': 'warning', resolved: 'success', closed: 'secondary' };

export default function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTickets()
      .then(({ data }) => setTickets(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="ds-section-title mb-0">Hỗ trợ</h3>
        <Link to="/tickets/create" className="btn btn-primary">Tạo ticket mới</Link>
      </div>
      {tickets.length === 0 ? (
        <p className="text-muted">Chưa có yêu cầu hỗ trợ nào.</p>
      ) : (
        <div className="list-group">
          {tickets.map(t => (
            <Link key={t._id} to={`/tickets/${t._id}`} className="list-group-item list-group-item-action ds-list-item">
              <div className="d-flex justify-content-between">
                <h6 className="mb-1">{t.subject}</h6>
                <span className={`badge bg-${statusColors[t.status] || 'secondary'}`}>{t.status}</span>
              </div>
              <small className="text-muted">{new Date(t.createdAt).toLocaleString('vi-VN')}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
