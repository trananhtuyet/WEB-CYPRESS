import { createContext, useContext, useEffect, useState } from "react";
import {
  addToCart as addToCartRequest,
  getCart as getCartRequest,
  removeCartItem as removeCartItemRequest,
  updateCartItem as updateCartItemRequest,
} from "../services/cartService";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { token, user } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });

  const refreshCart = async () => {
    const token = localStorage.getItem("token");
    if (!token || user?.role !== "user") {
      setCart({ items: [], totalPrice: 0 });
      return;
    }
    const data = await getCartRequest();
    setCart(data);
  };

  useEffect(() => {
    refreshCart().catch(() => setCart({ items: [], totalPrice: 0 }));
  }, [token, user?.role]);

  const addToCart = async (payload) => {
    if (user?.role !== "user") {
      throw new Error("Only users can add products to cart");
    }
    const data = await addToCartRequest(payload);
    setCart(data);
    return data;
  };

  const updateItem = async (payload) => {
    const data = await updateCartItemRequest(payload);
    setCart(data);
    return data;
  };

  const removeItem = async (productId) => {
    const data = await removeCartItemRequest(productId);
    setCart(data);
    return data;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        refreshCart,
        addToCart,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
