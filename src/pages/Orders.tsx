import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Calendar, CreditCard, ChevronRight, ShoppingBag, Loader2, ExternalLink, CheckCircle2, Clock, Truck } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { boutiqueProducts } from '../data/boutique';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  orderId: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: Timestamp;
  items: Record<string, { quantity: number; personalization?: any }>;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
  };
}

export const Orders = () => {
  const { user } = useFirebase();
  const { language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'paid': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'shipped': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'delivered': return 'text-brand-gold bg-brand-gold/10 border-brand-gold/20';
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle2 size={14} />;
      case 'shipped': return <Truck size={14} />;
      case 'delivered': return <Package size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 className="text-brand-gold animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <ShoppingBag className="text-brand-gold" size={24} />
            <span className="text-brand-gold tracking-[0.3em] uppercase text-sm font-medium">
              Your Journey
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-serif mb-4">
            {language === 'he' ? 'היסטוריית הזמנות' : 'Order History'}
          </h1>
          <p className="text-white/40 max-w-lg mx-auto font-light">
            {language === 'he' 
              ? 'עקבו אחר הרכישות שלכם וראו את הסטטוס של כל משלוח.'
              : 'Track your purchases and see the status of each delivery.'}
          </p>
        </header>

        {!user ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-white/60 mb-6">
              {language === 'he' ? 'אנא התחברו כדי לצפות בהיסטוריית ההזמנות שלכם.' : 'Please log in to view your order history.'}
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 space-y-6">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="text-white/20" size={40} />
            </div>
            <p className="text-white/40 font-serif italic">
              {language === 'he' ? 'עדיין לא ביצעתם הזמנות...' : 'No orders yet...'}
            </p>
            <button className="bg-brand-gold text-brand-black px-8 py-3 rounded-full font-bold hover:bg-white transition-colors">
              {language === 'he' ? 'לבוטיק' : 'To Boutique'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-gold/30 transition-all group"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Package className="text-brand-gold" size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-serif">#{order.orderId}</h3>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5",
                          getStatusColor(order.status)
                        )}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white/40 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard size={14} />
                          ₪{order.totalAmount}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="flex items-center gap-2 text-brand-gold hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                  >
                    {language === 'he' ? 'פרטי הזמנה' : 'Order Details'}
                    <ChevronRight size={16} className={cn("transition-transform", selectedOrder?.id === order.id && "rotate-90")} />
                  </button>
                </div>

                <AnimatePresence>
                  {selectedOrder?.id === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className="p-8 bg-white/[0.02] grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Items List */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">
                            {language === 'he' ? 'פריטים' : 'Items'}
                          </h4>
                          {Object.entries(order.items).map(([id, details]: [string, any]) => {
                            const product = boutiqueProducts.find(p => p.id === id);
                            return (
                              <div key={id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden shrink-0">
                                    {product?.image ? (
                                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-white/20">
                                        <Package size={20} />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm text-white font-medium">{product?.name || id}</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{details.quantity}x ₪{product?.price || '---'}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-serif text-brand-gold">₪{(product?.price || 0) * details.quantity}</span>
                              </div>
                            );
                          })}
                          <div className="pt-4 flex justify-between items-center font-serif text-lg">
                            <span className="text-white/40">{language === 'he' ? 'סה"כ:' : 'Total:'}</span>
                            <span className="text-brand-gold">₪{order.totalAmount}</span>
                          </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">
                              {language === 'he' ? 'כתובת למשלוח' : 'Shipping Address'}
                            </h4>
                            <div className="text-sm text-white/60 space-y-1">
                              <p className="text-white font-medium">{order.customerDetails.firstName} {order.customerDetails.lastName}</p>
                              <p>{order.customerDetails.address}</p>
                              <p>{order.customerDetails.city}</p>
                              <p>{order.customerDetails.email}</p>
                            </div>
                          </div>

                          <div className="p-4 bg-brand-gold/5 rounded-2xl border border-brand-gold/10">
                            <div className="flex items-center gap-3 mb-2">
                              <Truck size={18} className="text-brand-gold" />
                              <span className="text-xs font-bold uppercase tracking-widest">
                                {language === 'he' ? 'סטטוס משלוח' : 'Shipping Status'}
                              </span>
                            </div>
                            <p className="text-sm text-white/80">
                              {order.status === 'paid' 
                                ? (language === 'he' ? 'ההזמנה בטיפול ותשלח בקרוב' : 'Order is being processed and will ship soon')
                                : (language === 'he' ? 'החבילה בדרך אליכם' : 'Package is on its way')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
