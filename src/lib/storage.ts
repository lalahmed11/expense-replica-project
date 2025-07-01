
export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: '🍽️' },
  { id: 'transport', name: 'Transportation', icon: '🚗' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'health', name: 'Healthcare', icon: '🏥' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'utilities', name: 'Utilities', icon: '💡' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'other', name: 'Other', icon: '📄' },
];

const STORAGE_KEY = 'expenses';

export const getExpenses = (): Expense[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading expenses:', error);
    return [];
  }
};

export const saveExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
};

export const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
  const newExpense: Expense = {
    ...expense,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  
  const expenses = getExpenses();
  expenses.push(newExpense);
  saveExpenses(expenses);
  
  return newExpense;
};

export const updateExpense = (id: string, updates: Partial<Expense>): boolean => {
  const expenses = getExpenses();
  const index = expenses.findIndex(expense => expense.id === id);
  
  if (index === -1) return false;
  
  expenses[index] = { ...expenses[index], ...updates };
  saveExpenses(expenses);
  
  return true;
};

export const deleteExpense = (id: string): boolean => {
  const expenses = getExpenses();
  const filteredExpenses = expenses.filter(expense => expense.id !== id);
  
  if (filteredExpenses.length === expenses.length) return false;
  
  saveExpenses(filteredExpenses);
  return true;
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
