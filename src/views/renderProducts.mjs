import { products } from '../models/products.mjs';
import { getAverageRating, getReviewCount } from '../models/reviews.mjs';

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

export function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) {
    stars += '☆';
  }
  stars += '☆'.repeat(5 - Math.ceil(rating));
  return stars;
}

export function renderProductListing(cart) {
  const productCards = products.map(product => {
    const averageRating = getAverageRating(product.id);
    const reviewCount = getReviewCount(product.id);
    return `
      <div class="product-card">
        <div class="product-image">${product.image}</div>
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="product-description">${escapeHtml(product.description)}</div>
        ${reviewCount > 0 ? `<div style="font-size: 14px; color: #FF9900; margin: 4px 0;">${renderStars(averageRating)} ${averageRating} (${reviewCount}件)</div>` : ''}
        <div class="product-price">¥${product.price.toLocaleString()}</div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="btn" onclick="addToCart(${product.id}, '${escapeHtml(product.name)}')" style="flex: 1;">
            カートに追加
          </button>
          <a href="/product/${product.id}" class="btn btn-secondary" style="flex: 1; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center;">
            詳細・レビュー
          </a>
        </div>
      </div>
    `;
  }).join('');

  return `
    <h1 class="page-title">商品一覧</h1>
    <div class="product-grid">
      ${productCards}
    </div>
  `;
}

export function renderProductDetail(product, reviews, averageRating, reviewCount) {
  const reviewsHtml = reviews.map(review => `
    <div style="background: #f9f9f9; padding: 12px; border-radius: 4px; margin: 8px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-weight: bold;">${renderStars(review.rating)} ${review.rating}つ星</div>
        <div style="font-size: 12px; color: #666;">${new Date(review.createdAt).toLocaleDateString('ja-JP')}</div>
      </div>
      <div>${escapeHtml(review.comment)}</div>
    </div>
  `).join('');

  return `
    <h1 class="page-title">${escapeHtml(product.name)}</h1>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
      <div>
        <div style="font-size: 120px; text-align: center; margin: 20px 0;">${product.image}</div>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <p style="font-size: 14px; color: #666; margin: 12px 0;">${escapeHtml(product.description)}</p>
          <div style="font-size: 32px; color: #FF9900; font-weight: bold; margin: 20px 0;">¥${product.price.toLocaleString()}</div>
          <button class="btn" onclick="addToCart(${product.id}, '${escapeHtml(product.name)}')" style="width: 100%; padding: 15px;">
            カートに追加
          </button>
          <a href="/" class="btn btn-secondary" style="width: 100%; padding: 15px; margin-top: 10px; text-align: center; text-decoration: none; display: inline-block;">
            戻る
          </a>
        </div>
      </div>
      <div>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h2 style="margin-bottom: 16px;">★ 評価 (${reviewCount}件)</h2>
          <div style="font-size: 36px; color: #FF9900; margin-bottom: 8px;">${renderStars(averageRating)} ${averageRating}</div>
          
          <h3 style="margin-top: 24px; margin-bottom: 16px;">レビューコメント</h3>
          <div style="max-height: 400px; overflow-y: auto; margin-bottom: 20px;">
            ${reviewsHtml || '<p style="color: #999;">レビューがまだありません</p>'}
          </div>
          
          <h3 style="margin-bottom: 12px;">レビューを投稿</h3>
          <form onsubmit="submitReview(event, ${product.id})">
            <div class="form-group">
              <label>★の数を選択</label>
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
              <label for="comment">コメント (オプション)</label>
              <textarea id="comment" name="comment" maxlength="500" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; height: 100px; resize: vertical;"></textarea>
              <small style="color: #999;">500文字以内</small>
            </div>
            <button type="submit" class="btn" style="width: 100%; padding: 12px;">投稿する</button>
          </form>
        </div>
      </div>
    </div>
  `;
}

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
