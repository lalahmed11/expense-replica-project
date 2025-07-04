import { useState } from 'react';
import { Edit2, Trash2, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Expense, deleteExpense, getExpenses, EXPENSE_CATEGORIES } from '@/lib/storage';
import EditExpenseModal from './EditExpenseModal';
import { useToast } from '@/hooks/use-toast';

interface ExpenseListProps {
  expenses: Expense[];
  onExpensesUpdate: (expenses: Expense[]) => void;
  showActions?: boolean;
}

const ExpenseList = ({ expenses, onExpensesUpdate, showActions = true }: ExpenseListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    if (deleteExpense(id)) {
      onExpensesUpdate(getExpenses());
      toast({
        title: "Expense Deleted",
        description: "The expense has been removed successfully.",
      });
    }
    setDeleteId(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditExpense(expense);
  };

  const handleExpenseUpdated = () => {
    onExpensesUpdate(getExpenses());
    setEditExpense(null);
    toast({
      title: "Expense Updated",
      description: "Your expense has been updated successfully.",
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    return EXPENSE_CATEGORIES.find(cat => cat.id === categoryId) || EXPENSE_CATEGORIES.find(cat => cat.id === 'other')!;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg font-medium">No expenses found</p>
        <p className="text-sm">Start by adding your first expense</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold text-right">Amount</TableHead>
              {showActions && <TableHead className="font-semibold text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const categoryInfo = getCategoryInfo(expense.category);
              return (
                <TableRow key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <span>{categoryInfo.icon}</span>
                      <span className="text-xs">{categoryInfo.name}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    ₹{expense.amount.toFixed(2)}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(expense)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(expense.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editExpense && (
        <EditExpenseModal
          expense={editExpense}
          onExpenseUpdated={handleExpenseUpdated}
          onClose={() => setEditExpense(null)}
        />
      )}
    </>
  );
};

export default ExpenseList;
