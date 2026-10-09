import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import BrandLogo from "../components/BrandLogo";
import { getCategories } from "../services/categoryService";
import { getProducts } from "../services/productService";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { useWishlist } from "../hooks/useWishlist";

const defaultFilters = {
  search: "",
  categoryId: "",
  minPrice: "",
  maxPrice: "",
};

const fallbackProducts = [
  {
    id: "fallback-1",
    name: "Polo Pique Classic Fit Signature",
    price: 1250000,
    stock: 27,
    image: "https://images.pexels.com/photos/36701798/pexels-photo-36701798.jpeg?cs=srgb&dl=pexels-sueda-guzeldere-774990922-36701798.jpg&fm=jpg",
    category: { name: "Áo" },
  },
  {
    id: "fallback-2",
    name: "Charles & Keith Guốc Hở Mũi Metallic",
    price: 890000,
    stock: 23,
    image: "https://images.pexels.com/photos/26796155/pexels-photo-26796155.jpeg?cs=srgb&dl=pexels-jose-martin-segura-benites-1422456152-26796155.jpg&fm=jpg",
    category: { name: "Giày" },
  },
  {
    id: "fallback-3",
    name: "PNJ Lắc Tay Bạc Đính Đá Synthetic",
    price: 390000,
    stock: 41,
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=90",
    category: { name: "Phụ Kiện" },
  },
  {
    id: "fallback-4",
    name: "Quần Tây Slim Fit",
    price: 980000,
    stock: 18,
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=90",
    category: { name: "Quần" },
  },
  {
    id: "fallback-5",
    name: "Đầm Lụa Trễ Vai Phối Nơ",
    price: 1180000,
    stock: 16,
    image: "https://images.pexels.com/photos/5487611/pexels-photo-5487611.jpeg?cs=srgb&dl=pexels-tubarones-5487611.jpg&fm=jpg",
    category: { name: "Đầm" },
  },
  {
    id: "fallback-6",
    name: "Polo Bamboo Soft Touch Zip",
    price: 760000,
    stock: 32,
    image: "https://images.pexels.com/photos/17253004/pexels-photo-17253004.jpeg?cs=srgb&dl=pexels-chupanhchandung-17253004.jpg&fm=jpg",
    category: { name: "Áo" },
  },
  {
    id: "fallback-7",
    name: "Chân Váy Xếp Ly",
    price: 690000,
    stock: 20,
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=90",
    category: { name: "Váy" },
  },
  {
    id: "fallback-8",
    name: "Polo Minimal Balcony Black",
    price: 1450000,
    stock: 14,
    image: "https://images.pexels.com/photos/6029254/pexels-photo-6029254.jpeg?cs=srgb&dl=pexels-dothanhyb-6029254.jpg&fm=jpg",
    category: { name: "Áo" },
  },
  {
    id: "fallback-9",
    name: "Túi Đeo Vai Mini",
    price: 520000,
    stock: 25,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=90",
    category: { name: "Túi Xách" },
  },
  {
    id: "fallback-10",
    name: "H&M Guốc Mule Gót Vuông",
    price: 990000,
    stock: 19,
    image: "https://images.pexels.com/photos/9267600/pexels-photo-9267600.jpeg?cs=srgb&dl=pexels-denys-9267600.jpg&fm=jpg",
    category: { name: "Giày" },
  },
  {
    id: "fallback-11",
    name: "Gentle Monster Lilit 01",
    price: 420000,
    stock: 38,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=90",
    category: { name: "Kính" },
  },
  {
    id: "fallback-12",
    name: "Quần Jean Ống Đứng",
    price: 860000,
    stock: 22,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=90",
    category: { name: "Quần" },
  },
];

const categoryImages = {
  "Áo": "https://images.pexels.com/photos/36701798/pexels-photo-36701798.jpeg?cs=srgb&dl=pexels-sueda-guzeldere-774990922-36701798.jpg&fm=jpg",
  "Đầm": "https://images.pexels.com/photos/14108017/pexels-photo-14108017.jpeg?cs=srgb&dl=pexels-addy-bronzzz-264850064-14108017.jpg&fm=jpg",
  "Giày": "https://images.pexels.com/photos/31450734/pexels-photo-31450734.jpeg?cs=srgb&dl=pexels-pedro-furtado-2149998739-31450734.jpg&fm=jpg",
  "Kính": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
  "Phụ Kiện": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
  "Quần": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
  "Túi Xách": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
  "Váy": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
};

