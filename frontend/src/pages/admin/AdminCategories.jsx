import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/adminApi';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [
    editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await updateCategory(editId, form);
      } else {
        await createCategory(form);
      }
      setForm({ name: '', slug: '', description: '' });
      setEditId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi');
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, slug: cat.slug || '', description: cat.description || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá danh mục?')) return;
    try {
      await deleteCategory(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xoá');
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ name: '', slug: '', description: '' });
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;

  return (
    <div>
      <h3 className="ds-section-title">Quản lý danh mục</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h6>{editId ? 'Sửa danh mục' : 'Thêm danh mục'}</h6>
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <input className="form-control" placeholder="Tên danh mục *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="mb-2">
                  <input className="form-control" placeholder="Slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
                <div className="mb-2">
                  <textarea className="form-control" placeholder="Mô tả" rows="2" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}></textarea>
                </div>
                <button className="btn btn-primary btn-sm me-2">{editId ? 'Cập nhật' : 'Thêm'}</button>
                {editId && <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancel}>Huỷ</button>}
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Tên</th><th>Slug</th><th>Mô tả</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td><code>{c.slug}</code></td>
                  <td>{c.description || '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(c)}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c._id)}>Xoá</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={4} className="text-center text-muted">Chưa có danh mục</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
