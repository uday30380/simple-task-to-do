import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, FilterType, Priority, Category, Attachment, AppSettings } from './types';
import TaskItem from './components/TaskItem';
import FilterTabs from './components/FilterTabs';
import Dashboard from './components/Dashboard';
import { MicIcon, SunIcon, MoonIcon, UploadIcon, SearchIcon, FilterIcon } from './components/Icons';
import { loadTasks, saveTasks, loadSettings, saveSettings } from './utils/storage';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  
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

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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
    <div className={`min-h-screen transition-colors duration-200 ${settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto py-8 px-4">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SimpleTasks</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Offline & Secure</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSettings(p => ({...p, darkMode: !p.darkMode}))} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:bg-yellow-50 dark:hover:bg-gray-700 transition text-gray-500">
              {settings.darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </header>

        {/* Dashboard Stats */}
        <Dashboard tasks={tasks} />

        {/* Add Task Form */}
        <section className="mb-8">
          <div className="relative group bg-white dark:bg-gray-700 rounded-xl shadow-lg p-1 transition-all ring-1 ring-gray-200 dark:ring-gray-600">
            <div className="flex items-center border-b border-gray-100 dark:border-gray-600 p-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-3 bg-transparent text-lg focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <button onClick={handleVoiceInput} className="p-2 text-gray-400 hover:text-indigo-600 transition" title="Voice Input">
                <MicIcon />
              </button>
            </div>
            
            {/* Extended Controls */}
            <div className="flex flex-wrap items-center justify-between p-2 gap-2 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
              <div className="flex gap-2">
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="text-sm bg-white dark:bg-gray-700 border-none rounded-md px-2 py-1 focus:ring-1 focus:ring-indigo-500 text-gray-700 dark:text-gray-200 shadow-sm">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High Priority</option>
                </select>
                <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="text-sm bg-white dark:bg-gray-700 border-none rounded-md px-2 py-1 focus:ring-1 focus:ring-indigo-500 text-gray-700 dark:text-gray-200 shadow-sm">
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Personal">Personal</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
                <input 
                  type="datetime-local" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-sm bg-white dark:bg-gray-700 rounded-md px-2 py-1 border-none text-gray-700 dark:text-gray-200 shadow-sm"
                />
                 <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-white dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 shadow-sm" title="Attach Image">
                   <UploadIcon size={16}/>
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
              
              <div className="flex items-center gap-2">
                {attachments.length > 0 && <span className="text-xs text-indigo-500 font-medium">{attachments.length} file(s)</span>}
                <button onClick={addTask} disabled={!inputText.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs (Status) */}
        <FilterTabs 
          currentFilter={statusFilter} 
          onFilterChange={setStatusFilter} 
          counts={counts} 
          onClear={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Search & Advanced Sort/Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-enter">
            <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <SearchIcon size={18} />
                </div>
                <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all shadow-sm"
                />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-500">
                       <FilterIcon size={14} />
                    </div>
                    <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value as Category | 'All')}
                        className="pl-8 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-sm appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors min-w-[100px]"
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
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                    <option value="All">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                    <option value="createdAt">Newest First</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority (High-Low)</option>
                </select>
            </div>
        </div>

        {/* Task List */}
        <section className="space-y-3">
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
                draggable={!searchQuery && statusFilter === 'all' && filterCategory === 'All' && filterPriority === 'All' && sortBy === 'createdAt'} // Disable drag when filtered/sorted
                onDragStart={handleDragStart}
                onDragOver={handleDragEnter}
                onDrop={handleDrop}
              />
            ))
          ) : (
             <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center animate-enter">
               <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <SearchIcon size={24} className="text-gray-400" />
               </div>
               <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No tasks found</p>
               <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters.</p>
             </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 py-6 text-center border-t border-gray-200 dark:border-gray-800/50">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            created by <span className="font-semibold text-indigo-500 dark:text-indigo-400">Vempati Uday Kiran</span>
          </p>
        </footer>

      </div>
    </div>
  );
};

export default App;