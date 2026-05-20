import React, { useContext, useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const EmailVerify = () => {

    axios.defaults.withCredentials = true;
    const navigate = useNavigate();
    const inputRefs = useRef([]);
    const {userData, backendUrl, getUserData, isLoggedin} = useContext(AppContext);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (!/^\d*$/.test(value)) return;


        e.target.value = value;


        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {

        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('');
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        });
    }

    const onSubmitHandler = async(e)=>{
        e.preventDefault();
        try {
            
            const otpArray = inputRefs.current.map(e=>e.value);
            const otp = otpArray.join('');

            const {data} = await axios.post(backendUrl+"/api/auth/verify-account", {otp})
            if(data.success){
                toast.success(data.message)
                getUserData()
                navigate('/')
            }else{
                toast.error(data.message);
                if (data.message.includes("Too many")) {
                    navigate('/');
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        isLoggedin && userData && userData.isAccountVerified && navigate('/')
    },[isLoggedin, userData])

    return (
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-400'>
            <img onClick={() => navigate('/login')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />
            <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                <h1 className='text-white text-2xl font-semibold text-center mb-4'>Weryfikacja e-maila</h1>
                <p className='text-center mb-6 text-indigo-300'>Wprowadź 6-cyfrowy kod wysłany na Twój adres e-mail.</p>
                <div className='flex justify-between mb-8' onPaste={handlePaste}>
                    {Array(6).fill(0).map((_, index) => (
                        <input type="text" maxLength={1} key={index} required
                            className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                            ref={el => inputRefs.current[index] = el}
                            onChange={e => handleChange(e, index)}
                            onKeyDown={e => handleKeyDown(e, index)}
                        />
                    ))}
                </div>
                <button className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Zweryfikuj adres e-mail</button>
            </form>
        </div>
    )
}

export default EmailVerify