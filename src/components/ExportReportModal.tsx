import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Code, 
  Printer, 
  ExternalLink,
  ShieldCheck,
  Target,
  Award,
  Sparkles,
  CheckCircle2,
  ListFilter
} from 'lucide-react';
import { FullResumeAnalysis, JobDescription } from '../types';
import { downloadResumeAnalysisPDF, generateResumeAnalysisPDF } from '../utils/pdfGenerator';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: FullResumeAnalysis;
  targetJob?: JobDescription;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  analysis,
  targetJob
}) => {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'markdown' | 'json'>('pdf');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownReport = () => {
    const { parsedResume, targetJobFit, atsReadiness, benchmarking, skillGaps } = analysis;
    return `# Resume NLP & ATS Analysis Report
**Generated for:** ${parsedResume.detectedName || 'Candidate'}  
**Target Role:** ${targetJob?.title || targetJobFit?.jobTitle || 'Full Stack Engineer'}  
**Date:** ${new Date().toLocaleDateString()}  
**Evaluated File:** ${parsedResume.fileName || 'Uploaded Resume'}

---

## 1. Executive Summary & Scores
- **Target Role Suitability Match:** ${targetJobFit?.matchScore || 0}%
- **ATS Filter Readiness Score:** ${atsReadiness.score}/100 (${atsReadiness.rating})
- **Industry Benchmark Ranking:** ${benchmarking.percentileBand} (${benchmarking.percentileNumber}th Percentile)
- **Quantified Achievements Ratio:** ${parsedResume.quantifiedBulletsPercentage}% (${parsedResume.quantifiedBulletsCount}/${parsedResume.totalBulletsCount} bullets with measurable metrics)

---

## 2. Job Suitability Breakdown
- **Skills Match:** ${targetJobFit?.subScores.skillsMatch}%
- **Keyword Overlap:** ${targetJobFit?.subScores.keywordOverlap}%
- **Experience Relevance:** ${targetJobFit?.subScores.experienceRelevance}%
- **Matched Skills:** ${targetJobFit?.matchedSkills.join(', ')}
- **Missing Skills:** ${targetJobFit?.missingSkills.join(', ') || 'None'}

---

## 3. ATS Optimization Checklist
${atsReadiness.checks.map(c => `- [${c.status === 'pass' ? 'x' : ' '}] **${c.name}** (${c.status.toUpperCase()}): ${c.description} (Recommendation: ${c.recommendation})`).join('\n')}

---

## 4. High-Impact Bullet Enhancements (XYZ Formula)
${atsReadiness.bulletAudits.slice(0, 5).map((b, i) => `### Bullet ${i + 1} (${b.verbStrength.toUpperCase()} verb, ${b.isQuantified ? 'Quantified' : 'Unquantified'})
- **Original:** ${b.original}
- **Enhanced:** ${b.suggestedImprovement}
`).join('\n')}

---

## 5. Skill Gaps & Recommended Free Courses
${skillGaps.topRecommendedCourses.map(course => `- **${course.title}** (${course.provider}) — [Access Course](${course.url}) [${course.duration}, ${course.badge}]`).join('\n')}

---

## 6. Benchmarking Competency Breakdown
- **ATS Readiness:** ${benchmarking.userMetrics.atsReadiness}/100 (Top 10%: ${benchmarking.benchmarkTop10.atsReadiness})
- **Keyword Density:** ${benchmarking.userMetrics.keywordDensity}/100 (Top 10%: ${benchmarking.benchmarkTop10.keywordDensity})
- **Quantified Metrics:** ${benchmarking.userMetrics.quantifiedAchievements}/100 (Top 10%: ${benchmarking.benchmarkTop10.quantifiedAchievements})
- **Technical Depth:** ${benchmarking.userMetrics.technicalDepth}/100 (Top 10%: ${benchmarking.benchmarkTop10.technicalDepth})
- **Action Verb Strength:** ${benchmarking.userMetrics.actionVerbStrength}/100 (Top 10%: ${benchmarking.benchmarkTop10.actionVerbStrength})
`;
  };

  const reportContent = format === 'markdown' ? generateMarkdownReport() : JSON.stringify(analysis, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      downloadResumeAnalysisPDF(analysis, { targetJob });
    } catch (e) {
      console.error('Failed to export PDF:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintPDF = () => {
    try {
      const doc = generateResumeAnalysisPDF(analysis, { targetJob });
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (e) {
      console.error('Failed to open PDF preview:', e);
    }
  };

  const handleDownloadTextFile = () => {
    const blob = new Blob([reportContent], { type: format === 'markdown' ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (analysis.parsedResume.detectedName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    a.download = `resume_analysis_${safeName}.${format === 'markdown' ? 'md' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const passedChecksCount = analysis.atsReadiness.checks.filter(c => c.status === 'pass').length;
  const totalChecksCount = analysis.atsReadiness.checks.length;
  const issuesCount = totalChecksCount - passedChecksCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181d23] rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#252e37] space-y-4 max-h-[92vh] flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#252e37]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2ef8a0]/15 border border-[#2ef8a0]/30 flex items-center justify-center text-[#2ef8a0]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg neo-gradient-text">Export Formatted Analysis & Checklist</h3>
              <p className="text-xs text-slate-400">Generate a polished PDF diagnostic report, Markdown summary, or raw JSON data.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252e37] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1 bg-[#12161a] border border-[#252e37] p-1 rounded-xl">
            <button
              onClick={() => setFormat('pdf')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                format === 'pdf' ? 'bg-[#2ef8a0] text-[#12161a] shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Document (.pdf)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${format === 'pdf' ? 'bg-black/20 text-black' : 'bg-[#2ef8a0]/20 text-[#2ef8a0]'}`}>
                Recommended
              </span>
            </button>

            <button
              onClick={() => setFormat('markdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                format === 'markdown' ? 'bg-[#2ef8a0] text-[#12161a] shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Markdown (.md)
            </button>

            <button
              onClick={() => setFormat('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                format === 'json' ? 'bg-[#2ef8a0] text-[#12161a] shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              JSON Data (.json)
            </button>
          </div>

          {/* Quick Actions depending on format */}
          {format === 'pdf' ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrintPDF}
                className="px-3.5 py-1.5 rounded-xl border border-[#252e37] bg-[#12161a] text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#252e37] transition-colors flex items-center gap-1.5"
                title="Open PDF in a new tab to view or print"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Open Preview</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="px-4 py-1.5 rounded-xl bg-[#2ef8a0] text-[#12161a] text-xs font-bold hover:bg-[#00f59b] flex items-center gap-1.5 shadow-md shadow-[#2ef8a0]/15 transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl border border-[#252e37] bg-[#12161a] text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#252e37] transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2ef8a0]" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                onClick={handleDownloadTextFile}
                className="px-4 py-1.5 rounded-xl bg-[#2ef8a0] text-[#12161a] text-xs font-bold hover:bg-[#00f59b] flex items-center gap-1.5 shadow-md shadow-[#2ef8a0]/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        {format === 'pdf' ? (
          <div className="flex-1 overflow-y-auto bg-[#12161a] border border-[#252e37] rounded-xl p-5 space-y-4 max-h-[58vh]">
            
            {/* Visual PDF Mock Preview Card */}
            <div className="bg-[#181d23] border border-[#2ef8a0]/30 rounded-xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2ef8a0]" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252e37]">
                <div>
                  <div className="text-[11px] font-bold text-[#2ef8a0] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Formatted PDF Document Structure
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    RESUME NLP & ATS OPTIMIZATION REPORT
                  </h4>
                  <p className="text-xs text-slate-400">
                    Candidate: <strong className="text-white">{analysis.parsedResume.detectedName || 'Candidate'}</strong> • Target: <strong className="text-white">{targetJob?.title || analysis.targetJobFit?.jobTitle || 'Role'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/30">
                    Multi-Page A4 Formatted
                  </span>
                </div>
              </div>

              {/* 4 Scorecards Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5">
                <div className="p-2.5 rounded-lg bg-[#12161a] border border-[#252e37]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Role Fit Score</span>
                  <div className="text-lg font-black text-[#2ef8a0]">{analysis.targetJobFit?.matchScore || 0}%</div>
                  <span className="text-[10px] text-slate-400">Skills & Keyword Match</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#12161a] border border-[#252e37]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">ATS Score</span>
                  <div className="text-lg font-black text-emerald-400">{analysis.atsReadiness.score}/100</div>
                  <span className="text-[10px] text-slate-400">{analysis.atsReadiness.rating}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#12161a] border border-[#252e37]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Quantified Impact</span>
                  <div className="text-lg font-black text-cyan-400">{analysis.parsedResume.quantifiedBulletsPercentage}%</div>
                  <span className="text-[10px] text-slate-400">{analysis.parsedResume.quantifiedBulletsCount} Metric Bullets</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#12161a] border border-[#252e37]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Benchmark Rank</span>
                  <div className="text-lg font-black text-indigo-400">{analysis.benchmarking.percentileNumber}th %</div>
                  <span className="text-[10px] text-slate-400">{analysis.benchmarking.percentileBand.split(' ')[0]}</span>
                </div>
              </div>

              {/* PDF Document Sections Included */}
              <div className="mt-4 pt-3.5 border-t border-[#252e37] space-y-2">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ListFilter className="w-3.5 h-3.5 text-[#2ef8a0]" />
                  <span>Sections Included in the PDF Document:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-300 p-2 rounded-lg bg-[#12161a]/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-semibold">1. Executive Scorecard & AI Diagnostic:</strong>
                      <div className="text-[11px] text-slate-400">High-level summary of candidate qualifications and target alignment.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300 p-2 rounded-lg bg-[#12161a]/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-semibold">2. Target Role & Keyword Matrix:</strong>
                      <div className="text-[11px] text-slate-400">Detailed breakdown of matched skills, missing competencies, and keyword density.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300 p-2 rounded-lg bg-[#12161a]/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-semibold">3. Actionable ATS Optimization Checklist ({totalChecksCount} items):</strong>
                      <div className="text-[11px] text-slate-400">Pass/Warning/Fail diagnostic findings with exact recommendations.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300 p-2 rounded-lg bg-[#12161a]/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-semibold">4. Bullet Point Quality & Google XYZ Rewrites:</strong>
                      <div className="text-[11px] text-slate-400">Action verb strength checks and quantified metric suggestions.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300 p-2 rounded-lg bg-[#12161a]/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-semibold">5. Industry Percentile Benchmark Table:</strong>
                      <div className="text-[11px] text-slate-400">Candidate metrics compared against 50th percentile and Top 10% profiles.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300 p-2 rounded-lg bg-[#12161a]/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-semibold">6. Curated Free Learning Courses:</strong>
                      <div className="text-[11px] text-slate-400">Direct course links with providers, badges, and verified duration.</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Export CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#181d23] border border-[#252e37]">
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Ready to export: </span>
                Click the button to generate and download the vector-rendered PDF document.
              </div>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#2ef8a0] text-[#12161a] text-xs font-bold hover:bg-[#00f59b] flex items-center justify-center gap-1.5 shadow-md shadow-[#2ef8a0]/20 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingPdf ? 'Rendering PDF...' : 'Download PDF Document'}</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[#12161a] border border-[#252e37] text-slate-300 p-4 rounded-xl font-mono text-xs leading-relaxed max-h-[58vh]">
            <pre className="whitespace-pre-wrap">{reportContent}</pre>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-[#252e37]">
          <span className="text-[11px] text-slate-400">
            Export includes all verified ATS diagnostics and career benchmarks.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#252e37] text-white text-xs font-semibold hover:bg-[#2e3944] transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
