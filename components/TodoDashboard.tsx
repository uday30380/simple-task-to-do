import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, FilterType, Priority, Category, Attachment } from '../types';
import TaskItem from './TaskItem';
import FilterTabs from './FilterTabs';
import Dashboard from './Dashboard';
import { MicIcon, UploadIcon, SearchIcon, FilterIcon, PlusIcon } from './Icons';
import { loadTasks, saveTasks } from '../utils/storage';

const TodoDashboard: React.FC = () => {
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

  const duplicateTask = (taskId: string) => {
    const taskToDuplicate = tasks.find(t => t.id === taskId);
    if (!taskToDuplicate) return;

    const newTask: Task = {
      ...taskToDuplicate,
      id: crypto.randomUUID(),
      text: `${taskToDuplicate.text} (Copy)`,
      createdAt: Date.now(),
      subtasks: taskToDuplicate.subtasks.map(s => ({ ...s, id: crypto.randomUUID() })),
      attachments: taskToDuplicate.attachments.map(a => ({ ...a, id: crypto.randomUUID() }))
    };

    setTasks(prev => [newTask, ...prev]);
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
    <div className="animate-fade-in w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col relative z-0">
      
      {/* Ambient Background for Home */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      {/* Header Bar */}
      <header className="flex flex-col items-center justify-center mb-10 pb-4 text-center relative z-10">
        <h1 className="text-3xl md:text-6xl font-black tracking-tight bg-gradient-to-b from-white via-indigo-50 to-indigo-200 bg-clip-text text-transparent pb-3 drop-shadow-sm leading-tight">
          Welcome to Your<br className="hidden sm:block" /> Smart Daily Utility App
        </h1>
        <div className="h-1.5 w-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-full mt-4 shadow-[0_0_20px_rgba(99,102,241,0.6)]"></div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* LEFT SIDEBAR (Sticky on desktop) */}
        <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-6">
           {/* Dashboard Stats */}
           <Dashboard tasks={tasks} />

           {/* Add Task Card */}
           <div className="relative group rounded-[2.5rem] p-[1px] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:from-indigo-500/40 hover:via-purple-500/40 hover:to-slate-800 transition-all duration-500 shadow-2xl shadow-black/50">
              <div className="bg-slate-950/90 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 h-full relative overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <PlusIcon size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide">Create Task</h3>
                </div>
                
                <div className="relative group/input mb-5">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-focus-within/input:opacity-50 blur transition duration-500"></div>
                   <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="What needs to be done?"
                    rows={3}
                    className="relative w-full px-5 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-lg font-medium focus:outline-none focus:bg-slate-900 text-white placeholder-slate-500 resize-none transition-all shadow-inner"
                    onKeyDown={(e) => {
                      if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addTask();
                      }
                    }}
                  />
                   <button 
                      onClick={handleVoiceInput} 
                      className="absolute bottom-3 right-3 p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                      title="Voice Input"
                    >
                      <MicIcon size={20} />
                    </button>
                </div>

                {/* Controls Grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Priority</label>
                        <div className="relative">
                          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-slate-800 appearance-none">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                             <FilterIcon size={12} className="rotate-180 opacity-50"/>
                          </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                        <div className="relative">
                          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-slate-800 appearance-none">
                            <option value="Work">Work</option>
                            <option value="Study">Study</option>
                            <option value="Personal">Personal</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Other">Other</option>
                          </select>
                           <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                             <FilterIcon size={12} className="rotate-180 opacity-50"/>
                          </div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-9 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Due Date</label>
                      <input 
                        type="datetime-local" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
                      />
                    </div>
                    <div className="col-span-3 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 opacity-0">Att</label>
                      <button onClick={() => fileInputRef.current?.click()} className="w-full h-[46px] flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all active:scale-95" title="Attach Image">
                        <UploadIcon size={20}/>
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-4 flex items-center gap-3 text-xs text-indigo-300 bg-indigo-500/10 px-4 py-3 rounded-xl border border-indigo-500/20 shadow-sm animate-fade-in">
                     <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                     <span className="font-bold">{attachments.length}</span> file(s) attached
                  </div>
                )}

                <button 
                  onClick={addTask} 
                  disabled={!inputText.trim()} 
                  className="w-full mt-6 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/40 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-[0.98] border-t border-white/10"
                >
                  Create Task
                </button>
              </div>
           </div>
        </div>

        {/* RIGHT CONTENT (List) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           
           {/* Controls Bar - Floating Glass */}
           <div className="bg-slate-900/80 p-5 rounded-[2rem] border border-slate-800/80 backdrop-blur-2xl shadow-2xl sticky top-6 z-30 transition-all hover:border-slate-700/50">
              
              {/* Status Tabs */}
              <div className="mb-5">
                <FilterTabs 
                  currentFilter={statusFilter} 
                  onFilterChange={setStatusFilter} 
                  counts={counts} 
                  onClear={clearAllFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
              
              {/* Search & Sort */}
              <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                          <SearchIcon size={20} />
                      </div>
                      <input 
                          type="text" 
                          placeholder="Search tasks..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 focus:bg-slate-950 text-slate-200 placeholder-slate-600 transition-all shadow-inner"
                      />
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                       <div className="relative min-w-[160px]">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                             <FilterIcon size={16} />
                          </div>
                          <select 
                              value={filterCategory} 
                              onChange={(e) => setFilterCategory(e.target.value as Category | 'All')}
                              className="w-full pl-10 pr-8 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-300 appearance-none cursor-pointer hover:bg-slate-900 transition-colors shadow-sm"
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
                          className="px-5 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-300 cursor-pointer hover:bg-slate-900 transition-colors shadow-sm min-w-[130px] appearance-none"
                      >
                          <option value="All">All Priorities</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                      </select>

                      <select 
                          value={sortBy} 
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-5 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-300 cursor-pointer hover:bg-slate-900 transition-colors shadow-sm min-w-[140px] appearance-none"
                      >
                          <option value="createdAt">Newest First</option>
                          <option value="dueDate">Due Date</option>
                          <option value="priority">Priority</option>
                      </select>
                  </div>
              </div>
           </div>

           {/* Task List */}
           <div className="space-y-4 pb-32">
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
                    onDuplicate={duplicateTask}
                    // Drag props
                    draggable={!searchQuery && statusFilter === 'all' && filterCategory === 'All' && filterPriority === 'All' && sortBy === 'createdAt'} 
                    onDragStart={handleDragStart}
                    onDragOver={handleDragEnter}
                    onDrop={handleDrop}
                  />
                ))
              ) : (
                 // Empty State
                 <div className="flex flex-col items-center justify-center py-24 rounded-[2.5rem] border-2 border-dashed border-slate-800 bg-slate-900/20 text-center animate-enter group hover:border-slate-700 hover:bg-slate-900/30 transition-all">
                   <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500 ring-1 ring-white/5">
                      <SearchIcon size={40} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                   </div>
                   <p className="text-2xl font-bold text-slate-400 group-hover:text-slate-200 transition-colors">No tasks found</p>
                   <p className="text-slate-600 mt-2 max-w-xs mx-auto">
                     {searchQuery || hasActiveFilters 
                       ? "Try adjusting your filters or search query." 
                       : "Your list is empty! Start by adding a new task."}
                   </p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TodoDashboard;