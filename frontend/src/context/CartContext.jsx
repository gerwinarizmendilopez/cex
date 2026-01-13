import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Cargar carrito cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadUserCart();
    } else {
      // Usuario no autenticado: carrito vacío (no usar localStorage)
      setCartItems([]);
    }
  }, [isAuthenticated, user?.email]);

  // Cargar carrito del usuario desde el backend
  const loadUserCart = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/cart/${encodeURIComponent(user.email)}`);
      const items = response.data.items || [];
      setCartItems(items);
    } catch (error) {
      console.error('Error cargando carrito:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar carrito en el backend
  const saveUserCart = useCallback(async (items) => {
    if (!user?.email) return;
    
    try {
      await axios.post(`${API}/cart/save`, {
        user_email: user.email,
        items: items
      });
    } catch (error) {
      console.error('Error guardando carrito:', error);
    }
  }, [user?.email]);

  const addToCart = useCallback((beat, licenseType) => {
    // Verificar si el usuario está logueado
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar al carrito');
      return;
    }

    const price = beat.prices[licenseType];
    
    const newItem = {
      beat_id: beat.id,
      beat_name: beat.name,
      cover_image: beat.coverImage,
      license_type: licenseType,
      price: price
    };

    setCartItems(prevItems => {
      // Verificar si ya existe
      const exists = prevItems.some(
        item => item.beat_id === beat.id && item.license_type === licenseType
      );
      
      if (exists) {
        toast.info('Este beat ya está en tu carrito con esta licencia');
        return prevItems;
      }
      
      const newItems = [...prevItems, newItem];
      
      // Guardar en backend
      saveUserCart(newItems);
      
      toast.success(`"${beat.name}" agregado al carrito`, {
        description: `Licencia ${licenseType} - $${price}`
      });
      
      return newItems;
    });
  }, [isAuthenticated, saveUserCart]);

  const removeFromCart = useCallback(async (beatId, licenseType) => {
    if (!user?.email) return;

    setCartItems(prevItems => {
      const newItems = prevItems.filter(
        item => !(item.beat_id === beatId && item.license_type === licenseType)
      );
      
      // Guardar en backend
      saveUserCart(newItems);
      
      return newItems;
    });
    
    toast.success('Item eliminado del carrito');
  }, [user?.email, saveUserCart]);

  const clearCart = useCallback(async () => {
    if (user?.email) {
      try {
        await axios.delete(`${API}/cart/${encodeURIComponent(user.email)}`);
      } catch (error) {
        console.error('Error vaciando carrito:', error);
      }
    }
    setCartItems([]);
  }, [user?.email]);

  const isInCart = useCallback((beatId, licenseType) => {
    return cartItems.some(
      item => item.beat_id === beatId && item.license_type === licenseType
    );
  }, [cartItems]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
