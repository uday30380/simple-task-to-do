import React, { useState } from 'react';
import TodoDashboard from './components/TodoDashboard';
import Why from './components/Why';
import Contact from './components/Contact';
import { HomeIcon, InfoIcon, PhoneIcon } from './components/Icons';

type View = 'home' | 'why' | 'contact';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-24">
        {currentView === 'home' && <TodoDashboard />}
        {currentView === 'why' && <Why />}
        {currentView === 'contact' && <Contact />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 pb-safe pt-2 z-50">
        <div className="max-w-md mx-auto flex justify-around items-center px-4 h-16">
          <button 
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 w-20 ${currentView === 'home' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`p-1.5 rounded-full transition-all ${currentView === 'home' ? 'bg-indigo-500/20 translate-y-[-2px]' : ''}`}>
              <HomeIcon size={24} className={currentView === 'home' ? 'fill-indigo-500/20' : ''} />
            </div>
            <span className="text-[10px] font-bold tracking-wide">Home</span>
          </button>

          <button 
            onClick={() => setCurrentView('why')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 w-20 ${currentView === 'why' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`p-1.5 rounded-full transition-all ${currentView === 'why' ? 'bg-indigo-500/20 translate-y-[-2px]' : ''}`}>
              <InfoIcon size={24} />
            </div>
            <span className="text-[10px] font-bold tracking-wide">Why</span>
          </button>

          <button 
            onClick={() => setCurrentView('contact')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 w-20 ${currentView === 'contact' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`p-1.5 rounded-full transition-all ${currentView === 'contact' ? 'bg-indigo-500/20 translate-y-[-2px]' : ''}`}>
              <PhoneIcon size={24} />
            </div>
            <span className="text-[10px] font-bold tracking-wide">Contact</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;