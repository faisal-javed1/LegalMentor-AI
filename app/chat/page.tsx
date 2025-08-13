"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Search,
  Trash2,
  LogOut,
  Sun,
  Moon,
  UploadCloud,
  Menu,
  X,
  Edit3,
  Check,
  Copy,
  MoreVertical,
  Clock,
  CheckCheck,
  Pin,
  Star,
  Scale,
  FileText,
  Briefcase,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { dataService, type ChatSession, type ChatMessage } from "@/lib/data-service"

const ChatPage = () => {
  console.log("ChatPage component loaded")
  
  /* ─────────────────────────────── state ─────────────────────────────── */
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [showMessageMenu, setShowMessageMenu] = useState(false)

  const { user, logout } = useAuth()
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messageMenuRef = useRef<HTMLDivElement>(null)

  /* ─────────────────────────────── helpers ─────────────────────────────── */
  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString()
  }

  const createSession = useCallback(
    async (title = "New Legal Consultation", category: ChatSession["category"] = "general") => {
      try {
        const newSession = await dataService.createChatSession(title, category)
        setSessions((s) => [newSession, ...s])
        setCurrentSessionId(newSession.id)
        setMessages([]) // Clear messages for new session
        setSidebarOpen(false)
        // Add initial mentor message for new session
        const welcomeMessage: ChatMessage = {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
          text: "Hello! I'm your legal mentor. How can I assist you with your legal matters today?",
          sender: "mentor",
          timestamp: new Date().toISOString(),
          editable: false,
          status: "read" as const,
        }
        setMessages([welcomeMessage])
      } catch (error) {
        console.error("Failed to create chat session:", error)
      }
    },
    [],
  )

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
    setSelectedMessageId(null)
    setShowMessageMenu(false)
  }

  const toggleMessageImportant = async (messageId: string) => {
    try {
      const messageToUpdate = messages.find((m) => m.id === messageId)
      if (!messageToUpdate) return

      const updatedMessage = await dataService.updateChatMessage(messageId, {
        isImportant: !messageToUpdate.isImportant,
      })

      setMessages((prev) => prev.map((m) => (m.id === messageId ? updatedMessage : m)))
    } catch (error) {
      console.error("Failed to update message importance:", error)
    } finally {
      setSelectedMessageId(null)
      setShowMessageMenu(false)
    }
  }

  /* ─────────────────────────────── init ─────────────────────────────── */
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const fetchedSessions = await dataService.getChatSessions()
        console.log("Fetched sessions:", fetchedSessions)
        
        if (fetchedSessions && fetchedSessions.length > 0) {
          setSessions(fetchedSessions)
          const firstSession = fetchedSessions[0]
          setCurrentSessionId(firstSession.id)
          
          try {
            const fetchedMessages = await dataService.getChatHistory(firstSession.id)
            console.log("Fetched messages:", fetchedMessages)
            setMessages(fetchedMessages || [])
          } catch (messageError) {
            console.error("Failed to load chat messages:", messageError)
            setMessages([]) // Set empty array if messages fail to load
          }
        } else {
          console.log("No sessions found, creating new session")
          createSession() // Create a new session if none exist
        }
      } catch (error) {
        console.error("Failed to load chat sessions:", error)
        // If loading fails, still try to create a new session to allow user to start
        createSession()
      }
    }

    if (user) {
      loadSessions()
    }
  }, [user])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [messages, input])

  // Close sidebar and menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar")
      const menuButton = document.getElementById("menu-button")

      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setSidebarOpen(false)
      }

      if (showMessageMenu && messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(false)
        setSelectedMessageId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [sidebarOpen, showMessageMenu])

  /* ────────────────────────────── actions ────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !currentSessionId) return

    const userMsg: ChatMessage = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
      editable: true,
      status: "sent" as const,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Update message status to delivered after a short delay
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === userMsg.id ? { ...m, status: "delivered" as const } : m)))
    }, 1000)

    try {
      const mentorReply = await dataService.sendMessage(currentSessionId, userMsg.text)

      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === userMsg.id ? { ...m, status: "read" as const, id: mentorReply.id } : m))
        return [...updated, mentorReply]
      })

      // Update the session's last message and timestamp
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, lastMessage: mentorReply.text, timestamp: mentorReply.timestamp } : s,
        ),
      )
      setIsTyping(false)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsTyping(false)
      // Optionally, revert user message status to 'failed' or show an error
      setMessages((prev) => prev.map((m) => (m.id === userMsg.id ? { ...m, status: "sent" as const } : m)))
    }
  }

  const startEditingChat = (session: ChatSession) => {
    setEditingChatId(session.id)
    setEditingTitle(session.title)
  }

  const saveEditingChat = async () => {
    if (editingTitle.trim() && editingChatId) {
      try {
        const updatedSession = await dataService.updateChatSession(editingChatId, { title: editingTitle.trim() })
        setSessions((prev) => prev.map((s) => (s.id === editingChatId ? updatedSession : s)))
      } catch (error) {
        console.error("Failed to save chat title:", error)
      }
    }
    setEditingChatId(null)
    setEditingTitle("")
  }

  const cancelEditingChat = () => {
    setEditingChatId(null)
    setEditingTitle("")
  }

  const deleteSession = async (id: string) => {
    try {
      await dataService.deleteChatSession(id)
      const remaining = sessions.filter((s) => s.id !== id)
      setSessions(remaining)
      if (currentSessionId === id) {
        if (remaining.length) {
          setCurrentSessionId(remaining[0].id)
          const fetchedMessages = await dataService.getChatHistory(remaining[0].id)
          setMessages(fetchedMessages)
        } else {
          createSession()
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error)
    }
  }

  const togglePinSession = async (id: string) => {
    try {
      const sessionToUpdate = sessions.find((s) => s.id === id)
      if (!sessionToUpdate) return

      const updatedSession = await dataService.updateChatSession(id, { isPinned: !sessionToUpdate.isPinned })
      setSessions((prev) => prev.map((s) => (s.id === id ? updatedSession : s)))
    } catch (error) {
      console.error("Failed to toggle pin session:", error)
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target?.result as string
      const msg: ChatMessage = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: `📎 Document uploaded: ${file.name}\n\n${content.substring(0, 500)}${content.length > 500 ? "..." : ""}`,
        sender: "user",
        timestamp: new Date().toISOString(),
        editable: true,
        status: "sent" as const,
      }
      setMessages((m) => [...m, msg])
    }
    reader.readAsText(file)
  }

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  const selectSession = async (session: ChatSession) => {
    setCurrentSessionId(session.id)
    try {
      const fetchedMessages = await dataService.getChatHistory(session.id)
      setMessages(fetchedMessages)
    } catch (error) {
      console.error("Failed to load session messages:", error)
      setMessages([])
    }
    setSidebarOpen(false)
  }

  const getCategoryIcon = (category: ChatSession["category"]) => {
    switch (category) {
      case "case":
        return <Scale className="w-4 h-4" />
      case "consultation":
        return <MessageSquare className="w-4 h-4" />
      case "document":
        return <FileText className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: ChatSession["category"]) => {
    switch (category) {
      case "case":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "consultation":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "document":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Debug logging for key issues
  useEffect(() => {
    if (messages.length > 0) {
      const messageIds = messages.map(m => m.id)
      const uniqueIds = new Set(messageIds)
      if (messageIds.length !== uniqueIds.size) {
        console.warn('Duplicate message IDs detected:', messageIds)
      }
    }
  }, [messages])

  /* ─────────────────────────────── render ─────────────────────────────── */
  return (
    <ProtectedRoute allowedRoles={["client", "lawyer"]}>
      <div className={`${theme === "dark" ? "dark" : ""}`}>
        <div className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-black dark:text-gray-200 relative overflow-hidden">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ────────────── sidebar ────────────── */}
          <aside
            id="sidebar"
            className={`
              fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
              w-80 max-w-[90vw] sm:max-w-[85vw] lg:max-w-full
              transform transition-all duration-300 ease-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              bg-white/98 dark:bg-gray-900/95 backdrop-blur-xl
              border-r border-gray-200 dark:border-gray-700
              flex flex-col shadow-2xl lg:shadow-none
            `}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-slate-100 via-gray-100 to-slate-200 dark:from-slate-800 dark:via-gray-800 dark:to-slate-900 text-gray-900 dark:text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-200/80 dark:bg-white/10 rounded-xl backdrop-blur-sm border border-slate-300/50 dark:border-white/20 shadow-sm">
                    <Scale className="w-6 h-6 text-slate-700 dark:text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Legal Mentor</h2>
                    <p className="text-slate-600 dark:text-blue-100 text-sm font-medium">Professional Guidance</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => createSession()}
                className="w-full bg-slate-200/60 hover:bg-slate-300/70 dark:bg-slate-700/80 dark:hover:bg-slate-600/90 backdrop-blur-sm border border-slate-300/60 dark:border-white/10 text-gray-900 dark:text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                New Consultation
              </button>
            </div>

            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full bg-gray-100 dark:bg-gray-800 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all duration-200 border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-2">
              {filtered.map((s, index) => (
                <div
                  key={`${s.id}_${index}`}
                  className={`group relative mx-2 mb-2 rounded-xl transition-all duration-200 ${
                    currentSessionId === s.id
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 shadow-sm"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent"
                  }`}
                >
                  {editingChatId === s.id ? (
                    <div className="p-3">
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-sm font-medium"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditingChat()
                          if (e.key === "Escape") cancelEditingChat()
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={saveEditingChat}
                          className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditingChat}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-3 cursor-pointer"
                      onClick={() => selectSession(s)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm truncate">{s.title}</h3>
                            {s.isPinned && <Pin className="w-3 h-3 text-blue-500" />}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {s.lastMessage}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">{formatTime(s.timestamp)}</span>
                            {s.category && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(s.category)}`}>
                                {s.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditingChat(s)
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePinSession(s.id)
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSession(s.id)
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* ────────────── main ────────────── */}
          <main className="flex-1 flex flex-col relative">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <button
                  id="menu-button"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {sessions.find((s) => s.id === currentSessionId)?.title || "Legal Mentor"}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI-powered legal assistance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFile}
                    className="hidden"
                  />
                  <UploadCloud className="w-5 h-5 hover:text-blue-600 transition-colors" />
                </label>
              </div>
            </header>

            {/* Messages */}
            <section className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, index) => (
                <div
                  key={`${m.id}_${index}`}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="relative group">
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        m.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                      }`}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setSelectedMessageId(m.id)
                        setShowMessageMenu(true)
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs opacity-70">{formatTime(m.timestamp)}</span>
                            {m.sender === "user" && (
                              <div className="flex items-center gap-1">
                                {m.status === "sent" && <Check className="w-3 h-3" />}
                                {m.status === "delivered" && <CheckCheck className="w-3 h-3" />}
                                {m.status === "read" && <CheckCheck className="w-3 h-3 text-blue-500" />}
                              </div>
                            )}
                          </div>
                        </div>
                        {m.isImportant && (
                          <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center border border-slate-300/60 dark:border-slate-500/30 shadow-sm">
                      <Scale className="h-4 w-4 text-slate-700 dark:text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm lg:text-base shadow-sm">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">Legal mentor is analyzing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </section>

            {/* Message Context Menu */}
            {showMessageMenu && selectedMessageId && (
              <div
                ref={messageMenuRef}
                className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-2 min-w-[160px]"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <button
                  onClick={() => copyMessage(messages.find((m) => m.id === selectedMessageId)?.text || "")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copy Message
                </button>
                <button
                  onClick={() => toggleMessageImportant(selectedMessageId)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                >
                  <Star className="w-4 h-4" />
                  {messages.find((m) => m.id === selectedMessageId)?.isImportant ? "Remove Star" : "Add Star"}
                </button>
              </div>
            )}

            {/* input */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-200 dark:border-gray-700 p-4 lg:p-6 bg-gray-50/80 dark:bg-gray-900/95 backdrop-blur-sm"
            >
              <div className="flex items-end gap-3 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    placeholder="Describe your legal question or concern..."
                    className="w-full resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 max-h-32 text-sm lg:text-base transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 overflow-hidden"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 lg:px-5 py-3.5 rounded-2xl flex items-center gap-2 disabled:opacity-50 shrink-0 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl active:scale-95 min-w-[60px] justify-center"
                >
                  <span className="hidden sm:inline">Send</span>
                  <span className="sm:hidden text-lg">→</span>
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default ChatPage
