import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, ShoppingCart, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const cartCount = getCartCount();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-red-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
              <img 
                src="https://customer-assets.emergentagent.com/job_beatmarket-43/artifacts/7mofy2kc_holaaaa.png" 
                alt="V CLUB Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="!font-bold !text-xl text-white"></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-red-500' : 'text-gray-300 hover:text-white'}`
              }>

              Inicio
            </Link>
            <Link
              to="/catalogo"
              className={`text-sm font-medium transition-colors ${
              isActive('/catalogo') ? 'text-red-500' : 'text-gray-300 hover:text-white'}`
              }>

              Catálogo
            </Link>
            <Link
              to="/licencias"
              className={`text-sm font-medium transition-colors ${
              isActive('/licencias') ? 'text-red-500' : 'text-gray-300 hover:text-white'}`
              }>

              Licencias
            </Link>
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors ${
              isActive('/admin') ? 'text-red-500' : 'text-gray-300 hover:text-white'}`
              }>

              Admin
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart">
              <Button
                variant="outline"
                size="sm"
                className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-colors relative">

                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrito ({cartCount})
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{user.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-red-900/20 text-gray-400 hover:bg-red-600 hover:text-white">

                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white">

                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>

            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen &&
        <div className="md:hidden py-4 border-t border-red-900/20">
            <nav className="flex flex-col space-y-4">
              <Link
              to="/"
              className={`text-sm font-medium ${
              isActive('/') ? 'text-red-500' : 'text-gray-300'}`
              }
              onClick={() => setMobileMenuOpen(false)}>

                Inicio
              </Link>
              <Link
              to="/catalogo"
              className={`text-sm font-medium ${
              isActive('/catalogo') ? 'text-red-500' : 'text-gray-300'}`
              }
              onClick={() => setMobileMenuOpen(false)}>

                Catálogo
              </Link>
              <Link
              to="/licencias"
              className={`text-sm font-medium ${
              isActive('/licencias') ? 'text-red-500' : 'text-gray-300'}`
              }
              onClick={() => setMobileMenuOpen(false)}>

                Licencias
              </Link>
              <Link
              to="/admin"
              className={`text-sm font-medium ${
              isActive('/admin') ? 'text-red-500' : 'text-gray-300'}`
              }
              onClick={() => setMobileMenuOpen(false)}>

                Admin
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                <Button
                variant="outline"
                size="sm"
                className="border-red-600 text-red-500 w-full">

                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Carrito ({cartCount})
                </Button>
              </Link>
            </nav>
          </div>
        }
      </div>
    </header>);

};