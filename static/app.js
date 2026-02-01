// ============================================
// ANTI-GRAVITY SOC - FRONTEND APPLICATION
// ============================================

// Global State
const state = {
    currentView: 'dashboard',
    cases: [],
    stats: {},
    mode: 'LOADING',
    refreshInterval: null,
    scanHistory: [],
    activityLog: []
};

// ============================================
// API CLIENT
// ============================================

const API = {
    async getStats() {
        const res = await fetch('/api/stats');
        return await res.json();
    },

    async getCases() {
        const res = await fetch('/api/cases/');
        return await res.json();
    },

    async closeCase(caseId) {
        const res = await fetch(`/api/cases/${caseId}/close`, { method: 'POST' });
        return await res.json();
    },

    async getMode() {
        const res = await fetch('/api/control/mode');
        return await res.json();
    },

    async setMode(mode) {
        const res = await fetch('/api/control/mode?mode=' + mode, { method: 'POST' });
        return await res.json();
    },

    async scanFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/scan/file', {
            method: 'POST',
            body: formData
        });
        return await res.json();
    },

    async approveCase(caseId, ip) {
        const res = await fetch(`/api/approvals/${caseId}/approve?ip=${ip}`, { method: 'POST' });
        return await res.json();
    },

    async saveNotes(caseId, notes) {
        const res = await fetch(`/api/cases/${caseId}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes })
        });
        return await res.json();
    },

    async blockIP(ip, caseId) {
        const res = await fetch(`/api/cases/${caseId}/block-ip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
        });
        return await res.json();
    },

    async reopenCase(caseId) {
        const res = await fetch(`/api/cases/${caseId}/reopen`, { method: 'POST' });
        return await res.json();
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getSeverityClass(risk) {
    const riskMap = {
        'LOW': 'badge-low',
        'MEDIUM': 'badge-medium',
        'HIGH': 'badge-high',
        'CRITICAL': 'badge-critical'
    };
    return riskMap[risk] || 'badge-medium';
}

function truncateHash(hash) {
    if (!hash || hash.length < 16) return hash;
    return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8);
}

// ============================================
// VIEW RENDERING
// ============================================

