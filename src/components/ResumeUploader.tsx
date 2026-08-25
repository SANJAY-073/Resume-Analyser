import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  ArrowRight,
  Loader2,
  Trash2,
  Filter,
  GraduationCap,
  Award,
  Edit3,
  RefreshCw
} from 'lucide-react';
import { JobDescription, SampleResume } from '../types';

interface ResumeUploaderProps {
  resumeText: string;
  onTextChange: (text: string) => void;
  fileName?: string;
  onFileUpload: (file: File) => void;
  onClear: () => void;
  jobs: JobDescription[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  sampleResumes: SampleResume[];
  onSelectSample: (sample: SampleResume) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  resumeText,
  onTextChange,
  fileName,
  onFileUpload,
  onClear,
  jobs,
  selectedJobId,
  onSelectJob,
  sampleResumes,
  onSelectSample,
  onAnalyze,
  isAnalyzing
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(!resumeText);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = resumeText ? resumeText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = (resumeText || '').length;

  // Filter jobs by experience level
  const filteredJobs = jobs.filter(job => {
    if (levelFilter === 'All') return true;
    if (levelFilter === 'Intern') return (job.level || '').toLowerCase().includes('intern');
    if (levelFilter === 'Fresher') return (job.level || '').toLowerCase().includes('fresher') || (job.level || '').toLowerCase().includes('entry');
    if (levelFilter === 'Mid') return (job.level || '').toLowerCase().includes('mid');
    if (levelFilter === 'Senior') return (job.level || '').toLowerCase().includes('senior') || (job.level || '').toLowerCase().includes('lead');
    return true;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  return (
    <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] shadow-lg p-4 sm:p-5 transition-all backdrop-blur-md">
      
      {/* Top Header: Streamlined & Convenient */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#252e37]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#12161a] border border-[#2ef8a0]/40 flex items-center justify-center text-[#2ef8a0] font-bold shrink-0 shadow-[0_0_10px_rgba(46,248,160,0.15)]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Resume & Target Role Configuration</h2>
              {fileName && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#2ef8a0]/15 text-[#2ef8a0] border border-[#2ef8a0]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#2ef8a0]" /> {fileName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {resumeText ? `${wordCount} words detected • ${charCount} characters` : 'Select career level, choose target job, and upload resume'}
            </p>
          </div>
        </div>

        {/* Action Toggle / Mode Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {resumeText && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[#252e37] bg-[#12161a] text-slate-300 hover:text-white hover:border-[#2ef8a0]/40 transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isExpanded ? 'Collapse Input Box' : 'Edit / Replace Resume'}</span>
            </button>
          )}

          <div className="flex items-center bg-[#12161a] border border-[#252e37] p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-[#252e37] text-white font-semibold border border-[#2ef8a0]/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              File Upload
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'paste'
                  ? 'bg-[#252e37] text-white font-semibold border border-[#2ef8a0]/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>
      </div>

      {/* Target Role & Level Selector Bar */}
      <div className="mt-3.5 space-y-3">
        
        {/* Experience Level Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-[#2ef8a0]" /> Career Level:
          </span>
          {[
            { id: 'All', label: 'All Openings', icon: null },
            { id: 'Intern', label: '🎓 Internships (0 Yrs)', icon: GraduationCap },
            { id: 'Fresher', label: '🚀 Fresher / Entry (0-1 Yrs)', icon: Sparkles },
            { id: 'Mid', label: '💼 Mid-Level (2-4 Yrs)', icon: Briefcase },
            { id: 'Senior', label: '👑 Senior / Lead (5+ Yrs)', icon: Award }
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => setLevelFilter(lvl.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                levelFilter === lvl.id
                  ? 'bg-[#2ef8a0] text-[#12161a] font-bold shadow-[0_0_12px_rgba(46,248,160,0.25)]'
                  : 'bg-[#12161a] border border-[#252e37] text-slate-400 hover:text-slate-200 hover:border-[#2ef8a0]/30 hover:bg-[#1e242c]'
              }`}
            >
              <span>{lvl.label}</span>
            </button>
          ))}
        </div>

        {/* Job Selection Dropdown & Sample Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          {/* Target Job Selector */}
          <div className="lg:col-span-2 bg-[#12161a]/90 border border-[#252e37] rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#2ef8a0]" />
                <span>Target Job Specification ({filteredJobs.length} available)</span>
              </label>
              {selectedJob && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#2ef8a0]/15 text-[#2ef8a0] border border-[#2ef8a0]/30">
                  {selectedJob.level}
                </span>
              )}
            </div>
            
            <select
              aria-label="Target Role Selector"
              value={selectedJobId}
              onChange={(e) => onSelectJob(e.target.value)}
              className="w-full text-xs sm:text-sm bg-[#181d23] border border-[#252e37] hover:border-[#2ef8a0]/40 rounded-lg px-3 py-2 text-white font-medium focus:ring-1 focus:ring-[#2ef8a0] focus:outline-none cursor-pointer transition-colors"
            >
              {filteredJobs.map(job => (
                <option key={job.id} value={job.id} className="bg-[#181d23] text-slate-100">
                  [{job.level}] {job.title} — {job.department}
                </option>
              ))}
            </select>

            {selectedJob && (
              <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Required Skills:</span>
                {selectedJob.requiredSkills.slice(0, 5).map(skill => (
                  <span key={skill} className="px-1.5 py-0.5 bg-[#181d23] rounded text-slate-300 border border-[#252e37]">
                    {skill}
                  </span>
                ))}
                {selectedJob.requiredSkills.length > 5 && (
                  <span className="text-slate-500 font-medium">+{selectedJob.requiredSkills.length - 5} more</span>
                )}
              </div>
            )}
          </div>

          {/* Quick Preset Resumes */}
          <div className="bg-[#12161a]/90 border border-[#252e37] rounded-xl p-3">
            <div className="text-xs font-semibold text-white mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#2ef8a0]" />
                <span>Load Sample Profile:</span>
              </span>
              <span className="text-[10px] text-slate-500">1-Click Test</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-[105px] overflow-y-auto pr-0.5">
              {sampleResumes.map(sample => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className="w-full text-left px-2 py-1 text-[11px] font-medium rounded-md border border-[#252e37] bg-[#181d23] hover:border-[#2ef8a0]/50 hover:bg-[#1e242c] transition-all flex items-center justify-between text-slate-300 hover:text-white group truncate"
                >
                  <span className="truncate">{sample.name.split('—')[0].trim()}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#12161a] text-[#2ef8a0] border border-[#2ef8a0]/20 group-hover:bg-[#2ef8a0]/20 shrink-0 font-semibold ml-1">
                    {sample.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Expanded Resume Input Area */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-[#252e37]">
          {activeTab === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#2ef8a0] bg-[#2ef8a0]/10 shadow-[0_0_20px_rgba(46,248,160,0.15)]'
                  : resumeText
                  ? 'border-[#2ef8a0]/50 bg-[#2ef8a0]/5'
                  : 'border-[#252e37] bg-[#12161a]/80 hover:bg-[#151a20] hover:border-[#2ef8a0]/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.json,.md"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${
                  resumeText ? 'bg-[#181d23] border border-[#2ef8a0]/50 text-[#2ef8a0]' : 'bg-[#181d23] border border-[#252e37] text-slate-300'
                }`}>
                  {resumeText ? <CheckCircle2 className="w-5 h-5" /> : <UploadCloud className="w-5 h-5 text-[#2ef8a0]" />}
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {resumeText ? (
                      <span>
                        Resume loaded: <span className="text-[#2ef8a0] font-bold">{fileName || 'Text Extracted'}</span>
                      </span>
                    ) : (
                      <span>
                        <span className="text-[#2ef8a0] hover:underline">Click to upload</span> or drag and drop resume
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports PDF, DOCX, TXT files (intern, fresher, senior formats)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={resumeText}
                  onChange={(e) => onTextChange(e.target.value)}
                  placeholder="Paste raw resume text here (e.g. Name, Education, Experience, Projects, Skills)..."
                  rows={6}
                  className="w-full text-xs font-mono bg-[#12161a] border border-[#252e37] rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2ef8a0] focus:border-[#2ef8a0]/50 transition-all resize-y"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>{wordCount} words • {charCount} characters</span>
                {resumeText && (
                  <button
                    onClick={onClear}
                    className="text-rose-400 hover:text-rose-300 text-xs font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Text
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Run / Analyze Action Bar */}
      <div className="mt-3.5 pt-3 border-t border-[#252e37] flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2ef8a0] animate-pulse shadow-[0_0_8px_rgba(46,248,160,0.8)]" />
          <span>Active Role: <strong className="text-white">[{selectedJob?.level}] {selectedJob?.title}</strong></span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {resumeText && (
            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-lg border border-[#252e37] bg-[#12161a] text-xs font-medium text-slate-400 hover:text-rose-400 hover:border-rose-900 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={onAnalyze}
            disabled={!resumeText.trim() || isAnalyzing}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#2ef8a0] hover:bg-[#00f59b] text-[#12161a] text-xs font-bold transition-all shadow-[0_0_20px_rgba(46,248,160,0.25)] hover:shadow-[0_0_25px_rgba(46,248,160,0.4)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#12161a]" />
                <span>Running NLP Pipeline...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-[#12161a]" />
                <span>Analyze Resume Fit</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#12161a]" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
