import React, { useState } from 'react';
import { X, Plus, Briefcase, CheckCircle2 } from 'lucide-react';
import { JobDescription } from '../types';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddJob: (job: JobDescription) => Promise<void>;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onAddJob
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [level, setLevel] = useState('Fresher / Entry-Level');
  const [experienceYears, setExperienceYears] = useState(0);
  const [location, setLocation] = useState('Remote');
  const [description, setDescription] = useState('');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [preferredSkillsInput, setPreferredSkillsInput] = useState('');
  const [responsibilitiesInput, setResponsibilitiesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !requiredSkillsInput.trim()) return;

    setIsSubmitting(true);
    const requiredSkills = requiredSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const preferredSkills = preferredSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const responsibilities = responsibilitiesInput.split('\n').map(s => s.trim()).filter(Boolean);
    const keywords = Array.from(new Set([...requiredSkills, ...preferredSkills, title, department]));

    const newJob: JobDescription = {
      id: `job-custom-${Date.now()}`,
      title: title.trim(),
      department,
      level,
      experienceYears,
      location,
      description: description.trim() || `Exciting opportunity for a ${title}.`,
      requiredSkills,
      preferredSkills,
      responsibilities: responsibilities.length > 0 ? responsibilities : ['Collaborate with cross-functional teams to deliver scalable software.'],
      keywords
    };

    try {
      await onAddJob(newJob);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181d23] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#252e37] space-y-4 max-h-[90vh] overflow-y-auto text-slate-100">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#252e37]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2ef8a0]/15 border border-[#2ef8a0]/30 flex items-center justify-center text-[#2ef8a0]">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-lg neo-gradient-text">Add Custom Job to Target Library</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252e37] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Associate Backend Developer / Intern"
              className="w-full text-xs bg-[#12161a] border border-[#252e37] rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:border-[#2ef8a0] focus:ring-1 focus:ring-[#2ef8a0] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs bg-[#12161a] border border-[#252e37] rounded-xl p-2.5 text-slate-100 focus:border-[#2ef8a0] focus:outline-none"
              >
                <option value="Engineering" className="bg-[#181d23] text-slate-100">Engineering</option>
                <option value="AI Research & Development" className="bg-[#181d23] text-slate-100">AI Research & Dev</option>
                <option value="Data & Analytics" className="bg-[#181d23] text-slate-100">Data & Analytics</option>
                <option value="Product Management" className="bg-[#181d23] text-slate-100">Product Management</option>
                <option value="DevOps & Infrastructure" className="bg-[#181d23] text-slate-100">DevOps & Cloud</option>
                <option value="Quality Assurance (QA)" className="bg-[#181d23] text-slate-100">Quality Assurance (QA)</option>
                <option value="Design" className="bg-[#181d23] text-slate-100">Design</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Experience Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full text-xs bg-[#12161a] border border-[#252e37] rounded-xl p-2.5 text-slate-100 focus:border-[#2ef8a0] focus:outline-none"
              >
                <option value="Intern" className="bg-[#181d23] text-slate-100">Internship (0 yrs)</option>
                <option value="Fresher / Entry-Level" className="bg-[#181d23] text-slate-100">Fresher / Entry-Level (0-1 yrs)</option>
                <option value="Junior" className="bg-[#181d23] text-slate-100">Junior (1-2 yrs)</option>
                <option value="Mid-Level" className="bg-[#181d23] text-slate-100">Mid-Level (2-4 yrs)</option>
                <option value="Senior" className="bg-[#181d23] text-slate-100">Senior (5+ yrs)</option>
                <option value="Staff / Lead" className="bg-[#181d23] text-slate-100">Staff / Lead (7+ yrs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Required Skills * (comma-separated)
            </label>
            <input
              type="text"
              required
              value={requiredSkillsInput}
              onChange={(e) => setRequiredSkillsInput(e.target.value)}
              placeholder="e.g. Python, SQL, Git, React, Problem Solving"
              className="w-full text-xs bg-[#12161a] border border-[#252e37] rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:border-[#2ef8a0] focus:ring-1 focus:ring-[#2ef8a0] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Preferred Skills (comma-separated)
            </label>
            <input
              type="text"
              value={preferredSkillsInput}
              onChange={(e) => setPreferredSkillsInput(e.target.value)}
              placeholder="e.g. Docker, TypeScript, Fast API, Tailwind CSS"
              className="w-full text-xs bg-[#12161a] border border-[#252e37] rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:border-[#2ef8a0] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Key Responsibilities (one per line)
            </label>
            <textarea
              rows={3}
              value={responsibilitiesInput}
              onChange={(e) => setResponsibilitiesInput(e.target.value)}
              placeholder="Develop clean code for core features under mentorship...&#10;Write automated unit and integration tests..."
              className="w-full text-xs bg-[#12161a] border border-[#252e37] rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:border-[#2ef8a0] focus:outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-[#252e37] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#252e37] text-xs font-semibold text-slate-300 hover:bg-[#252e37] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title || !requiredSkillsInput}
              className="px-5 py-2 rounded-xl bg-[#2ef8a0] text-[#12161a] text-xs font-bold hover:bg-[#00f59b] disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-[#2ef8a0]/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Add Job & Match'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