const Views = {
    dashboard: () => `
        <div class="view-header">
            <h2>Security Operations Overview</h2>
            <p class="card-subtitle">Real-time threat monitoring and response orchestration</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-icon">📊</span>
                    <span class="stat-trend">Live</span>
                </div>
                <div class="stat-value">${state.stats.active_cases || 0}</div>
                <div class="stat-label">Active Cases</div>
            </div>
            
            <div class="stat-card ${(state.stats.critical_threats || 0) > 0 ? 'critical' : ''}">
                <div class="stat-header">
                    <span class="stat-icon">⚠️</span>
                    ${(state.stats.critical_threats || 0) > 0 ? '<span class="stat-trend" style="background: rgba(239, 68, 68, 0.2); color: var(--severity-critical);">Alert</span>' : '<span class="stat-trend">Clear</span>'}
                </div>
                <div class="stat-value">${state.stats.critical_threats || 0}</div>
                <div class="stat-label">Critical Threats</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-icon">🦠</span>
                    <span class="stat-trend">24h</span>
                </div>
                <div class="stat-value">${state.stats.malware_count || 0}</div>
                <div class="stat-label">Malware Detections</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-icon">🚫</span>
                    <span class="stat-trend">Total</span>
                </div>
                <div class="stat-value">${state.stats.blocked_ips || 0}</div>
                <div class="stat-label">Blocked IPs</div>
            </div>
        </div>
        
        <!-- Charts Section -->
        <div class="charts-grid">
            <div class="card chart-card">
                <h3 class="card-title">📈 Threat Timeline</h3>
                <p class="card-subtitle mb-2">Cases created over time</p>
                <canvas id="threatTimelineChart"></canvas>
            </div>
            
            <div class="card chart-card">
                <h3 class="card-title">🎯 Severity Distribution</h3>
                <p class="card-subtitle mb-2">Risk level breakdown</p>
                <canvas id="severityChart"></canvas>
            </div>
            
            <div class="card chart-card">
                <h3 class="card-title">🔍 Threat Types</h3>
                <p class="card-subtitle mb-2">Malware vs Brute-force attacks</p>
                <canvas id="threatTypesChart"></canvas>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Recent Cases</h3>
                <button class="btn btn-secondary btn-sm" onclick="App.navigate('cases')">View All</button>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Case ID</th>
                            <th>IP Address</th>
                            <th>Risk</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.cases.slice(0, 5).map(c => `
                            <tr>
                                <td><code>${c.case_id.substring(0, 8)}</code></td>
                                <td>${c.ip}</td>
                                <td><span class="badge ${getSeverityClass(c.risk)}">${c.risk}</span></td>
                                <td><span class="badge ${c.status === 'OPEN' ? 'badge-open' : 'badge-closed'}">${c.status}</span></td>
                                <td>${formatDate(c.time)}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" class="text-center">No cases found</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    cases: () => `
        <div class="view-header">
            <h2>Case Management</h2>
            <p class="card-subtitle">Monitor and manage security incidents</p>
        </div>
        
        <div class="card">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Case ID</th>
                            <th>IP Address</th>
                            <th>Severity</th>
                            <th>Risk</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.cases.map(c => `
                            <tr>
                                <td><code>${c.case_id.substring(0, 8)}</code></td>
                                <td><strong>${c.ip}</strong></td>
                                <td>${c.severity || 'N/A'}</td>
                                <td><span class="badge ${getSeverityClass(c.risk)}">${c.risk}</span></td>
                                <td><span class="badge ${c.status === 'OPEN' ? 'badge-open' : 'badge-closed'}">${c.status}</span></td>
                                <td>${c.reason || 'N/A'}</td>
                                <td>${formatDate(c.time)}</td>
                                <td>
                                    <button class="btn btn-secondary btn-sm" onclick="App.viewCase('${c.case_id}')">View</button>
                                    ${c.status === 'OPEN' ? `<button class="btn btn-danger btn-sm" onclick="App.closeCase('${c.case_id}')">Close</button>` : ''}
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="8" class="text-center">No cases found</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `,

    scanner: () => `
        <div class="view-header">
            <h2>Manual File Malware Scanner</h2>
            <p class="card-subtitle">Upload and analyze suspicious files with VirusTotal integration</p>
        </div>
        
        <div class="card">
            <div class="upload-zone" id="uploadZone">
                <div class="upload-icon">📤</div>
                <div class="upload-text">Drag & drop a file here</div>
                <div class="upload-hint">or click to browse • Maximum file size: 32MB</div>
                <input type="file" id="fileInput" style="display: none;">
            </div>
        </div>
        
        <div id="scanResults" class="mt-2"></div>
        
        <!-- Scan History Section -->
        <div class="scan-history-section">
            <div class="card">
                <h3 class="card-title">📋 Scan History</h3>
                <p class="card-subtitle mb-2">Recent file scans and verdicts</p>
                <div class="table-container scan-history-table">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Filename</th>
                                <th>Verdict</th>
                                <th>Timestamp</th>
                                <th>Case ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.scanHistory && state.scanHistory.length > 0 ? state.scanHistory.map(scan => `
                                <tr>
                                    <td><strong>${scan.filename}</strong></td>
                                    <td><span class="badge ${scan.malicious ? 'badge-critical' : 'badge-low'}">${scan.malicious ? 'MALICIOUS' : 'CLEAN'}</span></td>
                                    <td>${formatDate(scan.timestamp)}</td>
                                    <td>${scan.case_id ? `<code>${scan.case_id.substring(0, 8)}</code>` : 'N/A'}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" class="text-center">No scans yet</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,

    control: () => {
        const modes = {
            'AUTO': {
                icon: '🟢',
                title: 'AUTOMATIC',
                description: 'Full autonomous response - Critical threats blocked instantly',
                tooltip: 'All threats are automatically remediated without human intervention',
                color: 'var(--severity-low)'
            },
            'SEMI': {
                icon: '🟡',
                title: 'SEMI-AUTOMATIC',
                description: 'Analyst approval required before remediation',
                tooltip: 'Critical threats require analyst approval before blocking',
                color: 'var(--severity-medium)'
            },
            'MANUAL': {
                icon: '🔵',
                title: 'MANUAL',
                description: 'Observe only - No automatic actions',
                tooltip: 'Cases are created but no automatic remediation occurs',
                color: 'var(--accent-primary)'
            }
        };

        return `
            <div class="view-header">
                <h2>SOAR Control Panel</h2>
                <p class="card-subtitle">Configure automation and response behavior</p>
            </div>
            
            <!-- Info Banners -->
            <div class="info-banner">
                <div class="info-banner-icon">ℹ️</div>
                <div class="info-banner-content">
                    <div class="info-banner-title">Auto-Close Rules</div>
                    <div class="info-banner-text">LOW-risk cases automatically close after 24 hours if no escalation occurs</div>
                </div>
            </div>
            
            <div class="info-banner">
                <div class="info-banner-icon">⏱️</div>
                <div class="info-banner-content">
                    <div class="info-banner-title">Auto-Unblock Timer</div>
                    <div class="info-banner-text">Blocked IPs are automatically unblocked after 72 hours unless manually extended</div>
                </div>
            </div>
            
            <div class="card">
                <h3 class="card-title mb-2">Response Mode</h3>
                <p class="card-subtitle mb-2">Select how the SOAR platform should respond to threats</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-lg); margin-top: var(--spacing-xl);">
                    ${Object.entries(modes).map(([mode, config]) => `
                        <div class="card tooltip-container ${state.mode === mode ? 'active' : ''}" 
                             style="cursor: pointer; border: 2px solid ${state.mode === mode ? config.color : 'var(--border-color)'}; ${state.mode === mode ? 'box-shadow: 0 0 30px ' + config.color + '40;' : ''}"
                             onclick="App.changeMode('${mode}')">
                            <div style="font-size: 3rem; text-align: center; margin-bottom: var(--spacing-md);">${config.icon}</div>
                            <h3 style="text-align: center; margin-bottom: var(--spacing-sm); color: ${config.color};">${config.title}</h3>
                            <p style="text-align: center; color: var(--text-secondary); font-size: 0.875rem;">${config.description}</p>
                            ${state.mode === mode ? '<div style="text-align: center; margin-top: var(--spacing-md);"><span class="badge badge-open">ACTIVE</span></div>' : ''}
                            <div class="tooltip">${config.tooltip}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="card mt-2">
                <h3 class="card-title">Current Configuration</h3>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-time">Active Mode</div>
                        <div class="timeline-content">
                            <strong>${modes[state.mode]?.title || state.mode}</strong>
                            <p style="margin-top: 0.5rem; color: var(--text-secondary);">${modes[state.mode]?.description || 'Loading...'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    approvals: () => {
        const pendingCases = state.cases.filter(c => c.status === 'OPEN' && c.risk === 'CRITICAL');

        return `
            <div class="view-header">
                <h2>Approval Queue</h2>
                <p class="card-subtitle">Review and approve pending security actions</p>
            </div>
            
            ${state.mode !== 'SEMI' ? `
                <div class="card">
                    <div class="text-center" style="padding: var(--spacing-xl);">
                        <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">ℹ️</div>
                        <h3>Approval Queue Not Active</h3>
                        <p class="card-subtitle mt-1">Switch to SEMI-AUTOMATIC mode to enable the approval workflow</p>
                        <button class="btn btn-primary mt-2" onclick="App.navigate('control')">Go to SOAR Control</button>
                    </div>
                </div>
            ` : `
                <div class="card">
                    ${pendingCases.length === 0 ? `
                        <div class="text-center" style="padding: var(--spacing-xl);">
                            <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">✅</div>
                            <h3>No Pending Approvals</h3>
                            <p class="card-subtitle mt-1">All critical threats have been reviewed</p>
                        </div>
                    ` : `
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Case ID</th>
                                        <th>IP Address</th>
                                        <th>Risk</th>
                                        <th>Reason</th>
                                        <th>Proposed Action</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pendingCases.map(c => `
                                        <tr>
                                            <td><code>${c.case_id.substring(0, 8)}</code></td>
                                            <td><strong>${c.ip}</strong></td>
                                            <td><span class="badge ${getSeverityClass(c.risk)}">${c.risk}</span></td>
                                            <td>${c.reason || 'N/A'}</td>
                                            <td>Block IP & Close Case</td>
                                            <td>
                                                <button class="btn btn-success btn-sm" onclick="App.approveCase('${c.case_id}', '${c.ip}')">Approve</button>
                                                <button class="btn btn-danger btn-sm" onclick="App.closeCase('${c.case_id}')">Reject</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            `}
        `;
    },

    logs: () => {
        // Enhanced activity log with multiple event types
        const activities = [];

        // Add case creation events
        state.cases.forEach(c => {
            activities.push({
                time: c.time,
                type: 'case_created',
                icon: '📋',
                message: `Case ${c.case_id.substring(0, 8)} created for IP ${c.ip} (${c.risk} risk)`,
                severity: c.risk
            });
        });

        // Add case closed events
        state.cases.filter(c => c.status === 'CLOSED').forEach(c => {
            if (c.closed_time) {
                activities.push({
                    time: c.closed_time,
                    type: 'case_closed',
                    icon: '✅',
                    message: `Case ${c.case_id.substring(0, 8)} closed - ${c.closure_note || 'Remediation completed'}`,
                    severity: 'LOW'
                });
            }
        });

        // Add approval events
        state.cases.filter(c => c.approved_by).forEach(c => {
            if (c.approved_time) {
                activities.push({
                    time: c.approved_time,
                    type: 'approval_granted',
                    icon: '✅',
                    message: `Remediation approved by ${c.approved_by} for case ${c.case_id.substring(0, 8)} (IP: ${c.ip})`,
                    severity: 'MEDIUM'
                });
            }
        });

        // Add IP block events (simulated from closed critical cases)
        state.cases.filter(c => c.status === 'CLOSED' && c.risk === 'CRITICAL').forEach(c => {
            if (c.closed_time) {
                activities.push({
                    time: c.closed_time,
                    type: 'ip_blocked',
                    icon: '🚫',
                    message: `IP ${c.ip} blocked and added to firewall blocklist`,
                    severity: 'HIGH'
                });
            }
        });

        // Add mode change events from activity log
        if (state.activityLog) {
            state.activityLog.forEach(log => {
                if (log.type === 'mode_change') {
                    activities.push({
                        time: log.time,
                        type: 'mode_change',
                        icon: '🏛️',
                        message: `SOAR mode changed from ${log.oldMode} to ${log.newMode}`,
                        severity: 'MEDIUM'
                    });
                }
            });
        }

        // Sort by time descending
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        return `
            <div class="view-header">
                <h2>Activity Logs</h2>
                <p class="card-subtitle">Complete audit trail of SOAR actions</p>
                <div class="live-indicator mt-1">
                    <div class="live-dot"></div>
                    <span>LIVE</span>
                </div>
            </div>
            
            <div class="card">
                ${activities.length === 0 ? `
                    <div class="text-center" style="padding: var(--spacing-xl);">
                        <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">📜</div>
                        <h3>No Activity Yet</h3>
                        <p class="card-subtitle mt-1">Activity logs will appear here as the SOAR processes threats</p>
                    </div>
                ` : `
                    <div class="timeline">
                        ${activities.map(activity => `
                            <div class="timeline-item">
                                <div class="timeline-time">${formatDate(activity.time)}</div>
                                <div class="timeline-content">
                                    <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                                        <span style="font-size: 1.5rem;">${activity.icon}</span>
                                        <div>
                                            <div>${activity.message}</div>
                                            ${activity.severity ? `<span class="badge ${getSeverityClass(activity.severity)} mt-1">${activity.severity}</span>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }
};

// ============================================
// APPLICATION CONTROLLER
// ============================================

const App = {
    async init() {
        console.log('🚀 Anti-Gravity SOC initializing...');

        // Set up navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.navigate(view);
            });
        });

        // Initial data load
        await this.loadData();

        // Render initial view
        this.render();

        // Start auto-refresh
        this.startAutoRefresh();

        console.log('✅ Anti-Gravity SOC ready');
    },

    async loadData() {
        try {
            const [stats, cases, modeData] = await Promise.all([
                API.getStats(),
                API.getCases(),
                API.getMode()
            ]);

            state.stats = stats;
            state.cases = cases.sort((a, b) => new Date(b.time) - new Date(a.time));
            state.mode = modeData.mode;

            // Intelligent auto-mode selection based on threat levels
            await this.intelligentModeSelection(stats);

            this.updateModeIndicator();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    },

    async intelligentModeSelection(stats) {
        // Auto-mode selection logic based on threat landscape
        const criticalThreats = stats.critical_threats || 0;
        const activeCases = stats.active_cases || 0;
        const currentMode = state.mode;

        let recommendedMode = currentMode;
        let reason = '';

        // Decision logic
        if (criticalThreats >= 3) {
            // High threat level - escalate to AUTO
            recommendedMode = 'AUTO';
            reason = `${criticalThreats} critical threats detected - escalating to automatic response`;
        } else if (criticalThreats > 0) {
            // Some critical threats - use SEMI for analyst review
            recommendedMode = 'SEMI';
            reason = `${criticalThreats} critical threat(s) detected - requiring analyst approval`;
        } else if (activeCases > 10) {
            // Many active cases but no critical - use SEMI
            recommendedMode = 'SEMI';
            reason = `${activeCases} active cases - enabling analyst oversight`;
        } else if (activeCases === 0 && criticalThreats === 0) {
            // All clear - can use MANUAL for observation
            recommendedMode = 'MANUAL';
            reason = 'No active threats - switching to observation mode';
        }

        // Only change mode if recommendation differs from current
        if (recommendedMode !== currentMode) {
            console.log(`🤖 Intelligent Mode Selection: ${currentMode} → ${recommendedMode}`);
            console.log(`   Reason: ${reason}`);

            try {
                const response = await API.setMode(recommendedMode);
                console.log('   API response:', response);
                state.mode = recommendedMode;

                // Show notification to user
                this.showModeChangeNotification(currentMode, recommendedMode, reason);
            } catch (error) {
                console.error('   Auto mode change failed:', error);
            }
        }
    },

    showModeChangeNotification(oldMode, newMode, reason) {
        // Create a non-intrusive notification
        const notification = document.createElement('div');
        notification.className = 'mode-change-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🤖</div>
                <div class="notification-text">
                    <strong>SOAR Mode Auto-Adjusted</strong>
                    <p>${oldMode} → ${newMode}</p>
                    <small>${reason}</small>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 8000);
    },


    navigate(view) {
        state.currentView = view;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === view) {
                item.classList.add('active');
            }
        });

        this.render();
    },

    render() {
        const content = document.getElementById('mainContent');
        const viewRenderer = Views[state.currentView];

        if (viewRenderer) {
            content.innerHTML = viewRenderer();

            // Set up view-specific event handlers
            if (state.currentView === 'scanner') {
                this.setupScanner();
            } else if (state.currentView === 'dashboard') {
                // Initialize charts after DOM is ready
                setTimeout(() => this.initializeCharts(), 100);
            }
        }
    },

    setupScanner() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');

        uploadZone.addEventListener('click', () => fileInput.click());

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) this.scanFile(file);
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.scanFile(file);
        });
    },

    async scanFile(file) {
        const resultsDiv = document.getElementById('scanResults');

        // Calculate file size
        const fileSize = file.size;
        const fileSizeFormatted = fileSize < 1024 ? `${fileSize} B` :
            fileSize < 1024 * 1024 ? `${(fileSize / 1024).toFixed(2)} KB` :
                `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

        // Calculate SHA256 hash (client-side preview - actual hash from server)
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Show file metadata immediately
        resultsDiv.innerHTML = `
            <div class="card scan-metadata-card">
                <h3 class="card-title">📄 File Information</h3>
                <div class="file-metadata-grid">
                    <div class="metadata-item">
                        <div class="metadata-label">Filename</div>
                        <div class="metadata-value"><strong>${file.name}</strong></div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">File Size</div>
                        <div class="metadata-value">${fileSizeFormatted}</div>
                    </div>
                    <div class="metadata-item">
                        <div class="metadata-label">SHA256 Hash</div>
                        <div class="metadata-value"><code class="hash-display">${hashHex}</code></div>
                    </div>
                </div>
            </div>
            
            <div class="card scan-progress-card">
                <h3 class="card-title">🔍 Scanning in Progress</h3>
                <div class="scan-progress-container">
                    <div class="scan-progress-bar">
                        <div class="scan-progress-fill" id="scanProgressFill"></div>
                    </div>
                    <div class="scan-progress-text" id="scanProgressText">Uploading file...</div>
                    <div class="scan-progress-percentage" id="scanProgressPercentage">0%</div>
                </div>
                <div class="scan-status-messages" id="scanStatusMessages">
                    <div class="status-message active">
                        <span class="status-icon">⏳</span>
                        <span>Uploading file to server...</span>
                    </div>
                </div>
            </div>
        `;

        // Animate progress
        const progressFill = document.getElementById('scanProgressFill');
        const progressText = document.getElementById('scanProgressText');
        const progressPercentage = document.getElementById('scanProgressPercentage');
        const statusMessages = document.getElementById('scanStatusMessages');

        const updateProgress = (percent, message) => {
            progressFill.style.width = percent + '%';
            progressPercentage.textContent = percent + '%';
            progressText.textContent = message;
        };

        const addStatusMessage = (icon, message) => {
            const msg = document.createElement('div');
            msg.className = 'status-message active';
            msg.innerHTML = `<span class="status-icon">${icon}</span><span>${message}</span>`;
            statusMessages.appendChild(msg);
        };

        try {
            updateProgress(20, 'Uploading file...');

            setTimeout(() => {
                updateProgress(40, 'Computing file hash...');
                addStatusMessage('🔐', 'Computing SHA256 hash...');
            }, 300);

            setTimeout(() => {
                updateProgress(60, 'Querying VirusTotal...');
                addStatusMessage('🌐', 'Querying VirusTotal database...');
            }, 600);

            // Perform actual scan
            const result = await API.scanFile(file);

            updateProgress(100, 'Scan complete!');
            addStatusMessage('✅', 'Scan completed successfully');

            // Wait a moment to show completion
            await new Promise(resolve => setTimeout(resolve, 500));

            // Show detailed results
            const isMalicious = result.malicious;
            const statusColor = isMalicious ? 'var(--severity-critical)' : 'var(--severity-low)';
            const statusIcon = isMalicious ? '⚠️' : '✅';
            const statusText = isMalicious ? 'MALICIOUS' : 'CLEAN';

            resultsDiv.innerHTML = `
                <div class="card scan-metadata-card">
                    <h3 class="card-title">📄 File Information</h3>
                    <div class="file-metadata-grid">
                        <div class="metadata-item">
                            <div class="metadata-label">Filename</div>
                            <div class="metadata-value"><strong>${result.filename}</strong></div>
                        </div>
                        <div class="metadata-item">
                            <div class="metadata-label">File Size</div>
                            <div class="metadata-value">${fileSizeFormatted}</div>
                        </div>
                        <div class="metadata-item">
                            <div class="metadata-label">SHA256 Hash</div>
                            <div class="metadata-value"><code class="hash-display">${result.sha256}</code></div>
                        </div>
                    </div>
                </div>
                
                <div class="card scan-result-card ${isMalicious ? 'malicious' : 'clean'}">
                    <div class="scan-result-header">
                        <div class="scan-result-icon">${statusIcon}</div>
                        <div>
                            <h3 class="scan-result-title" style="color: ${statusColor};">${statusText}</h3>
                            <p class="scan-result-subtitle">VirusTotal Detection Summary</p>
                        </div>
                    </div>
                    
                    <div class="scan-result-details">
                        ${isMalicious ? `
                            <div class="alert-box alert-danger">
                                <div class="alert-icon">🛡️</div>
                                <div class="alert-content">
                                    <strong>Threat Detected</strong>
                                    <p>This file has been flagged as malicious by VirusTotal's threat intelligence database.</p>
                                    ${result.case_id ? `<p class="mt-1">📋 Security Case ID: <code>${result.case_id.substring(0, 8)}</code></p>` : ''}
                                </div>
                            </div>
                            
                            <div class="detection-summary">
                                <h4 class="detection-title">Detection Analysis</h4>
                                <div class="detection-grid">
                                    <div class="detection-item">
                                        <span class="detection-label">Status:</span>
                                        <span class="badge badge-critical">Malicious</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">Risk Level:</span>
                                        <span class="badge badge-critical">CRITICAL</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">Source:</span>
                                        <span>VirusTotal Database</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">Recommended Action:</span>
                                        <span>Quarantine & Investigate</span>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="alert-box alert-success">
                                <div class="alert-icon">✅</div>
                                <div class="alert-content">
                                    <strong>File is Clean</strong>
                                    <p>No threats detected. This file appears to be safe based on VirusTotal analysis.</p>
                                </div>
                            </div>
                            
                            <div class="detection-summary">
                                <h4 class="detection-title">Detection Analysis</h4>
                                <div class="detection-grid">
                                    <div class="detection-item">
                                        <span class="detection-label">Status:</span>
                                        <span class="badge badge-low">Clean</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">Risk Level:</span>
                                        <span class="badge badge-low">LOW</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">Source:</span>
                                        <span>VirusTotal Database</span>
                                    </div>
                                    <div class="detection-item">
                                        <span class="detection-label">Recommended Action:</span>
                                        <span>None Required</span>
                                    </div>
                                </div>
                            </div>
                        `}
                    </div>
                </div>
                
                ${isMalicious && result.case_id ? `
                    <div class="card remediation-card">
                        <h3 class="card-title">🎯 Remediation Actions</h3>
                        <p class="card-subtitle mb-2">Available actions based on current SOAR mode: <strong>${state.mode}</strong></p>
                        
                        <div class="remediation-actions">
                            ${state.mode === 'AUTO' ? `
                                <div class="remediation-option auto-mode">
                                    <div class="remediation-icon">🤖</div>
                                    <div class="remediation-content">
                                        <h4>Automatic Remediation</h4>
                                        <p>System will automatically create a case and initiate response procedures.</p>
                                        <div class="remediation-status">
                                            <span class="badge badge-low">✓ Case Created: ${result.case_id.substring(0, 8)}</span>
                                            <span class="badge badge-low">✓ Auto-response Initiated</span>
                                        </div>
                                    </div>
                                </div>
                            ` : state.mode === 'SEMI' ? `
                                <div class="remediation-option semi-mode">
                                    <div class="remediation-icon">👤</div>
                                    <div class="remediation-content">
                                        <h4>Approval Required</h4>
                                        <p>Case has been created and queued for analyst approval before remediation.</p>
                                        <div class="remediation-status">
                                            <span class="badge badge-medium">⏳ Pending Approval</span>
                                            <span class="badge badge-open">Case: ${result.case_id.substring(0, 8)}</span>
                                        </div>
                                        <button class="btn btn-primary mt-2" onclick="App.navigate('approvals')">
                                            Go to Approval Queue
                                        </button>
                                    </div>
                                </div>
                            ` : `
                                <div class="remediation-option manual-mode">
                                    <div class="remediation-icon">📋</div>
                                    <div class="remediation-content">
                                        <h4>Manual Mode - Alert Only</h4>
                                        <p>Case has been created for tracking. No automatic actions will be taken.</p>
                                        <div class="remediation-status">
                                            <span class="badge badge-open">Case Created: ${result.case_id.substring(0, 8)}</span>
                                        </div>
                                        <button class="btn btn-secondary mt-2" onclick="App.navigate('cases')">
                                            View Case Details
                                        </button>
                                    </div>
                                </div>
                            `}
                        </div>
                        
                        <div class="action-buttons mt-2">
                            <button class="btn btn-secondary" onclick="App.navigate('cases')">
                                📁 View All Cases
                            </button>
                            <button class="btn btn-primary" onclick="document.getElementById('uploadZone').click()">
                                🔍 Scan Another File
                            </button>
                        </div>
                    </div>
                ` : !isMalicious ? `
                    <div class="card">
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="document.getElementById('uploadZone').click()">
                                🔍 Scan Another File
                            </button>
                        </div>
                    </div>
                ` : ''}
            `;


            // Add to scan history
            if (!state.scanHistory) state.scanHistory = [];
            state.scanHistory.unshift({
                filename: result.filename,
                malicious: result.malicious,
                timestamp: new Date().toISOString(),
                case_id: result.case_id
            });
            // Keep only last 10 scans
            if (state.scanHistory.length > 10) {
                state.scanHistory = state.scanHistory.slice(0, 10);
            }

            // Refresh data to show new case
            await this.loadData();
        } catch (error) {
            resultsDiv.innerHTML = `
                <div class="card">
                    <div class="scan-error">
                        <div class="scan-error-icon">❌</div>
                        <h3>Scan Failed</h3>
                        <p class="card-subtitle mt-1">${error.message || 'An error occurred during the scan'}</p>
                        <button class="btn btn-primary mt-2" onclick="document.getElementById('uploadZone').click()">
                            Try Again
                        </button>
                    </div>
                </div>
            `;
        }
    },

    async changeMode(mode) {
        console.log(`Attempting to change mode to: ${mode}`);
        if (confirm(`Switch SOAR mode to ${mode}?\n\nThis will affect how the system responds to threats.`)) {
            try {
                console.log('User confirmed mode change');
                const oldMode = state.mode;
                const response = await API.setMode(mode);
                console.log('API response:', response);
                state.mode = mode;
                console.log('State updated to:', state.mode);

                // Track mode change in activity log
                if (!state.activityLog) state.activityLog = [];
                state.activityLog.push({
                    type: 'mode_change',
                    oldMode: oldMode,
                    newMode: mode,
                    time: new Date().toISOString()
                });

                this.updateModeIndicator();
                this.render();
                alert(`✅ SOAR mode successfully changed to ${mode}`);
            } catch (error) {
                console.error('Mode change error:', error);
                alert('Failed to change mode: ' + error.message);
            }
        } else {
            console.log('User cancelled mode change');
        }
    },


    updateModeIndicator() {
        const indicator = document.getElementById('headerModeIndicator');
        const modeColors = {
            'AUTO': 'var(--severity-low)',
            'MANUAL': 'var(--accent-primary)'
        };

        const modeDescriptions = {
            'AUTO': 'Automatic mode - All threats remediated instantly',
            'SEMI': 'Semi-automatic mode - Approval required for critical threats',
            'MANUAL': 'Manual mode - Observe only, no automatic actions'
        };

        const dot = indicator.querySelector('.mode-dot');
        const text = indicator.querySelector('.mode-text');
        const tooltip = document.getElementById('modeTooltip');

        dot.style.background = modeColors[state.mode] || 'var(--text-muted)';
        text.textContent = state.mode;
        if (tooltip) {
            tooltip.textContent = modeDescriptions[state.mode] || 'Current SOAR response mode';
        }
    },

    async closeCase(caseId) {
        if (confirm('Close this case?')) {
            try {
                await API.closeCase(caseId);
                await this.loadData();
                this.render();
            } catch (error) {
                alert('Failed to close case: ' + error.message);
            }
        }
    },

    async approveCase(caseId, ip) {
        if (confirm(`Approve remediation for IP ${ip}?\n\nThis will block the IP and close the case.`)) {
            try {
                await API.approveCase(caseId, ip);
                await this.loadData();
                this.render();
            } catch (error) {
                alert('Failed to approve case: ' + error.message);
            }
        }
    },

    viewCase(caseId) {
        const caseData = state.cases.find(c => c.case_id === caseId);
        if (!caseData) return;

        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modalContent');

        // Calculate confidence score based on multiple factors
        const confidence = this.calculateConfidence(caseData);

        modalContent.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">Case Details</h2>
                <button class="modal-close" onclick="App.closeModal()">×</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                <div>
                    <div class="stat-label">Case ID</div>
                    <div style="margin-top: 0.5rem;"><code>${caseData.case_id}</code></div>
                </div>
                <div>
                    <div class="stat-label">IP Address</div>
                    <div style="margin-top: 0.5rem;"><strong>${caseData.ip}</strong></div>
                </div>
                <div>
                    <div class="stat-label">Risk Level</div>
                    <div style="margin-top: 0.5rem;"><span class="badge ${getSeverityClass(caseData.risk)}">${caseData.risk}</span></div>
                </div>
                <div>
                    <div class="stat-label">Status</div>
                    <div style="margin-top: 0.5rem;"><span class="badge ${caseData.status === 'OPEN' ? 'badge-open' : 'badge-closed'}">${caseData.status}</span></div>
                </div>
                <div>
                    <div class="stat-label">Confidence</div>
                    <div style="margin-top: 0.5rem;"><span class="confidence-indicator confidence-${confidence.level.toLowerCase()}">${confidence.level}</span></div>
                </div>
            </div>
            
            <div class="card" style="background: var(--bg-tertiary);">
                <h3 class="card-title">Attack Information</h3>
                <div style="margin-top: var(--spacing-md);">
                    <div class="stat-label">Reason</div>
                    <p style="margin-top: 0.5rem;">${caseData.reason || 'N/A'}</p>
                </div>
                <div style="margin-top: var(--spacing-md);">
                    <div class="stat-label">Severity Score</div>
                    <p style="margin-top: 0.5rem;">${caseData.severity || 'N/A'}</p>
                </div>
                <div style="margin-top: var(--spacing-md);">
                    <div class="stat-label">Threat Confidence</div>
                    <p style="margin-top: 0.5rem;">${confidence.reason}</p>
                </div>
            </div>
            
            <div class="card mt-2" style="background: var(--bg-tertiary);">
                <h3 class="card-title">Timeline</h3>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-time">${formatDate(caseData.time)}</div>
                        <div class="timeline-content">
                            <strong>Case Created</strong>
                            <p style="margin-top: 0.5rem; color: var(--text-secondary);">Security incident detected and case opened</p>
                        </div>
                    </div>
                    ${caseData.approved_by ? `
                        <div class="timeline-item">
                            <div class="timeline-time">${formatDate(caseData.approved_time)}</div>
                            <div class="timeline-content">
                                <strong>✅ Approved for Remediation</strong>
                                <p style="margin-top: 0.5rem; color: var(--text-secondary);">Approved by ${caseData.approved_by} - Action: Block IP & Close Case</p>
                            </div>
                        </div>
                    ` : ''}
                    ${caseData.status === 'CLOSED' ? `
                        <div class="timeline-item">
                            <div class="timeline-time">${formatDate(caseData.closed_time)}</div>
                            <div class="timeline-content">
                                <strong>Case Closed</strong>
                                <p style="margin-top: 0.5rem; color: var(--text-secondary);">${caseData.closure_note || 'Remediation completed'}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Analyst Notes Section -->
            <div class="card mt-2 notes-section" style="background: var(--bg-tertiary);">
                <h3 class="card-title">📝 Analyst Notes</h3>
                <p class="card-subtitle mb-2">Add investigation notes and observations</p>
                <textarea 
                    class="notes-textarea" 
                    id="caseNotes_${caseData.case_id}" 
                    placeholder="Enter your notes here...">${caseData.notes || ''}</textarea>
                <button class="btn btn-primary mt-1" onclick="App.saveNotes('${caseData.case_id}')">💾 Save Notes</button>
            </div>
            
            <!-- Manual Remediation Controls -->
            ${caseData.status === 'OPEN' ? `
                <div style="margin-top: var(--spacing-lg); display: flex; gap: var(--spacing-md); justify-content: flex-end; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="App.closeModal()">Close</button>
                    <button class="btn btn-danger" onclick="App.blockIPManual('${caseData.ip}', '${caseData.case_id}')">🚫 Block IP</button>
                    <button class="btn btn-danger" onclick="App.closeCase('${caseData.case_id}'); App.closeModal();">❌ Close Case</button>
                </div>
            ` : `
                <div style="margin-top: var(--spacing-lg); display: flex; gap: var(--spacing-md); justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="App.closeModal()">Close</button>
                    <button class="btn btn-success" onclick="App.reopenCaseManual('${caseData.case_id}')">🔄 Re-open Case</button>
                </div>
            `}
        `;

        modal.classList.add('active');

        // Close on backdrop click
        modal.querySelector('.modal-backdrop').onclick = () => this.closeModal();
    },

    closeModal() {
        document.getElementById('modal').classList.remove('active');
    },

    startAutoRefresh() {
        // Refresh data every 5 seconds
        state.refreshInterval = setInterval(async () => {
            await this.loadData();
            // Only re-render if we're on dashboard or cases view
            if (['dashboard', 'cases', 'approvals', 'logs'].includes(state.currentView)) {
                this.render();
            }
        }, 5000);
    },

    initializeCharts() {
        // Destroy existing charts properly using Chart.getChart()
        const chartIds = ['threatTimelineChart', 'severityChart', 'threatTypesChart'];
        chartIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const existingChart = Chart.getChart(canvas);
                if (existingChart) {
                    existingChart.destroy();
                }
            }
        });

        // Prepare data for charts
        const cases = state.cases || [];

        // 1. Threat Timeline - Group cases by date
        const timelineData = this.prepareTimelineData(cases);

        // 2. Severity Distribution
        const severityData = this.prepareSeverityData(cases);

        // 3. Threat Types
        const threatTypeData = this.prepareThreatTypeData(cases);

        // Chart.js default config
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.font.family = 'Inter, sans-serif';

        // 1. Threat Timeline Chart
        const timelineCtx = document.getElementById('threatTimelineChart');
        if (timelineCtx) {
            window.threatTimelineChart = new Chart(timelineCtx, {
                type: 'line',
                data: {
                    labels: timelineData.labels,
                    datasets: [{
                        label: 'Cases Created',
                        data: timelineData.data,
                        borderColor: '#00d9ff',
                        backgroundColor: 'rgba(0, 217, 255, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#00d9ff',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2.5,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(25, 30, 45, 0.95)',
                            titleColor: '#00d9ff',
                            bodyColor: '#e5e7eb',
                            borderColor: '#00d9ff',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 },
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // 2. Severity Distribution Chart
        const severityCtx = document.getElementById('severityChart');
        if (severityCtx) {
            window.severityChart = new Chart(severityCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Low', 'Medium', 'High', 'Critical'],
                    datasets: [{
                        data: [
                            severityData.LOW || 0,
                            severityData.MEDIUM || 0,
                            severityData.HIGH || 0,
                            severityData.CRITICAL || 0
                        ],
                        backgroundColor: [
                            '#10b981',
                            '#f59e0b',
                            '#f97316',
                            '#ef4444'
                        ],
                        borderColor: '#131824',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(25, 30, 45, 0.95)',
                            titleColor: '#00d9ff',
                            bodyColor: '#e5e7eb',
                            borderColor: '#00d9ff',
                            borderWidth: 1,
                            padding: 12
                        }
                    }
                }
            });
        }

        // 3. Threat Types Chart
        const threatTypesCtx = document.getElementById('threatTypesChart');
        if (threatTypesCtx) {
            window.threatTypesChart = new Chart(threatTypesCtx, {
                type: 'bar',
                data: {
                    labels: ['Malware', 'Brute Force', 'Other'],
                    datasets: [{
                        label: 'Incidents',
                        data: [
                            threatTypeData.malware || 0,
                            threatTypeData.bruteforce || 0,
                            threatTypeData.other || 0
                        ],
                        backgroundColor: [
                            'rgba(124, 58, 237, 0.8)',
                            'rgba(0, 217, 255, 0.8)',
                            'rgba(156, 163, 175, 0.8)'
                        ],
                        borderColor: [
                            '#7c3aed',
                            '#00d9ff',
                            '#9ca3af'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(25, 30, 45, 0.95)',
                            titleColor: '#00d9ff',
                            bodyColor: '#e5e7eb',
                            borderColor: '#00d9ff',
                            borderWidth: 1,
                            padding: 12
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 },
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    },

    prepareTimelineData(cases) {
        // Group cases by date (last 7 days)
        const days = 7;
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            labels.push(dateStr);

            // Count cases for this date
            const count = cases.filter(c => {
                const caseDate = new Date(c.time);
                return caseDate.toDateString() === date.toDateString();
            }).length;
            data.push(count);
        }

        return { labels, data };
    },

    prepareSeverityData(cases) {
        const severity = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
        cases.forEach(c => {
            if (severity.hasOwnProperty(c.risk)) {
                severity[c.risk]++;
            }
        });
        return severity;
    },

    prepareThreatTypeData(cases) {
        const types = { malware: 0, bruteforce: 0, other: 0 };
        cases.forEach(c => {
            const reason = (c.reason || '').toLowerCase();
            if (reason.includes('malware') || reason.includes('virus')) {
                types.malware++;
            } else if (reason.includes('brute') || reason.includes('force')) {
                types.bruteforce++;
            } else {
                types.other++;
            }
        });
        return types;
    },

    calculateConfidence(caseData) {
        // Calculate threat confidence based on multiple signals
        let score = 0;
        let reasons = [];

        // Factor 1: Risk level
        if (caseData.risk === 'CRITICAL') {
            score += 40;
            reasons.push('Critical risk level');
        } else if (caseData.risk === 'HIGH') {
            score += 30;
            reasons.push('High risk level');
        } else if (caseData.risk === 'MEDIUM') {
            score += 20;
        } else {
            score += 10;
        }

        // Factor 2: Severity score
        if (caseData.severity && caseData.severity > 80) {
            score += 30;
            reasons.push('High severity score');
        } else if (caseData.severity && caseData.severity > 50) {
            score += 20;
        }

        // Factor 3: Reason specificity
        if (caseData.reason && caseData.reason.toLowerCase().includes('malware')) {
            score += 30;
            reasons.push('Malware detected');
        } else if (caseData.reason && caseData.reason.toLowerCase().includes('brute')) {
            score += 20;
            reasons.push('Brute force pattern');
        }

        // Determine confidence level
        let level, reason;
        if (score >= 70) {
            level = 'HIGH';
            reason = 'Multiple threat indicators: ' + reasons.join(', ');
        } else if (score >= 40) {
            level = 'MEDIUM';
            reason = reasons.length > 0 ? reasons.join(', ') : 'Moderate threat indicators';
        } else {
            level = 'LOW';
            reason = 'Limited threat indicators';
        }

        return { level, reason, score };
    },

    async saveNotes(caseId) {
        const textarea = document.getElementById(`caseNotes_${caseId}`);
        if (!textarea) return;

        const notes = textarea.value;

        try {
            await API.saveNotes(caseId, notes);

            // Update local state
            const caseData = state.cases.find(c => c.case_id === caseId);
            if (caseData) {
                caseData.notes = notes;
            }

            alert('✅ Notes saved successfully');
        } catch (error) {
            alert('Failed to save notes: ' + error.message);
        }
    },

    async blockIPManual(ip, caseId) {
        if (confirm(`Block IP ${ip}?\n\nThis will add the IP to the firewall blocklist.`)) {
            try {
                await API.blockIP(ip, caseId);
                await this.loadData();
                this.closeModal();
                alert(`✅ IP ${ip} has been blocked`);
            } catch (error) {
                alert('Failed to block IP: ' + error.message);
            }
        }
    },

    async reopenCaseManual(caseId) {
        if (confirm('Re-open this case?\n\nThe case will be marked as OPEN again.')) {
            try {
                await API.reopenCase(caseId);
                await this.loadData();
                this.closeModal();
                this.render();
                alert('✅ Case has been re-opened');
            } catch (error) {
                alert('Failed to re-open case: ' + error.message);
            }
        }
    },

    startAutoRefresh() {
        // Refresh data every 5 seconds
        state.refreshInterval = setInterval(async () => {
            await this.loadData();
            // Only re-render if we're on dashboard or cases view
            if (['dashboard', 'cases', 'approvals', 'logs'].includes(state.currentView)) {
                this.render();
            }
        }, 5000);
    }
};

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
