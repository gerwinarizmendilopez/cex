import React from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { licenseTypes } from '../mock';

export const Licencias = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Licencias Claras, Sin Sorpresas</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Elige la licencia que se adapte a tus necesidades. Todas incluyen contratos PDF y soporte completo.
          </p>
        </div>

        {/* License Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Basica */}
          <Card className="bg-zinc-900 border-red-900/20 hover:border-red-600/50 transition-all">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold mb-2 text-white">{licenseTypes.basica.name}</CardTitle>
              <p className="text-gray-400 text-sm mb-4">Para lanzamientos digitales</p>
              <div className="text-4xl font-bold text-red-500">$29+</div>
              <p className="text-sm text-gray-400 mt-2">Precio variable por beat</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">Incluye:</h4>
                <ul className="space-y-3">
                  {licenseTypes.basica.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {licenseTypes.basica.restrictions && licenseTypes.basica.restrictions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Restricciones:</h4>
                  <ul className="space-y-3">
                    {licenseTypes.basica.restrictions.map((restriction, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <X className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{restriction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="bg-gradient-to-b from-red-950/30 to-zinc-900 border-red-600 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                MÁS POPULAR
              </span>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl font-bold mb-2 text-white">{licenseTypes.premium.name}</CardTitle>
              <p className="text-gray-400 text-sm mb-4">Para artistas serios</p>
              <div className="text-4xl font-bold text-red-500">$79+</div>
              <p className="text-sm text-gray-400 mt-2">Precio variable por beat</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">Incluye:</h4>
                <ul className="space-y-3">
                  {licenseTypes.premium.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {licenseTypes.premium.restrictions && licenseTypes.premium.restrictions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Restricciones:</h4>
                  <ul className="space-y-3">
                    {licenseTypes.premium.restrictions.map((restriction, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <X className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{restriction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exclusiva */}
          <Card className="bg-zinc-900 border-red-900/20 hover:border-red-600/50 transition-all">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold mb-2 text-white">{licenseTypes.exclusiva.name}</CardTitle>
              <p className="text-gray-400 text-sm mb-4">Derechos completos</p>
              <div className="text-4xl font-bold text-red-500">$299+</div>
              <p className="text-sm text-gray-400 mt-2">Precio variable por beat</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">Incluye:</h4>
                <ul className="space-y-3">
                  {licenseTypes.exclusiva.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
          
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-red-900/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-white">¿Cómo funciona la descarga?</h3>
                <p className="text-gray-400">
                  Después de completar la compra, recibirás un email instantáneo con el enlace de descarga. 
                  Incluye el beat en MP3/WAV y el contrato de licencia en PDF.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-red-900/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-white">¿Puedo subir el beat a Spotify?</h3>
                <p className="text-gray-400">
                  Sí. Con las licencias Premium y Exclusiva puedes distribuir en todas las plataformas digitales 
                  (Spotify, Apple Music, etc.) sin límite de streams.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-red-900/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-white">¿Qué pasa si compro licencia exclusiva?</h3>
                <p className="text-gray-400">
                  El beat se retira del catálogo y nadie más puede comprarlo. Obtienes derechos completos 
                  sobre el beat, incluyendo todos los archivos y el registro de copyright.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-red-900/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-white">¿Hay reembolsos?</h3>
                <p className="text-gray-400">
                  Debido a la naturaleza digital del producto, no ofrecemos reembolsos. Sin embargo, 
                  puedes escuchar el preview completo antes de comprar para asegurarte de que es lo que buscas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-red-900/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-white">¿Qué métodos de pago aceptan?</h3>
                <p className="text-gray-400">
                  Aceptamos Stripe (tarjetas de crédito/débito), PayPal y Mercado Pago. 
                  Todos los pagos son 100% seguros y encriptados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};