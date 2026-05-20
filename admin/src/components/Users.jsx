import React, { useContext, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    const { userData, backendUrl, isLoggedin, loading } = useContext(AppContext);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();


    const openModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };


    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };


    const getUsers = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/get-all-users", {
                withCredentials: true,
            });
            if (data.success) {
                setUsers(data.users);
            } else {
                toast.error(data.message || "Error receiving users");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


    const confirmDelete = async () => {
        if (!selectedUser) return;

        try {
            const { data } = await axios.post(
                backendUrl + "/api/user/delete-user-by-id",
                { deletedUserId: selectedUser.id },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                getUsers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            closeModal();
        }
    };


    useEffect(() => {
        if (!loading && (!isLoggedin || !userData?.isAdmin)) {
            navigate('/');
        } else if (!loading) {
            getUsers();
        }
    }, [loading, isLoggedin, userData]);

    if (loading) return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white text-xl z-50">Loading...</div>

    return (
        <div className="flex min-h-screen bg-slate-900">
            <Navbar />
            <Sidebar />
            <main className="w-full bg-slate-800 text-white p-6 mt-18 shadow-2xl rounded-2xl ml-4 mb-4 mr-4">
                <h1 className="text-2xl font-bold text-indigo-300 mb-6 ml-4">Lista użytkowników:</h1>
                <div className="overflow-auto rounded-2xl shadow-xl ring-1 ring-slate-700">
                    <table className="min-w-full text-sm text-slate-200 bg-slate-900 rounded-2xl overflow-hidden">
                        <thead className="bg-slate-700 text-indigo-200 ">
                            <tr>
                                <th className="px-6 py-4 text-center">#</th>
                                <th className="px-6 py-4 text-center">Imie</th>
                                <th className="px-6 py-4 text-center">Email</th>
                                <th className="px-6 py-4 text-center">Rola</th>
                                <th className="px-6 py-4 text-center">Weryfokacja</th>
                                <th className="px-6 py-4 text-center">Data rejestracji</th>
                                <th className="px-6 py-4 text-center">Ostatnie logowanie</th>
                                <th className="px-6 py-4 text-center">Usunięcie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr
                                    key={user.id}
                                    className={`border-b border-slate-700 hover:bg-slate-700 transition duration-200 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-700/60'
                                        }`}
                                >
                                    <td className="px-6 py-4 text-center">{index + 1}</td>
                                    <td className="px-6 py-4 text-center">{user.name}</td>
                                    <td className="px-6 py-4 text-center">{user.email}</td>
                                    <td className="px-6 py-4 text-center">{user.isAdmin ? 'administrator' : 'użytkownik'}</td>
                                    <td className="px-6 py-4 text-center">{user.isAccountVerified ? '✅' : '❌'}</td>
                                    <td className="px-6 py-4 text-center">{new Date(user.registrationDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center">{new Date(user.lastLoginDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        
                                        <button
                                            onClick={() => openModal(user)}
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



            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 bg-transparent bg-opacity-50 flex items-center justify-center backdrop-blur-md transition-all duration-300 ease-in-out">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Potwierdzenie usunięcia</h2>
                        <p className="text-gray-700 mb-6">
                            Czy na 100% chcesz usunąć użytokwnika: {' '}
                            <span className="font-bold">{selectedUser.name}</span>?
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
    );
};

export default Users;
