import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(true);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('home_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
    setLoading(false);
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('home_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const addToCart = useCallback((beat, licenseType) => {
    const price = beat.prices[licenseType];
    
    const newItem = {
      beat_id: beat.id,
      beat_name: beat.name,
      cover_image: beat.coverImage,
      license_type: licenseType,
      price: price
    };

    setCartItems(prevItems => {
      const exists = prevItems.some(
        item => item.beat_id === beat.id && item.license_type === licenseType
      );
      
      if (exists) {
        toast.info('Este beat ya está en tu carrito con esta licencia');
        return prevItems;
      }
      
      toast.success(`"${beat.name}" agregado al carrito`, {
        description: `Licencia ${licenseType} - $${price}`
      });
      
      return [...prevItems, newItem];
    });
  }, []);

  const removeFromCart = useCallback((beatId, licenseType) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.beat_id === beatId && item.license_type === licenseType))
    );
    toast.success('Item eliminado del carrito');
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('home_cart');
  }, []);

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
