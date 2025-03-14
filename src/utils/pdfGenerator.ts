
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Expense, Participant, Trip } from '@/types';
import { formatCurrency, getParticipantName } from './expenseCalculator';

// Generate full trip PDF report
export const generateTripPDF = async (trip: Trip): Promise<void> => {
  // Create a temporary div to render the report content
  const reportContainer = document.createElement('div');
  reportContainer.className = 'pdf-report';
  reportContainer.style.width = '595px'; // A4 width in pixels at 72 DPI
  reportContainer.style.padding = '40px';
  reportContainer.style.fontFamily = 'Arial, sans-serif';
  reportContainer.style.position = 'absolute';
  reportContainer.style.left = '-9999px';
  
  // Add content to the report
  reportContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #333; font-size: 24px; margin-bottom: 5px;">${trip.name}</h1>
      <p style="color: #666; font-size: 14px;">
        ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}
      </p>
      <p style="color: #666; font-size: 14px;">
        Generated on: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })}
      </p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="color: #444; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
        Participants (${trip.participants.length})
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f5f5f5;">
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Name</th>
          <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Balance</th>
        </tr>
        ${trip.participants.map(participant => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${participant.name}</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd; 
              ${participant.balance > 0 ? 'color: green;' : participant.balance < 0 ? 'color: red;' : ''}">
              ${formatCurrency(participant.balance)}
            </td>
          </tr>
        `).join('')}
        <tr style="background-color: #f5f5f5; font-weight: bold;">
          <td style="padding: 8px; border: 1px solid #ddd;">Total Expenses</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
            ${formatCurrency(trip.expenses.reduce((sum, expense) => sum + expense.amount, 0))}
          </td>
        </tr>
      </table>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="color: #444; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
        Expenses (${trip.expenses.length})
      </h2>
      
      ${generateExpensesSectionHTML(trip)}
    </div>
    
    <div>
      <h2 style="color: #444; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
        Settlements
      </h2>
      ${generateSettlementsHTML(trip)}
    </div>
  `;
  
  document.body.appendChild(reportContainer);
  
  try {
    const canvas = await html2canvas(reportContainer, {
      scale: 1.5,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
    heightLeft -= pdfHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;
    }
    
    pdf.save(`${trip.name.replace(/\s+/g, '-').toLowerCase()}-report.pdf`);
  } finally {
    document.body.removeChild(reportContainer);
  }
};

// Generate daily expense PDF report
export const generateDailyExpensePDF = async (trip: Trip, date: string): Promise<void> => {
  const dayExpenses = trip.expenses.filter(expense => expense.date === date);
  
  if (dayExpenses.length === 0) {
    console.error('No expenses found for the selected date');
    return;
  }
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
  
  // Create a temporary div to render the report content
  const reportContainer = document.createElement('div');
  reportContainer.className = 'pdf-report';
  reportContainer.style.width = '595px'; // A4 width in pixels at 72 DPI
  reportContainer.style.padding = '40px';
  reportContainer.style.fontFamily = 'Arial, sans-serif';
  reportContainer.style.position = 'absolute';
  reportContainer.style.left = '-9999px';
  
  const dailyTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Add content to the report
  reportContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #333; font-size: 24px; margin-bottom: 5px;">${trip.name}</h1>
      <h2 style="color: #666; font-size: 18px;">Daily Expense Report</h2>
      <p style="color: #666; font-size: 16px; font-weight: bold;">${formattedDate}</p>
      <p style="color: #666; font-size: 14px;">
        Generated on: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })}
      </p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="color: #444; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
        Daily Summary
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #f5f5f5;">
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Total Expenses</th>
          <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">
            ${formatCurrency(dailyTotal)}
          </th>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Number of Transactions</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
            ${dayExpenses.length}
          </td>
        </tr>
      </table>
    </div>
    
    <div>
      <h2 style="color: #444; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
        Expenses
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f5f5f5;">
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Expense</th>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Category</th>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Paid By</th>
          <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Amount</th>
        </tr>
        ${dayExpenses.map(expense => {
          // Format paidBy display
          const paidByName = Array.isArray(expense.paidBy)
            ? expense.paidBy.map(id => getParticipantName(id, trip.participants)).join(', ')
            : getParticipantName(expense.paidBy, trip.participants);
          
          return `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                ${expense.name}
                ${expense.notes ? `<br><span style="font-size: 12px; color: #666;">${expense.notes}</span>` : ''}
              </td>
              <td style="padding: 8px; border: 1px solid #ddd;">
                ${getCategoryWithEmoji(expense.category)}
              </td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paidByName}</td>
              <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
                ${formatCurrency(expense.amount)}
              </td>
            </tr>
          `;
        }).join('')}
        <tr style="background-color: #f5f5f5; font-weight: bold;">
          <td colspan="3" style="padding: 8px; border: 1px solid #ddd;">Total</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
            ${formatCurrency(dailyTotal)}
          </td>
        </tr>
      </table>
    </div>
  `;
  
  document.body.appendChild(reportContainer);
  
  try {
    const canvas = await html2canvas(reportContainer, {
      scale: 1.5,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
    heightLeft -= pdfHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;
    }
    
    const formattedDateFilename = new Date(date).toISOString().split('T')[0];
    pdf.save(`${trip.name.replace(/\s+/g, '-').toLowerCase()}-${formattedDateFilename}-report.pdf`);
  } finally {
    document.body.removeChild(reportContainer);
  }
};

// Helper function for getting category with emoji
function getCategoryWithEmoji(category: string): string {
  switch (category) {
    case "food": return "🍔 Food";
    case "accommodation": return "🏨 Accommodation";
    case "transportation": return "🚕 Transportation";
    case "activities": return "🎯 Activities";
    case "shopping": return "🛍️ Shopping";
    default: return "📝 Other";
  }
}

// Helper function to generate expenses section HTML
function generateExpensesSectionHTML(trip: Trip): string {
  // Group expenses by date
  const expensesByDate: Record<string, Expense[]> = {};
  trip.expenses.forEach(expense => {
    if (!expensesByDate[expense.date]) {
      expensesByDate[expense.date] = [];
    }
    expensesByDate[expense.date].push(expense);
  });
  
  // Sort dates in descending order
  const sortedDates = Object.keys(expensesByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  
  if (sortedDates.length === 0) {
    return '<p style="color: #666; text-align: center;">No expenses recorded</p>';
  }
  
  return sortedDates.map(date => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    
    const dailyTotal = expensesByDate[date].reduce((sum, expense) => sum + expense.amount, 0);
    
    return `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #555; font-size: 16px; margin-top: 15px; margin-bottom: 10px; 
            background-color: #f5f5f5; padding: 8px; border-radius: 4px;">
          ${formattedDate} - Total: ${formatCurrency(dailyTotal)}
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f5f5f5;">
            <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Expense</th>
            <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Category</th>
            <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Paid By</th>
            <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Amount</th>
          </tr>
          ${expensesByDate[date].map(expense => {
            // Format paidBy display
            const paidByName = Array.isArray(expense.paidBy)
              ? expense.paidBy.map(id => getParticipantName(id, trip.participants)).join(', ')
              : getParticipantName(expense.paidBy, trip.participants);
            
            return `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  ${expense.name}
                  ${expense.notes ? `<br><span style="font-size: 12px; color: #666;">${expense.notes}</span>` : ''}
                </td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  ${getCategoryWithEmoji(expense.category)}
                </td>
                <td style="padding: 8px; border: 1px solid #ddd;">${paidByName}</td>
                <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
                  ${formatCurrency(expense.amount)}
                </td>
              </tr>
            `;
          }).join('')}
        </table>
      </div>
    `;
  }).join('');
}

// Helper function to generate settlements HTML
function generateSettlementsHTML(trip: Trip): string {
  // Import the function to calculate settlements
  const settlements = [];
  
  // Calculate balances
  const participants = [...trip.participants];
  
  // Sort by balance (ascending)
  participants.sort((a, b) => a.balance - b.balance);
  
  // Find debtors and creditors
  const debtors = participants.filter(p => p.balance < 0);
  const creditors = participants.filter(p => p.balance > 0);
  
  if (debtors.length === 0 || creditors.length === 0) {
    return '<p style="color: #666; text-align: center;">All balances are settled</p>';
  }
  
  // Generate settlements table
  return `
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background-color: #f5f5f5;">
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">From</th>
        <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">To</th>
        <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Amount</th>
      </tr>
      ${trip.participants.filter(p => p.balance < 0).map(debtor => {
        const settlements = trip.participants
          .filter(p => p.balance > 0)
          .map(creditor => {
            return {
              from: debtor.name,
              to: creditor.name,
              amount: Math.min(Math.abs(debtor.balance), creditor.balance)
            };
          })
          .filter(s => s.amount > 0.01);
        
        return settlements.map(s => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${s.from}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${s.to}</td>
            <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
              ${formatCurrency(s.amount)}
            </td>
          </tr>
        `).join('');
      }).join('')}
    </table>
  `;
}
