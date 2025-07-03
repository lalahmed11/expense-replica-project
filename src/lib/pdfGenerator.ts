
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, EXPENSE_CATEGORIES } from './storage';

export const generateMonthlyExpensePDF = (expenses: Expense[], month: string, year: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Monthly Expense Report', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`${month} ${year}`, 20, 30);
  
  // Filter expenses for the specific month and year
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.toLocaleDateString('en-US', { month: 'long' });
    const expenseYear = expenseDate.getFullYear().toString();
    return expenseMonth === month && expenseYear === year;
  });
  
  if (monthlyExpenses.length === 0) {
    doc.setFontSize(14);
    doc.setTextColor(150, 150, 150);
    doc.text('No expenses found for this month.', 20, 50);
    return doc;
  }
  
  // Summary section
  const totalAmount = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalTransactions = monthlyExpenses.length;
  
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Summary:', 20, 45);
  
  doc.setFontSize(12);
  doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 20, 55);
  doc.text(`Total Transactions: ${totalTransactions}`, 20, 65);
  
  // Prepare data for the table
  const tableData = monthlyExpenses.map(expense => {
    const categoryInfo = EXPENSE_CATEGORIES.find(cat => cat.id === expense.category) || EXPENSE_CATEGORIES.find(cat => cat.id === 'other')!;
    return [
      new Date(expense.date).toLocaleDateString(),
      expense.description,
      categoryInfo.name,
      `$${expense.amount.toFixed(2)}`
    ];
  });
  
  // Add expenses table
  autoTable(doc, {
    head: [['Date', 'Description', 'Category', 'Amount']],
    body: tableData,
    startY: 80,
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      3: { halign: 'right' }
    }
  });
  
  // Category breakdown
  const categoryBreakdown = EXPENSE_CATEGORIES.map(category => {
    const categoryExpenses = monthlyExpenses.filter(expense => expense.category === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      name: category.name,
      amount: total,
      count: categoryExpenses.length
    };
  }).filter(item => item.amount > 0);
  
  if (categoryBreakdown.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Category Breakdown:', 20, finalY + 20);
    
    const categoryTableData = categoryBreakdown.map(item => [
      item.name,
      item.count.toString(),
      `$${item.amount.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      head: [['Category', 'Transactions', 'Amount']],
      body: categoryTableData,
      startY: finalY + 30,
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        2: { halign: 'right' }
      }
    });
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 10);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
  }
  
  return doc;
};
