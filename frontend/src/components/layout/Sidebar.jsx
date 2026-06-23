import { useState, useEffect } from 'react'
import { getRooms, createRoom, getAllUsers } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import toast from 'react-hot-toast'

const Sidebar = ({ activeRoom, setActiveRoom, activeDM, setActiveDM }) => {
  const [rooms, setRooms] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const { user, logoutUser } = useAuth()
  const { onlineUsers, socket } = useSocket()

  useEffect(() => {
  fetchRooms()
  fetchUsers()

  socket?.on('groupDeleted', () => fetchRooms())
  socket?.on('newGroup', () => fetchRooms())

  return () => {
    socket?.off('groupDeleted')
    socket?.off('newGroup')
  }
}, [socket])

  const fetchRooms = async () => {
    try {
      const { data } = await getRooms()
      setRooms(data)
    } catch (error) { console.log(error) }
  }

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers()
      setUsers(data)
    } catch (error) { console.log(error) }
  }

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleCreateRoom = async (e) => {
  e.preventDefault()
  if (!roomName.trim()) return
  try {
    const { data } = await createRoom({ name: roomName, memberIds: selectedMembers })
    toast.success('Group created')
    setRoomName('')
    setSelectedMembers([])
    setShowCreateRoom(false)
    fetchRooms()
    socket?.emit('newGroup', data)
  } catch (error) {
    toast.error('Failed to create group')
  }
}

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="w-[340px] h-screen flex flex-col bg-[#1C2541] border-r border-black/30">

      {/* Header */}
      <div className="px-4 py-4 flex justify-between items-center bg-[#161f38]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFA630] to-[#c97c1f] flex items-center justify-center text-[#0D0D0D] font-bold shadow-md">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <p className="text-[#E5E4E2] font-semibold text-sm">{user?.username}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateRoom(!showCreateRoom)}
            className="text-[#E5E4E2]/70 hover:text-[#FFA630] transition-colors text-lg leading-none"
            title="New group"
          >
            +
          </button>
          <button
            onClick={logoutUser}
            className="text-[#E5E4E2]/50 hover:text-[#FFA630] text-xs font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 bg-[#1C2541]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats..."
          className="w-full bg-[#0D0D0D]/50 text-[#E5E4E2] text-sm rounded-full px-4 py-2 border border-white/5 focus:outline-none focus:ring-1 focus:ring-[#FFA630]/50 placeholder:text-[#E5E4E2]/30"
        />
      </div>

      {showCreateRoom && (
        <form onSubmit={handleCreateRoom} className="px-3 pb-3 space-y-2 bg-[#1C2541]">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Group name"
            className="w-full bg-[#0D0D0D]/60 text-[#E5E4E2] text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FFA630]/50 placeholder:text-[#E5E4E2]/30"
          />
          <div className="bg-[#0D0D0D]/60 rounded-lg p-2 max-h-32 overflow-y-auto border border-white/10">
            {users.map((u) => (
              <label key={u._id} className="flex items-center gap-2 py-1.5 px-1 cursor-pointer hover:bg-white/5 rounded-md">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(u._id)}
                  onChange={() => toggleMember(u._id)}
                  className="accent-[#FFA630]"
                />
                <span className="text-[#E5E4E2] text-sm">{u.username}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-[#FFA630] hover:bg-[#e89525] text-[#0D0D0D] text-sm font-semibold py-2 rounded-lg shadow-md shadow-[#FFA630]/20"
          >
            Create Group
          </button>
        </form>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto bg-[#1C2541]">

        {filteredRooms.map((room) => {
          const isActive = activeRoom?._id === room._id
          return (
            <div
              key={room._id}
              onClick={() => { setActiveRoom(room); setActiveDM(null) }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-black/20 transition-colors ${
                isActive ? 'bg-[#FFA630]/15' : 'hover:bg-white/5'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D0D0D] to-[#2a3a63] border border-[#FFA630]/30 flex items-center justify-center text-[#FFA630] font-bold shrink-0">
                #
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-[#E5E4E2] font-medium text-sm truncate">{room.name}</p>
                </div>
                <p className="text-[#E5E4E2]/40 text-xs truncate">
                  {room.members?.length || 1} members
                </p>
              </div>
            </div>
          )
        })}

        {filteredUsers.map((u) => {
          const isActive = activeDM?._id === u._id
          const isOnline = onlineUsers.includes(u._id)
          return (
            <div
              key={u._id}
              onClick={() => { setActiveDM(u); setActiveRoom(null) }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-black/20 transition-colors ${
                isActive ? 'bg-[#FFA630]/15' : 'hover:bg-white/5'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFA630]/90 to-[#1C2541] flex items-center justify-center text-[#E5E4E2] font-bold">
                  {u.username[0].toUpperCase()}
                </div>
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#1C2541]"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#E5E4E2] font-medium text-sm truncate">{u.username}</p>
                <p className={`text-xs truncate ${isOnline ? 'text-emerald-400/80' : 'text-[#E5E4E2]/40'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Sidebar