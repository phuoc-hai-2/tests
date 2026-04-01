import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { getNotifications } from "../../api/adminApi";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    getNotifications({ limit: 1 })
      .then(({ data }) => setUnread(data.unreadCount))
      .catch(() => {});
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { to: "/admin", label: "Dashboard", icon: "📊" },
    { to: "/admin/products", label: "Sản phẩm", icon: "📦" },
    { to: "/admin/categories", label: "Danh mục", icon: "🏷️" },
    { to: "/admin/orders", label: "Đơn hàng", icon: "🧾" },
    { to: "/admin/users", label: "Người dùng", icon: "👥" },
    { to: "/admin/payments", label: "Thanh toán", icon: "💰" },
    { to: "/admin/reviews", label: "Đánh giá", icon: "⭐" },
    { to: "/admin/tickets", label: "Hỗ trợ", icon: "🎧" },
    {
      to: "/admin/notifications",
      label: `Thông báo ${unread > 0 ? `(${unread})` : ""}`,
      icon: "🔔",
    },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <div
        className="ds-admin-sidebar"
        style={{ width: "260px", flexShrink: 0 }}
      >
        <div
          className="px-3 pb-3 mb-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <h5 className="mb-0 text-white fw-bold">Admin Panel</h5>
          <small style={{ color: "rgba(255,255,255,0.5)" }}>{user?.name}</small>
        </div>
        <div className="sidebar-label">Menu chính</div>
        <nav className="nav flex-column">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {link.icon} {link.label}
            </NavLink>
          ))}
        </nav>
        <div
          className="px-3 mt-4"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "1rem",
          }}
        >
          {/* <a
            href="/"
            className="btn btn-outline-light btn-sm w-100 mb-2"
            style={{
              borderColor: "rgba(255,255,255,0.2)",
              fontSize: "0.85rem",
            }}
          >
            ← Về trang chủ
          </a> */}
          <button
            className="btn btn-sm w-100"
            onClick={handleLogout}
            style={{
              background: "rgba(239,68,68,0.15)",
              color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.3)",
              fontSize: "0.85rem",
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
      <div className="flex-grow-1" style={{ background: "var(--gray-50)" }}>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
