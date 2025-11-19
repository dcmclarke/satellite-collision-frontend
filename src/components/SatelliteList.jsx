import React, { useState, useEffect } from 'react';
import { satelliteApi } from '../services/api';
import './SatelliteList.css';

function SatelliteList() {
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
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
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBackup = async() => {
    setLoading(true);
    setMessage('Loading backup data...');
    console.log('Loading backup satellites');
    try {
      const response = await satelliteApi.loadBackupData();
      setMessage(`${response.data}`);
      await loadSatellites();
    } catch (error) {
      setMessage(`${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runCollisionDetection = async () => {
    if (satellites.length === 0) {
      setMessage('Load satellites first!');
      return;
    }
    
    setLoading(true);
    setMessage('Running collision detection...');
    try {
      const response = await satelliteApi.detectCollisions();
      setMessage(`${response.data}`);
    } catch (err) {
      setMessage(`${err.message}`);
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
    sat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sat.noradId.toLowerCase().includes(searchTerm.toLowerCase())
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
      <h1>Satellite Catalogue</h1>
      
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name or NORAD ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

  
      {/*temp showing only detect collisions for survey */}
<div className="action-buttons">
  <button onClick={runCollisionDetection} disabled={loading}>
    Detect Collisions
  </button>
</div>

{/* backup data button hidden for survey, will restore after
<button onClick={handleLoadBackup} disabled={loading}>
  Load Backup Data
</button>
*/}

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {loading && <div className="loading">Processing...</div>}

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