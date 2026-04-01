import { useEffect, useState } from "react";
import {
  createAdminUser,
  getAdminUserDetail,
  getAdminUsers,
  toggleBanUser,
  updateAdminUser,
} from "../../api/adminApi";

const defaultForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "user",
  isBanned: false,
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async (nextPage = page, nextSearch = search) => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers({
        page: nextPage,
        limit: 15,
        keyword: nextSearch,
      });
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, search);
  }, [page]);

  const resetFormState = () => {
    setForm(defaultForm);
    setFormError("");
    setEditingUserId(null);
    setShowForm(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const nextPage = 1;
    setPage(nextPage);
    await load(nextPage, search);
  };

  const handleBan = async (id) => {
    if (!window.confirm("Xác nhận ban/unban người dùng?")) return;
    try {
      await toggleBanUser(id);
      await load();
      if (detail?.user?._id === id) {
        await viewDetail(id);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Loi");
    }
  };

  const viewDetail = async (id) => {
    try {
      const { data } = await getAdminUserDetail(id);
      setDetail(data);
    } catch (err) {
      alert("Loi tai thong tin");
    }
  };

  const openCreateForm = () => {
    setEditingUserId(null);
    setForm(defaultForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditingUserId(user._id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "user",
      isBanned: Boolean(user.isBanned),
    });
    setFormError("");
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Vui long nhap day du ten va email.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        isBanned: form.isBanned,
      };
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (editingUserId) {
        await updateAdminUser(editingUserId, payload);
      } else {
        await createAdminUser(payload);
      }

      await load();
      if (detail?.user?._id === editingUserId) {
        await viewDetail(editingUserId);
      }
      resetFormState();
    } catch (err) {
      setFormError(err.response?.data?.message || "Loi luu user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h3 className="ds-section-title mb-0">Quản lý người dùng</h3>
        <button className="btn btn-primary" onClick={openCreateForm}>
          Thêm user
        </button>
      </div>

      <form
        onSubmit={handleSearch}
        className="input-group mb-3"
        style={{ maxWidth: 400 }}
      >
        <input
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm email, tên..."
        />
        <button className="btn btn-outline-secondary">Tìm</button>
      </form>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Avatar</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Ngày DK</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    {u.avatar ? (
                      <img
                        src={`http://localhost:5000${u.avatar}`}
                        alt=""
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span className="badge bg-secondary">N/A</span>
                    )}
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${u.role === "admin" ? "bg-danger" : "bg-primary"}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.isBanned ? (
                      <span className="badge bg-danger">Banned</span>
                    ) : (
                      <span className="badge bg-success">Active</span>
                    )}
                  </td>
                  <td>
                    <small>
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </small>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => viewDetail(u._id)}
                    >
                      Chi tiết
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => openEditForm(u)}
                    >
                      Sửa
                    </button>
                    {u.role !== "admin" && (
                      <button
                        className={`btn btn-sm ${u.isBanned ? "btn-outline-success" : "btn-outline-danger"}`}
                        onClick={() => handleBan(u._id)}
                      >
                        {u.isBanned ? "Unban" : "Ban"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    Không có người dùng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${page === i + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {showForm && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUserId ? "Sua user" : "Them user"}
                </h5>
                <button className="btn-close" onClick={resetFormState}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger">{formError}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Ten</label>
                    <input
                      className="form-control"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      className="form-control"
                      name="phone"
                      value={form.phone}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      name="role"
                      value={form.role}
                      onChange={handleFormChange}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mat khau</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={form.password}
                      onChange={handleFormChange}
                      placeholder={
                        editingUserId
                          ? "Nhap neu muon doi mat khau"
                          : "Nhap mat khau"
                      }
                    />
                  </div>
                  <div className="form-check">
                    <input
                      id="isBanned"
                      type="checkbox"
                      className="form-check-input"
                      name="isBanned"
                      checked={form.isBanned}
                      onChange={handleFormChange}
                    />
                    <label className="form-check-label" htmlFor="isBanned">
                      Khoá tài khoản
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetFormState}
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? "Dang luu..."
                      : editingUserId
                        ? "Cap nhat"
                        : "Tao user"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiet: {detail.user?.name}</h5>
                <button
                  className="btn-close"
                  onClick={() => setDetail(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p>
                      <strong>Email:</strong> {detail.user?.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {detail.user?.phone || "-"}
                    </p>
                    <p>
                      <strong>Role:</strong> {detail.user?.role}
                    </p>
                    <p>
                      <strong>Banned:</strong>{" "}
                      {detail.user?.isBanned ? "Co" : "Khong"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Tổng đơn:</strong> {detail.orders?.length || 0}
                    </p>
                    <p>
                      <strong>Tổng chi tiêu:</strong>{" "}
                      {(detail.totalSpent || 0).toLocaleString("vi-VN")} VND
                    </p>
                    <p>
                      <strong>Ngày DK:</strong>{" "}
                      {new Date(detail.user?.createdAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </p>
                  </div>
                </div>

                <h6>Đơn hàng gần đây</h6>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Tổng</th>
                      <th>Trạng thái</th>
                      <th>Ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.orders?.slice(0, 10).map((o) => (
                      <tr key={o._id}>
                        <td>
                          <small>{o._id.slice(-8)}</small>
                        </td>
                        <td>{o.totalPrice?.toLocaleString()} VND</td>
                        <td>
                          <span className="badge bg-secondary">{o.status}</span>
                        </td>
                        <td>
                          <small>
                            {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                          </small>
                        </td>
                      </tr>
                    ))}
                    {(!detail.orders || detail.orders.length === 0) && (
                      <tr>
                        <td colSpan={4} className="text-muted">
                          Chưa có đơn hàng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
