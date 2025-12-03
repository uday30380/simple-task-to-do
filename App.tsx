import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, FilterType, Priority, Category, Attachment } from './types';
import TaskItem from './components/TaskItem';
import FilterTabs from './components/FilterTabs';
import Dashboard from './components/Dashboard';
import { MicIcon, UploadIcon, SearchIcon, FilterIcon } from './components/Icons';
import { loadTasks, saveTasks } from './utils/storage';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  
  // Filtering & Sorting State
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  
  // Form State
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Personal');
  const [dueDate, setDueDate] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<string | null>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Request Notification Permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check for due tasks periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      tasks.forEach(t => {
        if (t.dueDate && t.dueDate > now - 60000 && t.dueDate < now && !t.completed) {
          new Notification("Task Due!", { body: t.text });
        }
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  // --- Actions ---

  const addTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      completed: false,
      createdAt: Date.now(),
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      priority,
      category,
      subtasks: [],
      attachments: attachments
    };

    setTasks((prev) => [newTask, ...prev]);
    setInputText('');
    setAttachments([]);
    setDueDate('');
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };
    recognition.start();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAttachments(prev => [...prev, {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          data: base64
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Drag and Drop ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragItem.current = id;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragItem.current;
    if (!sourceId || sourceId === targetId) return;

    const sourceIndex = tasks.findIndex(t => t.id === sourceId);
    const targetIndex = tasks.findIndex(t => t.id === targetId);
    
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(sourceIndex, 1);
    newTasks.splice(targetIndex, 0, movedTask);
    
    setTasks(newTasks);
    dragItem.current = null;
  };


  // --- Subtask & Task Management Helpers ---

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newVal = !t.completed;
      return { ...t, completed: newVal, subtasks: t.subtasks.map(s => ({...s, completed: newVal})) };
    }));
  };

  const addSubtask = (taskId: string, text: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t, completed: false, subtasks: [...t.subtasks, { id: crypto.randomUUID(), text, completed: false }]
    } : t));
  };

  const toggleSubtask = (taskId: string, subId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const newSubs = t.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
      return { ...t, subtasks: newSubs, completed: newSubs.every(s => s.completed) };
    }));
  };

  const deleteSubtask = (taskId: string, subId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t, subtasks: t.subtasks.filter(s => s.id !== subId)
    } : t));
  };
  
  const clearAllFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setFilterCategory('All');
    setFilterPriority('All');
  };

  // --- Render Helpers ---

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // 1. Status Filter
    if (statusFilter === 'completed') result = result.filter(t => t.completed);
    if (statusFilter === 'pending') result = result.filter(t => !t.completed);

    // 2. Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.text.toLowerCase().includes(q) || 
        t.subtasks.some(s => s.text.toLowerCase().includes(q))
      );
    }

    // 3. Category Filter
    if (filterCategory !== 'All') {
      result = result.filter(t => t.category === filterCategory);
    }

    // 4. Priority Filter
    if (filterPriority !== 'All') {
      result = result.filter(t => t.priority === filterPriority);
    }

    // 5. Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'createdAt') {
        return b.createdAt - a.createdAt; // Newest first
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate; // Earliest first
      }
      if (sortBy === 'priority') {
        const map = { high: 3, medium: 2, low: 1 };
        return map[b.priority] - map[a.priority]; // High to Low
      }
      return 0;
    });

    return result;
  }, [tasks, statusFilter, searchQuery, filterCategory, filterPriority, sortBy]);

  const counts = useMemo(() => ({
    all: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  }), [tasks]);

  const hasActiveFilters = statusFilter !== 'all' || searchQuery !== '' || filterCategory !== 'All' || filterPriority !== 'All';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent pb-1">
              Make Your Life Simple
            </h1>
            <p className="text-slate-500 font-medium mt-1">Efficient task management dashboard</p>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR (Sticky on desktop) */}
          <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-8">
             {/* Dashboard Stats */}
             <Dashboard tasks={tasks} />

             {/* Add Task Card */}
             <div className="bg-slate-900 rounded-3xl shadow-xl shadow-black/50 border border-slate-800/60 overflow-hidden relative group">
                {/* Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                    New Task
                  </h3>
                  
                  <div className="relative">
                     <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="What needs to be done?"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-600 resize-none transition-all"
                      onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addTask();
                        }
                      }}
                    />
                     <button 
                        onClick={handleVoiceInput} 
                        className="absolute bottom-3 right-3 p-2 text-slate-500 hover:text-indigo-400 transition-colors"
                        title="Voice Input"
                      >
                        <MicIcon size={20} />
                      </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                     <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium</option>
                        <option value="high">High Priority</option>
                      </select>

                      <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                        <option value="Work">Work</option>
                        <option value="Study">Study</option>
                        <option value="Personal">Personal</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Other">Other</option>
                      </select>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-2">
                    <input 
                      type="datetime-local" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="col-span-9 bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <div className="col-span-3">
                       <button onClick={() => fileInputRef.current?.click()} className="w-full h-full flex items-center justify-center bg-slate-950/50 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors" title="Attach Image">
                         <UploadIcon size={18}/>
                       </button>
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                  </div>

                  {attachments.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-950/30 px-3 py-2 rounded-lg border border-indigo-900/50">
                       <span className="font-bold">{attachments.length}</span> file(s) attached
                    </div>
                  )}

                  <button 
                    onClick={addTask} 
                    disabled={!inputText.trim()} 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                  >
                    Create Task
                  </button>
                </div>
             </div>
          </div>

          {/* RIGHT CONTENT (List) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             
             {/* Controls Bar */}
             <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 backdrop-blur-sm sticky top-2 z-20">
                
                {/* Status Tabs */}
                <div className="mb-4">
                  <FilterTabs 
                    currentFilter={statusFilter} 
                    onFilterChange={setStatusFilter} 
                    counts={counts} 
                    onClear={clearAllFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>
                
                {/* Search & Sort */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <SearchIcon size={20} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search tasks..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-600 transition-all"
                        />
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                         <div className="relative min-w-[150px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                               <FilterIcon size={16} />
                            </div>
                            <select 
                                value={filterCategory} 
                                onChange={(e) => setFilterCategory(e.target.value as Category | 'All')}
                                className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 text-slate-300 appearance-none cursor-pointer hover:bg-slate-900 transition-colors"
                            >
                                <option value="All">All Categories</option>
                                <option value="Work">Work</option>
                                <option value="Study">Study</option>
                                <option value="Personal">Personal</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <select 
                            value={filterPriority} 
                            onChange={(e) => setFilterPriority(e.target.value as Priority | 'All')}
                            className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 text-slate-300 cursor-pointer hover:bg-slate-900 transition-colors"
                        >
                            <option value="All">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>

                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 text-slate-300 cursor-pointer hover:bg-slate-900 transition-colors"
                        >
                            <option value="createdAt">Newest First</option>
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                        </select>
                    </div>
                </div>
             </div>

             {/* Task List */}
             <div className="space-y-4 pb-20">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={(id) => setTasks(p => p.filter(t => t.id !== id))}
                      onEdit={(id, updates) => setTasks(p => p.map(t => t.id === id ? {...t, ...updates} : t))}
                      onAddSubtask={addSubtask}
                      onToggleSubtask={toggleSubtask}
                      onDeleteSubtask={deleteSubtask}
                      // Drag props
                      draggable={!searchQuery && statusFilter === 'all' && filterCategory === 'All' && filterPriority === 'All' && sortBy === 'createdAt'} 
                      onDragStart={handleDragStart}
                      onDragOver={handleDragEnter}
                      onDrop={handleDrop}
                    />
                  ))
                ) : (
                   <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-800/50 text-center animate-enter bg-slate-900/20">
                     <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <SearchIcon size={40} className="text-slate-700" />
                     </div>
                     <p className="text-2xl font-bold text-slate-500">No tasks found</p>
                     <p className="text-slate-600 mt-2 max-w-xs mx-auto">Tasks matching your filters will appear here.</p>
                   </div>
                )}
             </div>
          </div>

        </div>

        <footer className="mt-8 py-6 text-center border-t border-slate-900/50">
          <p className="text-sm font-medium text-slate-600">
             Created by <span className="text-indigo-500 font-bold">Vempati Uday Kiran</span>
          </p>
        </footer>

      </div>
    </div>
  );
};

export default App;