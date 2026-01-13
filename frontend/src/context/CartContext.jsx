import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [cartItems, setCartItems] = useState(() => {
    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem('home_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('home_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (beat, licenseType) => {
    const existingItem = cartItems.find(
      item => item.beat.id === beat.id && item.licenseType === licenseType
    );

    if (existingItem) {
      toast.info('Este beat ya está en tu carrito');
      return;
    }

    const newItem = {
      id: `${beat.id}-${licenseType}`,
      beat,
      licenseType,
      price: beat.prices[licenseType],
      addedAt: new Date().toISOString()
    };

    setCartItems([...cartItems, newItem]);
    toast.success(`${beat.name} añadido al carrito`, {
      description: `Licencia ${licenseType}`
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    toast.success('Beat eliminado del carrito');
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('vclub_cart');
    toast.success('Carrito vaciado');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const getCartCount = () => {
    return cartItems.length;
  };

  const isInCart = (beatId, licenseType) => {
    return cartItems.some(
      item => item.beat.id === beatId && item.licenseType === licenseType
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        isInCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
