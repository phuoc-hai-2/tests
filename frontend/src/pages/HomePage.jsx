import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/productApi";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProducts({ limit: 8, sort: "rating" });
        setProducts(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="ds-hero text-white mb-5">
        <div
          className="container text-center"
          style={{ position: "relative", zIndex: 1 }}
        >
          <span
            className="badge bg-white text-primary fw-bold mb-3 px-3 py-2"
            style={{ fontSize: "0.85rem" }}
          >
            🔥 Nền tảng #1 Việt Nam
          </span>
          <h1>Digital Store</h1>
          <p className="mb-4">
            Mua sắm sản phẩm số, tài khoản &amp; phần mềm online uy tín
          </p>
          <Link to="/products" className="btn btn-light btn-lg px-5 py-3">
            Khám phá ngay →
          </Link>
        </div>
      </div>
      <div className="container pb-5">
        <h3 className="ds-section-title">Sản phẩm nổi bật</h3>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border"></div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
        <div className="text-center mt-5">
          <Link to="/products" className="btn btn-outline-primary btn-lg px-5">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
