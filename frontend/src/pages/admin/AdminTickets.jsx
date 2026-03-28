import { useEffect, useState } from 'react';
import { getAllTickets, getTicketById, updateTicketStatus, getChatMessages, sendChatMessage } from '../../api/adminApi';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);

  const statusColors = { open: 'primary', 'in-progress': 'warning', resolved: 'success', closed: 'secondary' };
  const statusOptions = ['open', 'in-progress', 'resolved', 'closed'];

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllTickets({ page, limit: 15 });
      setTickets(data.tickets);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const openTicket = async (id) => {
    try {
      const { data: ticket } = await getTicketById(id);
      setActiveTicket(ticket);
      const { data: msgs } = await getChatMessages(id);
      setMessages(msgs);
    } catch (err) {
      alert('Lỗi tải ticket');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await sendChatMessage({ ticketId: activeTicket._id, text: msgText });
      setMsgText('');
      const { data: msgs } = await getChatMessages(activeTicket._id);
      setMessages(msgs);
    } catch (err) {
      alert('Lỗi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateTicketStatus(activeTicket._id, status);
      setActiveTicket(prev => ({ ...prev, status }));
      load();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <div>
      <h3 className="ds-section-title">Quản lý hỗ trợ</h3>

      <div className="row" style={{ minHeight: '70vh' }}>
        <div className="col-md-5">
          {loading ? <div className="text-center py-5"><div className="spinner-border"></div></div> : (
            <div className="list-group">
              {tickets.map(t => (
                <button key={t._id} className={`list-group-item list-group-item-action ${activeTicket?._id === t._id ? 'active' : ''}`}
                  onClick={() => openTicket(t._id)}>
                  <div className="d-flex justify-content-between">
                    <strong>{t.subject}</strong>
                    <span className={`badge bg-${statusColors[t.status]}`}>{t.status}</span>
                  </div>
                  <small className="d-block">{t.user?.name} • {new Date(t.createdAt).toLocaleDateString('vi-VN')}</small>
                  <small className="text-muted">{t.description?.substring(0, 60)}...</small>
                </button>
              ))}
              {tickets.length === 0 && <p className="text-muted text-center py-3">Không có ticket</p>}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-2">
              <ul className="pagination pagination-sm justify-content-center">
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="col-md-7">
          {activeTicket ? (
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>{activeTicket.subject}</strong>
                  <br /><small className="text-muted">{activeTicket.user?.name} | Priority: {activeTicket.priority}</small>
                </div>
                <select className="form-select form-select-sm" style={{ width: 150 }} value={activeTicket.status}
                  onChange={e => handleStatusChange(e.target.value)}>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="card-body" style={{ height: 400, overflowY: 'auto' }}>
                <div className="bg-light p-2 rounded mb-3">
                  <small className="text-muted">Mô tả ticket:</small>
                  <p className="mb-0">{activeTicket.description}</p>
                </div>
                {messages.map(m => (
                  <div key={m._id} className={`mb-2 d-flex ${m.sender?._id === activeTicket.user?._id ? 'justify-content-start' : 'justify-content-end'}`}>
                    <div className={`p-2 rounded ${m.sender?._id === activeTicket.user?._id ? 'bg-light' : 'bg-primary text-white'}`}
                      style={{ maxWidth: '75%' }}>
                      <small className="d-block fw-bold">{m.sender?.name}</small>
                      <span>{m.text}</span>
                      <small className="d-block opacity-75">{new Date(m.createdAt).toLocaleTimeString('vi-VN')}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-footer">
                <form onSubmit={handleSend} className="input-group">
                  <input className="form-control" value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Nhập tin nhắn..." />
                  <button className="btn btn-primary" disabled={sending}>Gửi</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              Chọn 1 ticket để xem chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
