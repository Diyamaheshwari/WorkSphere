import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Award, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

const DONUT_COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#CBD5E1'];

export const AnalyticsReportsView = ({
  stats = {},
  tasksByCategory = [],
  monthlyProgress = [],
}) => {
  // Fallback defaults matching Image 1
  const monthlyData = monthlyProgress.length > 0 ? monthlyProgress : [
    { month: 'Jan', completed: 55, created: 30 },
    { month: 'Feb', completed: 60, created: 35 },
    { month: 'Mar', completed: 70, created: 29 },
    { month: 'Apr', completed: 85, created: 40 },
    { month: 'May', completed: 92, created: 45 },
    { month: 'Jun', completed: 110, created: 52 },
  ];

  const efficiencyData = [
    { month: 'Jan', efficiency: 65 },
    { month: 'Feb', efficiency: 98 },
    { month: 'Mar', efficiency: 45 },
    { month: 'Apr', efficiency: 118 },
    { month: 'May', efficiency: 90 },
    { month: 'Jun', efficiency: 105 },
  ];

  const donutData = [
    { name: 'Sun', value: 87 },
    { name: 'Mon', value: 92 },
    { name: 'Tue', value: 92 },
    { name: 'Wed', value: 95 },
    { name: 'Thu', value: 63 },
  ];

  const categories = tasksByCategory.length > 0 ? tasksByCategory : [
    { category: 'Development', count: 48 },
    { category: 'Design', count: 42 },
    { category: 'Testing', count: 26 },
    { category: 'Documentation', count: 18 },
    { category: 'Planning', count: 22 },
    { category: 'Other', count: 10 },
  ];

  const maxCategoryCount = Math.max(...categories.map((c) => c.count), 50);

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards (matching Image 1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1 */}
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-3.5 sm:p-6 text-center shadow-2xs">
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.completionRate || '94.2'}%
          </p>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-1">Task Completion Rate</p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-3.5 sm:p-6 text-center shadow-2xs">
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.avgResponseTime || '2.4h'}
          </p>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-1">Average Response Time</p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-3.5 sm:p-6 text-center shadow-2xs">
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.teamVelocity || stats.velocity || '18.5'}
          </p>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-1">Team Velocity</p>
        </div>

        {/* Card 4 */}
        <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-3.5 sm:p-6 text-center shadow-2xs">
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.sprintSuccessRate || '87%'}
          </p>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-1">Sprint Success Rate</p>
        </div>
      </div>

      {/* Row 2: Monthly Progress & Team Efficiency Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Progress Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Progress</h3>
              <p className="text-xs text-slate-500">Task completion trends over 6 months</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="urlColorCompleted"
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  stroke="#94A3B8"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Efficiency Trend */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Team Efficiency Trend</h3>
              <p className="text-xs text-slate-500">Overall efficiency percentage over time</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="efficiency" radius={[6, 6, 0, 0]} fill="#E2E8F0">
                  {efficiencyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.month === 'Apr' ? '#1D4ED8' : '#E2E8F0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Tasks by Category, Quick Insights, Productivity Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Tasks by Category */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Tasks by Category</h3>
          <p className="text-xs text-slate-500 mb-5">Distribution across different work categories</p>

          <div className="space-y-4">
            {categories.map((c) => {
              const widthPct = Math.round((c.count / maxCategoryCount) * 100);
              const isHighlight = c.category === 'Design';

              return (
                <div key={c.category}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{c.category}</span>
                    <span className="text-slate-500">{c.count} tasks</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isHighlight ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.max(8, widthPct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Insights Cards (matching Image 1 middle card) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Quick Insights</h3>
            <p className="text-xs text-slate-500 mb-4">Key intelligence for workspace optimization</p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Best day: Wednesday (95%)</p>
                <p className="text-[11px] text-slate-500">Highest task completion rate recorded midweek.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Overdue Tasks Decreased by 5%</p>
                <p className="text-[11px] text-slate-500">Improvement in meeting scheduled deadlines.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Team Velocity Up 12% This Week</p>
                <p className="text-[11px] text-slate-500">More tasks completed with improved efficiency.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  At-Risk Projects: {stats.projectsAtRisk ?? 1}
                </p>
                <p className="text-[11px] text-slate-500">Target milestone closely monitored.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Trends Donut Chart (matching Image 1 right card) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Productivity Trends</h3>
            <p className="text-xs text-slate-500 mb-2">Weekly distribution percentage</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF]"></span>
              <span>Sun: 87%</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
              <span>Mon: 92%</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]"></span>
              <span>Tue: 92%</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#93C5FD]"></span>
              <span>Wed: 95%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReportsView;
