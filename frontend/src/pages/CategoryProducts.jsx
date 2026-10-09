import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import { getCategories } from "../services/categoryService";
import { getProducts } from "../services/productService";
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

const categoryImages = {
  "Áo": "https://images.pexels.com/photos/36701798/pexels-photo-36701798.jpeg?cs=srgb&dl=pexels-sueda-guzeldere-774990922-36701798.jpg&fm=jpg",
  "Đầm": "https://images.pexels.com/photos/14108017/pexels-photo-14108017.jpeg?cs=srgb&dl=pexels-addy-bronzzz-264850064-14108017.jpg&fm=jpg",
  "Giày": "https://images.pexels.com/photos/31450734/pexels-photo-31450734.jpeg?cs=srgb&dl=pexels-pedro-furtado-2149998739-31450734.jpg&fm=jpg",
  "Kính": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=90",
  "Phụ Kiện": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=90",
  "Quần": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=90",
  "Túi Xách": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=90",
  "Váy": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=90",
};

function CategoryProducts() {
  const { categoryId } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isFavorite, toggleFavorite } = useWishlist();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeBannerSlide, setActiveBannerSlide] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0, limit: 8 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCategoryProducts = async () => {
      setLoading(true);
      try {
        const [categoryData, productData] = await Promise.all([
          getCategories().catch(() => []),
          getProducts({ categoryId, page, limit: 8 }),
        ]);

        if (mounted) {
          setCategories(categoryData);
          setProducts(productData.products || []);
          setPagination(productData.pagination || { page, totalPages: 1, totalItems: productData.products?.length || 0, limit: 8 });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCategoryProducts();

    return () => {
      mounted = false;
    };
  }, [categoryId, page]);

  useEffect(() => {
    setActiveBannerSlide(0);
    setPage(1);
  }, [categoryId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBannerSlide((current) => (current + 1) % 4);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const currentCategory = useMemo(
    () => categories.find((category) => String(category.id) === String(categoryId)),
    [categories, categoryId]
  );
  const heroImage =
    categoryImages[currentCategory?.name] ||
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=90";
  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const source = keyword
      ? products.filter((product) => product.name.toLowerCase().includes(keyword))
      : products;

    if (sortBy === "newest") {
      return source;
    }

    return [...source].sort((first, second) => {
      if (sortBy === "price-asc") return Number(first.price) - Number(second.price);
      if (sortBy === "price-desc") return Number(second.price) - Number(first.price);
      if (sortBy === "name") return first.name.localeCompare(second.name, "vi");
      return 0;
    });
  }, [products, searchTerm, sortBy]);
  const prices = products.map((product) => Number(product.price));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const bannerSlides = useMemo(() => {
    const productSlides = products.slice(0, 3).map((product) => ({
      image: product.image,
      label: "Featured piece",
      title: product.name,
    }));

    return [
      {
        image: heroImage,
        label: "Curated edit",
        title: currentCategory?.name || "Dolia",
      },
      ...productSlides,
    ].slice(0, 4);
  }, [currentCategory?.name, heroImage, products]);
  const currentBannerSlide = bannerSlides[activeBannerSlide % bannerSlides.length] || bannerSlides[0];
  const pageNumbers = Array.from({ length: pagination.totalPages || 1 }, (_, index) => index + 1);

  const handlePageChange = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), pagination.totalPages || 1);
    setPage(safePage);
    document.getElementById("category-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
    <section className="fashion-category-page">
      <div className="fashion-category-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <strong>{currentCategory?.name || "Danh mục"}</strong>
      </div>

      <div className="fashion-category-hero">
        <div>
          <p>Dolia Categories</p>
          <h1>{currentCategory?.name || "Danh mục sản phẩm"}</h1>
          <span>
            Chọn những thiết kế phù hợp với phong cách hằng ngày: dễ phối, thoải mái và giữ phom đẹp.
          </span>
          <div className="fashion-category-hero-actions">
            <a href="#category-products">Xem sản phẩm</a>
            <Link to="/cart">Giỏ hàng của bạn</Link>
          </div>
        </div>
        <aside className="fashion-category-visual">
          <img key={currentBannerSlide.image} src={currentBannerSlide.image} alt={currentBannerSlide.title} />
          <div className="fashion-category-visual-label">
            <span>{currentBannerSlide.label}</span>
            <strong>{currentBannerSlide.title}</strong>
          </div>
          <div className="fashion-category-count-card">
            <strong>{loading ? "..." : products.length}</strong>
            <span>Sản phẩm đang có</span>
          </div>
          <div className="fashion-category-banner-controls" aria-label="Chọn banner danh mục">
            {bannerSlides.map((slide, index) => (
              <button
                key={`${slide.image}-${index}`}
                type="button"
                className={index === activeBannerSlide % bannerSlides.length ? "active" : ""}
                onClick={() => setActiveBannerSlide(index)}
                aria-label={`Chuyển đến banner ${index + 1}`}
              />
            ))}
          </div>
        </aside>
      </div>

      <div className="fashion-category-stats">
        <article>
          <span>Sản phẩm</span>
          <strong>{loading ? "..." : products.length}</strong>
        </article>
        <article>
          <span>Giá từ</span>
          <strong>{formatCurrency(minPrice)}</strong>
        </article>
        <article>
          <span>Cao nhất</span>
          <strong>{formatCurrency(maxPrice)}</strong>
        </article>
      </div>

      <div className="fashion-category-toolbar">
        <label>
          <Icon name="search" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            type="search"
            placeholder={`Tìm trong ${currentCategory?.name || "danh mục"}...`}
          />
        </label>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá thấp đến cao</option>
          <option value="price-desc">Giá cao đến thấp</option>
          <option value="name">Tên A-Z</option>
        </select>
      </div>

      <div className="fashion-category-tabs">
        <span>
          {loading
            ? "Đang tải..."
            : `${filteredProducts.length} sản phẩm trang này · ${pagination.totalItems || products.length} sản phẩm tổng`}
        </span>
        <nav>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className={String(category.id) === String(categoryId) ? "active" : ""}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="fashion-category-benefits">
        <article>
          <strong>Form dễ mặc</strong>
          <span>Thiết kế gọn dáng, dễ phối nhiều dịp.</span>
        </article>
        <article>
          <strong>Chất liệu chọn lọc</strong>
          <span>Ưu tiên cảm giác nhẹ, thoáng và bền màu.</span>
        </article>
        <article>
          <strong>Giao nhanh 2-4 ngày</strong>
          <span>Miễn phí vận chuyển cho đơn từ 699K.</span>
        </article>
      </div>

      {loading ? (
        <div className="fashion-category-empty">Đang tải sản phẩm...</div>
      ) : filteredProducts.length ? (
        <>
          <div id="category-products" className="fashion-product-grid">
            {filteredProducts.map((product) => (
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
                  <span>{product.category?.name || currentCategory?.name || "Dolia"}</span>
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
          {pagination.totalPages > 1 && (
            <div className="fashion-category-pagination">
              <button type="button" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                Trước
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={pageNumber === page ? "active" : ""}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button type="button" onClick={() => handlePageChange(page + 1)} disabled={page >= pagination.totalPages}>
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="fashion-category-empty">
          <h2>Chưa có sản phẩm trong danh mục này.</h2>
          <Link to="/">Khám phá danh mục khác</Link>
        </div>
      )}
    </section>
  );
}

export default CategoryProducts;
