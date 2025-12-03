import React from 'react';
import { MailIcon, PhoneIcon } from './Icons';

const Contact: React.FC = () => {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[80vh] px-4 w-full">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl md:text-5xl font-black text-center text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-pink-400 mb-12">
          Contact Us
        </h1>
        
        <div className="flex flex-col gap-6">
           <div className="flex flex-col items-center justify-center gap-3 p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl hover:border-indigo-500/50 transition-all duration-300 group">
             <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400 group-hover:scale-110 transition-transform">
                <MailIcon size={32} />
             </div>
             <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Email</p>
             <a href="mailto:udaykiranvempati123@gmail.com" className="text-lg md:text-xl text-white font-medium hover:text-indigo-400 transition-colors break-all text-center">
               udaykiranvempati123@gmail.com
             </a>
           </div>

           <div className="flex flex-col items-center justify-center gap-3 p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl hover:border-indigo-500/50 transition-all duration-300 group">
             <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400 group-hover:scale-110 transition-transform">
                <PhoneIcon size={32} />
             </div>
             <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Phone</p>
             <a href="tel:+918185892753" className="text-xl md:text-2xl text-white font-medium hover:text-indigo-400 transition-colors">
               +91 8185892753
             </a>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;