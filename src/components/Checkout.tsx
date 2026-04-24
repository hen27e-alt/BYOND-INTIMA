import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Truck, CheckCircle2, Loader2, MapPin, Phone, User, Mail, Shield, Tag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAlert } from './AlertModal';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export const Checkout = ({ isOpen, onClose, total }: CheckoutProps) => {
  const { cart, clearCart, discountAmount, promoCode } = useCart();
  const { user, profile } = useFirebase();
  const { showAlert } = useAlert();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const subtotal = total + discountAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^05\d-?\d{7}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(formData.phone)) {
      showAlert('מספר טלפון לא תקין. אנא הזן מספר בפורמט 050-1234567 או 0501234567');
      return;
    }
    setStep('payment');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create Order Data
      const orderData = {
        userId: user?.uid || 'guest',
        customerDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zip: formData.zip
        },
        items: cart,
        totalAmount: total,
        status: 'pending', // Initial status
        createdAt: serverTimestamp()
      };

      // 2. Save to Firestore first to get a document ID
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      const internalOrderId = docRef.id;

      // 3. Call real backend API for payment
      const response = await fetch('/api/checkout/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          cart,
          total,
          paymentMethod: 'credit-card',
          orderId: internalOrderId // Pass our internal ID
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      if (data.paymentUrl) {
        // Redirect to Stripe Checkout or other hosted payment page
        window.location.href = data.paymentUrl;
        return;
      }

      // If no redirect needed (e.g. simulated success)
      setStep('success');
      clearCart();
    } catch (error: any) {
      console.error("Order Error:", error);
      showAlert(`שגיאה בביצוע ההזמנה: ${error.message}`);
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-brand-cream shadow-2xl overflow-hidden rounded-3xl"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-brand-black p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center">
                  {step === 'details' ? <Truck size={20} className="text-brand-gold" /> : 
                   step === 'payment' ? <CreditCard size={20} className="text-brand-gold" /> : 
                   <CheckCircle2 size={20} className="text-brand-gold" />}
                </div>
                <div>
                  <h3 className="text-xl font-serif">
                    {step === 'details' ? 'פרטי משלוח' : 
                     step === 'payment' ? 'פרטי תשלום' : 
                     'הזמנה הושלמה'}
                  </h3>
                  <p className="text-[10px] text-brand-gold uppercase tracking-widest">
                    {step === 'details' ? 'שלב 1 מתוך 2' : 
                     step === 'payment' ? 'שלב 2 מתוך 2' : 
                     'תודה רבה!'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {step === 'details' && (
                <form onSubmit={handleSubmitDetails} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-black/40 flex items-center gap-2">
                        <User size={12} /> שם פרטי
                      </label>
                      <input 
                        required
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-brand-gold/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-black/40 flex items-center gap-2">
                        <User size={12} /> שם משפחה
                      </label>
                      <input 
                        required
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-brand-gold/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-black/40 flex items-center gap-2">
                        <Mail size={12} /> אימייל
                      </label>
                      <input 
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-brand-gold/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-black/40 flex items-center gap-2">
                        <Phone size={12} /> טלפון
                      </label>
                      <input 
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-brand-gold/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-brand-black/40 flex items-center gap-2">
                      <MapPin size={12} /> כתובת מלאה
                    </label>
                    <input 
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="רחוב ומספר בית"
                      className="w-full bg-white border border-brand-gold/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-black/40">עיר</label>
                      <input 
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-brand-gold/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-black/40">מיקוד</label>
                      <input 
                        required
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-brand-gold/10 rounded-xl px-4 py-3 outline-none focus:border-brand-gold transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-brand-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-gold hover:text-brand-black transition-all duration-500 mt-4"
                  >
                    המשך לתשלום
                  </button>
                </form>
              )}

              {step === 'payment' && (
                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="bg-brand-gold/5 p-8 rounded-3xl border border-brand-gold/10 flex flex-col items-center text-center space-y-4 mb-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Shield className="text-brand-gold" size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-serif font-black text-brand-black">תשלום מאובטח באמצעות Stripe</h3>
                      <p className="text-xs text-brand-black/60 leading-relaxed max-w-sm">
                        בלחיצה על "שלם", תועברו לעמוד התשלום המאובטח של Stripe להשלמת הרכישה. 
                        הפרטים שלכם מוצפנים ומוגנים בסטנדרטים הגבוהים ביותר.
                      </p>
                    </div>
                    <div className="flex gap-4 opacity-40 grayscale">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5" />
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white p-6 rounded-2xl border border-brand-gold/10 space-y-3 mb-8">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-black/40 mb-2">סיכום הזמנה</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-black/60">סיכום ביניים:</span>
                      <span className="text-brand-black">₪{subtotal}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          הנחה ({promoCode}):
                        </span>
                        <span>-₪{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-serif pt-3 border-t border-brand-gold/10">
                      <span className="text-brand-black">סה"כ:</span>
                      <span className="text-brand-gold">₪{total}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button 
                      type="button"
                      onClick={() => setStep('details')}
                      className="flex-1 py-4 border-2 border-brand-black text-brand-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-black hover:text-white transition-all duration-500"
                    >
                      חזרה
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] py-4 bg-brand-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-gold hover:text-brand-black transition-all duration-500 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          מעבד תשלום...
                        </>
                      ) : (
                        `שלם ₪${total}`
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 'success' && (
                <div className="text-center py-12 space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100"
                  >
                    <CheckCircle2 className="text-emerald-500" size={48} />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-3xl font-serif mb-2">ההזמנה התקבלה!</h3>
                    <p className="text-brand-black/60 max-w-sm mx-auto">
                      תודה רבה שבחרתם ב-Byond Intima. ההזמנה שלכם בטיפול ותשלח אליכם בהקדם.
                    </p>
                  </div>

                  <div className="bg-brand-gold/5 p-6 rounded-2xl border border-brand-gold/10 max-w-sm mx-auto">
                    <p className="text-xs text-brand-black/60 mb-1">מספר הזמנה:</p>
                    <p className="text-lg font-mono font-bold text-brand-gold">#{Math.floor(Math.random() * 900000) + 100000}</p>
                  </div>

                  <button 
                    onClick={onClose}
                    className="w-full max-w-sm py-4 bg-brand-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-gold hover:text-brand-black transition-all duration-500"
                  >
                    חזרה לבוטיק
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
