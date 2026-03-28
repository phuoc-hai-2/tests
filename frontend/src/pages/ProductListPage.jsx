import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/productApi";
import { getCategories } from "../api/categoryApi";
import ProductCard from "../components/ProductCard";

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get("page")) || 1;
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const rating = searchParams.get("rating") || "";

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (keyword) params.keyword = keyword;
        if (category) params.category = category;
        if (sort) params.sort = sort;
        if (rating) params.rating = rating;
        const { data } = await getProducts(params);
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, keyword, category, sort, rating]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    setSearchParams(params);
  };

  return (
    <div className="container py-4">
      <h3 className="ds-section-title">Sản phẩm <small className="text-muted" style={{fontSize:'0.6em'}}>({total})</small></h3>
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="ds-filter-card">
              <h6>Tìm kiếm</h6>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Tên sản phẩm..."
                value={keyword}
                onChange={(e) => updateFilter("keyword", e.target.value)}
              />
              <h6>Danh mục</h6>
              <select
                className="form-select mb-3"
                value={category}
                onChange={(e) => updateFilter("category", e.target.value)}
              >
                <option value="">Tất cả</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <h6>Sắp xếp</h6>
              <select
                className="form-select mb-3"
                value={sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
              >
                <option value="">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="rating">Đánh giá cao</option>
              </select>
              <h6>Đánh giá tối thiểu</h6>
              <select
                className="form-select"
                value={rating}
                onChange={(e) => updateFilter("rating", e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="4">4 sao trở lên</option>
                <option value="3">3 sao trở lên</option>
                <option value="2">2 sao trở lên</option>
              </select>
          </div>
        </div>
        <div className="col-md-9">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border"></div>
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted">Không tìm thấy sản phẩm.</p>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {pages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <li
                        key={p}
                        className={`page-item ${p === page ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.set("page", p);
                            setSearchParams(params);
                          }}
                        >
                          {p}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
