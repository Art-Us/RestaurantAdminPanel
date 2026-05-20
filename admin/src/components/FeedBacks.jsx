import React, { useState, useEffect, useContext } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const FeedBacks = () => {
    const { userData, backendUrl, isLoggedin, loading } = useContext(AppContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [state, setState] = useState('new');
    const navigate = useNavigate();

    const getAllFeedBacks = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/feedback/get-all`, {
                withCredentials: true,
            });
            if (data.success) {
                setFeedbacks(data.feedbacks);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const applyFeedBack = async (feedbackId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/feedback/apply-by-id`, { feedbackId }, {
                withCredentials: true,
            });
            if (data.success) {
                toast.success(data.message);
                getAllFeedBacks();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const deleteFeedBack = async (feedbackId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/feedback/delete-by-id`, { feedbackId }, {
                withCredentials: true,
            });
            if (data.success) {
                toast.success(data.message);
                getAllFeedBacks();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (!loading && (!isLoggedin || !userData?.isAdmin)) {
            navigate('/');
        } else if (!loading) {
            getAllFeedBacks();
        }
    }, [loading, isLoggedin, userData]);

    if (loading)
        return (
            <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white text-xl z-50">
                Loading...
            </div>
        );

    const filteredFeedbacks = feedbacks
        .filter(fb => state === 'new' ? !fb.isApplied : fb.isApplied)
        .sort((a, b) => {
            if (b.addedDate !== a.addedDate) {
                return b.addedDate - a.addedDate;
            }
            return b.sentDate - a.sentDate;
        });

    return (
        <div className="flex min-h-screen bg-slate-900">
            <Navbar />
            <Sidebar />
            <main className="w-full bg-slate-800 text-white p-6 mt-18 shadow-2xl rounded-2xl ml-4 mb-4 mr-4">
                <div className="flex justify-between items-center mb-6 ml-4 mr-4">
                    <h1 className="text-2xl font-bold text-indigo-300">
                        {state === 'new' ? 'Nowe opinie klientów:' : 'Zaakceptowane opinie klientów:'}
                    </h1>
                    <button
                        className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition w-full md:w-auto"
                        onClick={() => setState(state === 'new' ? 'applied' : 'new')}
                    >
                        {state === 'applied' ? 'Pokaż nowe' : 'Pokaż zaakceptowane'}
                    </button>
                </div>

                <div className="overflow-auto rounded-2xl shadow-xl ring-1 ring-slate-700">
                    <table className="table-fixed min-w-full text-sm text-slate-200 bg-slate-900 rounded-2xl overflow-hidden">
                        <colgroup>
                            <col className="w-[5%]" />
                            <col className="w-[10%]" />
                            <col className="w-[50%]" />
                            <col className="w-[5%]" />
                            <col className="w-[20%]" />
                            <col className="w-[10%]" />
                        </colgroup>
                        <thead className="bg-slate-700 text-indigo-200">
                            <tr>
                                <th className="px-6 py-4 text-center">#</th>
                                <th className="px-6 py-4 text-center">Klient</th>
                                <th className="px-6 py-4 text-left">Opinia</th>
                                <th className="px-6 py-4 text-center">Ocena</th>
                                <th className="px-6 py-4 text-center">Data</th>
                                <th className="px-6 py-4 text-center">Działanie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFeedbacks.length > 0 ? (
                                filteredFeedbacks.map((feedback, index) => (
                                    <tr
                                        key={feedback.id}
                                        className={`border-b border-slate-700 transition duration-200 ${index % 2 === 0
                                            ? 'bg-slate-800 hover:bg-slate-700'
                                            : 'bg-slate-700/60 hover:bg-slate-600'
                                            }`}
                                    >
                                        <td className="px-6 py-4 align-top text-center">{index + 1}</td>
                                        <td className="px-6 py-4 align-top text-sm whitespace-pre-wrap text-center">
                                            <div className="font-semibold">{feedback.firstName} {feedback.lastName}</div>
                                            <div className="text-xs text-slate-400">{feedback.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 align-top">{feedback.comment}</td>
                                        <td className="px-6 py-4 align-top text-center font-semibold text-yellow-300">{feedback.rating}</td>
                                        <td className={`px-6 py-4 align-top text-xs text-slate-400 ${state === "new" ? "text-center" : ""}`}>
                                            {feedback.sentDate ? <div>{state === "applied" ? "Wysłano: " : ""}{new Date(feedback.sentDate).toLocaleString("uk-UA")}</div> : ""}
                                            {feedback.addedDate ? <div>Dodano: {new Date(feedback.addedDate).toLocaleString("uk-UA")}</div> : ""}
                                        </td>
                                        <td className="px-6 py-4 align-top text-xl text-center">
                                            {state === 'new' && (
                                                <button onClick={() => applyFeedBack(feedback.id)} className="mr-2 hover:text-green-400">✅</button>
                                            )}
                                            <button onClick={() => deleteFeedBack(feedback.id)} className="hover:text-red-400">❌</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400 italic bg-slate-800">
                                        Brak opinii
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default FeedBacks;
