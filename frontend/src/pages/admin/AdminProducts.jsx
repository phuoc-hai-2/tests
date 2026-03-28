import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../api/adminApi";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getProducts({
        page,
        limit: 10,
        keyword: search,
        showAll: true,
      });
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá sản phẩm?")) return;
    try {
      await deleteProduct(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xoá sản phẩm");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="ds-section-title">Quản lý sản phẩm</h3>
        <Link to="/admin/products/create" className="btn btn-primary">
          + Thêm sản phẩm
        </Link>
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
          placeholder="Tìm sản phẩm..."
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
                <th style={{ width: 60 }}>Ảnh</th>
                <th>Tên</th>
                <th>Danh mục</th>
                <th>Variants</th>
                <th>Rating</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.images?.[0] ? (
                      <img
                        src={`http://localhost:5000${p.images[0]}`}
                        alt=""
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category?.name || "—"}</td>
                  <td>{p.variants?.length || 0}</td>
                  <td>
                    {p.averageRating?.toFixed(1) || "—"} ({p.numReviews})
                  </td>
                  <td>
                    <span
                      className={`badge ${p.isActive ? "bg-success" : "bg-secondary"}`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/admin/products/edit/${p._id}`}
                      className="btn btn-sm btn-outline-primary me-1"
                    >
                      Sửa
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(p._id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    Không có sản phẩm
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
    </div>
  );
}
