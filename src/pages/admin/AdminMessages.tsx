import React, { useEffect, useState } from 'react';
import { Search, Mail, CheckCircle2, Archive, User } from 'lucide-react';
import { adminService, ContactMessage } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminModal } from '../../components/admin/AdminModal';

export function AdminMessages() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'unread' | 'archived'>('all');

  // Detail Modal State
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getContactMessages();
      if (error) throw error;
      // No fabricated fallback: an empty table means the table is empty.
      // Seeded placeholder rows carried non-UUID ids, so editing or
      // deleting one could never reach the database.
      setItems((data || []) as ContactMessage[]);
    } catch (e) {
      console.warn('Could not fetch messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openMessageDetail = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      try {
        await adminService.updateMessageStatus(msg.id, { is_read: true });
      } catch (e) {
        console.warn('Failed to mark read in Supabase:', e);
      }
      setItems(items.map((it) => (it.id === msg.id ? { ...it, is_read: true } : it)));
    }
  };

  const toggleArchive = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextStatus = !currentStatus;
    try {
      await adminService.updateMessageStatus(id, { is_archived: nextStatus });
    } catch (err) {
      console.warn('Failed to toggle archive in Supabase:', err);
    }
    setItems(items.map((it) => (it.id === id ? { ...it, is_archived: nextStatus } : it)));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage({ ...selectedMessage, is_archived: nextStatus });
    }
  };

  const toggleRead = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextStatus = !currentStatus;
    try {
      await adminService.updateMessageStatus(id, { is_read: nextStatus });
    } catch (err) {
      console.warn('Failed to toggle read:', err);
    }
    setItems(items.map((it) => (it.id === id ? { ...it, is_read: nextStatus } : it)));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage({ ...selectedMessage, is_read: nextStatus });
    }
  };

  const filteredItems = items.filter((it) => {
    const q = search.toLowerCase();
    const matchSearch =
      it.name.toLowerCase().includes(q) ||
      it.email.toLowerCase().includes(q) ||
      it.message.toLowerCase().includes(q);
    const matchFilter =
      viewFilter === 'all'
        ? !it.is_archived
        : viewFilter === 'unread'
        ? !it.is_read && !it.is_archived
        : it.is_archived;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">
            Citizen Inquiries & Feedback Inbox
          </h2>
          <p className="text-xs text-ink-muted">
            Incoming communications submitted through the official municipal contact and feedback forms.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages by citizen name, email, or message content..."
            className="w-full rounded-md border border-hairline bg-white py-2 pl-9 pr-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewFilter('all')}
            className={`rounded px-3 py-2 text-xs font-semibold transition-colors ${
              viewFilter === 'all'
                ? 'bg-navy text-white'
                : 'border border-hairline bg-surface text-ink-muted hover:bg-white'
            }`}
          >
            Active Inbox
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('unread')}
            className={`rounded px-3 py-2 text-xs font-semibold transition-colors ${
              viewFilter === 'unread'
                ? 'bg-navy text-white'
                : 'border border-hairline bg-surface text-ink-muted hover:bg-white'
            }`}
          >
            Unread
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('archived')}
            className={`rounded px-3 py-2 text-xs font-semibold transition-colors ${
              viewFilter === 'archived'
                ? 'bg-navy text-white'
                : 'border border-hairline bg-surface text-ink-muted hover:bg-white'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="overflow-hidden card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              <tr>
                <th className="py-3 px-4">Citizen Sender</th>
                <th className="py-3 px-4">Inquiry / Message Excerpt</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Received</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    Loading citizen inquiries...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    No messages found in this category.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => openMessageDetail(item)}
                    className={`cursor-pointer transition-colors ${
                      !item.is_read ? 'bg-accent-50/40 hover:bg-accent-50/70 font-medium' : 'hover:bg-surface/60'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-navy max-w-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            !item.is_read ? 'bg-signal-500' : 'bg-transparent'
                          }`}
                        />
                        <div>
                          <p className="leading-snug">{item.name}</p>
                          <p className="font-mono text-[11px] text-ink-muted font-normal">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-ink max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{item.message}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.is_read ? 'read' : 'unread'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-ink-muted whitespace-nowrap">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => toggleRead(item.id, item.is_read, e)}
                          className="row-action rounded text-ink-muted hover:bg-surface hover:text-navy transition-colors"
                          title={item.is_read ? 'Mark as Unread' : 'Mark as Read'}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => toggleArchive(item.id, item.is_archived, e)}
                          className="row-action rounded text-ink-muted hover:bg-surface hover:text-alert transition-colors"
                          title={item.is_archived ? 'Restore to Inbox' : 'Archive Message'}
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Reader Modal */}
      <AdminModal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title="Citizen Inquiry Details"
        subtitle="Review official communication and sender contact"
        maxWidth="xl"
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="rounded border border-hairline bg-surface p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-teal" />
                  <span className="font-bold text-navy text-sm">{selectedMessage.name}</span>
                </div>
                <StatusBadge status={selectedMessage.is_read ? 'read' : 'unread'} size="sm" />
              </div>

              <div className="text-xs text-ink-muted font-mono space-y-1">
                <p>Email: <a href={`mailto:${selectedMessage.email}`} className="text-teal underline">{selectedMessage.email}</a></p>
                <p>
                  Received:{' '}
                  {selectedMessage.created_at
                    ? new Date(selectedMessage.created_at).toLocaleString()
                    : 'Recent'}
                </p>
              </div>
            </div>

            <div className="p-2 space-y-1">
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink-muted font-semibold">
                Message Content
              </h4>
              <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap bg-white border border-hairline rounded p-4">
                {selectedMessage.message}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-hairline">
              <button
                type="button"
                onClick={() => toggleArchive(selectedMessage.id, selectedMessage.is_archived)}
                className="flex items-center gap-1.5 rounded border border-hairline px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface hover:text-alert transition-colors"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>{selectedMessage.is_archived ? 'Restore to Inbox' : 'Archive Inquiry'}</span>
              </button>

              <div className="flex gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=RE: Magallanes LGU Inquiry - ${selectedMessage.name}`}
                  className="flex items-center gap-1.5 rounded-md bg-brand-800 px-4 py-1.5 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-600 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
