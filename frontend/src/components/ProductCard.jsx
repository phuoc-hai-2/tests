import { Link } from "react-router-dom";
import StarRating from "./StarRating";

export default function ProductCard({ product }) {
  const minPrice =
    product.variants?.length > 0
      ? Math.min(...product.variants.map((v) => v.price))
      : 0;

  return (
    <div className="col">
      <div className="ds-card h-100">
        <div style={{ overflow: "hidden" }}>
          <img
            src={
              product.images?.[0]
                ? `http://localhost:5000${product.images[0]}`
                : "https://via.placeholder.com/300x200?text=No+Image"
            }
            className="card-img-top"
            alt={product.name}
            style={{ height: "220px", objectFit: "cover" }}
          />
        </div>
        <div className="card-body d-flex flex-column">
          <h6 className="card-title mb-2">{product.name}</h6>
          <div className="mb-2">
            <StarRating rating={product.averageRating} />
            <small className="text-muted ms-1">({product.numReviews})</small>
          </div>
          <p className="ds-price mt-auto mb-3">
            Từ {minPrice.toLocaleString("vi-VN")}₫
          </p>
          <Link
            to={`/products/${product.slug}`}
            className="btn btn-primary btn-sm w-100"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
