import React, { useState } from 'react';
import { Task, Priority, Category } from '../types';
import { CheckIcon, TrashIcon, EditIcon, XIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon, CalendarIcon, DragIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  // Drag & Drop props
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
  medium: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
  high: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800',
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
  draggable,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editCategory, setEditCategory] = useState<Category>(task.category);
  const [editDueDate, setEditDueDate] = useState<string>('');
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [subtaskText, setSubtaskText] = useState('');
  const [isExiting, setIsExiting] = useState(false);

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

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(task.id, {
        text: editText.trim(),
        priority: editPriority,
        category: editCategory,
        dueDate: editDueDate ? new Date(editDueDate).getTime() : undefined
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    setIsExiting(true);
    // Wait for animation to finish before removing from parent state
    setTimeout(() => {
      onDelete(task.id);
    }, 400);
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  
  const dueDateStr = task.dueDate ? new Date(task.dueDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : null;
  const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;

  const checkboxTheme = priorityCheckboxColors[task.priority];

  return (
    <div 
      className={`group flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 border-l-[4px] ${priorityBorderColors[task.priority]} rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
        ${isExiting ? 'animate-leave' : 'animate-enter'} 
        ${task.completed ? 'opacity-70 grayscale-[0.2]' : 'opacity-100'}`}
      draggable={draggable && !isEditing}
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop && onDrop(e, task.id)}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag Handle */}
        <div className="mt-1.5 cursor-move text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 hidden sm:block active:cursor-grabbing">
           <DragIcon size={16} />
        </div>

        {/* Checkbox */}
        <div className="flex items-center h-6 mt-1">
           <button
            onClick={() => onToggle(task.id)}
            className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${checkboxTheme.ring}
              ${task.completed 
                ? `${checkboxTheme.checked} text-white scale-100` 
                : `border-gray-300 text-transparent dark:border-gray-500 ${checkboxTheme.unchecked}`}`}
          >
            <CheckIcon size={14} className={task.completed ? 'animate-scale-in' : 'opacity-0'} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-3 animate-fade-in">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border border-indigo-300 dark:border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                autoFocus
              />
              
              <div className="flex flex-wrap gap-2">
                <select 
                  value={editPriority} 
                  onChange={(e) => setEditPriority(e.target.value as Priority)}
                  className="text-sm px-2 py-1.5 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <select 
                  value={editCategory} 
                  onChange={(e) => setEditCategory(e.target.value as Category)}
                  className="text-sm px-2 py-1.5 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500"
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
                  className="text-sm px-2 py-1.5 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500 text-gray-600 dark:text-gray-200"
                />
              </div>

              <div className="flex gap-3 text-sm font-medium mt-1">
                <button onMouseDown={handleSave} className="text-indigo-600 dark:text-indigo-400 hover:underline">Save Changes</button>
                <button onMouseDown={() => setIsEditing(false)} className="text-gray-500 dark:text-gray-400 hover:underline">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="flex flex-wrap gap-2 mb-1.5">
                 <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                  {task.priority}
                 </span>
                 <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                  {task.category}
                 </span>
              </div>
              
              <p className={`text-base leading-snug break-words transition-all duration-300 ${task.completed ? 'text-gray-400 line-through decoration-gray-400/50' : 'text-gray-800 dark:text-gray-100'}`}>
                {task.text}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2.5">
                {dueDateStr && (
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 ${isOverdue ? 'text-rose-500 border-rose-100 bg-rose-50 dark:bg-rose-900/20' : 'text-gray-500 dark:text-gray-400'}`}>
                    <CalendarIcon size={12} />
                    {dueDateStr}
                  </span>
                )}
                
                {task.attachments.length > 0 && (
                   <span className="text-xs text-indigo-500 dark:text-indigo-400 flex items-center gap-1 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800">
                     📎 {task.attachments.length}
                   </span>
                )}

                {totalSubtasks > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${completedSubtasks === totalSubtasks ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {completedSubtasks}/{totalSubtasks} Subtasks
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
           <button
             onClick={() => setIsExpanded(!isExpanded)}
             className={`p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : ''}`}
           >
             {isExpanded ? <ChevronDownIcon size={18} /> : <ChevronRightIcon size={18} />}
           </button>
           <button onClick={() => !task.completed && startEdit()} disabled={task.completed} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50">
             <EditIcon size={18} />
           </button>
           <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
             <TrashIcon size={18} />
           </button>
        </div>
      </div>

      {/* Subtasks Section */}
      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-4 sm:pl-14 rounded-b-xl animate-enter">
           {/* Attachment Preview */}
           {task.attachments.length > 0 && (
             <div className="mb-4">
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attachments</p>
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 {task.attachments.map(att => (
                   <div key={att.id} className="w-20 h-20 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden group/att relative">
                      {att.type.startsWith('image/') 
                        ? <img src={att.data} alt={att.name} className="w-full h-full object-cover transition-transform group-hover/att:scale-110" />
                        : <div className="w-full h-full flex flex-col items-center justify-center p-1"><span className="text-[10px] text-center text-gray-600 dark:text-gray-300 break-all line-clamp-2">{att.name}</span></div>
                      }
                   </div>
                 ))}
               </div>
             </div>
           )}

          <div className="space-y-2 mb-3">
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-3 group/sub animate-enter">
                 <button
                  onClick={() => onToggleSubtask(task.id, subtask.id)}
                  className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded border transition-all duration-200
                    ${subtask.completed 
                      ? `${checkboxTheme.checked} text-white` 
                      : `bg-white border-gray-300 text-transparent dark:bg-gray-800 dark:border-gray-600 ${checkboxTheme.unchecked}`}`}
                >
                  <CheckIcon size={10} className={subtask.completed ? 'animate-scale-in' : 'opacity-0'} />
                </button>
                <span className={`flex-1 text-sm transition-all duration-300 ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                  {subtask.text}
                </span>
                <button
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                  className="opacity-0 group-hover/sub:opacity-100 text-gray-400 hover:text-rose-500 p-1 transition-opacity"
                >
                  <XIcon size={14} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if(subtaskText.trim()) { onAddSubtask(task.id, subtaskText); setSubtaskText(''); } }} className="flex items-center gap-2 mt-2">
            <PlusIcon size={14} className="text-gray-400" />
            <input
              type="text"
              value={subtaskText}
              onChange={(e) => setSubtaskText(e.target.value)}
              placeholder="Add a new subtask..."
              className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-600 text-sm py-1 focus:border-indigo-500 focus:outline-none placeholder-gray-400 text-gray-700 dark:text-gray-300 transition-colors"
            />
            <button type="submit" disabled={!subtaskText.trim()} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 disabled:opacity-50 hover:text-indigo-700 uppercase tracking-wide">Add</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskItem;