'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { usePermissions } from '@/providers/WorkspaceProvider';
import { useDepartments } from '@/hooks/use-departments';
import { useTenantStore } from '@/stores/tenant-store';
import {
  Users,
  Briefcase,
  Plus,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const STAGES = [
  { id: 'all', label: 'All Candidates' },
  { id: 'screening', label: 'Screening' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer Stage' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
];

export default function HRRecruitmentPage() {
  const params = useParams();
  const tenantSlug = (params?.tenant as string) || 'default';
  const { tenant } = useTenantStore();
  const { enabledDepartments } = useDepartments(tenant?.id || tenantSlug);
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [activeStage, setActiveStage] = useState('all');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  // Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobCode, setJobCode] = useState('');
  const [jobDept, setJobDept] = useState('');
  const [jobType, setJobType] = useState('Full-Time');
  const [jobLocation, setJobLocation] = useState('San Francisco (Hybrid)');
  const [jobDesc, setJobDesc] = useState('');

  // Auto-set default job department when loaded
  React.useEffect(() => {
    if (!jobDept && enabledDepartments.length > 0) {
      setJobDept(enabledDepartments[0].name);
    }
  }, [enabledDepartments, jobDept]);

  // Candidate Form State
  const [candJobId, setCandJobId] = useState('');
  const [candFirst, setCandFirst] = useState('');
  const [candLast, setCandLast] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candNotes, setCandNotes] = useState('');

  // 1. Fetch Jobs
  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ['hr-jobs'],
    queryFn: () => api.hr.getJobs(),
  });

  // 2. Fetch Candidates
  const { data: candidates = [], isLoading } = useQuery<any[]>({
    queryKey: ['hr-candidates', activeStage],
    queryFn: () =>
      api.hr.getCandidates({
        stage: activeStage === 'all' ? undefined : activeStage,
      }),
  });

  // Create Job Mutation
  const createJobMutation = useMutation({
    mutationFn: (data: any) => api.hr.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-jobs'] });
      setIsJobModalOpen(false);
      setJobTitle('');
      setJobCode('');
      setJobDesc('');
    },
  });

  // Add Candidate Mutation
  const addCandidateMutation = useMutation({
    mutationFn: (data: any) => api.hr.addCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-candidates'] });
      setIsCandidateModalOpen(false);
      setCandFirst('');
      setCandLast('');
      setCandEmail('');
      setCandPhone('');
      setCandNotes('');
    },
  });

  // Update Stage Mutation
  const updateStageMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.hr.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-candidates'] });
    },
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    createJobMutation.mutate({
      title: jobTitle,
      code: jobCode,
      department: jobDept,
      employment_type: jobType,
      location: jobLocation,
      description: jobDesc,
    });
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    addCandidateMutation.mutate({
      job_position_id: candJobId || (jobs[0]?.id ?? ''),
      first_name: candFirst,
      last_name: candLast,
      email: candEmail,
      phone: candPhone,
      notes: candNotes,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            Recruitment & Talent Acquisition
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage open requisitions, candidate evaluation pipelines, and interview workflows
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can('recruitment:manage') && (
            <>
              <button
                onClick={() => setIsJobModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Plus className="w-4 h-4" />
                <span>Post Job</span>
              </button>

              <button
                onClick={() => {
                  if (jobs.length > 0 && !candJobId) {
                    setCandJobId(jobs[0].id);
                  }
                  setIsCandidateModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Candidate</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Open Requisitions Slider */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Open Positions ({jobs.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.length === 0 ? (
            <div className="col-span-3 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
              No open job postings. Click &ldquo;Post Job&rdquo; to create a new requisition.
            </div>
          ) : (
            jobs.map((job: any) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {job.code}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{job.title}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span>{job.department}</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {job.applications_count} Candidates
                  </span>
                  <span className="text-[10px] text-indigo-400 font-medium">
                    {job.employment_type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Candidates Pipeline */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeStage === s.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Candidate</th>
                <th className="px-5 py-3.5 font-semibold">Applied Position</th>
                <th className="px-5 py-3.5 font-semibold">Stage</th>
                <th className="px-5 py-3.5 font-semibold">Evaluation Notes</th>
                {can('recruitment:manage') && <th className="px-5 py-3.5 font-semibold text-right">Advance Stage</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    Loading candidate pipeline...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No candidates found in this stage.
                  </td>
                </tr>
              ) : (
                candidates.map((cand: any) => (
                  <tr key={cand.application_id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-white">{cand.candidate_name}</p>
                      <p className="text-[10px] text-slate-400">{cand.candidate_email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-200 font-medium">{cand.job_title}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{cand.job_code}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {cand.stage}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">
                      {cand.notes || 'No evaluation notes recorded yet.'}
                    </td>
                    {can('recruitment:manage') && (
                      <td className="px-5 py-3.5 text-right">
                        <select
                          value={cand.stage}
                          onChange={(e) =>
                            updateStageMutation.mutate({
                              id: cand.application_id,
                              status: e.target.value,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="screening">Screening</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer Stage</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Job Modal */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Post New Requisition</h3>
            <form onSubmit={handleCreateJob} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Staff Infrastructure Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Requisition Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="JOB-INF-02"
                    value={jobCode}
                    onChange={(e) => setJobCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    required
                    value={jobDept}
                    onChange={(e) => setJobDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {enabledDepartments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Role Description</label>
                <textarea
                  rows={3}
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Key responsibilities and qualifications required..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createJobMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow transition disabled:opacity-50"
                >
                  {createJobMutation.isPending ? 'Publishing...' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add Candidate to Pipeline</h3>
            <form onSubmit={handleAddCandidate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Applied Position *</label>
                <select
                  value={candJobId}
                  onChange={(e) => setCandJobId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  {jobs.map((j: any) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={candFirst}
                    onChange={(e) => setCandFirst(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={candLast}
                    onChange={(e) => setCandLast(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={candEmail}
                    onChange={(e) => setCandEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={candPhone}
                    onChange={(e) => setCandPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Initial Screening Notes</label>
                <textarea
                  rows={2}
                  value={candNotes}
                  onChange={(e) => setCandNotes(e.target.value)}
                  placeholder="Notes from initial resume review or referral..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCandidateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCandidateMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow transition disabled:opacity-50"
                >
                  {addCandidateMutation.isPending ? 'Adding...' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
