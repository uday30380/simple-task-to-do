import React, { MouseEvent } from 'react';

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'Work' | 'Study' | 'Shopping' | 'Personal' | 'Other';
export type FilterType = 'all' | 'pending' | 'completed';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // Base64
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: number;
  priority: Priority;
  category: Category;
  subtasks: SubTask[];
  attachments: Attachment[];
}

export interface IconProps {
  className?: string;
  size?: number;
  onClick?: (e: MouseEvent) => void;
}