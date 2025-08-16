import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../App';
import { Product, Unit } from '../types';
import { PlusCircleIcon, SearchIcon, EditIcon, TrashIcon, BarcodeIcon, XIcon } from '../components/icons';
import { requestScan, listenForScanResult } from '../utils/firebase-scanner';

declare var JsBarcode: any;

const ProductModal = ({ product, onClose, onSave }: { product: Product | null, onClose: () => void, onSave: (product: Product, isNew: boolean) => Promise<void> }) => {
    const { units, saveUnits } = useAppContext();
    const [editedProduct, setEditedProduct] = useState<Omit<Product, 'price' | 'purchasePrice' | 'quantity'>>(
        product || {
            id: '', name: '', unit: units[0] || {id: 0, name: ''}, 
            supplier: '', productionDate: '', expiryDate: '', barcode: ''
        }
    );
    const [price, setPrice] = useState(product?.price.toString() || '');
    const [purchasePrice, setPurchasePrice] = useState(product?.purchasePrice.toString() || '');
    const [quantity, setQuantity] = useState(product?.quantity.toString() || '');

    const [customUnit, setCustomUnit] = useState('');
    const isNew = !product;

    useEffect(() => {
        const handleScan = (barcode: string) => {
            setEditedProduct(prev => ({ ...prev, barcode: barcode }));
        };

        const unsubscribe = listenForScanResult(handleScan);
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'unitId') {
            const selectedUnit = units.find(u => u.id === parseInt(value));
            if (selectedUnit) {
                setEditedProduct({ ...editedProduct, unit: selectedUnit });
            }
        } else {
            setEditedProduct({ ...editedProduct, [name]: value });
        }
    };
    
    const handleSaveCustomUnit = async () => {
        if(customUnit.trim()){
            const newUnit: Unit = { id: Date.now(), name: customUnit.trim() };
            const updatedUnits = [newUnit, ...units];
            await saveUnits(updatedUnits);
            setEditedProduct({ ...editedProduct, unit: newUnit});
            setCustomUnit('');
        }
    };

    const handleSave = async () => {
        let finalProduct: Product = {
            ...editedProduct,
            price: parseFloat(price) || 0,
            purchasePrice: parseFloat(purchasePrice) || 0,
            quantity: parseInt(quantity) || 0,
            id: editedProduct.id || `p${Date.now()}`,
            barcode: editedProduct.barcode || `${Date.now()}`
        };
        
        await onSave(finalProduct, isNew);
        onClose();
    };
    
    const handleGenerateBarcode = () => {
        const randomBarcode = `${Date.now()}`;
        setEditedProduct({ ...editedProduct, barcode: randomBarcode });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl transform transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{isNew ? 'إضافة منتج جديد' : 'تعديل المنتج'}</h2>
                    <button onClick={onClose}><XIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">اسم ��لمنتج</label>
                        <input type="text" id="name" name="name" value={editedProduct.name} onChange={handleChange} placeholder="اسم المنتج" className="p-2 border rounded w-full" />
                    </div>
                     <div>
                        <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">سعر الشراء</label>
                        <input type="number" step="0.01" id="purchasePrice" name="purchasePrice" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="سعر الشراء" className="p-2 border rounded w-full" />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">سعر البيع</label>
                        <input type="number" step="0.01" id="price" name="price" value={price} onChange={e => setPrice(e.target.value)} placeholder="سعر البيع" className="p-2 border rounded w-full" />
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                        <input type="number" id="quantity" name="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="الكمية" className="p-2 border rounded w-full" />
                    </div>
                    <div>
                        <label htmlFor="unitId" className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
                        <select id="unitId" name="unitId" value={editedProduct.unit?.id || ''} onChange={handleChange} className="p-2 border rounded w-full">
                            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                        <div className="flex mt-2">
                           <input type="text" value={customUnit} onChange={e => setCustomUnit(e.target.value)} placeholder="أو أضف وحدة جديدة" className="p-2 border rounded-s-md flex-grow" />
                           <button onClick={handleSaveCustomUnit} className="bg-blue-500 text-white p-2 rounded-e-md">حفظ</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">المورد</label>
                        <input type="text" id="supplier" name="supplier" value={editedProduct.supplier} onChange={handleChange} placeholder="المورد" className="p-2 border rounded w-full" />
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
                        <div className="relative">
                           <input type="text" id="barcode" name="barcode" value={editedProduct.barcode} onChange={handleChange} placeholder="يولد تلقائياً اذا ترك فارغاً" className="p-2 border rounded w-full pe-20" />
                           <button onClick={handleGenerateBarcode} className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500" title="توليد باركود"><EditIcon className="h-5 w-5"/></button>
                           <button onClick={requestScan} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600" title="مسح باركود"><BarcodeIcon className="h-5 w-5"/></button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="productionDate" className="block text-sm font-medium text-gray-700 mb-1">تاريخ ��لإنتاج</label>
                        <input type="date" id="productionDate" name="productionDate" value={editedProduct.productionDate} onChange={handleChange} className="p-2 border rounded w-full" />
                    </div>
                    <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإنتهاء</label>
                        <input type="date" id="expiryDate" name="expiryDate" value={editedProduct.expiryDate} onChange={handleChange} className="p-2 border rounded w-full" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">إلغاء</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">حفظ</button>
                </div>
            </div>
        </div>
    );
};

