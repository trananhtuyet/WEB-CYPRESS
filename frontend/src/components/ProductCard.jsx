import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { useWishlist } from "../hooks/useWishlist";
import Icon from "./Icon";

function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isFavorite, toggleFavorite } = useWishlist();

  const handleAddToCart = async () => {
    if (!user) {
      showToast("Please login to add products to cart", "error");
      return;
    }

    if (user.role !== "user") {
      showToast("Admin accounts cannot add products to cart", "error");
      return;
    }

    try {
      await addToCart({ product_id: product.id, quantity: 1 });
      showToast("Added to cart");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to add to cart", "error");
    }
  };

  const handleToggleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const wasFavorite = isFavorite(product.id);
    toggleFavorite(product.id);
    showToast(wasFavorite ? "Đã bỏ khỏi yêu thích" : "Đã thêm vào yêu thích");
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
      </Link>
      <button
        type="button"
        className={`fashion-wishlist-button ${isFavorite(product.id) ? "active" : ""}`}
        onClick={handleToggleFavorite}
        aria-pressed={isFavorite(product.id)}
        aria-label={isFavorite(product.id) ? "Bỏ yêu thích" : "Yêu thích sản phẩm"}
      >
        <Icon name="heart" size={18} />
      </button>
      <div className="product-card-body">
        <span className="product-category">{product.category?.name}</span>
        <Link to={`/products/${product.id}`} className="product-title">
          {product.name}
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <strong>${Number(product.price).toFixed(2)}</strong>
          <span>{product.stock} in stock</span>
        </div>
        <button type="button" className="primary-button full-width" onClick={handleAddToCart}>
          Add To Cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
