import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { useEditMode } from './EditableText';
import { useLanguage } from '../contexts/LanguageContext';
import { Camera, Loader2 } from 'lucide-react';
import { useAlert } from './AlertModal';

interface EditableImageProps {
  contentId: string;
  defaultSrc: string;
  alt: string;
  className?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({
  contentId,
  defaultSrc,
  alt,
  className = ''
}) => {
  const { isEditMode, isAdmin } = useEditMode();
  const { language } = useLanguage();
  const { showAlert } = useAlert();
  const [src, setSrc] = useState(defaultSrc);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_content', contentId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const langSrc = data[`imageUrl_${language}`] || data.imageUrl || defaultSrc;
        setSrc(langSrc);
      } else {
        setSrc(defaultSrc);
      }
      setLoading(false);
    }, (err) => {
      console.error(`Error loading image content (${contentId}):`, err);
      setLoading(false);
    });

    return () => unsub();
  }, [contentId, language, defaultSrc]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isAdmin) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showAlert('נא לבחור קובץ תמונה תקין');
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlert('גודל התמונה חורג מהמותר (עד 5MB)');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const storageRef = ref(storage, `site_images/${contentId}_${language}_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          console.error('Upload error:', error);
          showAlert('שגיאה בהעלאת התמונה');
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Save URL to Firestore
          await setDoc(doc(db, 'site_content', contentId), {
            contentId,
            [`imageUrl_${language}`]: downloadURL,
            updatedAt: serverTimestamp(),
            updatedBy: auth.currentUser?.uid
          }, { merge: true });

          setSrc(downloadURL);
          setUploading(false);
        }
      );
    } catch (error) {
      console.error('Error initiating upload:', error);
      showAlert('שגיאה בהעלאת התמונה');
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (isAdmin && isEditMode && !uploading) {
      fileInputRef.current?.click();
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-white/10 flex items-center justify-center ${className}`}>
        <Loader2 className="animate-spin text-brand-gold" />
      </div>
    );
  }

  return (
    <div 
      className={`relative group ${isEditMode && isAdmin ? 'cursor-pointer' : ''} ${className}`}
      onClick={triggerFileInput}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all ${isEditMode && isAdmin ? 'group-hover:opacity-70' : ''}`}
        referrerPolicy="no-referrer"
      />
      
      {isEditMode && isAdmin && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-white mb-2" size={32} />
              <span className="text-white text-sm font-bold">{Math.round(progress)}%</span>
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
              <Camera className="text-white" size={32} />
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
