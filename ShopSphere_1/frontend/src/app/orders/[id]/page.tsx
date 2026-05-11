'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Package, Truck, CheckCircle, MapPin, CreditCard, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrder, cancelOrder } from '@/store/slices/orderSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const statusSteps = ['processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { order, loading } = useAppSelector((state) => state.order);

  useEffect(() => {
    if (id) dispatch(fetchOrder(id as string));
  }, [dispatch, id]);

  const handleCancel = async () => {
    if (!order) return;
    if (confirm('Are you sure you want to cancel this order?')) {
      const result = await dispatch(cancelOrder({ id: order._id, reason: 'Cancelled by user' }));
      if (cancelOrder.fulfilled.match(result)) {
        toast.success('Order cancelled');
      }
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!order) return <div className="text-center py-20 text-slate-500">Order not found</div>;

  const currentStep = statusSteps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.invoiceNumber}</h1>
          <p className="text-slate-500 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {!isCancelled && !order.isDelivered && (
          <button onClick={handleCancel} className="btn-danger text-sm !py-2">Cancel Order</button>
        )}
      </div>

      {/* Order Tracking */}
      {!isCancelled && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold mb-6">Order Tracking</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700" />
            <div className="absolute top-4 left-0 h-0.5 bg-primary-600 transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
            {statusSteps.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i <= currentStep ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {i < currentStep ? <CheckCircle className="w-5 h-5" /> :
                   i === currentStep ? <Clock className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <span className="text-xs mt-2 text-center capitalize hidden sm:block">{step.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
          {order.estimatedDelivery && (
            <p className="text-sm text-slate-500 mt-4 text-center">
              Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {isCancelled && (
        <div className="card p-6 mb-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 font-semibold">This order has been cancelled.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Shipping */}
        <div className="card p-6">
          <h3 className="font-bold flex items-center space-x-2 mb-3"><MapPin className="w-4 h-4 text-primary-600" /><span>Shipping Address</span></h3>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-medium text-slate-900 dark:text-white">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment */}
        <div className="card p-6">
          <h3 className="font-bold flex items-center space-x-2 mb-3"><CreditCard className="w-4 h-4 text-primary-600" /><span>Payment</span></h3>
          <div className="text-sm space-y-2">
            <p>Method: <span className="font-medium capitalize">{order.paymentMethod}</span></p>
            <p>Status: <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.isPaid ? `Paid on ${new Date(order.paidAt!).toLocaleDateString()}` : 'Pending'}
            </span></p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex items-center space-x-4 pb-4 border-b dark:border-slate-700 last:border-0 last:pb-0">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-slate-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
              </div>
              <span className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="card p-6">
        <h3 className="font-bold mb-4">Price Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Items Total</span><span>₹{order.itemsPrice.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>₹{order.taxPrice.toLocaleString()}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discountAmount.toLocaleString()}</span></div>
          )}
          <hr className="dark:border-slate-700" />
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary-600">₹{order.totalPrice.toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
}
