const express = require('express');
const {
  getProducts,
  getMyProducts,
  getMarketplaceStats,
  getProduct,
  createProduct,
  closeProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/my', protect, getMyProducts);
router.get('/stats/marketplace', getMarketplaceStats);
router.get('/:id', getProduct);
router.post('/', protect, createProduct);
router.patch('/:id/close', protect, closeProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
