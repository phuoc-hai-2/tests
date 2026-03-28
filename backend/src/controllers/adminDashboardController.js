const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

exports.getStats = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const paidOrders = await Order.countDocuments({ status: 'paid' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      totalOrders,
      pendingOrders,
      paidOrders,
      completedOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const months = Number(req.query.months) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const data = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'completed'] }, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const result = data.map(d => ({
      month: `${d._id.month}/${d._id.year}`,
      revenue: d.revenue,
      orders: d.count
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserGrowth = async (req, res) => {
  try {
    const months = Number(req.query.months) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const data = await User.aggregate([
      { $match: { createdAt: { $gte: startDate }, role: 'user' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const result = data.map(d => ({
      month: `${d._id.month}/${d._id.year}`,
      users: d.count
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const topSelling = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'completed'] } } },
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.product', name: { $first: '$orderItems.productName' }, totalSold: { $sum: 1 }, revenue: { $sum: '$orderItems.price' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    const topViewed = await Product.find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(10)
      .select('name slug viewCount images');

    res.json({ topSelling, topViewed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
