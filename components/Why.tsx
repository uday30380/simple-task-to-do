import React from 'react';
import { ClockIcon, ShieldIcon, RocketIcon, ThumbUpIcon, StarIcon } from './Icons';

const Why: React.FC = () => {
  const features = [
    { icon: StarIcon, text: "Reduces manual work", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { icon: ClockIcon, text: "Saves time", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { icon: ThumbUpIcon, text: "Easy to use", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { icon: ShieldIcon, text: "Safe and reliable", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { icon: RocketIcon, text: "Helps productivity", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  ];

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[85vh] px-6 w-full max-w-5xl mx-auto">
      <div className="text-center mb-16 relative">
        <div className="absolute -inset-10 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <h1 className="relative text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-cyan-300 drop-shadow-sm">
          Why This App Is Required
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-cyan-500 mx-auto mt-4 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {features.map((item, index) => (
          <div 
            key={index} 
            className="group relative flex items-center gap-5 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
             {/* Hover Glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${item.bg}`}></div>

            <div className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl ${item.bg} ${item.color} ${item.border} border shadow-inner group-hover:scale-110 transition-transform duration-300`}>
              <item.icon size={28} />
            </div>
            
            <span className="text-lg md:text-xl font-bold text-slate-200 group-hover:text-white transition-colors">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Why;