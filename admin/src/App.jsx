import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer } from 'react-toastify';
import MainPage from './pages/MainPage'
import Users from './components/Users'
import PromoCodes from './components/PromoCodes'
import Orders from './components/Orders'
import FeedBacks from './components/FeedBacks'
import DishesEdit from './components/DishesEdit/DishesEdit'

const App = () => {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path='/login' element={<Login />}/>
        <Route path='/email-verify' element={<EmailVerify />}/>
        <Route path='/reset-password' element={<ResetPassword />}/>
        <Route path='/' element={<MainPage />} />
        <Route path='/users' element={<Users />}/>
        <Route path='/codes' element={<PromoCodes />}/>
        <Route path='/orders' element={<Orders />}/>
        <Route path='/feedbacks' element={<FeedBacks />}/>

        <Route path='/dishes-edit' element={<DishesEdit />} />
        
      </Routes>
    </div>
  )
}

export default App