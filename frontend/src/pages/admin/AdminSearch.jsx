import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAdminOrders } from "../../services/orderService";
import { getProducts } from "../../services/productService";
import { getUsers } from "../../services/userService";

const adminFetchPageSize = 100;

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getOrderCode = (id) => `DH${String(id).padStart(3, "0")}`;
const getCustomerCode = (id) => `KH${String(id).padStart(3, "0")}`;
const getProductCode = (id) => `SP-${String(id).padStart(3, "0")}`;

const getBrand = (name = "") => {
  const knownBrands = ["Nike", "Adidas", "Uniqlo", "Zara", "H&M", "Dolia"];
  return knownBrands.find((brand) => name.toLowerCase().includes(brand.toLowerCase())) || "Dolia";
};

function AdminSearch() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const keyword = (searchParams.get("search") || "").trim();
  const normalizedKeyword = keyword.toLowerCase();

  useEffect(() => {
    const fetchAllProducts = async () => {
      const firstPage = await getProducts({ page: 1, limit: adminFetchPageSize });
      const firstProducts = firstPage.products || [];
      const totalPages = firstPage.pagination?.totalPages || 1;

      if (totalPages <= 1) {
        return firstProducts;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          getProducts({ page: index + 2, limit: adminFetchPageSize })
        )
      );

      return [
        ...firstProducts,
        ...remainingPages.flatMap((pageData) => pageData.products || []),
      ];
    };

    const loadData = async () => {
      setLoading(true);
      try {
        const [orderData, productData, userData] = await Promise.all([
          getAdminOrders(),
          fetchAllProducts(),
          getUsers(),
        ]);

        setOrders(orderData);
        setProducts(productData);
        setUsers(userData);
      } catch {
        setOrders([]);
        setProducts([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!normalizedKeyword) return [];

    return orders.filter((order) => {
      const haystack = [
        getOrderCode(order.id),
        order.user?.name,
        order.user?.email,
        order.address,
        order.status,
        ...((order.items || []).map((item) => item.product?.name)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedKeyword);
    });
  }, [normalizedKeyword, orders]);

  const filteredUsers = useMemo(() => {
    if (!normalizedKeyword) return [];

    return users
      .filter((user) => user.role !== "admin")
      .filter((user) => {
        const haystack = [
          getCustomerCode(user.id),
          user.name,
          user.email,
          user.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedKeyword);
      });
  }, [normalizedKeyword, users]);

  const filteredProducts = useMemo(() => {
    if (!normalizedKeyword) return [];

    return products.filter((product) => {
      const haystack = [
        getProductCode(product.id),
        product.name,
        product.category?.name,
        product.description,
        getBrand(product.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedKeyword);
    });
  }, [normalizedKeyword, products]);

  const totalResults = filteredOrders.length + filteredUsers.length + filteredProducts.length;

  return (
    <section className="admin-overview">
      <div className="admin-overview-heading">
        <div>
          <p className="admin-home-kicker">Unified Admin Search</p>
          <h1>Kết quả tìm kiếm quản trị</h1>
        </div>
        <span>{keyword ? `"${keyword}"` : "Nhập từ khóa để tìm kiếm"}</span>
      </div>

      <div className="overview-kpi-grid">
        <article>
          <span>Tổng kết quả</span>
          <strong>{loading ? "..." : totalResults}</strong>
          <small>Đơn hàng, khách hàng, sản phẩm</small>
        </article>
        <article>
          <span>Đơn hàng</span>
          <strong>{loading ? "..." : filteredOrders.length}</strong>
          <small>Khớp theo mã đơn, khách hàng, địa chỉ</small>
        </article>
        <article>
          <span>Khách hàng</span>
          <strong>{loading ? "..." : filteredUsers.length}</strong>
          <small>Khớp theo mã KH, tên, email, số điện thoại</small>
        </article>
        <article>
          <span>Sản phẩm</span>
          <strong>{loading ? "..." : filteredProducts.length}</strong>
          <small>Khớp theo mã SP, tên, danh mục, mô tả</small>
        </article>
      </div>

      <div className="overview-grid">
        <section className="overview-panel">
          <div className="overview-panel-head">
            <h2>Đơn hàng</h2>
            <Link to={keyword ? `/admin/orders?search=${encodeURIComponent(keyword)}` : "/admin/orders"}>
              Mở trang đơn hàng
            </Link>
          </div>
          <div className="overview-product-list">
            {filteredOrders.slice(0, 5).map((order) => (
              <article key={order.id}>
                <div>
                  <strong>{getOrderCode(order.id)} · {order.user?.name || "Khách lẻ"}</strong>
                  <span>{order.user?.email || order.address || "Không có thông tin phụ"}</span>
                </div>
              </article>
            ))}
            {!loading && !filteredOrders.length && <article><div><strong>Không có đơn hàng phù hợp</strong></div></article>}
          </div>
        </section>

        <section className="overview-panel">
          <div className="overview-panel-head">
            <h2>Khách hàng</h2>
            <Link to={keyword ? `/admin/users?search=${encodeURIComponent(keyword)}` : "/admin/users"}>
              Mở trang khách hàng
            </Link>
          </div>
          <div className="overview-product-list">
            {filteredUsers.slice(0, 5).map((user) => (
              <article key={user.id}>
                <div>
                  <strong>{getCustomerCode(user.id)} · {user.name}</strong>
                  <span>{[user.email, user.phone].filter(Boolean).join(" · ") || "Không có thông tin phụ"}</span>
                </div>
              </article>
            ))}
            {!loading && !filteredUsers.length && <article><div><strong>Không có khách hàng phù hợp</strong></div></article>}
          </div>
        </section>

        <section className="overview-panel overview-products-panel">
          <div className="overview-panel-head">
            <h2>Sản phẩm</h2>
            <Link to={keyword ? `/admin/products?search=${encodeURIComponent(keyword)}` : "/admin/products"}>
              Mở trang sản phẩm
            </Link>
          </div>
          <div className="overview-product-list">
            {filteredProducts.slice(0, 6).map((product) => (
              <article key={product.id}>
                <img
                  src={
                    product.image ||
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=140&q=80"
                  }
                  alt={product.name}
                />
                <div>
                  <strong>{product.name}</strong>
                  <span>{getProductCode(product.id)} · {product.category?.name || "Chưa có danh mục"}</span>
                  <span>{formatCurrency(Number(product.price))}</span>
                </div>
              </article>
            ))}
            {!loading && !filteredProducts.length && <article><div><strong>Không có sản phẩm phù hợp</strong></div></article>}
          </div>
        </section>
      </div>
    </section>
  );
}

export default AdminSearch;
