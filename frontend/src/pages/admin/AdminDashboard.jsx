import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getRevenueChart,
  getStats,
  getTopProducts,
  getUserGrowth,
} from "../../api/adminApi";

const MONTH_OPTIONS = [3, 6, 9, 12];

const currencyLabel = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} VND`;
const formatCompactNumber = (value) => {
  const number = Number(value || 0);
  if (number >= 1000000000)
    return `${(number / 1000000000).toFixed(number % 1000000000 === 0 ? 0 : 1)}ty`;
  if (number >= 1000000)
    return `${(number / 1000000).toFixed(number % 1000000 === 0 ? 0 : 1)}tr`;
  if (number >= 1000)
    return `${(number / 1000).toFixed(number % 1000 === 0 ? 0 : 1)}k`;
  return `${number}`;
};
const getAxisMax = (data, key) => {
  const max = Math.max(...data.map((item) => Number(item[key] || 0)), 0);
  if (max <= 0) return 1;
  return Math.ceil(max * 1.15);
};

function ChartCard({
  title,
  subtitle,
  months,
  onMonthsChange,
  loading,
  children,
}) {
  return (
    <div className="card ds-chart-card h-100">
      <div className="card-body">
        <div className="ds-chart-toolbar">
          <div>
            <h6 className="ds-chart-title">{title}</h6>
            <p className="ds-chart-subtitle mb-0">{subtitle}</p>
          </div>

          <div className="ds-chart-filter">
            <label htmlFor={`${title}-months`} className="form-label mb-1">
              So thang
            </label>
            <select
              id={`${title}-months`}
              className="form-select form-select-sm"
              value={months}
              onChange={(e) => onMonthsChange(Number(e.target.value))}
            >
              {MONTH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} thang
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ds-chart-area">
          {loading ? (
            <div className="d-flex align-items-center justify-content-center h-100">
              <div className="spinner-border"></div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState({
    topSelling: [],
    topViewed: [],
  });
  const [revenueData, setRevenueData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [revenueMonths, setRevenueMonths] = useState(6);
  const [userGrowthMonths, setUserGrowthMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [userGrowthLoading, setUserGrowthLoading] = useState(true);
  const revenueAxisMax = getAxisMax(revenueData, "revenue");
  const ordersAxisMax = getAxisMax(revenueData, "orders");
  const usersAxisMax = getAxisMax(userGrowthData, "users");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [statsResponse, topProductsResponse] = await Promise.all([
          getStats(),
          getTopProducts(),
        ]);
        setStats(statsResponse.data);
        setTopProducts(topProductsResponse.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  useEffect(() => {
    const loadRevenueChart = async () => {
      setRevenueLoading(true);
      try {
        const { data } = await getRevenueChart(revenueMonths);
        setRevenueData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setRevenueLoading(false);
      }
    };

    loadRevenueChart();
  }, [revenueMonths]);

  useEffect(() => {
    const loadUserGrowthChart = async () => {
      setUserGrowthLoading(true);
      try {
        const { data } = await getUserGrowth(userGrowthMonths);
        setUserGrowthData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setUserGrowthLoading(false);
      }
    };

    loadUserGrowthChart();
  }, [userGrowthMonths]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="ds-section-title mb-2">Dashboard</h3>
          <p className="text-muted mb-0">
            Theo dõi doanh thu, dơn hàng và tăng trưởng người dùng theo từng
            giai đoạn.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="ds-stat-card revenue">
            <h6>Tổng doanh thu</h6>
            <div className="stat-value">
              {(stats?.totalRevenue || 0).toLocaleString("vi-VN")} VND
            </div>
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
            <h6>Cho xử lý</h6>
            <div className="stat-value">{stats?.pendingOrders || 0}</div>
            <small className="text-muted">
              Đã TT: {stats?.paidOrders || 0} | HT:{" "}
              {stats?.completedOrders || 0}
            </small>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <ChartCard
            title="Doanh thu theo tháng"
            months={revenueMonths}
            onMonthsChange={setRevenueMonths}
            loading={revenueLoading}
          >
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={revenueData}
                margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
                barCategoryGap="22%"
                barGap={8}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(100,116,139,0.18)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, revenueAxisMax]}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={formatCompactNumber}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, ordersAxisMax]}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px rgba(15,23,42,0.12)",
                  }}
                  formatter={(value, name) => [
                    name === "Doanh thu" ? currencyLabel(value) : value,
                    name,
                  ]}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Doanh thu"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={26}
                />
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  name="Don hang"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-lg-5">
          <ChartCard
            title="Tăng trưởng user"
            months={userGrowthMonths}
            onMonthsChange={setUserGrowthMonths}
            loading={userGrowthLoading}
          >
            <ResponsiveContainer width="100%" height={340}>
              <LineChart
                data={userGrowthData}
                margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(100,116,139,0.18)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, usersAxisMax]}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px rgba(15,23,42,0.12)",
                  }}
                  formatter={(value) => [`${value} user`, "User moi"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="User moi"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#4f46e5" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6>Top sản phẩm bán chạy</h6>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>ản phẩm</th>
                    <th>Đã bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.topSelling.map((p, i) => (
                    <tr key={p._id}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.totalSold}</td>
                      <td>{currencyLabel(p.revenue)}</td>
                    </tr>
                  ))}
                  {topProducts.topSelling.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-muted">
                        Chua co du lieu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6>Top sản phẩm xem nhiều</h6>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>Lượt xem</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.topViewed.map((p, i) => (
                    <tr key={p._id}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.viewCount || 0}</td>
                    </tr>
                  ))}
                  {topProducts.topViewed.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-muted">
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
