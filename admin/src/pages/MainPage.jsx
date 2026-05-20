import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { NavLink } from 'react-router-dom'
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MainPage = () => {
    const navigate = useNavigate();
    const { userData, isLoggedin, loading } = useContext(AppContext);

    useEffect(() => {

        if (!loading) {
            console.log("loading:", loading, "isLoggedin:", isLoggedin, "userData:", userData);

            if (!isLoggedin || !userData) {
                navigate('/login');
            }
        }
    }, [loading, isLoggedin, userData]);

    if (loading) return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white text-xl z-50">Loading...</div>


    return (

        <div className="flex min-h-screen bg-slate-900">
            {/* bg-gradient-to-br from-blue-500 to-purple-400 */}
            <Navbar />

            <Sidebar />

            <div className=' flex items-center justify-center w-full bg-slate-800 text-white p-6 mt-18 shadow-2xl rounded-2xl ml-4 mb-4 mr-4'>
                <div className=" text-xl font-medium text-indigo-400">
                    {userData?.isAdmin ? "👑 Administrator" : "🙋‍♂️ Użytkownik"}
                </div>
            </div>

        </div>
    );


}

export default MainPage