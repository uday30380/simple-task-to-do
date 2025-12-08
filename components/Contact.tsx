import React from 'react';
import { MailIcon, PhoneIcon } from './Icons';

const Contact: React.FC = () => {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[85vh] px-4 w-full">
      <div className="w-full max-w-2xl relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <h1 className="relative text-3xl md:text-5xl font-black text-center text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-pink-300 mb-16 drop-shadow-sm">
          Contact Us
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
           {/* Email Card */}
           <a href="mailto:udaykiranvempati123@gmail.com" className="group relative flex flex-col items-center justify-center gap-4 p-10 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2">
             <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
             
             <div className="p-5 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-300">
                <MailIcon size={36} />
             </div>
             <div className="text-center">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Email Support</p>
                <p className="text-base md:text-lg text-slate-200 font-semibold group-hover:text-white transition-colors break-all">
                  udaykiranvempati123@gmail.com
                </p>
             </div>
           </a>

           {/* Phone Card */}
           <a href="tel:+918185892753" className="group relative flex flex-col items-center justify-center gap-4 p-10 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl hover:shadow-pink-500/20 hover:border-pink-500/50 transition-all duration-500 hover:-translate-y-2">
             <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>

             <div className="p-5 bg-pink-500/10 rounded-2xl text-pink-400 group-hover:bg-pink-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-pink-500/40 transition-all duration-300">
                <PhoneIcon size={36} />
             </div>
             <div className="text-center">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Call Us</p>
                <p className="text-xl md:text-2xl text-slate-200 font-semibold group-hover:text-white transition-colors">
                  +91 8185892753
                </p>
             </div>
           </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;