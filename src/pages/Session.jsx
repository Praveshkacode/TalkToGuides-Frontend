import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Chat from '../components/Chat'
import { toast } from 'react-toastify'
import axios from 'axios'

const Session = () => {
  const { expertId } = useParams()
  const { psychicExperts, currencySymbol, reviewData, userData, createSession, backendUrl, token } = useContext(AppContext)

  const [expertInfo, setExpertInfo] = useState(null)
  const [selectedSpeciality, setSelectedSpeciality] = useState(null)
  const [reviews, setReviews] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [sessionInfo, setSessionInfo] = useState(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [chatStatus, setChatStatus] = useState('idle') // 'idle', 'pending', 'active'
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

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
  const roomId = `session-${userId}-${expertId}` // Fallback room ID

  const handleStartChat = async () => {
    if (!userData) {
      toast.error('Please login to start chat')
      return
    }

    if (chatStatus === 'pending') {
      toast.info('Waiting for expert to accept your chat request...')
      return
    }

    if (showChat && chatStatus === 'active') {
      setShowChat(false)
      setChatStatus('idle')
      return
    }

    setIsCreatingSession(true)
    try {
      // Create session first
      const session = await createSession(expertId)
      if (session) {
        setSessionInfo(session)
        setChatStatus('pending')
        setShowChat(true)
        toast.success('Chat request sent! Waiting for expert to accept...')
        console.log('Session created:', session)
        
        // Start polling for session status
        pollSessionStatus(session._id)
      }
    } catch (error) {
      console.error('Error starting chat:', error)
      toast.error('Failed to start chat session')
    } finally {
      setIsCreatingSession(false)
    }
  }

  const pollSessionStatus = async (sessionId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/session-status/${sessionId}`, {
          headers: { token }
        })
        
        if (response.data.success) {
          const status = response.data.session.status
          console.log('Session status:', status)
          
          if (status === 'active') {
            setChatStatus('active')
            toast.success('Expert accepted your chat! You can now start messaging.')
            clearInterval(pollInterval)
          } else if (status === 'cancelled') {
            setChatStatus('idle')
            setShowChat(false)
            toast.error('Expert declined your chat request.')
            clearInterval(pollInterval)
          }
        }
      } catch (error) {
        console.error('Error polling session status:', error)
        // Continue polling unless there's a critical error
        if (error.response?.status === 404) {
          clearInterval(pollInterval)
          setChatStatus('idle')
          setShowChat(false)
          toast.error('Session not found')
        }
      }
    }, 3000) // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      if (chatStatus === 'pending') {
        toast.warning('Expert did not respond. Please try again later.')
        setChatStatus('idle')
        setShowChat(false)
      }
    }, 300000) // 5 minutes
  }

  const loadChatHistory = async () => {
    if (!userData?._id) return
    
    setLoadingHistory(true)
    try {
      const response = await axios.get(`${backendUrl}/api/chat/user-history/${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { expertId }
      })
      
      if (response.data.success) {
        setChatHistory(response.data.sessions || [])
      } else {
        setChatHistory([])
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      setChatHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (showChatHistory) {
      loadChatHistory()
    }
  }, [showChatHistory, userData?._id, expertId])

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
          className={`text-white text-sm font-light px-14 py-3 rounded-full disabled:bg-gray-400 disabled:cursor-not-allowed ${
            chatStatus === 'pending' ? 'bg-yellow-500' : 
            chatStatus === 'active' && showChat ? 'bg-red-500' : 'bg-primary'
          }`}
          onClick={handleStartChat}
          disabled={isCreatingSession || !userData}
        >
          {isCreatingSession ? 'Starting...' : 
           chatStatus === 'pending' ? 'Waiting for Expert...' :
           chatStatus === 'active' && showChat ? 'Close Chat' : 'Live Chat'}
        </button>
      </div>

      {/* Show Chat Component */}
      {showChat && userId && (
        <div className='mt-8 mx-4 sm:mx-0 sm:ml-72 sm:pl-4'>
          <div className="flex gap-4">
            {/* Main Chat Panel */}
            <div className={`${showChatHistory ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className='text-lg font-semibold text-gray-800'>Live Chat</h2>
                
                {/* Chat History Toggle */}
                <button
                  onClick={() => setShowChatHistory(!showChatHistory)}
                  className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                  title="Toggle Chat History"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </button>
              </div>
              
              {chatStatus === 'pending' && (
                <div className='bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4'>
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600'></div>
                    <p className='text-yellow-800'>Waiting for expert to accept your chat request...</p>
                  </div>
                  <p className='text-yellow-600 text-sm mt-2'>You'll be notified when the expert joins the chat.</p>
                </div>
              )}
              
              {chatStatus === 'active' && (
                <>
                  <div className='bg-green-50 border border-green-200 p-2 rounded-lg mb-4'>
                    <p className='text-green-800 text-sm'>✅ Expert accepted your chat! You can now start messaging.</p>
                  </div>
                  <div className='text-xs text-gray-500 mb-2'>
                    Room ID: {roomId} | Session ID: {sessionInfo?._id || 'Creating...'}
                  </div>
                  <Chat 
                    roomId={roomId}
                    senderId={userId} 
                    senderType="user"
                    sessionId={sessionInfo?._id || roomId}
                    expertId={expertId}
                    userId={userId}
                    expertName={expertInfo.name}
                  />
                </>
              )}
            </div>
            
            {/* Chat History Sidebar */}
            {showChatHistory && (
              <div className="w-1/3 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Previous Chats</h3>
                  <button
                    onClick={() => setShowChatHistory(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {loadingHistory ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading history...</p>
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No previous chats with this expert</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatHistory.map((historySession, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {new Date(historySession.date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {historySession.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          Messages: {historySession.messageCount || 0}
                        </div>
                        {historySession.recentMessages && historySession.recentMessages.length > 0 && (
                          <div className="border-t pt-2">
                            <p className="text-xs text-gray-500 mb-1">Recent:</p>
                            {historySession.recentMessages.slice(0, 2).map((msg, msgIdx) => (
                              <div key={msgIdx} className="text-xs text-gray-600 truncate">
                                <span className="font-medium">
                                  {msg.senderType === 'user' ? 'You' : 'Expert'}:
                                </span> {msg.content}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
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
