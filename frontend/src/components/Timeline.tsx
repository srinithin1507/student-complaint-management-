export default function Timeline({ status, hasComments }: { status: string; hasComments: boolean }) {
  const steps = ['Complaint Submitted', 'Under Review', 'Teacher Comment', 'Resolved'];
  const activeIndex =
    status === 'Pending' ? 0 :
    status === 'Under Review' ? (hasComments ? 2 : 1) :
    status === 'Resolved' ? 3 :
    status === 'Rejected' ? 3 : 0;

  return (
    <div className="flex flex-col items-start gap-0">
      {steps.map((s, i) => {
        const done = i <= activeIndex;
        const rejected = status === 'Rejected' && i === 3;
        return (
          <div key={s} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 ${rejected ? 'bg-red-500 border-red-500' : done ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`} />
              {i < steps.length - 1 && <div className={`w-0.5 h-8 ${done && i < activeIndex ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </div>
            <div className={`pb-6 text-sm font-medium ${rejected ? 'text-red-600' : done ? 'text-navy' : 'text-slate-400'}`}>
              {rejected && i === 3 ? 'Rejected' : s}
            </div>
          </div>
        );
      })}
    </div>
  );
}
