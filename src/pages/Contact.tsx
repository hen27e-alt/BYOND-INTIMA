import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, MessageCircle, Sparkles } from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { BRANDING } from '../constants/branding';

export const Contact = () => {
  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/byondintima', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: Instagram, href: BRANDING.instagram, color: 'hover:text-pink-600' },
    { name: 'TikTok', icon: MessageCircle, href: 'https://tiktok.com/@byondintima', color: 'hover:text-black' },
    { name: 'WhatsApp', icon: Phone, href: `https://wa.me/${BRANDING.whatsapp.replace(/-/g, '')}`, color: 'hover:text-green-600' },
  ];

  const workingHours = [
    { day: 'ראשון - חמישי', hours: '09:00 - 19:00' },
    { day: 'שישי', hours: '09:00 - 14:00' },
    { day: 'שבת', hours: 'סגור' },
  ];

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({ name: '', email: '', subject: '', message: '' });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', subject: '', message: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'שדה חובה';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'שדה חובה';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא חוקית';
      isValid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'שדה חובה';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'שדה חובה';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitted(true);
    // In a real app, we would send this to a backend
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="pt-32 pb-20 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <EditableText 
            contentId="contact_title" 
            defaultText="צור קשר" 
            as="h1"
            className="text-5xl font-serif mb-4"
          />
          <EditableText 
            contentId="contact_subtitle" 
            defaultText="אנחנו כאן בשבילכם לכל שאלה או בקשה" 
            as="p"
            className="text-brand-black/50 uppercase tracking-[0.3em] text-xs"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div>
              <EditableText 
                contentId="contact_info_title" 
                defaultText="פרטי התקשרות" 
                as="h2"
                className="text-2xl font-serif mb-8"
              />
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-brand-black">כתובת</h4>
                    <p className="text-brand-black/60 text-sm">{BRANDING.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-brand-black">טלפון</h4>
                    <p className="text-brand-black/60 text-sm">{BRANDING.phone}</p>
                    <p className="text-brand-black/60 text-sm">{BRANDING.whatsapp}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-brand-black">אימייל</h4>
                    <a href={`mailto:${BRANDING.email}`} className="text-brand-black/60 text-sm hover:text-brand-gold transition-colors">
                      {BRANDING.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <EditableText 
                contentId="contact_hours_title" 
                defaultText="שעות פעילות" 
                as="h2"
                className="text-2xl font-serif mb-8"
              />
              <div className="bg-white border border-brand-gold/10 p-8 space-y-4">
                {workingHours.map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-brand-gold/5 pb-4 last:border-0 last:pb-0">
                    <span className="font-medium text-brand-black">{item.day}</span>
                    <span className="text-brand-black/60 text-sm">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <EditableText 
                contentId="contact_social_title" 
                defaultText="עקבו אחרינו" 
                as="h2"
                className="text-2xl font-serif mb-8"
              />
                  <div className="flex gap-6">
                {socialLinks.map((social, i) => (
                  <motion.a 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    key={i} 
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 bg-white border border-brand-gold/10 rounded-full flex items-center justify-center text-brand-black/60 transition-all ${social.color} shadow-sm`}
                    aria-label={social.name}
                  >
                    <social.icon size={20} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-brand-gold/10 p-12 shadow-2xl"
          >
            <EditableText 
              contentId="contact_form_title" 
              defaultText="שלחו לנו הודעה" 
              as="h2"
              className="text-2xl font-serif mb-8"
            />
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-gold/10 border border-brand-gold/30 p-12 text-center rounded-2xl"
              >
                <Sparkles className="text-brand-gold mx-auto mb-6" size={48} />
                <h3 className="text-2xl font-serif mb-4">ההודעה נשלחה בהצלחה!</h3>
                <p className="text-brand-black/60">תודה שפניתם אלינו. נחזור אליכם בהקדם האפשרי.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-brand-black/40">שם מלא</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full bg-brand-cream/30 border ${errors.name ? 'border-red-500' : 'border-brand-gold/10'} p-4 focus:border-brand-gold outline-none transition-colors`}
                      placeholder="ישראל ישראלי"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-brand-black/40">אימייל</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full bg-brand-cream/30 border ${errors.email ? 'border-red-500' : 'border-brand-gold/10'} p-4 focus:border-brand-gold outline-none transition-colors`}
                      placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-brand-black/40">נושא</label>
                  <input 
                    type="text" 
                    value={formData.subject}
                    onChange={(e) => {
                      setFormData({ ...formData, subject: e.target.value });
                      if (errors.subject) setErrors({ ...errors, subject: '' });
                    }}
                    className={`w-full bg-brand-cream/30 border ${errors.subject ? 'border-red-500' : 'border-brand-gold/10'} p-4 focus:border-brand-gold outline-none transition-colors`}
                    placeholder="איך נוכל לעזור?"
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>
  
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-brand-black/40">הודעה</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    className={`w-full bg-brand-cream/30 border ${errors.message ? 'border-red-500' : 'border-brand-gold/10'} p-4 h-40 focus:border-brand-gold outline-none transition-colors resize-none`}
                    placeholder="כתבו כאן את הודעתכם..."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>
  
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-5 bg-brand-black text-white uppercase tracking-[0.3em] text-xs font-bold hover:bg-brand-gold transition-all duration-500 shadow-lg hover:shadow-brand-gold/20"
                >
                  שלח הודעה
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
