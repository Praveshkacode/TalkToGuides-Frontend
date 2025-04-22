import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Experts from './pages/Experts'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MySessions from './pages/MySessions'
import Session from './pages/Session'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/experts" element={<Experts/>}/>
        <Route path="/experts/:speciality" element={<Experts/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/my-profile" element={<MyProfile/>}/>
        <Route path="/my-sessions" element={<MySessions/>}/>
        <Route path="/session/:expertId" element={<Session/>}/>
      </Routes>
      <Footer/>
    </div>
  )
}

export default App
