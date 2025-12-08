import React, { useState } from 'react';
import { Task, Priority, Category } from '../types';
import { CheckIcon, TrashIcon, EditIcon, XIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon, CalendarIcon, DragIcon, CopyIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onDuplicate: (id: string) => void;
  // Drag & Drop props
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  medium: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  high: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
};

const priorityBorderColors: Record<Priority, string> = {
  low: 'border-l-blue-500 dark:border-l-blue-400',
  medium: 'border-l-amber-500 dark:border-l-amber-400',
  high: 'border-l-rose-500 dark:border-l-rose-400',
};

const priorityCheckboxColors: Record<Priority, { checked: string; unchecked: string; ring: string }> = {
  low: { 
    checked: 'bg-blue-500 border-blue-500', 
    unchecked: 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    ring: 'focus:ring-blue-500'
  },
  medium: { 
    checked: 'bg-amber-500 border-amber-500', 
    unchecked: 'hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    ring: 'focus:ring-amber-500'
  },
  high: { 
    checked: 'bg-rose-500 border-rose-500', 
    unchecked: 'hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20',
    ring: 'focus:ring-rose-500'
  },
};

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggle, 
  onDelete, 
  onEdit, 
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onDuplicate,
  draggable,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isClosingEdit, setIsClosingEdit] = useState(false);
  
  const [editText, setEditText] = useState(task.text);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editCategory, setEditCategory] = useState<Category>(task.category);
  const [editDueDate, setEditDueDate] = useState<string>('');
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [subtaskText, setSubtaskText] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  
  // Track subtasks that are in the process of being deleted (for animation)
  const [exitingSubtasks, setExitingSubtasks] = useState<Set<string>>(new Set());

  const startEdit = () => {
    setEditText(task.text);
    setEditPriority(task.priority);
    setEditCategory(task.category);
    // Convert timestamp to datetime-local string (adjusting for timezone)
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      setEditDueDate(localDate.toISOString().slice(0, 16));
    } else {
      setEditDueDate('');
    }
    setIsEditing(true);
  };

  const closeEdit = (save: boolean) => {
    setIsClosingEdit(true);
    setTimeout(() => {
      if (save && editText.trim()) {
        onEdit(task.id, {
          text: editText.trim(),
          priority: editPriority,
          category: editCategory,
          dueDate: editDueDate ? new Date(editDueDate).getTime() : undefined
        });
      }
      setIsEditing(false);
      setIsClosingEdit(false);
    }, 200); // Matches .animate-fade-out duration
  };

  const handleDelete = () => {
    setIsExiting(true);
    // Wait for animation to finish before removing from parent state
    setTimeout(() => {
      onDelete(task.id);
    }, 400);
  };

  const handleSubtaskDelete = (subId: string) => {
    setExitingSubtasks(prev => new Set(prev).add(subId));
    setTimeout(() => {
      onDeleteSubtask(task.id, subId);
      setExitingSubtasks(prev => {
        const next = new Set(prev);
        next.delete(subId);
        return next;
      });
    }, 350); // Matches slideOutRight animation
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  
  const dueDateStr = task.dueDate ? new Date(task.dueDate).toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  }) : null;
  
  const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;

  const checkboxTheme = priorityCheckboxColors[task.priority];

  // Helper for hidden date input value
  const isoDueDate = task.dueDate 
    ? new Date(task.dueDate - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) 
    : '';

  return (
    <div 
      className={`group flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-l-[4px] ${priorityBorderColors[task.priority]} rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 
        ${isExiting ? 'animate-leave' : 'animate-enter'} 
        ${task.completed ? 'opacity-60 grayscale-[0.2]' : 'opacity-100'}`}
      draggable={draggable && !isEditing}
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop && onDrop(e, task.id)}
    >
      <div className="flex items-start gap-4 p-5">
        {/* Drag Handle */}
        <div className="mt-1.5 cursor-grab text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 hidden sm:block active:cursor-grabbing transition-colors">
           <DragIcon size={18} />
        </div>

        {/* Checkbox */}
        <div className="flex items-center h-6 mt-0.5">
           <button
            onClick={() => onToggle(task.id)}
            className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800 ${checkboxTheme.ring}
              ${task.completed 
                ? `${checkboxTheme.checked} text-white scale-100` 
                : `border-slate-300 text-transparent dark:border-slate-500 ${checkboxTheme.unchecked}`}`}
          >
            <CheckIcon size={14} className={task.completed ? 'animate-scale-in' : 'opacity-0'} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className={`flex flex-col gap-4 ${isClosingEdit ? 'animate-fade-out' : 'animate-fade-in'}`}>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-4 py-3 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                autoFocus
                placeholder="Task description"
              />
              
              <div className="flex flex-wrap gap-2">
                <select 
                  value={editPriority} 
                  onChange={(e) => setEditPriority(e.target.value as Priority)}
                  className="text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <select 
                  value={editCategory} 
                  onChange={(e) => setEditCategory(e.target.value as Category)}
                  className="text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Personal">Personal</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>

                <input 
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="text-sm px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-600 dark:text-slate-200 cursor-pointer"
                />
              </div>

              <div className="flex gap-4 text-sm font-semibold mt-1">
                <button onClick={() => closeEdit(true)} className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">Save</button>
                <button onClick={() => closeEdit(false)} className="px-3 py-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in group-hover:translate-x-1 transition-transform duration-300">
              <div className="flex flex-wrap gap-2 mb-2">
                 <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${priorityColors[task.priority]}`}>
                  {task.priority}
                 </span>
                 <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 shadow-sm">
                  {task.category}
                 </span>
              </div>
              
              <p className={`text-lg font-medium leading-relaxed break-words transition-all duration-300 ${task.completed ? 'text-slate-400 line-through decoration-slate-400/50' : 'text-slate-800 dark:text-slate-100'}`}>
                {task.text}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                {dueDateStr && (
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md border shadow-sm transition-colors ${isOverdue ? 'text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800' : 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-400'}`}>
                    <CalendarIcon size={12} />
                    {dueDateStr}
                  </span>
                )}
                
                {task.attachments.length > 0 && (
                   <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800 shadow-sm">
                     📎 {task.attachments.length}
                   </span>
                )}

                {totalSubtasks > 0 && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors shadow-sm border ${completedSubtasks === totalSubtasks ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'}`}>
                    {completedSubtasks}/{totalSubtasks} Subtasks
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
           <button
             onClick={() => setIsExpanded(!isExpanded)}
             className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
             title="Toggle Subtasks"
           >
             {isExpanded ? <ChevronDownIcon size={18} /> : <ChevronRightIcon size={18} />}
           </button>
           
           {/* Quick Date Picker */}
           <div className="relative group/date">
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Set Due Date">
                <CalendarIcon size={18} />
              </button>
              <input 
                type="datetime-local" 
                value={isoDueDate}
                onChange={(e) => {
                    if (e.target.value) {
                        onEdit(task.id, { dueDate: new Date(e.target.value).getTime() });
                    } else {
                        onEdit(task.id, { dueDate: undefined });
                    }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
           </div>

           <button onClick={() => onDuplicate(task.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Duplicate">
             <CopyIcon size={18} />
           </button>
           <button onClick={() => !task.completed && startEdit()} disabled={task.completed} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent" title="Edit">
             <EditIcon size={18} />
           </button>
           <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Delete">
             <TrashIcon size={18} />
           </button>
        </div>
      </div>

      {/* Subtasks Section */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 p-5 sm:pl-16 rounded-b-2xl animate-enter backdrop-blur-sm">
           {/* Attachment Preview */}
           {task.attachments.length > 0 && (
             <div className="mb-4">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attachments</p>
               <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                 {task.attachments.map(att => (
                   <div key={att.id} className="w-20 h-20 flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 overflow-hidden group/att relative cursor-pointer hover:shadow-md transition-all">
                      {att.type.startsWith('image/') 
                        ? <img src={att.data} alt={att.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/att:scale-110" />
                        : <div className="w-full h-full flex flex-col items-center justify-center p-1"><span className="text-[10px] text-center text-slate-600 dark:text-slate-300 break-all line-clamp-2">{att.name}</span></div>
                      }
                   </div>
                 ))}
               </div>
             </div>
           )}

          <div className="space-y-2 mb-4">
            {task.subtasks.map((subtask) => (
              <div 
                key={subtask.id} 
                className={`flex items-center gap-3 group/sub p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all ${exitingSubtasks.has(subtask.id) ? 'animate-leave' : 'animate-pop-in'}`}
              >
                 <button
                  onClick={() => onToggleSubtask(task.id, subtask.id)}
                  className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded border transition-all duration-200 shadow-sm
                    ${subtask.completed 
                      ? `${checkboxTheme.checked} text-white` 
                      : `bg-white border-slate-300 text-transparent dark:bg-slate-800 dark:border-slate-600 ${checkboxTheme.unchecked}`}`}
                >
                  <CheckIcon size={10} className={subtask.completed ? 'animate-scale-in' : 'opacity-0'} />
                </button>
                <span className={`flex-1 text-sm font-medium transition-all duration-300 ${subtask.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                  {subtask.text}
                </span>
                <button
                  onClick={() => handleSubtaskDelete(subtask.id)}
                  className="opacity-0 group-hover/sub:opacity-100 text-slate-400 hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                >
                  <XIcon size={14} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if(subtaskText.trim()) { onAddSubtask(task.id, subtaskText); setSubtaskText(''); } }} className="flex items-center gap-3 mt-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <PlusIcon size={16} className="text-slate-400" />
            <input
              type="text"
              value={subtaskText}
              onChange={(e) => setSubtaskText(e.target.value)}
              placeholder="Add a new subtask..."
              className="flex-1 bg-transparent border-none text-sm py-1 focus:outline-none placeholder-slate-400 text-slate-700 dark:text-slate-200"
            />
            <button type="submit" disabled={!subtaskText.trim()} className="text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed uppercase tracking-wide transition-colors shadow-sm">Add</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskItem;