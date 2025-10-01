import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Chat from '../components/Chat'
import { toast } from 'react-toastify'

const Session = () => {
  const { expertId } = useParams()
  const { psychicExperts, currencySymbol, reviewData, userData, createSession } = useContext(AppContext)

  const [expertInfo, setExpertInfo] = useState(null)
  const [selectedSpeciality, setSelectedSpeciality] = useState(null)
  const [reviews, setReviews] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  useEffect(() => {
    const expert = psychicExperts.find(expert => expert._id === expertId)
    setExpertInfo(expert)
    if (expert && expert.specialities.length > 0) {
      setSelectedSpeciality(expert.specialities[0])
    }
    setReviews(getRandomReviews(5))
  }, [psychicExperts, expertId])

  function getRandomReviews(count = 5) {
    const shuffled = [...reviewData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const handleSpecialityChange = (e) => {
    const selectedType = e.target.value
    const speciality = expertInfo.specialities.find(s => s.type === selectedType)
    setSelectedSpeciality(speciality)
  }

  const userId = userData?._id
  const roomId = `session-${userId}-${expertId}`

  const handleStartChat = async () => {
    if (!userData) {
      toast.error('Please login to start chat')
      return
    }

    if (showChat) {
      setShowChat(false)
      return
    }

    setIsCreatingSession(true)
    try {
      // Create session first
      const session = await createSession(expertId)
      if (session) {
        setSessionInfo(session)
        setShowChat(true)
        toast.success('Chat session started!')
      }
    } catch (error) {
      console.error('Error starting chat:', error)
      toast.error('Failed to start chat session')
    } finally {
      setIsCreatingSession(false)
    }
  }

  return expertInfo && (
    <div>
      {/* Expert Details */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={expertInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {expertInfo.name} <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{expertInfo.specialities.map(s => s.type).join(', ')}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{expertInfo.experience}</button>
          </div>

          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{expertInfo.about}</p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Choose a Speciality:</label>
            <select
              className="border text-sm p-2 rounded-md mt-1 text-gray-600"
              onChange={handleSpecialityChange}
              value={selectedSpeciality?.type || ''}
            >
              {expertInfo.specialities.map((spec, idx) => (
                <option key={idx} value={spec.type}>{spec.type}</option>
              ))}
            </select>
          </div>

          {selectedSpeciality && (
            <div className='mt-2'>
              <p className="text-gray-500 text-sm">Type: <span className='text-gray-700'>{selectedSpeciality.type}</span></p>
              <p className="text-gray-500 text-sm">Fees: <span className='text-gray-700'>{currencySymbol}{selectedSpeciality.price}</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Call / Chat Buttons */}
      <div className='sm:ml-72 sm:pl-4 flex justify-around mt-4 font-medium text-gray-600'>
        <button className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full'>Voice Call</button>
        <button
          className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed'
          onClick={handleStartChat}
          disabled={isCreatingSession || !userData}
        >
          {isCreatingSession ? 'Starting...' : showChat ? 'Close Chat' : 'Live Chat'}
        </button>
      </div>

      {/* Show Chat Component */}
      {showChat && userId && (
        <div className='mt-8 mx-4 sm:mx-0 sm:ml-72 sm:pl-4'>
          <h2 className='text-lg font-semibold text-gray-800 mb-2'>Live Chat</h2>
          <Chat 
            roomId={sessionInfo?._id || roomId} 
            senderId={userId} 
            senderType="user"
            sessionId={sessionInfo?._id || roomId}
            expertId={expertId}
            userId={userId}
            expertName={expertInfo.name}
          />
        </div>
      )}

      {/* Review Panel */}
      <div className='mt-8 mx-4 sm:mx-0 sm:ml-72 sm:pl-4'>
        <h2 className='text-xl font-semibold text-gray-800 mb-3'>User Reviews</h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          {reviews.map((review, index) => (
            <div key={index} className='border border-gray-300 rounded-lg p-4 bg-white shadow-sm'>
              <p className='font-medium text-gray-700'>{review.name}</p>
              <p className='text-sm text-gray-600 mt-1 italic'>" {review.feedback} "</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Session
