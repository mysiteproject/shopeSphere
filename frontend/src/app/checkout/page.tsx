'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { CreditCard, Truck, Tag, MapPin, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createOrder } from '@/store/slices/orderSlice';
import { resetCart } from '@/store/slices/cartSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AddressForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const shippingOptions = [
  { id: 'standard', label: 'Standard Delivery', time: '5-7 days', price: 49 },
  { id: 'express', label: 'Express Delivery', time: '2-3 days', price: 99 },
  { id: 'overnight', label: 'Overnight Delivery', time: '1 day', price: 199 },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay' | 'cod'>('stripe');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [processing, setProcessing] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { cart } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<AddressForm>();

  useEffect(() => {
    if (!cart.items.length) router.push('/cart');
    // Pre-fill from user's default address
    const defaultAddr = user?.addresses?.find((a) => a.isDefault);
    if (defaultAddr) {
      setValue('fullName', defaultAddr.fullName);
      setValue('phone', defaultAddr.phone);
      setValue('street', defaultAddr.street);
      setValue('city', defaultAddr.city);
      setValue('state', defaultAddr.state);
      setValue('zipCode', defaultAddr.zipCode);
      setValue('country', defaultAddr.country);
    }
  }, [cart, user, router, setValue]);

  const subtotal = cart.totalPrice;
  const shipping = subtotal >= 999 ? 0 : shippingOptions.find((s) => s.id === shippingMethod)?.price || 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax - discount;

  const handleApplyCoupon = async () => {
    try {
      const res = await api.post('/coupons/apply', { code: couponCode, cartTotal: subtotal });
      setDiscount(res.data.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! You save ₹${res.data.discount}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const onSubmitOrder = async (address: AddressForm) => {
    setProcessing(true);
    try {
      const orderData = {
        orderItems: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        })),
        shippingAddress: address,
        paymentMethod,
        shippingMethod,
        couponCode: couponApplied ? couponCode : undefined,
      };

      const result = await dispatch(createOrder(orderData));
      if (createOrder.fulfilled.match(result)) {
        const order = result.payload.order;

        if (paymentMethod === 'cod') {
          dispatch(resetCart());
          toast.success('Order placed successfully!');
          router.push(`/orders/${order._id}`);
          return;
        }

        if (paymentMethod === 'razorpay') {
          const rpRes = await api.post('/payment/razorpay/create-order', { orderId: order._id });
          const rpOrder = rpRes.data.razorpayOrder;

          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
            name: 'ShopSphere',
            description: `Order #${order.invoiceNumber}`,
            order_id: rpOrder.id,
            handler: async (response: any) => {
              await api.post('/payment/razorpay/verify', {
                ...response,
                orderId: order._id,
              });
              dispatch(resetCart());
              toast.success('Payment successful!');
              router.push(`/orders/${order._id}`);
            },
            prefill: { name: user?.name, email: user?.email, contact: address.phone },
            theme: { color: '#4c6ef5' },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }

        if (paymentMethod === 'stripe') {
          const stripeRes = await api.post('/payment/stripe/create-intent', { orderId: order._id });
          // In production, use Stripe Elements. Simplified for demo:
          dispatch(resetCart());
          toast.success('Order placed! Complete payment in Stripe.');
          router.push(`/orders/${order._id}`);
        }
      } else {
        toast.error(result.payload as string);
      }
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center justify-center mb-10">
        {['Address', 'Payment', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center space-x-2 ${i + 1 <= step ? 'text-primary-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i + 1 < step ? 'bg-primary-600 text-white' : i + 1 === step ? 'bg-primary-100 text-primary-600 border-2 border-primary-600' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                {i + 1 < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s}</span>
            </div>
            {i < 2 && <div className={`w-12 sm:w-24 h-0.5 mx-2 ${i + 1 < step ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmitOrder)}>
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="card p-6 space-y-4 animate-fade-in">
                <h2 className="text-lg font-bold flex items-center space-x-2"><MapPin className="w-5 h-5 text-primary-600" /><span>Shipping Address</span></h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input {...register('fullName', { required: 'Required' })} className="input-field" />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input {...register('phone', { required: 'Required' })} className="input-field" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input {...register('street', { required: 'Required' })} className="input-field" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input {...register('city', { required: 'Required' })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input {...register('state', { required: 'Required' })} className="input-field" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input {...register('zipCode', { required: 'Required' })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input {...register('country', { required: 'Required' })} className="input-field" defaultValue="India" />
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary">Continue to Payment</button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card p-6 space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold flex items-center space-x-2"><CreditCard className="w-5 h-5 text-primary-600" /><span>Payment Method</span></h2>

                <div className="space-y-3">
                  {/* Shipping */}
                  <h3 className="font-medium flex items-center space-x-2"><Truck className="w-4 h-4" /><span>Shipping</span></h3>
                  {shippingOptions.map((opt) => (
                    <label key={opt.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                      shippingMethod === opt.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'hover:border-slate-400'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <input type="radio" name="shipping" checked={shippingMethod === opt.id} onChange={() => setShippingMethod(opt.id)} className="text-primary-600" />
                        <div>
                          <p className="font-medium text-sm">{opt.label}</p>
                          <p className="text-xs text-slate-500">{opt.time}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm">{subtotal >= 999 && opt.id === 'standard' ? 'FREE' : `₹${opt.price}`}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Payment</h3>
                  {[
                    { id: 'stripe' as const, label: 'Credit/Debit Card (Stripe)', icon: '💳' },
                    { id: 'razorpay' as const, label: 'UPI / Razorpay', icon: '📱' },
                    { id: 'cod' as const, label: 'Cash on Delivery', icon: '💵' },
                  ].map((opt) => (
                    <label key={opt.id} className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === opt.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'hover:border-slate-400'
                    }`}>
                      <input type="radio" name="payment" checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} className="text-primary-600" />
                      <span className="text-lg">{opt.icon}</span>
                      <span className="font-medium text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary">Review Order</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="card p-6 space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold">Review Your Order</h2>

                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <img src={item.product?.images?.[0]?.url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">{item.product?.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary">Back</button>
                  <button type="submit" disabled={processing} className="btn-primary flex-1">
                    {processing ? 'Processing...' : `Place Order · ₹${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Summary Sidebar */}
        <div>
          <div className="card p-6 sticky top-28">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax (18% GST)</span><span>₹{tax.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
              <hr className="dark:border-slate-700" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary-600">₹{total.toLocaleString()}</span></div>
            </div>

            {/* Coupon */}
            {!couponApplied && (
              <div className="mt-4">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="input-field !py-2.5 pl-10 text-sm"
                    />
                  </div>
                  <button onClick={handleApplyCoupon} className="btn-outline !py-2.5 text-sm">Apply</button>
                </div>
              </div>
            )}
            {couponApplied && (
              <div className="mt-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Coupon &quot;{couponCode}&quot; applied!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
