import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Newspaper, Pin, Search, Calendar, Tag, X, CreditCard as Edit, Trash2 } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  is_pinned: boolean;
  published_at: string;
  created_at: string;
  author_id: string;
}

const categories = [
  { value: 'general', label: 'Chung', color: 'bg-slate-100 text-slate-700' },
  { value: 'hr', label: 'Nhan su', color: 'bg-blue-100 text-blue-700' },
  { value: 'it', label: 'IT', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'event', label: 'Su kien', color: 'bg-amber-100 text-amber-700' },
  { value: 'policy', label: 'Chinh sach', color: 'bg-rose-100 text-rose-700' },
  { value: 'announcement', label: 'Thong bao', color: 'bg-cyan-100 text-cyan-700' },
];

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', image_url: '', is_pinned: false });

  useEffect(() => { loadNews(); }, [search, filterCat]);

  const loadNews = async () => {
    setLoading(true);
    let query = supabase.from('news').select('*').order('is_pinned', { ascending: false }).order('published_at', { ascending: false });
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    if (filterCat) query = query.eq('category', filterCat);
    const { data, error } = await query;
    if (!error) setNews(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (editingItem) {
      await supabase.from('news').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingItem.id);
    } else {
      const user = (await supabase.auth.getUser()).data.user;
      await supabase.from('news').insert({ ...form, author_id: user?.id });
    }
    setShowModal(false);
    setEditingItem(null);
    resetForm();
    loadNews();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ban co chac muon xoa bai viet nay?')) {
      await supabase.from('news').delete().eq('id', id);
      loadNews();
    }
  };

  const togglePin = async (item: NewsItem) => {
    await supabase.from('news').update({ is_pinned: !item.is_pinned }).eq('id', item.id);
    loadNews();
  };

  const resetForm = () => {
    setForm({ title: '', content: '', category: 'general', image_url: '', is_pinned: false });
  };

  const openEdit = (item: NewsItem) => {
    setEditingItem(item);
    setForm({ title: item.title, content: item.content, category: item.category, image_url: item.image_url, is_pinned: item.is_pinned });
    setShowModal(true);
  };

  const getCategory = (cat: string) => categories.find(c => c.value === cat) || categories[0];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tin tuc noi bo</h1>
          <p className="text-slate-500 mt-1">Cap nhat thong tin va thong bao tu cong ty</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingItem(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] hover:bg-[#152d4a] text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Dang bai
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tim kiem bai viet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none min-w-[160px]"
          >
            <option value="">Tat loai bai</option>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* News list */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Dang tai...</div>
      ) : news.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">Chua co bai viet nao</h3>
          <p className="text-sm text-slate-400 mt-1">Dang bai tin tuc dau tien cua ban!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => {
            const cat = getCategory(item.category);
            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {item.is_pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-md">
                            <Pin className="w-3 h-3" /> Ghim
                          </span>
                        )}
                        <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium ${cat.color}`}>
                          {cat.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{item.content}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(item.published_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => togglePin(item)} className={`p-1.5 rounded-lg transition-colors ${item.is_pinned ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-slate-100'}`} title={item.is_pinned ? 'Bo ghim' : 'Ghim'}>
                        <Pin className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">{editingItem ? 'Sua bai viet' : 'Dang bai moi'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tieu de</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                  placeholder="Nhap tieu de bai viet"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Noi dung</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none resize-none"
                  placeholder="Nhap noi dung bai viet..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Loai bai</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                  >
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hinh anh URL</label>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_pinned}
                  onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]/30"
                />
                <span className="text-sm text-slate-600">Ghim bai viet len dau</span>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Huy
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title || !form.content}
                className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#152d4a] text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              >
                {editingItem ? 'Cap nhat' : 'Dang bai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
