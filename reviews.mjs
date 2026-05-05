export let reviews = [];

export function addReview(productId, rating, comment) {
  const review = {
    id: Date.now(),
    productId: parseInt(productId),
    rating: Math.min(5, Math.max(1, parseInt(rating))),
    comment: comment.trim(),
    createdAt: new Date().toISOString()
  };
  reviews.push(review);
  return review;
}

export function getProductReviews(productId) {
  return reviews.filter(r => r.productId === parseInt(productId));
}

export function getProductAverageRating(productId) {
  const productReviews = getProductReviews(productId);
  if (productReviews.length === 0) return 0;
  const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / productReviews.length).toFixed(1);
}