const initialComments = [
  {
    id: 1,
    name: "Minh Anh",
    rating: 5,
    text: "Form áo rất đẹp, chất vải mềm và mặc lên đứng dáng hơn mình nghĩ.",
  },
  {
    id: 2,
    name: "Hoàng Linh",
    rating: 5,
    text: "Đóng gói chỉn chu, màu sản phẩm giống ảnh và phối đồ khá dễ.",
  },
  {
    id: 3,
    name: "Ngọc Hân",
    rating: 4,
    text: "Mình thích phần tư vấn size, nhận hàng vừa người và giao nhanh.",
  },
];

const heroSlides = [
  {
    kicker: "New Collection 2026",
    title: "Phong cách tối giản cho ngày thật tự tin.",
    description: "Khám phá các thiết kế Dolia mới nhất: form dáng tinh gọn, chất liệu dễ chịu và bảng màu dễ phối.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
    primaryLink: "#new",
    primaryText: "Mua ngay",
    secondaryLink: "#story",
    secondaryText: "Xem câu chuyện",
  },
  {
    kicker: "Soft Tailoring",
    title: "Dáng may thanh lịch cho mọi lịch hẹn.",
    description: "Những món đồ dễ mặc, giữ phom tốt và đủ chỉn chu cho công sở lẫn cuối tuần.",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85",
    primaryLink: "#best",
    primaryText: "Xem bán chạy",
    secondaryLink: "#categories",
    secondaryText: "Chọn danh mục",
  },
  {
    kicker: "Everyday Essentials",
    title: "Phụ kiện nhỏ, điểm nhấn rất riêng.",
    description: "Túi, kính và giày được chọn để hoàn thiện outfit hằng ngày mà không cần cầu kỳ.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85",
    primaryLink: "#categories",
    primaryText: "Khám phá ngay",
    secondaryLink: "#new",
    secondaryText: "Sản phẩm mới",
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getProductMood = (index) =>
  [
    { label: "New Muse", note: "Soft tailoring", accent: "rose" },
    { label: "Editors Pick", note: "Clean silhouette", accent: "gold" },
    { label: "Daily Chic", note: "Seoul everyday", accent: "ink" },
    { label: "Best Shape", note: "Modern wardrobe", accent: "rose" },
  ][index % 4];

const getBestSellerBadge = (index) => ["Top Rated", "Most Wanted", "Best Seller"][index % 3];

const getProductEyebrow = (product) => {
  const category = product.category?.name || "Dolia";
  const collectionByCategory = {
    "Áo": "Polo edit",
    "Đầm": "Dress edit",
    "Giày": "Shoe focus",
    "Kính": "Eyewear pick",
    "Phụ Kiện": "Accessory note",
    "Quần": "Bottom edit",
    "Túi Xách": "Bag highlight",
    "Váy": "Skirt muse",
  };

  if (product.name?.toLowerCase().startsWith(category.toLowerCase())) {
    return collectionByCategory[category] || category;
  }

  return category;
};

function Home() {
  const { user, logout } = useAuth();
  const { cart, addToCart } = useCart();
  const { showToast } = useToast();
  const { favoriteCount, isFavorite, toggleFavorite } = useWishlist();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [showAllComments, setShowAllComments] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (page = 1, override = filters) => {
    setLoading(true);
    try {
      const data = await getProducts({ ...override, page, limit: 12 });
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const search = searchParams.get("search") || "";
    setFilters((current) => {
      if (current.search === search) return current;
      return { ...current, search };
    });
    fetchProducts(1, { ...filters, search });
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const hasActiveFilters = Boolean(
    filters.search.trim() || filters.categoryId || filters.minPrice || filters.maxPrice
  );
  const displayProducts = !hasActiveFilters && !products.length ? fallbackProducts : products;
  const featuredProducts = displayProducts.slice(0, 8);
  const bestProducts = displayProducts.slice(0, 9);
  const showEmptyResults = !loading && hasActiveFilters && !displayProducts.length;
  const categoryCards = useMemo(() => {
    const source = categories.length
      ? categories
      : [
          { id: "ao", name: "Áo" },
          { id: "quan", name: "Quần" },
          { id: "giay", name: "Giày" },
          { id: "phukien", name: "Phụ Kiện" },
          { id: "dam", name: "Đầm" },
          { id: "vay", name: "Váy" },
          { id: "tui", name: "Túi Xách" },
          { id: "kinh", name: "Kính" },
        ];

    return source.slice(0, 8);
  }, [categories]);
  const commentStats = useMemo(() => {
    const total = comments.length || 1;
    const average = comments.reduce((sum, comment) => sum + comment.rating, 0) / total;
    const counts = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: comments.filter((comment) => comment.rating === star).length,
    }));

    return { average, counts, total: comments.length };
  }, [comments]);
  const visibleComments = showAllComments ? comments : comments.slice(0, 3);
  const currentHeroSlide = heroSlides[activeHeroSlide];

  const handleSearchChange = (event) => {
    setFilters((current) => ({ ...current, search: event.target.value }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const keyword = filters.search.trim();
    setSearchParams(keyword ? { search: keyword } : {});
  };

  const getProductLink = (product) => (String(product.id).startsWith("fallback") ? "/" : `/products/${product.id}`);

  const handleAddToCart = async (product) => {
    if (!user) {
      showToast("Vui lòng đăng nhập để thêm sản phẩm", "error");
      navigate("/login");
      return;
    }

    if (String(product.id).startsWith("fallback")) {
      showToast("Sản phẩm mẫu chưa có trong kho", "error");
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    const text = commentText.trim();

    if (!text) {
      showToast("Vui lòng nhập bình luận", "error");
      return;
    }

    setComments((current) => [
      {
        id: Date.now(),
        name: user?.name || "Khách hàng",
        rating: commentRating,
        text,
      },
      ...current,
    ]);
    setCommentText("");
    setCommentRating(5);
    setShowAllComments(false);
    showToast("Đã thêm bình luận");
  };

  return (
    <section className="fashion-home">
      <div className="fashion-top-strip">
        <span>Miễn phí vận chuyển cho đơn từ 699K</span>
        <span>Hotline: 091 140 8966</span>
        <span>Đổi trả trong 7 ngày</span>
      </div>

      <header className="fashion-header">
        <Link to="/" className="fashion-brand">
          <BrandLogo theme="header" />
        </Link>

        <form className="fashion-search" role="search" onSubmit={handleSearchSubmit}>
          <button className="fashion-search-submit" type="submit" aria-label="Tìm kiếm">
            <Icon name="search" />
          </button>
          <input
            value={filters.search}
            onChange={handleSearchChange}
            type="search"
            placeholder="Tìm áo, quần, giày, phụ kiện..."
          />
        </form>

        <div className="fashion-header-actions">
          <Link to="/favorites" aria-label="Sản phẩm yêu thích">
            <Icon name="heart" size={20} />
            <span>{favoriteCount}</span>
          </Link>
          <Link to="/cart" aria-label="Giỏ hàng">
            <Icon name="cart" size={20} />
            <span>{cart.items?.length || 0}</span>
          </Link>
          {user ? (
            <>
              <Link to="/account" aria-label="Tài khoản">
                {user.avatar ? <img className="fashion-header-avatar" src={user.avatar} alt={user.name} /> : <Icon name="account" size={20} />}
                <strong>{user.name}</strong>
              </Link>
              <button
                id="header-logout-button"
                type="button"
                className="fashion-icon-action"
                onClick={handleLogout}
                aria-label="Đăng xuất"
              >
                <Icon name="logout" size={20} />
              </button>
            </>
          ) : (
            <Link id="header-login-link" to="/login" reloadDocument>Đăng nhập</Link>
          )}
        </div>
      </header>

      <nav className="fashion-nav">
        <a href="#home">Trang chủ</a>
        <a href="#categories">Danh mục</a>
        <a href="#new">Sản phẩm mới</a>
        <a href="#best">Bán chạy</a>
        <a href="#story">Thương hiệu</a>
        <Link to="/contact">Liên hệ</Link>
        <Link to="/orders">Đơn hàng</Link>
      </nav>

      <main id="home" className="fashion-main">
        <section className="fashion-hero">
          <div className="fashion-hero-copy">
            <p>{currentHeroSlide.kicker}</p>
            <h1>{currentHeroSlide.title}</h1>
            <span>{currentHeroSlide.description}</span>
            <div>
              <a href={currentHeroSlide.primaryLink}>{currentHeroSlide.primaryText}</a>
              <a href={currentHeroSlide.secondaryLink}>{currentHeroSlide.secondaryText}</a>
            </div>
            <div className="fashion-hero-controls" aria-label="Chọn banner">
              <button
                type="button"
                onClick={() => setActiveHeroSlide((current) => (current + heroSlides.length - 1) % heroSlides.length)}
                aria-label="Banner trước"
              >
                ‹
              </button>
              <div>
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    className={index === activeHeroSlide ? "active" : ""}
                    onClick={() => setActiveHeroSlide(index)}
                    aria-label={`Chuyển đến banner ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setActiveHeroSlide((current) => (current + 1) % heroSlides.length)}
                aria-label="Banner tiếp theo"
              >
                ›
              </button>
            </div>
          </div>
          <div className="fashion-hero-image">
            <img
              key={currentHeroSlide.image}
              src={currentHeroSlide.image}
              alt={currentHeroSlide.title}
            />
          </div>
        </section>

        <section className="fashion-services">
          <article>
            <Icon name="upload" />
            <strong>Giao hàng nhanh</strong>
            <span>Nhận hàng 2-4 ngày</span>
          </article>
          <article>
            <Icon name="repeat" />
            <strong>Đổi trả dễ dàng</strong>
            <span>Hỗ trợ trong 7 ngày</span>
          </article>
          <article>
            <Icon name="check" />
            <strong>Chất liệu chọn lọc</strong>
            <span>Thoáng nhẹ, bền dáng</span>
          </article>
          <article>
            <Icon name="money" />
            <strong>Ưu đãi thành viên</strong>
            <span>Tích điểm mỗi đơn</span>
          </article>
        </section>

        <section id="categories" className="fashion-section">
          <div className="fashion-section-head">
            <p>Dolia Categories</p>
            <h2>Danh mục nổi bật</h2>
          </div>
          <div className="fashion-category-grid">
            {categoryCards.map((category, index) => (
              <Link key={category.id} to={`/categories/${category.id}`}>
                <img
                  src={categoryImages[category.name] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80"}
                  alt={category.name}
                />
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section id="new" className="fashion-section">
          <div className="fashion-section-head split">
            <div>
              <p>Just In</p>
              <h2>Sản phẩm mới</h2>
            </div>
            <span>{loading ? "Đang tải..." : `${displayProducts.length} sản phẩm`}</span>
          </div>
          {showEmptyResults ? (
            <div className="fashion-empty-state">
              <strong>Không tìm thấy sản phẩm phù hợp.</strong>
              <span>Thử từ khóa khác như tên sản phẩm hoặc danh mục: áo, quần, giày, phụ kiện.</span>
            </div>
          ) : (
            <div className="fashion-product-grid">
              {featuredProducts.map((product, index) => {
                const mood = getProductMood(index);
                return (
                  <article key={product.id} className="fashion-product-card">
                    <Link to={getProductLink(product)} className="fashion-product-visual">
                      <img src={product.image} alt={product.name} />
                      <div className="fashion-product-overlay">
                        <span className={`fashion-product-badge ${mood.accent}`}>{mood.label}</span>
                        <small>{mood.note}</small>
                      </div>
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
                    <div className="fashion-product-body">
                      <div className="fashion-product-copy">
                        <span>{getProductEyebrow(product)}</span>
                        <Link to={getProductLink(product)}>{product.name}</Link>
                        <p>{product.description || "Thiết kế hiện đại, dễ phối và hợp nhịp sống hằng ngày."}</p>
                      </div>
                      <div className="fashion-product-meta-row">
                        <strong>{formatCurrency(Number(product.price))}</strong>
                        <small>{product.stock > 0 ? `${product.stock} san pham san sang` : "Tam het hang"}</small>
                      </div>
                    </div>
                    <button type="button" className="fashion-product-action" onClick={() => handleAddToCart(product)}>
                      Them vao tu do do
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="story" className="fashion-story">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
            alt="Dolia styling"
          />
          <div>
            <p>Dolia Philosophy</p>
            <h2>Mặc đẹp không cần phức tạp.</h2>
            <span>
              Chúng tôi chọn phom dáng ứng dụng, chất liệu dễ chăm sóc và màu sắc có thể phối nhiều lần để mỗi món đồ
              đều đáng có trong tủ.
            </span>
            <a href="#best">Xem sản phẩm bán chạy</a>
          </div>
        </section>

        <section id="best" className="fashion-section">
          <div className="fashion-section-head">
            <p>Customer Favorites</p>
            <h2>Bán chạy nhất</h2>
          </div>
          {showEmptyResults ? (
            <div className="fashion-empty-state">
              <strong>Chưa có sản phẩm trong danh sách bán chạy cho từ khóa này.</strong>
              <span>Hãy thử bỏ bớt từ khóa hoặc tìm theo danh mục gần đúng.</span>
            </div>
          ) : (
            <div className="fashion-best-grid">
              {bestProducts.map((product, index) => (
                <article key={product.id}>
                  <Link to={getProductLink(product)} className="fashion-best-image">
                    <img src={product.image} alt={product.name} />
                  </Link>
                  <button
                    type="button"
                    className={`fashion-wishlist-button ${isFavorite(product.id) ? "active" : ""}`}
                    onClick={(event) => handleToggleFavorite(event, product)}
                    aria-pressed={isFavorite(product.id)}
                    aria-label={isFavorite(product.id) ? "Bỏ yêu thích" : "Yêu thích sản phẩm"}
                  >
                    <Icon name="heart" size={18} />
                  </button>
                  <div>
                    <span>{getBestSellerBadge(index)}</span>
                    <Link to={getProductLink(product)}>{product.name}</Link>
                    <p>{getProductEyebrow(product)} · Clean fit edit</p>
                    <small>{formatCurrency(Number(product.price))}</small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="fashion-comments">
          <div className="fashion-comment-head">
            <div>
              <p>Dolia Reviews</p>
              <h2>Bình luận và đánh giá</h2>
            </div>
            <span id="home-comment-count">{commentStats.total} đánh giá đã gửi</span>
          </div>
          <div className="fashion-comment-layout">
            <aside className="fashion-rating-summary">
              <div>
                <strong>{commentStats.average.toFixed(1)}</strong>
                <span>★★★★★</span>
                <small>Điểm trung bình từ khách hàng</small>
              </div>
              <ul>
                {commentStats.counts.map((item) => (
                  <li key={item.star}>
                    <span>{item.star} sao</span>
                    <i>
                      <b style={{ width: `${commentStats.total ? (item.count / commentStats.total) * 100 : 0}%` }} />
                    </i>
                    <small>{item.count}</small>
                  </li>
                ))}
              </ul>
            </aside>
            <div className="fashion-comment-list">
              {visibleComments.map((comment) => (
                <article key={comment.id}>
                  <div className="fashion-comment-author">
                    <i>{comment.name.charAt(0)}</i>
                    <div>
                      <strong>{comment.name}</strong>
                      <small>Đã mua tại Dolia</small>
                    </div>
                    <span>{"★".repeat(comment.rating)}</span>
                  </div>
                  <p>{comment.text}</p>
                </article>
              ))}
              {comments.length > 3 && (
                <button
                  type="button"
                  className="fashion-comment-more"
                  onClick={() => setShowAllComments((current) => !current)}
                >
                  {showAllComments ? "Thu gọn" : "Xem thêm bình luận"}
                </button>
              )}
            </div>
            <form id="home-comment-form" className="fashion-comment-form" onSubmit={handleCommentSubmit}>
              <p>Chia sẻ trải nghiệm</p>
              <h3>Bạn thấy sản phẩm Dolia thế nào?</h3>
              <div className="fashion-rating-picker" aria-label="Chọn số sao">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className={rating <= commentRating ? "active" : ""}
                    onClick={() => setCommentRating(rating)}
                    aria-label={`${rating} sao`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                id="home-comment-text"
                name="commentText"
                aria-label="Nội dung bình luận trang chủ"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Nhập bình luận của bạn..."
              />
              <button id="home-comment-submit" type="submit">Gửi bình luận</button>
            </form>
          </div>
        </section>

        <section className="fashion-newsletter">
          <div>
            <p>Đăng ký nhận tin</p>
            <h2>Nhận lookbook và ưu đãi mới mỗi tuần.</h2>
          </div>
          <form>
            <input type="email" placeholder="Email của bạn" />
            <button type="submit">Đăng ký</button>
          </form>
        </section>

        <footer className="fashion-footer">
          <div>
            <Link to="/" className="fashion-footer-brand">
              <BrandLogo theme="footer" showTagline={false} />
            </Link>
            <p>Thời trang tối giản, dễ mặc và bền dáng cho nhịp sống hằng ngày.</p>
          </div>
          <nav>
            <strong>Mua sắm</strong>
            <a href="#categories">Danh mục</a>
            <a href="#new">Sản phẩm mới</a>
            <a href="#best">Bán chạy</a>
          </nav>
          <nav>
            <strong>Hỗ trợ</strong>
            <Link to="/orders">Đơn hàng</Link>
            <Link to="/cart">Giỏ hàng</Link>
            <Link to="/contact">Liên hệ</Link>
            <a href="tel:0911408966">091 140 8966</a>
          </nav>
          <div>
            <strong>Liên hệ</strong>
            <span>hello@dolia.vn</span>
            <span>48 Nguyễn Trãi, Quận 1</span>
            <Link to="/contact">Gửi yêu cầu hỗ trợ</Link>
            <span>09:00 - 21:00 mỗi ngày</span>
          </div>
        </footer>
      </main>
    </section>
  );
}

export default Home;
