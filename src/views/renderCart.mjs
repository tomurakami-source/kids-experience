import { products } from '../models/products.mjs';

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

export function renderCart(cartItems) {
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
