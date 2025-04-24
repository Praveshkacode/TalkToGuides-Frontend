import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Experts = () => {

  const {speciality} = useParams()
  const [filterExpert,setFilterExpert] = useState([])
  const navigate = useNavigate();
  
  const {psychicExperts} = useContext(AppContext)

  const  applyFilter = ()=>{
    if(speciality){
      setFilterExpert(psychicExperts.filter(expert =>expert.speciality === speciality))
    }else{
      setFilterExpert(psychicExperts)
    }
  }

  useEffect(()=>{
    applyFilter();
  },[psychicExperts,speciality])
  return (
    <div>
      <p className='text-gray-600'>Browse through the psychic expert.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <div className='flex flex-col gap-4 text-sm text-gray-600'>
          <p onClick={()=>speciality==='Psychic Expert'? navigate('/experts'): navigate('/experts/Psychic Expert')} className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Psychic Expert"?"bg-indigo-50 text-black" : ""}`}>Psychic Expert</p>
          <p onClick={()=>speciality==='Love & Relationship'? navigate('/experts'): navigate('/experts/Love & Relationship')}  className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Love & Relationship"?"bg-indigo-50 text-black" : ""}`}>Love & Relationship</p>
          <p onClick={()=>speciality==='Tarot Reading'? navigate('/experts'): navigate('/experts/Tarot Reading')}  className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Tarot Reading"?"bg-indigo-50 text-black" : ""}`}>Tarot Reading</p>
          <p onClick={()=>speciality==='Fortune Telling'? navigate('/experts'): navigate('/experts/Fortune Telling')}  className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Fortune Telling"?"bg-indigo-50 text-black" : ""}`}>Fortune Telling</p>
          <p onClick={()=>speciality==='Astrology'? navigate('/experts'): navigate('/experts/Astrology')}  className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Astrology"?"bg-indigo-50 text-black" : ""}`}>Astrology</p>
          <p onClick={()=>speciality==='Palm Reading'? navigate('/experts'): navigate('/experts/Palm Reading')}  className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === ""?"bg-indigo-50 text-black" : "Palm Reading"}`}>Palm Reading</p>
        </div>
        <div className='w-full grid gap-4 gap-y-6' style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {
            filterExpert.map((item,index)=>(
              <div onClick={()=>navigate(`/session/${item._id}`)} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 ' key={index}>
                <img className='bg-blue-50' src={item.image} alt="" />
                <div className='p-4'>
                  <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                    <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
                  </div>
                  <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                  <p className='text-gray-600 text-sm '>{item.speciality}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Experts
