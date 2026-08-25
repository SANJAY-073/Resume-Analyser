import React from 'react';
import { X, Sparkles, CheckCircle2, TrendingUp, Copy, Check, ArrowRight } from 'lucide-react';

interface AIDeepReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewData: {
    executiveSummary: string;
    tailoredAdvice: string[];
    keyStrengths: string[];
    highImpactBulletRewrites: { before: string; after: string; reasoning: string }[];
  } | null;
}

export const AIDeepReviewModal: React.FC<AIDeepReviewModalProps> = ({
  isOpen,
  onClose,
  reviewData
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  if (!isOpen || !reviewData) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181d23] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#252e37] space-y-4 max-h-[90vh] overflow-y-auto text-slate-100">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#252e37]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2ef8a0]/15 border border-[#2ef8a0]/30 flex items-center justify-center text-[#2ef8a0]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg neo-gradient-text">AI Deep Coaching & Executive Evaluation</h3>
              <p className="text-xs text-slate-400">Grounded in Google GenAI Deep Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252e37] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Summary */}
        <div className="p-4 rounded-xl bg-[#12161a] border border-[#2ef8a0]/30 space-y-1 text-xs sm:text-sm">
          <strong className="font-bold text-[#2ef8a0] block">Executive Talent Summary:</strong>
          <p className="text-slate-200 leading-relaxed font-medium">
            {reviewData.executiveSummary}
          </p>
        </div>

        {/* Strengths & Tailored Advice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          <div className="bg-[#12161a] p-3.5 rounded-xl border border-[#2ef8a0]/30 space-y-2">
            <strong className="font-bold text-[#2ef8a0] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2ef8a0]" />
              Key Competitive Strengths:
            </strong>
            <ul className="space-y-1.5 text-slate-200 font-medium">
              {(reviewData.keyStrengths || []).map((str, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ef8a0] mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#12161a] p-3.5 rounded-xl border border-[#252e37] space-y-2">
            <strong className="font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Tailored ATS Advice:
            </strong>
            <ul className="space-y-1.5 text-slate-200 font-medium">
              {(reviewData.tailoredAdvice || []).map((adv, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* High Impact Rewrites */}
        {reviewData.highImpactBulletRewrites?.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
              Google XYZ Formula Bullet Point Rewrites:
            </h4>
            <div className="space-y-3 text-xs">
              {reviewData.highImpactBulletRewrites.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-[#252e37] bg-[#12161a] space-y-2">
                  <div className="text-slate-500 line-through">
                    "{item.before}"
                  </div>
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-[#252e37]">
                    <p className="font-bold text-white">
                      "{item.after}"
                    </p>
                    <button
                      onClick={() => handleCopy(item.after, idx)}
                      className="px-2.5 py-1 rounded-lg bg-[#2ef8a0] text-[#12161a] text-[10px] font-bold hover:bg-[#00f59b] shrink-0 flex items-center gap-1 shadow-xs transition-colors"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-[#12161a]" /> : <Copy className="w-3 h-3 text-[#12161a]" />}
                      <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-[11px] text-[#2ef8a0] italic">
                    💡 {item.reasoning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#252e37] text-white text-xs font-semibold hover:bg-[#2e3944] transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
