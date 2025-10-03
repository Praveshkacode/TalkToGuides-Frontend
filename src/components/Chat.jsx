import React, { useState, useEffect, useRef, useContext } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import { AppContext } from '../context/AppContext'

// Create socket instance outside component to avoid multiple connections
let socket = null

const Chat = ({ roomId, senderId, senderType = 'user', sessionId, expertId, userId, expertName }) => {
  const { backendUrl } = useContext(AppContext)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const currentRoomRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    if (!socket) {
      socket = io(backendUrl || 'http://localhost:4000', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })
    }

    // Check if already connected
    if (socket.connected) {
      setIsConnected(true)
      console.log('Socket already connected')
    }

    return () => {
      // Don't disconnect socket when component unmounts
      // Let it stay connected for other components
    }
  }, [])

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load previous messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        if (!token) {
          setError('No authentication token found. Please login again.')
          setLoading(false)
          return
        }

        console.log('Loading messages for room:', roomId, 'session:', sessionId)
        
        const response = await axios.get(`${backendUrl}/api/chat/messages`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            sessionId: sessionId || roomId,
            roomId,
            page: 1,
            limit: 50
          }
        })

        console.log('Messages response:', response.data)

        if (response.data.success) {
          setMessages(response.data.messages)
        } else {
          setError(response.data.message || 'Failed to load messages')
        }
      } catch (error) {
        console.error('Error loading messages:', error.response || error)
        if (error.response?.status === 401) {
          setError('Authentication failed. Please login again.')
        } else if (error.response?.status === 404) {
          setError('No messages found for this session.')
        } else {
          setError('Failed to load messages: ' + (error.response?.data?.message || error.message))
        }
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      loadMessages()
    }
  }, [roomId, sessionId])

  // Socket connection handling with proper room management
  useEffect(() => {
    if (!roomId || !socket) return

    console.log('Frontend connecting to socket for room:', roomId, 'senderId:', senderId)

    // Leave previous room if different
    if (currentRoomRef.current && currentRoomRef.current !== roomId) {
      console.log('Frontend leaving previous room:', currentRoomRef.current)
      socket.emit('leave_room', currentRoomRef.current)
    }

    // Join new room
    console.log('Frontend joining room:', roomId)
    socket.emit('join_room', roomId)
    currentRoomRef.current = roomId

    // Connection status handlers
    const handleConnect = () => {
      console.log('Frontend socket connected successfully')
      setIsConnected(true)
      setError(null)
    }

    const handleDisconnect = () => {
      console.log('Frontend socket disconnected')
      setIsConnected(false)
    }

    const handleConnectError = () => {
      console.log('Frontend socket connection error')
      setError('Connection failed. Trying to reconnect...')
      setIsConnected(false)
    }

    const handleReceiveMessage = (data) => {
      console.log('Frontend received message:', data, 'for room:', roomId)
      // Only show messages for current room
      if (data.roomId === roomId) {
        setMessages(prev => {
          // Avoid duplicate messages
          const exists = prev.find(msg => msg._id === data._id)
          if (exists) return prev
          return [...prev, data]
        })
      }
    }

    const handleUserTyping = (data) => {
      console.log('Frontend typing indicator:', data)
      // Only show typing for current room
      if (data.roomId === roomId && data.userId !== senderId) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(id => id !== data.userId), data.userId]
          } else {
            return prev.filter(id => id !== data.userId)
          }
        })
      }
    }

    const handleMessageRead = (data) => {
      // Only update read status for current room
      if (data.roomId === roomId) {
        setMessages(prev => prev.map(msg => 
          msg.senderId !== data.readerId ? { ...msg, isRead: true } : msg
        ))
      }
    }

    const handleMessageError = (data) => {
      console.error('Frontend message error:', data)
      setError(data.error)
    }

    const handleJoinSuccess = (data) => {
      console.log('Frontend successfully joined room:', data)
      setError(null)
    }

    const handleJoinError = (data) => {
      console.error('Frontend failed to join room:', data)
      setError('Failed to join chat room: ' + data.error)
    }

    // Add event listeners
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('receive_message', handleReceiveMessage)
    socket.on('user_typing', handleUserTyping)
    socket.on('message_read', handleMessageRead)
    socket.on('message_error', handleMessageError)
    socket.on('join_success', handleJoinSuccess)
    socket.on('join_error', handleJoinError)

    // Check current connection status
    if (socket.connected) {
      setIsConnected(true)
    }

    return () => {
      // Remove event listeners
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('receive_message', handleReceiveMessage)
      socket.off('user_typing', handleUserTyping)
      socket.off('message_read', handleMessageRead)
      socket.off('message_error', handleMessageError)
      socket.off('join_success', handleJoinSuccess)
      socket.off('join_error', handleJoinError)
    }
  }, [roomId, senderId])

  // Cleanup when component unmounts or room changes
  useEffect(() => {
    return () => {
      // Leave room when component unmounts
      if (socket && currentRoomRef.current) {
        console.log('Leaving room on unmount:', currentRoomRef.current)
        socket.emit('leave_room', currentRoomRef.current)
        currentRoomRef.current = null
      }
    }
  }, [])

  // Typing indicator
  const handleTyping = () => {
    if (!isTyping && socket) {
      setIsTyping(true)
      socket.emit('typing_start', { roomId, senderId })
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (socket) {
        socket.emit('typing_stop', { roomId, senderId })
      }
    }, 1000)
  }

  const sendMessage = async () => {
    if (!message.trim()) {
      console.log('Message is empty, not sending')
      return
    }

    if (!socket) {
      setError('Socket connection not available')
      return
    }

    if (!isConnected) {
      console.log('Socket not connected, attempting to send anyway')
    }

    const msgData = {
      roomId,
      sessionId: sessionId || roomId,
      senderId,
      senderType,
      content: message.trim(),
      timestamp: new Date(),
      userId,
      expertId
    }

    console.log('Frontend sending message:', msgData)
    
    try {
      socket.emit('send_message', msgData)
      setMessage('')
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false)
        socket.emit('typing_stop', { roomId, senderId })
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to send message')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    } else {
      handleTyping()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg bg-white">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-300 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-gray-900">
              {expertName ? `Chat with ${expertName}` : 'Live Chat'}
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-500">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={msg._id || idx}
            className={`flex ${msg.senderId === senderId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                msg.senderId === senderId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm">{msg.content}</div>
              <div className={`text-xs mt-1 ${
                msg.senderId === senderId ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(msg.timestamp)}
                {msg.senderId === senderId && (
                  <span className="ml-2">
                    {msg.isRead ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
              <div className="text-sm text-gray-500 italic">
                {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people typing...'}
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-300 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={false} // Allow typing even if not connected
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()} // Only disable if message is empty
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
