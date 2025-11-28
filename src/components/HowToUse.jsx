import React from 'react';
import './HowToUse.css';

function HowToUse() {
  return (
    <div className="how-to-use">
      <div className="guide-header">
        <h1>User Guide</h1>
        <p>Learn how to use the Satellite Collision Detection System</p>
      </div>

      <div className="guide-content">
        <section className="guide-section">
          <h2>Getting Started</h2>
          <ol>
            <li>Navigate to the <strong>Satellites</strong> page</li>
            <li>Click either <strong>Load Backup Data</strong> (4 satellites) or <strong>Fetch NASA Data</strong> (500+ satellites)</li>
            <li>Wait for data to load - you'll see a table of satellites</li>
            <li>Click <strong>Run Collision Detection</strong></li>
            <li>View results on the <strong>Warnings</strong> or <strong>Alerts</strong> pages</li>
          </ol>
        </section>

        <section className="guide-section">
          <h2>Understanding Risk Levels</h2>
          <div className="risk-guide">
            <div className="risk-item critical">
              <span className="risk-badge">CRITICAL</span>
              <p>Satellites less than 2km apart - immediate attention required</p>
            </div>
            <div className="risk-item warning">
              <span className="risk-badge">WARNING</span>
              <p>Satellites 2-3.5km apart - monitor closely</p>
            </div>
            <div className="risk-item info">
              <span className="risk-badge">INFO</span>
              <p>Satellites 3.5-5km apart - informational only</p>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <h2>Page Descriptions</h2>
          
          <h3>Satellites Page</h3>
          <ul>
            <li><strong>Load Backup Data:</strong> Loads 4 pre-configured satellites for quick testing</li>
            <li><strong>Fetch NASA Data:</strong> Downloads real-time data from NASA Space-Track (takes 30-60 seconds)</li>
            <li><strong>Run Collision Detection:</strong> Analyzes all satellite pairs for potential collisions</li>
            <li><strong>Search:</strong> Filter satellites by name or NORAD ID</li>
            <li><strong>Table Headers:</strong> Click to sort by that column</li>
          </ul>

          <h3>Warnings Page</h3>
          <ul>
            <li><strong>Filter Tabs:</strong> Show all warnings or filter by risk level (Critical/Warning/Info)</li>
            <li><strong>Collision Cards:</strong> Display details about each potential collision including distance, probability, and satellite names</li>
          </ul>

          <h3>Alerts Page</h3>
          <ul>
            <li><strong>All Alerts:</strong> View all alerts from the last 24 hours</li>
            <li><strong>Unacknowledged:</strong> Filter to show only alerts that haven't been reviewed</li>
            <li><strong>Acknowledge Alert:</strong> Mark an alert as reviewed</li>
          </ul>
        </section>

        <section className="guide-section">
          <h2>Technical Details</h2>
          <p><strong>Algorithm:</strong> Distance-based collision detection using 3D Euclidean distance calculation</p>
          <p><strong>Data Source:</strong> NASA Space-Track.org TLE (Two-Line Element) orbital data</p>
          <p><strong>Update Frequency:</strong> Manual - click buttons to refresh data</p>
          <p><strong>Threshold:</strong> Detects satellites within 5km of each other</p>
        </section>
      </div>
    </div>
  );
}

export default HowToUse;