import React from 'react';
import { 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  FileCheck, 
  Target, 
  ShieldCheck, 
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { FullResumeAnalysis, BenchmarkResume } from '../types';

interface BenchmarkingSectionProps {
  analysis: FullResumeAnalysis;
  benchmarks: BenchmarkResume[];
}

export const BenchmarkingSection: React.FC<BenchmarkingSectionProps> = ({
  analysis,
  benchmarks
}) => {
  const { benchmarking, parsedResume } = analysis;
  const userMetrics = benchmarking.userMetrics;
  const top10 = benchmarking.benchmarkTop10;
  const avg = benchmarking.benchmarkAverage;

  // Radar data formatting
  const radarData = [
    {
      subject: 'ATS Format',
      User: userMetrics.atsReadiness,
      'Top 10% Benchmark': top10.atsReadiness,
      'Industry Average': avg.atsReadiness,
      fullMark: 100
    },
    {
      subject: 'Keyword Density',
      User: userMetrics.keywordDensity,
      'Top 10% Benchmark': top10.keywordDensity,
      'Industry Average': avg.keywordDensity,
      fullMark: 100
    },
    {
      subject: 'Quantified Metrics',
      User: userMetrics.quantifiedAchievements,
      'Top 10% Benchmark': top10.quantifiedAchievements,
      'Industry Average': avg.quantifiedAchievements,
      fullMark: 100
    },
    {
      subject: 'Technical Depth',
      User: userMetrics.technicalDepth,
      'Top 10% Benchmark': top10.technicalDepth,
      'Industry Average': avg.technicalDepth,
      fullMark: 100
    },
    {
      subject: 'Structure',
      User: userMetrics.structureAndFormatting,
      'Top 10% Benchmark': top10.structureAndFormatting,
      'Industry Average': avg.structureAndFormatting,
      fullMark: 100
    },
    {
      subject: 'Action Verbs',
      User: userMetrics.actionVerbStrength,
      'Top 10% Benchmark': top10.actionVerbStrength,
      'Industry Average': avg.actionVerbStrength,
      fullMark: 100
    }
  ];

  // Bar Comparison Data
  const barData = [
    { name: 'ATS Readiness', User: userMetrics.atsReadiness, Top10: top10.atsReadiness, Avg: avg.atsReadiness },
    { name: 'Quantified %', User: userMetrics.quantifiedAchievements, Top10: top10.quantifiedAchievements, Avg: avg.quantifiedAchievements },
    { name: 'Keywords', User: userMetrics.keywordDensity, Top10: top10.keywordDensity, Avg: avg.keywordDensity },
    { name: 'Action Verbs', User: userMetrics.actionVerbStrength, Top10: top10.actionVerbStrength, Avg: avg.actionVerbStrength }
  ];

  const topBenchmark = benchmarks.find(b => b.overallScore >= 90) || benchmarks[0];

  return (
    <div className="space-y-5">
      
      {/* Benchmark Rank Hero Banner */}
      <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-5 sm:p-6 shadow-lg backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#252e37]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/30">
                Curated Benchmarks Database
              </span>
              <span className="text-xs text-slate-400 font-medium">Calibrated against 2,400+ Verified Tech Hires</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 neo-gradient-text">
              Resume Benchmarking & Percentile Distribution
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {benchmarking.rankSummary}
            </p>
          </div>

          {/* Percentile Ranking Big Badge */}
          <div className="flex items-center space-x-4 bg-[#12161a] p-4 rounded-2xl border border-[#252e37] shrink-0 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#2ef8a0]/15 text-[#2ef8a0] border border-[#2ef8a0]/30 flex items-center justify-center font-bold text-xl shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {benchmarking.percentileBand.split('(')[0].trim()}
              </div>
              <div className="text-xs font-bold text-[#2ef8a0]">
                {benchmarking.percentileNumber}th Percentile Ranking
              </div>
            </div>
          </div>
        </div>

        {/* Percentile Band Visual Scale */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Below Average (0–50%)</span>
            <span>Industry Median (50–70%)</span>
            <span>Top 20% (70–85%)</span>
            <span className="text-[#2ef8a0]">Top 10% (85–100%)</span>
          </div>

          <div className="relative w-full h-3 bg-[#12161a] rounded-full overflow-hidden flex border border-[#252e37]">
            <div className="w-1/2 h-full bg-slate-700" title="Below Average" />
            <div className="w-1/5 h-full bg-slate-500" title="Average" />
            <div className="w-[15%] h-full bg-emerald-600/70" title="Top 20%" />
            <div className="w-[15%] h-full bg-[#2ef8a0]" title="Top 10%" />
          </div>

          {/* User needle indicator */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Entry / Career Transition</span>
            <span className="font-bold text-[#2ef8a0] flex items-center gap-1">
              ▲ Your Resume: {benchmarking.percentileNumber}th Percentile ({benchmarking.userScore}/100)
            </span>
            <span>Staff / Principal Tier</span>
          </div>
        </div>

      </div>

      {/* Comparative Visualizations: Radar & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Radar Chart: Multi-Dimensional Competencies */}
        <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-5 shadow-lg space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#2ef8a0]" />
              <span className="neo-gradient-text">Multi-Axis Competency Radar</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">6 Quality Dimensions</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Comparing your resume footprint against Top 10% Staff Engineers vs Industry Average.
          </p>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#252e37" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Your Resume" dataKey="User" stroke="#2ef8a0" fill="#2ef8a0" fillOpacity={0.35} />
                <Radar name="Top 10% Benchmark" dataKey="Top 10% Benchmark" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
                <Radar name="Industry Average" dataKey="Industry Average" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#12161a', borderColor: '#252e37', color: '#f8fafc', borderRadius: '12px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Core Direct Metrics */}
        <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-5 shadow-lg space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#2ef8a0]" />
              <span className="neo-gradient-text">Direct Pillar Breakdown</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Score / 100</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Key areas differentiating top candidates from average applicants.
          </p>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252e37" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#12161a', borderColor: '#252e37', color: '#f8fafc', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#94a3b8' }} />
                <Bar dataKey="User" fill="#2ef8a0" radius={[4, 4, 0, 0]} name="Your Score" />
                <Bar dataKey="Top10" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Top 10% Benchmark" />
                <Bar dataKey="Avg" fill="#475569" radius={[4, 4, 0, 0]} name="Industry Average" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Benchmark Sample Bullets to Emulate */}
      {topBenchmark && (
        <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-5 sm:p-6 shadow-lg space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#252e37]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2ef8a0]" />
                <span className="neo-gradient-text">Curated Top 10% Benchmark Resume Exemplar</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Model: <strong className="text-slate-200">{topBenchmark.title}</strong> ({topBenchmark.percentileBand})
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-[#2ef8a0]/10 text-[#2ef8a0] font-bold border border-[#2ef8a0]/30">
              Score: {topBenchmark.overallScore}/100
            </span>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              High-Converting Achievement Bullets to Model:
            </span>
            <div className="space-y-2">
              {topBenchmark.sampleStrongBullets.map((bullet, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#12161a] border border-[#252e37] text-xs text-slate-200 flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#2ef8a0] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">"{bullet}"</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action plan to reach next tier */}
          <div className="mt-4 p-4 rounded-xl bg-[#12161a] border border-[#2ef8a0]/30 space-y-2">
            <h4 className="text-xs font-bold text-[#2ef8a0] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#2ef8a0]" />
              <span>Recommended Path to Enter Top 10% Percentile:</span>
            </h4>
            <ul className="space-y-1 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0" />
                <span>Boost Quantified Metrics from <strong>{parsedResume.quantifiedBulletsPercentage}%</strong> to at least <strong>75%+</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0" />
                <span>Add measurable system scale metrics (e.g. users served, latency reduction, revenue ARR impact).</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0" />
                <span>Standardize all section headings to ensure 100% automated ATS compliance.</span>
              </li>
            </ul>
          </div>

        </div>
      )}

    </div>
  );
};
