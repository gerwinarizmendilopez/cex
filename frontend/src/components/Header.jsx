import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from './ui/button';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-red-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BeatMarket</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-red-500' : 'text-gray-300 hover:text-white'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/catalogo" 
              className={`text-sm font-medium transition-colors ${
                isActive('/catalogo') ? 'text-red-500' : 'text-gray-300 hover:text-white'
              }`}
            >
              Catálogo
            </Link>
            <Link 
              to="/licencias" 
              className={`text-sm font-medium transition-colors ${
                isActive('/licencias') ? 'text-red-500' : 'text-gray-300 hover:text-white'
              }`}
            >
              Licencias
            </Link>
            <Link 
              to="/admin" 
              className={`text-sm font-medium transition-colors ${
                isActive('/admin') ? 'text-red-500' : 'text-gray-300 hover:text-white'
              }`}
            >
              Admin
            </Link>
          </nav>

          {/* Cart Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Carrito (0)
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-red-900/20">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`text-sm font-medium ${
                  isActive('/') ? 'text-red-500' : 'text-gray-300'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/catalogo" 
                className={`text-sm font-medium ${
                  isActive('/catalogo') ? 'text-red-500' : 'text-gray-300'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link 
                to="/licencias" 
                className={`text-sm font-medium ${
                  isActive('/licencias') ? 'text-red-500' : 'text-gray-300'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Licencias
              </Link>
              <Link 
                to="/admin" 
                className={`text-sm font-medium ${
                  isActive('/admin') ? 'text-red-500' : 'text-gray-300'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-600 text-red-500 w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrito (0)
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};