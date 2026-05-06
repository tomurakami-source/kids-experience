let reviews = [];
let reviewId = 1;

export function addReview(productId, rating, comment) {
  if (!productId || !rating || rating < 1 || rating > 5) {
    throw new Error('Invalid review data');
  }
  if (comment && comment.length > 500) {
    throw new Error('Comment must be 500 characters or less');
  }

  const review = {
    id: reviewId++,
    productId: parseInt(productId),
    rating: parseInt(rating),
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  reviews.push(review);
  return review;
}

export function getReviewsByProductId(productId) {
  return reviews.filter(r => r.productId === parseInt(productId));
}

export function getAverageRating(productId) {
  const productReviews = getReviewsByProductId(productId);
  if (productReviews.length === 0) return 0;
  const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / productReviews.length).toFixed(1);
}

export function getReviewCount(productId) {
  return getReviewsByProductId(productId).length;
}

export function getAllReviews() {
  return reviews;
}
