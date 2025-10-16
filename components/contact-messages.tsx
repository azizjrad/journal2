"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pagination } from "@/components/ui/pagination";
import {
  Mail,
  Eye,
  Trash2,
  Search,
  Calendar,
  User,
  MessageSquare,
  Clock,
  CheckCircle,
  ExternalLink,
  Reply,
  Send,
  Paperclip,
  X,
} from "lucide-react";

// Simple toast replacement
const toast = {
  success: (message: string) => console.log("✅", message),
  error: (message: string) => console.error("❌", message),
};

interface ContactMessage {
  _id: string;
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  admin_reply?: string;
  replied_by?: {
    _id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  replied_at?: string;
  created_at: string;
  updated_at: string;
}

interface ContactStats {
  total: number;
  unread: number;
  unreplied: number;
  todayCount: number;
}

export function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    unreplied: 0,
    todayCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [readFilter, setReadFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Reply form states
  const [replyContent, setReplyContent] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [sendingReply, setSendingReply] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const messagesPerPage = 10;

  useEffect(() => {
    fetchMessages();
  }, [currentPage, readFilter, searchTerm]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: messagesPerPage.toString(),
      });

      if (readFilter !== "all") {
        params.append("is_read", readFilter === "read" ? "true" : "false");
      }

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await fetch(`/api/admin/contacts?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setStats(
          data.stats || { total: 0, unread: 0, unreplied: 0, todayCount: 0 }
        );
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          toast.error("Authentication required. Please login as admin.");
        } else if (response.status === 403) {
          toast.error("Admin access required");
        } else {
          toast.error("Failed to fetch messages");
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Error fetching messages");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      setActionLoading(messageId);
      const response = await fetch(`/api/admin/contacts/${messageId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read" }),
      });

