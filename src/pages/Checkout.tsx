import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ArrowRight, CreditCard, ShoppingBag, Truck, Shield, Phone, Mail, User, MapPin, Loader2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cardDecks } from '../data/decks';
import { boutiqueProducts } from '../data/boutique';
import { useAlert } from '../components/AlertModal';
import { EditableText } from '../components/EditableText';

export const Checkout = () => {
  const { cart, updateQuantity, removeFromCart, cartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    shippingAddress: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personalizations, setPersonalizations] = useState<Record<string, { name: string, dedication: string }>>({});

  const handlePersonalizationChange = (id: string, field: 'name' | 'dedication', value: string) => {
    setPersonalizations(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const getProduct = (id: string) => {
    const deck = cardDecks.find(d => d.id === id);
    if (deck) return deck;
    const boutique = boutiqueProducts.find(p => p.id === id);
    if (boutique) return boutique;
    return null;
  };

  const subtotal = Object.entries(cart).reduce((sum, [id, data]) => {
    const product = getProduct(id);
    const price = product?.price || 119;
    return sum + (price * (data.quantity || 0));
  }, 0);

  const shipping = subtotal > 300 ? 0 : 25;
  const total = subtotal + shipping;

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^05\d-?\d{7}$/;
    return phoneRegex.test(phone);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'שדה חובה';
    if (!formData.lastName) newErrors.lastName = 'שדה חובה';
    if (!formData.email) newErrors.email = 'שדה חובה';
    if (!formData.phone) {
      newErrors.phone = 'שדה חובה';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'מספר טלפון לא תקין (למשל: 050-1234567)';
    }
    if (!formData.address) newErrors.address = 'שדה חובה';
    if (!formData.city) newErrors.city = 'שדה חובה';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    
    try {
      const cartItems = Object.entries(cart).map(([id, data]) => {
        const product = getProduct(id);
        return {
          id,
          name: product?.name || 'מוצר',
          price: product?.price || 119,
          quantity: data.quantity,
          personalization: personalizations[id] || data.personalization || null
        };
      });

      console.log('Submitting order:', { formData, cart: cartItems, total, paymentMethod });

      const response = await fetch('/api/checkout/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          cart: cartItems,
          total,
          paymentMethod
        })
      });

      const data = await response.json();
      console.log('Checkout response:', data);

      if (data.success) {
        if (data.paymentUrl) {
          // Redirect to Stripe Checkout
          window.location.href = data.paymentUrl;
          return;
        }

        // For non-Stripe or simulated success
        const orderData = {
          orderId: data.orderId,
          customerName: `${formData.firstName} ${formData.lastName}`,
          total,
          address: `${formData.address}, ${formData.city}`,
          phone: formData.phone,
          items: cartItems
        };

        clearCart();
        navigate('/order-confirmation', { state: { orderData } });
      } else {
        showAlert('שגיאה בביצוע ההזמנה: ' + (data.error || 'אנא נסה שוב מאוחר יותר'));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showAlert('שגיאה בתקשורת עם השרת. אנא נסה שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (cartCount === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center" dir="rtl">
        <div className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold mb-8">
          <ShoppingBag size={48} />
        </div>
        <EditableText 
          contentId="checkout_empty_title"
          defaultText="סל הקניות שלך ריק"
          as="h1"
          className="text-4xl font-serif font-black mb-4"
        />
        <p className="text-brand-black/60 mb-12 max-w-md">נראה שעדיין לא הוספת שום חפיסה לסל. זה הזמן להתחיל את המסע שלך.</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            to="/decks" 
            className="px-12 py-4 bg-brand-black text-white text-xs font-black uppercase tracking-[0.3em] rounded-full hover:bg-brand-gold transition-all shadow-xl inline-block"
          >
            חזרה לחנות
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-32 pb-20 px-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Link to="/decks" className="p-2 hover:text-brand-gold transition-colors">
            <ArrowRight size={24} />
          </Link>
          <EditableText 
            contentId="checkout_title"
            defaultText="השלמת הזמנה"
            as="h1"
            className="text-4xl md:text-6xl font-serif font-black tracking-tighter"
          />
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Details & Payment */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Personal Details */}
            <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-brand-black/5">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold">
                  <User size={24} />
                </div>
                <h2 className="text-3xl font-serif font-black">פרטים אישיים</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 px-2">שם פרטי</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 bg-[#F8F8F8] rounded-2xl border ${errors.firstName ? 'border-red-500' : 'border-brand-black/5'} focus:border-brand-gold outline-none transition-colors`}
                    placeholder="ישראל"
                  />
                  {errors.firstName && <p className="text-red-500 text-[10px] font-bold px-2">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 px-2">שם משפחה</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 bg-[#F8F8F8] rounded-2xl border ${errors.lastName ? 'border-red-500' : 'border-brand-black/5'} focus:border-brand-gold outline-none transition-colors`}
                    placeholder="ישראלי"
                  />
                  {errors.lastName && <p className="text-red-500 text-[10px] font-bold px-2">{errors.lastName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 px-2">אימייל</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 bg-[#F8F8F8] rounded-2xl border ${errors.email ? 'border-red-500' : 'border-brand-black/5'} focus:border-brand-gold outline-none transition-colors`}
                    placeholder="example@gmail.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] font-bold px-2">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 px-2">טלפון</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 bg-[#F8F8F8] rounded-2xl border ${errors.phone ? 'border-red-500' : 'border-brand-black/5'} focus:border-brand-gold outline-none transition-colors`}
                    placeholder="050-0000000"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] font-bold px-2">{errors.phone}</p>}
                </div>
              </div>
            </section>

            {/* Shipping Details */}
            <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-brand-black/5">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold">
                  <MapPin size={24} />
                </div>
                <h2 className="text-3xl font-serif font-black">כתובת למשלוח</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 px-2">עיר</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 bg-[#F8F8F8] rounded-2xl border ${errors.city ? 'border-red-500' : 'border-brand-black/5'} focus:border-brand-gold outline-none transition-colors`}
                    placeholder="תל אביב"
                  />
                  {errors.city && <p className="text-red-500 text-[10px] font-bold px-2">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 px-2">רחוב ומספר בית</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-6 py-4 bg-[#F8F8F8] rounded-2xl border ${errors.address ? 'border-red-500' : 'border-brand-black/5'} focus:border-brand-gold outline-none transition-colors`}
                    placeholder="הרצל 1"
                  />
                  {errors.address && <p className="text-red-500 text-[10px] font-bold px-2">{errors.address}</p>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 px-2">כתובת למשלוח (אם שונה מכתובת המגורים)</label>
                  <input 
                    type="text" 
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-[#F8F8F8] rounded-2xl border border-brand-black/5 focus:border-brand-gold outline-none transition-colors"
                    placeholder="הזן כתובת אחרת למשלוח במידה וצריך"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 px-2">הערות לשליח (קומה, כניסה, קוד לבניין)</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-6 py-4 bg-[#F8F8F8] rounded-2xl border border-brand-black/5 focus:border-brand-gold outline-none transition-colors resize-none"
                    placeholder="למשל: קומה 3, כניסה ב', קוד 1234"
                  />
                </div>
              </div>
            </section>

            {/* Personalization */}
            <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-brand-black/5">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-3xl font-serif font-black">התאמה אישית</h2>
              </div>
              <p className="text-brand-black/60 mb-6 font-medium">ניתן להוסיף שם והקדשה אישית לכל פריט בהזמנה (אופציונלי).</p>

              <div className="space-y-6">
                {Object.entries(cart).map(([id, qty]) => {
                  const product = getProduct(id);
                  if (!product) return null;
                  return (
                    <div key={id} className="p-6 bg-[#F8F8F8] rounded-2xl border border-brand-black/5">
                      <h3 className="font-bold mb-4 font-serif text-lg">{product.name}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 px-2">שם לחריטה/הדפסה</label>
                          <input 
                            type="text" 
                            value={personalizations[id]?.name || ''}
                            onChange={(e) => handlePersonalizationChange(id, 'name', e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-brand-black/5 focus:border-brand-gold outline-none transition-colors"
                            placeholder="לדוגמה: ישראל ישראלי"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 px-2">הקדשה אישית</label>
                          <input 
                            type="text" 
                            value={personalizations[id]?.dedication || ''}
                            onChange={(e) => handlePersonalizationChange(id, 'dedication', e.target.value)}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-brand-black/5 focus:border-brand-gold outline-none transition-colors"
                            placeholder="לדוגמה: באהבה תמיד"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Payment Methods */}
            <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-brand-black/5">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold">
                  <CreditCard size={24} />
                </div>
                <h2 className="text-3xl font-serif font-black">אמצעי תשלום</h2>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'credit-card', name: 'כרטיס אשראי', icon: <CreditCard size={20} /> },
                  { id: 'paypal', name: 'PayPal', icon: <span className="font-bold italic">PP</span> },
                  { id: 'google-pay', name: 'Google Pay', icon: <span className="font-bold">GPay</span> },
                  { id: 'apple-pay', name: 'Apple Pay', icon: <span className="font-bold">Apple</span> },
                  { id: 'phone', name: 'הזמנה טלפונית', icon: <Phone size={20} /> },
                ].map((method) => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-right ${
                      paymentMethod === method.id 
                        ? 'border-brand-gold bg-brand-gold/5 shadow-md' 
                        : 'border-brand-black/5 bg-[#F8F8F8] hover:border-brand-black/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === method.id ? 'bg-brand-gold text-white' : 'bg-white text-brand-black/40'
                    }`}>
                      {method.icon}
                    </div>
                    <span className="font-bold text-sm">{method.name}</span>
                  </motion.button>
                ))}
              </div>

              {paymentMethod === 'credit-card' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8 p-8 bg-brand-gold/5 rounded-[2rem] border border-brand-gold/20 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Shield className="text-brand-gold" size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-black">תשלום מאובטח באמצעות Stripe</h3>
                    <p className="text-sm text-brand-black/60 leading-relaxed max-w-md">
                      בלחיצה על "בצע הזמנה", תועברו לעמוד התשלום המאובטח של Stripe להשלמת הרכישה. 
                      הפרטים שלכם מוצפנים ומוגנים בסטנדרטים הגבוהים ביותר.
                    </p>
                  </div>
                  <div className="flex gap-4 opacity-40 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6" />
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'phone' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8 p-6 bg-brand-gold/5 rounded-2xl border border-brand-gold/20"
                >
                  <p className="text-sm font-medium text-brand-black/80 leading-relaxed">
                    נציג שלנו יחזור אליך טלפונית תוך 24 שעות להשלמת התשלום וההזמנה.
                  </p>
                </motion.div>
              )}
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-brand-black/5">
                <h2 className="text-2xl font-serif font-black mb-8">סיכום הזמנה</h2>
                
                <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(cart).map(([id, data]) => {
                    const product = getProduct(id);
                    if (!product) return null;
                    const isBoutique = 'image' in product;
                    return (
                      <div key={id} className="flex items-center gap-4">
                        {isBoutique ? (
                          <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div 
                            className="w-12 h-16 rounded-lg flex items-center justify-center text-white text-[8px] font-black shrink-0"
                            style={{ background: (product as any).color }}
                          >
                            BYD
                          </div>
                        )}
                        <div className="flex-grow">
                          <p className="text-sm font-bold">{isBoutique ? product.name : `BYOND ${product.name}`}</p>
                          <p className="text-xs text-brand-black/40">{data.quantity} יחידות</p>
                        </div>
                        <p className="font-black text-sm">₪{(product.price || 119) * (data.quantity || 0)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4 mb-8 pt-6 border-t border-brand-black/5">
                  <div className="flex justify-between text-sm font-medium text-brand-black/60">
                    <span>סכום ביניים</span>
                    <span>₪{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-brand-black/60">
                    <span>משלוח</span>
                    <span>{shipping === 0 ? 'חינם' : `₪${shipping}`}</span>
                  </div>
                  <div className="h-px bg-brand-black/5 my-4" />
                  <div className="flex justify-between text-xl font-black">
                    <span>סה"כ לתשלום</span>
                    <span className="text-brand-gold">₪{total}</span>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-brand-black text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-gold transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Shield size={18} />
                      בצע הזמנה מאובטחת
                    </>
                  )}
                </motion.button>
                
                <div className="mt-6 flex items-center justify-center gap-4 opacity-40">
                  <Truck size={20} />
                  <span className="text-[9px] font-black uppercase tracking-widest">משלוח מהיר עד הבית</span>
                </div>
              </div>

              <div className="bg-brand-gold/10 p-6 rounded-3xl border border-brand-gold/20">
                <div className="flex items-center gap-3 text-brand-gold mb-2">
                  <Shield size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">רכישה בטוחה</span>
                </div>
                <p className="text-[10px] text-brand-black/60 font-medium leading-relaxed">
                  הפרטים שלך מוצפנים ומאובטחים. אנחנו לא שומרים את פרטי כרטיס האשראי שלך במערכת.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
