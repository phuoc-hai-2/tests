require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./src/models/Category");
const Product = require("./src/models/Product");

const categories = [
  {
    name: "Streaming",
    slug: "streaming",
    description: "Dịch vụ xem phim, nghe nhạc trực tuyến",
  },
  { name: "Phần mềm", slug: "phan-mem", description: "Key bản quyền phần mềm" },
  { name: "Game", slug: "game", description: "Tài khoản và key game" },
  { name: "Học tập", slug: "hoc-tap", description: "Tài khoản học trực tuyến" },
  { name: "Lưu trữ", slug: "luu-tru", description: "Dịch vụ lưu trữ đám mây" },
];

async function seedProducts() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB Connected");

  // Tạo danh mục nếu chưa có
  const categoryMap = {};
  for (const cat of categories) {
    let existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await Category.create(cat);
      console.log(`Đã tạo danh mục: ${cat.name}`);
    } else {
      console.log(`Danh mục đã tồn tại: ${cat.name}`);
    }
    categoryMap[cat.slug] = existing._id;
  }

  const products = [
    {
      name: "Netflix Premium",
      slug: "netflix-premium",
      description:
        "Tài khoản Netflix Premium, xem phim chất lượng 4K Ultra HD, hỗ trợ 4 thiết bị cùng lúc.",
      category: categoryMap["streaming"],
      tags: ["netflix", "streaming", "phim"],
      metaTitle: "Mua tài khoản Netflix Premium giá rẻ",
      metaDescription: "Netflix Premium 4K, nhiều gói thời hạn, giá tốt nhất.",
      variants: [
        { name: "Gói 1 tháng", price: 70000, duration: 30 },
        { name: "Gói 3 tháng", price: 180000, duration: 90 },
        { name: "Gói 1 năm", price: 600000, duration: 365 },
      ],
    },
    {
      name: "Spotify Premium",
      slug: "spotify-premium",
      description:
        "Tài khoản Spotify Premium, nghe nhạc không quảng cáo, tải nhạc offline.",
      category: categoryMap["streaming"],
      tags: ["spotify", "nhạc", "streaming"],
      metaTitle: "Mua tài khoản Spotify Premium",
      metaDescription: "Spotify Premium chính hãng, nghe nhạc không giới hạn.",
      variants: [
        { name: "Gói 1 tháng", price: 50000, duration: 30 },
        { name: "Gói 6 tháng", price: 250000, duration: 180 },
        { name: "Gói 1 năm", price: 450000, duration: 365 },
      ],
    },
    {
      name: "YouTube Premium",
      slug: "youtube-premium",
      description:
        "YouTube Premium không quảng cáo, phát nhạc nền, tải video offline.",
      category: categoryMap["streaming"],
      tags: ["youtube", "streaming", "video"],
      metaTitle: "Mua YouTube Premium giá rẻ",
      metaDescription: "YouTube Premium chính hãng, xem video không quảng cáo.",
      variants: [
        { name: "Gói 1 tháng", price: 40000, duration: 30 },
        { name: "Gói 3 tháng", price: 100000, duration: 90 },
      ],
    },
    {
      name: "Microsoft Office 365",
      slug: "microsoft-office-365",
      description:
        "Bộ ứng dụng Office 365 bao gồm Word, Excel, PowerPoint, OneDrive 1TB.",
      category: categoryMap["phan-mem"],
      tags: ["office", "microsoft", "word", "excel"],
      metaTitle: "Mua key Office 365 bản quyền",
      metaDescription: "Office 365 chính hãng, đầy đủ ứng dụng văn phòng.",
      variants: [
        { name: "Gói 1 năm (1 user)", price: 300000, duration: 365 },
        { name: "Gói 1 năm (5 users)", price: 500000, duration: 365 },
        { name: "Vĩnh viễn", price: 900000, duration: null },
      ],
    },
    {
      name: "Windows 11 Pro",
      slug: "windows-11-pro",
      description:
        "Key bản quyền Windows 11 Pro, kích hoạt vĩnh viễn, hỗ trợ cài đặt.",
      category: categoryMap["phan-mem"],
      tags: ["windows", "microsoft", "hệ điều hành"],
      metaTitle: "Mua key Windows 11 Pro bản quyền",
      metaDescription: "Windows 11 Pro key chính hãng, kích hoạt vĩnh viễn.",
      variants: [{ name: "Key vĩnh viễn", price: 350000, duration: null }],
    },
    {
      name: "Adobe Creative Cloud",
      slug: "adobe-creative-cloud",
      description:
        "Trọn bộ Adobe CC gồm Photoshop, Illustrator, Premiere Pro và hơn 20 ứng dụng.",
      category: categoryMap["phan-mem"],
      tags: ["adobe", "photoshop", "thiết kế"],
      metaTitle: "Mua Adobe Creative Cloud giá rẻ",
      metaDescription:
        "Adobe CC trọn bộ, dùng cho thiết kế và dựng phim chuyên nghiệp.",
      variants: [
        { name: "Gói 1 tháng", price: 150000, duration: 30 },
        { name: "Gói 1 năm", price: 1200000, duration: 365 },
      ],
    },
    {
      name: "Steam Wallet",
      slug: "steam-wallet",
      description:
        "Nạp tiền vào ví Steam để mua game, DLC và nội dung trong game.",
      category: categoryMap["game"],
      tags: ["steam", "game", "nạp tiền"],
      metaTitle: "Mua Steam Wallet Code",
      metaDescription: "Nạp tiền Steam nhanh chóng, nhiều mệnh giá.",
      variants: [
        { name: "100.000 VND", price: 100000, duration: null },
        { name: "200.000 VND", price: 200000, duration: null },
        { name: "500.000 VND", price: 500000, duration: null },
      ],
    },
    {
      name: "Xbox Game Pass Ultimate",
      slug: "xbox-game-pass-ultimate",
      description:
        "Xbox Game Pass Ultimate, truy cập hàng trăm game trên PC và Xbox, bao gồm EA Play.",
      category: categoryMap["game"],
      tags: ["xbox", "game pass", "microsoft", "game"],
      metaTitle: "Mua Xbox Game Pass Ultimate",
      metaDescription:
        "Game Pass Ultimate, chơi hàng trăm game trên PC và Xbox.",
      variants: [
        { name: "Gói 1 tháng", price: 120000, duration: 30 },
        { name: "Gói 3 tháng", price: 300000, duration: 90 },
      ],
    },
    {
      name: "Coursera Plus",
      slug: "coursera-plus",
      description:
        "Tài khoản Coursera Plus, truy cập hơn 7000 khóa học từ các trường đại học hàng đầu.",
      category: categoryMap["hoc-tap"],
      tags: ["coursera", "học tập", "online"],
      metaTitle: "Mua tài khoản Coursera Plus",
      metaDescription:
        "Coursera Plus, học không giới hạn từ các trường đại học top thế giới.",
      variants: [
        { name: "Gói 1 tháng", price: 200000, duration: 30 },
        { name: "Gói 1 năm", price: 1500000, duration: 365 },
      ],
    },
    {
      name: "Google One",
      slug: "google-one",
      description:
        "Dung lượng lưu trữ Google One, dùng cho Google Drive, Gmail và Google Photos.",
      category: categoryMap["luu-tru"],
      tags: ["google", "lưu trữ", "cloud"],
      metaTitle: "Mua Google One dung lượng lớn",
      metaDescription: "Google One, mở rộng dung lượng Google Drive và Gmail.",
      variants: [
        { name: "100GB - 1 tháng", price: 45000, duration: 30 },
        { name: "200GB - 1 tháng", price: 70000, duration: 30 },
        { name: "2TB - 1 năm", price: 2000000, duration: 365 },
      ],
    },
  ];

  let created = 0;
  for (const p of products) {
    const existing = await Product.findOne({ slug: p.slug });
    if (existing) {
      console.log(`Sản phẩm đã tồn tại: ${p.name}`);
      continue;
    }
    await Product.create(p);
    console.log(`Đã tạo sản phẩm: ${p.name}`);
    created++;
  }

  console.log(`\nHoàn tất! Đã tạo ${created} sản phẩm mới.`);
  await mongoose.disconnect();
}

seedProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});
