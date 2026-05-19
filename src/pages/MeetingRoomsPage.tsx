import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Plus, DoorOpen, Search, Users, Monitor, Mic, Video,
  CalendarDays, X, Clock, MapPin, CheckCircle, XCircle
} from 'lucide-react';

interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  equipment: string[];
  image_url: string;
  is_active: boolean;
}

interface RoomBooking {
  id: string;
  room_id: string;
  title: string;
  description: string;
  booked_by: string;
  attendees: string[];
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  meeting_rooms?: MeetingRoom;
}

const equipmentIcons: Record<string, { icon: any; label: string }> = {
  'Projector': { icon: Monitor, label: 'May chieu' },
  'Whiteboard': { icon: Monitor, label: 'Bang trang' },
  'Video Call': { icon: Video, label: 'Video Call' },
  'Sound System': { icon: Mic, label: 'Am thanh' },
  'Microphone': { icon: Mic, label: 'Micro' },
  'TV Screen': { icon: Monitor, label: 'TV' },
  'Recording': { icon: Video, label: 'Ghi am' },
};

export default function MeetingRoomsPage() {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [view, setView] = useState<'rooms' | 'bookings'>('rooms');
  const [form, setForm] = useState({
    title: '', description: '', date: '', start_time: '09:00', end_time: '10:00', attendees: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [roomsRes, bookingsRes] = await Promise.all([
      supabase.from('meeting_rooms').select('*').eq('is_active', true).order('name'),
      supabase.from('room_bookings').select('*, meeting_rooms(*)').order('start_time', { ascending: false }).limit(20),
    ]);
    setRooms(roomsRes.data || []);
    setBookings(bookingsRes.data || []);
    setLoading(false);
  };

  const handleBooking = async () => {
    if (!selectedRoom) return;
    const user = (await supabase.auth.getUser()).data.user;
    const startDateTime = `${form.date}T${form.start_time}:00`;
    const endDateTime = `${form.date}T${form.end_time}:00`;

    // Check for conflicts
    const { data: conflicts } = await supabase
      .from('room_bookings')
      .select('id')
      .eq('room_id', selectedRoom.id)
      .eq('status', 'confirmed')
      .overlaps('start_time', 'end_time', startDateTime, endDateTime);

    if (conflicts && conflicts.length > 0) {
      alert('Phong da duoc dat trong khung gio nay. Vui long chon thoi gian khac.');
      return;
    }

    await supabase.from('room_bookings').insert({
      room_id: selectedRoom.id,
      title: form.title,
      description: form.description,
      booked_by: user?.id,
      attendees: form.attendees ? form.attendees.split(',').map(a => a.trim()) : [],
      start_time: startDateTime,
      end_time: endDateTime,
      status: 'confirmed',
    });

    setShowBookingModal(false);
    setSelectedRoom(null);
    setForm({ title: '', description: '', date: '', start_time: '09:00', end_time: '10:00', attendees: '' });
    loadData();
  };

  const cancelBooking = async (id: string) => {
    if (confirm('Ban co chac muon huy dat phong nay?')) {
      await supabase.from('room_bookings').update({ status: 'cancelled' }).eq('id', id);
      loadData();
    }
  };

  const openBooking = (room: MeetingRoom) => {
    setSelectedRoom(room);
    const today = new Date().toISOString().split('T')[0];
    setForm(f => ({ ...f, date: today }));
    setShowBookingModal(true);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const isUpcoming = (date: string) => new Date(date) > new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dat phong hop</h1>
          <p className="text-slate-500 mt-1">Quan ly va dat phong hop noi bo</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          <button
            onClick={() => setView('rooms')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'rooms' ? 'bg-[#1e3a5f] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Phong hop
          </button>
          <button
            onClick={() => setView('bookings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'bookings' ? 'bg-[#1e3a5f] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Lich dat
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Dang tai...</div>
      ) : view === 'rooms' ? (
        /* Room cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative">
                <DoorOpen className="w-12 h-12 text-slate-300" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-slate-600">
                  <Users className="w-3.5 h-3.5" />
                  {room.capacity}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-1">{room.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {room.floor}
                </div>
                {room.equipment.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.equipment.map((eq) => {
                      const eqConfig = equipmentIcons[eq];
                      return (
                        <span key={eq} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 text-[11px] font-medium rounded-md border border-slate-100">
                          {eqConfig?.icon && <eqConfig.icon className="w-3 h-3" />}
                          {eqConfig?.label || eq}
                        </span>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={() => openBooking(room)}
                  className="w-full py-2.5 bg-[#1e3a5f] hover:bg-[#152d4a] text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Dat phong
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Bookings list */
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-700">Chua co lich dat phong nao</h3>
              <p className="text-sm text-slate-400 mt-1">Dat phong hop dau tien cua ban!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {bookings.map((booking) => {
                  const room = booking.meeting_rooms;
                  const upcoming = isUpcoming(booking.start_time);
                  const isCancelled = booking.status === 'cancelled';
                  return (
                    <div key={booking.id} className={`flex items-center gap-4 px-6 py-4 ${isCancelled ? 'opacity-50' : ''}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${upcoming && !isCancelled ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                        <CalendarDays className={`w-5 h-5 ${upcoming && !isCancelled ? 'text-emerald-500' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800">{booking.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                          <span>{room?.name || 'Phong hop'}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCancelled ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">Da huy</span>
                        ) : upcoming ? (
                          <>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Sap toi</span>
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Huy dat phong"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Da qua</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowBookingModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Dat phong hop</h2>
                <p className="text-sm text-slate-500">{selectedRoom.name} - {selectedRoom.floor}</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tieu de cuoc hop</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                  placeholder="VD: Hop ke hoach tuan"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mo ta</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none resize-none"
                  placeholder="Mo ta ngan gon..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ngay</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bat dau</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ket thuc</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Thanh vien tham gia (cach nhau boi dau phay)</label>
                <input
                  type="text"
                  value={form.attendees}
                  onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                  placeholder="email1@mcv.com.vn, email2@mcv.com.vn"
                />
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedRoom.capacity} cho ngoi</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedRoom.floor}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={() => setShowBookingModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Huy
              </button>
              <button
                onClick={handleBooking}
                disabled={!form.title || !form.date}
                className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#152d4a] text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              >
                Xac nhan dat phong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
