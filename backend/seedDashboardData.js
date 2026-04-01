require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Category = require("./src/models/Category");
const Product = require("./src/models/Product");
const User = require("./src/models/User");
const Order = require("./src/models/Order");

const SAMPLE_CATEGORY_SLUG = "sample-dashboard-category";
const SAMPLE_PRODUCT_SLUG = "sample-dashboard-product";
const SAMPLE_USER_PREFIX = "sample-dashboard-user-";

const monthlyPlan = [
  { monthOffset: 11, users: 2, orders: 2, revenue: [180000, 260000] },
  { monthOffset: 10, users: 3, orders: 3, revenue: [220000, 340000, 410000] },
  { monthOffset: 9, users: 2, orders: 2, revenue: [280000, 520000] },
  { monthOffset: 8, users: 4, orders: 3, revenue: [350000, 460000, 680000] },
  { monthOffset: 7, users: 3, orders: 3, revenue: [310000, 590000, 710000] },
  {
    monthOffset: 6,
    users: 5,
    orders: 4,
    revenue: [420000, 550000, 730000, 860000],
  },
  {
    monthOffset: 5,
    users: 4,
    orders: 4,
    revenue: [390000, 610000, 790000, 920000],
  },
  {
    monthOffset: 4,
    users: 6,
    orders: 5,
    revenue: [450000, 670000, 840000, 960000, 1100000],
  },
  {
    monthOffset: 3,
    users: 5,
    orders: 5,
    revenue: [520000, 740000, 910000, 1150000, 1290000],
  },
  {
    monthOffset: 2,
    users: 7,
    orders: 6,
    revenue: [610000, 820000, 980000, 1210000, 1380000, 1500000],
  },
  {
    monthOffset: 1,
    users: 6,
    orders: 6,
    revenue: [680000, 890000, 1090000, 1320000, 1490000, 1680000],
  },
  {
    monthOffset: 0,
    users: 8,
    orders: 7,
    revenue: [760000, 980000, 1180000, 1410000, 1590000, 1760000, 1940000],
  },
];

function makeDateInMonth(monthOffset, day) {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setMonth(date.getMonth() - monthOffset, day);
  return date;
}

async function upsertSampleCategory() {
  let category = await Category.findOne({ slug: SAMPLE_CATEGORY_SLUG });
  if (!category) {
    category = await Category.create({
      name: "Sample Dashboard Category",
      slug: SAMPLE_CATEGORY_SLUG,
    });
  }
  return category;
}

async function upsertSampleProduct(categoryId) {
  let product = await Product.findOne({ slug: SAMPLE_PRODUCT_SLUG });
  if (!product) {
    product = await Product.create({
      name: "Sample Dashboard Product",
      slug: SAMPLE_PRODUCT_SLUG,
      description: "Product used for dashboard chart seed data.",
      category: categoryId,
      variants: [{ name: "Basic", price: 100000, duration: 30 }],
      tags: ["sample", "dashboard"],
      isActive: true,
      images: [],
    });
  }
  return product;
}

async function clearOldSampleData() {
  const sampleUsers = await User.find({
    email: { $regex: `^${SAMPLE_USER_PREFIX}` },
  }).select("_id");

  const sampleUserIds = sampleUsers.map((user) => user._id);
  if (sampleUserIds.length > 0) {
    await Order.deleteMany({ user: { $in: sampleUserIds } });
    await User.deleteMany({ _id: { $in: sampleUserIds } });
  }
}

async function seedUsersAndOrders(product) {
  const hashedPassword = await bcrypt.hash("sample123", 10);
  const usersToInsert = [];
  const ordersToInsert = [];
  let userCounter = 1;

  for (const plan of monthlyPlan) {
    const monthUsers = [];

    for (let i = 0; i < plan.users; i += 1) {
      const createdAt = makeDateInMonth(plan.monthOffset, Math.min(25, 2 + i));
      monthUsers.push(new mongoose.Types.ObjectId());
      usersToInsert.push({
        _id: monthUsers[monthUsers.length - 1],
        name: `Sample User ${userCounter}`,
        email: `${SAMPLE_USER_PREFIX}${userCounter}@example.com`,
        password: hashedPassword,
        role: "user",
        phone: `090000${String(userCounter).padStart(4, "0")}`,
        avatar: "",
        isBanned: false,
        createdAt,
        updatedAt: createdAt,
      });
      userCounter += 1;
    }

    for (let i = 0; i < plan.orders; i += 1) {
      const totalPrice = plan.revenue[i];
      const createdAt = makeDateInMonth(
        plan.monthOffset,
        Math.min(26, 6 + i * 3),
      );
      const paidAt = new Date(createdAt.getTime() + 60 * 60 * 1000);
      const completedAt = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
      const userId = monthUsers[i % monthUsers.length];

      ordersToInsert.push({
        user: userId,
        orderItems: [
          {
            product: product._id,
            productName: product.name,
            variant: {
              _id: new mongoose.Types.ObjectId(),
              name: "Basic",
              price: totalPrice,
              duration: 30,
            },
            price: totalPrice,
          },
        ],
        totalPrice,
        paymentMethod: "vnpay",
        status: i % 3 === 0 ? "paid" : "completed",
        vnpayTransactionId: `SAMPLE-${plan.monthOffset}-${i + 1}`,
        deliveryFile: "",
        note: "Sample dashboard order",
        paidAt,
        completedAt,
        createdAt,
        updatedAt: completedAt,
      });
    }
  }

  if (usersToInsert.length > 0) {
    await User.collection.insertMany(usersToInsert);
  }
  if (ordersToInsert.length > 0) {
    await Order.collection.insertMany(ordersToInsert);
  }
}

async function seedDashboardData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB Connected");

  const category = await upsertSampleCategory();
  const product = await upsertSampleProduct(category._id);

  await clearOldSampleData();
  await seedUsersAndOrders(product);

  console.log("Dashboard sample data seeded successfully.");
  console.log("Months covered:", monthlyPlan.length);
  console.log("Sample product:", product.name);

  await mongoose.disconnect();
}

seedDashboardData().catch((error) => {
  console.error(error);
  process.exit(1);
});
