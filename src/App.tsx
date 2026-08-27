import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Target, 
  ShieldCheck, 
  GraduationCap, 
  Award, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  RefreshCw,
  Search
} from 'lucide-react';
import { 
  JobDescription, 
  SampleResume, 
  BenchmarkResume, 
  SkillsData,
  FullResumeAnalysis 
} from './types';
import { 
  fetchJobs, 
  fetchSkills, 
  fetchSampleResumes, 
  fetchBenchmarks, 
  analyzeResume, 
  addCustomJob, 
  uploadResumeFile, 
  triggerGeminiDeepReview, 
  triggerGeminiBulletRewrite,
  fallbackSkills
} from './services/api';
import { Navbar } from './components/Navbar';
import { ResumeUploader } from './components/ResumeUploader';
import { OverviewHero } from './components/OverviewHero';
import { JobSuitabilitySection } from './components/JobSuitabilitySection';
import { JobFitCheckSection } from './components/JobFitCheckSection';
import { ATSReadinessSection } from './components/ATSReadinessSection';
import { SkillGapSection } from './components/SkillGapSection';
import { BenchmarkingSection } from './components/BenchmarkingSection';
import { AddJobModal } from './components/AddJobModal';
import { ExportReportModal } from './components/ExportReportModal';
import { AIDeepReviewModal } from './components/AIDeepReviewModal';

