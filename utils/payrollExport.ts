// Payroll export utilities
import type { Employee, PayrollData, WeekData } from "~/types/payroll";

export interface PayrollExportData {
  employee: Employee;
  weekData: WeekData;
  payrollData: PayrollData;
  weekTotal: number;
  finalBalance: number;
  selectedWeek: string;
}

// Format currency for display
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date for display
const formatDisplayDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Generate CSV export
export const exportToCSV = (data: PayrollExportData): void => {
  const { employee, weekData, payrollData, weekTotal, finalBalance, selectedWeek } = data;
  
  const csvContent = [
    // Header row
    ["Payroll Summary Export"],
    [""],
    ["Employee Information"],
    ["Employee Name", `${employee.first_name} ${employee.last_name}`],
    ["Role", employee.primary_role || "Employee"],
    ["Week Period", selectedWeek],
    [""],
    ["Daily Breakdown"],
    ["Day", "Date", "Time In", "Time Out", "Hours", "Minutes", "Hourly Rate", "Minute Rate", "Daily Total"],
    
    // Daily data
    ...Object.entries(weekData.days).map(([dayName, dayData]) => [
      dayName.charAt(0).toUpperCase() + dayName.slice(1),
      dayData.date,
      dayData.timeIn,
      dayData.timeOut,
      dayData.hours.toString(),
      dayData.minutes.toString(),
      formatCurrency(dayData.hourlyRate),
      formatCurrency(dayData.minuteRate),
      formatCurrency(dayData.dailyTotal)
    ]),
    
    [""],
    ["Summary"],
    ["Weekly Gross Total", formatCurrency(weekTotal)],
    ["Less: Previous Balance (Bale)", formatCurrency(payrollData.bale)],
    ["Add: Bonus/Advance", formatCurrency(payrollData.advance)],
    ["Less: Deductions", formatCurrency(payrollData.deduction)],
    ["Net Pay", formatCurrency(finalBalance)],
    [""],
    ["Notes", payrollData.notes || "None"]
  ];

  const csvString = csvContent.map(row => 
    row.map(field => `"${field}"`).join(",")
  ).join("\n");

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payroll-${employee.first_name}-${employee.last_name}-${selectedWeek.replace(/\//g, "-")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Generate HTML for print/PDF
export const generatePayrollHTML = (data: PayrollExportData): string => {
  const { employee, weekData, payrollData, weekTotal, finalBalance, selectedWeek } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payroll Summary - ${employee.first_name} ${employee.last_name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.4;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2D5A27;
            padding-bottom: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2D5A27;
            margin-bottom: 5px;
        }
        .document-title {
            font-size: 20px;
            color: #666;
        }
        .employee-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .employee-info h2 {
            margin: 0 0 15px 0;
            color: #2D5A27;
            font-size: 18px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
        }
        .info-label {
            font-weight: 600;
            color: #555;
        }
        .timesheet-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .timesheet-table th,
        .timesheet-table td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
        }
        .timesheet-table th {
            background-color: #2D5A27;
            color: white;
            font-weight: 600;
        }
        .timesheet-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .summary-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .summary-section h2 {
            margin: 0 0 20px 0;
            color: #2D5A27;
            font-size: 18px;
        }
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 8px 0;
        }
        .summary-item.total {
            border-top: 2px solid #2D5A27;
            margin-top: 15px;
            padding-top: 15px;
            font-weight: bold;
            font-size: 18px;
        }
        .summary-item.positive {
            color: #2D5A27;
        }
        .summary-item.negative {
            color: #dc3545;
        }
        .notes-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .notes-section h3 {
            margin: 0 0 10px 0;
            color: #2D5A27;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .container { max-width: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-name">GA Payroll System</div>
            <div class="document-title">Payroll Summary Report</div>
        </div>

        <div class="employee-info">
            <h2>Employee Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Employee Name:</span>
                    <span>${employee.first_name} ${employee.last_name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Employee ID:</span>
                    <span>${employee.id}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Role/Position:</span>
                    <span>${employee.primary_role || "Employee"}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Pay Period:</span>
                    <span>${selectedWeek}</span>
                </div>
            </div>
        </div>

        <h2 style="color: #2D5A27; margin-bottom: 15px;">Daily Timesheet Breakdown</h2>
        <table class="timesheet-table">
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Hours</th>
                    <th>Minutes</th>
                    <th>Hourly Rate</th>
                    <th>Minute Rate</th>
                    <th>Daily Total</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(weekData.days)
                  .filter(([, dayData]) => dayData.date) // Only show days with data
                  .map(([dayName, dayData]) => `
                    <tr>
                        <td style="font-weight: 600; text-transform: capitalize;">${dayName}</td>
                        <td>${formatDisplayDate(dayData.date)}</td>
                        <td>${dayData.timeIn || '-'}</td>
                        <td>${dayData.timeOut || '-'}</td>
                        <td>${dayData.hours}</td>
                        <td>${dayData.minutes}</td>
                        <td>${formatCurrency(dayData.hourlyRate)}</td>
                        <td>${formatCurrency(dayData.minuteRate)}</td>
                        <td style="font-weight: 600;">${formatCurrency(dayData.dailyTotal)}</td>
                    </tr>
                  `).join('')}
            </tbody>
        </table>

        <div class="summary-section">
            <h2>Payment Summary</h2>
            <div class="summary-item">
                <span>Weekly Gross Total:</span>
                <span style="font-weight: 600;">${formatCurrency(weekTotal)}</span>
            </div>
            ${payrollData.bale > 0 ? `
            <div class="summary-item negative">
                <span>Less: Previous Balance (Bale):</span>
                <span>-${formatCurrency(payrollData.bale)}</span>
            </div>
            ` : ''}
            ${payrollData.advance > 0 ? `
            <div class="summary-item positive">
                <span>Add: Bonus/Advance:</span>
                <span>+${formatCurrency(payrollData.advance)}</span>
            </div>
            ` : ''}
            ${payrollData.deduction > 0 ? `
            <div class="summary-item negative">
                <span>Less: Deductions:</span>
                <span>-${formatCurrency(payrollData.deduction)}</span>
            </div>
            ` : ''}
            <div class="summary-item total ${finalBalance >= 0 ? 'positive' : 'negative'}">
                <span>Net Pay:</span>
                <span>${finalBalance >= 0 ? '+' : ''}${formatCurrency(finalBalance)}</span>
            </div>
        </div>

        ${payrollData.notes ? `
        <div class="notes-section">
            <h3>Notes</h3>
            <p>${payrollData.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString("en-PH", { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p>GA Payroll System - Confidential Document</p>
        </div>
    </div>
</body>
</html>`;
};

// Export to PDF (via browser print)
export const exportToPDF = (data: PayrollExportData): void => {
  const htmlContent = generatePayrollHTML(data);
  const printWindow = window.open("", "_blank");
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
};

// Main export function with format selection
export const exportPayrollSummary = (data: PayrollExportData, format: 'pdf' | 'csv' = 'pdf'): void => {
  switch (format) {
    case 'csv':
      exportToCSV(data);
      break;
    case 'pdf':
    default:
      exportToPDF(data);
      break;
  }
};