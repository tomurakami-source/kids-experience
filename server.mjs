import express from 'express';
import { products } from './products.mjs';
import { addReview, getProductReviews, getProductAverageRating } from './reviews.mjs';
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
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(renderPage('商品一覧', renderProductListing([])));
});

app.get('/product/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).send(renderPage('エラー', '<h1>商品が見つかりません</h1>'));
  }

  const productReviews = getProductReviews(productId);
  const avgRating = getProductAverageRating(productId);
  const productDetailHTML = renderProductDetail(product, productReviews, avgRating);
  res.send(renderPage(`${product.name} - 商品詳細`, productDetailHTML));
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
  const productId = parseInt(req.params.productId);
  const productReviews = getProductReviews(productId);
  const avgRating = getProductAverageRating(productId);
  res.json({
    reviews: productReviews,
    averageRating: avgRating,
    totalReviews: productReviews.length
  });
});

app.post('/api/reviews', (req, res) => {
  const { productId, rating, comment } = req.body;
  
  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: '全ての項目を入力してください' });
  }

  const product = products.find(p => p.id === parseInt(productId));
  if (!product) {
    return res.status(404).json({ error: '商品が見つかりません' });
  }

  const review = addReview(productId, rating, comment);
  res.json({ 
    success: true, 
    message: 'レビューを投稿しました',
    review: review
  });
});

