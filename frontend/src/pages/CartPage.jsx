import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

function CartPage() {
  const { cart, updateItem, removeItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const selectedItems = useMemo(
    () => cart.items?.filter((item) => selectedProductIds.includes(Number(item.product_id))) || [],
    [cart.items, selectedProductIds]
  );
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const allSelected = Boolean(cart.items?.length) && selectedProductIds.length === cart.items.length;

  useEffect(() => {
    const productIds = cart.items?.map((item) => Number(item.product_id)) || [];
    setSelectedProductIds((current) => {
      const validCurrent = current.filter((id) => productIds.includes(id));
      return validCurrent.length ? validCurrent : productIds;
    });
  }, [cart.items]);

  const toggleProduct = (productId) => {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  };

  const toggleAllProducts = () => {
    setSelectedProductIds(allSelected ? [] : cart.items.map((item) => Number(item.product_id)));
  };

  const handleCheckoutSelected = () => {
    if (!selectedProductIds.length) {
      showToast("Vui lòng chọn ít nhất một sản phẩm để thanh toán", "error");
      return;
    }

    sessionStorage.setItem("dolia_checkout_product_ids", JSON.stringify(selectedProductIds));
    navigate("/checkout");
  };

  if (!cart.items?.length) {
    return (
      <section className="fashion-cart-page">
        <div className="fashion-cart-empty">
          <span>
            <Icon name="cart" size={34} />
          </span>
          <p>Dolia Cart</p>
          <h1>Giỏ hàng của bạn đang trống.</h1>
          <Link to="/">Tiếp tục mua sắm</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="fashion-cart-page">
      <div className="fashion-cart-head">
        <div>
          <p>Dolia Cart</p>
          <h1>Giỏ hàng của bạn</h1>
        </div>
        <Link to="/">Tiếp tục mua sắm</Link>
      </div>

      <div className="fashion-cart-layout">
        <div className="fashion-cart-list">
          <label className="fashion-cart-select-all">
            <input type="checkbox" checked={allSelected} onChange={toggleAllProducts} />
            <span>Chọn tất cả sản phẩm</span>
          </label>
          {cart.items.map((item) => {
            const price = Number(item.product.price);
            const nextQuantity = Math.max(1, item.quantity - 1);
            const isSelected = selectedProductIds.includes(Number(item.product_id));

            return (
              <article key={item.id} className={`fashion-cart-item ${isSelected ? "selected" : ""}`}>
                <label className="fashion-cart-check" aria-label={`Chọn ${item.product.name}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleProduct(Number(item.product_id))}
                  />
                </label>
                <Link to={`/products/${item.product_id}`}>
                  <img src={item.product.image} alt={item.product.name} />
                </Link>
                <div className="fashion-cart-info">
                  <span>{item.product.category?.name || "Dolia"}</span>
                  <Link to={`/products/${item.product_id}`}>{item.product.name}</Link>
                  <small>{formatCurrency(price)}</small>
                </div>
                <div className="fashion-cart-qty" aria-label="Số lượng">
                  <button
                    type="button"
                    onClick={() => updateItem({ product_id: item.product_id, quantity: nextQuantity })}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem({
                        product_id: item.product_id,
                        quantity: Math.max(1, Number(event.target.value) || 1),
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateItem({
                        product_id: item.product_id,
                        quantity: item.quantity + 1,
                      })
                    }
                  >
                    +
                  </button>
                </div>
                <strong>{formatCurrency(price * item.quantity)}</strong>
                <button type="button" className="fashion-cart-remove" onClick={() => removeItem(item.product_id)}>
                  Xóa
                </button>
              </article>
            );
          })}
        </div>

        <aside className="fashion-cart-summary">
          <p>Tóm tắt đơn hàng</p>
          <h2>{formatCurrency(selectedTotal)}</h2>
          <div>
            <span>Đã chọn</span>
            <strong>{selectedCount} / {itemCount} sản phẩm</strong>
          </div>
          <div>
            <span>Phí vận chuyển</span>
            <strong>Miễn phí</strong>
          </div>
          <div>
            <span>Tạm tính</span>
            <strong>{formatCurrency(selectedTotal)}</strong>
          </div>
          <button type="button" onClick={handleCheckoutSelected} disabled={!selectedProductIds.length}>
            Thanh toán sản phẩm đã chọn
          </button>
          <small>Đổi trả trong 7 ngày. Miễn phí vận chuyển cho đơn từ 699K.</small>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;
