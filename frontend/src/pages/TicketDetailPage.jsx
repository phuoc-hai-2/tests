import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTicketById } from '../api/ticketApi';
import { getMessages, sendMessage, markAsRead } from '../api/chatApi';
import { useAuth } from '../context/AuthContext';

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const loadData = async () => {
    try {
      const [ticketRes, msgRes] = await Promise.all([getTicketById(id), getMessages(id)]);
      setTicket(ticketRes.data);
      setMessages(msgRes.data);
      await markAsRead(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await getMessages(id);
        setMessages(data);
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await sendMessage({ ticketId: id, text });
      setMessages(prev => [...prev, data]);
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  if (!ticket) return <div className="container py-5"><p>Ticket không tồn tại.</p></div>;

  return (
    <div className="container py-4">
      <h4 className="ds-section-title">{ticket.subject}</h4>
      <p className="text-muted">{ticket.description}</p>
      <span className={`badge bg-${ticket.status === 'open' ? 'primary' : ticket.status === 'resolved' ? 'success' : 'warning'} mb-3`}>
        {ticket.status}
      </span>

      <div className="ds-chat-card" style={{ height: '400px' }}>
        <div className="card-body overflow-auto">
          {messages.map(m => (
            <div key={m._id} className={`mb-3 d-flex ${m.sender?._id === user?._id ? 'justify-content-end' : 'justify-content-start'}`}>
              <div className={`ds-chat-bubble ${m.sender?._id === user?._id ? 'mine' : 'other'}`}>
                <small className="fw-bold d-block">
                  {m.sender?.name} {m.sender?.role === 'admin' ? '(Admin)' : ''}
                </small>
                <span>{m.text}</span>
                <small className="d-block text-end opacity-75" style={{ fontSize: '0.7rem' }}>
                  {new Date(m.createdAt).toLocaleTimeString('vi-VN')}
                </small>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {ticket.status !== 'closed' && (
        <form onSubmit={handleSend} className="mt-3 d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Gửi</button>
        </form>
      )}
    </div>
  );
}
