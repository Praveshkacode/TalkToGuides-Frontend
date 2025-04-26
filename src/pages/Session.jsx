import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const Session = () => {

  const {expertId} = useParams()
  const {psychicExperts,currencySymbol} = useContext(AppContext)

  const [expertInfo,setExpertInfo] = useState(null)

  const fetchExpertInfo = async() => {
    const expertInfo = psychicExperts.find(expert =>expert._id === expertId)
    setExpertInfo(expertInfo)
    console.log(expertInfo)
  }

  useEffect(()=>{
    fetchExpertInfo();
  },[psychicExperts,expertId])

  return expertInfo && (
    <div>
      {/* Expert Details  */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={expertInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* Expert info like : name, degree and experience  */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>{expertInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{expertInfo.specialities.map(s => s.type).join(', ')}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{expertInfo.experience}</button>
          </div>

          {/* About Expert  */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{expertInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'> 
            {/* currencySymbol  */}
            Session Fee: <span className='text-gray-600'>{expertInfo.specialities.map(s => s.type +" : "+ s.price +"/Per Minute").join(', ')}</span>
          </p>

        </div>
      </div>
      <div className='sm:ml-72 sm:pl-4 flex justify-around mt-4 font-medium text-gray-600'>
         <button className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full'>Voice Call</button>
         <button className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full'>Live Chat</button>
      </div>
      
      
    </div>
  )
}

export default Session
