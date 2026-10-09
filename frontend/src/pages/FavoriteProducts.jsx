import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { getProductById } from "../services/productService";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { useWishlist } from "../hooks/useWishlist";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

function FavoriteProducts() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { favoriteIds, isFavorite, toggleFavorite } = useWishlist();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const productIds = favoriteIds.filter((id) => !String(id).startsWith("fallback"));

    const loadFavorites = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled(productIds.map((id) => getProductById(id)));
        if (mounted) {
          setProducts(results.filter((result) => result.status === "fulfilled").map((result) => result.value));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, [favoriteIds]);

  const totalStock = useMemo(() => products.reduce((sum, product) => sum + Number(product.stock || 0), 0), [products]);

  const handleAddToCart = async (product) => {
    if (!user) {
      showToast("Vui lòng đăng nhập để thêm sản phẩm", "error");
      navigate("/login");
      return;
    }

    try {
      await addToCart({ product_id: product.id, quantity: 1 });
      showToast("Đã thêm vào giỏ hàng");
    } catch (error) {
      showToast(error.response?.data?.message || "Không thể thêm vào giỏ hàng", "error");
    }
  };

  const handleToggleFavorite = (event, product) => {
    event.preventDefault();
    event.stopPropagation();
    const wasFavorite = isFavorite(product.id);
    toggleFavorite(product.id);
    showToast(wasFavorite ? "Đã bỏ khỏi yêu thích" : "Đã thêm vào yêu thích");
  };

  return (
    <section className="fashion-favorites-page">
      <div className="fashion-category-stats">
        <article>
          <span>Đang hiển thị</span>
          <strong>{loading ? "..." : products.length}</strong>
        </article>
        <article>
          <span>Tổng tồn kho</span>
          <strong>{loading ? "..." : totalStock}</strong>
        </article>
        <article>
          <span>Thao tác nhanh</span>
          <strong>Tim</strong>
        </article>
      </div>

      {loading ? (
        <div className="fashion-category-empty">Đang tải sản phẩm yêu thích...</div>
      ) : products.length ? (
        <div className="fashion-product-grid">
          {products.map((product) => (
            <article key={product.id} className="fashion-product-card">
              <Link to={`/products/${product.id}`}>
                <img src={product.image} alt={product.name} />
              </Link>
              <button
                type="button"
                className={`fashion-wishlist-button ${isFavorite(product.id) ? "active" : ""}`}
                onClick={(event) => handleToggleFavorite(event, product)}
                aria-pressed={isFavorite(product.id)}
                aria-label={isFavorite(product.id) ? "Bỏ yêu thích" : "Yêu thích sản phẩm"}
              >
                <Icon name="heart" size={19} />
              </button>
              <div>
                <span>{product.category?.name || "Dolia"}</span>
                <Link to={`/products/${product.id}`}>{product.name}</Link>
                <strong>{formatCurrency(Number(product.price))}</strong>
                <small>Còn {product.stock} sản phẩm</small>
              </div>
              <button type="button" onClick={() => handleAddToCart(product)}>
                Thêm vào giỏ
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="fashion-category-empty">
          <h2>Chưa có sản phẩm yêu thích.</h2>
          <Link to="/">Khám phá sản phẩm</Link>
        </div>
      )}
    </section>
  );
}

export default FavoriteProducts;
