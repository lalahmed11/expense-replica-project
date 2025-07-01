
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Expense, EXPENSE_CATEGORIES } from '@/lib/storage';

interface ExpenseChartProps {
  expenses: Expense[];
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

const ExpenseChart = ({ expenses }: ExpenseChartProps) => {
  // Prepare data for category breakdown
  const categoryData = EXPENSE_CATEGORIES.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      name: category.name,
      value: total,
      icon: category.icon,
    };
  }).filter(item => item.value > 0);

  // Prepare data for monthly trends
  const monthlyData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthName, amount: 0 };
    }
    acc[monthKey].amount += expense.amount;
    
    return acc;
  }, {} as Record<string, { month: string; amount: number }>);

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => 
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No expenses yet</p>
          <p className="text-sm">Add some expenses to see your spending trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Spending by Category</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.slice(0, 6).map((item, index) => (
              <div key={item.name} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="mr-1">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {monthlyChartData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Trends</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;
