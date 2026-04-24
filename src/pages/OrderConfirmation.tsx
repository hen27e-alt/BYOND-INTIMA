import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Calendar, MapPin, Phone } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { EditableText } from '../components/EditableText';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useCart } from '../contexts/CartContext';

export const OrderConfirmation = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  const orderIdFromUrl = searchParams.get('orderId');
  const isSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    if (isSuccess && orderIdFromUrl) {
      // Update order status in Firestore
      const updateOrderStatus = async () => {
        try {
          const orderRef = doc(db, 'orders', orderIdFromUrl);
          await updateDoc(orderRef, {
            status: 'paid'
          });
          console.log("Order status updated to paid:", orderIdFromUrl);
          clearCart(); // Clear cart on success
        } catch (error) {
          console.error("Error updating order status:", error);
        }
      };
      updateOrderStatus();
    }
  }, [isSuccess, orderIdFromUrl, clearCart]);
  
  const orderData = location.state?.orderData || {
    orderId: orderIdFromUrl || 'BYD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    customerName: 'לקוח יקר',
    total: '---',
    address: 'נשלח למייל',
    phone: 'נשלח למייל',
    items: []
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-32 pb-20 px-6" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-brand-black/5"
        >
          {/* Header */}
          <div className="bg-brand-black text-white p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
              <CheckCircle size={300} className="text-brand-gold" />
            </div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <div className="w-20 h-20 bg-brand-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CheckCircle size={40} className="text-brand-black" />
              </div>
              <EditableText 
                contentId="order_confirmation_title"
                defaultText="ההזמנה בוצעה בהצלחה!"
                as="h1"
                className="text-4xl md:text-5xl font-serif font-black mb-4 italic"
              />
              <p className="text-white/60 text-lg">תודה רבה, {orderData.customerName}. ההזמנה שלך התקבלה ונמצאת בטיפול.</p>
            </motion.div>
          </div>

          {/* Order Details */}
          <div className="p-12 space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-black/40">
                  <ShoppingBag size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">מספר הזמנה</span>
                </div>
                <p className="text-xl font-black">{orderData.orderId}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-black/40">
                  <Calendar size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">תאריך הזמנה</span>
                </div>
                <p className="text-xl font-black">{new Date().toLocaleDateString('he-IL')}</p>
              </div>
            </div>

            <div className="h-px bg-brand-black/5" />

            {/* Shipping Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-black">פרטי משלוח</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#F8F8F8] rounded-xl flex items-center justify-center text-brand-gold shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-1">כתובת למשלוח</p>
                    <p className="font-bold text-brand-black/80">{orderData.address}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#F8F8F8] rounded-xl flex items-center justify-center text-brand-gold shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-1">מספר טלפון</p>
                    <p className="font-bold text-brand-black/80">{orderData.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-brand-black/5" />

            {/* Summary */}
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-black">סיכום תשלום</h3>
              <div className="bg-[#F8F8F8] rounded-2xl p-6 space-y-3">
                <div className="flex justify-between text-sm font-medium text-brand-black/60">
                  <span>סכום הזמנה</span>
                  <span>₪{orderData.total}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-brand-black/60">
                  <span>משלוח</span>
                  <span>חינם</span>
                </div>
                <div className="h-px bg-brand-black/10 my-2" />
                <div className="flex justify-between text-xl font-black">
                  <span>סה"כ שולם</span>
                  <span className="text-brand-gold">₪{orderData.total}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-grow">
                <Link 
                  to="/decks"
                  className="w-full py-5 bg-brand-black text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-gold transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <ShoppingBag size={18} />
                  המשך בקניות
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-grow">
                <Link 
                  to="/dashboard"
                  className="w-full py-5 bg-white text-brand-black border border-brand-black/10 text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-[#F8F8F8] transition-all flex items-center justify-center gap-3"
                >
                  <Package size={18} />
                  מעקב אחר הזמנה
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <p className="text-brand-black/40 text-sm font-medium">
            שלחנו לך אישור הזמנה מפורט לכתובת המייל שלך.
          </p>
        </div>
      </div>
    </div>
  );
};
