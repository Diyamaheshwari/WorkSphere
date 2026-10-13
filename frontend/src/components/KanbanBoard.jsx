import { useState } from 'react';

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'border-slate-400 bg-slate-50', countBadge: 'bg-slate-200 text-slate-700' },
  { id: 'in_progress', title: 'In Progress', color: 'border-amber-500 bg-amber-50/50', countBadge: 'bg-amber-100 text-amber-800' },
  { id: 'completed', title: 'Completed', color: 'border-emerald-500 bg-emerald-50/50', countBadge: 'bg-emerald-100 text-emerald-800' },
];

export const KanbanBoard = ({
  tasks = [],
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onAddComment,
  currentUserId,
  userRole,
}) => {
  const [activeCommentTask, setActiveCommentTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId && onStatusChange) {
      onStatusChange(taskId, newStatus);
    }
    setDraggedTaskId(null);
  };

  const handleCommentSubmit = (e, taskId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(taskId, commentText.trim());
    setCommentText('');
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const canManageAll = userRole === 'manager' || userRole === 'admin';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`rounded-xl border-t-4 ${col.color} bg-white shadow-sm p-4 transition duration-150 min-h-[450px] flex flex-col`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">{col.title}</h3>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${col.countBadge}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards Container */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[650px] pr-1">
              {colTasks.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs italic border-2 border-dashed border-gray-200 rounded-lg">
                  Drop tasks here
                </div>
              ) : (
                colTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.status);
                  const isAssignedToMe = task.assignedTo?._id === currentUserId;

                  return (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className={`bg-white rounded-lg border ${
                        overdue ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'
                      } p-4 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing`}
                    >
                      {/* Project Tag & Priority */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {task.project ? (
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded truncate max-w-[150px]">
                            📁 {task.project.title}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">General</span>
                        )}

                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                            PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-gray-800 text-sm mb-1 leading-snug">
                        {task.title}
                      </h4>

                      {/* Description */}
                      {task.description && (
                        <p className="text-gray-500 text-xs line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      {/* Assignee & Due Date */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 mb-2">
                        <div className="flex items-center space-x-1.5 truncate max-w-[130px]">
                          <span className="text-sm">👤</span>
                          <span className={`truncate font-medium ${isAssignedToMe ? 'text-blue-600 font-bold' : ''}`}>
                            {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                          </span>
                        </div>

                        {task.dueDate && (
                          <div className={`flex items-center space-x-1 ${overdue ? 'text-red-600 font-bold' : ''}`}>
                            <span>📅</span>
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Mobile/Click Status Changer */}
                      <div className="flex items-center justify-between pt-1 gap-1">
                        <select
                          value={task.status}
                          onChange={(e) => onStatusChange(task._id, e.target.value)}
                          className="text-[11px] bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-700 cursor-pointer focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveCommentTask(activeCommentTask === task._id ? null : task._id)
                            }
                            className="text-[11px] text-gray-500 hover:text-blue-600 flex items-center space-x-0.5"
                            title="Comments"
                          >
                            <span>💬</span>
                            <span>{task.comments?.length || 0}</span>
                          </button>

                          {canManageAll && onEditTask && (
                            <button
                              type="button"
                              onClick={() => onEditTask(task)}
                              className="text-xs text-gray-400 hover:text-blue-600"
                              title="Edit"
                            >
                              ✏️
                            </button>
                          )}

                          {canManageAll && onDeleteTask && (
                            <button
                              type="button"
                              onClick={() => onDeleteTask(task._id)}
                              className="text-xs text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Comments Drawer */}
                      {activeCommentTask === task._id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 bg-gray-50/70 p-2 rounded-lg">
                          <p className="text-[11px] font-bold text-gray-700 mb-2">Comments</p>

                          <div className="space-y-2 max-h-36 overflow-y-auto mb-2 pr-1">
                            {task.comments?.length === 0 ? (
                              <p className="text-[11px] text-gray-400 italic">No comments yet</p>
                            ) : (
                              task.comments?.map((c, i) => (
                                <div key={i} className="bg-white p-2 rounded border border-gray-200 text-xs">
                                  <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                                    <span className="font-semibold text-gray-700">{c.user?.name || 'User'}</span>
                                    <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-gray-600">{c.text}</p>
                                </div>
                              ))
                            )}
                          </div>

                          <form onSubmit={(e) => handleCommentSubmit(e, task._id)} className="flex gap-1">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a comment..."
                              className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                            <button
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded font-medium"
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
  );
};

export default KanbanBoard;
