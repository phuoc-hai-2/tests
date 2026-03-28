const User = require('../models/User');
const Order = require('../models/Order');

exports.getUsers = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 20 } = req.query;
    const filter = { role: 'user' };
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ];
    }
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ users, page: Number(page), pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
    const totalSpent = orders
      .filter(o => ['paid', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({ user, orders, totalSpent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Không thể khóa admin' });

    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ message: user.isBanned ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
