import React, { useState } from 'react';
import { 
  Sparkles, Check, Plus, Folder, Calendar, Trash2, 
  ChevronRight, ChevronLeft, FileText, BarChart3, AlertCircle, Info 
} from 'lucide-react';
import { JobApplication, Job } from '../types';

interface ApplicationTrackerProps {
  applications: JobApplication[];
  onUpdateStatus: (id: string, status: JobApplication['status']) => void;
  onAddApplication: (app: Omit<JobApplication, 'id' | 'appliedDate'>) => void;
  onDeleteApplication: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  availableJobs: Job[];
}

const COLUMNS: { id: JobApplication['status']; label: string; bg: string; border: string; text: string; dot: string }[] = [
  { id: 'Applied', label: 'Applied', bg: 'bg-blue-50/30', border: 'border-blue-100/50', text: 'text-blue-700', dot: 'bg-blue-500' },
  { id: 'Interviewing', label: 'Interviewing', bg: 'bg-amber-50/30', border: 'border-amber-100/50', text: 'text-amber-700', dot: 'bg-amber-500' },
  { id: 'Offered', label: 'Offered', bg: 'bg-green-50/30', border: 'border-green-100/50', text: 'text-green-700', dot: 'bg-green-500' },
  { id: 'Rejected', label: 'Rejected', bg: 'bg-red-50/30', border: 'border-red-100/50', text: 'text-red-700', dot: 'bg-red-500' }
];

