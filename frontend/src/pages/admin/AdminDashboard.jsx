import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getStats, getRevenueChart, getUserGrowth, getTopProducts } from '../../api/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [topProducts, setTopProducts] = useState({ topSelling: [], topViewed: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r, u, t] = await Promise.all([
          getStats(), getRevenueChart(6), getUserGrowth(6), getTopProducts()
        ]);
        setStats(s.data);
        setRevenueData(r.data);
        setUserGrowthData(u.data);
        setTopProducts(t.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border"></div></div>;

  return (
    <div>
      <h3 className="ds-section-title">Dashboard</h3>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="ds-stat-card revenue">
            <h6>Tổng doanh thu</h6>
            <div className="stat-value">{(stats?.totalRevenue || 0).toLocaleString('vi-VN')}₫</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-stat-card users">
            <h6>Người dùng</h6>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-stat-card orders">
            <h6>Tổng đơn hàng</h6>
            <div className="stat-value">{stats?.totalOrders || 0}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-stat-card pending">
            <h6>Chờ xử lý</h6>
            <div className="stat-value">{stats?.pendingOrders || 0}</div>
            <small className="text-muted">Đã TT: {stats?.paidOrders} | HT: {stats?.completedOrders}</small>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6>Doanh thu & Đơn hàng theo tháng</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) =>
                    name === 'revenue' ? `${value.toLocaleString()} VND` : value
                  } />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#198754" name="Doanh thu" />
                  <Bar yAxisId="right" dataKey="orders" fill="#0d6efd" name="Đơn hàng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6>Tăng trưởng User</h6>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#0d6efd" name="User mới" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6>Top sản phẩm bán chạy</h6>
              <table className="table table-sm">
                <thead><tr><th>#</th><th>Sản phẩm</th><th>Đã bán</th><th>Doanh thu</th></tr></thead>
                <tbody>
                  {topProducts.topSelling.map((p, i) => (
                    <tr key={p._id}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.totalSold}</td>
                      <td>{p.revenue?.toLocaleString('vi-VN')} VND</td>
                    </tr>
                  ))}
                  {topProducts.topSelling.length === 0 && <tr><td colSpan={4} className="text-muted">Chưa có dữ liệu</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6>Top sản phẩm xem nhiều</h6>
              <table className="table table-sm">
                <thead><tr><th>#</th><th>Sản phẩm</th><th>Lượt xem</th></tr></thead>
                <tbody>
                  {topProducts.topViewed.map((p, i) => (
                    <tr key={p._id}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.viewCount || 0}</td>
                    </tr>
                  ))}
                  {topProducts.topViewed.length === 0 && <tr><td colSpan={3} className="text-muted">Chưa có dữ liệu</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
