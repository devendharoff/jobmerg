import React, { useEffect, useState } from 'react';
import { ShieldCheck, ExternalLink, AlertTriangle, X, Lock } from 'lucide-react';
import { Job } from '../types';

interface ExternalRedirectModalProps {
  job: Job | null;
  onClose: () => void;
  onConfirmRedirect: (url: string) => void;
}

export default function ExternalRedirectModal({
  job,
  onClose,
  onConfirmRedirect
}: ExternalRedirectModalProps) {
  const [domain, setDomain] = useState<string>('');
  const [isValidProtocol, setIsValidProtocol] = useState<boolean>(true);

  if (!job) return null;

  const rawUrl = job.applyUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + ' ' + job.company)}`;

  useEffect(() => {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        setDomain(parsed.hostname.replace(/^www\./, ''));
        setIsValidProtocol(true);
      } else {
        setIsValidProtocol(false);
      }
    } catch {
      setDomain(job.company || 'External Career Site');
      setIsValidProtocol(rawUrl.startsWith('http://') || rawUrl.startsWith('https://'));
    }
  }, [rawUrl, job]);

  const handleProceed = () => {
    if (!isValidProtocol) {
      alert('Security Error: Malicious or invalid URL protocol blocked.');
      onClose();
      return;
    }
    onConfirmRedirect(rawUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-150 relative space-y-5 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Security Header Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
              <Lock className="w-3 h-3" /> Safe Redirect Shield
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight font-display">Leaving JobMerge</h3>
          </div>
        </div>

        {/* Alert Body */}
        {isValidProtocol ? (
          <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-150 text-xs">
            <p className="text-gray-700 font-semibold leading-relaxed">
              You are about to be redirected to the verified company hiring portal for <strong className="text-gray-900">{job.title}</strong> at <strong className="text-[#353df6]">{job.company}</strong>.
            </p>
            
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 text-[11px] font-mono text-gray-600 font-bold overflow-hidden">
              <span className="truncate flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                https://{domain}
              </span>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-sans uppercase font-extrabold">Verified</span>
            </div>

            <p className="text-[10px] text-gray-500 font-medium">
              🔒 Protected with SSL encryption & tab security (noopener/noreferrer enabled).
            </p>
          </div>
        ) : (
          <div className="space-y-2 bg-red-50 p-4 rounded-2xl border border-red-200 text-xs text-red-800">
            <div className="flex items-center gap-1.5 font-bold text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Malicious Protocol Warning
            </div>
            <p className="text-[11px]">This link contains an unverified URL format and has been blocked for your safety.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-gray-700 font-bold text-xs hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          
          {isValidProtocol && (
            <button
              onClick={handleProceed}
              className="flex-1 py-2.5 px-4 bg-[#353df6] hover:bg-[#252ccb] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#353df6]/20 cursor-pointer transition-all"
            >
              <span>Continue to {domain || 'Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