export default function ApplicationTracker({
  applications,
  onUpdateStatus,
  onAddApplication,
  onDeleteApplication,
  onUpdateNotes,
  availableJobs
}: ApplicationTrackerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNotesId, setSelectedNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  // Form states
  const [formCompany, setFormCompany] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formStatus, setFormStatus] = useState<JobApplication['status']>('Applied');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenNotes = (app: JobApplication) => {
    setSelectedNotesId(app.id);
    setNotesText(app.notes || '');
  };

  const handleSaveNotes = () => {
    if (selectedNotesId) {
      onUpdateNotes(selectedNotesId, notesText);
      setSelectedNotesId(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany || !formTitle) return;

    onAddApplication({
      jobId: 'external-' + Math.random().toString(36).substring(2, 7),
      jobTitle: formTitle,
      company: formCompany,
      logoUrl: `https://logo.clearbit.com/${formCompany.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      status: formStatus,
      notes: formNotes
    });

    // Reset Form
    setFormCompany('');
    setFormTitle('');
    setFormStatus('Applied');
    setFormNotes('');
    setShowAddModal(false);
  };

  // Stats calculation
  const totalApps = applications.length;
  const interviewingCount = applications.filter(a => a.status === 'Interviewing').length;
  const offersCount = applications.filter(a => a.status === 'Offered').length;
  const interviewRate = totalApps > 0 ? Math.round(((interviewingCount + offersCount) / totalApps) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in" id="application-tracker-view">
      {/* Header and Statistics */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 text-left">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-display">Application Pipeline</h1>
          <p className="text-sm font-semibold text-gray-400 mt-1">Track and manage your submitted applications across your target platforms.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-[#3f37c9] hover:bg-[#4f46e5] text-white rounded-2xl font-bold text-xs hover:shadow-lg hover:shadow-[#4f46e5]/10 flex items-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
          id="btn-add-manual-app"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Application
        </button>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-premium flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Folder className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 font-display">{totalApps}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Total Applications</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-premium flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Calendar className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 font-display">{interviewingCount}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Interviews Scheduled</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-premium flex items-center gap-4">
          <div className="w-11 h-11 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Check className="w-5.5 h-5.5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 font-display">{interviewRate}%</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Interview & Offer Rate</p>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start" id="kanban-grid">
        {COLUMNS.map((column) => {
          const columnApps = applications.filter((app) => app.status === column.id);
          
          return (
            <div 
              key={column.id}
              className={`rounded-3xl p-4 border flex flex-col min-h-[500px] shadow-sm ${column.bg} ${column.border}`}
              id={`kanban-col-${column.id.toLowerCase()}`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.dot} animate-pulse`}></span>
                  <span className={`font-black text-xs uppercase tracking-wider ${column.text}`}>{column.label}</span>
                </div>
                <span className="text-[10px] font-black text-gray-500 bg-white border border-gray-100 px-2 py-0.5 rounded-full shadow-sm">
                  {columnApps.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3.5 flex-1 overflow-y-auto">
                {columnApps.length === 0 ? (
                  <div className="h-28 rounded-2xl border border-dashed border-gray-200 bg-white/20 flex items-center justify-center text-center p-4 text-[11px] text-gray-450 font-bold leading-relaxed">
                    No applications at this stage. Move cards here to update.
                  </div>
                ) : (
                  columnApps.map((app) => (
                    <div 
                      key={app.id}
                      className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-3 text-left group"
                      id={`app-card-${app.id}`}
                    >
                      {/* Logo and company info */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          <img 
                            alt={app.company} 
                            className="w-5.5 h-5.5 object-contain" 
                            src={app.logoUrl} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/48/000000/briefcase.png';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-gray-900 truncate">{app.jobTitle}</p>
                          <p className="text-[10px] font-bold text-gray-400 truncate">{app.company}</p>
                        </div>
                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* App footer details and action controls */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">
                          <Calendar className="w-3 h-3 text-[#4f46e5]" />
                          <span>{app.appliedDate}</span>
                        </div>

                        {/* Kanban move controllers */}
                        <div className="flex gap-1">
                          {column.id !== 'Applied' && (
                            <button
                              onClick={() => {
                                const idx = COLUMNS.findIndex(c => c.id === column.id);
                                if (idx > 0) onUpdateStatus(app.id, COLUMNS[idx - 1].id);
                              }}
                              className="p-1 text-gray-400 hover:text-[#4f46e5] rounded-lg bg-gray-50/50 hover:bg-[#4f46e5]/5 border border-gray-100/50 transition-colors cursor-pointer"
                              title="Move back"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleOpenNotes(app)}
                            className={`p-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              app.notes 
                                ? 'text-green-600 bg-green-50 border border-green-150' 
                                : 'text-gray-450 hover:text-[#4f46e5] bg-gray-50/50 border border-gray-100/50'
                            }`}
                            title="Edit notes"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {column.id !== 'Rejected' && (
                            <button
                              onClick={() => {
                                const idx = COLUMNS.findIndex(c => c.id === column.id);
                                if (idx < COLUMNS.length - 1) onUpdateStatus(app.id, COLUMNS[idx + 1].id);
                              }}
                              className="p-1 text-gray-400 hover:text-[#4f46e5] rounded-lg bg-gray-50/50 hover:bg-[#4f46e5]/5 border border-gray-100/50 transition-colors cursor-pointer"
                              title="Move forward"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {app.notes && (
                        <div className="text-[10px] text-gray-500 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 font-bold leading-relaxed max-h-16 overflow-y-auto">
                          {app.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes Editor modal overlay */}
      {selectedNotesId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md p-6 animate-fade-in text-left">
            <h3 className="text-md font-black font-display text-gray-900 uppercase tracking-wider mb-2">Preparation & Interview Notes</h3>
            <p className="text-xs text-gray-400 font-semibold mb-4">Store interview coordinates, recruiter names, questions asked, or general preparation logs.</p>
            <textarea
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-3.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all shadow-inner mb-4 leading-relaxed"
              rows={5}
              placeholder="e.g. Talked with recruiter Sarah. Tech screening scheduled on July 5th. Focus on React hooks, system design, and sorting algorithms..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedNotesId(null)}
                className="px-4 py-2.5 text-gray-500 font-bold text-xs hover:bg-gray-100 rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2.5 bg-[#4f46e5] text-white rounded-xl font-bold text-xs hover:bg-[#3f37c9] transition-all cursor-pointer shadow-sm shadow-[#4f46e5]/10 uppercase tracking-wider"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add application manual Modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddSubmit}
            className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md p-6 animate-fade-in space-y-4 text-left"
          >
            <div>
              <h3 className="text-md font-black font-display text-gray-900 uppercase tracking-wider">Add External Application</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">Track applications submitted outside of JobMerge (e.g. from portals or agency contacts).</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Company Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all shadow-inner"
                placeholder="e.g. Netflix, Meta"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Job Title</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all shadow-inner"
                placeholder="e.g. Frontend Engineer, Product Lead"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Initial Pipeline Stage</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all cursor-pointer shadow-sm"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as JobApplication['status'])}
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Initial Notes</label>
              <textarea 
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-850 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all shadow-inner leading-relaxed"
                rows={3}
                placeholder="e.g. Applied via referral from John."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-gray-500 font-bold text-xs hover:bg-gray-100 rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#4f46e5] text-white rounded-xl font-bold text-xs hover:bg-[#3f37c9] transition-all cursor-pointer shadow-sm shadow-[#4f46e5]/10 uppercase tracking-wider"
              >
                Add Card
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
