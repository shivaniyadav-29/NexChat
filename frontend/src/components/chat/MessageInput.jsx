import { useState, useRef } from 'react'
import { uploadFile } from '../../services/api'
import toast from 'react-hot-toast'

const MessageInput = ({ onSendMessage, onTyping, onStopTyping }) => {
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    setText(e.target.value)
    onTyping()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSendMessage({ content: text })
    setText('')
    onStopTyping()
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await uploadFile(formData)
      onSendMessage({ content: '', fileUrl: data.fileUrl, fileType: data.fileType })
      toast.success('File sent')
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 bg-[#1C2541] flex items-center gap-2 shrink-0">

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
      />

      <button
  type="button"
  onClick={() => fileInputRef.current.click()}
  disabled={uploading}
  className="w-9 h-9 flex items-center justify-center rounded-full text-[#E5E4E2]/60 hover:text-[#FFA630] hover:bg-white/5 text-2xl shrink-0 transition-colors disabled:opacity-50"
  title="Attach file"
>
  {uploading ? '⏳' : '📎'}
</button>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        onBlur={onStopTyping}
        placeholder="Type a message"
        className="flex-1 bg-[#0D0D0D]/50 text-[#E5E4E2] rounded-full px-4 py-2.5 text-sm border border-white/5 focus:outline-none focus:ring-1 focus:ring-[#FFA630]/50 placeholder:text-[#E5E4E2]/30"
      />

      <button
        type="submit"
        disabled={!text.trim()}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFA630] hover:bg-[#e89525] disabled:opacity-40 disabled:cursor-not-allowed text-[#0D0D0D] transition-colors shrink-0"
      >
        ➤
      </button>
    </form>
  )
}

export default MessageInput