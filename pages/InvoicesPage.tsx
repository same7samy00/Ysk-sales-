
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../App';
import { Invoice } from '../types';
import { SearchIcon, PrintIcon } from '../components/icons';
import { printInvoice } from '../utils/print-utils';

const InvoicesPage = () => {
    const { invoices, settings } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const handlePrint = (invoice: Invoice) => {
        printInvoice(invoice, settings);
    };

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const customerName = inv.customer ? inv.customer.name.toLowerCase() : 'عميل نقدي';
            const lowerCaseSearch = searchTerm.toLowerCase();
            return inv.id.toLowerCase().includes(lowerCaseSearch) || 
                   customerName.includes(lowerCaseSearch) ||
                   inv.date.includes(lowerCaseSearch);
        });
    }, [invoices, searchTerm]);
    
    return (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">سجل الفواتير</h1>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="ابحث برقم الفاتورة، اسم العميل، أو التاريخ..."
                        className="w-full p-3 ps-10 border rounded-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <SearchIcon className="absolute top-1/2 -translate-y-1/2 right-3 h-5 w-5 text-gray-400" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 font-semibold">رقم الفاتورة</th>
                            <th className="p-4 font-semibold">التاريخ</th>
                            <th className="p-4 font-semibold">العميل</th>
                            <th className="p-4 font-semibold">الإجمالي</th>
                            <th className="p-4 font-semibold">حالة الدفع</th>
                            <th className="p-4 font-semibold">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(inv => (
                            <tr key={inv.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-mono">{inv.id}</td>
                                <td className="p-4">{inv.date}</td>
                                <td className="p-4">{inv.customer ? inv.customer.name : 'عميل نقدي'}</td>
                                <td className="p-4 font-bold">{inv.total.toFixed(2)} ج.م</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${inv.paymentType === 'نقدي' ? 'bg-green-100 text-green-800' : inv.paymentType === 'آجل' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {inv.paymentType}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button onClick={() => handlePrint(inv)} className="text-blue-600 hover:text-blue-800 flex items-center">
                                       <PrintIcon className="h-5 w-5 me-2" /> طباعة
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filteredInvoices.length === 0 && (
                            <tr><td colSpan={6} className="text-center p-8 text-gray-500">لا توجد فواتير مطابقة للبحث</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default InvoicesPage;
