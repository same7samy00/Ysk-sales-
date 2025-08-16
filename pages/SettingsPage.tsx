import React, { useState, useMemo } from 'react';
import { useAppContext } from '../App';
import { User, Page, Settings } from '../types';
import { PlusCircleIcon, EditIcon, TrashIcon, XIcon, FolderIcon, SettingsIcon, FileTextIcon, ShieldCheckIcon, CameraIcon, BriefcaseIcon, BarcodeIcon } from '../components/icons';
import { checkScannerConnection, initializeScanner } from '../utils/firebase-scanner';

// Reusable Modal Component
const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
            <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
);

// Company Info Modal
const CompanyInfoModal = ({ settings, onSave, onClose }: { settings: Settings, onSave: (settings: Settings) => Promise<void>, onClose: () => void }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSettings({ ...localSettings, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    return (
        <Modal title="تعديل معلومات الشركة" onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="systemName" className="block text-sm font-medium text-gray-700">اسم النظام</label>
                    <input type="text" id="systemName" name="systemName" value={localSettings.systemName || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">اسم الشركة</label>
                    <input type="text" id="companyName" name="companyName" value={localSettings.companyName} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">عنوان الشركة</label>
                    <input type="text" id="companyAddress" name="companyAddress" value={localSettings.companyAddress} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700">رقم هاتف الشركة</label>
                    <input type="text" id="companyPhone" name="companyPhone" value={localSettings.companyPhone} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    حفظ التغييرات
                </button>
            </div>
        </Modal>
    );
};

// Invoice Settings Modal
const InvoiceSettingsModal = ({ settings, onSave, onClose }: { settings: Settings, onSave: (settings: Settings) => Promise<void>, onClose: () => void }) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLocalSettings({ ...localSettings, [e.target.name]: e.target.value });
    };
    
    const handleBarcodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalSettings(prev => ({ ...prev, customInvoiceBarcode: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    return (
        <Modal title="تخصيص الفاتورة" onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="paperSize" className="block text-sm font-medium text-gray-700">حجم ورق الطباعة</label>
                    <select id="paperSize" name="paperSize" value={localSettings.paperSize || '58mm'} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                        <option value="58mm">58mm</option>
                        <option value="80mm">80mm</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="thankYouMessage" className="block text-sm font-medium text-gray-700">رسالة شكر في الفاتورة</label>
                    <input type="text" id="thankYouMessage" name="thankYouMessage" value={localSettings.thankYouMessage || ''} onChange={handleChange} placeholder="شكراً لتعاملكم معنا!" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="barcodeText" className="block text-sm font-medium text-gray-700">النص فوق الباركود</label>
                    <input type="text" id="barcodeText" name="barcodeText" value={localSettings.barcodeText || ''} onChange={handleChange} placeholder="امسح الكود للمتابعة" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="customInvoiceBarcode" className="block text-sm font-medium text-gray-700">صورة باركود مخصصة للفاتورة</label>
                    <div className="mt-1 flex items-center">
                        <input type="file" accept="image/*" id="customInvoiceBarcode" onChange={handleBarcodeUpload} className="hidden"/>
                        <label htmlFor="customInvoiceBarcode" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                            <CameraIcon className="h-5 w-5 me-2"/>
                            اختر صورة
                        </label>
                        {localSettings.customInvoiceBarcode && <img src={localSettings.customInvoiceBarcode} alt="preview" className="ms-4 h-16 w-auto border p-1 rounded"/>}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    حفظ التغييرات
                </button>
            </div>
        </Modal>
    );
};

// User Management Modal
// Firebase Settings Modal
const FirebaseSettingsModal = ({ settings, onSave, onClose }: { settings: Settings, onSave: (settings: Settings) => Promise<void>, onClose: () => void }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

    const scannerUrl = useMemo(() => {
        if (localSettings.scannerApiKey && localSettings.scannerProjectId) {
            const params = new URLSearchParams({
                apiKey: localSettings.scannerApiKey,
                authDomain: localSettings.scannerAuthDomain || '',
                projectId: localSettings.scannerProjectId,
            });
            return `${window.location.origin}/scanner.html?${params.toString()}`;
        }
        return null;
    }, [localSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSettings({ ...localSettings, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    const handleTestConnection = async () => {
        setTestStatus('testing');
        const isConnected = await checkScannerConnection(localSettings);
        setTestStatus(isConnected ? 'success' : 'failed');
    };

    return (
        <Modal title="إعدادات ماسح الباركود" onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="scannerApiKey" className="block text-sm font-medium text-gray-700">API Key</label>
                    <input type="text" id="scannerApiKey" name="scannerApiKey" value={localSettings.scannerApiKey || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="scannerAuthDomain" className="block text-sm font-medium text-gray-700">Auth Domain</label>
                    <input type="text" id="scannerAuthDomain" name="scannerAuthDomain" value={localSettings.scannerAuthDomain || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="scannerProjectId" className="block text-sm font-medium text-gray-700">Project ID</label>
                    <input type="text" id="scannerProjectId" name="scannerProjectId" value={localSettings.scannerProjectId || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </div>
            </div>

            {scannerUrl && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                    <h4 className="text-lg font-semibold mb-2">رابط الماسح الضوئي</h4>
                    <p className="text-sm text-gray-600">افتح الرابط التالي على هاتفك لبدء المسح:</p>
                    <a href={scannerUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-600 hover:underline text-sm break-all">
                        {scannerUrl}
                    </a>
                </div>
            )}

            <div className="mt-6 flex justify-between items-center">
                <div>
                    <button onClick={handleTestConnection} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
                        {testStatus === 'testing' ? 'جارٍ الاختبار...' : 'اختبار الاتصال'}
                    </button>
                    {testStatus === 'success' && <span className="ms-4 text-green-600">الاتصال ناجح!</span>}
                    {testStatus === 'failed' && <span className="ms-4 text-red-600">فشل الاتصال.</span>}
                </div>
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    حفظ التغييرات
                </button>
            </div>
        </Modal>
    );
};

const UserModal = ({ user, onClose, onSave }: { user: User | null, onSave: (user: User) => Promise<void>, onClose: () => void }) => {
    const [editedUser, setEditedUser] = useState<User>(
        user || {
            id: '', name: '', password: '', status: 'نشط',
            permissions: { [Page.Dashboard]: true, [Page.Products]: true, [Page.Pos]: true, [Page.Customers]: true, [Page.Invoices]: true, [Page.Settings]: false }
        }
    );
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const isNew = !user;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };

    const handlePermissionChange = (page: Page, checked: boolean) => {
        setEditedUser(prev => ({ ...prev, permissions: { ...prev.permissions, [page]: checked } }));
    };

    const handleSave = async () => {
        if (!editedUser.name.trim()) { setPasswordError('اسم المستخدم مطلوب.'); return; }
        if (isNew && !newPassword.trim()) { setPasswordError('كلمة المرور مطلوبة.'); return; }
        if (newPassword && newPassword !== confirmPassword) { setPasswordError('كلمات المرور غير متطابقة.'); return; }
        if (newPassword && newPassword.length < 4) { setPasswordError('كلمة المرور قصيرة جداً.'); return; }
        
        setPasswordError('');
        let finalUser = { ...editedUser };
        if (newPassword) finalUser.password = newPassword;
        if (finalUser.id === 'u1') finalUser.permissions[Page.Settings] = true;

        await onSave({ ...finalUser, id: isNew ? `u${Date.now()}` : editedUser.id });
        onClose();
    };

    const pageTranslations: { [key: string]: string } = {
        'Dashboard': 'لوحة التحكم', 'Products': 'المنتجات', 'Pos': 'نقطة البيع',
        'Customers': 'العملاء', 'Invoices': 'الفواتير', 'Settings': 'الإعدادات',
    };

    return (
        <Modal title={isNew ? 'إضافة مستخدم جديد' : 'تعديل المستخدم'} onClose={onClose}>
            <div className="space-y-4">
                <input type="text" name="name" value={editedUser.name} onChange={handleChange} placeholder="اسم المستخدم" className="p-2 border rounded w-full" />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="كلمة المرور الجديدة" className="p-2 border rounded w-full" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="تأكيد كلمة المرور" className="p-2 border rounded w-full" />
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                <select name="status" value={editedUser.status} onChange={handleChange} className="p-2 border rounded w-full">
                    <option value="نشط">نشط</option>
                    <option value="غير نشط">غير نشط</option>
                </select>
                <h3 className="text-lg font-bold pt-4">صلاحيات الوصول</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.values(Page).filter(v => typeof v === 'number').map(pEnum => (
                        <label key={pEnum} className="flex items-center p-3 rounded-lg bg-gray-100 hover:bg-blue-100 border">
                            <input type="checkbox" checked={editedUser.permissions?.[pEnum as Page] || false} onChange={(e) => handlePermissionChange(pEnum as Page, e.target.checked)} disabled={editedUser.id === 'u1' && pEnum === Page.Settings} className="h-5 w-5 text-blue-600 rounded" />
                            <span className="ms-3 text-sm font-medium">{pageTranslations[Page[pEnum as Page]]}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">حفظ</button>
            </div>
        </Modal>
    );
};

// Main Settings Page Component
const SettingsPage = () => {
    const { settings, saveSettings, users, saveUsers, currentUser, setCurrentUser, addNotification, storageMode, directoryName, requestDirectoryPermission, resetAllData } = useAppContext();
    const [activeModal, setActiveModal] = useState<'company' | 'invoice' | 'user' | 'firebase' | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleSaveSettings = async (newSettings: Settings) => {
        await saveSettings(newSettings);
        addNotification('تم حفظ الإعدادات بنجاح');
    };

    const handleSaveUser = async (user: User) => {
        const isNew = !users.some(u => u.id === user.id);
        const updatedUsers = isNew ? [...users, user] : users.map(u => u.id === user.id ? user : u);
        await saveUsers(updatedUsers);
        addNotification(isNew ? 'تمت إضافة المستخدم' : 'تم تحديث المستخدم');
        if (currentUser && currentUser.id === user.id) setCurrentUser(user);
    };

    const handleDeleteUser = async (userId: string) => {
        if (users.length <= 1 || currentUser?.id === userId) {
            addNotification('لا يمكن حذف المستخدم الوحيد أو حسابك الحالي.', 'error');
            return;
        }
        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            await saveUsers(users.filter(u => u.id !== userId));
            addNotification('تم حذف المستخدم', 'error');
        }
    };

    const openUserModal = (user: User | null) => {
        setEditingUser(user);
        setActiveModal('user');
    };

    const renderModal = () => {
    switch (activeModal) {
    case 'company':
    return <CompanyInfoModal settings={settings} onSave={handleSaveSettings} onClose={() => setActiveModal(null)} />;
    case 'invoice':
    return <InvoiceSettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setActiveModal(null)} />;
    case 'firebase':
    return <FirebaseSettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setActiveModal(null)} />;
    case 'user':
    return <UserModal user={editingUser} onSave={handleSaveUser} onClose={() => setActiveModal(null)} />;
    default:
    return null;
    }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">الإعدادات</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Company Info Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold flex items-center"><BriefcaseIcon className="h-6 w-6 me-2 text-blue-600"/>معلومات النشاط التجاري</h3>
                            <p className="text-sm text-gray-500 mt-1">إدار تفاصيل النشاط التجاري والعلامة التجارية.</p>
                        </div>
                        <button onClick={() => setActiveModal('company')} className="text-blue-600 hover:text-blue-800"><EditIcon className="h-5 w-5"/></button>
                    </div>
                </div>

                {/* Invoice Settings Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold flex items-center"><FileTextIcon className="h-6 w-6 me-2 text-green-600"/>تخصيص الفاتورة</h3>
                            <p className="text-sm text-gray-500 mt-1">تعديل شكل الفاتورة وحجم الورق.</p>
                        </div>
                        <button onClick={() => setActiveModal('invoice')} className="text-blue-600 hover:text-blue-800"><EditIcon className="h-5 w-5"/></button>
                    </div>
                </div>

                {/* Data Management Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold flex items-center"><FolderIcon className="h-6 w-6 me-2 text-yellow-600"/>إدارة البيانات</h3>
                    <div className="mt-4 space-y-2">
                        <button onClick={requestDirectoryPermission} className="w-full text-sm bg-gray-100 p-2 rounded-md text-start hover:bg-gray-200">تغيير مجلد الحفظ</button>
                        <button onClick={resetAllData} className="w-full text-sm bg-red-100 text-red-700 p-2 rounded-md text-start hover:bg-red-200">إعادة تعيين كل البيانات</button>
                    </div>
                </div>

                {/* Firebase Scanner Settings Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold flex items-center"><BarcodeIcon className="h-6 w-6 me-2 text-red-600"/>إعدادات ماسح الباركود</h3>
                            <p className="text-sm text-gray-500 mt-1">إدارة إعدادات الاتصال بـ Firebase.</p>
                        </div>
                        <button onClick={() => setActiveModal('firebase')} className="text-blue-600 hover:text-blue-800"><EditIcon className="h-5 w-5"/></button>
                    </div>
                </div>

                {/* User Management Card */}
                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 lg:col-span-3">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold flex items-center"><ShieldCheckIcon className="h-6 w-6 me-2 text-purple-600"/>إدارة المستخدمين</h3>
                        <button onClick={() => openUserModal(null)} className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">
                            <PlusCircleIcon className="h-5 w-5 me-1" /> إضافة مستخدم جديد
                        </button>
                    </div>
                    <div className="space-y-3">
                        {users.map(user => (
                            <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <p className="font-semibold">{user.name}</p>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'نشط' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                                    <button onClick={() => openUserModal(user)} className="text-blue-600"><EditIcon className="h-5 w-5"/></button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {renderModal()}
        </div>
    );
};

export default SettingsPage;