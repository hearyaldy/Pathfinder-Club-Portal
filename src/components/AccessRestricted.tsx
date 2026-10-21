import React from 'react';
import { Lock, ShieldAlert, ShieldCheck, Compass, ArrowLeft } from 'lucide-react';
import { useClub } from '../context/ClubContext';

interface AccessRestrictedProps {
  pageName: string;
  onOpenAuthModal: () => void;
  onGoToGuestHome: () => void;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  pageName,
  onOpenAuthModal,
  onGoToGuestHome,
}) => {
  const { currentOrg } = useClub();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Authorized Leadership Access Only</span>
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {pageName} is Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            You are currently browsing as a <strong>Guest</strong>. In accordance with church child protection guidelines, confidential membership rosters, medical alert sheets, church board review queues, and live attendance tracking are restricted to authorized Club Directors, Pastors, and Unit Counselors of <strong>{currentOrg.churchName}</strong>.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-left space-y-1.5">
          <span className="font-bold text-slate-900 block">
            What can guests & parents do without logging in?
          </span>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>Register youth online for the 2026–2027 club year.</li>
            <li>Look up your child's individual approval status & digital QR pass using your registration code or parent phone.</li>
            <li>Browse the public club calendar, meeting times, and uniform requirements.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Sign In as Club Director / Leader</span>
          </button>

          <button
            onClick={onGoToGuestHome}
            className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Church Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
