export function renderPage(title, content) {
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

          if (!rating) {
            alert('★の数を選択してください');
            return;
          }

          fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, rating: parseInt(rating), comment })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert('レビューが投稿されました！');
              window.location.reload();
            } else {
              alert('エラー: ' + data.error);
            }
          })
          .catch(error => {
            alert('エラーが発生しました: ' + error.message);
          });
        }
      </script>
    </body>
    </html>
  `;
}
