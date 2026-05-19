import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Plus, Ticket, Search, Filter, X, MessageSquare, Clock,
  CheckCircle, AlertCircle, ChevronRight, Send, ArrowLeft,
  User, Building2, Mail
} from 'lucide-react';

interface TicketCategory {
  id: string;
  name: string;
  description: string;
  assigned_email: string;
  assigned_department: string;
}

interface TicketItem {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category_id: string;
  status: string;
  priority: string;
  created_by: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  ticket_categories?: TicketCategory;
}

interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: 'Mo', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  in_progress: { label: 'Dang xu ly', color: 'bg-amber-100 text-amber-700', icon: Clock },
  waiting: { label: 'Cho phan hoi', color: 'bg-cyan-100 text-cyan-700', icon: Clock },
  resolved: { label: 'Da giai quyet', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  closed: { label: 'Da dong', color: 'bg-slate-100 text-slate-700', icon: CheckCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Thap', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Trung binh', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Cao', color: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Khan cap', color: 'bg-red-100 text-red-700' },
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [form, setForm] = useState({ subject: '', description: '', category_id: '', priority: 'medium' });

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadTickets(); }, [search, filterStatus, filterPriority]);

  const loadCategories = async () => {
    const { data } = await supabase.from('ticket_categories').select('*').order('name');
    setCategories(data || []);
    if (data && data.length > 0) setForm(f => ({ ...f, category_id: data[0].id }));
  };

  const loadTickets = async () => {
    setLoading(true);
    let query = supabase.from('tickets').select('*, ticket_categories(*)').order('created_at', { ascending: false });
    if (search) query = query.or(`subject.ilike.%${search}%,ticket_number.ilike.%${search}%`);
    if (filterStatus) query = query.eq('status', filterStatus);
    if (filterPriority) query = query.eq('priority', filterPriority);
    const { data, error } = await query;
    if (!error) setTickets(data || []);
    setLoading(false);
  };

  const loadComments = async (ticketId: string) => {
    const { data } = await supabase.from('ticket_comments').select('*').eq('ticket_id', ticketId).order('created_at');
    setComments(data || []);
  };

  const handleCreate = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    await supabase.from('tickets').insert({ ...form, created_by: user?.id });
    setShowCreateModal(false);
    setForm({ subject: '', description: '', category_id: categories[0]?.id || '', priority: 'medium' });
    loadTickets();
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;
    const user = (await supabase.auth.getUser()).data.user;
    await supabase.from('ticket_comments').insert({
      ticket_id: selectedTicket.id,
      author_id: user?.id,
      content: newComment,
    });
    setNewComment('');
    loadComments(selectedTicket.id);
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    const update: any = { status, updated_at: new Date().toISOString() };
    if (status === 'resolved') update.resolved_at = new Date().toISOString();
    await supabase.from('tickets').update(update).eq('id', ticketId);
    loadTickets();
    if (selectedTicket) {
      setSelectedTicket({ ...selectedTicket, status, resolved_at: status === 'resolved' ? new Date().toISOString() : null });
    }
  };

  const openDetail = (ticket: TicketItem) => {
    setSelectedTicket(ticket);
    loadComments(ticket.id);
  };

  const resetForm = () => {
    setForm({ subject: '', description: '', category_id: categories[0]?.id || '', priority: 'medium' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.name || cat?.assigned_department || '';
  };

  // Detail view
  if (selectedTicket) {
    const sConfig = statusConfig[selectedTicket.status] || statusConfig.open;
    const pConfig = priorityConfig[selectedTicket.priority] || priorityConfig.medium;
    const cat = categories.find(c => c.id === selectedTicket.category_id);

    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedTicket(null)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lai danh sach
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs text-slate-400 font-mono mb-1">{selectedTicket.ticket_number}</div>
                  <h1 className="text-xl font-bold text-slate-800">{selectedTicket.subject}</h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sConfig.color}`}>{sConfig.label}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pConfig.color}`}>{pConfig.label}</span>
                </div>
              </div>
              <div className="prose prose-sm text-slate-600 whitespace-pre-wrap">{selectedTicket.description}</div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <h2 className="font-semibold text-slate-800">Phan hoi ({comments.length})</h2>
              </div>
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="px-6 py-8 text-center text-slate-400 text-sm">Chua co phan hoi nao</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{comment.author_id?.slice(0, 8) || 'User'}</span>
                        <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-600 pl-9">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                    placeholder="Nhap phan hoi..."
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="p-2.5 bg-[#1e3a5f] hover:bg-[#152d4a] text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Thong tin ticket</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Trang thai</span>
                  <span className={`font-medium px-2.5 py-0.5 rounded-full text-xs ${sConfig.color}`}>{sConfig.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Uu tien</span>
                  <span className={`font-medium px-2.5 py-0.5 rounded-full text-xs ${pConfig.color}`}>{pConfig.label}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Loai</span>
                  <span className="font-medium text-slate-700">{cat?.name || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Phong ban</span>
                  <span className="font-medium text-slate-700">{cat?.assigned_department || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Email PH</span>
                  <span className="font-medium text-slate-700">{cat?.assigned_email || '-'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tao luc</span>
                  <span className="font-medium text-slate-700">{formatDate(selectedTicket.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Cap nhat trang thai</h3>
              <div className="space-y-2">
                {Object.entries(statusConfig).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => updateTicketStatus(selectedTicket.id, key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTicket.status === key
                        ? 'bg-slate-100 text-slate-800'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <val.icon className="w-4 h-4" />
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ticket System</h1>
          <p className="text-slate-500 mt-1">Gui va theo doi yeu cau ho tro</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] hover:bg-[#152d4a] text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tao ticket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tim theo so ticket, tieu de..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none min-w-[140px]"
          >
            <option value="">Tat trang thai</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none min-w-[140px]"
          >
            <option value="">Tat uu tien</option>
            {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Dang tai...</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">Chua co ticket nao</h3>
          <p className="text-sm text-slate-400 mt-1">Tao ticket dau tien cua ban!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => {
              const sConfig = statusConfig[ticket.status] || statusConfig.open;
              const pConfig = priorityConfig[ticket.priority] || priorityConfig.medium;
              const StatusIcon = sConfig.icon;
              return (
                <button
                  key={ticket.id}
                  onClick={() => openDetail(ticket)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sConfig.color.replace('text-', 'bg-').split(' ')[0]}`}>
                    <StatusIcon className={`w-5 h-5 ${sConfig.color.split(' ')[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">{ticket.ticket_number}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${pConfig.color}`}>{pConfig.label}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-800 truncate">{ticket.subject}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                      <span>{getCategoryName(ticket.category_id)}</span>
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${sConfig.color}`}>{sConfig.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Tao ticket moi</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tieu de</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                  placeholder="Mo ta ngan gon van de cua ban"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mo ta chi tiet</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none resize-none"
                  placeholder="Mo ta chi tiet yeu cau cua ban..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Loai ticket</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Uu tien</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                  >
                    {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              {form.category_id && (() => {
                const cat = categories.find(c => c.id === form.category_id);
                if (!cat) return null;
                return (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Ticket se duoc gui den:</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Building2 className="w-3.5 h-3.5" />
                        {cat.assigned_department}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="w-3.5 h-3.5" />
                        {cat.assigned_email}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Huy
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.subject || !form.description}
                className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#152d4a] text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              >
                Tao ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
