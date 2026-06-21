import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { getRoomMessages, getPrivateMessages, sendMessage as sendMessageAPI, deleteRoom } from '../services/api'
import Sidebar from '../components/layout/Sidebar'
import ChatWindow from '../components/chat/ChatWindow'
import MessageInput from '../components/chat/MessageInput'
import toast from 'react-hot-toast'

const Chat = () => {
  const [activeRoom, setActiveRoom] = useState(null)
  const [activeDM, setActiveDM] = useState(null)
  const [messages, setMessages] = useState([])
  const { user } = useAuth()
  const { socket } = useSocket()

  useEffect(() => {
    if (activeRoom) {
      fetchRoomMessages()
      socket?.emit('joinRoom', activeRoom._id)
    } else if (activeDM) {
      fetchPrivateMessages()
    }
  }, [activeRoom, activeDM])

  const fetchRoomMessages = async () => {
    try {
      const { data } = await getRoomMessages(activeRoom._id)
      setMessages(data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchPrivateMessages = async () => {
    try {
      const { data } = await getPrivateMessages(activeDM._id)
      setMessages(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!socket) return

    socket.on('receiveMessage', (message) => {
      if (activeRoom && message.room === activeRoom._id) {
        setMessages((prev) => [...prev, message])
      }
    })

    socket.on('receivePrivateMessage', (message) => {
      if (activeDM && (message.sender._id === activeDM._id || message.sender === activeDM._id)) {
        setMessages((prev) => [...prev, message])
      }
    })

    socket.on('roomDeleted', (roomId) => {
      if (activeRoom?._id === roomId) {
        setActiveRoom(null)
        setMessages([])
        toast.error('This group was deleted by admin')
      }
    })

    return () => {
      socket.off('receiveMessage')
      socket.off('receivePrivateMessage')
      socket.off('roomDeleted')
    }
  }, [socket, activeRoom, activeDM])

  const handleSendMessage = async ({ content, fileUrl, fileType }) => {
  try {
    const { data } = await sendMessageAPI({
      content,
      fileUrl,
      fileType,
      roomId: activeRoom?._id,
      receiverId: activeDM?._id
    })

    if (activeRoom) {
      socket?.emit('sendMessage', data)
    } else if (activeDM) {
      setMessages((prev) => [...prev, data])
      socket?.emit('sendPrivateMessage', { ...data, receiver: activeDM._id })
    }
  } catch (error) {
    console.log(error)
  }
}

  const handleTyping = () => {
    if (activeRoom) {
      socket?.emit('typing', { roomId: activeRoom._id, username: user.username })
    }
  }

  const handleStopTyping = () => {
    if (activeRoom) {
      socket?.emit('stopTyping', activeRoom._id)
    }
  }

  const handleDeleteGroup = async () => {
    if (!window.confirm(`Delete "${activeRoom.name}" permanently? This cannot be undone.`)) return

    try {
      await deleteRoom(activeRoom._id)
      socket?.emit('groupDeleted', activeRoom._id)
      toast.success('Group deleted')
      setActiveRoom(null)
      setMessages([])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete group')
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        activeRoom={activeRoom}
        setActiveRoom={setActiveRoom}
        activeDM={activeDM}
        setActiveDM={setActiveDM}
      />

      {activeRoom || activeDM ? (
        <div className="flex-1 flex flex-col">
          <ChatWindow 
            messages={messages}
            setMessages={setMessages}
            activeRoom={activeRoom}
            activeDM={activeDM}
            user={user}
            onDeleteGroup={handleDeleteGroup}
          />
          <MessageInput 
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-900">
          <p className="text-gray-500 text-lg">Select a Group or user to start chatting 💬</p>
        </div>
      )}
    </div>
  )
}

export default Chat