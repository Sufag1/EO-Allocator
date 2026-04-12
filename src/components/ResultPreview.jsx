import React from 'react';
import { exportToPDF, exportToExcel, exportToCSV } from '../utils/exportLogic';
import { Download, Table, ArrowLeft, Calendar } from 'lucide-react';

export default function ResultPreview({ assignments, unassigned, timestamp, onBack }) {
  if (!assignments || assignments.length === 0) {
    return null;
  }

  // Pre-calculate to show preview (max 10 PUs for quick viewing to save DOM performance)
  const previewPUs = assignments.slice(0, 10);
  const totalAssignedCount = assignments.reduce((acc, pu) => acc + (pu.postedApplicants?.length || 0), 0);

  return (
    <div className="animate-slide-up stagger-2">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn-secondary" onClick={onBack} title="Back to History" style={{ padding: '0.625rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Deployment Matrix Preview</h1>
          {timestamp && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <Calendar size={14} /> Generated on {new Date(timestamp).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="badge badge-blue">{totalAssignedCount} Placed APOs</div>
            <div className="badge badge-grey">{unassigned.length} Unplaced</div>
            <div className="badge badge-green">{assignments.length} Processing Units</div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => exportToCSV(assignments, unassigned)} title="Download CSV">
              <Table size={16} /> Data CSV
            </button>
            <button className="btn btn-secondary" onClick={() => exportToExcel(assignments, unassigned)} title="Download Excel">
              <Table size={16} /> Spreadsheet 
            </button>
            <button className="btn btn-primary" onClick={() => exportToPDF(assignments, unassigned)} title="Download PDF">
              <Download size={16} /> Export Master PDF
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <div className="table-scroller">
            <table>
              <thead>
                <tr>
                  <th>Polling Unit</th>
                  <th>Applicant Name</th>
                  <th>Phone No.</th>
                  <th>Gender/Sex</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewPUs.map((pu, puIndex) => {
                  const hasApplicants = pu.postedApplicants && pu.postedApplicants.length > 0;
                  const rowCount = hasApplicants ? pu.postedApplicants.length : 1;
                  
                  if (!hasApplicants) {
                     return (
                      <tr key={`empty-${puIndex}`}>
                        <td>
                          <span style={{ fontWeight: 600 }}>{pu['Polling Unit'] || pu.Name || pu.PU || 'Unknown PU'}</span>
                        </td>
                        <td colSpan="4" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Waiting configuration list (No APOs available)</td>
                      </tr>
                     )
                  }

                  return pu.postedApplicants.map((app, appIndex) => (
                    <tr key={`${puIndex}-${appIndex}`}>
                      {appIndex === 0 && (
                         <td rowSpan={rowCount} style={{ verticalAlign: 'top' }}>
                           <span style={{ fontWeight: 600 }}>{pu['Polling Unit'] || pu.Name || pu.PU || 'Unknown PU'}</span>
                           <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                             {pu.LGA ? `LGA: ${pu.LGA}` : ''}
                           </div>
                         </td>
                      )}
                      <td>{app.Name || app['Full Name'] || 'N/A'}</td>
                      <td>{app.Phone || app['Phone Number'] || 'N/A'}</td>
                      <td>{app.Sex || app.Gender || 'N/A'}</td>
                      <td>
                        <span className="badge badge-green" style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem' }}>Placed</span>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Showing internal preview of {previewPUs.length} configuration units.
          Export to securely access the full multi-page master record.
        </p>
      </div>
    </div>
  );
}
