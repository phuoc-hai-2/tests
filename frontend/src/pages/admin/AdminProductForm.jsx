import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  updateProduct,
  getCategories,
} from "../../api/adminApi";
import API from "../../api/axios";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    isActive: true,
    tags: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [variants, setVariants] = useState([
    { name: "", price: "", duration: "" },
  ]);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => {});
    if (isEdit) {
      API.get(`/products/detail/${id}`)
        .then(({ data }) => {
          setForm({
            name: data.name || "",
            description: data.description || "",
            category: data.category?._id || data.category || "",
            isActive: data.isActive !== false,
            tags: (data.tags || []).join(", "),
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
          });
          setVariants(
            data.variants?.length
              ? data.variants.map((v) => ({
                  name: v.name,
                  price: v.price,
                  duration: v.duration || "",
                }))
              : [{ name: "", price: "", duration: "" }],
          );
        })
        .catch(() => setError("Không tìm thấy sản phẩm"));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVariantChange = (idx, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    );
  };

  const addVariant = () =>
    setVariants((prev) => [...prev, { name: "", price: "", duration: "" }]);
  const removeVariant = (idx) =>
    setVariants((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("isActive", form.isActive);
      fd.append("metaTitle", form.metaTitle);
      fd.append("metaDescription", form.metaDescription);
      fd.append("tags", form.tags);
      const filteredVariants = variants.filter((v) => v.name && v.price);
      if (filteredVariants.some((v) => Number(v.price) < 0)) {
        setError("Giá sản phẩm phải >= 0");
        setLoading(false);
        return;
      }
      fd.append("variants", JSON.stringify(filteredVariants));

      if (images) {
        for (let i = 0; i < images.length; i++) {
          fd.append("images", images[i]);
        }
      }

      if (isEdit) {
        await updateProduct(id, fd);
      } else {
        await createProduct(fd);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi lưu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">{isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-8">
            <div className="card mb-3">
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="6"
                    value={form.description}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="card mb-3">
              <div className="card-body">
                <h6>Variants (gói sản phẩm)</h6>
                {variants.map((v, i) => (
                  <div key={i} className="row g-2 mb-2 align-items-end">
                    <div className="col">
                      <input
                        className="form-control"
                        placeholder="Tên variant"
                        value={v.name}
                        onChange={(e) =>
                          handleVariantChange(i, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="col">
                      <input
                        className="form-control"
                        placeholder="Giá (VND)"
                        type="number"
                        min="0"
                        value={v.price}
                        onChange={(e) =>
                          handleVariantChange(i, "price", e.target.value)
                        }
                      />
                    </div>
                    <div className="col">
                      <input
                        className="form-control"
                        placeholder="Thời hạn"
                        value={v.duration}
                        onChange={(e) =>
                          handleVariantChange(i, "duration", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-auto">
                      {variants.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeVariant(i)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={addVariant}
                >
                  + Thêm variant
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Danh mục</label>
                  <select
                    className="form-select"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Ảnh sản phẩm</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(e.target.files)}
                  />
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    id="isActive"
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Hiển thị
                  </label>
                </div>
              </div>
            </div>

            <div className="card mb-3">
              <div className="card-body">
                <h6>SEO & Tags</h6>
                <div className="mb-3">
                  <label className="form-label">
                    Tags (cách nhau bởi dấu phẩy)
                  </label>
                  <input
                    className="form-control"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Meta Title</label>
                  <input
                    className="form-control"
                    name="metaTitle"
                    value={form.metaTitle}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Meta Description</label>
                  <textarea
                    className="form-control"
                    name="metaDescription"
                    rows="2"
                    value={form.metaDescription}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo sản phẩm"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