function renderPage(title, content) {
  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - nisemono_food</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          background-color: #f5f5f5;
          color: #333;
        }

        header {
          background-color: #fff;
          border-bottom: 1px solid #ddd;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #FF9900;
        }

        .nav {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .nav a {
          color: #0066c0;
          text-decoration: none;
        }

        .nav a:hover {
          color: #c45911;
        }

        .cart-count {
          background-color: #FF9900;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        main {
          max-width: 1200px;
          margin: 20px auto;
          padding: 0 20px;
        }

        .page-title {
          font-size: 28px;
          margin-bottom: 20px;
          color: #333;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }

        .product-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          transition: box-shadow 0.2s;
        }

        .product-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .product-image {
          font-size: 64px;
          margin: 16px 0;
        }

        .product-name {
          font-size: 16px;
          font-weight: bold;
          margin: 8px 0;
        }

        .product-description {
          font-size: 12px;
          color: #666;
          margin: 8px 0;
        }

        .product-price {
          font-size: 20px;
          color: #FF9900;
          font-weight: bold;
          margin: 12px 0;
        }

        .btn {
          background-color: #FF9900;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        }

        .btn:hover {
          background-color: #e68a00;
        }

        .btn-secondary {
          background-color: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover {
          background-color: #e0e0e0;
        }

        .cart-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          margin: 20px 0;
        }

        .cart-table th,
        .cart-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .cart-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }

        .cart-summary {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #ddd;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          font-size: 16px;
        }

        .summary-total {
          font-weight: bold;
          color: #FF9900;
          font-size: 20px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
          margin-top: 10px;
        }

        .form-group {
          margin: 16px 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: bold;
        }

        .form-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 600px;
        }

        .success-message {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 12px;
          border-radius: 4px;
          margin: 16px 0;
        }

        .empty-cart {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        footer {
          background-color: #fff;
          border-top: 1px solid #ddd;
          padding: 20px;
          text-align: center;
          color: #666;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="logo">🛒 nisemono_food</div>
        <nav class="nav">
          <a href="/">商品</a>
          <a href="/cart?items=[]">カート <span class="cart-count" id="cart-count">0</span></a>
        </nav>
      </header>
      <main>
        ${content}
      </main>
      <footer>
        <p>&copy; 2026 nisemono_food. All rights reserved.</p>
      </footer>
      <script>
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        document.getElementById('cart-count').textContent = cart.length;

        function addToCart(productId, productName) {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          cart.push({ productId: parseInt(productId), name: productName, quantity: 1 });
          localStorage.setItem('cart', JSON.stringify(cart));
          
          document.getElementById('cart-count').textContent = cart.length;
          alert(productName + ' をカートに追加しました');
        }

        function viewCart() {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          window.location.href = '/cart?items=' + encodeURIComponent(JSON.stringify(cart));
        }

        function checkout() {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          window.location.href = '/checkout?items=' + encodeURIComponent(JSON.stringify(cart));
        }

        function submitCheckout(event) {
          event.preventDefault();
          const name = document.getElementById('name').value;
          const email = document.getElementById('email').value;
          const address = document.getElementById('address').value;

          fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, address })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert('注文番号: ' + data.orderId + '\\n注文が完了しました！');
              localStorage.removeItem('cart');
              window.location.href = '/';
            } else {
              alert('エラー: ' + data.error);
            }
          });
        }

        function submitReview(event, productId) {
          event.preventDefault();
          const rating = document.getElementById('rating').value;
          const comment = document.getElementById('comment').value;

          fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, rating, comment })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert('レビューを投稿しました！');
              window.location.reload();
            } else {
              alert('エラー: ' + data.error);
            }
          });
        }
      </script>
    </body>
    </html>
  `;
}

function renderRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '☆';
  stars += '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  return stars;
}

function renderProductListing(cart) {
  const productCards = products.map(product => {
    const avgRating = getProductAverageRating(product.id);
    const reviewCount = getProductReviews(product.id).length;
    return `
    <div class="product-card">
      <div class="product-image">${product.image}</div>
      <div class="product-name">${escapeHtml(product.name)}</div>
      <div class="product-description">${escapeHtml(product.description)}</div>
      <div class="product-rating">${renderRatingStars(avgRating)} ${avgRating > 0 ? '(' + avgRating + ')' : ''}</div>
      <div class="product-review-count" style="font-size: 12px; color: #666;">レビュー: ${reviewCount}件</div>
      <div class="product-price">¥${product.price.toLocaleString()}</div>
      <div style="display: flex; gap: 8px;">
        <button class="btn" onclick="addToCart(${product.id}, '${escapeHtml(product.name)}')">
          カートに追加
        </button>
        <button class="btn btn-secondary" onclick="window.location.href='/product/${product.id}'">
          詳細・レビュー
        </button>
      </div>
    </div>
  `}).join('');

  return `
    <h1 class="page-title">商品一覧</h1>
    <div class="product-grid">
      ${productCards}
    </div>
  `;
}

function renderProductDetail(product, reviews, avgRating) {
  const reviewsHTML = reviews.map(review => `
    <div style="background: #f9f9f9; padding: 12px; border-radius: 4px; margin: 8px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: bold;">${renderRatingStars(review.rating)}</span>
        <span style="font-size: 12px; color: #999;">${new Date(review.createdAt).toLocaleDateString('ja-JP')}</span>
      </div>
      <div style="color: #666;">${escapeHtml(review.comment)}</div>
    </div>
  `).join('');

  return `
    <h1 class="page-title">${escapeHtml(product.name)}</h1>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px;">
      <div>
        <div style="font-size: 80px; text-align: center; padding: 40px; background: white; border-radius: 8px;">${product.image}</div>
        <p style="margin-top: 16px; color: #666;">${escapeHtml(product.description)}</p>
        <div style="margin-top: 20px;">
          <div style="font-size: 28px; color: #FF9900; font-weight: bold; margin-bottom: 16px;">¥${product.price.toLocaleString()}</div>
          <button class="btn" onclick="addToCart(${product.id}, '${escapeHtml(product.name)}')" style="width: 100%;">
            カートに追加
          </button>
          <a href="/" class="btn btn-secondary" style="width: 100%; text-align: center; display: block; margin-top: 8px; text-decoration: none;">
            商品一覧に戻る
          </a>
        </div>
      </div>
      <div>
        <h2 style="margin-bottom: 16px;">レビュー</h2>
        <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
            ${renderRatingStars(avgRating)} ${avgRating > 0 ? avgRating + '/5.0' : 'まだレビューなし'}
          </div>
          <div style="color: #666;">総レビュー数: ${reviews.length}件</div>
        </div>
        
        <h3 style="margin-bottom: 12px;">レビューを投稿</h3>
        <form style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 20px;" onsubmit="submitReview(event, ${product.id})">
          <div class="form-group">
            <label for="rating">評価 (星の数)</label>
            <select id="rating" name="rating" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <option value="">選択してください</option>
              <option value="5">★★★★★ 5つ星</option>
              <option value="4">★★★★☆ 4つ星</option>
              <option value="3">★★★☆☆ 3つ星</option>
              <option value="2">★★☆☆☆ 2つ星</option>
              <option value="1">★☆☆☆☆ 1つ星</option>
            </select>
          </div>
          <div class="form-group">
            <label for="comment">コメント</label>
            <textarea id="comment" name="comment" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; resize: vertical;" rows="4"></textarea>
          </div>
          <button type="submit" class="btn" style="width: 100%;">レビューを投稿</button>
        </form>

        <h3 style="margin-bottom: 12px;">レビュー一覧</h3>
        ${reviewsHTML.length > 0 ? reviewsHTML : '<div style="color: #999; padding: 16px; text-align: center;">レビューはまだありません</div>'}
      </div>
    </div>
  `;
}

function renderCart(cartItems) {
  if (cartItems.length === 0) {
    return `
      <h1 class="page-title">ショッピングカート</h1>
      <div class="empty-cart">
        <p>カートは空です</p>
        <a href="/" class="btn btn-secondary">商品を見る</a>
      </div>
    `;
  }

  let total = 0;
  const cartRows = cartItems.map(item => {
    const product = products.find(p => p.id === parseInt(item.productId));
    if (!product) return '';
    const subtotal = product.price * (item.quantity || 1);
    total += subtotal;
    return `
      <tr>
        <td>${escapeHtml(product.name)}</td>
        <td>¥${product.price.toLocaleString()}</td>
        <td>${item.quantity || 1}</td>
        <td>¥${subtotal.toLocaleString()}</td>
      </tr>
    `;
  }).join('');

  return `
    <h1 class="page-title">ショッピングカート</h1>
    <table class="cart-table">
      <thead>
        <tr>
          <th>商品名</th>
          <th>価格</th>
          <th>数量</th>
          <th>小計</th>
        </tr>
      </thead>
      <tbody>
        ${cartRows}
      </tbody>
    </table>
    <div class="cart-summary">
      <div class="summary-row">
        <span>小計:</span>
        <span>¥${total.toLocaleString()}</span>
      </div>
      <div class="summary-row">
        <span>配送料:</span>
        <span>¥500</span>
      </div>
      <div class="summary-row summary-total">
        <span>合計:</span>
        <span>¥${(total + 500).toLocaleString()}</span>
      </div>
    </div>
    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <a href="/" class="btn btn-secondary">買い物を続ける</a>
      <button class="btn" onclick="checkout()">チェックアウト</button>
    </div>
  `;
}

function renderCheckout(cartItems) {
  let total = 0;
  cartItems.forEach(item => {
    const product = products.find(p => p.id === parseInt(item.productId));
    if (product) {
      total += product.price * (item.quantity || 1);
    }
  });
  total += 500;

  return `
    <h1 class="page-title">チェックアウト</h1>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <h2 style="margin-bottom: 16px;">配送先情報</h2>
        <form class="form-container" onsubmit="submitCheckout(event)">
          <div class="form-group">
            <label for="name">お名前</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">メールアドレス</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="address">配送先住所</label>
            <input type="text" id="address" name="address" required>
          </div>
          <button type="submit" class="btn" style="width: 100%; margin-top: 20px;">
            注文を確定する
          </button>
        </form>
      </div>
      <div>
        <h2 style="margin-bottom: 16px;">注文内容</h2>
        <div class="cart-summary">
          <div class="summary-row">
            <span>商品小計:</span>
            <span>¥${(total - 500).toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>配送料:</span>
            <span>¥500</span>
          </div>
          <div class="summary-row summary-total">
            <span>合計:</span>
            <span>¥${total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

app.listen(PORT, () => {
  console.log(`nisemono_food server running at http://localhost:${PORT}`);
});
