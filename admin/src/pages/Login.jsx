import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRef } from 'react';

const Login = () => {

    const navigate = useNavigate();

    const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext);

    const inputRefs = useRef([]);

    const [state, setState] = useState('Login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isEmailSent, setIsEmailSent] = useState(false);


    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();

            axios.defaults.withCredentials = true;


            if (state === "Sign Up") {
                const { data } = await axios.post(backendUrl + "/api/auth/send-new-user-otp");
                if (data.success) {
                    setIsEmailSent(true);
                } else {
                    toast.error(data.message)
                }
                
            } else {
                const { data } = await axios.post(backendUrl + "/api/auth/login", { email, password });
                if (data.success) {
                    setIsLoggedin(true);
                    await getUserData();
                    navigate('/')
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
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


    const onSubmitOtp = async (e) => {
        e.preventDefault();

        const otpArray = inputRefs.current.map(e => e.value);
        const enteredOtp = otpArray.join('');

        try {
            const { data } = await axios.post(backendUrl + "/api/auth/register", {
                name, email, password, otp: enteredOtp
            });

            if (data.success) {
                toast.success("Registration successful");
                setIsLoggedin(true);
                await getUserData();
                navigate('/');
            } else {
                toast.error(data.message);
                if (data.message.includes("Too many")) {
                    setIsEmailSent(false);
                    navigate('/login');
                }
            }

        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-500 to-purple-400'> {/*  bg-slate-900 */}
                <img onClick={() => navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />
                {!isEmailSent && <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
                    <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === "Sign Up" ? "Utwórz konto" : "Zaloguj się"}</h2>
                    <p className='text-center text-sm mb-6'>{state === "Sign Up" ? "Załóż konto." : "Zaloguj się na swoje konto!"}</p>
                    <form onSubmit={onSubmitHandler}>
                        {state === "Sign Up" && (
                            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                                <img src={assets.person_icon} alt="" />
                                <input onChange={e => setName(e.target.value)} value={name} className='bg-transparent outline-none' type="text" placeholder='Imie' required />
                            </div>
                        )}


                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                            <img src={assets.mail_icon} alt="" />
                            <input onChange={e => setEmail(e.target.value)} value={email} className='bg-transparent outline-none' type="email" placeholder='Email' required />
                        </div>

                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                            <img src={assets.lock_icon} alt="" />
                            <input onChange={e => setPassword(e.target.value)} value={password} className='bg-transparent outline-none' type="password" placeholder='Hasło' required />
                        </div>

                        {state === "Login" && (<p onClick={() => navigate('/reset-password')} className='mb-4 text-indigo-500 cursor-pointer'>Nie pamiętasz hasła?</p>)}
                        <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>{state==="Login"?"Zaloguj się":"Załóż konto"}</button>
                    </form>
                    {state === "Sign Up"
                        ?
                        (<p className='text-gray-400 text-center text-xs mt-4'>Masz już konto? {" "}
                            <span onClick={() => setState('Login')} className='text-blue-400 cursor-pointer underline'>Zaloguj się tutaj</span>
                        </p>)
                        :
                        (<p className='text-gray-400 text-center text-xs mt-4'>Nie masz konta?{" "}
                            <span onClick={() => setState('Sign Up')} className='text-blue-400 cursor-pointer underline'>Zarejestruj się</span>
                        </p>)
                    }


                </div>}







                {isEmailSent && <form onSubmit={onSubmitOtp} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                    <h1 className='text-white text-2xl font-semibold text-center mb-4'>Otrzymaj kod od admina</h1>
                    <p className='text-center mb-6 text-indigo-300'>Wprowadź 6-cyfrowy kod wysłany na adres e-mail administratora.</p>
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
                    <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Prześlij</button>
                </form>}
            </div>





        </>

    )
}

export default Login