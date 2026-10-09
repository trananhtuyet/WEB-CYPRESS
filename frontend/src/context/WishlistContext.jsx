import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";

const LEGACY_STORAGE_KEY = "dolia_wishlist";
const GUEST_STORAGE_KEY = "dolia_wishlist_guest";

export const WishlistContext = createContext();

const getStorageKey = (userId) => (userId ? `dolia_wishlist_user_${userId}` : GUEST_STORAGE_KEY);

const readStoredWishlist = (storageKey) => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }

    if (storageKey === GUEST_STORAGE_KEY) {
      const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyStored) {
        return JSON.parse(legacyStored);
      }
    }

    return [];
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const { user } = useContext(AuthContext);
  const storageKey = useMemo(() => getStorageKey(user?.id), [user?.id]);
  const [favoriteIds, setFavoriteIds] = useState(() => readStoredWishlist(storageKey));

  useEffect(() => {
    setFavoriteIds(readStoredWishlist(storageKey));
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(favoriteIds));

    if (storageKey === GUEST_STORAGE_KEY) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }, [favoriteIds, storageKey]);

  const value = useMemo(() => {
    const normalizedIds = favoriteIds.map(String);

    return {
      favoriteIds,
      favoriteCount: favoriteIds.length,
      isFavorite: (productId) => normalizedIds.includes(String(productId)),
      toggleFavorite: (productId) => {
        setFavoriteIds((current) => {
          const productKey = String(productId);
          const exists = current.map(String).includes(productKey);

          return exists ? current.filter((id) => String(id) !== productKey) : [...current, productId];
        });
      },
    };
  }, [favoriteIds]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
