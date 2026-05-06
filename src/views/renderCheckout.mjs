import { products } from '../models/products.mjs';

export function renderCheckout(cartItems) {
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