export default function App() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [skillsData, setSkillsData] = useState<SkillsData>(fallbackSkills);
  const [sampleResumes, setSampleResumes] = useState<SampleResume[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkResume[]>([]);
  
  const [resumeText, setResumeText] = useState<string>('');
  const [fileName, setFileName] = useState<string | undefined>();
  const [selectedJobId, setSelectedJobId] = useState<string>('job-swe-intern');
  
  const [analysis, setAnalysis] = useState<FullResumeAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDeepReviewing, setIsDeepReviewing] = useState<boolean>(false);
  const [deepReviewData, setDeepReviewData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isAddJobOpen, setIsAddJobOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isDeepReviewOpen, setIsDeepReviewOpen] = useState<boolean>(false);

  // Initial Data Bootstrap
  useEffect(() => {
    async function initData() {
      try {
        const [jobsRes, skillsRes, samplesRes, benchmarksRes] = await Promise.all([
          fetchJobs(),
          fetchSkills(),
          fetchSampleResumes(),
          fetchBenchmarks()
        ]);

        setJobs(jobsRes);
        setSkillsData(skillsRes);
        setBenchmarks(benchmarksRes);
        setSampleResumes(samplesRes);

        const initialJobId = jobsRes[0]?.id || 'job-swe-intern';
        setSelectedJobId(initialJobId);
        // Do not auto-analyze demo resume on startup — user chooses to upload or pick a sample profile
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }

    initData();
  }, []);

  const runAnalysis = async (text: string, jobId: string) => {
    if (!text || text.trim().length === 0) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const data = await analyzeResume(
        text,
        jobId,
        jobs,
        skillsData,
        benchmarks,
        fileName
      );
      setAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing resume analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setFileName(file.name);

    try {
      const result = await uploadResumeFile(
        file,
        selectedJobId,
        jobs,
        skillsData,
        benchmarks
      );

      if (result.extractedText) {
        setResumeText(result.extractedText);
      }
      if (result.analysis) {
        setAnalysis(result.analysis);
      }
      if (result.fileName) {
        setFileName(result.fileName);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to extract text from file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = async (sample: SampleResume) => {
    setResumeText(sample.content);
    setFileName(sample.name);
    const targetJob = sample.idealTargetJobId || selectedJobId;
    setSelectedJobId(targetJob);
    await runAnalysis(sample.content, targetJob);
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    if (resumeText) {
      runAnalysis(resumeText, jobId);
    }
  };

  const handleAddCustomJob = async (newJob: JobDescription) => {
    try {
      await addCustomJob(newJob);
      setJobs(prev => [newJob, ...prev]);
      setSelectedJobId(newJob.id);
      if (resumeText) {
        runAnalysis(resumeText, newJob.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerAIDeepReview = async () => {
    if (!resumeText) return;
    setIsDeepReviewing(true);
    try {
      const targetJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
      const data = await triggerGeminiDeepReview(resumeText, targetJob);
      if (data) {
        setDeepReviewData(data);
        setIsDeepReviewOpen(true);
      } else {
        // Fallback review structured directly from NLP analysis
        setDeepReviewData({
          available: false,
          review: {
            executiveSummary: analysis?.aiExecutiveSummary || 'Strong candidate profile with solid domain fundamentals.',
            tailoredAdvice: [
              `Incorporate missing high-priority target role keywords: ${(analysis?.targetJobFit?.missingKeywords || []).slice(0, 3).join(', ')}`,
              'Increase quantification ratio of achievements by adding metrics, scale, and performance indicators.',
              'Standardize section titles and maintain chronological experience blocks.'
            ],
            keyStrengths: (analysis?.targetJobFit?.strengths || []).slice(0, 3),
            highImpactBulletRewrites: (analysis?.atsReadiness?.bulletAudits || []).slice(0, 2).map(b => ({
              before: b.original,
              after: b.suggestedImprovement,
              reasoning: 'Applies strong action verb and quantified outcome formula.'
            }))
          }
        });
        setIsDeepReviewOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeepReviewing(false);
    }
  };

  const handleRewriteBulletWithAI = async (bullet: string): Promise<string | null> => {
    try {
      const targetJob = jobs.find(j => j.id === selectedJobId);
      const rewritten = await triggerGeminiBulletRewrite(bullet, targetJob?.title);
      if (rewritten) return rewritten;
    } catch (err) {
      console.error(err);
    }
    // Instant formula fallback
    return `Architected ${bullet.replace(/^(worked on|helped with|helped|responsible for)\s*/i, '')}, improving performance metrics by 35% and enhancing operational throughput.`;
  };

  const handleReset = () => {
    setResumeText('');
    setFileName(undefined);
    setAnalysis(null);
    setErrorMessage(null);
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const navTabs = [
    { id: 'overview', label: 'Executive Overview', icon: FileText },
    { id: 'job-suitability', label: 'Multi-Role Match', icon: Target, count: (analysis?.allJobMatches || []).length },
    { id: 'job-fit-check', label: 'Target Job Fit & Keywords', icon: Layers },
    { id: 'ats-readiness', label: 'ATS Optimization', icon: ShieldCheck, badge: analysis ? `${analysis.atsReadiness?.score || 0}/100` : undefined },
    { id: 'skill-gaps', label: 'Skill Gaps & Free Courses', icon: GraduationCap, count: analysis?.skillGaps?.missingCount },
    { id: 'benchmarking', label: 'Benchmarking Radar', icon: Award, badge: analysis?.benchmarking?.percentileBand?.split('(')[0]?.trim() }
  ];

  return (
    <div className="min-h-screen bg-[#12161a] text-slate-200 flex flex-col font-sans selection:bg-[#2ef8a0] selection:text-[#12161a]">
      
      {/* Top Navigation */}
      <Navbar
        sampleResumes={sampleResumes}
        onSelectSample={handleSelectSample}
        onReset={handleReset}
        onOpenAddJob={() => setIsAddJobOpen(true)}
        onExport={() => setIsExportOpen(true)}
        jobs={jobs}
        selectedJobId={selectedJobId}
        onSelectJob={handleSelectJob}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Resume Input & Uploader Component */}
        <ResumeUploader
          resumeText={resumeText}
          onTextChange={setResumeText}
          fileName={fileName}
          onFileUpload={handleFileUpload}
          onClear={handleReset}
          jobs={jobs}
          selectedJobId={selectedJobId}
          onSelectJob={handleSelectJob}
          sampleResumes={sampleResumes}
          onSelectSample={handleSelectSample}
          onAnalyze={() => runAnalysis(resumeText, selectedJobId)}
          isAnalyzing={isAnalyzing}
        />

        {/* Analysis Dashboard Section */}
        {analysis ? (
          <div className="space-y-5">
            
            {/* Primary Executive Overview Hero */}
            <OverviewHero
              analysis={analysis}
              onSelectTab={setActiveTab}
              onTriggerAIDeepReview={handleTriggerAIDeepReview}
              isDeepReviewing={isDeepReviewing}
              onOpenExportModal={() => setIsExportOpen(true)}
            />

            {/* Sticky/Scrollable Tab Navigation Bar */}
            <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-1.5 shadow-lg overflow-x-auto backdrop-blur-md">
              <nav className="flex space-x-1 min-w-max">
                {navTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#2ef8a0] text-[#12161a] shadow-md shadow-[#2ef8a0]/15'
                          : 'text-slate-400 hover:text-white hover:bg-[#252e37]/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#12161a]' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-[#12161a]/20 text-[#12161a]' : 'bg-[#12161a] text-slate-400 border border-[#252e37]'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                      {tab.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-[#12161a] text-[#2ef8a0]' : 'bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/30'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Active Tab View Rendering */}
            <div className="transition-all duration-300">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <JobSuitabilitySection
                    jobMatches={analysis.allJobMatches || []}
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    onSelectTargetJob={handleSelectJob}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ATSReadinessSection
                      analysis={analysis}
                      onRewriteBulletWithAI={handleRewriteBulletWithAI}
                      onOpenExportModal={() => setIsExportOpen(true)}
                    />
                    <SkillGapSection analysis={analysis} />
                  </div>
                </div>
              )}

              {activeTab === 'job-suitability' && (
                <JobSuitabilitySection
                  jobMatches={analysis.allJobMatches || []}
                  jobs={jobs}
                  selectedJobId={selectedJobId}
                  onSelectTargetJob={handleSelectJob}
                />
              )}

              {activeTab === 'job-fit-check' && (
                <JobFitCheckSection
                  targetJobFit={analysis.targetJobFit}
                  selectedJob={selectedJob}
                  allJobs={jobs}
                  onSelectJob={handleSelectJob}
                />
              )}

              {activeTab === 'ats-readiness' && (
                <ATSReadinessSection
                  analysis={analysis}
                  onRewriteBulletWithAI={handleRewriteBulletWithAI}
                  onOpenExportModal={() => setIsExportOpen(true)}
                />
              )}

              {activeTab === 'skill-gaps' && (
                <SkillGapSection analysis={analysis} />
              )}

              {activeTab === 'benchmarking' && (
                <BenchmarkingSection
                  analysis={analysis}
                  benchmarks={benchmarks}
                />
              )}
            </div>

          </div>
        ) : (
          !isAnalyzing ? (
            <div className="bg-[#181d23]/80 rounded-2xl border border-[#252e37] p-8 sm:p-10 text-center shadow-lg space-y-6">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#2ef8a0]/10 border border-[#2ef8a0]/30 text-[#2ef8a0] flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(46,248,160,0.15)]">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Ready to Optimize Your Resume
                </h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  Upload your own resume above or choose a sample benchmark profile below to test ATS scoring, keyword matching, and skill gap analytics.
                </p>
              </div>

              {sampleResumes.length > 0 && (
                <div className="max-w-2xl mx-auto pt-2">
                  <p className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2ef8a0]" />
                    <span>Or select a pre-configured demo candidate profile to test:</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sampleResumes.map(sample => (
                      <button
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className="p-3 rounded-xl border border-[#252e37] bg-[#12161a] hover:border-[#2ef8a0]/50 hover:bg-[#1a2129] transition-all text-left group flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-white group-hover:text-[#2ef8a0] transition-colors truncate">
                            {sample.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            Target: {jobs.find(j => j.id === sample.idealTargetJobId)?.title || 'Software Engineering'}
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/30 font-semibold shrink-0">
                          {sample.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#181d23]/80 rounded-2xl border border-[#252e37] p-12 text-center shadow-lg space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#2ef8a0] mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Analyzing Resume & Extracting Metrics...</h3>
                <p className="text-xs text-slate-400">
                  Running static NLP tokenizers, keyword frequency matchers, and ATS readiness audits.
                </p>
              </div>
            </div>
          )
        )}

      </main>

      {/* Modals */}
      <AddJobModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
        onAddJob={handleAddCustomJob}
      />

      {analysis && (
        <ExportReportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          analysis={analysis}
          targetJob={jobs.find(j => j.id === selectedJobId)}
        />
      )}

      <AIDeepReviewModal
        isOpen={isDeepReviewOpen}
        onClose={() => setIsDeepReviewOpen(false)}
        reviewData={deepReviewData}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-[#252e37] bg-[#12161a] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>File-Based AI Resume Analyzer with Static NLP Engine & Grounded In-Memory Datasets</span>
          <span className="text-slate-400">
            Created by <span className="text-[#2ef8a0] font-semibold">Sanjay</span>
          </span>
        </div>
      </footer>

    </div>
  );
}

