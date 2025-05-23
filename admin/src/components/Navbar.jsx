import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'


const Navbar = () => {

    const {aToken,setAToken} = useContext(AdminContext)
    const {dToken,setDToken} = useContext(DoctorContext)
    const navigate = useNavigate()

     const logout = () => {
      navigate('/')
      aToken && setAToken('')
      aToken && localStorage.removeItem('aToken')
      dToken && setDToken('')
      dToken && localStorage.removeItem('dToken')
      
       
    }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
       <img 
         
         className="w-50 cursor-pointer rounded-lg bg-[#5f6FFF] transition-transform duration-300 hover:scale-110 hover:opacity-90" 
         src={assets.logo} 
         alt="" 
       />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin':'Doctor'}</p>
      </div>
      <button 
        className='bg-[#5F6FFF] text-white text-sm px-10 py-2 rounded-full' 
        onClick={logout} // Attach the logout function here
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar
