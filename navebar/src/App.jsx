
import './App.css'
import Login from './component/Login'
import MainPage from './component/MainPage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom' 
import Signin from './component/Signin'
import toast, { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react'
import { auth } from './component/FireBase'

function App() {

  const [users, setUsers]= useState()
  useEffect(()=>{
    auth.onAuthStateChanged((user)=>{
      setUsers(user)
    })
  })

  return (
   <>
   <BrowserRouter>
   <Routes>
     <Route path="/" element={users ? <Navigate to="/allTask" />: <Login/>} />
     <Route path="/allTask" element={<MainPage />} />
     <Route path="/login" element={<Login/>} />
     <Route path="/signin" element={<Signin/>} />
   
   </Routes>
   </BrowserRouter>
   </>
  )
}

export default App
