import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets';

const MySessions = () => {

  const {psychicExperts} = useContext(AppContext);

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Sessions</p>
      <div>
        {psychicExperts.slice(0,3).map((item,index)=>(
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img  className='w-32 bg-indigo-50' src={item.image} alt="" />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.name}</p>
              <p>{item.specialities.map(s => s.type).join(', ')}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xs'>{item.address.line1}</p>
              <p className='text-xs'>{item.address.line2}</p>
              <p className='text-sm mt-1' ><span className='text-sm text-neutral-700 font-medium' >Date & Time</span> 28, April,2025 | 8:30 PM</p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              <button className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Chat Again</button>
              <button className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-green-600 hover:text-white transition-all duration-300'>Give Review</button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  )
}

export default MySessions
