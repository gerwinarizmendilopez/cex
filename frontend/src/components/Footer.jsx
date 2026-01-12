import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Instagram, Twitter, Youtube, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-red-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">V CLUB</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Beats profesionales listos para llevar tu música al siguiente nivel.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-red-500 text-sm transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="text-gray-400 hover:text-red-500 text-sm transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/licencias" className="text-gray-400 hover:text-red-500 text-sm transition-colors">
                  Licencias
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 text-sm transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 text-sm transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-500 text-sm transition-colors">
                  Política de Reembolso
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <div className="space-y-2">
              <a href="mailto:contacto@beatmarket.com" className="text-gray-400 hover:text-red-500 text-sm flex items-center transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                contacto@beatmarket.com
              </a>
              <p className="text-gray-400 text-sm">
                Respuesta en 24-48 horas
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-red-900/20 mt-8 pt-8">
          <p className="text-center text-gray-400 text-sm">
            © 2025 V CLUB. Todos los derechos reservados. Hecho para artistas que quieren ganar.
          </p>
        </div>
      </div>
    </footer>
  );
};