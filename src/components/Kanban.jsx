import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, X, Edit2, Check, MessageSquare, Send, ChevronDown, ChevronUp, ListTodo, Clock, CheckCircle2, AlertCircle, User, Users, Calendar, FolderKanban } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-hot-toast';

const COL_IDS = ['todo', 'in-progress', 'done', 'blocked'];
const COL_TITLES = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
  'blocked': 'Blocked'
};

const COL_ICONS = {
  'todo': ListTodo,
  'in-progress': Clock,
  'done': CheckCircle2,
  'blocked': AlertCircle
};

const COL_ICON_COLORS = {
  'todo': 'text-blue-500',
  'in-progress': 'text-amber-500',
  'done': 'text-emerald-500',
  'blocked': 'text-rose-500'
};

export default function Kanban({ editable = false, onTaskUpdate }) {
  const { user } = useAuth();
  const [data, setData] = useState({
    columns: COL_IDS.reduce((acc, id) => ({
      ...acc,
      [id]: { id, title: COL_TITLES[id], taskIds: [] }
    }), {}),
    tasks: {},
    columnOrder: COL_IDS
  });
  const [taskInputs, setTaskInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [filterMine, setFilterMine] = useState(user?.role !== 'admin');
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const isEditable = editable || user?.role === 'admin' || user?.role === 'pm';

  useEffect(() => {
    fetchTasks();
    if (isEditable) {
      fetchUsers();
      fetchProjects();
    }
  }, [isEditable]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (res.data.length > 0) {
        const initial = {};
        COL_IDS.forEach(id => initial[id] = res.data[0]._id);
        setSelectedProjects(initial);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      const tasks = res.data;

      const transformedTasks = {};
      const columns = COL_IDS.reduce((acc, id) => ({
        ...acc,
        [id]: { id, title: COL_TITLES[id], taskIds: [] }
      }), {});

      tasks.forEach(task => {
        transformedTasks[task._id] = {
          id: task._id,
          content: task.title,
          assignee: task.assignee,
          project: task.project,
          commentsCount: task.commentsCount || 0,
          hasUnreadComments: task.hasUnreadComments || false,
          status: task.status,
          dueDate: task.dueDate
        };
        const colId = columns[task.status] ? task.status : 'todo';
        columns[colId].taskIds.push(task._id);
      });

      setData({ tasks: transformedTasks, columns, columnOrder: COL_IDS });
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (taskId) => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/tasks/${taskId}/comments`);
      setComments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleOpenComments = (task) => {
    setSelectedTask(task);
    fetchComments(task.id);

    // Mark as read locally
    if (task.hasUnreadComments) {
      setData(prev => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [task.id]: {
            ...prev.tasks[task.id],
            hasUnreadComments: false
          }
        }
      }));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/tasks/${selectedTask.id}/comments`, { content: newComment });
      setComments(prev => [res.data, ...prev]);
      setNewComment('');
      setData(prev => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [selectedTask.id]: {
            ...prev.tasks[selectedTask.id],
            commentsCount: (prev.tasks[selectedTask.id].commentsCount || 0) + 1
          }
        }
      }));
    } catch (e) {
      console.error(e);
      toast.error('Failed to add comment');
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];
    const task = data.tasks[draggableId];

    if (destination.droppableId === 'in-progress' && !task.assignee) {
      toast.error("Please assign an owner to this task before moving it to In Progress!");
      return;
    }
    if ((source.droppableId === 'done' || source.droppableId === 'blocked') && user.role !== 'admin') {
      toast.error(`Only an Administrator can move tasks out of the ${source.droppableId.toUpperCase()} state!`);
      return;
    }

    const newData = { ...data };
    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      newData.columns[start.id] = { ...start, taskIds: newTaskIds };
    } else {
      const startTaskIds = Array.from(start.taskIds);
      startTaskIds.splice(source.index, 1);
      const finishTaskIds = Array.from(finish.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      newData.columns[start.id] = { ...start, taskIds: startTaskIds };
      newData.columns[finish.id] = { ...finish, taskIds: finishTaskIds };
    }
    setData(newData);

    if (start !== finish) {
      try {
        await api.post(`/tasks/${draggableId}/status`, { status: destination.droppableId });
        if (onTaskUpdate) onTaskUpdate();
      } catch (e) {
        console.error('Failed to update task status', e);
        fetchTasks();
      }
    }
  };

  const addTask = async (columnId) => {
    const text = taskInputs[columnId];
    if (!text?.trim()) return;

    try {
      const res = await api.post('/tasks', {
        title: text.trim(),
        status: columnId,
        project: selectedProjects[columnId]
      });
      const newTask = res.data;
      setData(prev => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [newTask._id]: {
            id: newTask._id,
            content: newTask.title,
            project: newTask.project,
            commentsCount: 0,
            dueDate: newTask.dueDate
          }
        },
        columns: {
          ...prev.columns,
          [columnId]: {
            ...prev.columns[columnId],
            taskIds: [newTask._id, ...prev.columns[columnId].taskIds]
          }
        }
      }));
      setTaskInputs(prev => ({ ...prev, [columnId]: '' }));
      if (onTaskUpdate) onTaskUpdate();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const deleteTask = async (taskId, columnId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setData(prev => {
        const newTasks = { ...prev.tasks };
        delete newTasks[taskId];
        const newTaskIds = prev.columns[columnId].taskIds.filter(id => id !== taskId);
        return { ...prev, tasks: newTasks, columns: { ...prev.columns, [columnId]: { ...prev.columns[columnId], taskIds: newTaskIds } } };
      });
      if (onTaskUpdate) onTaskUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditValue(task.content);
  };

  const saveEdit = async (taskId) => {
    if (!editValue.trim()) return;
    try {
      await api.patch(`/tasks/${taskId}`, { title: editValue });
      setData(prev => ({
        ...prev,
        tasks: { ...prev.tasks, [taskId]: { ...prev.tasks[taskId], content: editValue } }
      }));
      setEditingTaskId(null);
      if (onTaskUpdate) onTaskUpdate();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save edit');
    }
  };

  const handleDateChange = async (taskId, newDate) => {
    try {
      await api.patch(`/tasks/${taskId}`, { dueDate: newDate });
      setData(prev => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: { ...prev.tasks[taskId], dueDate: newDate }
        }
      }));
      if (onTaskUpdate) onTaskUpdate();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update due date');
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditValue('');
  };

  const handleAssign = async (taskId, userId) => {
    // Check if task has a due date before assigning
    const task = data.tasks[taskId];
    if (!task.dueDate && userId) {
      toast.error("Please set a due date for the task before assigning it to a user.");
      return;
    }

    try {
      const res = await api.put(`/tasks/${taskId}/assign`, { assigneeId: userId });
      setData(prev => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: { ...prev.tasks[taskId], assignee: res.data.assignee }
        }
      }));
    } catch (e) {
      console.error(e);
      toast.error('Assignment failed');
    }
  };

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  if (loading) return <LoadingSpinner text="Loading tasks..." />;

  return (
    <div className="w-full h-auto xl:h-[600px] flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FolderKanban className="text-white" size={24} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            Kanban Board
          </h3>
        </div>
        {user?.role === 'pm' && (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilterMine(true)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${filterMine ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <User size={12} />
              My Tasks
            </button>
            <button
              onClick={() => setFilterMine(false)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${!filterMine ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Users size={12} />
              All Tasks
            </button>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 items-start pb-4 h-auto xl:h-[500px]">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds
              .map(taskId => data.tasks[taskId])
              .filter(task => !task ? false : (filterMine ? task.assignee?._id === user?.id : true));

            return (
              <div key={column.id} className="flex flex-col h-[500px] bg-slate-50/10 dark:bg-slate-900/40 rounded-[1rem] border border-slate-300 dark:border-slate-800/50">
                <div className="p-6 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {COL_ICONS[column.id] && React.createElement(COL_ICONS[column.id], {
                      size: 16,
                      className: COL_ICON_COLORS[column.id]
                    })}
                    <h3 className="text-xs font-black text-slate-600 dark:text-slate-500 uppercase tracking-[0.2em]">
                      {COL_TITLES[column.id]}
                    </h3>
                  </div>
                  <span className="bg-white dark:bg-slate-800 text-[12px] px-2.5 py-1 rounded-full text-indigo-600 font-bold shadow-sm border border-indigo-100 dark:border-slate-700">
                    {tasks.length}
                  </span>
                </div>

                {/* Add task section */}
                {isEditable && !filterMine && column.id === 'todo' && (
                  <div className="px-2 pb-4">
                    <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Assign a project task to an assignee</label>
                        <div className="relative">
                          <select
                            className="w-full text-xs h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                            value={selectedProjects[column.id] || ''}
                            onChange={(e) => setSelectedProjects(prev => ({ ...prev, [column.id]: e.target.value }))}
                          >
                            {projects.map(project => (
                              <option key={project._id} value={project._id}>{project.title}</option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown size={14} />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                          placeholder="Add task..."
                          value={taskInputs[column.id] || ''}
                          onChange={e => setTaskInputs(prev => ({ ...prev, [column.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') addTask(column.id); }}
                        />
                        <button
                          onClick={() => addTask(column.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-2.5 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center min-w-[40px]"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scrollable Droppable */}
                <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/50 scrollbar-track-slate-200/20">
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-2 transition-colors rounded-[1rem] min-h-full
                          ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}
                      >
                        {tasks.map((task, index) => {
                          if (!task) return null;
                          return (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                              isDragDisabled={!isEditable && task.assignee?._id !== user?.id}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white dark:bg-slate-800 p-2 rounded-[0.5rem] shadow-sm border border-slate-200 dark:border-slate-800 mb-3 group relative select-none
                                  transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-900/50 active:scale-[0.98]
                                  ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500/20 rotate-2 z-50' : ''}
                                  ${(!editable && task.assignee?._id !== user?.id) ? 'opacity-75 grayscale-[0.5]' : 'cursor-grab'}
                                `}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    {editingTaskId === task.id ? (
                                      <div className="flex-1 flex flex-col gap-2">
                                        <input
                                          autoFocus
                                          className="w-full bg-slate-50 dark:bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-sm outline-none"
                                          value={editValue}
                                          onChange={e => setEditValue(e.target.value)}
                                          onKeyDown={e => {
                                            if (e.key === 'Enter') saveEdit(task.id);
                                            if (e.key === 'Escape') cancelEdit();
                                          }}
                                        />
                                        <div className="flex justify-end gap-2">
                                          <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                          <button onClick={() => saveEdit(task.id)} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1">
                                            <Check size={14} /> Save
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-2">
                                          <FolderKanban size={10} className="text-indigo-500" />
                                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest truncate">
                                            {task.project?.title || 'General'}
                                          </span>
                                        </div>
                                        <div className="flex flex-col mb-3">
                                          <span className={`text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight block ${expandedTasks.has(task.id) ? 'whitespace-normal' : 'truncate'}`}>
                                            {task.content}
                                          </span>
                                          {task.content.length > 30 && (
                                            <button
                                              onClick={() => toggleExpand(task.id)}
                                              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5 mt-1 transition-colors w-fit"
                                            >
                                              {expandedTasks.has(task.id) ? (
                                                <><ChevronUp size={12} /> Show Less</>
                                              ) : (
                                                <><ChevronDown size={12} /> Read More</>
                                              )}
                                            </button>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-3 mt-4">
                                          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Due:</span>

                                          {/* Date Picker Section */}
                                          <div className="flex-shrink-0">
                                            {isEditable && (user.role === 'admin' || user.role === 'pm') ? (
                                              <div className="relative group/date"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  e.currentTarget.querySelector('input')?.showPicker();
                                                }}
                                              >
                                                <div className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all
                                                  ${task.dueDate ? 'bg-indigo-50/70 text-indigo-600 border-indigo-100/50 hover:bg-indigo-100 hover:border-indigo-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-indigo-200'}
                                                `}>
                                                  <Calendar size={13} strokeWidth={2.5} className={task.dueDate ? 'text-indigo-400' : 'text-slate-300'} />
                                                  <span className="text-[11px] font-bold">
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Set Date'}
                                                  </span>
                                                </div>
                                                <input
                                                  type="date"
                                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                                  value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                                  onChange={(e) => handleDateChange(task.id, e.target.value)}
                                                />
                                              </div>
                                            ) : task.dueDate && (
                                              <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-500 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                                                <Calendar size={13} strokeWidth={2.5} className="text-slate-400" />
                                                <span className="text-[11px] font-bold">
                                                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                          {/* Assignee Section */}
                                          <div className="flex-1 min-w-0" title={task.assignee?.name}>
                                            {isEditable ? (
                                              <div className="relative">
                                                <select
                                                  disabled={(column.id === 'in-progress' || column.id === 'done') && user?.role !== 'admin'}
                                                  className={`w-full text-[11px] font-bold bg-slate-50/80 hover:bg-slate-100/100 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5 outline-none transition-all cursor-pointer appearance-none pr-8
                                                  ${(column.id === 'in-progress' || column.id === 'done') && user?.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}
                                                  ${!task.assignee ? 'text-slate-400 italic font-medium' : 'text-slate-600 dark:text-slate-300'}
                                                `}
                                                  value={task.assignee?._id || ''}
                                                  onChange={(e) => handleAssign(task.id, e.target.value)}
                                                >
                                                  <option value="">Unassigned</option>
                                                  {users
                                                    .filter(u => {
                                                      if (user?.role === 'pm') return u.role === 'member';
                                                      return true;
                                                    })
                                                    .map(u => (
                                                      <option key={u._id} value={u._id}>
                                                        {u.name}{u._id === user?.id ? ' (ME)' : ''}
                                                      </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                  <ChevronDown size={14} strokeWidth={2.5} />
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-500 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 italic overflow-hidden">
                                                <User size={12} strokeWidth={2.5} className="text-slate-400" />
                                                <span className="text-[11px] font-bold truncate">
                                                  {task.assignee ? (task.assignee.name + (task.assignee._id === user?.id ? ' (ME)' : '')) : 'Unassigned'}
                                                </span>
                                              </div>
                                            )}
                                          </div>

                                          {/* Comments Section */}
                                          <button
                                            onClick={() => handleOpenComments(task)}
                                            className="flex-shrink-0 flex items-center gap-1 text-slate-400 hover:text-indigo-500 transition-colors px-1 h-8 group/comment"
                                          >
                                            <div className="relative">
                                              <MessageSquare size={17} strokeWidth={1.5} className="group-hover/comment:scale-110 transition-transform text-slate-300 group-hover/comment:text-indigo-400" />
                                              {task.hasUnreadComments && (
                                                <span className="absolute -top-1 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
                                              )}
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-400 group-hover/comment:text-indigo-500">{task.commentsCount > 0 ? task.commentsCount : '0'}</span>
                                          </button>
                                        </div>

                                        {/* Action Buttons (Hover) */}
                                        {isEditable && (
                                          <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-slate-800 pl-2 shadow-[-10px_0_10px_#ffffff] dark:shadow-[-10px_0_10px_#1e293b]">
                                            {(column.id !== 'done' || user?.role === 'admin') && (
                                              <>
                                                <button onClick={() => startEdit(task)} className="p-1 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-all">
                                                  <Edit2 size={12} />
                                                </button>
                                                <button onClick={() => deleteTask(task.id, column.id)} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                                                  <Trash2 size={12} />
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Comments Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-800 dark:text-white truncate pr-4">
                Comments on "{selectedTask.content}"
              </h3>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingComments ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="mx-auto text-slate-200 dark:text-slate-700 mb-2" size={40} />
                  <p className="text-slate-400 text-sm italic">No comments yet</p>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{comment.author?.name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex gap-2">
                <textarea
                  rows="2"
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                />
                <button
                  disabled={!newComment.trim()}
                  onClick={handleAddComment}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
