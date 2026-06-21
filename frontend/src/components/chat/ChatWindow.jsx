import { useEffect, useRef } from 'react'
import { deleteMessage } from '../../services/api'
import toast from 'react-hot-toast'

const ChatWindow = ({ messages, setMessages, activeRoom, activeDM, user, onDeleteGroup }) => {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const chatTitle = activeRoom ? activeRoom.name : activeDM ? activeDM.username : 'Select a chat'
  const chatSubtitle = activeRoom?.members ? activeRoom.members.map((m) => m.username).join(', ') : null

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id)
      setMessages((prev) => prev.filter((msg) => msg._id !== id))
      toast.success('Message deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete')
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#E5E4E2] relative">

      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#1C2541 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between bg-[#1C2541] shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFA630] to-[#1C2541] flex items-center justify-center text-[#E5E4E2] font-bold shrink-0">
            {activeRoom ? '#' : activeDM?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-[#E5E4E2] font-semibold text-sm">{chatTitle}</h2>
            {chatSubtitle && (
              <p className="text-[#E5E4E2]/40 text-xs truncate max-w-[260px]">{chatSubtitle}</p>
            )}
          </div>
        </div>

        {activeRoom && (
          <button
            onClick={onDeleteGroup}
            className="text-[#E5E4E2]/50 hover:text-red-400 text-xs font-medium transition-colors"
          >
            Delete Group
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1.5 z-10">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-[#1C2541]/30 text-sm">No messages yet — say hi 👋</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMine = msg.sender?._id === user?.id || msg.sender === user?.id
          const prevMsg = messages[index - 1]
          const isFirstInGroup = !prevMsg || (prevMsg.sender?._id || prevMsg.sender) !== (msg.sender?._id || msg.sender)

          return (
            <div
              key={index}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} group ${isFirstInGroup ? 'mt-3' : ''}`}
            >
              <div className={`relative max-w-[65%] px-3.5 py-2 shadow-sm ${
                isMine
                  ? 'bg-[#FFA630] text-[#0D0D0D] rounded-2xl rounded-tr-sm'
                  : 'bg-white text-[#1C2541] rounded-2xl rounded-tl-sm'
              }`}>
                {!isMine && isFirstInGroup && (
                  <p className="text-xs text-[#FFA630] mb-0.5 font-semibold">
                    {msg.sender?.username}
                  </p>
                )}

                {msg.fileUrl && msg.fileType?.startsWith('image') && (
                  <img src={msg.fileUrl} alt="shared" className="rounded-lg mb-1.5 max-w-full" />
                )}

                {msg.content && <p className="text-sm break-words leading-relaxed">{msg.content}</p>}

                <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-[#0D0D0D]/50' : 'text-[#1C2541]/40'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                {isMine && (
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[#1C2541]/50 hover:text-red-600 text-xs transition-opacity"
                    title="Delete message"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default ChatWindow