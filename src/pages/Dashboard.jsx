import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UploadCloud, FileSpreadsheet, Settings2, ShieldCheck, CheckCircle2, History, Trash2, ChevronRight, PlusCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { generateDeployment } from '../utils/assignmentLogic';
import { saveDeploymentToHistory, getDeploymentHistory, getDeploymentById, deleteDeploymentHistory } from '../utils/historyLogic';
import ResultPreview from '../components/ResultPreview';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  
  // New Deployment State
  const [applicants, setApplicants] = useState([]);
  const [pollingUnits, setPollingUnits] = useState([]);
  const [applicantsFileStatus, setApplicantsFileStatus] = useState(null);
  const [puFileStatus, setPuFileStatus] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Current View State (what ResultPreview shows)
  const [currentResult, setCurrentResult] = useState(null); // { assignments, unassigned, id? }
  
  // History State
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistoryList(getDeploymentHistory());
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (type === 'applicants') {
          setApplicants(data);
          setApplicantsFileStatus({ name: file.name, count: data.length });
        } else {
          setPollingUnits(data);
          setPuFileStatus({ name: file.name, count: data.length });
        }
      } catch (err) {
        alert('Error reading the file. Please ensure it is a valid Excel or CSV.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleGenerate = () => {
    if (applicants.length === 0 || pollingUnits.length === 0) {
      alert('Please upload both Applicants and Polling Units files first.');
      return;
    }
    
    setIsGenerating(true);
    
    setTimeout(() => {
      const result = generateDeployment(applicants, pollingUnits);
      const saved = saveDeploymentToHistory(result.assignments, result.unassigned);
      
      setCurrentResult({
        assignments: result.assignments,
        unassigned: result.unassigned,
        id: saved ? saved.id : null,
        timestamp: saved ? saved.timestamp : new Date().toISOString()
      });
      
      loadHistory();
      setActiveTab('view_result');
      setIsGenerating(false);
    }, 800);
  };

  const loadHistoricalResult = (id) => {
    const entry = getDeploymentById(id);
    if (entry) {
      setCurrentResult({
        assignments: entry.assignments,
        unassigned: entry.unassigned,
        id: entry.id,
        timestamp: entry.timestamp
      });
      setActiveTab('view_result');
    }
  };

  const handleDeleteHistory = (e, id) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this deployment?')) {
      deleteDeploymentHistory(id);
      loadHistory();
      if (currentResult?.id === id) {
        setActiveTab('new');
        setCurrentResult(null);
      }
    }
  };

  const startNew = () => {
    setApplicants([]);
    setPollingUnits([]);
    setApplicantsFileStatus(null);
    setPuFileStatus(null);
    setCurrentResult(null);
    setActiveTab('new');
  };

  return (
    <div className="layout-app">
      {/* Sidebar Navigation */}
      <aside className="layout-sidebar">
        <div className="sidebar-logo">
          <div className="icon-container">
            <ShieldCheck size={24} color="#FFF" />
          </div>
          E.O. Portal
        </div>

        <ul className="sidebar-nav">
          <li className={`sidebar-nav-item ${activeTab === 'new' ? 'active' : ''}`} onClick={startNew}>
            <PlusCircle size={20} /> New Deployment
          </li>
          <li className={`sidebar-nav-item ${(activeTab === 'history' || activeTab === 'view_result') ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={20} /> Deployment History
          </li>
        </ul>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.[0]?.toUpperCase() || 'E'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Administrator'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Electoral Officer</p>
          </div>
          <button className="btn-danger-ghost" onClick={logout} title="Logout" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="layout-main animate-slide-up stagger-1">
        {activeTab === 'new' && (
          <div className="animate-slide-up">
            <div style={{ marginBottom: '2.5rem' }}>
              <h1>Create Deployment</h1>
              <p style={{ color: 'var(--text-muted)' }}>Generate random unbiased assignments of APOs to defined Polling Units.</p>
            </div>

            <div className="grid-2">
              {/* Applicants Upload Card */}
              <div className="card">
                <div className="card-header">
                  <div className="icon-wrapper blue">
                    <FileSpreadsheet size={24} />
                  </div>
                  <h3>Applicants List (APOs)</h3>
                </div>
                
                <label className={`upload-zone ${applicantsFileStatus ? 'active' : ''}`}>
                   <input 
                     type="file" 
                     accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                     className="file-input-hidden" 
                     onChange={(e) => handleFileUpload(e, 'applicants')}
                   />
                   {applicantsFileStatus ? (
                     <>
                       <CheckCircle2 color="var(--primary)" size={48} />
                       <div>
                         <p style={{ fontWeight: '600', color: 'var(--primary-hover)' }}>{applicantsFileStatus.name}</p>
                         <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{applicantsFileStatus.count} applicants loaded</p>
                       </div>
                     </>
                   ) : (
                     <>
                       <UploadCloud className="upload-icon" size={40} />
                       <div>
                         <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>Upload Excel or CSV</p>
                         <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Drag and drop exactly here</p>
                       </div>
                     </>
                   )}
                </label>
              </div>

              {/* Polling Units Upload Card */}
              <div className="card">
                <div className="card-header">
                  <div className="icon-wrapper green">
                    <Settings2 size={24} />
                  </div>
                  <h3>Polling Units (PUs)</h3>
                </div>
                
                <label className={`upload-zone ${puFileStatus ? 'active' : ''}`}>
                   <input 
                     type="file" 
                     accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                     className="file-input-hidden" 
                     onChange={(e) => handleFileUpload(e, 'pollingUnits')}
                   />
                   {puFileStatus ? (
                     <>
                       <CheckCircle2 color="var(--secondary)" size={48} />
                       <div>
                         <p style={{ fontWeight: '600', color: 'var(--secondary-hover)' }}>{puFileStatus.name}</p>
                         <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{puFileStatus.count} units loaded</p>
                       </div>
                     </>
                   ) : (
                     <>
                       <UploadCloud className="upload-icon" size={40} />
                       <div>
                         <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>Upload Excel or CSV</p>
                         <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Drag and drop exactly here</p>
                       </div>
                     </>
                   )}
                </label>
              </div>
            </div>

            <div className="card" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Finalize & Generate Matrix</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Distributes exactly 3 applicants per PU securely.</p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleGenerate}
                disabled={!applicantsFileStatus || !puFileStatus || isGenerating}
                style={{ padding: '1rem 3rem' }}
              >
                {isGenerating ? 'Computing...' : 'Generate Alignment'}
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="animate-slide-up">
            <div style={{ marginBottom: '2.5rem' }}>
              <h1>Past Deployments</h1>
              <p style={{ color: 'var(--text-muted)' }}>Review and regenerate previously created rosters.</p>
            </div>

            <div className="card">
              {historyList.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <History size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No deployments generated yet.</p>
                  <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={startNew}>Create New</button>
                </div>
              ) : (
                <div className="history-list">
                  {historyList.map(entry => (
                    <div className="history-item" key={entry.id} onClick={() => loadHistoricalResult(entry.id)}>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div className="icon-wrapper blue" style={{ padding: '0.5rem' }}>
                          <FileSpreadsheet size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '600' }}>Deployment Roster</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(entry.timestamp).toLocaleString()} • {entry.summary.totalPUs} PUs handled • {entry.summary.totalAssigned} Assigned
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="btn-danger-ghost" onClick={(e) => handleDeleteHistory(e, entry.id)}>
                          <Trash2 size={18} />
                        </button>
                        <ChevronRight color="var(--text-muted)" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Result Tab */}
        {activeTab === 'view_result' && currentResult && (
          <ResultPreview 
            assignments={currentResult.assignments} 
            unassigned={currentResult.unassigned} 
            timestamp={currentResult.timestamp}
            onBack={() => setActiveTab('history')}
          />
        )}
      </main>
    </div>
  );
}
