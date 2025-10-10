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
  const [filePreview, setFilePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [chatPreference, setChatPreference] = useState('continue')
  const [showPreferenceMenu, setShowPreferenceMenu] = useState(false)
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
            limit: 50,
            historyPreference: chatPreference
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
  }, [roomId, sessionId, chatPreference])

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreview({
            type: 'image',
            url: e.target.result,
            name: file.name,
            size: file.size
          })
        }
        reader.readAsDataURL(file)
      } else {
        // For non-image files, show file info
        setFilePreview({
          type: 'file',
          name: file.name,
          size: file.size,
          extension: file.name.split('.').pop()?.toLowerCase() || 'file'
        })
      }
    }
  }

  const uploadImage = async () => {
    if (!selectedFile) return
    
    setUploadingFile(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('sessionId', sessionId || roomId)
      formData.append('roomId', roomId)
      formData.append('senderId', senderId)
      formData.append('senderType', senderType)
      formData.append('userId', userId)
      formData.append('expertId', expertId)
      
      const token = localStorage.getItem('token')
      const response = await axios.post(`${backendUrl}/api/chat/upload-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.data.success) {
        // Broadcast the file message via socket
        const fileMessage = {
          roomId,
          sessionId: sessionId || roomId,
          senderId,
          senderType,
          content: response.data.data.content,
          messageType: response.data.data.messageType,
          fileUrl: response.data.data.fileUrl,
          fileName: response.data.data.fileName,
          fileSize: response.data.data.fileSize,
          fileType: response.data.data.fileType,
          timestamp: response.data.data.timestamp,
          userId,
          expertId,
          _id: response.data.data._id
        }
        
        if (socket) {
          socket.emit('send_message', fileMessage)
        }
        
        // Clear preview
        setFilePreview(null)
        setSelectedFile(null)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setError('Failed to upload file: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploadingFile(false)
    }
  }

  const cancelImageUpload = () => {
    setFilePreview(null)
    setSelectedFile(null)
  }

  const handleChatPreferenceChange = async (preference) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${backendUrl}/api/chat/set-preference`, {
        sessionId: sessionId || roomId,
        preference
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setChatPreference(preference)
      setShowPreferenceMenu(false)
      
      // Reload messages with new preference
      window.location.reload()
    } catch (error) {
      console.error('Error setting chat preference:', error)
      setError('Failed to update chat preference')
    }
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
          
          {/* Chat History Preference Menu */}
          <div className="relative">
            <button
              onClick={() => setShowPreferenceMenu(!showPreferenceMenu)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded"
              title="Chat History Options"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" 
                />
              </svg>
            </button>
            
            {showPreferenceMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Chat History Options</div>
                  
                  <button
                    onClick={() => handleChatPreferenceChange('continue')}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                      chatPreference === 'continue' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    📝 Continue Previous Chat
                    <div className="text-xs text-gray-500">Show all previous messages</div>
                  </button>
                  
                  <button
                    onClick={() => handleChatPreferenceChange('fresh')}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                      chatPreference === 'fresh' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    🆕 Start Fresh
                    <div className="text-xs text-gray-500">Begin a new conversation</div>
                  </button>
                  
                  <button
                    onClick={() => handleChatPreferenceChange('summary')}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                      chatPreference === 'summary' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    📄 Show Summary
                    <div className="text-xs text-gray-500">Recent context + new messages</div>
                  </button>
                </div>
              </div>
            )}
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
              {msg.messageType === 'image' ? (
                <div className="space-y-2">
                  <img 
                    src={msg.fileUrl} 
                    alt={msg.fileName || 'Shared image'}
                    className="max-w-full h-auto rounded cursor-pointer"
                    onClick={() => window.open(msg.fileUrl, '_blank')}
                    style={{ maxHeight: '200px' }}
                  />
                  <div className="text-xs opacity-75">{msg.fileName}</div>
                </div>
              ) : msg.messageType === 'file' ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{msg.fileName}</div>
                      <div className="text-xs opacity-75">
                        {msg.fileSize && (msg.fileSize / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Try different download approaches
                      const fileName = msg.fileName || 'download';
                      
                      // Method 1: Direct download with filename
                      const link = document.createElement('a');
                      link.href = msg.fileUrl;
                      link.download = fileName;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      // Method 2: Fallback - open in new tab after a short delay
                      setTimeout(() => {
                        if (!document.hidden) { // If download didn't work, page is still active
                          window.open(msg.fileUrl, '_blank');
                        }
                      }, 1000);
                    }}
                    className="text-xs underline hover:no-underline cursor-pointer"
                  >
                    📥 Download File
                  </button>
                </div>
              ) : (
                <div className="text-sm">{msg.content}</div>
              )}
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
        {/* File Preview */}
        {filePreview && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start space-x-3">
              {filePreview.type === 'image' ? (
                <img 
                  src={filePreview.url} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 rounded flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{filePreview.name}</p>
                <p className="text-xs text-gray-500">
                  {filePreview.size && (filePreview.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {filePreview.type === 'file' && (
                  <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mt-1">
                    {filePreview.extension.toUpperCase()}
                  </span>
                )}
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={uploadImage}
                    disabled={uploadingFile}
                    className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    {uploadingFile ? 'Uploading...' : `Send ${filePreview.type === 'image' ? 'Image' : 'File'}`}
                  </button>
                  <button
                    onClick={cancelImageUpload}
                    disabled={uploadingFile}
                    className="bg-gray-500 text-white px-3 py-1 text-xs rounded hover:bg-gray-600 disabled:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {/* File Upload Button */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="*/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={uploadingFile}
            />
            <div className={`p-2 rounded-lg transition-colors ${
              uploadingFile 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
                />
              </svg>
            </div>
          </label>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={uploadingFile}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || uploadingFile}
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
