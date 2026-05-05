import express from 'express';
import { products } from './products.mjs';
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
      </script>
    </body>
    </html>
  `;
}

function renderProductListing(cart) {
  const productCards = products.map(product => `
    <div class="product-card">
      <div class="product-image">${product.image}</div>
      <div class="product-name">${escapeHtml(product.name)}</div>
      <div class="product-description">${escapeHtml(product.description)}</div>
      <div class="product-price">¥${product.price.toLocaleString()}</div>
      <button class="btn" onclick="addToCart(${product.id}, '${escapeHtml(product.name)}')">
        カートに追加
      </button>
    </div>
  `).join('');

  return `
    <h1 class="page-title">商品一覧</h1>
    <div class="product-grid">
      ${productCards}
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
