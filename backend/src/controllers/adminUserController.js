const User = require("../models/User");
const Order = require("../models/Order");
const { createNotification } = require("./notificationController");

exports.getUsers = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 20 } = req.query;
    const filter = { role: "user" };

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      users,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User khong ton tai" });

    const orders = await Order.find({ user: req.params.id }).sort({
      createdAt: -1,
    });
    const totalSpent = orders
      .filter((o) => ["paid", "completed"].includes(o.status))
      .reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({ user, orders, totalSpent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User khong ton tai" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Khong the khoa admin" });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      message: user.isBanned ? "Da khoa tai khoan" : "Da mo khoa tai khoan",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone = "",
      role = "user",
      isBanned = false,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui long nhap day du ten, email va mat khau" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email da duoc su dung" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone.trim(),
      role: role === "admin" ? "admin" : "user",
      isBanned: Boolean(isBanned),
    });

    await createNotification({
      type: "new_user",
      title: "User moi duoc tao",
      message: `${user.name} (${user.email})`,
      relatedId: user._id,
      relatedModel: "User",
    });

    res.status(201).json({
      message: "Tao user thanh cong",
      user: await User.findById(user._id).select("-password"),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, phone = "", role, isBanned } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User khong ton tai" });
    }

    if (!name || !email) {
      return res
        .status(400)
        .json({ message: "Vui long nhap day du ten va email" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const duplicateUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });
    if (duplicateUser) {
      return res.status(400).json({ message: "Email da duoc su dung" });
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.phone = phone.trim();
    if (role) {
      user.role = role === "admin" ? "admin" : "user";
    }
    if (typeof isBanned !== "undefined") {
      user.isBanned = Boolean(isBanned);
    }

    await user.save();

    res.json({
      message: "Cap nhat user thanh cong",
      user: await User.findById(user._id).select("-password"),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
