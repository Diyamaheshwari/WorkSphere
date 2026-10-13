import { useState } from 'react';
import {
  Plus,
  MoreVertical,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  User as UserIcon,
} from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'Todo List', color: 'border-slate-300' },
  { id: 'in_progress', title: 'In Progress', color: 'border-amber-400' },
  { id: 'review', title: 'Review', color: 'border-purple-400' },
  { id: 'completed', title: 'Done', color: 'border-emerald-500' },
];

export const ActionPathBoard = ({
  tasks = [],
  teamMembers = [],
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onAddComment,
  onCreateTask,
  currentUserId,
  userRole,
}) => {
  const [activeCommentTask, setActiveCommentTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onStatusChange) {
      onStatusChange(taskId, newStatus);
    }
  };

  const handleCommentSubmit = (e, taskId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(taskId, commentText.trim());
    setCommentText('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedAssignee !== 'all' && t.assignedTo?._id !== selectedAssignee) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    return true;
  });

  const getHealthBadge = (health, status) => {
    if (status === 'completed') {
      return (
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          On Track
        </span>
      );
    }
    if (health === 'behind') {
      return (
        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
          Behind
        </span>
      );
    }
    if (health === 'at_risk') {
      return (
        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
          At Risk
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
        On Track
      </span>
    );
  };

  const getProgressBarColor = (progress, health, status) => {
    if (status === 'completed' || progress === 100) return 'bg-emerald-500';
    if (health === 'behind') return 'bg-rose-500';
    if (health === 'at_risk') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-5">
      {/* Top Filter Bar (matching Image 2 header) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        {/* Team Members Filter Strip */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Team members:</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {teamMembers.slice(0, 5).map((m, idx) => (
                <div
                  key={m._id || idx}
                  title={`${m.name} (${m.title || m.role})`}
                  className="w-7 h-7 rounded-full bg-slate-800 text-white border-2 border-white text-[11px] font-bold flex items-center justify-center shrink-0 cursor-pointer shadow-xs hover:scale-110 transition"
                  onClick={() => setSelectedAssignee(selectedAssignee === m._id ? 'all' : m._id)}
                >
                  {m.name.charAt(0)}
                </div>
              ))}
              {teamMembers.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 border-2 border-white text-[10px] font-bold flex items-center justify-center">
                  +{teamMembers.length - 5}
                </div>
              )}
            </div>
          </div>

          {selectedAssignee !== 'all' && (
            <button
              onClick={() => setSelectedAssignee('all')}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Priority & Create Actions */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {onCreateTask && (
            <button
              onClick={onCreateTask}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Kanban Columns (matching Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-3.5 min-h-[550px] flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight">{col.title}</h3>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                {onCreateTask && (
                  <button
                    onClick={onCreateTask}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Column Task Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-xl">
                    Drop tasks here
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const progress = task.progress ?? (task.status === 'completed' ? 100 : 0);
                    const isMine = task.assignedTo?._id === currentUserId;

                    return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
                        className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition cursor-grab active:cursor-grabbing group"
                      >
                        {/* Status Badge & Three Dots */}
                        <div className="flex items-center justify-between mb-2.5">
                          {getHealthBadge(task.health, task.status)}
                          <div className="flex items-center space-x-1">
                            {onEditTask && (
                              <button
                                onClick={() => onEditTask(task)}
                                className="text-slate-400 hover:text-indigo-600 text-xs opacity-0 group-hover:opacity-100 transition p-1"
                                title="Edit Task"
                              >
                                ✏️
                              </button>
                            )}
                            {onDeleteTask && (userRole === 'manager' || userRole === 'admin') && (
                              <button
                                onClick={() => onDeleteTask(task._id)}
                                className="text-slate-400 hover:text-rose-600 text-xs opacity-0 group-hover:opacity-100 transition p-1"
                                title="Delete Task"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                          {task.title}
                        </h4>

                        {/* Description */}
                        {task.description && (
                          <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Progress Bar (matching Image 2) */}
                        <div className="mb-3 pt-1">
                          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 mb-1">
                            <span>Progress</span>
                            <span className="text-slate-800 font-bold">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(
                                progress,
                                task.health,
                                task.status
                              )}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Assignee & Due Date */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          <div className="flex items-center space-x-1.5 truncate max-w-[130px]">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {task.assignedTo?.name ? task.assignedTo.name.charAt(0) : '?'}
                            </div>
                            <span
                              className={`truncate font-medium ${
                                isMine ? 'text-indigo-600 font-bold' : 'text-slate-700'
                              }`}
                            >
                              {task.assignedTo?.name || 'Unassigned'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {task.dueDate && (
                              <span className="flex items-center space-x-0.5 text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              </span>
                            )}
                            <button
                              onClick={() =>
                                setActiveCommentTask(activeCommentTask === task._id ? null : task._id)
                              }
                              className="text-slate-400 hover:text-indigo-600 flex items-center space-x-0.5"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>{task.comments?.length || 0}</span>
                            </button>
                          </div>
                        </div>

                        {/* Quick Mobile/Click Status Selector */}
                        <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Move to:</span>
                          <select
                            value={task.status}
                            onChange={(e) => onStatusChange(task._id, e.target.value)}
                            className="text-[11px] border border-slate-200 rounded-md px-2 py-0.5 bg-slate-50 text-slate-700 focus:outline-none"
                          >
                            <option value="todo">Todo List</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Done</option>
                          </select>
                        </div>

                        {/* Comments Drawer */}
                        {activeCommentTask === task._id && (
                          <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-2.5 rounded-xl">
                            <p className="text-[11px] font-bold text-slate-700 mb-2">Discussion</p>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto mb-2 pr-1">
                              {task.comments?.length === 0 ? (
                                <p className="text-[10px] text-slate-400 italic">No comments yet</p>
                              ) : (
                                task.comments?.map((c, i) => (
                                  <div key={i} className="bg-white p-2 rounded-lg border border-slate-200 text-xs">
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-0.5">
                                      <span className="font-bold text-slate-800">{c.user?.name || 'Member'}</span>
                                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-slate-600 text-[11px]">{c.text}</p>
                                  </div>
                                ))
                              )}
                            </div>
                            <form onSubmit={(e) => handleCommentSubmit(e, task._id)} className="flex gap-1.5">
                              <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a note..."
                                className="flex-1 text-xs border border-slate-300 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              <button
                                type="submit"
                                className="bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-lg font-semibold"
                              >
                                Post
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionPathBoard;
