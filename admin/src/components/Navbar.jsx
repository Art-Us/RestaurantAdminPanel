import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/send-verify-otp");
      if (data.success) {
        navigate('/email-verify');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <header className="w-full fixed top-0 z-50 bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
      <h1 onClick={() => navigate('/')} className="text-2xl font-bold text-indigo-300 cursor-pointer">
        RollStar
      </h1>

      {userData ? (
        <div className="relative group cursor-pointer bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold border border-slate-600">
          {userData.name[0].toUpperCase()}
          <div className="absolute right-0 top-10 hidden group-hover:block bg-white text-black rounded shadow-lg min-w-[150px]">
            <ul className="py-2">
              {!userData.isAccountVerified && (
                <li
                  onClick={sendVerificationOtp}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Weryfikacja maila
                </li>
              )}
              <li
                onClick={logout}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Wyloguj
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full transition"
        >
          Zaloguj się
        </button>
      )}
    </header>
  );
};

export default Navbar;
