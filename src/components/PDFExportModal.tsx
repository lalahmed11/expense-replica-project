
import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,  
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateMonthlyExpensePDF } from '@/lib/pdfGenerator';
import { Expense } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

const PDFExportModal = ({ isOpen, onClose, expenses }: PDFExportModalProps) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Get unique months and years from expenses
  const availableMonthsYears = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear().toString();
    const key = `${month}-${year}`;
    
    if (!acc.some(item => item.key === key)) {
      acc.push({ key, month, year });
    }
    return acc;
  }, [] as Array<{ key: string; month: string; year: string }>);

  const handleGeneratePDF = async () => {
    if (!selectedMonth || !selectedYear) {
      toast({
        title: "Missing Information",
        description: "Please select both month and year.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const doc = generateMonthlyExpensePDF(expenses, selectedMonth, selectedYear);
      doc.save(`expense-report-${selectedMonth}-${selectedYear}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Your monthly expense report has been downloaded.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from(new Set(availableMonthsYears.map(item => item.year))).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export Monthly Report
          </DialogTitle>
          <DialogDescription>
            Generate a PDF report of your expenses for a specific month.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMonth && selectedYear && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Preview:</strong> Expense report for {selectedMonth} {selectedYear}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {expenses.filter(expense => {
                  const date = new Date(expense.date);
                  const month = date.toLocaleDateString('en-US', { month: 'long' });
                  const year = date.getFullYear().toString();
                  return month === selectedMonth && year === selectedYear;
                }).length} expenses found
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGenerating || !selectedMonth || !selectedYear}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isGenerating ? (
                'Generating...'
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFExportModal;
