import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyProfile = () => {

  const {userData,setUserData,token,backendUrl,loadUserProfileData } = useContext(AppContext)


  const [isEdit,setIsEdit] = useState(false)
  const [image,setImage] = useState(false)

  const updateUserProfileData = async ()=> {
    try {
      const formData = new FormData()
      formData.append('name',userData.name)
      formData.append('phone',userData.phone)
      formData.append('address',JSON.stringify(userData.address))
      formData.append('gender',userData.gender)
      formData.append('dob',userData.dob)

      image && formData.append('image',image)

      const {data} = await axios.post(backendUrl+'/api/user/update-profile',formData,{headers:{token}})

      if(data.success){
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

const initPay = (order) => {
  const options = {
    key : import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount:order.amount,
    currency:order.currency,
    name:'Wallet Payment',
    description:'Wallet Payment',
    order_id:order.id,
    receipt:order.receipt,
    handler: async(response) => {
      console.log(response)

      try {
        const {data} = await axios.post(backendUrl+'/api/user/verifyRazorpay',response,{headers:{token}})

        if(data.success){
          toast.success("Wallet updated successfully!");
          await loadUserProfileData();
        }
      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }
  }

  const rzp = new window.Razorpay(options)
  rzp.open()
} 

  const walletRazorpay = async(userId) => {
    try {
      const {data} = await axios.post(backendUrl+'/api/user/payment-razorpay',{userId},{headers:{token}})
    
      if(data.success){
        initPay(data.order)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return userData && (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>
      {/* Display Wallet Balance */}
    <div className='mb-4 p-3 bg-gray-100 rounded-md'>
      <p className='font-semibold text-gray-500'>Wallet Balance</p>
      <p className='text-2xl'>{userData.wallet} ₹</p>
      <button 
        onClick={()=>walletRazorpay(userData._id)} 
        className='mt-2 text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'
      >
        Add Money
      </button>
    </div>

      {
        isEdit
        ?<label htmlFor="image">
          <div className='inline-block relative cursor-pointer'>
            <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image): userData.image} alt="" />
            <img className='w-10 absolute bottom-12 right-12' src={ image ? '':assets.upload_icon} alt="" />
            
          </div>
          <input onChange={(e)=>setImage(e.target.files[0])} type="file"  id="image" hidden/>
        </label>
        :<img className='w-36 rounded' src={userData.image} alt="" />
      }
      
      {
        isEdit 
        ? <input className='bg-gray-50 text-3xl font-medium max-w-60 mt-4' type="text" value={userData.name} onChange={e => setUserData(prev => ({...prev,name:e.target.value}))} />
        : <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
      }
      <hr className='bg-zinc-400 h-[1px] border-none '/>
      <div>
        <p className='text-neutral-500 underline mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Email id:</p>
          <p className='text-blue-500'>{userData.email}</p>
          <p className='font-medium'>Phone:</p>
          {
            isEdit 
            ? <input className='bg-gray-100 max-w-52' type="text" value={userData.phone} onChange={e => setUserData(prev => ({...prev,phone:e.target.value}))} />
            : <p className='text-blue-400'>{userData.phone}</p>
          }
          <p className='font-medium'>Address:</p>
          {
            isEdit
            ? <p>
              <input className='bg-gray-50' onChange={(e) => setUserData(prev => ({...prev,address:{...prev.address,line1:e.target.value}}))} value={userData.address.line1} type="text" />
              <br />
              <input className='bg-gray-50' onChange={(e) => setUserData(prev => ({...prev,address:{...prev.address,line2:e.target.value}}))} value={userData.address.line2} type="text" />
            </p>
            : <p className='text-gray-500'>
              {userData.address.line1}
              <br />
              {userData.address.line2}
            </p>
          }
        </div>
      </div>
      <div>
        <p className='text-neutral-500 underline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Gender:</p>
          {
            isEdit 
            ? <select className='max-w-20 bg-gray-100' onChange={(e)=>setUserData(prev => ({...prev,gender:e.target.value})) } value={userData.gender}>
              <option value="Male"> Male</option>
              <option value="Female">Female</option>
            </select>
            : <p className='text-gray-400'>{userData.gender}</p>
          }
          <p className='font-medium'>Birthday:</p>
          {
            isEdit 
            ? <input className='max-w-28 bg-gray-100' type="date" onChange={(e)=>setUserData(prev => ({...prev,dob:e.target.value})) } value={userData.dob}  /> 
            : <p className='text-gray-400'>{userData.dob}</p>
          }
        </div>
      </div>
      <div className='mt-10'>
        {
          isEdit
          ? <button className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all' onClick={updateUserProfileData}>Save Information</button>
          : <button className='border border-primary px-8 py-2 rounded-full  hover:bg-primary hover:text-white transition-all' onClick={()=>setIsEdit(true)}>Edit</button>
        }
      </div>

    </div>
  )
}

export default MyProfile
