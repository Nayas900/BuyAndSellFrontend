const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');

// GET /products  — with optional ?search=&category=&page=&limit=
const getProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('sellerId', 'name avatar location'),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// GET /products/stats/marketplace
const getMarketplaceStats = async (_req, res, next) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [activeListings, happyUsers, weeklyListings] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      User.countDocuments({}),
      Product.countDocuments({ isActive: true, createdAt: { $gte: last7Days } }),
    ]);

    // No ratings model exists yet; return null until review/rating system is added.
    res.json({
      activeListings,
      happyUsers,
      weeklyListings,
      avgRating: null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'sellerId',
      'name avatar location createdAt'
    );

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /products
const createProduct = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category')
    .isIn(['Electronics', 'Cars', 'Furniture', 'Clothing', 'Sports', 'Other'])
    .withMessage('Invalid category'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('images').optional().isArray(),
  body('condition')
    .optional()
    .isIn(['New', 'Like New', 'Good', 'Fair'])
    .withMessage('Invalid condition'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { title, description, price, category, location, images, condition } = req.body;

      const product = await Product.create({
        title,
        description,
        price,
        category,
        location,
        images: images || [],
        condition: condition || 'Good',
        sellerId: req.user._id,
      });

      await product.populate('sellerId', 'name avatar location');
      res.status(201).json(product);

      // Fire notifications asynchronously (don't block the response)
      setImmediate(async () => {
        try {
          // Notify the seller themselves
          await Notification.create({
            userId: req.user._id,
            type: 'product_posted',
            title: 'Your listing is live!',
            body: `"${product.title}" is now visible to buyers.`,
            productId: product._id,
          });

          // Notify only users who have previously chatted with this seller
          const prevChats = await Chat.find(
            { sellerId: req.user._id },
            { buyerId: 1 }
          ).lean();

          const uniqueBuyerIds = [
            ...new Map(prevChats.map((c) => [c.buyerId.toString(), c.buyerId])).values(),
          ];

          if (uniqueBuyerIds.length > 0) {
            const docs = uniqueBuyerIds.map((buyerId) => ({
              userId: buyerId,
              type: 'new_listing',
              title: `${req.user.name} posted something new`,
              body: `"${product.title}" — ₹${product.price.toLocaleString('en-IN')}`,
              productId: product._id,
            }));
            await Notification.insertMany(docs, { ordered: false });
          }
        } catch (_err) {
          // Non-critical — swallow silently
        }
      });
    } catch (err) {
      next(err);
    }
  },
];

// GET /products/my  — all listings (active + closed) for the logged-in seller
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sellerId', 'name avatar location');

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// PATCH /products/:id/close  — seller marks deal as closed (removes from listings)
const closeProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to close this listing' });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: 'Deal closed', product });

    // Notify seller asynchronously
    setImmediate(async () => {
      try {
        await Notification.create({
          userId: req.user._id,
          type: 'deal_closed',
          title: 'Deal closed',
          body: `Your listing "${product.title}" has been marked as closed.`,
          productId: product._id,
        });
      } catch (_err) {
        // Non-critical
      }
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getMyProducts, getMarketplaceStats, getProduct, createProduct, closeProduct, deleteProduct };
