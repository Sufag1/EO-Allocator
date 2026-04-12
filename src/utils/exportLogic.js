import { jsPDF } from 'jspdf';
import * as autoTable from 'jspdf-autotable'; // Ensure using named or default import appropriately depending on setup. AutoTable attaches to jsPDF prototype.
// Alternative for jspdf-autotable: import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Prepares the flat array data from assignments and unassigned applicants
 * to be used by all export mechanisms.
 */
function prepareExportData(assignments, unassigned) {
  const data = [];

  // Add assigned applicants
  assignments.forEach((pu) => {
    if (pu.postedApplicants && pu.postedApplicants.length > 0) {
      pu.postedApplicants.forEach((app) => {
        data.push({
          'Polling Unit': pu['Polling Unit'] || pu.Name || pu.PU || 'Unknown PU',
          'LGA': pu.LGA || 'N/A',
          'Registration Area / Ward': pu.RA || pu.Ward || 'N/A',
          'Applicant Name': app.Name || app['Full Name'] || 'N/A',
          'Phone': app.Phone || app['Phone Number'] || 'N/A',
          'Email': app.Email || 'N/A',
          'Sex': app.Sex || app.Gender || 'N/A',
          'Status': 'Posted'
        });
      });
    } else {
      // Empty PU
      data.push({
        'Polling Unit': pu['Polling Unit'] || pu.Name || pu.PU || 'Unknown PU',
        'LGA': pu.LGA || 'N/A',
        'Registration Area / Ward': pu.RA || pu.Ward || 'N/A',
        'Applicant Name': 'NO APPLICANT POSTED',
        'Phone': '-',
        'Email': '-',
        'Sex': '-',
        'Status': 'Unposted PU'
      });
    }
  });

  // Add unassigned applicants
  if (unassigned && unassigned.length > 0) {
    unassigned.forEach((app) => {
      data.push({
        'Polling Unit': 'Not posted',
        'LGA': '-',
        'Registration Area / Ward': '-',
        'Applicant Name': app.Name || app['Full Name'] || 'N/A',
        'Phone': app.Phone || app['Phone Number'] || 'N/A',
        'Email': app.Email || 'N/A',
        'Sex': app.Sex || app.Gender || 'N/A',
        'Status': 'Not posted'
      });
    });
  }

  return data;
}

export function exportToPDF(assignments, unassigned) {
  const doc = new jsPDF();
  const data = prepareExportData(assignments, unassigned);

  if (data.length === 0) return;

  const columns = ['Polling Unit', 'LGA', 'Applicant Name', 'Phone', 'Sex', 'Status'];
  const formattedData = data.map(item => [
    item['Polling Unit'],
    item['LGA'],
    item['Applicant Name'],
    item['Phone'],
    item['Sex'],
    item['Status']
  ]);

  doc.setFontSize(18);
  doc.text('Electoral Officers Deployment Roster', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Use the autoTable plugin
  if (doc.autoTable) {
    doc.autoTable({
      head: [columns],
      body: formattedData,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }, // Primary color
      didDrawPage: function (data) {
        // Footer
        const finalY = doc.internal.pageSize.height - 10;
        doc.setFontSize(10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, finalY);
      }
    });
  }

  doc.save('Deployment_Roster.pdf');
}

export function exportToExcel(assignments, unassigned) {
  const data = prepareExportData(assignments, unassigned);
  if (data.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Deployments');
  
  // Create an Excel file and prompt download
  XLSX.writeFile(workbook, 'Deployment_Roster.xlsx');
}

export function exportToCSV(assignments, unassigned) {
  const data = prepareExportData(assignments, unassigned);
  if (data.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvFormat = XLSX.utils.sheet_to_csv(worksheet);

  // Trigger download via Blob
  const blob = new Blob([csvFormat], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'Deployment_Roster.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
