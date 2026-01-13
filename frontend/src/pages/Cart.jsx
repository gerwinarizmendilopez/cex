import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, User, Building2, Phone, Mail, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useCart } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

let stripePromise = null;

const getStripeConfig = async () => {
  try {
    const response = await axios.get(`${API}/payment/config`);
    return response.data.publishable_key;
  } catch (error) {
    console.error('Error obteniendo config de Stripe:', error);
    return null;
  }
};

const licenseNames = {
  basica: 'Básica',
  premium: 'Premium',
  exclusiva: 'Exclusiva'
};

const CheckoutForm = ({ cartItems, cartTotal, onSuccess, navigate }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  
  // Billing info
  const [accountType, setAccountType] = useState('individual');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Checkboxes
  const [acceptPromos, setAcceptPromos] = useState(true);
  const [isAdult, setIsAdult] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    // Validaciones
    if (!firstName || !lastName || !email) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!isAdult) {
      toast.error('Debes confirmar que eres mayor de edad para realizar la compra');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setProcessing(true);
    const buyerName = `${firstName} ${lastName}`;
    
    // Guardar info de la última compra para la página de éxito
    let lastPurchasedItem = null;

    try {
      for (const item of cartItems) {
        const { data: paymentIntent } = await axios.post(`${API}/payment/create-payment-intent`, {
          beat_id: item.beat_id,
          beat_name: item.beat_name,
          license_type: item.license_type,
          amount: item.price,
          buyer_email: email,
          buyer_name: buyerName
        });

        const result = await stripe.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: buyerName,
              email: email,
              phone: phone || undefined,
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        const confirmResponse = await axios.post(`${API}/payment/confirm-payment`, {
          payment_intent_id: result.paymentIntent.id,
          beat_id: item.beat_id,
          license_type: item.license_type,
          buyer_email: email,
          buyer_name: buyerName,
          buyer_phone: phone,
          account_type: accountType,
          accept_promos: acceptPromos
        });

        // Guardar el último item comprado
        lastPurchasedItem = {
          beat_id: item.beat_id,
          license_type: item.license_type,
          purchase_id: confirmResponse.data.sale_id || result.paymentIntent.id
        };

        if (confirmResponse.data.exclusive) {
          toast.success('¡Licencia Exclusiva Adquirida!', {
            description: 'El beat ha sido retirado del catálogo.'
          });
        }
      }

      toast.success('¡Compra exitosa!');
      
      // Limpiar carrito y redirigir a página de éxito
      onSuccess();
      
      // Redirigir a la página de confirmación con los parámetros
      if (lastPurchasedItem) {
        navigate(`/purchase-success?beat_id=${lastPurchasedItem.beat_id}&license=${lastPurchasedItem.license_type}&purchase_id=${lastPurchasedItem.purchase_id}`);
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      toast.error('Error al procesar el pago', {
        description: error.message || 'Por favor intenta nuevamente'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Billing Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-red-900/20 pb-2">
          Información de Facturación
        </h3>
        
        {/* Account Type */}
        <div>
          <Label className="text-sm text-gray-400 mb-3 block">Tipo de cuenta</Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAccountType('individual')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                accountType === 'individual'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-zinc-900 border-red-900/20 text-gray-400 hover:border-red-600/50'
              }`}
            >
              <User className="w-4 h-4" />
              Individual
            </button>
            <button
              type="button"
              onClick={() => setAccountType('business')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                accountType === 'business'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-zinc-900 border-red-900/20 text-gray-400 hover:border-red-600/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Empresa
            </button>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-sm text-gray-400">Nombre *</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 bg-zinc-900 border-red-900/20 text-white"
              placeholder="Tu nombre"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm text-gray-400">Apellido *</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 bg-zinc-900 border-red-900/20 text-white"
              placeholder="Tu apellido"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-sm text-gray-400">Número de teléfono</Label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10 bg-zinc-900 border-red-900/20 text-white"
              placeholder="+52 123 456 7890"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-sm text-gray-400">Correo electrónico *</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-zinc-900 border-red-900/20 text-white"
              placeholder="tu@email.com"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Aquí recibirás tus beats y el contrato de licencia</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-red-900/20 pb-2">
          Método de Pago
        </h3>
        <div className="p-4 bg-zinc-900 border border-red-900/20 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#fff',
                  '::placeholder': { color: '#9ca3af' },
                },
                invalid: { color: '#ef4444' },
              },
            }}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        {/* Promos checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={acceptPromos}
              onChange={(e) => setAcceptPromos(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              acceptPromos 
                ? 'bg-red-600 border-red-600' 
                : 'bg-zinc-900 border-gray-600 group-hover:border-red-600/50'
            }`}>
              {acceptPromos && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <span className="text-sm text-gray-400">
            Acepto recibir promociones, novedades y ofertas exclusivas de HØME Records por correo electrónico.
          </span>
        </label>

        {/* Age verification checkbox - REQUIRED */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={isAdult}
              onChange={(e) => setIsAdult(e.target.checked)}
              className="sr-only"
              required
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isAdult 
                ? 'bg-red-600 border-red-600' 
                : 'bg-zinc-900 border-gray-600 group-hover:border-red-600/50'
            }`}>
              {isAdult && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
          <span className="text-sm text-gray-300">
            <span className="text-red-500">*</span> Confirmo que soy mayor de edad y realizo esta compra de manera responsable.
          </span>
        </label>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
        disabled={!stripe || processing || !isAdult}
      >
        <CreditCard className="w-5 h-5 mr-2" />
        {processing ? 'Procesando...' : `Pagar $${cartTotal.toFixed(2)} USD`}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        🔒 Pago seguro procesado por Stripe. Tus datos están protegidos.
      </p>
    </form>
  );
};

export const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, clearCart, loading } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const loadStripeConfig = async () => {
      const publishableKey = await getStripeConfig();
      if (publishableKey) {
        stripePromise = loadStripe(publishableKey);
        setStripeLoaded(true);
      }
    };
    loadStripeConfig();
  }, []);

  const handleCheckoutSuccess = () => {
    clearCart();
    setShowCheckout(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/catalogo" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al catálogo
          </Link>
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-400 mb-8">Explora nuestro catálogo y encuentra tus beats perfectos</p>
            <Link to="/catalogo">
              <Button className="bg-red-600 hover:bg-red-700">Explorar Beats</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/catalogo" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continuar comprando
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Tu Carrito ({cartItems.length})</h1>
              <Button
                variant="outline"
                size="sm"
                className="border-red-900/20 text-red-500 hover:bg-red-600 hover:text-white"
                onClick={clearCart}
              >
                Vaciar Carrito
              </Button>
            </div>

            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <Card key={`${item.beat_id}-${item.license_type}-${index}`} className="bg-zinc-900 border-red-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.cover_image}
                        alt={item.beat_name}
                        className="w-24 h-24 rounded-lg object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/96?text=🎵'; }}
                      />
                      <div className="flex-1">
                        <Link to={`/beat/${item.beat_id}`}>
                          <h3 className="text-xl font-bold hover:text-red-500 transition-colors">
                            {item.beat_name}
                          </h3>
                        </Link>
                        <p className={`text-sm mt-2 font-semibold ${
                          item.license_type === 'exclusiva' ? 'text-yellow-500' : 'text-red-400'
                        }`}>
                          Licencia {licenseNames[item.license_type] || item.license_type}
                          {item.license_type === 'exclusiva' && ' ⭐'}
                        </p>
                        {item.license_type === 'exclusiva' && (
                          <p className="text-xs text-yellow-500/70 mt-1">
                            El beat será retirado del catálogo tras la compra
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-500 mb-4">
                          ${item.price.toFixed(2)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-900/20 text-red-500 hover:bg-red-600 hover:text-white"
                          onClick={() => removeFromCart(item.beat_id, item.license_type)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900 border-red-900/20 sticky top-24">
              <CardContent className="p-6">
                {!showCheckout ? (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Resumen del Pedido</h2>
                    <div className="space-y-3 mb-6">
                      {cartItems.map((item, index) => (
                        <div key={`summary-${item.beat_id}-${index}`} className="flex justify-between text-sm">
                          <span className="text-gray-400 truncate max-w-[150px]">{item.beat_name}</span>
                          <span className="text-white">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-red-900/20 pt-4 mb-6">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-red-500">${cartTotal.toFixed(2)} USD</span>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                      onClick={() => setShowCheckout(true)}
                    >
                      Proceder al Pago
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Checkout</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                        onClick={() => setShowCheckout(false)}
                      >
                        ← Volver
                      </Button>
                    </div>
                    
                    <div className="border-b border-red-900/20 pb-4 mb-6">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total a pagar</span>
                        <span className="text-red-500">${cartTotal.toFixed(2)} USD</span>
                      </div>
                    </div>

                    {stripeLoaded && stripePromise ? (
                      <Elements stripe={stripePromise}>
                        <CheckoutForm
                          cartItems={cartItems}
                          cartTotal={cartTotal}
                          onSuccess={handleCheckoutSuccess}
                        />
                      </Elements>
                    ) : (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                        <p className="text-gray-400">Cargando formulario de pago...</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
