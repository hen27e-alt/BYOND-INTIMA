import { useEffect, useRef } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export const usePushNotifications = () => {
  const { user, profile } = useFirebase();
  const checkedDeadlines = useRef(false);

  useEffect(() => {
    if (!user?.uid || !profile?.preferences?.onboardingCompleted) return;
    if (profile?.preferences?.notificationsEnabled === false) return;

    // Request permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      // 1. Listen for new notifications in the database
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('read', '==', false)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const now = new Date();
            const createdAt = data.createdAt?.toDate() || new Date(0);
            const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

            if (diffMinutes < 1) {
              new Notification(data.title, {
                body: data.body,
                icon: '/favicon.ico',
              });
            }
          }
        });
      });

      // 2. Check for approaching deadlines (only once per session)
      if (!checkedDeadlines.current) {
        checkedDeadlines.current = true;
        
        const checkDeadlines = async () => {
          const coupleId = profile?.coupleId || user.uid;
          const missionsQ = query(
            collection(db, 'couple_missions'),
            where('coupleId', '==', coupleId),
            where('completionStatus', '==', 'pending')
          );

          const snapshot = await getDocs(missionsQ);
          const now = new Date();
          const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

          snapshot.forEach(async (docSnap) => {
            const mission = docSnap.data();
            if (mission.deadline) {
              const deadlineDate = mission.deadline.toDate();
              // If deadline is within the next 24 hours and in the future
              if (deadlineDate > now && deadlineDate <= tomorrow) {
                // Check if we already notified about this mission recently
                const notifQ = query(
                  collection(db, 'notifications'),
                  where('userId', '==', user.uid),
                  where('type', '==', 'reminder'),
                  where('title', '==', `תזכורת: ${mission.title}`)
                );
                const notifSnap = await getDocs(notifQ);
                
                if (notifSnap.empty) {
                  // Create a notification in DB
                  await addDoc(collection(db, 'notifications'), {
                    userId: user.uid,
                    title: `תזכורת: ${mission.title}`,
                    body: `המשימה הזוגית שלכם מסתיימת בקרוב!`,
                    type: 'reminder',
                    read: false,
                    createdAt: serverTimestamp()
                  });
                  
                  // Also show browser notification immediately
                  new Notification(`תזכורת: ${mission.title}`, {
                    body: `המשימה הזוגית שלכם מסתיימת בקרוב!`,
                    icon: '/favicon.ico',
                  });
                }
              }
            }
          });
        };

        checkDeadlines();
      }

      return () => unsubscribe();
    }
  }, [user?.uid, profile?.preferences?.onboardingCompleted, profile?.coupleId, profile?.preferences?.notificationsEnabled]);

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  return { sendNotification };
};
