import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart as fetchCart, addToCart as apiAddToCart, removeCartItem as apiRemoveItem, updateCartItem as apiUpdateItem } from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!user) { setCart(null); return; }
    try {
      setLoading(true);
      const { data } = await fetchCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadCart(); }, [loadCart]);

  const addToCart = async (productId, variant, quantity = 1) => {
    const { data } = await apiAddToCart({ productId, variant, quantity });
    setCart(data);
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await apiUpdateItem(itemId, quantity);
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const { data } = await apiRemoveItem(itemId);
    setCart(data);
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, cartCount, addToCart, updateItem, removeItem, loadCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
