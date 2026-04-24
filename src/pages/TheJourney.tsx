import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Calendar, Clock, CreditCard, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { EditableImage } from '../components/EditableImage';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

import { useAlert } from '../components/AlertModal';

export const TheJourney = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { showAlert } = useAlert();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    experience: 'The Journey Full Experience'
  });

  const stages = [
    { name: 'נוכחות', desc: 'להיות כאן ועכשיו.' },
    { name: 'סקרנות', desc: 'לגלות מחדש את מי שמולנו.' },
    { name: 'פגיעות', desc: 'להסיר את המגננות.' },
    { name: 'אמת', desc: 'לדבר את הלב ללא פילטרים.' },
    { name: 'תשוקה', desc: 'להצית את האש הפנימית.' },
    { name: 'הצתה', desc: 'חיבור פיזי ורגשי עוצמתי.' },
    { name: 'בחירה', desc: 'לבחור אחד בשנייה מחדש.' }
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1);
    } else {
      // Finalize booking
      setTimeout(() => {
        setIsBookingOpen(false);
        setBookingStep(1);
        showAlert(
          language === 'he' ? 'ההזמנה בוצעה בהצלחה!' : 'Booking successful!',
          'success'
        );
      }, 1500);
    }
  };

  return (
    <div className="bg-brand-black text-white min-h-screen pt-32 pb-32 selection:bg-brand-gold selection:text-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
          >
            <span className="text-xs tracking-[0.5em] text-brand-gold uppercase mb-8 block">Private Collection</span>
            <EditableText 
              contentId="the_journey_title"
              defaultText="THE JOURNEY"
              as="h1"
              className="text-6xl md:text-8xl font-serif font-light mb-12 tracking-wider"
            />
            <div className="w-24 h-px bg-brand-gold mx-auto mb-12"></div>
            <EditableText 
              contentId="the_journey_description"
              defaultText="זה מסע על זוגיות, על התבוננות לעמקי הקשר הרגשי, ומשם הצמיחה וההתחזקות שלכם. זה לא מסע לכל אחד, זה מסע משנה חיים."
              as="p"
              multiline
              className="text-xl text-white/60 leading-relaxed font-light italic article-content"
            />
          </motion.div>
        </div>

        {/* Explanation Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <EditableText 
              contentId="the_journey_explanation_title"
              defaultText="להעמיק, לגלות, להתחבר מחדש"
              as="h2"
              className="text-3xl md:text-4xl font-serif text-brand-gold"
            />
            <div className="space-y-6 text-lg text-white/70 font-light leading-relaxed">
              <EditableText 
                contentId="the_journey_explanation_p1"
                defaultText="THE JOURNEY הוא לא תחליף לטיפול זוגי, אלא מרחב בטוח ואינטימי שאתם יוצרים בעצמכם. המסע הזה נועד לקחת אתכם יד ביד אל המקומות העמוקים ביותר בקשר שלכם."
                as="p"
                multiline
              />
              <EditableText 
                contentId="the_journey_explanation_p2"
                defaultText="אנחנו מאמינים שכדי לצמוח באמת, צריך להעז לצלול פנימה. לגעת בנקודות הרגישות, להסיר את המגננות, ומשם – לעלות חזרה למעלה, מחוברים, חזקים ואוהבים יותר מאי פעם."
                as="p"
                multiline
              />
              <EditableText 
                contentId="the_journey_explanation_p3"
                defaultText="זהו תהליך של גילוי מחדש, של בניית אמון ברמה הגבוהה ביותר, ושל יצירת אינטימיות שלא הכרתם. דרך 7 שלבים מובנים, תלמדו לתקשר אחרת, להקשיב באמת, ולבחור אחד בשנייה מחדש, בכל יום."
                as="p"
                multiline
              />
            </div>
            
            <div className="pt-8 flex flex-wrap gap-4">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-brand-gold text-brand-black px-8 py-4 rounded-full font-bold hover:bg-white transition-colors flex items-center gap-2 group"
              >
                <Calendar size={20} />
                {language === 'he' ? 'הזמנת חוויה' : 'Book Experience'}
              </button>
              <button 
                onClick={() => navigate('/checkout')}
                className="border border-brand-gold text-brand-gold px-8 py-4 rounded-full font-bold hover:bg-brand-gold hover:text-brand-black transition-colors flex items-center gap-2 group"
              >
                <CreditCard size={20} />
                {language === 'he' ? 'מעבר לתשלום' : 'Go to Checkout'}
              </button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-brand-gold/20"
          >
            <EditableImage 
              contentId="the_journey_main_image"
              defaultSrc="https://images.unsplash.com/photo-1555529771-835f59bfc50c?auto=format&fit=crop&q=80&w=1200" 
              alt="Romantic couple looking lovingly at each other in a cozy restaurant" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-80 pointer-events-none" />
          </motion.div>
        </div>

        {/* Product Showcase */}
        <div className="grid lg:grid-cols-2 gap-24 items-center mb-40">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-white/5 border border-white/10 p-12 flex items-center justify-center">
               <div className="w-full h-full border border-brand-gold/20 flex flex-col items-center justify-center text-center p-8">
                  <EditableText 
                    contentId="the_journey_box_title"
                    defaultText="THE BOX"
                    as="h4"
                    className="font-serif text-3xl mb-4"
                  />
                  <EditableText 
                    contentId="the_journey_box_subtitle"
                    defaultText="Matte Black & Gold Embossing"
                    as="p"
                    className="text-sm text-white/40 uppercase tracking-widest"
                  />
               </div>
            </div>
            <div className="absolute -bottom-8 -right-8 bg-brand-gold p-8 text-black">
               <Lock size={32} />
            </div>
          </motion.div>

          <div className="space-y-12">
            <EditableText 
              contentId="the_journey_box_items_title"
              defaultText="מה בתוך המארז?"
              as="h3"
              className="text-3xl font-serif text-brand-gold"
            />
            <ul className="space-y-6 text-lg text-white/70 font-light">
              {[
                { id: '01', text: 'קופסה קשיחה מגנטית' },
                { id: '02', text: 'יומן מסע בכריכה קשה' },
                { id: '03', text: '7 כרכים עומדים (פרקי המסע)' },
                { id: '04', text: 'תא נסתר עם הפתעות' },
                { id: '05', text: 'כיסוי עיניים סאטן ונוצה' },
                { id: '06', text: 'ריח מותגי ייחודי' }
              ].map((item) => (
                <li key={item.id} className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <span className="text-brand-gold font-serif">{item.id}</span>
                  <EditableText 
                    contentId={`the_journey_box_item_${item.id}`}
                    defaultText={item.text}
                    as="span"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The 7 Stages */}
        <div className="mb-40">
          <EditableText 
            contentId="the_journey_stages_title"
            defaultText="שבעת שלבי המסע"
            as="h3"
            className="text-center text-4xl font-serif mb-24"
          />
          <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-8">
            {stages.map((stage, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-12 h-12 rounded-full border border-brand-gold/30 flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-gold group-hover:text-black transition-all duration-500">
                  {i + 1}
                </div>
                <EditableText 
                  contentId={`the_journey_stage_name_${i}`}
                  defaultText={stage.name}
                  as="h4"
                  className="font-serif text-xl mb-2 text-brand-gold"
                />
                <EditableText 
                  contentId={`the_journey_stage_desc_${i}`}
                  defaultText={stage.desc}
                  as="p"
                  className="text-xs text-white/40 uppercase tracking-tighter"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <EditableText 
              contentId="the_journey_cta_status"
              defaultText="זמין בקרוב"
              as="p"
              className="text-brand-gold mb-8 tracking-[0.3em] uppercase text-2xl md:text-4xl font-serif"
            />
          </motion.div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingOpen(false)}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-serif text-brand-gold">
                    {language === 'he' ? 'הזמנת חוויה זוגית' : 'Book Couple Experience'}
                  </h3>
                  <button 
                    onClick={() => setIsBookingOpen(false)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                  {[1, 2, 3].map(step => (
                    <div 
                      key={step}
                      className={`h-1 flex-grow rounded-full transition-colors ${
                        bookingStep >= step ? "bg-brand-gold" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  {bookingStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <label className="block">
                        <span className="text-sm text-white/60 mb-2 block">{language === 'he' ? 'בחרו תאריך' : 'Select Date'}</span>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                          <input 
                            type="date" 
                            required
                            value={bookingData.date}
                            onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-brand-gold outline-none transition-colors"
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-sm text-white/60 mb-2 block">{language === 'he' ? 'בחרו שעה' : 'Select Time'}</span>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                          <select 
                            required
                            value={bookingData.time}
                            onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-brand-gold outline-none transition-colors appearance-none"
                          >
                            <option value="" className="bg-brand-black">Select a time</option>
                            <option value="18:00" className="bg-brand-black">18:00</option>
                            <option value="19:00" className="bg-brand-black">19:00</option>
                            <option value="20:00" className="bg-brand-black">20:00</option>
                            <option value="21:00" className="bg-brand-black">21:00</option>
                          </select>
                        </div>
                      </label>
                    </motion.div>
                  )}

                  {bookingStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-white/60">{language === 'he' ? 'חוויה:' : 'Experience:'}</span>
                          <span>{bookingData.experience}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-white/60">{language === 'he' ? 'תאריך:' : 'Date:'}</span>
                          <span>{bookingData.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">{language === 'he' ? 'שעה:' : 'Time:'}</span>
                          <span>{bookingData.time}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="block">
                          <span className="text-sm text-white/60 mb-2 block">{language === 'he' ? 'פרטי אשראי' : 'Credit Card Details'}</span>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
                            <input 
                              type="text" 
                              placeholder="XXXX XXXX XXXX XXXX"
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-brand-gold outline-none transition-colors"
                            />
                          </div>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            type="text" 
                            placeholder="MM/YY"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-gold outline-none transition-colors"
                          />
                          <input 
                            type="text" 
                            placeholder="CVV"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-gold outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {bookingStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-20 h-20 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-brand-gold" size={40} />
                      </div>
                      <h4 className="text-2xl font-serif mb-2">{language === 'he' ? 'הכל מוכן!' : 'All Set!'}</h4>
                      <p className="text-white/60">{language === 'he' ? 'לחצו על הכפתור למטה לסיום ההזמנה' : 'Click the button below to finalize your booking'}</p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-brand-gold text-brand-black py-4 rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
                  >
                    {bookingStep === 3 
                      ? (language === 'he' ? 'סיום הזמנה' : 'Finalize Booking')
                      : (language === 'he' ? 'המשך' : 'Continue')}
                    <ChevronRight size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
