import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../api/orderApi";
import { createReview } from "../api/reviewApi";

const statusMap = {
  pending: { label: "Chờ thanh toán", color: "warning" },
  paid: { label: "Đã thanh toán", color: "info" },
  completed: { label: "Hoàn thành", color: "success" },
  failed: { label: "Thất bại", color: "danger" },
  cancelled: { label: "Đã hủy", color: "secondary" },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState(null);
  const [reviewMsg, setReviewMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getOrderById(id)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border"></div>
      </div>
    );
  if (!order)
    return (
      <div className="container py-5">
        <p>Đơn hàng không tồn tại.</p>
      </div>
    );

  return (
    <div className="container py-4">
      <h3 className="ds-section-title">Chi tiết đơn hàng</h3>
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Mã đơn:</strong> {order._id}
              </p>
              <p>
                <strong>Ngày đặt:</strong>{" "}
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
              <p>
                <strong>Thanh toán:</strong>{" "}
                {order.paymentMethod?.toUpperCase()}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Trạng thái: </strong>
                <span className={`badge bg-${statusMap[order.status]?.color}`}>
                  {statusMap[order.status]?.label}
                </span>
              </p>
              {order.paidAt && (
                <p>
                  <strong>Thanh toán lúc:</strong>{" "}
                  {new Date(order.paidAt).toLocaleString("vi-VN")}
                </p>
              )}
              {order.completedAt && (
                <p>
                  <strong>Hoàn thành lúc:</strong>{" "}
                  {new Date(order.completedAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <h5>Sản phẩm đã mua</h5>
      <table className="table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Gói</th>
            <th>Giá</th>
          </tr>
        </thead>
        <tbody>
          {order.orderItems?.map((item, i) => (
            <tr key={i}>
              <td>
                <Link to={`/products/${item.product?.slug || ""}`}>
                  {item.productName}
                </Link>
              </td>
              <td>{item.variant?.name}</td>
              <td className="text-danger">
                {item.price?.toLocaleString("vi-VN")} VND
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="fw-bold">
              Tổng cộng
            </td>
            <td className="text-danger fw-bold">
              {order.totalPrice?.toLocaleString("vi-VN")} VND
            </td>
          </tr>
        </tfoot>
      </table>

      {order.status === "completed" && order.deliveryFile && (
        <div className="alert alert-success">
          <strong>File sản phẩm:</strong>{" "}
          <a
            href={`http://localhost:5000${order.deliveryFile}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-success ms-2"
          >
            Tải xuống
          </a>
        </div>
      )}

      {order.note && (
        <div className="alert alert-info">
          <strong>Ghi chú:</strong> {order.note}
        </div>
      )}

      {order.status === "completed" && (
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="mb-0">Đánh giá sản phẩm</h5>
          </div>
          <div className="card-body">
            {reviewMsg && <div className="alert alert-info">{reviewMsg}</div>}
            <p>Chọn sản phẩm để đánh giá:</p>
            <div className="d-flex gap-2 flex-wrap mb-3">
              {order.orderItems?.map((item, i) => (
                <button
                  key={i}
                  className={`btn ${reviewItem === i ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => {
                    setReviewItem(i);
                    setReviewMsg("");
                  }}
                >
                  {item.productName}
                </button>
              ))}
            </div>
            {reviewItem !== null && (
              <div>
                <div className="mb-3">
                  <label className="form-label">Rating</label>
                  <div className="d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        style={{
                          cursor: "pointer",
                          fontSize: "1.5rem",
                          color: s <= reviewRating ? "#ffc107" : "#ddd",
                        }}
                        onClick={() => setReviewRating(s)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nhận xét</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Ảnh (tuỳ chọn)</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={(e) => setReviewImages(e.target.files)}
                  />
                </div>
                <button
                  className="btn btn-success"
                  disabled={submitting}
                  onClick={async () => {
                    setSubmitting(true);
                    try {
                      const fd = new FormData();
                      fd.append(
                        "productId",
                        order.orderItems[reviewItem].product?._id ||
                          order.orderItems[reviewItem].product,
                      );
                      fd.append("orderId", order._id);
                      fd.append("rating", reviewRating);
                      fd.append("comment", reviewComment);
                      if (reviewImages) {
                        for (let i = 0; i < reviewImages.length; i++)
                          fd.append("images", reviewImages[i]);
                      }
                      await createReview(fd);
                      setReviewMsg("Đã gửi đánh giá! Cảm ơn bạn.");
                      setReviewItem(null);
                      setReviewComment("");
                      setReviewRating(5);
                      setReviewImages(null);
                    } catch (err) {
                      setReviewMsg(
                        err.response?.data?.message || "Lỗi gửi đánh giá",
                      );
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
