
import React, { useState } from 'react';
import { PackageIcon } from '../components/icons';

interface ActivationPageProps {
  onActivate: () => void;
}

const ActivationPage: React.FC<ActivationPageProps> = ({ onActivate }) => {
  const [serial, setSerial] = useState('');
  const [error, setError] = useState('');
  const correctSerial = 'YSKAB-CDEF0-10274-HIJKL-MNOP1';

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (serial.trim() === correctSerial) {
      onActivate();
    } else {
      setError('الرقم التسلسلي غير صحيح. الرجاء المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <PackageIcon className="h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">تفعيل النظام</h1>
          <p className="mt-2 text-gray-600">الرجاء إدخال الرقم التسلسلي لتفعيل البرنامج.</p>
        </div>
        <form onSubmit={handleActivate} className="space-y-6">
          <div>
            <label htmlFor="serial" className="block text-sm font-medium text-gray-700 text-right mb-1">
              الرقم التسلسلي
            </label>
            <input
              id="serial"
              name="serial"
              type="text"
              value={serial}
              onChange={(e) => {
                setSerial(e.target.value.toUpperCase());
                setError('');
              }}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center tracking-widest"
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              تفعيل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivationPage;
