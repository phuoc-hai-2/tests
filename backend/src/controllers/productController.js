const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 12,
    } = req.query;
    const filter = {};
    if (req.query.showAll !== "true") filter.isActive = true;

    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter["variants.price"] = {};
      if (minPrice) filter["variants.price"].$gte = Number(minPrice);
      if (maxPrice) filter["variants.price"].$lte = Number(maxPrice);
    }
    if (rating) {
      filter.averageRating = { $gte: Number(rating) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { "variants.0.price": 1 };
    else if (sort === "price_desc") sortOption = { "variants.0.price": -1 };
    else if (sort === "rating") sortOption = { averageRating: -1 };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("category", "name slug");
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    product.viewCount = (product.viewCount || 0) + 1;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug",
    );
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      category,
      variants,
      tags,
      metaTitle,
      metaDescription,
    } = req.body;
    const images = req.files
      ? req.files.map((f) => `/uploads/products/${f.filename}`)
      : [];
    const autoSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now();
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    const parsedVariants = JSON.parse(variants || "[]");
    if (parsedVariants.some((v) => Number(v.price) < 0)) {
      return res.status(400).json({ message: "Giá sản phẩm phải >= 0" });
    }
    const product = await Product.create({
      name,
      slug: autoSlug,
      description,
      category,
      variants: parsedVariants,
      tags: parsedTags,
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      images,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    const {
      name,
      slug,
      description,
      category,
      variants,
      isActive,
      tags,
      metaTitle,
      metaDescription,
    } = req.body;
    if (name) product.name = name;
    if (slug) product.slug = slug;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (variants) {
      const parsedVariants = JSON.parse(variants);
      if (parsedVariants.some((v) => Number(v.price) < 0)) {
        return res.status(400).json({ message: "Giá sản phẩm phải >= 0" });
      }
      product.variants = parsedVariants;
    }
    if (tags) {
      try {
        product.tags = JSON.parse(tags);
      } catch {
        product.tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    if (metaTitle !== undefined) product.metaTitle = metaTitle;
    if (metaDescription !== undefined)
      product.metaDescription = metaDescription;
    if (isActive !== undefined)
      product.isActive = isActive === "true" || isActive === true;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/products/${f.filename}`);
      product.images.push(...newImages);
    }
    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    product.isActive = false;
    await product.save();
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
