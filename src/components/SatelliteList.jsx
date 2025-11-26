import React, { useState, useEffect } from 'react';
import { satelliteApi } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faSatellite, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import './SatelliteList.css';

function SatelliteList() {
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  //loads satellites when page opens (from pattern React docs)
  useEffect(() => {
    loadSatellites();
  }, []); //empty array means run once on mount

  const loadSatellites = async () => {
    setLoading(true);
    try {
      const response = await satelliteApi.getAllSatellites();
      setSatellites(response.data);
      setMessage(`Loaded ${response.data.length} satellites`);
      setMessageType('info');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBackup = async () => { 
    setLoading(true);
    setMessage('Loading backup satellite data...');
    setMessageType('info');
    try {
      const response = await satelliteApi.loadBackupData();
      setMessage(`${response.data}`);
      setMessageType('success');

      //wait 2 secs 
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadSatellites();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const runCollisionDetection = async () => {
    if (satellites.length === 0) {
      setMessage('Load satellites first!');
      setMessageType('error');
      return;
    }
    
    setLoading(true);
    setMessage('Running collision detection...');
    setMessageType('info');
    try {
      const response = await satelliteApi.detectCollisions();
      setMessage(`${response.data}`);
      setMessageType('success');
    } catch (err) {
      setMessage(`${err.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  //click column header to sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  //filter as user types in search box
  const filteredSatellites = satellites.filter(sat =>
    String(sat.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(sat.noradId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  //need to copy array with [...] before sorting so dont mutate original
  const sortedSatellites = [...filteredSatellites].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleFetchNasa = async () => {
  setLoading(true);
  setMessage('Fetching live NASA data from Space-Track.org...');
  setMessageType('info');

  try {
    
    const response = await satelliteApi.fetchNasaData();
    
    setMessage(`${response.data}`);
    setMessageType('success');
    //wait 3 seconds before load sats for user to read message
    await new Promise(resolve => setTimeout(resolve, 5000));
    await loadSatellites();
  } catch (error) {
    setMessage(`Error: ${error.message}`);
    setMessageType('error');
  } finally {
    setLoading(false);
  }
};

  return (

  <div className="satellite-list">
    
    {/* Hero Section */}
    <div className="hero-section">
      <h1>Satellite Collision Detection System</h1>
      <p className="subtitle">Educational tool for detecting potential satellite collisions using real NASA orbital data</p>
    </div>

    {/* Workflow Section - Simpler */}
    <div className="workflow-section">
      <h2>How It Works</h2>
      <div className="workflow-steps">
        <div className="step">
          <div className="step-number">1</div>
            <div className="step-content">
              <h3>Load Data</h3>
              <p>Choose backup or NASA data source</p>
          </div>
        </div>
    
    <div className="step">
      <div className="step-number">2</div>
      <div className="step-content">
        <h3>Detect Collisions</h3>
        <p>Run algorithm to check satellite pairs</p>
      </div>
    </div>
    
    <div className="step">
      <div className="step-number">3</div>
      <div className="step-content">
        <h3>Review Results</h3>
        <p>Check warnings and alerts pages</p>
      </div>
    </div>
  </div>
</div>

    {/* Action Panel*/}
    <div className="action-panel">
      <div className="panel-header">
        <h3>Load Satellite Data</h3>
        <p>Choose your data source to begin analysis</p>
      </div>
      
      <div className="action-buttons-grid">
        <button 
          onClick={handleLoadBackup} 
          disabled={loading}
          className="btn-secondary"
        >
          <FontAwesomeIcon icon={faFile} />
          <span>Load Backup Data</span>
          <small>(4 satellites)</small>
        </button>
        
        <button 
          onClick={handleFetchNasa} 
          disabled={loading}
          className="btn-primary"
        >
          <FontAwesomeIcon icon={faSatellite} />
          <span>Fetch NASA Data</span>
          <small>(500+ satellites)</small>
        </button>
      </div>

      {satellites.length > 0 && (
        <div className="detection-section">
          <button 
            onClick={runCollisionDetection} 
            disabled={loading}
            className="btn-detect"
          >
            Run Collision Detection
          </button>
        </div>
      )}
    </div>

    {/* Status Message */}
    {message && (
      <div className={`message ${messageType}`}>
        {message}
      </div>
    )}

    {loading && <div className="loading">Processing...</div>}

    {/* Data Table Section */}
    {satellites.length > 0 && (
      <div className="data-section">
        <div className="data-header">
          <h3>Loaded Satellites ({satellites.length})</h3>
          <input
            type="text"
            placeholder="Search by name or NORAD ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <table className="satellite-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('noradId')}>
                NORAD ID {sortConfig.key === 'noradId' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('altitude')}>
                Altitude (km) {sortConfig.key === 'altitude' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {sortedSatellites.map(sat => (
              <tr key={sat.id}>
                <td>{sat.name}</td>
                <td>{sat.noradId}</td>
                <td>{sat.altitude.toFixed(2)}</td>
                <td>{sat.latitude.toFixed(2)}°, {sat.longitude.toFixed(2)}°</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="count">Showing {sortedSatellites.length} of {satellites.length} satellites</p>
      </div>
    )}

    {!loading && satellites.length === 0 && (
      <div className="empty-state">
        <FontAwesomeIcon icon={faSatellite} size="3x" color="#94a3b8" />
        <h3>No Satellite Data Loaded</h3>
        <p>Load backup data or fetch real NASA data to begin collision detection</p>
      </div>
    )}
  </div>
);
}

export default SatelliteList;