(function() {
    'use strict';

    // ==================== VERSION & LOADING CHECK ====================
    const SCRIPT_VERSION = '1.0.0';
    
    // Prevent duplicate loading
    if (window.IVAC_AUTOMATION_LOADED) {
        console.log('%c[IVAC] System already loaded (v' + SCRIPT_VERSION + ')', 'color: #ffc107; font-weight: bold;');
        return;
    }
    
    console.log('%c[IVAC] Automation System v' + SCRIPT_VERSION + ' starting...', 'color: #28a745; font-weight: bold;');
    
    // Mark as loaded
    window.IVAC_AUTOMATION_LOADED = true;
    window.IVAC_VERSION = SCRIPT_VERSION;

    // ==================== AUTHENTICATION SYSTEM ====================
    // User database URL - Points to your GitHub-hosted user database
    const USER_DB_URL = 'https://raw.githubusercontent.com/Hasan1817/ivacbd/refs/heads/main/users-encrypted.json';
    
    // Check authentication before proceeding
    async function checkAuthentication() {
        // Check if already authenticated in this session
        const session = localStorage.getItem('IVAC_AUTH_SESSION');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();
                
                // Check if session is still valid (not expired)
                if (sessionData.sessionExpires && sessionData.sessionExpires > now) {
                    // Check if user license hasn't expired
                    const licenseExpiry = new Date(sessionData.userExpires).getTime();
                    if (licenseExpiry > now) {
                        console.log('%c[AUTH] Session valid, welcome back ' + sessionData.username, 'color: #28a745;');
                        showExpiryWarning(sessionData.userExpires, sessionData.username);
                        return true;
                    } else {
                        localStorage.removeItem('IVAC_AUTH_SESSION');
                        showExpiredModal(sessionData.username, sessionData.userExpires);
                        return false;
                    }
                }
            } catch (e) {
                localStorage.removeItem('IVAC_AUTH_SESSION');
            }
        }
        
        // Need to login
        return await showLoginModal();
    }
    
    function showExpiryWarning(expiryDate, username) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 7 && daysLeft > 0) {
            console.log('%c[WARNING] Your license expires in ' + daysLeft + ' days (' + expiryDate + ')', 'color: #ffc107; font-weight: bold;');
        }
    }
    
    function showExpiredModal(username, expiryDate) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            font-family: Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    background: #dc3545;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 30px;
                    color: white;
                ">✕</div>
                <h2 style="margin: 0 0 10px; color: #333;">License Expired</h2>
                <p style="color: #666; margin: 0 0 20px; line-height: 1.5;">
                    User <strong>${username}</strong> license expired on<br>
                    <strong>${expiryDate}</strong>
                </p>
                <p style="color: #999; font-size: 14px; margin: 0 0 20px;">
                    Please contact administrator to renew your access.
                </p>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: bold;
                ">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    async function showLoginModal() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.id = 'ivac-auth-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                font-family: Arial, sans-serif;
            `;
            
            const form = document.createElement('div');
            form.style.cssText = `
                background: white;
                padding: 40px;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            `;
            
            form.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="
                        width: 70px;
                        height: 70px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 15px;
                        font-size: 35px;
                        color: white;
                    ">&#128274;</div>
                    <h2 style="margin: 0 0 5px; color: #333;">IVAC Automation</h2>
                    <p style="margin: 0; color: #999; font-size: 14px;">Enter your credentials to continue</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #555; font-size: 14px; font-weight: bold;">Username</label>
                    <input type="text" id="auth-username" placeholder="Enter username" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        transition: border-color 0.3s;
                    " />
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; color: #555; font-size: 14px; font-weight: bold;">Password</label>
                    <input type="password" id="auth-password" placeholder="Enter password" style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                        transition: border-color 0.3s;
                    " />
                </div>
                
                <div id="auth-error" style="
                    display: none;
                    padding: 12px;
                    background: #fee;
                    border: 1px solid #fcc;
                    border-radius: 6px;
                    color: #c33;
                    font-size: 13px;
                    margin-bottom: 20px;
                    text-align: center;
                "></div>
                
                <button id="auth-login-btn" style="
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.2s;
                ">Login</button>
                
                <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
                    Protected by IVAC Authentication System v${SCRIPT_VERSION}
                </div>
            `;
            
            modal.appendChild(form);
            document.body.appendChild(modal);
            
            const usernameInput = document.getElementById('auth-username');
            const passwordInput = document.getElementById('auth-password');
            const loginBtn = document.getElementById('auth-login-btn');
            const errorDiv = document.getElementById('auth-error');
            
            // Focus username field
            setTimeout(() => usernameInput.focus(), 100);
            
            // Add input focus effects
            [usernameInput, passwordInput].forEach(input => {
                input.addEventListener('focus', () => {
                    input.style.borderColor = '#667eea';
                });
                input.addEventListener('blur', () => {
                    input.style.borderColor = '#e0e0e0';
                });
            });
            
            // Enter key to submit
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') loginBtn.click();
            });
            
            loginBtn.addEventListener('click', async () => {
                const username = usernameInput.value.trim();
                const password = passwordInput.value;
                
                if (!username || !password) {
                    showError('Please enter both username and password');
                    return;
                }
                
                loginBtn.disabled = true;
                loginBtn.textContent = 'Authenticating...';
                errorDiv.style.display = 'none';
                
                try {
                    const result = await validateCredentials(username, password);
                    
                    if (result.success) {
                        // Save session (valid for 24 hours)
                        const sessionData = {
                            username: username,
                            userExpires: result.userExpires,
                            sessionExpires: new Date().getTime() + (24 * 60 * 60 * 1000),
                            role: result.role
                        };
                        localStorage.setItem('IVAC_AUTH_SESSION', JSON.stringify(sessionData));
                        
                        // Show success
                        loginBtn.style.background = '#28a745';
                        loginBtn.textContent = 'Success! Loading...';
                        
                        setTimeout(() => {
                            modal.remove();
                            showExpiryWarning(result.userExpires, username);
                            resolve(true);
                        }, 800);
                    } else {
                        showError(result.error);
                        loginBtn.disabled = false;
                        loginBtn.textContent = 'Login';
                    }
                } catch (err) {
                    showError('Connection error. Please check internet connection.');
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login';
                }
            });
            
            function showError(message) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                usernameInput.style.borderColor = '#fcc';
                passwordInput.style.borderColor = '#fcc';
                setTimeout(() => {
                    usernameInput.style.borderColor = '#e0e0e0';
                    passwordInput.style.borderColor = '#e0e0e0';
                }, 2000);
            }
        });
    }
    
    async function validateCredentials(username, password) {
        try {
            console.log('[AUTH] Fetching user database from:', USER_DB_URL);
            
            // Fetch user database
            const response = await fetch(USER_DB_URL + '?t=' + Date.now(), {
                cache: 'no-cache'
            });
            
            console.log('[AUTH] Response status:', response.status);
            
            if (!response.ok) {
                console.error('[AUTH] Failed to fetch user database. Status:', response.status);
                return {
                    success: false,
                    error: 'Unable to verify credentials. Please try again.'
                };
            }
            
            // Get response text first for debugging
            const responseText = await response.text();
            console.log('[AUTH] Response received, length:', responseText.length);
            
            // Try to parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('[AUTH] JSON parsed successfully');
            } catch (parseErr) {
                console.error('[AUTH] JSON Parse Error:', parseErr.message);
                console.error('[AUTH] Response text:', responseText.substring(0, 200));
                return {
                    success: false,
                    error: 'Database format error. Please contact administrator.'
                };
            }
            
            const user = data.users ? data.users[username] : null;
            
            if (!user) {
                return {
                    success: false,
                    error: 'Invalid username or password'
                };
            }
            
            // Decode and check password (base64 encoded in database)
            const decodedPassword = atob(user.password);
            if (decodedPassword !== password) {
                return {
                    success: false,
                    error: 'Invalid username or password'
                };
            }
            
            // Check expiry date
            const expiryDate = new Date(user.expires);
            const now = new Date();
            
            if (expiryDate < now) {
                return {
                    success: false,
                    error: 'Your license expired on ' + user.expires + '. Please contact administrator.'
                };
            }
            
            // Success
            console.log('%c[AUTH] Login successful: ' + username, 'color: #28a745; font-weight: bold;');
            return {
                success: true,
                userExpires: user.expires,
                role: user.role || 'basic'
            };
            
        } catch (err) {
            console.error('[AUTH] Error:', err);
            return {
                success: false,
                error: 'Authentication system error. Please try again.'
            };
        }
    }

    // ==================== AUTHENTICATION GATE ====================
    // Check authentication before initializing main system
    (async function initializeSystem() {
        const isAuthenticated = await checkAuthentication();
        
        if (!isAuthenticated) {
            console.log('%c[IVAC] Authentication failed. System not loaded.', 'color: #dc3545; font-weight: bold;');
            return;
        }
        
        console.log('%c[IVAC] Authentication successful. Loading main system...', 'color: #28a745; font-weight: bold;');

    // ==================== DATA ====================
    // Configuration is now managed through the Config panel
    // Click "Config" button to upload your IVAC_APP_DATA
    // Data will be saved to localStorage and auto-populate all forms

    // ==================== STYLES ====================
    const style = document.createElement('style');
    style.innerHTML = `
        #ivac-container {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 700px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: Arial, sans-serif;
            z-index: 9999;
            display: flex;
            flex-direction: column;
        }
        .ivac-header {
            display: flex;
            justify-content: space-between;
            padding: 5px;
            background-color: #f5f5f5;
            border-bottom: 1px solid #ddd;
            cursor: move;
        }
        .header-btn {
            flex-grow: 1;
            padding: 10px 5px;
            margin: 0 3px;
            border: none;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            color: #fff;
            border-radius: 5px;
            transition: all 0.2s;
            text-align: center;
        }
        .btn-login { background-color: #007bff; }
        .btn-submit { background-color: #ffc107; color: #333; }
        .btn-payment { background-color: #dc3545; }
        .btn-login:hover { background-color: #0069d9; }
        .btn-submit:hover { background-color: #e0a800; }
        .btn-payment:hover { background-color: #c82333; }
        .header-btn:active { transform: scale(0.98); }
        .header-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .ivac-content {
            padding: 15px;
            color: #555;
            font-size: 14px;
        }
        .popup-panel {
            display: none;
            padding: 15px;
            border-top: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        .popup-panel.active {
            display: block;
        }
        
        /* Login Panel */
        .ivac-panel input, .ivac-panel textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #d0d0d0;
            font-size: 12px;
        }
        .ivac-panel .slim-btn {
            padding: 4px 6px !important;
            font-size: 12px !important;
            line-height: 1.2 !important;
            min-height: 26px !important;
            border-radius: 5px !important;
            border: none !important;
            cursor: pointer !important;
        }
        .ivac-panel .button-row {
            display: flex;
            gap: 6px;
        }
        .ivac-panel .button-row input {
            flex: 1;
        }
        .ivac-panel .button-row .slim-btn {
            flex: 0 0 90px;
        }
        .ivac-panel .status {
            font-size: 11px;
            color: #444;
            min-height: 16px;
            text-align: center;
        }
        
        /* Submit Panel */
        .submit-panel {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 10px;
        }
        .submit-panel input, .submit-panel textarea {
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-size: 12px;
            width: 100%;
            box-sizing: border-box;
        }
        .submit-panel button {
            padding: 8px;
            font-size: 12px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            color: #fff;
            transition: background-color 0.3s;
        }
        .submit-panel .btn-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
        }
        .submit-panel .live-msg {
            min-height: 40px;
            border: 1px solid #ccc;
            padding: 4px;
            font-size: 11px;
            background: #f8f9fa;
        }
        .submit-panel .kv-container {
            border: 1px solid #eee;
            padding: 5px;
            max-height: 150px;
            overflow-y: auto;
        }
        .submit-panel .kv-row {
            display: flex;
            gap: 3px;
            margin-bottom: 2px;
        }
        .submit-panel .kv-row input {
            width: 50%;
        }
        
        /* Payment Panel */
        .payment-panel-main {
            display: flex;
            flex-direction: column;
            gap: 4px;
            background: #fff;
            padding: 8px;
            border-radius: 5px;
            border: 1px solid #ddd;
            font-size: 13px;
        }
        .payment-panel-main .message-box {
            margin-top: 8px;
            min-height: 24px;
            font-size: 12px;
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 6px;
            padding: 4px;
            color: #111;
            text-align: center;
        }
        .payment-panel-main .input-row {
            display: flex;
            gap: 3px;
        }
        .payment-panel-main input {
            padding: 4px 6px;
            border-radius: 5px;
            border: 1px solid #ccc;
            font-size: 12px;
            width: calc(50% - 3px);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .payment-panel-main .full-width-input {
            width: 100%;
        }
        .payment-panel-main button {
            padding: 4px 0;
            background-color: #6f42c1;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            width: 100%;
            box-shadow: 0 1px 4px rgba(0,0,0,0.25);
            transition: opacity 0.15s ease;
        }
        .payment-panel-main button:hover {
            opacity: 0.85;
        }
        
        /* Body Wrapper - Side by Side Layout */
        .ivac-body-wrapper {
            display: flex;
            flex-direction: row;
            flex: 1;
            overflow: hidden;
        }
        
        /* Log Panel - Left Side */
        .log-panel {
            width: 280px;
            min-width: 280px;
            overflow-y: auto;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 0;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            border-right: 1px solid #333;
            display: flex;
            flex-direction: column;
        }
        .log-panel-header {
            background: #2d2d2d;
            padding: 8px;
            border-bottom: 1px solid #444;
            font-weight: bold;
            color: #17a2b8;
            font-size: 12px;
            text-align: center;
        }
        .log-panel-content {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }
        .log-entry {
            margin-bottom: 4px;
            padding: 2px 4px;
            border-left: 3px solid #555;
        }
        .log-success { border-left-color: #28a745; color: #28a745; }
        .log-error { border-left-color: #dc3545; color: #dc3545; }
        .log-warning { border-left-color: #ffc107; color: #ffc107; }
        .log-info { border-left-color: #17a2b8; color: #17a2b8; }
        
        /* Main Content Area - Right Side */
        .ivac-main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        }
    `;
    document.head.appendChild(style);

    // ==================== LOG SYSTEM ====================
    const LogManager = {
        logs: [],
        container: null,
        contentDiv: null,
        
        init(container) {
            this.container = container;
            
            // Create log panel structure
            const header = document.createElement('div');
            header.className = 'log-panel-header';
            header.textContent = 'Network Logs';
            
            const content = document.createElement('div');
            content.className = 'log-panel-content';
            
            container.appendChild(header);
            container.appendChild(content);
            
            this.contentDiv = content;
            this.render();
        },
        
        add(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            this.logs.push({ timestamp, message, type });
            if (this.logs.length > 100) this.logs.shift();
            this.render();
        },
        
        render() {
            if (!this.contentDiv) return;
            this.contentDiv.innerHTML = this.logs.map(log => 
                `<div class="log-entry log-${log.type}">[${log.timestamp}] ${log.message}</div>`
            ).join('');
            this.contentDiv.scrollTop = this.contentDiv.scrollHeight;
        },
        
        clear() {
            this.logs = [];
            this.render();
        }
    };

    // ==================== CONFIG HELPER ====================
    function getStoredConfig() {
        try {
            const saved = localStorage.getItem('IVAC_APP_DATA');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            LogManager.add('Error loading config: ' + e.message, 'error');
        }
        return null;
    }

    // ==================== BUTTON COOLDOWN ====================
    function startCooldown(button, seconds = 8) {
        const originalText = button.textContent;
        let remaining = seconds;
        
        button.disabled = true;
        button.textContent = `Wait ${remaining}s`;
        
        const interval = setInterval(() => {
            remaining--;
            if (remaining > 0) {
                button.textContent = `Wait ${remaining}s`;
            } else {
                clearInterval(interval);
                button.disabled = false;
                button.textContent = originalText;
            }
        }, 1000);
    }

    // ==================== NETWORK INTERCEPTOR ====================
    // Patch fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = args[0];
        const options = args[1] || {};
        
        LogManager.add(`[REQ] ${options.method || 'GET'} ${url}`, 'info');
        
        try {
            const response = await originalFetch.apply(this, args);
            const status = response.status;
            
            if (status >= 200 && status < 300) {
                LogManager.add(`[${status}] ${url}`, 'success');
            } else if (status >= 400 && status < 500) {
                LogManager.add(`[${status}] ${url}`, 'error');
            } else if (status >= 500) {
                LogManager.add(`[${status}] ${url}`, 'error');
            } else {
                LogManager.add(`[${status}] ${url}`, 'warning');
            }
            
            return response;
        } catch (error) {
            LogManager.add(`[ERROR] Network: ${error.message}`, 'error');
            throw error;
        }
    };

    // Patch XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._method = method;
        this._url = url;
        return originalXHROpen.apply(this, [method, url, ...rest]);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
        LogManager.add(`[REQ] ${this._method} ${this._url}`, 'info');
        
        this.addEventListener('load', function() {
            const status = this.status;
            if (status >= 200 && status < 300) {
                LogManager.add(`[${status}] ${this._url}`, 'success');
            } else if (status >= 400 && status < 500) {
                LogManager.add(`[${status}] ${this._url}`, 'error');
            } else if (status >= 500) {
                LogManager.add(`[${status}] ${this._url}`, 'error');
            } else {
                LogManager.add(`[${status}] ${this._url}`, 'warning');
            }
        });
        
        this.addEventListener('error', function() {
            LogManager.add(`[ERROR] XHR: ${this._url}`, 'error');
        });
        
        return originalXHRSend.apply(this, args);
    };

    // ==================== CONTAINER ====================
    const container = document.createElement('div');
    container.id = 'ivac-container';
    
    const header = document.createElement('div');
    header.className = 'ivac-header';
    header.innerHTML = `
        <button class="header-btn btn-autofill" data-panel="autofill">Autofill</button>
        <button class="header-btn btn-login" data-panel="login">Login</button>
        <button class="header-btn btn-submit" data-panel="submit">Submit</button>
        <button class="header-btn btn-payment" data-panel="payment">Payment</button>
        <button class="header-btn btn-config" data-panel="config">Config</button>
        <button class="header-btn" id="minimize-btn" style="background: #6c757d; flex: 0 0 35px; padding: 5px;">−</button>
    `;
    
    // Body wrapper for side-by-side layout
    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'ivac-body-wrapper';
    
    // Log panel (left side)
    const logPanel = document.createElement('div');
    logPanel.className = 'log-panel';
    
    // Main content area (right side)
    const mainContent = document.createElement('div');
    mainContent.className = 'ivac-main-content';
    
    const content = document.createElement('div');
    content.className = 'ivac-content';
    content.innerHTML = '<p style="font-size: 12px; margin: 0;">IVAC Automation System Ready</p>';
    
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-panel';
    
    // Assemble structure
    mainContent.appendChild(content);
    mainContent.appendChild(popupContainer);
    
    bodyWrapper.appendChild(logPanel);
    bodyWrapper.appendChild(mainContent);
    
    container.appendChild(header);
    container.appendChild(bodyWrapper);
    document.body.appendChild(container);
    
    // Initialize log system
    LogManager.init(logPanel);
    LogManager.add('IVAC System initialized', 'success');

    // ==================== AUTOFILL PANEL ====================
    function createAutofillPanel() {
        popupContainer.innerHTML = '';
        popupContainer.className = 'popup-panel active';
        
        const panel = document.createElement('div');
        panel.className = 'ivac-panel';
        panel.style.cssText = 'background: #fff; padding: 12px; border-radius: 8px;';
        
        const title = document.createElement('div');
        title.textContent = 'IVAC — Autofill';
        title.style.cssText = 'font-size: 15px; font-weight: 700; text-align: center; margin-bottom: 10px;';
        panel.appendChild(title);
        
        // Load config
        const config = getStoredConfig();
        
        const info = document.createElement('div');
        if (config) {
            info.textContent = `Config loaded: ${config.webfile_id || 'N/A'}`;
            info.style.cssText = 'font-size: 11px; color: #059669; text-align: center; margin-bottom: 10px; background: #d1fae5; padding: 4px; border-radius: 4px;';
        } else {
            info.textContent = 'No config found. Please upload config first.';
            info.style.cssText = 'font-size: 11px; color: #dc2626; text-align: center; margin-bottom: 10px; background: #fee2e2; padding: 4px; border-radius: 4px;';
        }
        panel.appendChild(info);
        
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = 'margin-bottom: 8px; padding: 6px; border-radius: 4px; font-size: 11px; display: none;';
        panel.appendChild(messageDiv);
        
        const showMessage = (text, isError = false) => {
            messageDiv.textContent = text;
            messageDiv.style.display = 'block';
            messageDiv.style.background = isError ? '#fee2e2' : '#d1fae5';
            messageDiv.style.color = isError ? '#991b1b' : '#065f46';
            setTimeout(() => messageDiv.style.display = 'none', 3000);
        };
        
        // Fill Web File ID button
        const fillWebFileBtn = document.createElement('button');
        fillWebFileBtn.textContent = 'Fill Web File IDs';
        fillWebFileBtn.className = 'slim-btn';
        fillWebFileBtn.style.cssText = 'width: 100%; background: #007bff; color: #fff; margin-bottom: 6px;';
        fillWebFileBtn.addEventListener('click', () => {
            if (!config) {
                showMessage('No config found. Upload config first.', true);
                return;
            }
            
            // Example: Fill web file ID fields on the page
            const webfileInput = document.querySelector('input[name="web_file_no"], input[name="webfile"], input[placeholder*="Web File"]');
            if (webfileInput) {
                webfileInput.value = config.webfile_id;
                showMessage(`Web File ID filled: ${config.webfile_id}`);
                LogManager.add(`Autofill: Web File ID filled - ${config.webfile_id}`, 'success');
            } else {
                showMessage('Web File ID field not found on page', true);
                LogManager.add('Autofill: Web File ID field not found', 'warning');
            }
            
            startCooldown(fillWebFileBtn);
        });
        panel.appendChild(fillWebFileBtn);
        
        // Fill Form Fields button
        const fillFormBtn = document.createElement('button');
        fillFormBtn.textContent = 'Fill All Form Fields';
        fillFormBtn.className = 'slim-btn';
        fillFormBtn.style.cssText = 'width: 100%; background: #28a745; color: #fff; margin-bottom: 6px;';
        fillFormBtn.addEventListener('click', () => {
            if (!config) {
                showMessage('No config found. Upload config first.', true);
                return;
            }
            
            // Comprehensive field mappings for all config properties
            let filled = 0;
            const fieldMappings = [
                // Personal info
                { selector: 'input[name="full_name"], input[placeholder*="Name"], input[id*="name"]', value: config.personal_info?.full_name },
                { selector: 'input[name="email"], input[type="email"], input[placeholder*="Email"]', value: config.personal_info?.email_name },
                { selector: 'input[name="phone"], input[type="tel"], input[placeholder*="Phone"], input[placeholder*="Mobile"]', value: config.personal_info?.phone },
                
                // IVAC specific fields
                { selector: 'input[name="web_file_no"], input[name="webfile"], input[placeholder*="Web File"]', value: config.webfile_id },
                { selector: 'input[name="webfile_id_repeat"], input[placeholder*="Confirm Web File"]', value: config.webfile_id_repeat || config.webfile_id },
                { selector: 'select[name="mission"], select[id*="mission"]', value: config.mission },
                { selector: 'select[name="ivac_center"], select[id*="ivac"], select[placeholder*="IVAC Center"]', value: config.ivac_center },
                { selector: 'select[name="visa_type"], select[id*="visa"], input[name="visa_type"]', value: config.visa_type },
                { selector: 'input[name="family_count"], select[name="family_count"], input[placeholder*="Family"]', value: config.family_count },
                { selector: 'input[name="purpose"], textarea[name="purpose"], input[placeholder*="Purpose"], textarea[placeholder*="Purpose"]', value: config.asweoi_erilfs }
            ];
            
            fieldMappings.forEach(({selector, value}) => {
                if (!value) return; // Skip if no value in config
                
                const field = document.querySelector(selector);
                if (field) {
                    field.value = value;
                    // Dispatch change event to trigger any listeners
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                    filled++;
                    LogManager.add(`  Filled: ${field.name || field.id || 'field'} = ${value}`, 'success');
                }
            });
            
            if (filled > 0) {
                showMessage(`${filled} fields filled successfully`);
                LogManager.add(`Autofill: ${filled} form fields filled`, 'success');
            } else {
                showMessage('No matching fields found on page', true);
                LogManager.add('Autofill: No matching fields found - ensure you are on the IVAC form page', 'warning');
            }
            
            startCooldown(fillFormBtn);
        });
        panel.appendChild(fillFormBtn);
        
        // Fill Family Data button
        const fillFamilyBtn = document.createElement('button');
        fillFamilyBtn.textContent = 'Fill Family Data';
        fillFamilyBtn.className = 'slim-btn';
        fillFamilyBtn.style.cssText = 'width: 100%; background: #6f42c1; color: #fff;';
        fillFamilyBtn.addEventListener('click', () => {
            if (!config) {
                showMessage('No config found. Upload config first.', true);
                return;
            }
            
            if (!config.family_data || config.family_data.length === 0) {
                showMessage('No family data in config', true);
                return;
            }
            
            // Try to fill family member inputs on the page
            let filled = 0;
            config.family_data.forEach((member, index) => {
                const i = index + 1; // 1-based index
                
                // Try multiple selector patterns for family member fields
                const nameSelectors = [
                    `input[name="family_name_${i}"]`,
                    `input[name="family[${index}][name]"]`,
                    `input[id*="family"][id*="name"][id*="${i}"]`,
                    `input[placeholder*="Family"][placeholder*="Name"]:nth-of-type(${i})`
                ];
                
                const webfileSelectors = [
                    `input[name="family_webfile_${i}"]`,
                    `input[name="family[${index}][webfile]"]`,
                    `input[id*="family"][id*="webfile"][id*="${i}"]`,
                    `input[placeholder*="Family"][placeholder*="Web"]:nth-of-type(${i})`
                ];
                
                // Try to find and fill name field
                for (const selector of nameSelectors) {
                    const field = document.querySelector(selector);
                    if (field) {
                        field.value = member.name;
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        filled++;
                        LogManager.add(`  Family ${i} Name: ${member.name}`, 'success');
                        break;
                    }
                }
                
                // Try to find and fill webfile field
                for (const selector of webfileSelectors) {
                    const field = document.querySelector(selector);
                    if (field) {
                        field.value = member.webfile;
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        filled++;
                        LogManager.add(`  Family ${i} Webfile: ${member.webfile}`, 'success');
                        break;
                    }
                }
            });
            
            // Also log family data for reference (useful if DOM filling fails)
            LogManager.add(`Family count: ${config.family_count}`, 'info');
            config.family_data.forEach((member, index) => {
                LogManager.add(`  [${index + 1}] ${member.name} - ${member.webfile}`, 'info');
            });
            
            if (filled > 0) {
                showMessage(`Family data: ${filled} fields filled`);
            } else {
                showMessage(`Family data logged (${config.family_data.length} members) - no matching inputs found`, true);
                LogManager.add('Family fields not found - check if you are on the family info page', 'warning');
            }
            
            startCooldown(fillFamilyBtn);
        });
        panel.appendChild(fillFamilyBtn);
        
        popupContainer.appendChild(panel);
        LogManager.add('Autofill panel loaded', config ? 'success' : 'warning');
    }

    // ==================== LOGIN PANEL ====================
    function createLoginPanel() {
        popupContainer.innerHTML = '';
        popupContainer.className = 'popup-panel active';
        
        const ivacPanel = document.createElement('div');
        ivacPanel.className = 'ivac-panel';
        
        function el(tag, props = {}, children = []) {
            const e = document.createElement(tag);
            Object.assign(e, props);
            (children || []).forEach(c => e.appendChild(c));
            return e;
        }
        function style(node, css = {}) {
            Object.assign(node.style, css);
            return node;
        }
        
        const headerTitle = el('div', { innerText: 'IVAC — Login' });
        style(headerTitle, {
            fontSize: '15px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '10px'
        });
        ivacPanel.appendChild(headerTitle);
        
        const tokenInput = el('input', { type: 'text', readOnly: true, placeholder: 'Access Token will appear here' });
        style(tokenInput, { color: '#006400' });
        ivacPanel.appendChild(tokenInput);
        
        // Check for existing token
        const savedToken = localStorage.getItem('access_token');
        if (savedToken) {
            tokenInput.value = savedToken;
            LogManager.add('Existing token loaded', 'success');
        }
        
        const form = style(el('div'), { display: 'grid', gap: '6px' });
        ivacPanel.appendChild(form);
        
        const sitekeyRow = style(el('div'), { display: 'flex', gap: '6px' });
        const sitekeyInput = el('input', { type: 'text', value: '0x4AAAAAABpNUpzYeppBoYpe' });
        style(sitekeyInput, { flex: '1' });
        const loadCaptchaBtn = el('button', { innerText: 'Load CAPTCHA' });
        loadCaptchaBtn.classList.add('slim-btn');
        style(loadCaptchaBtn, { background: '#17a2b8', color: '#fff' });
        sitekeyRow.appendChild(sitekeyInput);
        sitekeyRow.appendChild(loadCaptchaBtn);
        form.appendChild(sitekeyRow);
        
        const captchaBox = style(el('div', { innerText: 'CAPTCHA will appear here' }), {
            height: '80px',
            borderRadius: '6px',
            border: '1px dashed #cfcfcf',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '12px'
        });
        form.appendChild(captchaBox);
        
        function createRow(ph, type, btnText, btnColor) {
            const row = style(el('div'), { display: 'flex', gap: '6px' });
            const input = el('input', { type, placeholder: ph });
            style(input, { flex: '1' });
            const btn = el('button', { innerText: btnText });
            btn.classList.add('slim-btn');
            style(btn, { background: btnColor, color: '#fff', flex: '0 0 90px' });
            row.appendChild(input);
            row.appendChild(btn);
            form.appendChild(row);
            return { input, btn };
        }
        
        const mobileRow = createRow('Mobile number', 'text', 'Send', '#28a745');
        const passRow = createRow('Password', 'password', 'Login', '#6f42c1');
        const otpRow = createRow('OTP', 'text', 'Submit', '#ff9800');
        
        // Auto-populate from config
        const config = getStoredConfig();
        if (config && config.personal_info && config.personal_info.phone) {
            mobileRow.input.value = config.personal_info.phone;
            LogManager.add('Phone number auto-filled from config', 'success');
        }
        
        const status = style(el('div', { innerText: '' }), {
            fontSize: '11px',
            color: '#444',
            minHeight: '16px'
        });
        form.appendChild(status);
        
        let captchaToken = '';
        function renderCaptcha(sitekey) {
            captchaBox.innerHTML = '';
            const container = el('div');
            captchaBox.appendChild(container);
            if (!window.turnstile) {
                const s = document.createElement('script');
                s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
                s.async = true;
                s.defer = true;
                s.onload = () => {
                    window.turnstile.render(container, { 
                        sitekey, 
                        callback: t => { 
                            captchaToken = t; 
                            LogManager.add('CAPTCHA solved', 'success');
                        } 
                    });
                };
                document.head.appendChild(s);
            } else {
                window.turnstile.render(container, { 
                    sitekey, 
                    callback: t => { 
                        captchaToken = t; 
                        LogManager.add('CAPTCHA solved', 'success');
                    } 
                });
            }
        }
        
        loadCaptchaBtn.addEventListener('click', () => {
            const key = sitekeyInput.value.trim();
            if (!key) return;
            renderCaptcha(key);
            startCooldown(loadCaptchaBtn);
        });
        
        async function postJson(url, payload) {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return res.json();
        }
        
        mobileRow.btn.addEventListener('click', async () => {
            const mobile = mobileRow.input.value.trim();
            const payload = { answer: 1, captcha_token: captchaToken || '', mobile_no: mobile, problem: 'abc' };
            
            try {
                const res = await postJson('https://payment.ivacbd.com/api/v2/mobile-verify', payload);
                status.innerText = res.message || '[OK] OTP sent';
                LogManager.add('OTP sent to ' + mobile, 'success');
                startCooldown(mobileRow.btn);
            } catch (e) {
                status.innerText = '[ERR] Error: ' + e.message;
                LogManager.add('OTP send failed: ' + e.message, 'error');
            }
        });
        
        passRow.btn.addEventListener('click', async () => {
            const payload = {
                mobile_no: mobileRow.input.value.trim(),
                password: passRow.input.value.trim()
            };
            
            try {
                const res = await postJson('https://payment.ivacbd.com/api/v2/jktwdasf-345432-afawerk', payload);
                
                if (res.data && res.data.access_token) {
                    localStorage.setItem('access_token', res.data.access_token);
                    tokenInput.value = res.data.access_token;
                    status.innerText = '[OK] Login successful';
                    LogManager.add('Login successful: ' + res.data.name, 'success');
                } else {
                    status.innerText = '[ERR] Login failed!';
                    LogManager.add('Login failed: ' + (res.message || 'Unknown error'), 'error');
                }
                startCooldown(passRow.btn);
            } catch (e) {
                status.innerText = '[ERR] Error: ' + e.message;
                LogManager.add('Login error: ' + e.message, 'error');
            }
        });
        
        otpRow.btn.addEventListener('click', async () => {
            const otpValue = otpRow.input.value.trim();
            
            // 6-digit validation for LOGIN OTP
            if (!otpValue || otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
                status.innerText = 'Please enter valid 6-digit OTP';
                LogManager.add('Invalid OTP format (must be 6 digits)', 'error');
                return;
            }
            
            const payload = {
                mobile_no: mobileRow.input.value.trim(),
                password: passRow.input.value.trim(),
                otp: otpValue
            };
            
            try {
                const res = await postJson('https://payment.ivacbd.com/api/v2/login-otp', payload);
                
                if (res.data && res.data.access_token) {
                    localStorage.setItem('access_token', res.data.access_token);
                    tokenInput.value = res.data.access_token;
                    status.innerText = 'Access Token updated';
                    LogManager.add('OTP login successful', 'success');
                } else {
                    status.innerText = 'OTP submission failed';
                    LogManager.add('OTP verification failed', 'error');
                }
                startCooldown(otpRow.btn);
            } catch (e) {
                status.innerText = 'Error: ' + e.message;
                LogManager.add('OTP error: ' + e.message, 'error');
            }
        });
        
        popupContainer.appendChild(ivacPanel);
    }

    // ==================== SUBMIT PANEL ====================
    function createSubmitPanel() {
        popupContainer.innerHTML = '';
        popupContainer.className = 'popup-panel active';
        
        const submitPanel = document.createElement('div');
        submitPanel.className = 'submit-panel';
        
        function createBtn(text, bgColor, fullWidth = false) {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.style.backgroundColor = bgColor;
            if (fullWidth) btn.style.width = '100%';
            return btn;
        }
        
        const liveMsg = document.createElement('div');
        liveMsg.className = 'live-msg';
        liveMsg.textContent = 'Status messages will appear here';
        submitPanel.appendChild(liveMsg);
        
        function showMessage(msg) {
            liveMsg.textContent = msg;
            LogManager.add(msg, msg.includes('[ERR]') ? 'error' : 'success');
        }
        
        // Token section
        const tokenDiv = document.createElement('div');
        const tokenInput = document.createElement('input');
        tokenInput.type = 'text';
        tokenInput.readOnly = true;
        tokenInput.placeholder = 'Bearer Token';
        tokenInput.style.color = '#006400';
        tokenDiv.appendChild(tokenInput);
        submitPanel.appendChild(tokenDiv);
        
        // Set token from localStorage
        const savedToken = localStorage.getItem('access_token');
        if (savedToken) {
            tokenInput.value = savedToken;
            showMessage('[OK] Access Token auto-filled from localStorage!');
        }
        
        const tokenBtn = createBtn('Get Token', '#007bff', true);
        tokenDiv.appendChild(tokenBtn);
        
        tokenBtn.addEventListener('click', () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                tokenInput.value = token;
                showMessage('[OK] Access Token updated!');
            } else {
                showMessage('[ERR] No access_token found in localStorage!');
            }
        });
        
        function getBearerToken() { 
            return tokenInput.value.trim() || localStorage.getItem('access_token'); 
        }
        
        // Top button row
        const topBtnRow = document.createElement('div');
        topBtnRow.className = 'btn-row';
        submitPanel.appendChild(topBtnRow);
        
        const copyApiBtn = createBtn('Server Update', '#FF5722', true);
        const parseKeysBtn = createBtn('Parse & Fill', '#FF9800', true);
        const captchaShowBtn = createBtn('Show CAPTCHA', '#17a2b8', true);
        topBtnRow.appendChild(copyApiBtn);
        topBtnRow.appendChild(parseKeysBtn);
        topBtnRow.appendChild(captchaShowBtn);
        
        // Base URL and endpoint
        const baseInput = document.createElement('input');
        baseInput.type = 'text';
        baseInput.value = 'https://payment.ivacbd.com';
        baseInput.style.marginTop = '4px';
        submitPanel.appendChild(baseInput);
        
        const endpointInput = document.createElement('input');
        endpointInput.type = 'text';
        endpointInput.value = '/api/v2/payment/application-r5s7h3-submit-hyju6t';
        endpointInput.placeholder = '/api/v2/payment/...';
        submitPanel.appendChild(endpointInput);
        
        const allFieldsBtn = createBtn('All Fields', '#6c757d', true);
        submitPanel.appendChild(allFieldsBtn);
        
        // Key-Value Overlay
        const kvOverlay = document.createElement('div');
        kvOverlay.style.position = 'fixed';
        kvOverlay.style.top = '120px';
        kvOverlay.style.left = 'calc(50% - 200px)';
        kvOverlay.style.width = '400px';
        kvOverlay.style.height = '300px';
        kvOverlay.style.background = '#fff';
        kvOverlay.style.border = '1px solid #ccc';
        kvOverlay.style.borderRadius = '6px';
        kvOverlay.style.boxShadow = '0 0 12px rgba(0,0,0,0.3)';
        kvOverlay.style.padding = '8px';
        kvOverlay.style.zIndex = '999998';
        kvOverlay.style.overflowY = 'auto';
        kvOverlay.style.display = 'none';
        document.body.appendChild(kvOverlay);
        
        const kvHeader = document.createElement('div');
        kvHeader.textContent = 'Key / Value Fields (Drag me)';
        kvHeader.style.cursor = 'grab';
        kvHeader.style.fontWeight = '600';
        kvHeader.style.marginBottom = '4px';
        kvOverlay.appendChild(kvHeader);
        
        const kvContainer = document.createElement('div');
        kvContainer.className = 'kv-container';
        kvOverlay.appendChild(kvContainer);
        
        const rows = [];
        const defaultKeys = ['highcom','webfile_id','webfile_id_repeat','ivac_id','visa_type','family_count','asweoi_erilfs','y6e7uk_token_t6d8n3'];
        
        // Get config from localStorage
        const config = getStoredConfig();
        const defaultValues = [
            '3',
            config?.webfile_id || '',
            config?.webfile_id_repeat || config?.webfile_id || '',
            config?.ivac_center ? config.ivac_center.split('|')[1] : '',
            config?.visa_type || '',
            config?.family_count || '',
            config?.asweoi_erilfs || '',
            ''
        ];
        
        defaultKeys.forEach((k, index) => {
            const row = document.createElement('div');
            row.className = 'kv-row';
            
            const keyInput = document.createElement('input');
            keyInput.type = 'text';
            keyInput.value = k;
            keyInput.style.width = '40%';
            
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.placeholder = 'Value';
            valueInput.style.width = '55%';
            valueInput.value = defaultValues[index] || '';
            
            row.appendChild(keyInput);
            row.appendChild(valueInput);
            kvContainer.appendChild(row);
            rows.push({keyInput, valueInput});
        });
        
        // Make KV overlay draggable
        let isDraggingKV = false, offsetXKV = 0, offsetYKV = 0;
        kvHeader.addEventListener('mousedown', (e) => {
            isDraggingKV = true;
            offsetXKV = e.clientX - kvOverlay.getBoundingClientRect().left;
            offsetYKV = e.clientY - kvOverlay.getBoundingClientRect().top;
            kvHeader.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDraggingKV) return;
            kvOverlay.style.left = (e.clientX - offsetXKV) + 'px';
            kvOverlay.style.top = (e.clientY - offsetYKV) + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (isDraggingKV) {
                isDraggingKV = false;
                kvHeader.style.cursor = 'grab';
            }
        });
        
        allFieldsBtn.addEventListener('click', () => {
            kvOverlay.style.display = kvOverlay.style.display === 'none' ? 'block' : 'none';
        });
        
        // API Overlay
        const apiOverlay = document.createElement('div');
        apiOverlay.style.position = 'fixed';
        apiOverlay.style.top = '100px';
        apiOverlay.style.left = 'calc(100% - 450px)';
        apiOverlay.style.width = '400px';
        apiOverlay.style.height = '250px';
        apiOverlay.style.background = '#fff';
        apiOverlay.style.border = '1px solid #ccc';
        apiOverlay.style.borderRadius = '6px';
        apiOverlay.style.boxShadow = '0 0 12px rgba(0,0,0,0.3)';
        apiOverlay.style.padding = '8px';
        apiOverlay.style.zIndex = '999997';
        apiOverlay.style.display = 'none';
        apiOverlay.style.overflowY = 'auto';
        document.body.appendChild(apiOverlay);
        
        const overlayHeader = document.createElement('div');
        overlayHeader.textContent = 'API Overlay (Drag me)';
        overlayHeader.style.cursor = 'grab';
        overlayHeader.style.fontWeight = '600';
        overlayHeader.style.marginBottom = '4px';
        apiOverlay.appendChild(overlayHeader);
        
        const overlayTextarea = document.createElement('textarea');
        overlayTextarea.style.width = '100%';
        overlayTextarea.style.height = 'calc(100% - 24px)';
        overlayTextarea.style.resize = 'none';
        overlayTextarea.style.fontFamily = 'monospace';
        overlayTextarea.readOnly = true;
        apiOverlay.appendChild(overlayTextarea);
        
        // Make API overlay draggable
        let isDraggingOverlay = false, offsetXOverlay = 0, offsetYOverlay = 0;
        overlayHeader.addEventListener('mousedown', (e) => {
            isDraggingOverlay = true;
            offsetXOverlay = e.clientX - apiOverlay.getBoundingClientRect().left;
            offsetYOverlay = e.clientY - apiOverlay.getBoundingClientRect().top;
            overlayHeader.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDraggingOverlay) return;
            apiOverlay.style.left = (e.clientX - offsetXOverlay) + 'px';
            apiOverlay.style.top = (e.clientY - offsetYOverlay) + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (isDraggingOverlay) {
                isDraggingOverlay = false;
                overlayHeader.style.cursor = 'grab';
            }
        });
        
        let overlayVisible = false;
        copyApiBtn.addEventListener('click', async () => {
            const scripts = document.querySelectorAll('script[src], script:not([src])');
            let detectedText = '';
            for (const script of scripts) {
                const processText = (txt) => {
                    const regex = /const\s+[a-zA-Z0-9_$]+\s*=\s*localStorage\.getItem\(["']access_token["']\)[\s\S]*?await\s+[a-zA-Z0-9_$]+\([\s\S]*?\}\s*\)/g;
                    const matches = txt.match(regex);
                    if (matches) detectedText += matches.join('\n\n');
                };
                try {
                    if (script.src) {
                        const res = await fetch(script.src);
                        const txt = await res.text();
                        processText(txt);
                    } else {
                        processText(script.textContent || '');
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            const textToShow = detectedText || '[ERR] API block not found!';
            overlayTextarea.value = textToShow;
            overlayVisible = !overlayVisible;
            apiOverlay.style.display = overlayVisible ? 'block' : 'none';
            if (detectedText) {
                navigator.clipboard.writeText(detectedText).catch(() => {});
                showMessage('[OK] API detection finished! Copied to clipboard.');
            } else {
                showMessage('[ERR] API block not found!');
            }
            startCooldown(copyApiBtn);
        });
        
        parseKeysBtn.addEventListener('click', () => {
            const text = overlayTextarea.value;
            if (!text) {
                showMessage('[ERR] Copy API block first!');
                return;
            }
            
            const endpointMatch = text.match(/is_edit[^?]+\?"([^"]+)":"([^"]+)"/);
            if (endpointMatch && endpointMatch[2]) {
                endpointInput.value = endpointMatch[2];
            } else {
                endpointInput.value = '/api/v2/payment/...';
            }
            
            const bodyRegex = /body\s*:\s*\{([\s\S]*?)\}/g;
            let bodyMatch, keys = [];
            while ((bodyMatch = bodyRegex.exec(text))) {
                const keyRegex = /(\w+)\s*:/g;
                let km;
                while ((km = keyRegex.exec(bodyMatch[1]))) {
                    keys.push(km[1]);
                }
            }
            
            for (let i = 0; i < rows.length && i < keys.length; i++) {
                rows[i].keyInput.value = keys[i];
            }
            showMessage('[OK] Endpoint & keys auto-filled!');
        });
        
        // CAPTCHA
        const captchaDiv = document.createElement('div');
        captchaDiv.style.marginTop = '6px';
        captchaDiv.style.minHeight = '70px';
        captchaDiv.style.display = 'flex';
        captchaDiv.style.alignItems = 'center';
        captchaDiv.style.justifyContent = 'center';
        captchaDiv.style.border = '1px dashed #ccc';
        captchaDiv.style.borderRadius = '4px';
        captchaDiv.textContent = 'CAPTCHA will appear here...';
        submitPanel.appendChild(captchaDiv);
        
        const captchaInput = document.createElement('input');
        captchaInput.type = 'text';
        captchaInput.placeholder = 'Enter sitekey here';
        captchaInput.value = '0x4AAAAAABvQ3Mi6RktCuZ7P';
        captchaInput.style.marginTop = '4px';
        submitPanel.appendChild(captchaInput);
        
        function onCaptchaSuccess(token) {
            const f = rows.find(r => r.keyInput.value === 'y6e7uk_token_t6d8n3');
            if (f) {
                f.valueInput.value = token;
                showMessage('[OK] CAPTCHA solved! Token filled.');
                LogManager.add('CAPTCHA token filled', 'success');
            } else {
                showMessage('[ERR] CAPTCHA token field not found!');
            }
        }
        
        function renderCaptcha() {
            if (window.turnstile) {
                captchaDiv.textContent = '';
                window.turnstile.render(captchaDiv, {
                    sitekey: captchaInput.value,
                    callback: onCaptchaSuccess,
                    theme: 'light'
                });
                showMessage('[OK] CAPTCHA loaded! Solve it to get token.');
            } else {
                setTimeout(renderCaptcha, 500);
            }
        }
        
        captchaShowBtn.addEventListener('click', () => {
            renderCaptcha();
            startCooldown(captchaShowBtn);
        });
        
        if (!window.turnstile) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
        
        // Bottom buttons
        const bottomRow = document.createElement('div');
        bottomRow.className = 'btn-row';
        bottomRow.style.marginTop = '8px';
        submitPanel.appendChild(bottomRow);
        
        const submitAppBtn = createBtn('Submit', '#28a745', true);
        const personalBtn = createBtn('Personal', '#17a2b8', true);
        const overviewBtn = createBtn('Overview', '#ffc107', true);
        bottomRow.appendChild(submitAppBtn);
        bottomRow.appendChild(personalBtn);
        bottomRow.appendChild(overviewBtn);
        
        submitAppBtn.onclick = async () => {
            const payload = {};
            rows.forEach(r => {
                const k = r.keyInput.value.trim();
                if (k) payload[k] = r.valueInput.value;
            });
            
            const bearerToken = getBearerToken();
            if (!bearerToken) {
                showMessage('[ERR] Bearer Token is required!');
                return;
            }
            
            const fullURL = baseInput.value.replace(/\/$/, '') + endpointInput.value;
            try {
                showMessage('Submitting payload...');
                const res = await fetch(fullURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${bearerToken}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                showMessage(data.message || '[OK] Payload submitted successfully!');
                LogManager.add('Application submitted: ' + (data.message || 'Success'), 'success');
                startCooldown(submitAppBtn);
            } catch (e) {
                showMessage('[ERR] Error: ' + e.message);
                LogManager.add('Submit error: ' + e.message, 'error');
            }
        };
        
        personalBtn.onclick = async () => {
            const config = getStoredConfig();
            if (!config) {
                showMessage('[ERR] No config found. Upload config first!');
                return;
            }
            
            const personalInfo = {
                full_name: config.personal_info?.full_name || '',
                email_name: config.personal_info?.email_name || '',
                phone: config.personal_info?.phone || '',
                webfile_id: config.webfile_id || '',
                family: {}
            };
            
            const familyCount = parseInt(config.family_count || '0');
            const familyData = config.family_data || [];
            for (let i = 0; i < familyCount && i < familyData.length; i++) {
                const memberData = familyData[i];
                personalInfo.family[i + 1] = {
                    name: memberData.name,
                    webfile_no: memberData.webfile,
                    again_webfile_no: memberData.webfile
                };
            }
            
            const bearerToken = getBearerToken();
            if (!bearerToken) {
                showMessage('[ERR] Bearer Token is required!');
                return;
            }
            
            try {
                showMessage('Submitting personal info...');
                const res = await fetch('https://payment.ivacbd.com/api/v2/payment/personal-info-submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${bearerToken}`
                    },
                    body: JSON.stringify(personalInfo)
                });
                const data = await res.json();
                showMessage(data.message || '[OK] Personal Info submitted successfully!');
                LogManager.add('Personal info submitted', 'success');
                startCooldown(personalBtn);
            } catch (e) {
                showMessage('[ERR] Error: ' + e.message);
                LogManager.add('Personal info error: ' + e.message, 'error');
            }
        };
        
        overviewBtn.onclick = async () => {
            const bearerToken = getBearerToken();
            if (!bearerToken) {
                showMessage('[ERR] Bearer Token is required!');
                return;
            }
            
            try {
                showMessage('Submitting overview...');
                const res = await fetch('https://payment.ivacbd.com/api/v2/payment/overview-submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${bearerToken}`
                    },
                    body: JSON.stringify({})
                });
                const data = await res.json();
                showMessage(data.message || '[OK] Overview submitted successfully!');
                LogManager.add('Overview submitted', 'success');
                startCooldown(overviewBtn);
            } catch (e) {
                showMessage('[ERR] Error: ' + e.message);
                LogManager.add('Overview error: ' + e.message, 'error');
            }
        };
        
        popupContainer.appendChild(submitPanel);
    }

    // ==================== PAYMENT PANEL ====================
    function createPaymentPanel() {
        popupContainer.innerHTML = '';
        popupContainer.className = 'popup-panel active';
        
        let BEARER_TOKEN = localStorage.getItem('token') || localStorage.getItem('access_token') ||
            sessionStorage.getItem('token') || sessionStorage.getItem('access_token');
        
        const paymentPanel = document.createElement('div');
        paymentPanel.className = 'payment-panel-main';
        popupContainer.appendChild(paymentPanel);
        
        function createBtn(text, bgColor) {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.style.backgroundColor = bgColor || '#6f42c1';
            return btn;
        }
        
        function createInput(placeholder, type = "text", fullWidth = false) {
            const input = document.createElement('input');
            input.type = type;
            input.placeholder = placeholder;
            if (fullWidth) input.className = 'full-width-input';
            return input;
        }
        
        const messageBox = document.createElement('div');
        messageBox.className = 'message-box';
        paymentPanel.appendChild(messageBox);
        
        function showMessage(msg, isError = false) {
            messageBox.textContent = (isError ? '[ERR] ' : '[OK] ') + msg;
            messageBox.style.color = isError ? 'red' : 'green';
            LogManager.add(msg, isError ? 'error' : 'success');
        }
        
        // Get config from localStorage
        const config = getStoredConfig();
        const mobileNo = config?.personal_info?.phone || '';
        const webfileId = config?.webfile_id || '';
        
        if (mobileNo) {
            showMessage(`Mobile Number: ${mobileNo}`);
        }
        
        if (webfileId) {
            const webfileSpan = document.createElement('span');
            webfileSpan.textContent = `Webfile ID: ${webfileId}`;
            webfileSpan.style.display = 'block';
            webfileSpan.style.marginTop = '4px';
            paymentPanel.insertBefore(webfileSpan, messageBox.nextSibling);
        }
        
        // Token row
        const tokenRow = document.createElement('div');
        tokenRow.className = 'input-row';
        const tokenInput = createInput('Bearer/Access Token');
        tokenInput.value = BEARER_TOKEN || '';
        const tokenBtn = createBtn('Update Token', '#16a34a');
        const clearTokenBtn = createBtn('Clear Token', '#dc2626');
        tokenBtn.style.width = '33%';
        clearTokenBtn.style.width = '33%';
        tokenRow.appendChild(tokenInput);
        tokenRow.appendChild(tokenBtn);
        tokenRow.appendChild(clearTokenBtn);
        paymentPanel.appendChild(tokenRow);
        
        tokenBtn.addEventListener('click', () => {
            const newToken = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
            if (newToken) {
                BEARER_TOKEN = newToken;
                tokenInput.value = newToken;
                showMessage('Token updated from storage!');
            } else if (tokenInput.value.trim()) {
                BEARER_TOKEN = tokenInput.value.trim();
                localStorage.setItem('access_token', BEARER_TOKEN);
                showMessage('Token manually set and saved!');
            } else {
                showMessage('Token not found!', true);
            }
        });
        
        clearTokenBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('access_token');
            tokenInput.value = '';
            BEARER_TOKEN = '';
            showMessage('Token cleared!');
        });
        
        // Top section
        const topSection = document.createElement('div');
        topSection.style.display = 'flex';
        topSection.style.flexDirection = 'column';
        topSection.style.gap = '4px';
        paymentPanel.appendChild(topSection);
        
        const endpointRow = document.createElement('div');
        endpointRow.className = 'input-row';
        const baseURLInput = createInput('Base URL');
        baseURLInput.value = 'https://payment.ivacbd.com';
        const endpointInput = createInput('Endpoint Path');
        endpointInput.value = '/api/v2/payment/h7j3wt-now-y0k3d6';
        endpointRow.appendChild(baseURLInput);
        endpointRow.appendChild(endpointInput);
        topSection.appendChild(endpointRow);
        
        const otpRow = document.createElement('div');
        otpRow.className = 'input-row';
        const otpInput = createInput('Enter OTP', 'text', true);
        otpInput.maxLength = 7; // 7 digit OTP
        const otpSendBtn = createBtn('Send OTP', '#2563eb');
        const verifyBtn = createBtn('[OK] Verify OTP', '#16a34a');
        otpRow.appendChild(otpInput);
        otpRow.appendChild(otpSendBtn);
        otpRow.appendChild(verifyBtn);
        topSection.appendChild(otpRow);
        
        const appointmentRow = document.createElement('div');
        appointmentRow.className = 'input-row';
        const dateKeyInput = createInput('appointment_date (key)');
        dateKeyInput.value = 'appointment_date';
        const dateValInput = createInput('Date value', 'date');
        appointmentRow.appendChild(dateKeyInput);
        appointmentRow.appendChild(dateValInput);
        topSection.appendChild(appointmentRow);
        
        const timeRow = document.createElement('div');
        timeRow.className = 'input-row';
        const timeKeyInput = createInput('appointment_time (key)');
        timeKeyInput.value = 'appointment_time';
        const timeValInput = createInput('Time value');
        timeRow.appendChild(timeKeyInput);
        timeRow.appendChild(timeValInput);
        topSection.appendChild(timeRow);
        
        const captchaRow = document.createElement('div');
        captchaRow.className = 'input-row';
        const captchaKeyInput = createInput('captcha_token (key)');
        captchaKeyInput.value = 'k5t0g8_token_y4v9f6';
        const captchaValInput = createInput('CAPTCHA token');
        captchaRow.appendChild(captchaKeyInput);
        captchaRow.appendChild(captchaValInput);
        topSection.appendChild(captchaRow);
        
        const captchaRow2 = document.createElement('div');
        captchaRow2.style.display = 'flex';
        captchaRow2.style.flexDirection = 'column';
        captchaRow2.style.gap = '2px';
        const sitekeyInput = createInput('CAPTCHA sitekey', 'text', true);
        sitekeyInput.value = '0x4AAAAAABvQ3Mi6RktCuZ7P';
        const loadCaptchaBtn = createBtn('Load CAPTCHA', '#8b5cf6');
        const captchaContainer = document.createElement('div');
        captchaContainer.style.width = '100%';
        captchaContainer.style.height = '100px';
        captchaRow2.appendChild(sitekeyInput);
        captchaRow2.appendChild(loadCaptchaBtn);
        captchaRow2.appendChild(captchaContainer);
        topSection.appendChild(captchaRow2);
        
        const slotRow = document.createElement('div');
        slotRow.className = 'input-row';
        slotRow.style.transform = 'translateY(-10px)';
        const slotBtn = createBtn('Get Slot Time', '#f59e0b');
        const fallbackBtn = createBtn('Default Slot', '#f97316');
        slotRow.appendChild(slotBtn);
        slotRow.appendChild(fallbackBtn);
        topSection.appendChild(slotRow);
        
        const payRow = document.createElement('div');
        payRow.className = 'input-row';
        payRow.style.transform = 'translateY(-10px)';
        const payNowBtn = createBtn('Pay Now', '#dc2626');
        const paymentBtn = createBtn('Open Payment', '#0891b2');
        paymentBtn.disabled = true;
        paymentBtn.style.opacity = "0.6";
        payRow.appendChild(payNowBtn);
        payRow.appendChild(paymentBtn);
        topSection.appendChild(payRow);
        
        let paymentLink = "";
        
        // CAPTCHA script
        const loadCaptchaScript = () => {
            if (!window.turnstile) {
                const script = document.createElement('script');
                script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
                setTimeout(loadCaptchaScript, 500);
            }
        };
        loadCaptchaScript();
        
        const renderCaptcha = () => {
            if (!window.turnstile) return;
            captchaContainer.innerHTML = '';
            window.turnstile.render(captchaContainer, {
                sitekey: sitekeyInput.value || '0x4AAAAAABvQ3Mi6RktCuZ7P',
                callback: token => {
                    captchaValInput.value = token;
                    LogManager.add('Payment CAPTCHA solved', 'success');
                },
                theme: 'light'
            });
        };
        loadCaptchaBtn.addEventListener('click', () => {
            renderCaptcha();
            startCooldown(loadCaptchaBtn);
        });
        
        const getCaptchaToken = () => new Promise((resolve, reject) => {
            if (captchaValInput.value) return resolve(captchaValInput.value);
            renderCaptcha();
            showMessage('Solve CAPTCHA first', true);
            reject('CAPTCHA pending');
        });
        
        // OTP send
        otpSendBtn.addEventListener('click', async () => {
            try {
                const url = baseURLInput.value.trim() + '/api/v2/payment/pay-otp-sent';
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${BEARER_TOKEN}`},
                    body: JSON.stringify({resend: 0})
                });
                const data = await res.json();
                showMessage(data.status === 'success' ? 'OTP sent!' : 'OTP sending failed: ' + data.message, data.status !== 'success');
                startCooldown(otpSendBtn);
            } catch (e) {
                showMessage('Error sending OTP: ' + e.message, true);
            }
        });
        
        // OTP verify
        verifyBtn.addEventListener('click', async () => {
            const otpValue = otpInput.value.trim();
            if (!otpValue || otpValue.length !== 7 || !/^\d{7}$/.test(otpValue)) {
                showMessage('সঠিক 7 অংকের OTP দিন।', true);
                return;
            }
            try {
                const url = baseURLInput.value.trim() + '/api/v2/payment/pay-otp-verify';
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${BEARER_TOKEN}`},
                    body: JSON.stringify({otp: otpValue})
                });
                const data = await res.json();
                if (data.status === 'success' && data.data.slot_dates && data.data.slot_dates.length > 0) {
                    dateValInput.value = data.data.slot_dates[0];
                    timeValInput.value = "";
                    showMessage('OTP Verified & Date filled!');
                } else {
                    showMessage('OTP verification failed or no date found: ' + data.message, true);
                }
                startCooldown(verifyBtn);
            } catch (e) {
                showMessage('Error verifying OTP: ' + e.message, true);
            }
        });
        
        // Slot time
        slotBtn.addEventListener('click', async () => {
            const appointment_date = dateValInput.value.trim();
            if (!appointment_date) {
                showMessage('প্রথমে একটি তারিখ সিলেক্ট করুন।', true);
                return;
            }
            try {
                const url = baseURLInput.value.trim() + '/api/v2/payment/pay-slot-time';
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${BEARER_TOKEN}`},
                    body: JSON.stringify({appointment_date})
                });
                const data = await res.json();
                if (data.data?.slot_times?.length) {
                    timeValInput.value = data.data.slot_times[0].time_display;
                    showMessage('Slot Time available & auto-filled.');
                } else {
                    timeValInput.value = "";
                    showMessage('Slot Time পাওয়া যায়নি।', true);
                }
                startCooldown(slotBtn);
            } catch (e) {
                showMessage('Error fetching slot times: ' + e.message, true);
            }
        });
        
        fallbackBtn.addEventListener('click', () => {
            timeValInput.value = '09:00 - 09:59';
            showMessage('Default Slot Time filled.');
        });
        
        // Pay now
        payNowBtn.addEventListener('click', async () => {
            const originalBtnText = payNowBtn.textContent;
            payNowBtn.textContent = 'Loading...';
            payNowBtn.disabled = true;
            
            try {
                const token = await getCaptchaToken();
                const payload = {};
                [[dateKeyInput, dateValInput], [timeKeyInput, timeValInput], [captchaKeyInput, captchaValInput]]
                    .forEach(([k, v]) => {
                        const key = k.value.trim();
                        const val = (v.value || '').trim();
                        if (key && val) payload[key] = val;
                    });
                payload.selected_payment = {
                    name: "VISA",
                    slug: "visacard",
                    link: "https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png"
                };
                
                const dateKey = dateKeyInput.value.trim();
                const timeKey = timeKeyInput.value.trim();
                
                if (!payload[dateKey] || !payload[timeKey]) {
                    showMessage('Appointment Date & Time প্রয়োজন', true);
                    return;
                }
                
                const url = baseURLInput.value.trim() + endpointInput.value.trim();
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${BEARER_TOKEN}`},
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.status === 'success' && data.data.url) {
                    paymentLink = data.data.url;
                    paymentBtn.disabled = false;
                    paymentBtn.style.opacity = '1';
                    paymentBtn.style.backgroundColor = '#22c55e';
                    showMessage('Payment link ready!');
                } else {
                    showMessage('Payment link missing', true);
                }
                startCooldown(payNowBtn);
            } catch (e) {
                showMessage('Error: ' + e.message, true);
            } finally {
                payNowBtn.textContent = originalBtnText;
                payNowBtn.disabled = false;
            }
        });
        
        paymentBtn.addEventListener('click', () => {
            if (paymentLink) {
                window.open(paymentLink, '_blank');
                showMessage('Payment page opened');
            } else {
                showMessage('Payment link missing', true);
            }
        });
    }

    // ==================== CONFIG PANEL ====================
    function createConfigPanel() {
        popupContainer.innerHTML = '';
        popupContainer.className = 'popup-panel active';
        
        const panel = document.createElement('div');
        panel.className = 'ivac-panel';
        panel.style.cssText = 'background: #fff; padding: 12px; border-radius: 8px;';
        
        const title = document.createElement('div');
        title.textContent = 'Configuration Management';
        title.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;';
        
        const description = document.createElement('p');
        description.textContent = 'Upload or edit your IVAC_APP_DATA configuration. This data will be saved locally and auto-populate all forms.';
        description.style.cssText = 'font-size: 11px; color: #6b7280; margin: 8px 0 12px 0;';
        
        const createLabel = (text) => {
            const label = document.createElement('div');
            label.textContent = text;
            label.style.cssText = 'font-size: 11px; font-weight: 600; margin-bottom: 4px; color: #374151;';
            return label;
        };
        
        const textareaLabel = createLabel('Configuration JSON:');
        
        const configTextarea = document.createElement('textarea');
        configTextarea.style.cssText = 'width: 100%; height: 300px; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; font-family: "Courier New", monospace; font-size: 11px; resize: vertical;';
        configTextarea.placeholder = `{
  "webfile_id": "BGDRV8490D25",
  "mission": "3",
  "ivac_center": "IVACRAJ|2",
  "visa_type": "6",
  "family_count": "4",
  "asweoi_erilfs": "Medical medical medical",
  "family_data": [
    {"name":"Full Name", "webfile":"BGDRV1234567"}
  ],
  "personal_info": {
    "full_name": "Your Name",
    "email_name": "email@example.com",
    "phone": "01234567890"
  }
}`;
        
        // Load existing config from localStorage
        const savedConfig = localStorage.getItem('IVAC_APP_DATA');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                configTextarea.value = JSON.stringify(parsed, null, 2);
            } catch (e) {
                LogManager.add('Error loading saved config: ' + e.message, 'error');
            }
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = 'margin-top: 8px; padding: 8px; border-radius: 4px; font-size: 11px; display: none;';
        
        const showMessage = (text, isError = false) => {
            messageDiv.textContent = text;
            messageDiv.style.display = 'block';
            messageDiv.style.background = isError ? '#fee2e2' : '#d1fae5';
            messageDiv.style.color = isError ? '#991b1b' : '#065f46';
            setTimeout(() => messageDiv.style.display = 'none', 3000);
        };
        
        const buttonRow = document.createElement('div');
        buttonRow.style.cssText = 'display: flex; gap: 8px; margin-top: 10px;';
        
        const createBtn = (text, bg) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.style.cssText = `flex: 1; padding: 8px; background: ${bg}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;`;
            btn.addEventListener('mouseover', () => btn.style.opacity = '0.9');
            btn.addEventListener('mouseout', () => btn.style.opacity = '1');
            return btn;
        };
        
        const saveBtn = createBtn('Save Config', '#10b981');
        const loadBtn = createBtn('Load Config', '#3b82f6');
        const clearBtn = createBtn('Clear Config', '#ef4444');
        
        // Save config to localStorage
        saveBtn.addEventListener('click', () => {
            const configText = configTextarea.value.trim();
            if (!configText) {
                showMessage('Please enter configuration data', true);
                return;
            }
            
            try {
                const parsed = JSON.parse(configText);
                
                // Validate required fields
                const requiredFields = ['webfile_id', 'mission', 'ivac_center', 'visa_type', 'family_count'];
                const missing = requiredFields.filter(field => !parsed[field]);
                
                if (missing.length > 0) {
                    showMessage('Missing required fields: ' + missing.join(', '), true);
                    return;
                }
                
                localStorage.setItem('IVAC_APP_DATA', JSON.stringify(parsed));
                showMessage('Configuration saved successfully!');
                LogManager.add('Config saved to localStorage', 'success');
            } catch (e) {
                showMessage('Invalid JSON format: ' + e.message, true);
                LogManager.add('Config save failed: ' + e.message, 'error');
            }
        });
        
        // Load config from localStorage
        loadBtn.addEventListener('click', () => {
            const saved = localStorage.getItem('IVAC_APP_DATA');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    configTextarea.value = JSON.stringify(parsed, null, 2);
                    showMessage('Configuration loaded!');
                    LogManager.add('Config loaded from localStorage', 'success');
                } catch (e) {
                    showMessage('Error loading config: ' + e.message, true);
                }
            } else {
                showMessage('No saved configuration found', true);
            }
        });
        
        // Clear config
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the saved configuration?')) {
                localStorage.removeItem('IVAC_APP_DATA');
                configTextarea.value = '';
                showMessage('Configuration cleared!');
                LogManager.add('Config cleared from localStorage', 'info');
            }
        });
        
        buttonRow.appendChild(saveBtn);
        buttonRow.appendChild(loadBtn);
        buttonRow.appendChild(clearBtn);
        
        const infoBox = document.createElement('div');
        infoBox.style.cssText = 'margin-top: 12px; padding: 8px; background: #f3f4f6; border-radius: 4px; font-size: 10px; color: #4b5563;';
        infoBox.innerHTML = `
            <strong>How to use:</strong><br>
            1. Paste your IVAC_APP_DATA JSON in the textarea<br>
            2. Click "Save Config" to store it locally<br>
            3. Go to Autofill/Login/Submit panels - fields will auto-populate<br>
            4. Change config anytime for different accounts
        `;
        
        panel.appendChild(title);
        panel.appendChild(description);
        panel.appendChild(textareaLabel);
        panel.appendChild(configTextarea);
        panel.appendChild(messageDiv);
        panel.appendChild(buttonRow);
        panel.appendChild(infoBox);
        
        popupContainer.appendChild(panel);
        LogManager.add('Config panel opened', 'info');
    }

    // ==================== BUTTON HANDLERS ====================
    header.querySelectorAll('.header-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.dataset.panel;
            
            if (panel === 'autofill') createAutofillPanel();
            else if (panel === 'login') createLoginPanel();
            else if (panel === 'submit') createSubmitPanel();
            else if (panel === 'payment') createPaymentPanel();
            else if (panel === 'config') createConfigPanel();
            
            if (panel) LogManager.add(`Panel switched: ${panel}`, 'info');
        });
    });

    // Minimize button handler
    let isMinimized = false;
    const minimizeBtn = document.getElementById('minimize-btn');
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMinimized = !isMinimized;
        
        if (isMinimized) {
            bodyWrapper.style.display = 'none';
            minimizeBtn.textContent = '+';
            container.style.height = 'auto';
        } else {
            bodyWrapper.style.display = 'flex';
            minimizeBtn.textContent = '−';
        }
        
        LogManager.add(isMinimized ? 'Panel minimized' : 'Panel restored', 'info');
    });

    // ==================== DRAGGING ====================
    let isDragging = false;
    let offsetX, offsetY;
    
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - container.offsetLeft;
        offsetY = e.clientY - container.offsetTop;
        header.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        container.style.left = (e.clientX - offsetX) + 'px';
        container.style.top = (e.clientY - offsetY) + 'px';
        container.style.right = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'move';
        }
    });

    // ==================== INIT ====================
    console.log('[OK] IVAC System loaded successfully!');
    LogManager.add('System ready - Check bottom right corner', 'success');

    })(); // End of initializeSystem async IIFE

})(); // End of main IIFE
