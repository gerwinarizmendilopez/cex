import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useCart } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Inicializar Stripe
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

const CheckoutForm = ({ cartItems, cartTotal, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!buyerEmail || !buyerName) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setProcessing(true);

    try {
      // Procesar cada item del carrito
      for (const item of cartItems) {
        // Crear Payment Intent
        const { data: paymentIntent } = await axios.post(`${API}/payment/create-payment-intent`, {
          beat_id: item.beat.id,
          beat_name: item.beat.name,
          license_type: item.licenseType,
          amount: item.price,
          buyer_email: buyerEmail,
          buyer_name: buyerName
        });

        // Confirmar el pago con Stripe
        const result = await stripe.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: buyerName,
              email: buyerEmail,
            },
          },
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        // Confirmar en el backend
        await axios.post(`${API}/payment/confirm-payment`, {
          payment_intent_id: result.paymentIntent.id,
          beat_id: item.beat.id,
          license_type: item.licenseType,
          buyer_email: buyerEmail
        });
      }

      toast.success('¡Pago procesado exitosamente!', {
        description: 'Recibirás tus beats por email en breve'
      });
      
      onSuccess();
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
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Nombre Completo
        </label>
        <input
          type="text"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-900 border border-red-900/20 rounded-lg text-white focus:outline-none focus:border-red-600"
          placeholder="Tu nombre"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Email
        </label>
        <input
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-900 border border-red-900/20 rounded-lg text-white focus:outline-none focus:border-red-600"
          placeholder="tu@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Información de Tarjeta
        </label>
        <div className="p-4 bg-zinc-900 border border-red-900/20 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#fff',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
        disabled={!stripe || processing}
      >
        <CreditCard className="w-5 h-5 mr-2" />
        {processing ? 'Procesando...' : `Pagar $${cartTotal.toFixed(2)}`}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Pago seguro procesado por Stripe. Tus datos están protegidos.
      </p>
    </form>
  );
};

export const Cart = () => {
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const cartTotal = getCartTotal();

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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/catalogo" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al catálogo
          </Link>

          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-400 mb-8">Explora nuestro catálogo y encuentra tus beats perfectos</p>
            <Link to="/catalogo">
              <Button className="bg-red-600 hover:bg-red-700">
                Explorar Beats
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/catalogo" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
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
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-zinc-900 border-red-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.beat.coverImage}
                        alt={item.beat.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <Link to={`/beat/${item.beat.id}`}>
                          <h3 className="text-xl font-bold hover:text-red-500 transition-colors">
                            {item.beat.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-400 mt-1">
                          {item.beat.bpm} BPM • {item.beat.key} • {item.beat.genre}
                        </p>
                        <p className="text-sm text-red-400 mt-2 font-semibold">
                          Licencia {item.licenseType.charAt(0).toUpperCase() + item.licenseType.slice(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-500 mb-4">
                          ${item.price.toFixed(2)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-900/20 text-red-500 hover:bg-red-600 hover:text-white"
                          onClick={() => removeFromCart(item.id)}
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
                <h2 className="text-2xl font-bold mb-6">Resumen del Pedido</h2>

                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-400">{item.beat.name}</span>
                      <span className="text-white">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-red-900/20 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-red-500">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {!showCheckout ? (
                  <Button
                    size="lg"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceder al Pago
                  </Button>
                ) : (
                  <div>
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
                        <p className="text-gray-400">Cargando formulario de pago...</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
