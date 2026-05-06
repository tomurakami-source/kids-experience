import express from 'express';
import { products } from './models/products.mjs';
import { addReview, getReviewsByProductId, getAverageRating, getReviewCount } from './models/reviews.mjs';
import { renderPage } from './views/renderPage.mjs';
import { renderProductListing, renderProductDetail } from './views/renderProducts.mjs';
import { renderCart } from './views/renderCart.mjs';
import { renderCheckout } from './views/renderCheckout.mjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

app.use(express.json());
app.use(express.static(path.join(path.dirname(__dirname), 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(renderPage('商品一覧', renderProductListing([])));
});

app.get('/product/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === parseInt(id));
  
  if (!product) {
    return res.status(404).send(renderPage('エラー', '<p>商品が見つかりません</p>'));
  }

  const reviews = getReviewsByProductId(id);
  const averageRating = getAverageRating(id);
  const reviewCount = getReviewCount(id);
  
  res.send(renderPage(`${product.name} - 詳細`, renderProductDetail(product, reviews, averageRating, reviewCount)));
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/cart/add', (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === parseInt(productId));
  
  if (!product) {
    return res.status(404).json({ error: '商品が見つかりません' });
  }

  res.json({ success: true, message: `${product.name} をカートに追加しました` });
});

app.get('/cart', (req, res) => {
  let cartData = [];
  if (req.query.items) {
    try {
      cartData = JSON.parse(req.query.items);
    } catch (e) {
      console.error('Invalid cart data:', e);
      cartData = [];
    }
  }
  const cartHTML = renderCart(cartData);
  res.send(renderPage('ショッピングカート', cartHTML));
});

app.get('/checkout', (req, res) => {
  let cartData = [];
  if (req.query.items) {
    try {
      cartData = JSON.parse(req.query.items);
    } catch (e) {
      console.error('Invalid cart data:', e);
      cartData = [];
    }
  }
  const checkoutHTML = renderCheckout(cartData);
  res.send(renderPage('チェックアウト', checkoutHTML));
});

app.post('/api/checkout', (req, res) => {
  const { name, email, address } = req.body;
  
  if (!name || !email || !address) {
    return res.status(400).json({ error: '全ての項目を入力してください' });
  }

  res.json({ 
    success: true, 
    message: '注文が完了しました',
    orderId: `ORD-${Date.now()}`
  });
});

app.get('/api/reviews/:productId', (req, res) => {
  const { productId } = req.params;
  const reviews = getReviewsByProductId(productId);
  const averageRating = getAverageRating(productId);
  const reviewCount = getReviewCount(productId);
  
  res.json({ 
    reviews, 
    averageRating: parseFloat(averageRating), 
    reviewCount 
  });
});

app.post('/api/reviews', (req, res) => {
  const { productId, rating, comment } = req.body;
  
  if (!productId || !rating) {
    return res.status(400).json({ error: 'productId and rating are required' });
  }

  try {
    const review = addReview(productId, rating, comment);
    res.json({ success: true, review });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`nisemono_food server running at http://localhost:${PORT}`);
});
