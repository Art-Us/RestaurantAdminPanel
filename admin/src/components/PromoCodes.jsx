import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PromoCodes = () => {
    const { userData, backendUrl, isLoggedin, loading } = useContext(AppContext);
    const [codes, setCodes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);

    const [newPromoCode, setNewPromoCode] = useState('');
    const [expireDate, setExpireDate] = useState('');

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const navigate = useNavigate();

    const openModal = (code) => {
        setSelectedCode(code);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCode(null);
    };

    const getAllCodes = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/promo/get-all-codes", {
                withCredentials: true,
            });
            if (data.success) {
                setCodes(data.promoCodes);
            } else {
                toast.error(data.message || "Error receiving users");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const confirmDelete = async () => {
        if (!selectedCode) return;

        try {
            const { data } = await axios.post(
                backendUrl + "/api/promo/delete-code-by-id",
                { promoId: selectedCode.id },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                await getAllCodes();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            closeModal();
        }
    };

    const addNewCode = async (e, newPromoCode, expireDate) => {
        e.preventDefault();
        const expireDateInDate = new Date(expireDate).getTime();
        try {
            const { data } = await axios.post(
                backendUrl + "/api/promo/create-code",
                {
                    promoCode: newPromoCode,
                    promoCodeExpireAt: expireDateInDate
                },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message)
                await getAllCodes();
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

        setExpireDate('');
        setNewPromoCode('');
    }


    const sortedCodes = React.useMemo(() => {
        if (!sortConfig.key) return codes;

        return [...codes].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];


            if (sortConfig.key === 'promoCodeExpireAt' || sortConfig.key === 'promoCodeCreatedAt') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }


            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [codes, sortConfig]);


    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        if (!loading && (!isLoggedin || !userData?.isAdmin)) {
            navigate('/');
        } else if (!loading) {
            getAllCodes();
        }
    }, [loading, isLoggedin, userData]);

    if (loading) return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white text-xl z-50">Loading...</div>

    return (
        <div className="flex min-h-screen bg-slate-900">
            <Navbar />
            <Sidebar />
            <main className="w-full bg-slate-800 text-white p-6 mt-18 shadow-2xl rounded-2xl ml-4 mb-4 mr-4">
                <form onSubmit={(e) => addNewCode(e, newPromoCode, expireDate)} className="flex flex-col md:flex-row items-center gap-4 mb-6 justify-center">
                    <label className="font-bold text-indigo-300 w-full md:w-auto" htmlFor="promoCode">
                        Nazwa kodu:
                    </label>
                    <input
                        id="promoCode"
                        type="text"
                        placeholder="Wpisz tu nowy kod..."
                        className="px-4 py-2 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full md:w-1/3"
                        required
                        value={newPromoCode}
                        onChange={(e) => setNewPromoCode(e.target.value)}
                    />
                    <label className="font-bold text-indigo-300 w-full md:w-auto" htmlFor="expireDate">
                        Data wygasnięcia:
                    </label>
                    <input
                        id="expireDate"
                        type="date"
                        className="px-4 py-2 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full md:w-1/3"
                        required
                        value={expireDate}
                        onChange={(e) => setExpireDate(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition w-full md:w-auto"
                    >
                        Dodaj
                    </button>
                </form>
                <h1 className="text-2xl font-bold text-indigo-300 mb-6 ml-4">Lista kodów rabatowych:</h1>
                <div className="overflow-auto rounded-2xl shadow-xl ring-1 ring-slate-700">
                    <table className="min-w-full text-sm text-slate-200 bg-slate-900 rounded-2xl overflow-hidden">
                        <thead className="bg-slate-700 text-indigo-200 ">
                            <tr>
                                <th className="px-6 py-4 text-center">#</th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer select-none"
                                    onClick={() => requestSort('promoCode')}
                                >
                                    Kod {sortConfig.key === 'promoCode' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-6 py-4 text-center">Czy aktywny</th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer select-none"
                                    onClick={() => requestSort('promoCodeExpireAt')}
                                >
                                    Data wygasnięcia {sortConfig.key === 'promoCodeExpireAt' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th
                                    className="px-6 py-4 text-center cursor-pointer select-none"
                                    onClick={() => requestSort('promoCodeCreatedAt')}
                                >
                                    Data stworzenia {sortConfig.key === 'promoCodeCreatedAt' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="px-6 py-4 text-center">Usunięcie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCodes.map((code, index) => (
                                <tr
                                    key={code.id}
                                    className={`border-b border-slate-700 hover:bg-slate-700 transition duration-200 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-700/60'
                                        }`}
                                >
                                    <td className="px-6 py-4 text-center">{index + 1}</td>
                                    <td className="px-6 py-4 text-center">{code.promoCode}</td>
                                    <td className="px-6 py-4 text-center">{code.promoCodeExpireAt > Date.now() ? '✅' : '❌'}</td>
                                    <td className="px-6 py-4 text-center">{new Date(code.promoCodeExpireAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center">{new Date(code.promoCodeCreatedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center">

                                        <button
                                            onClick={() => openModal(code)}
                                            className="text-red-500 hover:text-red-700 font-bold transition"
                                        >
                                            ✖
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {showModal && selectedCode && (
                <div className="fixed inset-0 z-50 bg-transparent bg-opacity-50 flex items-center justify-center backdrop-blur-md transition-all duration-300 ease-in-out">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Potwierdzenie usunięcia</h2>
                        <p className="text-gray-700 mb-6">
                            Czy na pewno chcesz usunąć ten kod: {' '}
                            <span className="font-bold">{selectedCode.promoCode}</span>?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                            >
                                Nie
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                Tak
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PromoCodes;