const ProductsPage = () => {
    const { products, saveProducts, addNotification } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handleScan = (barcode: string) => {
            if (!isModalOpen) {
                setSearchTerm(barcode);
            }
        };

        const unsubscribe = listenForScanResult(handleScan);
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [isModalOpen]);
    const [filter, setFilter] = useState('all');
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

    const handleSaveProduct = async (product: Product, isNew: boolean) => {
        const barcodeExists = products.some(p => p.barcode === product.barcode && (isNew || p.id !== product.id));
        if (barcodeExists) {
            addNotification('هذا الباركود موجود بالفعل لمنتج آخر.', 'error');
            return; 
        }

        if (isNew) {
            await saveProducts([product, ...products]);
            addNotification('تمت إضافة المنتج بنجاح');
        } else {
            await saveProducts(products.map(p => (p.id === product.id ? product : p)));
            addNotification('تم تحديث المنتج بنجاح');
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if(window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            await saveProducts(products.filter(p => p.id !== productId));
            addNotification('تم حذف المنتج', 'error');
        }
    };
    
    const handlePrintNewRandomBarcode = () => {
        const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();

        const content = `
            <div class="barcode-item">
                <svg class="barcode-svg" jsbarcode-value="${randomBarcode}"></svg>
            </div>
        `;

        const printStyles = `
            @page {
                size: 58mm 30mm; /* Small Landscape Label */
                margin: 1mm;
            }
            @media print {
                html, body {
                    width: 58mm !important;
                    height: 30mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                }
                * {
                    box-sizing: border-box;
                }
            }
            .barcode-item {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .barcode-svg {
                width: 95%;
                height: 95%;
            }
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>طباعة باركود جديد</title>
                        <style>${printStyles}</style>
                    </head>
                    <body>
                        ${content}
                        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                        <script>
                            try {
                                JsBarcode(".barcode-svg").init();
                                setTimeout(() => {
                                    window.print();
                                    window.close();
                                }, 250);
                            } catch (e) {
                                console.error('JsBarcode Error:', e);
                                window.close();
                            }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleSelectProduct = (productId: string) => {
        const newSelection = new Set(selectedProducts);
        if (newSelection.has(productId)) {
            newSelection.delete(productId);
        } else {
            newSelection.add(productId);
        }
        setSelectedProducts(newSelection);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        } else {
            setSelectedProducts(new Set());
        }
    };

    const filteredProducts = useMemo(() => {
        return products
            .filter(p => {
                if (filter === 'lowStock') return p.quantity < 10;
                if (filter === 'expiringSoon' && p.expiryDate) {
                    const today = new Date();
                    const expiry = new Date(p.expiryDate);
                    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    return diffDays <= 30 && diffDays >= 0;
                }
                return true;
            })
            .filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.barcode.includes(searchTerm) ||
                p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [products, searchTerm, filter]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
                <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
                    <PlusCircleIcon className="h-5 w-5 me-2" />
                    إضافة منتج جديد
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative md:col-span-2">
                        <input 
                            type="text" 
                            placeholder="ابحث بالاسم، الباركود، المورد..." 
                            className="w-full p-3 ps-10 border rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <SearchIcon className="absolute top-1/2 -translate-y-1/2 right-3 h-5 w-5 text-gray-400" />
                        <button onClick={requestScan} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500 hover:text-blue-600">
                            <BarcodeIcon className="h-5 w-5"/>
                        </button>
                    </div>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full p-3 border rounded-lg">
                        <option value="all">كل المنتجات</option>
                        <option value="lowStock">مخزون منخفض</option>
                        <option value="expiringSoon">قرب انتهاء الصلاحية</option>
                    </select>
                </div>
            </div>
            
            <div class="flex justify-start mb-4">
                <button onClick={handlePrintNewRandomBarcode} className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition">
                    <BarcodeIcon className="h-5 w-5 me-2" />
                    باركود جديد
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length} /></th>
                            <th className="p-4 font-semibold">اسم المنتج</th>
                            <th className="p-4 font-semibold">سعر البيع</th>
                            <th className="p-4 font-semibold">الكمية</th>
                            <th className="p-4 font-semibold">المورد</th>
                            <th className="p-4 font-semibold">الباركود</th>
                            <th className="p-4 font-semibold">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-4"><input type="checkbox" checked={selectedProducts.has(p.id)} onChange={() => handleSelectProduct(p.id)} /></td>
                                <td className="p-4">{p.name}</td>
                                <td className="p-4">{p.price.toFixed(2)} ج.م</td>
                                <td className={`p-4 font-bold ${p.quantity < 10 ? 'text-red-500' : 'text-green-600'}`}>{p.quantity} {p.unit.name}</td>
                                <td className="p-4">{p.supplier}</td>
                                <td className="p-4 font-mono">{p.barcode}</td>
                                <td className="p-4 flex space-x-2 space-x-reverse">
                                    <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} title="تعديل" className="text-blue-600 hover:text-blue-800"><EditIcon className="h-5 w-5"/></button>
                                    <button onClick={() => handleDeleteProduct(p.id)} title="حذف" className="text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                         {filteredProducts.length === 0 && (
                            <tr><td colSpan={7} className="text-center p-8 text-gray-500">لا توجد منتجات مطابقة للبحث</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ProductModal product={editingProduct} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} />}
        </div>
    );
};

export default ProductsPage;
