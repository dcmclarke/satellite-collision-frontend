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

  const handleLoadBackup = async() => {
    setLoading(true);
    setMessage('Loading backup data...');
    setMessageType('info');
    console.log('Loading backup satellites');
    try {
      const response = await satelliteApi.loadBackupData();
      setMessage(`${response.data}`);
      await loadSatellites();
    } catch (error) {
      setMessage(`${error.message}`);
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

  return (
    <div className="satellite-list">

      {/* workflow section */}
      <div className="workflow-section">
        <div className="workflow-steps">
          <div className="step step-1">
            <div className="step-icon">
              <FontAwesomeIcon icon={faFile} />
            </div>
            <h3>Step 1: Load Data</h3>
            <p>Fetch NASA satellites or use backup</p>
          </div>
          
          <div className="step-arrow">→</div>
          
          <div className="step step-2">
            <div className="step-icon active">
              <FontAwesomeIcon icon={faSatellite} />
            </div>
            <h3>Step 2: Detect</h3>
            <p>Run collision detection algorithm</p>
          </div>
          
          <div className="step-arrow">→</div>
          
          <div className="step step-3">
            <div className="step-icon">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </div>
            <h3>Step 3: Review</h3>
            <p>View warnings and alerts</p>
          </div>
        </div>
      </div>

  
      {/*temp showing only detect collisions for survey (controls relocated below) */}

{/* backup data button hidden for survey, will restore after
<button onClick={handleLoadBackup} disabled={loading}>
  Load Backup Data
</button>
*/}

      {loading && <div className="loading">Processing...</div>}

      {/* put controls and actions immediately above the data table */}
      <div className="controls-and-actions">
        <div className="action-buttons left">
          <button onClick={runCollisionDetection} disabled={loading}>
            Detect Collisions
          </button>
        </div>
        <div className="controls">
          <input
            type="text"
            placeholder="Search by name or NORAD ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {message && (
        <div className={`message ${messageType} ${messageType === 'success' ? 'emphasize' : ''}`}>
          {message}
        </div>
      )}

      {sortedSatellites.length > 0 ? (
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
                <td>
                  {sat.latitude.toFixed(2)}°, {sat.longitude.toFixed(2)}°
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p className="no-data">No satellites loaded. Click "Load Backup Data" to begin.</p>
      )}

      {sortedSatellites.length > 0 && (
        <p className="count">Showing {sortedSatellites.length} satellites</p>
      )}
    </div>
  );
}

export default SatelliteList;