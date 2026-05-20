import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useState } from 'react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const Orders = () => {
    const { backendUrl, isLoggedin, loading } = useContext(AppContext);
    const [orders, setOrders] = useState([]);
    const [state, setState] = useState('actual');
    const navigate = useNavigate();

    const getTodayOrders = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/order/get-today-orders", {
                withCredentials: true,
            });

            if (data.success) {
                toast.success(data.message)
                setOrders(data.receivedOrders);


            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const completeOrder = async (orderId) => {
        try {
            const { data } = await axios.post(backendUrl + "/api/order/complete-by-id", { orderId: orderId }, {
                withCredentials: true,
            });

            if (data.success) {
                toast.success(data.message)
                await getTodayOrders();

            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (!loading && (!isLoggedin)) {
            navigate('/');
        } else if (!loading) {
            getTodayOrders();
        }
    }, [loading, isLoggedin]);

    if (loading) return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white text-xl z-50">Loading...</div>

    return (
        <div className="flex min-h-screen bg-slate-900">
            <Navbar />
            <Sidebar />
            <main className="w-full bg-slate-800 text-white p-6 mt-18 shadow-2xl rounded-2xl ml-4 mb-4 mr-4">
                <div className='flex justify-between items-center mb-6 ml-4 mr-4'>
                    <h1 className="text-2xl font-bold text-indigo-300 items-center">
                        {state==="actual"?"Lista dzisiejszych niezrealizowanych zamówień:":"Archiwum dzisiejszych zrealizowanych zamówień:"}
                    </h1>
                    <button className='px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition w-full md:w-auto'
                        onClick={(e) => {
                            e.preventDefault(); setState(state === 'actual' ? 'archive' : 'actual')
                        }}>{state === 'actual' ? "Pokaż archiwum" : "Pokaż aktualne"}</button>
                </div>
                <div className="overflow-auto rounded-2xl shadow-xl ring-1 ring-slate-700">
                    <table className="min-w-full text-sm text-slate-200 bg-slate-900 rounded-2xl overflow-hidden table-fixed">
                        <colgroup>
                            <col className="w-[5%]" />
                            <col className="w-[45%]" />
                            <col className="w-[45%]" />
                            <col className="w-[5%]" />
                        </colgroup>
                        <thead className="bg-slate-700 text-indigo-200">
                            <tr>
                                <th className="px-6 py-4 text-left">#</th>
                                <th className="px-6 py-4 text-left">Klient</th>
                                <th className="px-6 py-4 text-left">Dania</th>
                                <th className="px-6 py-4 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders
                                .slice()
                                .filter((order) =>
                                    state === "actual" ? !order.isCompleted : state === "archive" ? order.isCompleted : true
                                )
                                .sort((a, b) => b.createdAt - a.createdAt).map((order, index) => {
                                    const totalPrice = order.orders.reduce(
                                        (sum, item) => sum + item.price * item.quantity,
                                        0
                                    );

                                    return (

                                        <tr
                                            key={order.id}
                                            className={`border-b border-slate-700 transition duration-200
                                                ${order.isCompleted
                                                    ? "bg-slate-700/60 text-slate-500 cursor-not-allowed"
                                                    : "bg-slate-800"
                                                // : index % 2 === 0
                                                //     ? "bg-slate-800 hover:bg-slate-700"
                                                //     : "bg-slate-700/60 hover:bg-slate-600"
                                                }`}
                                        >
                                            <td className="px-6 py-4 align-top">{index + 1}</td>
                                            <td className="px-6 py-4 align-top text-sm whitespace-pre-wrap">
                                                <div className="text-xs text-slate-400 mb-2">
                                                    {new Date(order.createdAt).toLocaleString("uk-UA")}
                                                </div>
                                                <div><span className="text-xs text-slate-400">Imie:</span> {order.customer.firstName} {order.customer.lastName}</div>
                                                <div><span className="text-xs text-slate-400">Tel:</span> {order.customer.phone}</div>
                                                <div><span className="text-xs text-slate-400">Email:</span> {order.customer.email}</div>
                                                <div>
                                                    <span className="text-xs text-slate-400">Adres:</span> ul. {order.customer.street}, dom {order.customer.house}, miesz. {order.customer.apartment}
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-400">Wej.:</span> {order.customer.entrance}, <span className="text-xs text-slate-400">Piętro:</span> {order.customer.floor}
                                                </div>
                                                <div><span className="text-xs text-slate-400">Płatność:</span> {order.customer.paymentMethod}</div>
                                                <div><span className="text-xs text-slate-400">Ilość osób:</span> {order.customer.numberOfPersons}</div>
                                                {order.customer.comment && (
                                                    <div><span className="text-xs text-slate-400">Komentarz:</span> {order.customer.comment}</div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 align-top text-sm">
                                                <ul className="list-disc list-inside space-y-1">
                                                    {order.orders.map((item, i) => (
                                                        <li key={i}>
                                                            {item.title} — {item.quantity} x {item.price}₴ ={" "}
                                                            <span className={`font-semibold
                                                            ${order.isCompleted ? "text-slate-400" : "text-green-300"} `}>
                                                                {item.quantity * item.price}₴
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className={`mt-3 font-bold  text-right ${order.isCompleted ? "text-slate-400" : " text-green-400"}`}>
                                                    W sumie: {totalPrice} ₴
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top text-xl text-center">

                                                <button onClick={() => completeOrder(order.id)}>{order.isCompleted ? "✅" : "❌"}</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            {orders
                                .filter((order) =>
                                    state === "actual" ? !order.isCompleted :
                                        state === "archive" ? order.isCompleted :
                                            true
                                ).length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic bg-slate-800">
                                            Brak zamówień
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}

export default Orders