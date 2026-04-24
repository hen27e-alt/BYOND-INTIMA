import React, { useEffect, useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { storage, db, handleFirestoreError, OperationType } from '../firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  setDoc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShoppingBag, 
  Search, 
  Trash2, 
  Ban, 
  CheckCircle, 
  CreditCard, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  UserX,
  RefreshCcw,
  DollarSign,
  Plus,
  Star,
  Download,
  X,
  ChevronRight,
  Settings,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/AlertModal';
import { EditableText, useEditMode } from '../components/EditableText';
import { boutiqueProducts } from '../data/boutique';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  credits?: number;
  medals?: string[];
  status?: 'active' | 'disabled';
  role?: 'user' | 'admin' | 'partner';
  isVip?: boolean;
  vipDate?: any;
  phone?: string;
  createdAt?: any;
  address?: string;
  location?: { lat: number; lng: number } | string;
  photoURL?: string;
  lastLogin?: any;
}

interface Order {
  orderId: string;
  userId: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  createdAt: any;
  items?: any[];
}

export const Admin = () => {
  const { profile, user, loading: authLoading } = useFirebase();
  const { isEditMode, setIsEditMode } = useEditMode();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'products' | 'premium' | 'missions' | 'recipes' | 'knowledge' | 'secret_missions' | 'feedback' | 'updates' | 'config' | 'site_content'>('users');
  const [siteContent, setSiteContent] = useState<any[]>([]);
  const [globalConfig, setGlobalConfig] = useState({
    siteName: '',
    conciergeName: '',
    globalAvatar: '',
    greetingVideoUrl: ''
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [secretMissions, setSecretMissions] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [showCreateMission, setShowCreateMission] = useState(false);
  const [showCreateSecretMission, setShowCreateSecretMission] = useState(false);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [showCreateKnowledge, setShowCreateKnowledge] = useState(false);
  const [showCreateUpdate, setShowCreateUpdate] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    points: 10,
    endDate: ''
  });
  const [newSecretMission, setNewSecretMission] = useState({
    userId: '',
    title: '',
    description: '',
    points: 50
  });
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    prepTime: '',
    difficulty: 'קל',
    imageUrl: '',
    videoUrl: ''
  });
  const [newKnowledge, setNewKnowledge] = useState({
    title: '',
    description: '',
    type: 'article' as 'article' | 'video' | 'podcast',
    url: '',
    category: '',
    thumbnailUrl: ''
  });
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'feature' as 'feature' | 'improvement' | 'fix' | 'roadmap'
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedUserForMedals, setSelectedUserForMedals] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'asc' | 'desc' } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<'mission' | 'secret_mission' | null>(null);
  const [newOrder, setNewOrder] = useState({
    userId: '',
    totalAmount: 0,
    status: 'pending' as Order['status'],
    items: ''
  });

  const isAdmin = profile?.role === 'admin' || profile?.email === 'hen27e@gmail.com' || user?.email === 'hen27e@gmail.com';
  const isPartner = profile?.role === 'partner';

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users' || activeTab === 'premium') {
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersList = usersSnap.docs.map(doc => doc.data() as UserProfile);
        setUsers(usersList);
      } else if (activeTab === 'products') {
        const productsSnap = await getDocs(collection(db, 'products'));
        setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'missions') {
        const missionsSnap = await getDocs(collection(db, 'weekly_missions'));
        const missionsList = missionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMissions(missionsList);
      } else if (activeTab === 'secret_missions') {
        const missionsSnap = await getDocs(collection(db, 'secret_missions'));
        setSecretMissions(missionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'recipes') {
        const recipesSnap = await getDocs(collection(db, 'weekly_recipes'));
        setRecipes(recipesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'knowledge') {
        const knowledgeSnap = await getDocs(collection(db, 'knowledge_hub'));
        setKnowledge(knowledgeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'feedback') {
        const feedbackSnap = await getDocs(query(collection(db, 'content_feedback'), orderBy('timestamp', 'desc')));
        setFeedback(feedbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'updates') {
        const updatesSnap = await getDocs(query(collection(db, 'site_updates'), orderBy('date', 'desc')));
        setUpdates(updatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'site_content') {
        const contentSnap = await getDocs(collection(db, 'site_content'));
        setSiteContent(contentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else if (activeTab === 'config') {
        const configSnap = await getDocs(collection(db, 'site_content'));
        const configDoc = configSnap.docs.find(d => d.id === 'global_config');
        if (configDoc) {
          setGlobalConfig(configDoc.data() as any);
        }
      } else {
        const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        const ordersList = ordersSnap.docs.map(doc => doc.data() as Order);
        setOrders(ordersList);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, activeTab);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (uid: string, newStatus: 'active' | 'disabled') => {
    setIsActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', uid), { status: newStatus });
      setUsers(users.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleVip = async (uid: string, currentVipStatus: boolean) => {
    setIsActionLoading(true);
    try {
      const updates: any = { isVip: !currentVipStatus };
      if (!currentVipStatus) {
        updates.vipDate = serverTimestamp();
      }
      await updateDoc(doc(db, 'users', uid), updates);
      setUsers(users.map(u => u.uid === uid ? { ...u, isVip: !currentVipStatus, vipDate: !currentVipStatus ? new Date() : null } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateUserCredits = async (uid: string, amount: number) => {
    setIsActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', uid), { credits: amount });
      setUsers(users.map(u => u.uid === uid ? { ...u, credits: amount } : u));
      setSelectedUser(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateUserMedals = async (uid: string, medals: string[]) => {
    setIsActionLoading(true);
    try {
      await updateDoc(doc(db, 'users', uid), { medals });
      setUsers(users.map(u => u.uid === uid ? { ...u, medals } : u));
      setSelectedUserForMedals(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    setIsActionLoading(true);
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers(users.filter(u => u.uid !== uid));
      setUserToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let valA = a[key];
    let valB = b[key];

    if (key === 'createdAt') {
      valA = a.createdAt?.seconds || 0;
      valB = b.createdAt?.seconds || 0;
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setIsActionLoading(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.userId || newOrder.totalAmount <= 0) {
      showAlert('נא למלא את כל השדות החובה');
      return;
    }

    setIsActionLoading(true);
    try {
      const orderId = Math.random().toString(36).substring(2, 11).toUpperCase();
      const orderData: Order = {
        orderId,
        userId: newOrder.userId,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        createdAt: serverTimestamp(),
        items: newOrder.items.split(',').map(i => i.trim()).filter(i => i !== '')
      };

      await setDoc(doc(db, 'orders', orderId), orderData);
      
      // Refresh orders if on orders tab
      if (activeTab === 'orders') {
        fetchData();
      }
      
      setShowCreateOrder(false);
      setNewOrder({ userId: '', totalAmount: 0, status: 'pending', items: '' });
      showAlert('הזמנה נוצרה בהצלחה');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateMission = async () => {
    if (!newMission.title || !newMission.description) {
      showAlert('נא למלא את כל השדות');
      return;
    }

    setIsActionLoading(true);
    try {
      await addDoc(collection(db, 'weekly_missions'), {
        ...newMission,
        points: Number(newMission.points),
        startDate: serverTimestamp(),
        endDate: newMission.endDate ? new Date(newMission.endDate) : serverTimestamp()
      });
      setShowCreateMission(false);
      setNewMission({ title: '', description: '', points: 10, endDate: '' });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'weekly_missions');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteMission = async (id: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmType('mission');
  };

  const confirmDeleteMission = async () => {
    if (!deleteConfirmId) return;
    setIsActionLoading(true);
    try {
      await deleteDoc(doc(db, 'weekly_missions', deleteConfirmId));
      setMissions(missions.filter(m => m.id !== deleteConfirmId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `weekly_missions/${deleteConfirmId}`);
    } finally {
      setIsActionLoading(false);
      setDeleteConfirmId(null);
      setDeleteConfirmType(null);
    }
  };

  const handleCreateSecretMission = async () => {
    if (!newSecretMission.userId || !newSecretMission.title) {
      showAlert('נא למלא את כל השדות');
      return;
    }

    setIsActionLoading(true);
    try {
      await addDoc(collection(db, 'secret_missions'), {
        ...newSecretMission,
        status: 'assigned',
        createdAt: serverTimestamp()
      });
      setShowCreateSecretMission(false);
      setNewSecretMission({ userId: '', title: '', description: '', points: 50 });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'secret_missions');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteSecretMission = async (id: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmType('secret_mission');
  };

  const confirmDeleteSecretMission = async () => {
    if (!deleteConfirmId) return;
    setIsActionLoading(true);
    try {
      await deleteDoc(doc(db, 'secret_missions', deleteConfirmId));
      setSecretMissions(secretMissions.filter(m => m.id !== deleteConfirmId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `secret_missions/${deleteConfirmId}`);
    } finally {
      setIsActionLoading(false);
      setDeleteConfirmId(null);
      setDeleteConfirmType(null);
    }
  };

  const handleCreateUpdate = async () => {
    if (!newUpdate.title || !newUpdate.description) {
      showAlert('נא למלא את כל השדות');
      return;
    }

    setIsActionLoading(true);
    try {
      await addDoc(collection(db, 'site_updates'), {
        ...newUpdate,
        createdAt: serverTimestamp()
      });
      setShowCreateUpdate(false);
      setNewUpdate({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'feature'
      });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'site_updates');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUpdate = async (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק עדכון זה?')) {
      setIsActionLoading(true);
      try {
        await deleteDoc(doc(db, 'site_updates', id));
        setUpdates(updates.filter(u => u.id !== id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `site_updates/${id}`);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleSyncHistory = async () => {
    if (!window.confirm('האם לסנכרן את היסטוריית הפיתוח של האתר? פעולה זו תוסיף את כל אבני הדרך המרכזיות שהוקמו עד כה.')) return;
    
    setIsSyncing(true);
    const history = [
      { title: 'השקת Byond Intima', description: 'גרסה ראשונה של האתר עלתה לאוויר עם דף בית מעוצב וקולקציית חוויות ראשונה.', date: '2026-01-01', type: 'feature' },
      { title: 'מערכת The Journey', description: 'השקת המפה האינטראקטיבית למעקב אחר התקדמות הזוגיות.', date: '2026-01-15', type: 'feature' },
      { title: 'אזור אישי וקרדיטים', description: 'הוספת דשבורד למשתמשים, צבירת נקודות, מדליות וניהול יתרה.', date: '2026-01-25', type: 'feature' },
      { title: 'מרכז הידע (Knowledge Hub)', description: 'השקת מאגר המאמרים, הפודקאסטים והסרטונים המקצועיים.', date: '2026-02-05', type: 'feature' },
      { title: 'משחקים וחידות', description: 'הוספת מערכת משחקים זוגיים, חידות יומיות והמלצות לסרטים.', date: '2026-02-12', type: 'feature' },
      { title: 'עוזר זוגיות מבוסס AI', description: 'שילוב Gemini AI לשיחות ייעוץ ותמיכה בזמן אמת.', date: '2026-02-20', type: 'feature' },
      { title: 'פאנל ניהול מתקדם', description: 'מערכת שליטה מלאה למנהלים על משתמשים, הזמנות ותוכן.', date: '2026-02-28', type: 'improvement' },
      { title: 'Culinary Moments', description: 'אפשרות לשיתוף תמונות של רגעי בישול זוגיים.', date: '2026-03-05', type: 'feature' },
      { title: 'Vision Board & Timeline', description: 'כלים לתכנון עתיד משותף ותיעוד זיכרונות היסטוריים.', date: '2026-03-10', type: 'feature' },
      { title: 'מערכת התראות Push', description: 'עדכונים בזמן אמת על משימות חדשות והודעות מהשותף.', date: '2026-03-14', type: 'feature' },
      { title: 'דף עדכוני אתר', description: 'השקת המערכת הנוכחית למעקב אחר שינויים באתר.', date: '2026-03-16', type: 'feature' }
    ];

    try {
      for (const item of history) {
        // Check if already exists to avoid duplicates
        const q = query(collection(db, 'site_updates'), where('title', '==', item.title));
        const existing = await getDocs(q);
        if (existing.empty) {
          await addDoc(collection(db, 'site_updates'), {
            ...item,
            createdAt: serverTimestamp()
          });
        }
      }
      showAlert('היסטוריית האתר סונכרנה בהצלחה!');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'site_updates');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Add BOM for Hebrew support
    
    if (activeTab === 'users' || activeTab === 'premium') {
      const dataToExport = activeTab === 'premium' ? users.filter(u => u.isVip) : users;
      csvContent += "UID,Name,Email,Phone,Role,Status,Credits,VIP,VIP Date\n";
      dataToExport.forEach(user => {
        const vipDate = user.vipDate?.toDate ? user.vipDate.toDate?.()?.toLocaleDateString('he-IL') : (user.vipDate ? new Date(user.vipDate).toLocaleDateString('he-IL') : '');
        const row = [
          user.uid,
          `"${user.displayName || ''}"`,
          user.email,
          user.phone || '',
          user.role || 'user',
          user.status || 'active',
          user.credits || 0,
          user.isVip ? 'Yes' : 'No',
          vipDate
        ].join(",");
        csvContent += row + "\n";
      });
    } else if (activeTab === 'products') {
      csvContent += "ID,Name,Category,Price,Image URL\n";
      products.forEach(product => {
        const row = [
          product.id,
          `"${product.name}"`,
          product.category || '',
          product.price,
          product.image
        ].join(",");
        csvContent += row + "\n";
      });
    } else {
      csvContent += "Order ID,User ID,Total Amount,Status,Date,Items\n";
      orders.forEach(order => {
        const date = order.createdAt?.toDate ? order.createdAt.toDate?.()?.toLocaleDateString('he-IL') : 'N/A';
        const items = order.items ? `"${order.items.join(', ')}"` : '';
        const row = [
          order.orderId,
          order.userId,
          order.totalAmount,
          order.status,
          date,
          items
        ].join(",");
        csvContent += row + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `byond_${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateGlobalConfig = async () => {
    setIsActionLoading(true);
    try {
      await setDoc(doc(db, 'site_content', 'global_config'), globalConfig);
      showAlert('הגדרות האתר עודכנו בהצלחה');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'site_content/global_config');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleGlobalAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsActionLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const storageRef = ref(storage, `site/global_avatar_${Date.now()}`);
        await uploadString(storageRef, base64, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);
        
        setGlobalConfig(prev => ({ ...prev, globalAvatar: downloadURL }));
        showAlert('תמונת האוואטר הועלתה בהצלחה');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading global avatar:', error);
      showAlert('שגיאה בהעלאת התמונה');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Loader2 className="animate-spin text-brand-gold" size={48} />
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = sortedOrders.filter(o => 
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
              <ShieldCheck size={28} />
            </div>
            <div>
              <EditableText 
                contentId="admin_title"
                defaultText="פאנל ניהול"
                as="h1"
                className="text-3xl font-serif text-brand-black"
              />
              <p className="text-brand-black/40 text-xs uppercase tracking-widest">ניהול משתמשים והזמנות - Byond Intima</p>
            </div>
          </div>
          
          <div className="flex bg-white border border-brand-gold/10 p-1 rounded-full relative">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'users' ? 'text-white' : 'text-brand-black/40 hover:text-brand-black'}`}
            >
              משתמשים
            </button>
            <button 
              onClick={() => setActiveTab('premium')}
              className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'premium' ? 'text-white' : 'text-brand-black/40 hover:text-brand-black'}`}
            >
              מנויי פרימיום
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'orders' ? 'text-white' : 'text-brand-black/40 hover:text-brand-black'}`}
            >
              הזמנות
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'products' ? 'text-white' : 'text-brand-black/40 hover:text-brand-black'}`}
            >
              מוצרים
            </button>
            <button 
              onClick={() => setActiveTab('missions')}
              className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'missions' ? 'text-white' : 'text-brand-black/40 hover:text-brand-black'}`}
            >
              משימות
            </button>
            <button 
              onClick={() => setActiveTab('secret_missions')}
              className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'secret_missions' ? 'text-white' : 'text-brand-black/40 hover:text-brand-black'}`}
            >
              סודיות
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'feedback' ? 'text-white' : 'text-brand-black/40 hover:text-brand-black'}`}
            >
              משוב
            </button>
            <button 
              onClick={() => setActiveTab('updates')}
              className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'updates' ? 'text-white' : 'text-brand-black/40 hover:text-brand-black'}`}
            >
              עדכונים
            </button>
            <button 
              onClick={() => setActiveTab('site_content')}
              className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'site_content' ? 'text-white' : 'text-brand-black/40 hover:text-brand-black'}`}
            >
              תוכן אתר
            </button>
            <button 
              onClick={() => setActiveTab('config')}
              className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'config' ? 'text-white' : 'text-brand-black/40 hover:text-brand-black'}`}
            >
              הגדרות
            </button>
            <motion.div 
              layoutId="adminTabBg"
              className="absolute inset-y-1 bg-brand-black rounded-full"
              initial={false}
              animate={{
                left: activeTab === 'users' ? '0%' : 
                      activeTab === 'premium' ? '8.33%' : 
                      activeTab === 'orders' ? '16.66%' : 
                      activeTab === 'products' ? '25%' : 
                      activeTab === 'missions' ? '33.33%' : 
                      activeTab === 'secret_missions' ? '41.66%' : 
                      activeTab === 'feedback' ? '50%' : 
                      activeTab === 'updates' ? '58.33%' : 
                      activeTab === 'knowledge' ? '66.66%' : 
                      activeTab === 'recipes' ? '75%' : 
                      activeTab === 'site_content' ? '83.33%' : '91.66%',
                width: '8.33%'
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-6 py-2 border border-brand-gold/20 text-brand-black rounded-full text-xs uppercase tracking-widest hover:bg-brand-gold/10 transition-all"
            >
              <Download size={16} />
              ייצוא נתונים
            </button>
            {activeTab === 'products' && (
              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                    if (window.confirm('האם לסנכרן את המוצרים מהקובץ ל-Firestore?')) {
                      setIsSyncing(true);
                      try {
                        const experiencePackages = [
                          {
                            id: 'spark',
                            name: 'THE SPARK (הניצוץ)',
                            tier: 'המארז הרגיל (Small)',
                            description: 'הציתו מחדש את הסקרנות וההתרגשות הראשונית. מארז הניצוץ הוא השער שלכם לעולם של חוויות זוגיות חדשות, מושלם לזוגות שרוצים להתחיל את המסע שלהם.',
                            image: 'https://ais-pre-qty22ua7w7j2wcnrsvjwol-78550764035.europe-west3.run.app/assets/spark_package.jpg',
                            price: 350,
                            category: 'experience',
                            focus: 'סקרנות, התחלה, חשמל באוויר.',
                            difficulty: 'קל',
                            avgTime: '2-3 שעות',
                            hasIntimateTasks: true,
                            hasCookingKit: true,
                            hasCinemaAccess: true,
                            hasAiGuide: false,
                            atmosphereLevel: 'בסיסי',
                            features: ["אתגר בישול זוגי", "קלפי משימות", "אתגר הסרטים האינטראקטיבי", "אתגר אמת או חובה", "חפש את המטמון", "אתגר אינטימי", "קלפי משימת בונוס", "מעטפה סודית לאזור האישי", "כרטיס גירוד מתנה"]
                          },
                          {
                            id: 'velvet',
                            name: 'THE VELVET (הקטיפה)',
                            tier: 'המארז הבינוני (Medium)',
                            description: 'התמסרו למגע רך ועומק רגשי חסר פשרות. מארז הקטיפה מעמיק את החיבור ביניכם עם חוויות חושניות ומרגשות יותר.',
                            image: 'https://ais-pre-qty22ua7w7j2wcnrsvjwol-78550764035.europe-west3.run.app/assets/velvet_package.jpg',
                            price: 450,
                            category: 'experience',
                            focus: 'חושניות, עומק, פינוק יוקרתי.',
                            difficulty: 'בינוני',
                            avgTime: '4-5 שעות',
                            hasIntimateTasks: true,
                            hasCookingKit: true,
                            hasCinemaAccess: true,
                            hasAiGuide: true,
                            atmosphereLevel: 'מורחב',
                            features: ["כל מה שיש במארז הניצוץ", "קלפי משימות מורחבות", "אתגר בישול מתקדם", "מעטפה סודית", "משימה אינטימית", "2 כרטיסי גירוד", "מערכת ניקוד ופתיחת רמות"]
                          },
                          {
                            id: 'ecstasy',
                            name: 'THE ECSTASY (האקסטזה)',
                            tier: 'המארז הגדול (Large)',
                            description: 'שחררו כל רסן והגיעו לשיאים חדשים של ריגוש ושפע. המארז האולטימטיבי לזוגות שלא מפחדים לצלול לעומק ולחוות את הכל.',
                            image: 'https://ais-pre-qty22ua7w7j2wcnrsvjwol-78550764035.europe-west3.run.app/assets/ecstasy_package.jpg',
                            price: 650,
                            category: 'experience',
                            focus: 'שיא, שפע, ריגוש מקסימלי.',
                            difficulty: 'מתקדם',
                            avgTime: '6+ שעות',
                            hasIntimateTasks: true,
                            hasCookingKit: true,
                            hasCinemaAccess: true,
                            hasAiGuide: true,
                            atmosphereLevel: 'פרימיום',
                            features: ["כל מה שיש במארז הקטיפה", "למעלה מ-300 קלפי חוויה ייחודיים", "משימת מטבח יוקרתית", "חבילת קלפי משימות מורחבים", "משימה אינטימית מורחבת", "מפתח לפתיחת עונה 2", "5 כרטיסי גירוד"]
                          }
                        ];
                        for (const pkg of experiencePackages) {
                          await setDoc(doc(db, 'products', pkg.id), pkg);
                        }
                        for (const product of boutiqueProducts) {
                          await setDoc(doc(db, 'products', product.id), product);
                        }
                        showAlert('המוצרים סונכרנו בהצלחה!');
                        fetchData();
                      } catch (error) {
                        handleFirestoreError(error, OperationType.CREATE, 'products');
                      } finally {
                        setIsSyncing(false);
                      }
                    }
                  }}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-6 py-2 border border-brand-gold/20 text-brand-black rounded-full text-xs uppercase tracking-widest hover:bg-brand-gold/10 transition-all disabled:opacity-50"
                >
                  <RefreshCcw size={16} className={isSyncing ? 'animate-spin' : ''} />
                  סנכרן מוצרים
                </button>
              </div>
            )}
            {activeTab === 'orders' && (
              <button 
                onClick={() => setShowCreateOrder(true)}
                className="flex items-center gap-2 px-6 py-2 bg-brand-gold text-white rounded-full text-xs uppercase tracking-widest hover:bg-brand-black transition-all"
              >
                <Plus size={16} />
                יצירת הזמנה
              </button>
            )}
            {activeTab === 'missions' && (
              <button 
                onClick={() => setShowCreateMission(true)}
                className="flex items-center gap-2 px-6 py-2 bg-brand-gold text-white rounded-full text-xs uppercase tracking-widest hover:bg-brand-black transition-all"
              >
                <Plus size={16} />
                יצירת משימה
              </button>
            )}
            {activeTab === 'updates' && (
              <div className="flex gap-2">
                <button 
                  onClick={handleSyncHistory}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-6 py-2 border border-brand-gold/20 text-brand-black rounded-full text-xs uppercase tracking-widest hover:bg-brand-gold/10 transition-all disabled:opacity-50"
                >
                  <RefreshCcw size={16} className={isSyncing ? 'animate-spin' : ''} />
                  סנכרן היסטוריה
                </button>
                <button 
                  onClick={() => setShowCreateUpdate(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-brand-gold text-white rounded-full text-xs uppercase tracking-widest hover:bg-brand-black transition-all"
                >
                  <Plus size={16} />
                  יצירת עדכון
                </button>
              </div>
            )}
          </div>
        </div>

        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-brand-gold/10 p-8 shadow-sm"
        >
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/30" size={20} />
            <input 
              type="text" 
              placeholder={activeTab === 'users' || activeTab === 'premium' ? "חפש לפי שם או אימייל..." : "חפש לפי מספר הזמנה או מזהה משתמש..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-cream/30 border border-brand-gold/10 py-4 pl-12 pr-6 font-serif text-lg outline-none focus:border-brand-gold transition-all"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-brand-gold" size={40} />
              <p className="text-brand-black/40 text-sm uppercase tracking-widest">טוען נתונים...</p>
            </div>
          ) : activeTab === 'config' ? (
            <div className="max-w-2xl mx-auto py-10">
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-brand-cream/30 border border-brand-gold/20 rounded-2xl">
                  <div>
                    <h3 className="font-serif text-xl text-brand-black mb-1">מצב עריכה (Edit Mode)</h3>
                    <p className="text-xs text-brand-black/50">הפעלת מצב עריכה מאפשרת לשנות טקסטים ישירות על גבי המסכים השונים באתר.</p>
                  </div>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEditMode ? 'bg-brand-gold' : 'bg-brand-black/20'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEditMode ? '-translate-x-6' : '-translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-6 pb-8 border-b border-brand-gold/10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-brand-gold/20 bg-brand-cream flex items-center justify-center">
                      {globalConfig.globalAvatar ? (
                        <img src={globalConfig.globalAvatar} alt="Global Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Settings size={48} className="text-brand-gold/30" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                      <Upload className="text-white" size={24} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleGlobalAvatarUpload} />
                    </label>
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif text-xl text-brand-black">אוואטר גלובלי</h3>
                    <p className="text-xs text-brand-black/40 uppercase tracking-widest mt-1">התמונה שתופיע כברירת מחדל לכל המשתמשים</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand-black/40">שם האתר</label>
                    <input 
                      type="text" 
                      value={globalConfig.siteName}
                      onChange={(e) => setGlobalConfig(prev => ({ ...prev, siteName: e.target.value }))}
                      className="w-full bg-brand-cream/30 border border-brand-gold/10 py-3 px-4 font-serif outline-none focus:border-brand-gold transition-all"
                      placeholder="למשל: Byond Intima"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand-black/40">שם הקונסיירז' (ה-AI)</label>
                    <input 
                      type="text" 
                      value={globalConfig.conciergeName}
                      onChange={(e) => setGlobalConfig(prev => ({ ...prev, conciergeName: e.target.value }))}
                      className="w-full bg-brand-cream/30 border border-brand-gold/10 py-3 px-4 font-serif outline-none focus:border-brand-gold transition-all"
                      placeholder="למשל: אריאל"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-brand-black/40">קישור לסרטון ברכה (AI Chat)</label>
                    <input 
                      type="text" 
                      value={globalConfig.greetingVideoUrl}
                      onChange={(e) => setGlobalConfig(prev => ({ ...prev, greetingVideoUrl: e.target.value }))}
                      className="w-full bg-brand-cream/30 border border-brand-gold/10 py-3 px-4 font-serif outline-none focus:border-brand-gold transition-all"
                      placeholder="למשל: https://example.com/video.mp4"
                    />
                    <p className="text-xs text-brand-black/50">הסרטון יוצג כהודעה ראשונה בצ'אט האישי. ניתן לשים קישור ל-YouTube או קובץ וידאו ישיר.</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleUpdateGlobalConfig}
                    disabled={isActionLoading}
                    className="w-full bg-brand-black text-white py-4 rounded-full text-xs uppercase tracking-[0.2em] font-black hover:bg-brand-gold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isActionLoading ? <Loader2 className="animate-spin" size={16} /> : 'שמור הגדרות גלובליות'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'users' || activeTab === 'premium' ? (
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-brand-gold/10 text-[10px] uppercase tracking-[0.2em] text-brand-black/40">
                      <th className="pb-4 font-medium">משתמש</th>
                      {activeTab === 'premium' && <th className="pb-4 font-medium">טלפון</th>}
                      <th className="pb-4 font-medium">סטטוס</th>
                      {activeTab === 'premium' && <th className="pb-4 font-medium">תאריך מנוי</th>}
                      <th className="pb-4 font-medium">קרדיטים</th>
                      <th className="pb-4 font-medium">תפקיד</th>
                      <th className="pb-4 font-medium text-left">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/5">
                    {(activeTab === 'premium' ? filteredUsers.filter(u => u.isVip) : filteredUsers).map(user => (
                      <tr key={user.uid} className="group hover:bg-brand-cream/10 transition-colors">
                        <td className="py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-serif">
                              {user.displayName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-serif text-brand-black">{user.displayName || 'משתמש ללא שם'}</p>
                                {user.isVip && (
                                  <span className="bg-brand-gold/20 text-brand-gold text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter flex items-center gap-0.5">
                                    <Star size={8} className="fill-brand-gold" />
                                    VIP
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-brand-black/40">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        {activeTab === 'premium' && (
                          <td className="py-6 text-xs text-brand-black/60">{user.phone || 'לא הוזן'}</td>
                        )}
                        <td className="py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${user.status === 'disabled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {user.status === 'disabled' ? 'מושבת' : 'פעיל'}
                          </span>
                        </td>
                        {activeTab === 'premium' && (
                          <td className="py-6 text-xs text-brand-black/60">
                            {user.vipDate?.toDate ? user.vipDate.toDate?.()?.toLocaleDateString('he-IL') : (user.vipDate ? new Date(user.vipDate).toLocaleDateString('he-IL') : 'N/A')}
                          </td>
                        )}
                        <td className="py-6">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-brand-gold">{user.credits || 0}</span>
                            <button 
                              onClick={() => setSelectedUser(user)}
                              className="p-1 hover:text-brand-gold transition-colors"
                            >
                              <DollarSign size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="py-6">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 overflow-hidden">
                              {user.medals?.slice(0, 3).map((medal, i) => (
                                <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-brand-gold/10 flex items-center justify-center text-[10px]" title={medal}>
                                  🏅
                                </div>
                              ))}
                              {user.medals && user.medals.length > 3 && (
                                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-brand-black/5 flex items-center justify-center text-[8px] text-brand-black/40">
                                  +{user.medals.length - 3}
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => setSelectedUserForMedals(user)}
                              className="p-1 hover:text-brand-gold transition-colors"
                              title="נהל מדליות"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="py-6">
                          <span className="text-[10px] uppercase tracking-widest text-brand-black/60">{user.role || 'user'}</span>
                        </td>
                        <td className="py-6 text-left">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleToggleVip(user.uid, !!user.isVip)}
                              className={`p-2 rounded-full transition-all ${user.isVip ? 'bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20' : 'bg-brand-cream text-brand-black/40 hover:text-brand-gold'}`}
                              title={user.isVip ? 'הסר VIP' : 'הפוך ל-VIP'}
                            >
                              <Star size={18} className={user.isVip ? 'fill-brand-gold' : ''} />
                            </button>
                            <button 
                              onClick={() => handleUpdateUserStatus(user.uid, user.status === 'disabled' ? 'active' : 'disabled')}
                              className={`p-2 rounded-full transition-all ${user.status === 'disabled' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                              title={user.status === 'disabled' ? 'הפעל חשבון' : 'השבת חשבון'}
                            >
                              {user.status === 'disabled' ? <CheckCircle size={18} /> : <Ban size={18} />}
                            </button>
                            <button 
                              onClick={() => setUserToDelete(user)}
                              className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all"
                              title="מחק משתמש"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === 'missions' ? (
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-brand-gold/10 text-[10px] uppercase tracking-[0.2em] text-brand-black/40">
                      <th className="pb-4 font-medium">משימה</th>
                      <th className="pb-4 font-medium">תיאור</th>
                      <th className="pb-4 font-medium">נקודות</th>
                      <th className="pb-4 font-medium">תאריך סיום</th>
                      <th className="pb-4 font-medium text-left">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/5">
                    {missions.map(mission => (
                      <tr key={mission.id} className="group hover:bg-brand-cream/10 transition-colors">
                        <td className="py-6 font-serif text-brand-black">{mission.title}</td>
                        <td className="py-6 text-xs text-brand-black/60 max-w-xs truncate">{mission.description}</td>
                        <td className="py-6 font-serif text-brand-gold">{mission.points}</td>
                        <td className="py-6 text-xs text-brand-black/40">
                          {mission.endDate?.toDate ? mission.endDate.toDate?.()?.toLocaleDateString('he-IL') : 'N/A'}
                        </td>
                        <td className="py-6 text-left">
                          <button 
                            onClick={() => handleDeleteMission(mission.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === 'secret_missions' ? (
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-brand-gold/10 text-[10px] uppercase tracking-[0.2em] text-brand-black/40">
                      <th className="pb-4 font-medium">משימה</th>
                      <th className="pb-4 font-medium">משתמש</th>
                      <th className="pb-4 font-medium">סטטוס</th>
                      <th className="pb-4 font-medium">נקודות</th>
                      <th className="pb-4 font-medium text-left">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/5">
                    {secretMissions.map(mission => (
                      <tr key={mission.id} className="group hover:bg-brand-cream/10 transition-colors">
                        <td className="py-6">
                          <p className="font-serif text-brand-black">{mission.title}</p>
                          <p className="text-[10px] text-brand-black/40">{mission.description}</p>
                        </td>
                        <td className="py-6 text-xs text-brand-black/60">{mission.userId}</td>
                        <td className="py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${mission.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {mission.status === 'completed' ? 'הושלם' : 'הוקצה'}
                          </span>
                        </td>
                        <td className="py-6 font-serif text-brand-gold">{mission.points}</td>
                        <td className="py-6 text-left">
                          <button 
                            onClick={() => handleDeleteSecretMission(mission.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === 'feedback' ? (
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-brand-gold/10 text-[10px] uppercase tracking-[0.2em] text-brand-black/40">
                      <th className="pb-4 font-medium">עמוד / סעיף</th>
                      <th className="pb-4 font-medium">משתמש</th>
                      <th className="pb-4 font-medium">דירוג</th>
                      <th className="pb-4 font-medium">תאריך</th>
                      <th className="pb-4 font-medium text-left">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/5">
                    {feedback.map(item => (
                      <tr key={item.id} className="group hover:bg-brand-cream/10 transition-colors">
                        <td className="py-6">
                          <p className="font-serif text-brand-black">{item.sectionTitle || item.sectionId}</p>
                          <p className="text-[10px] text-brand-black/40">{item.pageId}</p>
                        </td>
                        <td className="py-6 text-xs text-brand-black/60">{item.userId}</td>
                        <td className="py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${item.rating === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {item.rating === 'up' ? 'מועיל' : 'לא מועיל'}
                          </span>
                        </td>
                        <td className="py-6 text-xs text-brand-black/40">
                          {item.timestamp?.toDate ? item.timestamp.toDate?.()?.toLocaleString('he-IL') : 'N/A'}
                        </td>
                        <td className="py-6 text-left">
                          <button 
                            onClick={async () => {
                              if (window.confirm('האם אתה בטוח שברצונך למחוק משוב זה?')) {
                                try {
                                  await deleteDoc(doc(db, 'content_feedback', item.id));
                                  setFeedback(feedback.filter(f => f.id !== item.id));
                                } catch (error) {
                                  handleFirestoreError(error, OperationType.DELETE, `content_feedback/${item.id}`);
                                }
                              }
                            }}
                            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === 'updates' ? (
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-brand-gold/10 text-[10px] uppercase tracking-[0.2em] text-brand-black/40">
                      <th className="pb-4 font-medium">עדכון</th>
                      <th className="pb-4 font-medium">סוג</th>
                      <th className="pb-4 font-medium">תאריך</th>
                      <th className="pb-4 font-medium text-left">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/5">
                    {updates.map(update => (
                      <tr key={update.id} className="group hover:bg-brand-cream/10 transition-colors">
                        <td className="py-6">
                          <p className="font-serif text-brand-black">{update.title}</p>
                          <p className="text-[10px] text-brand-black/40 max-w-md truncate">{update.description}</p>
                        </td>
                        <td className="py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                            update.type === 'feature' ? 'bg-blue-100 text-blue-600' :
                            update.type === 'improvement' ? 'bg-green-100 text-green-600' :
                            update.type === 'fix' ? 'bg-red-100 text-red-600' :
                            'bg-brand-gold/20 text-brand-gold'
                          }`}>
                            {update.type === 'feature' ? 'פיצ\'ר חדש' :
                             update.type === 'improvement' ? 'שיפור' :
                             update.type === 'fix' ? 'תיקון' : 'תוכנית לעתיד'}
                          </span>
                        </td>
                        <td className="py-6 text-xs text-brand-black/40">
                          {new Date(update.date).toLocaleDateString('he-IL')}
                        </td>
                        <td className="py-6 text-left">
                          <button 
                            onClick={() => handleDeleteUpdate(update.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === 'site_content' ? (
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-brand-gold/10 text-[10px] uppercase tracking-[0.2em] text-brand-black/40">
                      <th className="pb-4 font-medium">מזהה תוכן</th>
                      <th className="pb-4 font-medium">סוג</th>
                      <th className="pb-4 font-medium">תצוגה מקדימה</th>
                      <th className="pb-4 font-medium text-left">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/5">
                    {siteContent.map(content => (
                      <tr key={content.id} className="group hover:bg-brand-cream/10 transition-colors">
                        <td className="py-6 font-mono text-xs text-brand-black/60">{content.id}</td>
                        <td className="py-6">
                          <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-[9px] uppercase tracking-widest font-bold">
                            {content.type || (content.id.includes('image') ? 'image' : 'text')}
                          </span>
                        </td>
                        <td className="py-6 text-xs text-brand-black/60 max-w-xs truncate">
                          {content.type === 'image' || content.id.includes('image') ? (
                            <div className="w-12 h-12 rounded border border-brand-gold/10 overflow-hidden">
                              <img src={content.text} alt={content.id} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ) : (
                            content.text
                          )}
                        </td>
                        <td className="py-6 text-left">
                          <button 
                            onClick={async () => {
                              if (window.confirm('האם למחוק תוכן זה?')) {
                                try {
                                  await deleteDoc(doc(db, 'site_content', content.id));
                                  setSiteContent(siteContent.filter(c => c.id !== content.id));
                                } catch (error) {
                                  handleFirestoreError(error, OperationType.DELETE, `site_content/${content.id}`);
                                }
                              }
                            }}
                            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === 'products' ? (
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-brand-gold/10 text-[10px] uppercase tracking-[0.2em] text-brand-black/40">
                      <th className="pb-4 font-medium">תמונה</th>
                      <th className="pb-4 font-medium">שם המוצר</th>
                      <th className="pb-4 font-medium">קטגוריה</th>
                      <th className="pb-4 font-medium text-center">מחיר</th>
                      <th className="pb-4 font-medium text-left">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/5">
                    {products.filter(p => 
                      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((product) => (
                      <tr key={product.id} className="group hover:bg-brand-cream/10 transition-colors">
                        <td className="py-6">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-brand-cream border border-brand-gold/10">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        </td>
                        <td className="py-6">
                          <p className="font-serif text-brand-black">{product.name}</p>
                          <p className="text-[10px] text-brand-black/40 uppercase tracking-widest">{product.id}</p>
                        </td>
                        <td className="py-6">
                          <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-[9px] uppercase tracking-widest font-bold">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-6 text-center font-serif text-brand-gold">₪{product.price}</td>
                        <td className="py-6 text-left">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                if (window.confirm('האם למחוק מוצר זה?')) {
                                  deleteDoc(doc(db, 'products', product.id))
                                    .then(() => {
                                      setProducts(products.filter(p => p.id !== product.id));
                                      showAlert('מוצר נמחק בהצלחה');
                                    })
                                    .catch(err => handleFirestoreError(err, OperationType.DELETE, `products/${product.id}`));
                                }
                              }}
                              className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all"
                              title="מחק מוצר"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-brand-gold/10 text-[10px] uppercase tracking-[0.2em] text-brand-black/40">
                      <th 
                        className="pb-4 font-medium cursor-pointer hover:text-brand-gold transition-colors"
                        onClick={() => handleSort('orderId')}
                      >
                        מספר הזמנה {sortConfig?.key === 'orderId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="pb-4 font-medium">משתמש</th>
                      <th 
                        className="pb-4 font-medium cursor-pointer hover:text-brand-gold transition-colors"
                        onClick={() => handleSort('totalAmount')}
                      >
                        סכום {sortConfig?.key === 'totalAmount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="pb-4 font-medium cursor-pointer hover:text-brand-gold transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        סטטוס {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="pb-4 font-medium text-right">תאריך יצירה</th>
                      <th className="pb-4 font-medium text-left">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/5">
                    {filteredOrders.map(order => (
                      <React.Fragment key={order.orderId}>
                        <tr 
                          className="group hover:bg-brand-cream/10 transition-colors cursor-pointer"
                          onClick={() => setExpandedOrderId(expandedOrderId === order.orderId ? null : order.orderId)}
                        >
                          <td className="py-6 font-mono text-xs text-brand-black/60">
                            <div className="flex items-center gap-2">
                              <ChevronRight size={14} className={`transition-transform ${expandedOrderId === order.orderId ? 'rotate-90' : ''}`} />
                              #{order.orderId}
                            </div>
                          </td>
                          <td className="py-6 text-xs text-brand-black/60">{order.userId}</td>
                          <td className="py-6 font-serif text-brand-gold">₪{order.totalAmount}</td>
                          <td className="py-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                              order.status === 'completed' ? 'bg-green-100 text-green-600' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              order.status === 'refunded' ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {order.status === 'completed' ? 'הושלם' :
                               order.status === 'cancelled' ? 'בוטל' :
                               order.status === 'refunded' ? 'זוכה' : 'ממתין'}
                            </span>
                          </td>
                          <td className="py-6 text-xs text-brand-black/40 text-right">
                            {order.createdAt?.toDate ? order.createdAt.toDate?.()?.toLocaleDateString('he-IL', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </td>
                          <td className="py-6 text-left">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => handleUpdateOrderStatus(order.orderId, 'completed')}
                                className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-all"
                                title="סמן כהושלם"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => handleUpdateOrderStatus(order.orderId, 'refunded')}
                                className="p-2 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-all"
                                title="בצע זיכוי"
                              >
                                <RefreshCcw size={18} />
                              </button>
                              <button 
                                onClick={() => handleUpdateOrderStatus(order.orderId, 'cancelled')}
                                className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all"
                                title="בטל הזמנה"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedOrderId === order.orderId && (
                          <tr className="bg-brand-cream/5 border-b border-brand-gold/10">
                            <td colSpan={6} className="p-6">
                              <div className="grid md:grid-cols-2 gap-8 text-right">
                                <div>
                                  <h5 className="text-xs font-bold uppercase tracking-widest text-brand-black/60 mb-4">פרטי לקוח</h5>
                                  {(() => {
                                    const customer = users.find(u => u.uid === order.userId);
                                    return customer ? (
                                      <div className="space-y-2 text-sm text-brand-black/80">
                                        <p><span className="font-medium">שם:</span> {customer.displayName || 'לא צוין'}</p>
                                        <p><span className="font-medium">אימייל:</span> {customer.email}</p>
                                        <p><span className="font-medium">טלפון:</span> {customer.phone || 'לא צוין'}</p>
                                        <p><span className="font-medium">כתובת:</span> {customer.address || 'לא צוין'}</p>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-brand-black/40 italic">פרטי לקוח לא נמצאו</p>
                                    );
                                  })()}
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold uppercase tracking-widest text-brand-black/60 mb-4">פריטים בהזמנה</h5>
                                  {order.items && order.items.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1 text-sm text-brand-black/80">
                                      {order.items.map((item, idx) => (
                                        <li key={idx}>
                                          {typeof item === 'string' ? item : (item.name || JSON.stringify(item))}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-brand-black/40 italic">אין פירוט פריטים</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}

              {((activeTab === 'users' && filteredUsers.length === 0) || (activeTab === 'premium' && filteredUsers.filter(u => u.isVip).length === 0) || (activeTab === 'orders' && filteredOrders.length === 0)) && (
                <div className="text-center py-20">
                  <AlertCircle className="mx-auto text-brand-gold/20 mb-4" size={48} />
                  <p className="text-brand-black/40 text-sm uppercase tracking-widest">לא נמצאו תוצאות</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Secret Mission Creation Modal */}
      <AnimatePresence>
        {showCreateSecretMission && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateSecretMission(false)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white p-8 shadow-2xl text-right"
            >
              <h3 className="text-2xl font-serif mb-6">יצירת משימה סודית חדשה</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">מזהה משתמש (UID)</label>
                  <input 
                    type="text" 
                    value={newSecretMission.userId}
                    onChange={(e) => setNewSecretMission({ ...newSecretMission, userId: e.target.value })}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                    placeholder="הזן UID של המשתמש"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">כותרת המשימה</label>
                  <input 
                    type="text" 
                    value={newSecretMission.title}
                    onChange={(e) => setNewSecretMission({ ...newSecretMission, title: e.target.value })}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">תיאור המשימה</label>
                  <textarea 
                    value={newSecretMission.description}
                    onChange={(e) => setNewSecretMission({ ...newSecretMission, description: e.target.value })}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">נקודות</label>
                  <input 
                    type="number" 
                    value={newSecretMission.points}
                    onChange={(e) => setNewSecretMission({ ...newSecretMission, points: parseInt(e.target.value) })}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => setShowCreateSecretMission(false)}
                    className="flex-1 py-4 border border-brand-gold/20 text-[10px] uppercase tracking-widest hover:bg-brand-cream transition-all"
                  >
                    ביטול
                  </button>
                  <button 
                    onClick={handleCreateSecretMission}
                    disabled={isActionLoading}
                    className="flex-1 py-4 bg-brand-black text-white text-[10px] uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center justify-center gap-2"
                  >
                    {isActionLoading && <Loader2 className="animate-spin" size={14} />}
                    צור משימה סודית
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mission Creation Modal */}
      <AnimatePresence>
        {showCreateMission && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateMission(false)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white p-8 shadow-2xl text-right"
            >
              <h3 className="text-2xl font-serif mb-6">יצירת משימה שבועית חדשה</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">כותרת המשימה</label>
                  <input 
                    type="text" 
                    value={newMission.title}
                    onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">תיאור המשימה</label>
                  <textarea 
                    value={newMission.description}
                    onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">נקודות</label>
                    <input 
                      type="number" 
                      value={newMission.points}
                      onChange={(e) => setNewMission({ ...newMission, points: parseInt(e.target.value) })}
                      className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">תאריך סיום</label>
                    <input 
                      type="date" 
                      value={newMission.endDate}
                      onChange={(e) => setNewMission({ ...newMission, endDate: e.target.value })}
                      className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => setShowCreateMission(false)}
                    className="flex-1 py-4 border border-brand-gold/20 text-[10px] uppercase tracking-widest hover:bg-brand-cream transition-all"
                  >
                    ביטול
                  </button>
                  <button 
                    onClick={handleCreateMission}
                    disabled={isActionLoading}
                    className="flex-1 py-4 bg-brand-black text-white text-[10px] uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center justify-center gap-2"
                  >
                    {isActionLoading && <Loader2 className="animate-spin" size={14} />}
                    צור משימה
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Credit Update Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-serif mb-2">עדכון קרדיטים</h3>
              <p className="text-xs text-brand-black/40 uppercase tracking-widest mb-8">עדכון יתרה עבור {selectedUser.displayName || selectedUser.email}</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">יתרה נוכחית</label>
                  <p className="text-2xl font-serif text-brand-gold">{selectedUser.credits || 0}</p>
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">יתרה חדשה</label>
                  <input 
                    type="number" 
                    defaultValue={selectedUser.credits || 0}
                    id="new-credits"
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-4 font-serif text-xl outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 py-4 border border-brand-gold/20 text-[10px] uppercase tracking-widest hover:bg-brand-cream transition-all"
                  >
                    ביטול
                  </button>
                  <button 
                    onClick={() => {
                      const input = document.getElementById('new-credits') as HTMLInputElement;
                      handleUpdateUserCredits(selectedUser.uid, parseInt(input.value));
                    }}
                    className="flex-1 py-4 bg-brand-black text-white text-[10px] uppercase tracking-widest hover:bg-brand-gold transition-all"
                  >
                    עדכן יתרה
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Medals Management Modal */}
      <AnimatePresence>
        {selectedUserForMedals && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUserForMedals(null)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-serif mb-2 text-right">ניהול מדליות</h3>
              <p className="text-xs text-brand-black/40 uppercase tracking-widest mb-8 text-right">הענק או הסר מדליות עבור {selectedUserForMedals.displayName || selectedUserForMedals.email}</p>
              
              <div className="space-y-6 text-right">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-4">מדליות קיימות</label>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {selectedUserForMedals.medals?.length ? selectedUserForMedals.medals.map((medal, i) => (
                      <div key={i} className="flex items-center gap-2 bg-brand-gold/10 text-brand-gold px-3 py-1.5 rounded-full text-xs font-bold">
                        <span>{medal}</span>
                        <button 
                          onClick={() => {
                            const newMedals = selectedUserForMedals.medals?.filter((_, index) => index !== i) || [];
                            handleUpdateUserMedals(selectedUserForMedals.uid, newMedals);
                          }}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )) : (
                      <p className="text-xs text-brand-black/20 italic">אין מדליות עדיין</p>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-brand-gold/10">
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">הענק מדליה חדשה</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const input = document.getElementById('new-medal') as HTMLInputElement;
                        if (!input.value.trim()) return;
                        const newMedals = [...(selectedUserForMedals.medals || []), input.value.trim()];
                        handleUpdateUserMedals(selectedUserForMedals.uid, newMedals);
                        input.value = '';
                      }}
                      className="bg-brand-black text-white px-4 py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-brand-gold transition-all"
                    >
                      הוסף
                    </button>
                    <input 
                      type="text" 
                      id="new-medal"
                      placeholder="שם המדליה (לדוגמה: 🏅 אלוף הבישול)"
                      className="flex-1 bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget;
                          if (!input.value.trim()) return;
                          const newMedals = [...(selectedUserForMedals.medals || []), input.value.trim()];
                          handleUpdateUserMedals(selectedUserForMedals.uid, newMedals);
                          input.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 justify-end">
                    {['🏅 אלוף', '⭐ VIP', '🔥 פעיל', '💎 יוקרתי'].map(preset => (
                      <button
                        key={preset}
                        onClick={() => {
                          const newMedals = [...(selectedUserForMedals.medals || []), preset];
                          handleUpdateUserMedals(selectedUserForMedals.uid, newMedals);
                        }}
                        className="text-[10px] bg-brand-cream px-2 py-1 rounded border border-brand-gold/10 hover:bg-brand-gold/10 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setSelectedUserForMedals(null)}
                    className="w-full py-4 border border-brand-gold/20 text-[10px] uppercase tracking-widest hover:bg-brand-cream transition-all"
                  >
                    סגור
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white p-8 shadow-2xl text-right"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-serif mb-2">מחיקת משתמש</h3>
              <p className="text-sm text-brand-black/60 mb-8">
                האם אתה בטוח שברצונך למחוק את <strong>{userToDelete.displayName || userToDelete.email}</strong>? 
                פעולה זו אינה ניתנת לביטול וכל הנתונים הקשורים למשתמש יימחקו לצמיתות.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-4 border border-brand-gold/20 text-[10px] uppercase tracking-widest hover:bg-brand-cream transition-all"
                >
                  ביטול
                </button>
                <button 
                  onClick={() => handleDeleteUser(userToDelete.uid)}
                  className="flex-1 py-4 bg-red-600 text-white text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all"
                >
                  מחק לצמיתות
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Update Modal */}
      <AnimatePresence>
        {showCreateUpdate && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateUpdate(false)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white p-8 shadow-2xl text-right"
            >
              <h3 className="text-2xl font-serif mb-6">יצירת עדכון חדש</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">כותרת העדכון</label>
                  <input 
                    type="text" 
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">תיאור העדכון</label>
                  <textarea 
                    value={newUpdate.description}
                    onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">סוג עדכון</label>
                    <select 
                      value={newUpdate.type}
                      onChange={(e) => setNewUpdate({ ...newUpdate, type: e.target.value as any })}
                      className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                    >
                      <option value="feature">פיצ'ר חדש</option>
                      <option value="improvement">שיפור</option>
                      <option value="fix">תיקון באג</option>
                      <option value="roadmap">תוכנית לעתיד</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">תאריך</label>
                    <input 
                      type="date" 
                      value={newUpdate.date}
                      onChange={(e) => setNewUpdate({ ...newUpdate, date: e.target.value })}
                      className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => setShowCreateUpdate(false)}
                    className="flex-1 py-4 border border-brand-gold/20 text-[10px] uppercase tracking-widest hover:bg-brand-cream transition-all"
                  >
                    ביטול
                  </button>
                  <button 
                    onClick={handleCreateUpdate}
                    disabled={isActionLoading}
                    className="flex-1 py-4 bg-brand-black text-white text-[10px] uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center justify-center gap-2"
                  >
                    {isActionLoading && <Loader2 className="animate-spin" size={14} />}
                    צור עדכון
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreateOrder && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateOrder(false)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-serif mb-2 text-right">יצירת הזמנה ידנית</h3>
              <p className="text-xs text-brand-black/40 uppercase tracking-widest mb-8 text-right">הזן פרטי הזמנה חדשה עבור משתמש</p>
              
              <div className="space-y-4 text-right">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">מזהה משתמש (UID)</label>
                  <input 
                    type="text" 
                    value={newOrder.userId}
                    onChange={(e) => setNewOrder({...newOrder, userId: e.target.value})}
                    placeholder="הזן UID של המשתמש"
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">סכום כולל (₪)</label>
                  <input 
                    type="number" 
                    value={newOrder.totalAmount}
                    onChange={(e) => setNewOrder({...newOrder, totalAmount: parseFloat(e.target.value)})}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">סטטוס</label>
                  <select 
                    value={newOrder.status}
                    onChange={(e) => setNewOrder({...newOrder, status: e.target.value as Order['status']})}
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right"
                  >
                    <option value="pending">ממתין</option>
                    <option value="completed">הושלם</option>
                    <option value="cancelled">בוטל</option>
                    <option value="refunded">זוכה</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">פריטים (מופרדים בפסיק)</label>
                  <textarea 
                    value={newOrder.items}
                    onChange={(e) => setNewOrder({...newOrder, items: e.target.value})}
                    placeholder="לדוגמה: מארז פלטינום, נרות, שוקולד"
                    className="w-full bg-brand-cream/30 border border-brand-gold/10 p-3 font-serif outline-none focus:border-brand-gold text-right h-24"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowCreateOrder(false)}
                    className="flex-1 py-4 border border-brand-gold/20 text-[10px] uppercase tracking-widest hover:bg-brand-cream transition-all"
                  >
                    ביטול
                  </button>
                  <button 
                    onClick={handleCreateOrder}
                    className="flex-1 py-4 bg-brand-black text-white text-[10px] uppercase tracking-widest hover:bg-brand-gold transition-all"
                  >
                    צור הזמנה
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Action Loader */}
      <AnimatePresence>
        {isActionLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-white/50 backdrop-blur-[2px] flex items-center justify-center"
          >
            <Loader2 className="animate-spin text-brand-gold" size={48} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && deleteConfirmType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-2xl font-serif mb-4 text-brand-black">מחיקת משימה</h3>
              <p className="text-brand-black/60 mb-8">האם אתם בטוחים שברצונכם למחוק משימה זו? פעולה זו אינה הפיכה.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setDeleteConfirmId(null);
                    setDeleteConfirmType(null);
                  }}
                  className="flex-1 py-3 bg-brand-cream text-brand-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-gold/10 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={deleteConfirmType === 'mission' ? confirmDeleteMission : confirmDeleteSecretMission}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
                >
                  מחיקה
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
