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
              ${formatCurrency(participant.balance, trip.currency)}
            </td>
          </tr>
        `).join('')}
        <tr style="background-color: #f5f5f5; font-weight: bold;">
          <td style="padding: 8px; border: 1px solid #ddd;">Total Expenses</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
            ${formatCurrency(trip.expenses.reduce((sum, expense) => sum + expense.amount, 0), trip.currency)}
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
            ${formatCurrency(dailyTotal, trip.currency)}
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
                ${formatCurrency(expense.amount, trip.currency)}
              </td>
            </tr>
          `;
        }).join('')}
        <tr style="background-color: #f5f5f5; font-weight: bold;">
          <td colspan="3" style="padding: 8px; border: 1px solid #ddd;">Total</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
            ${formatCurrency(dailyTotal, trip.currency)}
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

// Generate individual expense PDF report
export const generateExpensePDF = async (trip: Trip, expense: Expense): Promise<void> => {
  // Create a temporary div to render the report content
  const reportContainer = document.createElement('div');
  reportContainer.className = 'pdf-report';
  reportContainer.style.width = '595px'; // A4 width in pixels at 72 DPI
  reportContainer.style.padding = '40px';
  reportContainer.style.fontFamily = 'Arial, sans-serif';
  reportContainer.style.position = 'absolute';
  reportContainer.style.left = '-9999px';
  
  // Format paidBy display
  const paidByName = Array.isArray(expense.paidBy)
    ? expense.paidBy.map(id => getParticipantName(id, trip.participants)).join(', ')
    : getParticipantName(expense.paidBy, trip.participants);
  
  // Format the splitBetween list
  const splitBetweenNames = expense.splitBetween.map(id => 
    getParticipantName(id, trip.participants)
  ).join(', ');
  
  // Calculate share per person
  const shareAmount = expense.amount / expense.splitBetween.length;
  
  // Format date
  const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
  
  // Add content to the report
  reportContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #333; font-size: 24px; margin-bottom: 5px;">${trip.name}</h1>
      <h2 style="color: #666; font-size: 18px;">Expense Details</h2>
      <p style="color: #666; font-size: 14px;">
        Generated on: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })}
      </p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2 style="color: #444; font-size: 20px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
        ${expense.name}
      </h2>
      
      <div style="display: flex; justify-content: space-between; margin: 20px 0;">
        <div style="flex: 1;">
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Category:</strong> ${getCategoryWithEmoji(expense.category)}</p>
          <p><strong>Paid By:</strong> ${paidByName}</p>
          <p><strong>Split Between:</strong> ${splitBetweenNames}</p>
          ${expense.notes ? `<p><strong>Notes:</strong> ${expense.notes}</p>` : ''}
        </div>
        <div style="flex: 1; text-align: right;">
          <p style="font-size: 22px; font-weight: bold; color: #333; margin-bottom: 5px;">
            ${formatCurrency(expense.amount, trip.currency)}
          </p>
          <p style="color: #666;">
            ${formatCurrency(shareAmount, trip.currency)} per person
          </p>
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="color: #444; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
        Split Details
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background-color: #f5f5f5;">
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Person</th>
          <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Share Amount</th>
        </tr>
        ${expense.splitBetween.map(participantId => {
          return `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                ${getParticipantName(participantId, trip.participants)}
              </td>
              <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
                ${formatCurrency(shareAmount, trip.currency)}
              </td>
            </tr>
          `;
        }).join('')}
        <tr style="background-color: #f5f5f5; font-weight: bold;">
          <td style="padding: 8px; border: 1px solid #ddd;">Total</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">
            ${formatCurrency(expense.amount, trip.currency)}
          </td>
        </tr>
      </table>
    </div>
    
    ${expense.attachments && expense.attachments.length > 0 ? `
      <div>
        <h3 style="color: #444; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
          Attachments (${expense.attachments.length})
        </h3>
        <div style="margin-top: 15px;">
          <ul style="list-style-type: none; padding: 0;">
            ${expense.attachments.map(attachment => {
              return `
                <li style="padding: 8px; border-bottom: 1px solid #eee;">
                  <strong>${attachment.filename}</strong>
                  <br>
                  <span style="color: #666; font-size: 12px;">
                    ${attachment.fileType} - Added on ${new Date(attachment.uploadedAt).toLocaleDateString()}
                  </span>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      </div>
    ` : ''}
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
    
    pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
    
    const expenseName = expense.name.replace(/\s+/g, '-').toLowerCase();
    const formattedDateFilename = new Date(expense.date).toISOString().split('T')[0];
    pdf.save(`${trip.name.replace(/\s+/g, '-').toLowerCase()}-${formattedDateFilename}-${expenseName}-expense.pdf`);
  } finally {
    document.body.removeChild(reportContainer);
  }
};

// Generate email trip report
export const generateEmailTripReport = async (trip: Trip): Promise<string> => {
  // Format the trip data for an email
  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Create HTML content for the email
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">${trip.name} - Trip Report</h1>
      <p style="color: #666;">
        ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}
      </p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <h2 style="color: #444; font-size: 18px; margin-top: 0;">Summary</h2>
        <p><strong>Total Expenses:</strong> ${formatCurrency(totalExpenses, trip.currency)}</p>
        <p><strong>Participants:</strong> ${trip.participants.length}</p>
        <p><strong>Number of Expenses:</strong> ${trip.expenses.length}</p>
      </div>
      
      <p>This report was generated from Splittos. View the full report by logging into your account.</p>
      
      <p style="font-size: 12px; color: #999; margin-top: 40px;">
        © ${new Date().getFullYear()} Splittos. All rights reserved.
      </p>
    </div>
  `;
  
  return emailContent;
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
          ${formattedDate} - Total: ${formatCurrency(dailyTotal, trip.currency)}
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
                  ${formatCurrency(expense.amount, trip.currency)}
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
              ${formatCurrency(s.amount, trip.currency)}
            </td>
          </tr>
        `).join('');
      }).join('')}
    </table>
  `;
}
