import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/adminApi';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const typeIcons = {
    new_order: '🧾', new_user: '👤', new_ticket: '🎧',
    order_paid: '💰', new_review: '⭐',
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getNotifications({ page, limit: 20 });
      setNotifications(data.notifications);
      setTotalPages(data.pages);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="ds-section-title">Thông báo {unreadCount > 0 && <span className="badge bg-danger">{unreadCount} chưa đọc</span>}</h3>
        {unreadCount > 0 && (
          <button className="btn btn-outline-primary btn-sm" onClick={handleMarkAllRead}>Đánh dấu tất cả đã đọc</button>
        )}
      </div>

      {loading ? <div className="text-center py-5"><div className="spinner-border"></div></div> : (
        <div className="list-group">
          {notifications.map(n => (
            <div key={n._id} className={`list-group-item list-group-item-action ${!n.isRead ? 'list-group-item-light border-start border-primary border-3' : ''}`}
              style={{ cursor: 'pointer' }} onClick={() => !n.isRead && handleMarkRead(n._id)}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="me-2">{typeIcons[n.type] || '🔔'}</span>
                  <strong>{n.title}</strong>
                  {!n.isRead && <span className="badge bg-primary ms-2">Mới</span>}
                  <p className="mb-0 text-muted">{n.message}</p>
                </div>
                <small className="text-muted text-nowrap ms-3">{new Date(n.createdAt).toLocaleString('vi-VN')}</small>
              </div>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-center text-muted py-4">Không có thông báo</p>}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
