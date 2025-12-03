import React from 'react';

const Why: React.FC = () => {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-cyan-300 mb-12">
        Why This App Is Required
      </h1>
      
      <ul className="space-y-6 text-left max-w-md w-full">
        {[
          "Reduces manual work",
          "Saves time",
          "Easy to use",
          "Safe and reliable",
          "Helps productivity"
        ].map((item, index) => (
          <li key={index} className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-xl shadow-md transition-transform hover:scale-105">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm">
              ⭐
            </span>
            <span className="text-lg font-medium text-slate-200">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Why;