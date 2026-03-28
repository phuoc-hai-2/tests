import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/userApi';

export default function ProfilePage() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [avatar, setAvatar] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(({ data }) => {
        setForm({ name: data.name, phone: data.phone || '', password: '' });
        setCurrentAvatar(data.avatar || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      if (form.password) formData.append('password', form.password);
      if (avatar) formData.append('avatar', avatar);
      const { data } = await updateProfile(formData);
      setUser(prev => ({ ...prev, name: data.name }));
      setCurrentAvatar(data.avatar || '');
      setMessage('Cập nhật thành công');
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-4" style={{ maxWidth: '550px' }}>
      <h3 className="ds-section-title">Hồ sơ cá nhân</h3>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="text-center mb-3">
        <img
          src={currentAvatar ? `http://localhost:5000${currentAvatar}` : 'https://via.placeholder.com/120?text=Avatar'}
          width={120} height={120}
          className="rounded-circle"
          style={{ objectFit: 'cover' }}
          alt="avatar"
        />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Họ tên</label>
          <input type="text" className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Số điện thoại</label>
          <input type="text" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Avatar</label>
          <input type="file" className="form-control" accept="image/*" onChange={e => setAvatar(e.target.files[0])} />
        </div>
        <div className="mb-3">
          <label className="form-label">Mật khẩu mới (để trống nếu không đổi)</label>
          <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} />
        </div>
        <button className="btn btn-primary w-100">Cập nhật</button>
      </form>
    </div>
  );
}