      if (response.ok) {
        // Refetch messages to ensure data consistency
        await fetchMessages();
        toast.success("Message marked as read");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Mark as read API error:", {
          status: response.status,
          error: errorData,
        });
        toast.error(
          `Failed to mark message as read: ${
            errorData.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Error marking message as read");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      setActionLoading(messageId);
      const response = await fetch(`/api/admin/contacts/${messageId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Refetch messages to ensure data consistency
        await fetchMessages();
        toast.success("Message deleted successfully");
      } else {
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Error deleting message");
    } finally {
      setActionLoading(null);
      setShowDeleteDialog(false);
      setSelectedMessage(null);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    try {
      setSendingReply(true);

      // Process attachments
      const attachmentData = await Promise.all(
        replyAttachments.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          return {
            content: base64,
            filename: file.name,
            type: file.type,
          };
        })
      );

      const response = await fetch(
        `/api/admin/contacts/${selectedMessage.id}/reply`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reply: replyContent.trim(),
            attachments: attachmentData.length > 0 ? attachmentData : undefined,
          }),
        }
      );

      if (response.ok) {
        toast.success("Reply sent successfully!");
        setShowReplyDialog(false);
        setReplyContent("");
        setReplyAttachments([]);
        setSelectedMessage(null);
        await fetchMessages();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Error sending reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReplyAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setReplyAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredMessages = () => {
    let filtered = messages;

    if (activeTab === "unread") {
      filtered = messages.filter((msg) => !msg.is_read);
    } else if (activeTab === "today") {
      const today = new Date().toDateString();
      filtered = messages.filter(
        (msg) => new Date(msg.created_at).toDateString() === today
      );
    }

    return filtered;
  };

  const MessageCard = ({ message }: { message: ContactMessage }) => {
    return (
      <div
        className={`bg-white/10 backdrop-blur-sm border rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg ${
          !message.is_read
            ? "border-blue-400/50 bg-blue-500/10"
            : "border-white/20"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ${
                message.is_read
                  ? "bg-gradient-to-br from-gray-500 to-gray-600"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              }`}
            >
              {message.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white truncate text-lg">
                  {message.name}
                </h3>
                {!message.is_read && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-gray-300 truncate flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {message.email}
              </p>
              <p className="text-lg font-medium text-white mt-2 truncate">
                {message.subject}
              </p>
              <p className="text-gray-400 mt-1 line-clamp-2">
                {message.message}
              </p>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(message.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reply Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedMessage(message);
                setShowReplyDialog(true);
                setReplyContent("");
                setReplyAttachments([]);
              }}
              disabled={actionLoading === message.id}
              className="h-8 px-3 bg-green-600/20 hover:bg-green-600/30 text-green-300 hover:text-white border border-green-500/30 hover:border-green-500/50 backdrop-blur-sm transition-all duration-200 rounded-lg"
            >
              <Reply className="w-3 h-3" />
            </Button>

            {/* View Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedMessage(message);
                setShowViewDialog(true);
                if (!message.is_read) {
                  markAsRead(message.id);
                }
              }}
              disabled={actionLoading === message.id}
              className="h-8 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-500/50 backdrop-blur-sm transition-all duration-200 rounded-lg"
            >
              <Eye className="w-3 h-3" />
            </Button>

            {/* Delete Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedMessage(message);
                setShowDeleteDialog(true);
              }}
              disabled={actionLoading === message.id}
              className="h-8 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-white border border-red-500/30 hover:border-red-500/50 backdrop-blur-sm transition-all duration-200 rounded-lg"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
          <p className="text-gray-300">
            View and manage contact form submissions
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <MessageSquare className="w-4 h-4" />
          {stats.total} total messages
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
              <p className="text-sm font-medium text-gray-300 mb-1">
                Total Messages
              </p>
              <p className="text-sm text-gray-400">All time</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl backdrop-blur-sm">
              <MessageSquare className="h-6 w-6 text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{stats.unread}</p>
              <p className="text-sm font-medium text-gray-300 mb-1">
                Unread Messages
              </p>
              <p className="text-sm text-gray-400">Need attention</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl backdrop-blur-sm">
              <Mail className="h-6 w-6 text-yellow-300" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">
                {stats.todayCount}
              </p>
              <p className="text-sm font-medium text-gray-300 mb-1">
                Today's Messages
              </p>
              <p className="text-sm text-gray-400">Received today</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl backdrop-blur-sm">
              <Calendar className="h-6 w-6 text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">
                {stats.total - stats.unread}
              </p>
              <p className="text-sm font-medium text-gray-300 mb-1">
                Read Messages
              </p>
              <p className="text-sm text-gray-400">Already viewed</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm">
              <CheckCircle className="h-6 w-6 text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger className="w-32 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
              <SelectItem
                value="all"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                All Messages
              </SelectItem>
              <SelectItem
                value="unread"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Unread
              </SelectItem>
              <SelectItem
                value="read"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Read
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-white text-gray-300"
          >
            All Messages
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-white text-gray-300"
          >
            Unread
            {stats.unread > 0 && (
              <Badge className="ml-2 bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                {stats.unread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="today"
            className="data-[state=active]:bg-green-600/20 data-[state=active]:text-white text-gray-300"
          >
            Today
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center shadow-lg">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No messages found</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageCard
                    key={message.id || message._id}
                    message={message}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={messagesPerPage}
                    totalItems={totalCount}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {(() => {
            const unreadMessages = getFilteredMessages();

            if (unreadMessages.length === 0) {
              return (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center shadow-lg">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No unread messages</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {unreadMessages.map((message) => (
                  <MessageCard
                    key={message.id || message._id}
                    message={message}
                  />
                ))}
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {(() => {
            const todayMessages = getFilteredMessages();

            if (todayMessages.length === 0) {
              return (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center shadow-lg">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No messages today</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {todayMessages.map((message) => (
                  <MessageCard
                    key={message.id || message._id}
                    message={message}
                  />
                ))}
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* View Message Dialog */}
      <AlertDialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader className="space-y-4 pb-6">
              <AlertDialogTitle className="text-2xl font-bold text-white">
                Contact Message
              </AlertDialogTitle>
              {selectedMessage && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Name
                      </label>
                      <p className="text-white">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <p className="text-white flex items-center gap-2">
                        {selectedMessage.email}
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Subject
                    </label>
                    <p className="text-white">{selectedMessage.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Message
                    </label>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-2">
                      <p className="text-gray-200 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Received
                    </label>
                    <p className="text-white">
                      {formatDate(selectedMessage.created_at)}
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl">
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative">
            <AlertDialogHeader className="space-y-4 pb-6">
              <AlertDialogTitle className="text-2xl font-bold text-white">
                Delete Message
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-200 text-base leading-relaxed">
                Are you sure you want to delete this message from{" "}
                {selectedMessage?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  selectedMessage && deleteMessage(selectedMessage.id)
                }
                className="h-12 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
              >
                Delete Message
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reply Dialog */}
      <AlertDialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative max-h-[85vh] overflow-y-auto">
            <AlertDialogHeader className="space-y-4 pb-6">
              <AlertDialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Reply className="w-6 h-6" />
                Reply to Contact Message
              </AlertDialogTitle>
              {selectedMessage && (
                <div className="space-y-4">
                  {/* Original Message Info */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-gray-400">From</label>
                        <p className="text-white font-medium">
                          {selectedMessage.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-400">Email</label>
                        <p className="text-white font-medium">
                          {selectedMessage.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-gray-400 text-sm">Subject</label>
                      <p className="text-white font-medium">
                        {selectedMessage.subject}
                      </p>
                    </div>
                    <div className="mt-3">
                      <label className="text-gray-400 text-sm">
                        Original Message
                      </label>
                      <div className="bg-white/5 rounded p-3 mt-1 max-h-32 overflow-y-auto">
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reply Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-white font-medium mb-2 block">
                        Your Reply
                      </label>
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your reply here..."
                        rows={6}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {replyContent.length}/2000 characters
                      </p>
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="text-white font-medium mb-2 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        Attachments (Optional)
                      </label>
                      <div className="space-y-2">
                        {replyAttachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3"
                          >
                            <span className="text-sm text-white truncate flex-1">
                              {file.name}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAttachment(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <label className="cursor-pointer">
                          <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-white/40 transition-colors">
                            <Paperclip className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-300">
                              Click to add attachments
                            </p>
                          </div>
                          <input
                            type="file"
                            multiple
                            onChange={handleAttachmentChange}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel
                className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl"
                disabled={sendingReply}
              >
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={handleSendReply}
                disabled={sendingReply || !replyContent.trim()}
                className="h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
              >
                {sendingReply ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
