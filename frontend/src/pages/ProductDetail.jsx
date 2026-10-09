import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import { getProductById } from "../services/productService";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { useWishlist } from "../hooks/useWishlist";

const colorOptions = [
  { name: "Đen than", value: "#2f2529" },
  { name: "Kem sáng", value: "#eadfd8" },
  { name: "Đỏ rượu", value: "#7a2438" },
  { name: "Xám khói", value: "#8b8f8d" },
];

const sizeOptions = ["S", "M", "L", "XL"];

const comboOffers = [
  {
    id: "look",
    title: "Combo phối đồ",
    description: "Thêm phụ kiện đồng màu, giảm 10% khi mua cùng sản phẩm này.",
    tag: "-10%",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "gift",
    title: "Quà tặng đơn hàng",
    description: "Tặng túi vải Dolia cho đơn từ 899K.",
    tag: "Gift",
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=600&q=85",
  },
  {
    id: "ship",
    title: "Freeship hôm nay",
    description: "Miễn phí vận chuyển cho đơn từ 699K.",
    tag: "Ship",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=600&q=85",
  },
];

const defaultReviews = [
  {
    id: 1,
    name: "Minh Anh",
    rating: 5,
    text: "Form lên dáng đẹp, chất vải mềm và mặc cả ngày vẫn thoải mái.",
  },
  {
    id: 2,
    name: "Hoàng Linh",
    rating: 5,
    text: "Màu ngoài thật nhã hơn ảnh, đường may gọn và đóng gói chỉn chu.",
  },
  {
    id: 3,
    name: "Ngọc Hân",
    rating: 4,
    text: "Tư vấn size đúng, mình mặc vừa người và giao hàng khá nhanh.",
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getStoredReviews = (productId) => {
  try {
    const stored = localStorage.getItem(`dolia_reviews_${productId}`);
    return stored ? JSON.parse(stored) : defaultReviews;
  } catch {
    return defaultReviews;
  }
};

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isFavorite, toggleFavorite } = useWishlist();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOfferId, setSelectedOfferId] = useState(comboOffers[0].id);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [reviews, setReviews] = useState(defaultReviews);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImage, setReviewImage] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    let mounted = true;

    getProductById(id).then((data) => {
      if (mounted) {
        setProduct(data);
        setSelectedOfferId(comboOffers[0].id);
        setReviews(getStoredReviews(data.id));
      }
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  const selectedOffer = comboOffers.find((offer) => offer.id === selectedOfferId) || comboOffers[0];

  const reviewStats = useMemo(() => {
    const total = reviews.length || 1;
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / total;

    return {
      average,
      total: reviews.length,
      counts: [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((review) => review.rating === star).length,
      })),
    };
  }, [reviews]);
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const handleAddToCart = async () => {
    if (!user) {
      showToast("Vui lòng đăng nhập để thêm sản phẩm", "error");
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      showToast("Tài khoản admin không thể thêm vào giỏ hàng", "error");
      return;
    }

    try {
      await addToCart({ product_id: product.id, quantity });
      showToast(`Đã thêm size ${selectedSize}, màu ${selectedColor.name} vào giỏ hàng`);
    } catch (error) {
      showToast(error.response?.data?.message || "Không thể thêm vào giỏ hàng", "error");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      showToast("Vui lòng đăng nhập để mua ngay", "error");
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      showToast("Tài khoản admin không thể mua hàng", "error");
      return;
    }

    try {
      await addToCart({ product_id: product.id, quantity });
      showToast(`Đã chọn size ${selectedSize}, màu ${selectedColor.name}`);
      sessionStorage.setItem("dolia_checkout_product_ids", JSON.stringify([Number(product.id)]));
      navigate("/checkout");
    } catch (error) {
      showToast(error.response?.data?.message || "Không thể mua ngay", "error");
    }
  };

  const handleToggleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const wasFavorite = isFavorite(product.id);
    toggleFavorite(product.id);
    showToast(wasFavorite ? "Đã bỏ khỏi yêu thích" : "Đã thêm vào yêu thích");
  };

  const handleReviewSubmit = (event) => {
    event.preventDefault();
    const text = reviewText.trim();

    if (!text) {
      showToast("Vui lòng nhập bình luận", "error");
      return;
    }

    const nextReviews = [
      {
        id: Date.now(),
        name: user?.name || "Khách hàng",
        rating: reviewRating,
        text,
        image: reviewImage,
      },
      ...reviews,
    ];

    setReviews(nextReviews);
    localStorage.setItem(`dolia_reviews_${product.id}`, JSON.stringify(nextReviews));
    setReviewText("");
    setReviewRating(5);
    setReviewImage("");
    setShowAllReviews(false);
    showToast("Đã gửi đánh giá");
  };

  const handleReviewImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file ảnh", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setReviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  if (!product) {
    return <section className="container page-section">Đang tải sản phẩm...</section>;
  }

  return (
    <section className="fashion-detail-page">
      <div className="fashion-detail-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to={`/categories/${product.category?.id}`}>{product.category?.name || "Danh mục"}</Link>
        <span>/</span>
        <strong>{product.name}</strong>
      </div>

      <div className="fashion-detail-shell">
        <div className="fashion-detail-gallery">
          <div className="fashion-detail-main-image">
            <img src={product.image} alt={product.name} />
            <button
              type="button"
              className={`fashion-wishlist-button ${isFavorite(product.id) ? "active" : ""}`}
              onClick={handleToggleFavorite}
              aria-pressed={isFavorite(product.id)}
              aria-label={isFavorite(product.id) ? "Bỏ yêu thích" : "Yêu thích sản phẩm"}
            >
              <Icon name="heart" size={19} />
            </button>
          </div>
          <div className="fashion-combo-offers">
            <div className="fashion-combo-head">
              <span>Mua kèm ưu đãi</span>
              <strong>{selectedOffer.title}</strong>
            </div>
            {comboOffers.map((offer) => (
              <button
                key={offer.id}
                type="button"
                className={offer.id === selectedOfferId ? "active" : ""}
                onClick={() => setSelectedOfferId(offer.id)}
              >
                <img src={offer.image} alt={offer.title} />
                <div>
                  <span>{offer.tag}</span>
                  <strong>{offer.title}</strong>
                  <small>{offer.description}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="fashion-detail-info">
          <p>{product.category?.name || "Dolia"}</p>
          <h1>{product.name}</h1>
          <div className="fashion-detail-rating">
            <span>{"★".repeat(Math.round(reviewStats.average))}</span>
            <strong>{reviewStats.average.toFixed(1)}</strong>
            <small>{reviewStats.total} đánh giá</small>
          </div>
          <strong className="fashion-detail-price">{formatCurrency(Number(product.price))}</strong>
          <span className="fashion-detail-description">{product.description}</span>

          <div className="fashion-detail-option">
            <div>
              <strong>Màu sắc</strong>
              <span>{selectedColor.name}</span>
            </div>
            <div className="fashion-color-list">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={selectedColor.name === color.name ? "active" : ""}
                  style={{ background: color.value }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          <div className="fashion-detail-option">
            <div>
              <strong>Kích thước</strong>
              <span>Đang chọn size {selectedSize}</span>
            </div>
            <div className="fashion-size-list">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={selectedSize === size ? "active" : ""}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="fashion-detail-actions">
            <label>
              Số lượng
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(event) => setQuantity(Math.min(Math.max(Number(event.target.value) || 1, 1), product.stock))}
              />
            </label>
            <button type="button" onClick={handleAddToCart}>
              Thêm vào giỏ
            </button>
            <button type="button" className="fashion-buy-now-button" onClick={handleBuyNow}>
              Mua ngay
            </button>
            <button
              type="button"
              className={`detail-wishlist-button ${isFavorite(product.id) ? "active" : ""}`}
              onClick={handleToggleFavorite}
              aria-pressed={isFavorite(product.id)}
            >
              <Icon name="heart" size={18} />
              {isFavorite(product.id) ? "Đã yêu thích" : "Yêu thích"}
            </button>
          </div>

          <div className="fashion-detail-notes">
            <span>Còn {product.stock} sản phẩm trong kho</span>
            <span>Đổi trả trong 7 ngày</span>
            <span>Miễn phí vận chuyển từ 699K</span>
          </div>
        </div>
      </div>

      <div className="fashion-detail-sections">
        <article>
          <p>Product Story</p>
          <h2>Mô tả chi tiết</h2>
          <span>
            {product.name} được chọn cho tủ đồ hằng ngày với phom dáng gọn, dễ phối và phù hợp nhiều hoàn cảnh. Bề mặt
            vải ưu tiên cảm giác mềm nhẹ, giữ màu tốt và ít nhăn khi sử dụng thường xuyên.
          </span>
          <ul>
            <li>Phom vừa vặn, dễ phối cùng áo khoác, túi và giày tối giản.</li>
            <li>Đường may chắc, xử lý mép gọn để giữ dáng sau nhiều lần mặc.</li>
            <li>Gợi ý giặt nhẹ, phơi trong bóng râm và là ở nhiệt độ thấp.</li>
          </ul>
        </article>
        <article>
          <p>Fit Guide</p>
          <h2>Chọn size</h2>
          <div className="fashion-size-table">
            <span>S</span>
            <strong>42-48kg</strong>
            <span>M</span>
            <strong>49-55kg</strong>
            <span>L</span>
            <strong>56-62kg</strong>
            <span>XL</span>
            <strong>63-70kg</strong>
          </div>
        </article>
      </div>

      <section className="fashion-detail-reviews">
        <div className="fashion-review-head">
          <div>
            <p>Dolia Reviews</p>
            <h2>Đánh giá và bình luận</h2>
          </div>
          <span id="product-review-count">{reviewStats.total} phản hồi từ khách hàng</span>
        </div>

        <div className="fashion-review-board">
          <div className="fashion-review-summary">
            <strong>{reviewStats.average.toFixed(1)}</strong>
            <span>★★★★★</span>
            <small>Điểm trung bình cho sản phẩm này</small>
            <ul>
              {reviewStats.counts.map((item) => (
                <li key={item.star}>
                  <span>{item.star} sao</span>
                  <i>
                    <b style={{ width: `${reviewStats.total ? (item.count / reviewStats.total) * 100 : 0}%` }} />
                  </i>
                  <small>{item.count}</small>
                </li>
              ))}
            </ul>
          </div>

          <div className="fashion-review-list">
            {visibleReviews.map((review) => (
              <article key={review.id}>
                <div className="fashion-review-author">
                  <i>{review.name.charAt(0)}</i>
                  <div>
                    <strong>{review.name}</strong>
                    <small>Đã mua tại Dolia</small>
                  </div>
                  <span>{"★".repeat(review.rating)}</span>
                </div>
                <p>{review.text}</p>
                {review.image && <img className="fashion-review-photo" src={review.image} alt={`Feedback của ${review.name}`} />}
                <footer>
                  <span>Phù hợp mô tả</span>
                  <span>Đúng size</span>
                  <span>Chất liệu đẹp</span>
                </footer>
              </article>
            ))}
            {reviews.length > 3 && (
              <button
                type="button"
                className="fashion-review-more"
                onClick={() => setShowAllReviews((current) => !current)}
              >
                {showAllReviews ? "Thu gọn" : "Show more"}
              </button>
            )}
          </div>

          <form className="fashion-review-form" id="product-review-form" onSubmit={handleReviewSubmit}>
            <p>Viết đánh giá</p>
            <h2>Bạn thấy sản phẩm này thế nào?</h2>
            <div className="fashion-review-picker">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className={rating <= reviewRating ? "active" : ""}
                  onClick={() => setReviewRating(rating)}
                  aria-label={`${rating} sao`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              id="product-review-text"
              name="reviewText"
              aria-label="Nội dung đánh giá"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Chia sẻ cảm nhận về form dáng, chất liệu, màu sắc..."
            />
            <label className="fashion-review-upload">
              <input
                id="product-review-image"
                name="reviewImage"
                type="file"
                accept="image/*"
                onChange={handleReviewImageChange}
              />
              <Icon name="upload" size={18} />
              <span>{reviewImage ? "Đổi ảnh feedback" : "Thêm ảnh feedback"}</span>
            </label>
            {reviewImage && (
              <div className="fashion-review-preview">
                <img src={reviewImage} alt="Ảnh feedback xem trước" />
                <button type="button" onClick={() => setReviewImage("")}>
                  Xóa ảnh
                </button>
              </div>
            )}
            <button id="product-review-submit" type="submit">Gửi đánh giá</button>
          </form>
        </div>
      </section>
    </section>
  );
}

export default ProductDetail;
