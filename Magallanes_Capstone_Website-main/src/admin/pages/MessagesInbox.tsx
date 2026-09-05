import React, { useState, useEffect } from 'react';
import { MailIcon, MailOpenIcon, ArchiveIcon, ArchiveRestoreIcon, EyeIcon, UserIcon, ClockIcon } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { AdminModal } from '../components/AdminModal';
import { supabaseAdmin } from '../services/supabaseAdminService';
import { ContactMessage } from '../types';

export const MessagesInbox: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [tab, setTab] = useState<'unread' | 'all' | 'archived'>('unread');

  const loadMessages = async () => {
    setLoading(true);
    const data = await supabaseAdmin.getMessages();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      await supabaseAdmin.markMessageRead(msg.id, true);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
    }
  };

  const handleToggleArchive = async (msg: ContactMessage) => {
    const nextArchive = !msg.is_archived;
    await supabaseAdmin.archiveMessage(msg.id, nextArchive);
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_archived: nextArchive } : m)));
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage((prev) => (prev ? { ...prev, is_archived: nextArchive } : null));
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (tab === 'unread') return !m.is_read && !m.is_archived;
    if (tab === 'archived') return m.is_archived;
    return !m.is_archived; // 'all' active messages
  });

  const columns: Column<ContactMessage>[] = [
    {
      key: 'name',
      header: 'Citizen / Sender',
      sortable: true,
      render: (item) => (
        <div>
          <div className="flex items-center gap-2">
            {!item.is_read && (
              <span className="h-2 w-2 rounded-full bg-teal shrink-0" title="Unread Message" />
            )}
            <p className={`text-sm ${item.is_read ? 'text-slate-700 font-medium' : 'text-navy font-bold'}`}>
              {item.name}
            </p>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Message Excerpt',
      render: (item) => (
        <p className={`line-clamp-2 text-xs max-w-md ${item.is_read ? 'text-slate-500' : 'text-slate-800 font-medium'}`}>
          {item.message}
        </p>
      ),
    },
    {
      key: 'created_at',
      header: 'Date Received',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(item.created_at).toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleOpenMessage(item)}
            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-navy hover:bg-slate-200"
          >
            <EyeIcon className="h-3.5 w-3.5" />
            <span>Read</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleArchive(item)}
            className="rounded p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100"
            title={item.is_archived ? 'Restore to Inbox' : 'Archive Inquiry'}
          >
            {item.is_archived ? <ArchiveRestoreIcon className="h-4 w-4" /> : <ArchiveIcon className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Citizen Messages & Inquiries</h2>
          <p className="text-sm text-slate-500">
            Incoming inquiries submitted through the official municipal website contact form.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setTab('unread')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'unread' ? 'border-teal text-teal' : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <MailIcon className="h-4 w-4" />
          <span>Unread Inquiries</span>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal font-mono">
            {messages.filter((m) => !m.is_read && !m.is_archived).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('all')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'all' ? 'border-teal text-teal' : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <MailOpenIcon className="h-4 w-4" />
          <span>All Active Inquiries</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-mono">
            {messages.filter((m) => !m.is_archived).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('archived')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'archived' ? 'border-teal text-teal' : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          <ArchiveIcon className="h-4 w-4" />
          <span>Archived Records</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-mono">
            {messages.filter((m) => m.is_archived).length}
          </span>
        </button>
      </div>

      <DataTable
        data={filteredMessages}
        columns={columns}
        searchPlaceholder="Search citizen inquiries by name, email, query keywords..."
      />

      {/* Message Reader Modal */}
      <AdminModal
        isOpen={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title="Citizen Inquiry Details"
        subtitle={`Inquiry received on ${selectedMessage ? new Date(selectedMessage.created_at).toLocaleString() : ''}`}
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="rounded border border-slate-100 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-teal" />
                  <span className="font-bold text-navy text-sm">{selectedMessage.name}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(selectedMessage.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono">
                Email Address: <a href={`mailto:${selectedMessage.email}`} className="text-teal hover:underline">{selectedMessage.email}</a>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Full Inquiry Content
              </label>
              <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap shadow-inner">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => handleToggleArchive(selectedMessage)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy"
              >
                {selectedMessage.is_archived ? (
                  <>
                    <ArchiveRestoreIcon className="h-4 w-4" /> Move to Active Inbox
                  </>
                ) : (
                  <>
                    <ArchiveIcon className="h-4 w-4" /> Archive this inquiry
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=RE: Magallanes LGU Inquiry&body=Dear ${encodeURIComponent(
                    selectedMessage.name
                  )},%0D%0A%0D%0AIn response to your inquiry regarding:`}
                  className="rounded bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
                >
                  Reply via Email Client
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="rounded border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};
