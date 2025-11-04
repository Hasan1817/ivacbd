(async function() {
    'use strict';

    // ==================== VERSION & LOADING CHECK ====================
    const SCRIPT_VERSION = '2.3.3-SESSION-CAPTURE-PASSWORDFIX';
    
    // Silent console wrapper (STEALTH MODE - no browser console output)
    const SilentConsole = {
        log: () => {},
        warn: () => {},
        error: () => {},
        info: () => {}
    };
    
    // STEALTH: Closure-scoped loading check (completely undetectable - no window properties, no symbols)
    // Using IIFE closure to prevent duplicate loading without exposing any global state
    let scriptAlreadyLoaded = false;
    
    if (scriptAlreadyLoaded) {
        return; // Silent exit - no console output, no detectable state
    }
    
    scriptAlreadyLoaded = true;
    
    // NO window properties, NO symbols, NO detectable global state
    // Script state is contained entirely within this closure scope

    // ==================== EMBEDDED DOM AUTOMATION MODULE ====================
    // DOM-BASED ANTI-DETECTION SYSTEM (EMBEDDED - NO EXTERNAL LOAD NEEDED)
    // This module provides human-like DOM manipulation to bypass Cloudflare
    // Instead of direct fetch() calls, we simulate real user interactions
    
    const DOMAutomation = {
        // Human-like typing simulation (FIXED for React/Vue controlled inputs)
        async typeIntoField(element, text, options = {}) {
            const { 
                minDelay = 50, 
                maxDelay = 150,
                triggerEvents = true 
            } = options;
            
            // CRITICAL FIX: Disable browser autocomplete temporarily
            const originalAutocomplete = element.getAttribute('autocomplete');
            element.setAttribute('autocomplete', 'off');
            
            // Focus the field first (human behavior)
            element.focus();
            await this.randomDelay(100, 200);
            
            // CRITICAL FIX: Use native value setter for React/Vue compatibility
            // This bypasses React's controlled input system
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 
                'value'
            ).set;
            
            // Clear existing value using native setter
            nativeInputValueSetter.call(element, '');
            
            // Trigger input event after clearing (important for React)
            if (triggerEvents) {
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            await this.randomDelay(50, 100);
            
            // Type character by character using native setter
            for (let i = 0; i < text.length; i++) {
                const currentValue = text.substring(0, i + 1);
                
                // Set value using native setter (bypasses React)
                nativeInputValueSetter.call(element, currentValue);
                
                // Trigger input events after each character
                if (triggerEvents) {
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new KeyboardEvent('keydown', { 
                        key: text[i], 
                        bubbles: true,
                        cancelable: true
                    }));
                    element.dispatchEvent(new KeyboardEvent('keypress', { 
                        key: text[i], 
                        bubbles: true,
                        cancelable: true
                    }));
                }
                
                // Random delay between keystrokes (human-like)
                await this.randomDelay(minDelay, maxDelay);
            }
            
            // Trigger final events (CRITICAL for form validation)
            if (triggerEvents) {
                element.dispatchEvent(new Event('change', { bubbles: true }));
                element.dispatchEvent(new Event('blur', { bubbles: true }));
                
                // Additional React-specific event
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            // Small delay before blur
            await this.randomDelay(100, 200);
            
            // Blur and wait
            element.blur();
            
            // Restore autocomplete
            if (originalAutocomplete !== null) {
                element.setAttribute('autocomplete', originalAutocomplete);
            } else {
                element.removeAttribute('autocomplete');
            }
            
            await this.randomDelay(200, 400);
        },
        
        // Random delay (human-like timing)
        randomDelay(min, max) {
            const delay = Math.floor(Math.random() * (max - min + 1)) + min;
            return new Promise(resolve => setTimeout(resolve, delay));
        },
        
        // Simulate button click with human-like behavior
        async clickButton(element) {
            // Move mouse to button area (simulate hover)
            element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            await this.randomDelay(100, 300);
            
            // Mouse down
            element.dispatchEvent(new MouseEvent('mousedown', { 
                bubbles: true,
                cancelable: true,
                view: window
            }));
            await this.randomDelay(50, 100);
            
            // Mouse up (click happens)
            element.dispatchEvent(new MouseEvent('mouseup', { 
                bubbles: true,
                cancelable: true,
                view: window
            }));
            
            // Actual click event
            element.click();
            await this.randomDelay(200, 500);
        },
        
        // Find form element by various selectors (with error handling)
        findElement(selectors) {
            for (let selector of selectors) {
                try {
                    // Try as CSS selector first
                    const element = document.querySelector(selector);
                    if (element) return element;
                } catch (e) {
                    // Invalid CSS selector, skip silently
                    continue;
                }
            }
            return null;
        },
        
        // Find element by text content (since :contains() is not valid CSS)
        findElementByText(text, tagName = '*') {
            const elements = document.querySelectorAll(tagName);
            for (let element of elements) {
                if (element.textContent && element.textContent.trim().toLowerCase().includes(text.toLowerCase())) {
                    return element;
                }
            }
            return null;
        },
        
        // Wait for element to appear
        async waitForElement(selector, timeout = 10000) {
            const startTime = Date.now();
            
            while (Date.now() - startTime < timeout) {
                const element = document.querySelector(selector);
                if (element) return element;
                await this.randomDelay(100, 200);
            }
            
            throw new Error(`Element not found: ${selector}`);
        },
        
        // Submit form natively (lets site's JS handle Cloudflare)
        async submitFormNatively(formElement) {
            // Trigger submit event
            formElement.dispatchEvent(new Event('submit', { 
                bubbles: true, 
                cancelable: true 
            }));
            
            // Some sites don't listen to submit event, try form.submit()
            // But first check if there's a submit button
            const submitBtn = formElement.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn) {
                await this.clickButton(submitBtn);
            } else {
                formElement.submit();
            }
        }
    };
    
    // ==================== IVAC FORM AUTOMATION ====================
    // These functions find and interact with actual IVAC forms
    
    const IVACFormAutomation = {
        // Login with phone + password (DOM-based) - DEPRECATED (OTP required now)
        async loginWithPassword(mobileNo, password, onProgress) {
            DOMTelemetry.log('attempt', 'Starting DOM-based login');
            
            try {
                onProgress?.('Finding IVAC login form...');
                
                // Find mobile number field
                const mobileField = DOMAutomation.findElement([
                    'input[name="mobile_no"]',
                    'input[name="mobile"]',
                    'input[name="phone"]',
                    'input[type="tel"]',
                    'input[placeholder*="mobile" i]',
                    'input[placeholder*="phone" i]'
                ]);
                
                if (!mobileField) {
                    DOMTelemetry.failure('Mobile field not found', new Error('No matching selectors'));
                    throw new Error('Mobile number field not found on page');
                }
                
                DOMTelemetry.success('Mobile field found');
                onProgress?.(`[DEBUG] Mobile field: ${mobileField.name || mobileField.type}`);
                
                // Find password field
                const passwordField = DOMAutomation.findElement([
                    'input[name="password"]',
                    'input[type="password"]',
                    'input[placeholder*="password" i]'
                ]);
                
                if (!passwordField) {
                    throw new Error('Password field not found on page');
                }
                
                onProgress?.(`[DEBUG] Password field found`);
                
                // Type mobile number
                onProgress?.('Typing mobile number...');
                await DOMAutomation.typeIntoField(mobileField, mobileNo);
                
                // CRITICAL: Verify mobile number was set correctly
                await DOMAutomation.randomDelay(200, 300);
                if (mobileField.value !== mobileNo) {
                    onProgress?.(`[WARNING] Mobile value mismatch! Expected: ${mobileNo}, Got: ${mobileField.value}`);
                    // Try one more time with direct setter
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    setter.call(mobileField, mobileNo);
                    mobileField.dispatchEvent(new Event('input', { bubbles: true }));
                    mobileField.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                onProgress?.(`[DEBUG] Mobile verified: ${mobileField.value}`);
                
                // Type password
                onProgress?.('Typing password...');
                await DOMAutomation.typeIntoField(passwordField, password);
                
                // CRITICAL: Verify password was set correctly
                await DOMAutomation.randomDelay(200, 300);
                const passwordLength = passwordField.value.length;
                if (passwordLength !== password.length) {
                    onProgress?.(`[WARNING] Password length mismatch! Expected: ${password.length}, Got: ${passwordLength}`);
                    // Try one more time with direct setter
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    setter.call(passwordField, password);
                    passwordField.dispatchEvent(new Event('input', { bubbles: true }));
                    passwordField.dispatchEvent(new Event('change', { bubbles: true }));
                    await DOMAutomation.randomDelay(100, 200);
                }
                
                onProgress?.(`[DEBUG] Password verified: ${passwordField.value.length} characters`);
                
                // Find login button
                let loginBtn = DOMAutomation.findElement([
                    'button[type="submit"]',
                    'input[type="submit"]',
                    '.login-button',
                    '#login-button'
                ]);
                
                // If not found, try finding by text content
                if (!loginBtn) {
                    loginBtn = DOMAutomation.findElementByText('login', 'button') || 
                               DOMAutomation.findElementByText('sign in', 'button');
                }
                
                if (!loginBtn) {
                    throw new Error('Login button not found on page');
                }
                
                // Final verification before submit
                onProgress?.(`[DEBUG] Final check - Mobile: ${mobileField.value}, Password: ${passwordField.value.length} chars`);
                
                // Extra delay to ensure form is ready
                await DOMAutomation.randomDelay(300, 500);
                
                onProgress?.('Clicking login button...');
                await DOMAutomation.clickButton(loginBtn);
                
                onProgress?.('Login submitted - waiting for response...');
                
                // Wait for token to appear in localStorage (site's JS will set it)
                await this.waitForToken(onProgress);
                
                DOMTelemetry.success('DOM-based login completed successfully');
                return { success: true, message: 'Login successful' };
                
            } catch (error) {
                DOMTelemetry.failure('DOM-based login failed', error);
                return { success: false, error: error.message };
            }
        },
        
        // Wait for access token to appear (after site processes login)
        async waitForToken(onProgress, timeout = 15000) {
            const startTime = Date.now();
            
            while (Date.now() - startTime < timeout) {
                const token = localStorage.getItem('access_token');
                if (token) {
                    onProgress?.('Access token received!');
                    return token;
                }
                await DOMAutomation.randomDelay(500, 1000);
            }
            
            throw new Error('Login timeout - no access token received');
        },
        
        // Login with OTP (DOM-based) - PRIMARY METHOD - ENHANCED
        async loginWithOTP(mobileNo, password, otp, onProgress) {
            DOMTelemetry.log('attempt', 'Starting DOM-based OTP login');
            
            try {
                onProgress?.('Finding IVAC login form...');
                
                // Find mobile field with comprehensive selectors
                const mobileField = DOMAutomation.findElement([
                    'input[name="mobile_no"]',
                    'input[name="mobile"]',
                    'input[name="phone"]',
                    'input[type="tel"]',
                    'input[placeholder*="mobile" i]',
                    'input[placeholder*="phone" i]'
                ]);
                
                if (!mobileField) {
                    DOMTelemetry.failure('Mobile field not found', new Error('No matching selectors'));
                    return { success: false, error: 'Mobile field not found on page. Navigate to IVAC login page first.' };
                }
                
                DOMTelemetry.success('Mobile field found');
                onProgress?.('Mobile field found');
                
                // Find password field
                const passwordField = DOMAutomation.findElement([
                    'input[name="password"]',
                    'input[type="password"]',
                    'input[placeholder*="password" i]'
                ]);
                
                if (!passwordField) {
                    DOMTelemetry.failure('Password field not found', new Error('No matching selectors'));
                    return { success: false, error: 'Password field not found on page' };
                }
                
                DOMTelemetry.success('Password field found');
                onProgress?.('Password field found');
                
                // Find OTP field with comprehensive selectors
                const otpField = DOMAutomation.findElement([
                    'input[name="otp"]',
                    'input[name="OTP"]',
                    'input[name="code"]',
                    'input[placeholder*="OTP" i]',
                    'input[placeholder*="code" i]',
                    'input[type="text"][maxlength="6"]',
                    'input[type="text"][maxlength="7"]',
                    'input[type="number"][maxlength="6"]',
                    'input[type="number"][maxlength="7"]'
                ]);
                
                if (!otpField) {
                    DOMTelemetry.failure('OTP field not found', new Error('No matching selectors'));
                    return { success: false, error: 'OTP field not found on page' };
                }
                
                DOMTelemetry.success('OTP field found');
                onProgress?.('All fields found - filling form...');
                
                // Fill fields with anti-detection delays
                onProgress?.('Filling mobile number...');
                await DOMAutomation.typeIntoField(mobileField, mobileNo);
                await DOMAutomation.randomDelay(100, 300);
                
                onProgress?.('Filling password...');
                await DOMAutomation.typeIntoField(passwordField, password);
                await DOMAutomation.randomDelay(100, 300);
                
                onProgress?.('Filling OTP...');
                await DOMAutomation.typeIntoField(otpField, otp);
                await DOMAutomation.randomDelay(200, 400);
                
                // Find submit button with comprehensive selectors
                let submitBtn = DOMAutomation.findElement([
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button.btn-primary',
                    'button.submit-btn',
                    'button[name="submit"]',
                    '.otp-submit',
                    '#otp-submit',
                    'button[onclick*="submit"]'
                ]);
                
                // If not found, try finding by text content
                if (!submitBtn) {
                    submitBtn = DOMAutomation.findElementByText('submit', 'button') || 
                                DOMAutomation.findElementByText('verify', 'button') ||
                                DOMAutomation.findElementByText('login', 'button');
                }
                
                if (!submitBtn) {
                    DOMTelemetry.failure('Submit button not found', new Error('No matching selectors'));
                    return { success: false, error: 'Submit button not found on page' };
                }
                
                DOMTelemetry.success('Submit button found');
                onProgress?.('Submitting form natively...');
                
                // Click submit with native event
                await DOMAutomation.clickButton(submitBtn);
                
                // Wait for token with progress updates
                onProgress?.('Waiting for response...');
                const token = await this.waitForToken(onProgress);
                
                DOMTelemetry.success('OTP login successful');
                onProgress?.('[OK] OTP login successful (DOM mode)!');
                
                return { success: true, message: 'OTP login successful', token };
                
            } catch (error) {
                DOMTelemetry.failure('OTP login failed', error);
                return { success: false, error: error.message };
            }
        },
        
        // Request Password OTP (DOM-based) - NEW METHOD FOR PASSWORD-BASED OTP
        async requestPasswordOTP(mobileNo, password, onProgress) {
            DOMTelemetry.log('attempt', 'Starting DOM-based password OTP request');
            
            try {
                onProgress?.('Finding IVAC password login form...');
                
                // Find mobile field with comprehensive selectors
                const mobileField = DOMAutomation.findElement([
                    'input[name="mobile_no"]',
                    'input[name="mobile"]',
                    'input[name="phone"]',
                    'input[type="tel"]',
                    'input[placeholder*="mobile" i]',
                    'input[placeholder*="phone" i]'
                ]);
                
                if (!mobileField) {
                    DOMTelemetry.failure('Mobile field not found', new Error('No matching selectors'));
                    return { success: false, error: 'Mobile field not found. Navigate to IVAC login page first.' };
                }
                
                DOMTelemetry.success('Mobile field found');
                onProgress?.('Mobile field found');
                
                // Find password field
                const passwordField = DOMAutomation.findElement([
                    'input[name="password"]',
                    'input[type="password"]',
                    'input[placeholder*="password" i]'
                ]);
                
                if (!passwordField) {
                    DOMTelemetry.failure('Password field not found', new Error('No matching selectors'));
                    return { success: false, error: 'Password field not found on page' };
                }
                
                DOMTelemetry.success('Password field found');
                onProgress?.('Password field found - filling form...');
                
                // Fill mobile number with anti-detection delays
                onProgress?.('Typing mobile number...');
                await DOMAutomation.typeIntoField(mobileField, mobileNo);
                await DOMAutomation.randomDelay(200, 400);
                
                // Verify mobile was set correctly
                if (mobileField.value !== mobileNo) {
                    onProgress?.('[WARNING] Mobile verification failed - retrying...');
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    setter.call(mobileField, mobileNo);
                    mobileField.dispatchEvent(new Event('input', { bubbles: true }));
                    mobileField.dispatchEvent(new Event('change', { bubbles: true }));
                    await DOMAutomation.randomDelay(100, 200);
                }
                
                onProgress?.('Typing password...');
                await DOMAutomation.typeIntoField(passwordField, password);
                await DOMAutomation.randomDelay(200, 400);
                
                // Verify password was set correctly
                if (passwordField.value.length !== password.length) {
                    onProgress?.('[WARNING] Password verification failed - retrying...');
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    setter.call(passwordField, password);
                    passwordField.dispatchEvent(new Event('input', { bubbles: true }));
                    passwordField.dispatchEvent(new Event('change', { bubbles: true }));
                    await DOMAutomation.randomDelay(100, 200);
                }
                
                // Find login/send OTP button
                let loginBtn = DOMAutomation.findElement([
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button.btn-primary',
                    'button.login-btn',
                    'button[name="submit"]',
                    '#login-submit'
                ]);
                
                // If not found, try finding by text content
                if (!loginBtn) {
                    loginBtn = DOMAutomation.findElementByText('login', 'button') || 
                                DOMAutomation.findElementByText('send otp', 'button') ||
                                DOMAutomation.findElementByText('submit', 'button');
                }
                
                if (!loginBtn) {
                    DOMTelemetry.failure('Login button not found', new Error('No matching selectors'));
                    return { success: false, error: 'Login button not found on page' };
                }
                
                DOMTelemetry.success('Login button found');
                onProgress?.('Submitting form to request OTP...');
                
                // Click button with native event (lets site handle Cloudflare)
                await DOMAutomation.clickButton(loginBtn);
                
                // Wait a bit for server response
                await DOMAutomation.randomDelay(1000, 2000);
                
                DOMTelemetry.success('Password OTP request submitted via DOM');
                onProgress?.('[OK] OTP request submitted! Check your email for OTP');
                
                return { success: true, message: 'OTP request sent successfully' };
                
            } catch (error) {
                DOMTelemetry.failure('Password OTP request failed', error);
                return { success: false, error: error.message };
            }
        },
        
        // Send OTP (DOM-based)
        async sendOTP(mobileNo, onProgress) {
            try {
                onProgress?.('Finding OTP request form...');
                
                // Find mobile field
                const mobileField = DOMAutomation.findElement([
                    'input[name="mobile_no"]',
                    'input[type="tel"]'
                ]);
                
                if (!mobileField) {
                    throw new Error('Mobile field not found');
                }
                
                await DOMAutomation.typeIntoField(mobileField, mobileNo);
                
                // Find send OTP button
                let sendBtn = DOMAutomation.findElement([
                    'button[type="submit"]',
                    '.send-otp',
                    '#send-otp',
                    '.btn-send'
                ]);
                
                // If not found, try finding by text content
                if (!sendBtn) {
                    sendBtn = DOMAutomation.findElementByText('send', 'button') || 
                              DOMAutomation.findElementByText('otp', 'button');
                }
                
                if (!sendBtn) {
                    throw new Error('Send OTP button not found');
                }
                
                onProgress?.('Requesting OTP...');
                await DOMAutomation.clickButton(sendBtn);
                
                return { success: true, message: 'OTP request sent' };
                
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    };
    
    // ==================== TELEMETRY & LOGGING ====================
    const DOMTelemetry = {
        events: [],
        
        log(eventType, message, data = {}) {
            const event = {
                timestamp: new Date().toISOString(),
                type: eventType,
                message: message,
                data: data
            };
            
            this.events.push(event);
            
            // Keep only last 50 events
            if (this.events.length > 50) {
                this.events.shift();
            }
            
            // Silent logging (no console output for stealth)
            // But make available for debugging
            return event;
        },
        
        success(message, data) {
            return this.log('success', message, data);
        },
        
        failure(message, error) {
            return this.log('error', message, { 
                error: error?.message || String(error),
                stack: error?.stack 
            });
        },
        
        warning(message, data) {
            return this.log('warning', message, data);
        },
        
        getEvents() {
            return [...this.events];
        },
        
        clear() {
            this.events = [];
        }
    };
    
    // Export for use in main script
    window.DOMAutomation = DOMAutomation;
    window.IVACFormAutomation = IVACFormAutomation;
    window.DOMTelemetry = DOMTelemetry;
    
    console.log('[SUCCESS] DOM automation modules loaded (EMBEDDED VERSION - no external dependencies)');

    // ==================== LOAD DOM AUTOMATION MODULE (FALLBACK - WILL BE SKIPPED) ====================
    // Load anti-detection DOM automation system for bypassing Cloudflare
    // NOTE: This section will be skipped because modules are already embedded above
    if (!window.DOMAutomation || !window.IVACFormAutomation) {
        // CRITICAL: Try loading from GitHub
        const domScript = document.createElement('script');
        domScript.src = 'https://raw.githubusercontent.com/Hasan1817/ivacbd/refs/heads/main/ivac-dom-automation.js';
        domScript.async = false;
        document.head.appendChild(domScript);
        
        // Wait for script to load with timeout
        const moduleLoaded = await new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.warn('[CRITICAL] DOM automation module load timeout - system may not work properly!');
                resolve(false);
            }, 10000); // 10 second timeout
            
            domScript.onload = () => {
                clearTimeout(timeout);
                console.log('[SUCCESS] DOM automation module loaded from GitHub');
                resolve(true);
            };
            
            domScript.onerror = () => {
                clearTimeout(timeout);
                console.error('[ERROR] DOM automation module failed to load from GitHub');
                resolve(false);
            };
        });
        
        if (!moduleLoaded) {
            console.error('[CRITICAL] System will use direct API (likely to be blocked by Cloudflare)');
        }
    }

    // ==================== SESSION CAPTURE & REPLAY SYSTEM ====================
    // This module helps bypass Cloudflare by capturing real browser sessions
    // Workflow: Manual login in browser → Capture session → Replay in automation
    
    const SessionCapture = {
        // Capture ALL browser session data
        captureSession() {
            const sessionData = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                
                // 1. Cookies (all cookies for current domain)
                cookies: document.cookie,
                
                // 2. localStorage (including access_token)
                localStorage: {},
                
                // 3. sessionStorage
                sessionStorage: {},
                
                // 4. IVAC-specific tokens
                tokens: {
                    access_token: localStorage.getItem('access_token') || null,
                    BEARER_TOKEN: null
                }
            };
            
            // Extract all localStorage items
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                sessionData.localStorage[key] = localStorage.getItem(key);
            }
            
            // Extract all sessionStorage items
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                sessionData.sessionStorage[key] = sessionStorage.getItem(key);
            }
            
            LogManager.add('Session captured: ' + Object.keys(sessionData.localStorage).length + ' localStorage items', 'success');
            return sessionData;
        },
        
        // Export session to JSON (for saving externally)
        exportSession() {
            const session = this.captureSession();
            const jsonStr = JSON.stringify(session, null, 2);
            
            // Create download link
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ivac-session-' + Date.now() + '.json';
            a.click();
            URL.revokeObjectURL(url);
            
            LogManager.add('Session exported to file', 'success');
            return jsonStr;
        },
        
        // Import session from JSON
        importSession(jsonData) {
            try {
                const session = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
                
                // Restore localStorage
                if (session.localStorage) {
                    Object.keys(session.localStorage).forEach(key => {
                        localStorage.setItem(key, session.localStorage[key]);
                    });
                    LogManager.add('Restored ' + Object.keys(session.localStorage).length + ' localStorage items', 'success');
                }
                
                // Restore sessionStorage
                if (session.sessionStorage) {
                    Object.keys(session.sessionStorage).forEach(key => {
                        sessionStorage.setItem(key, session.sessionStorage[key]);
                    });
                    LogManager.add('Restored ' + Object.keys(session.sessionStorage).length + ' sessionStorage items', 'success');
                }
                
                LogManager.add('Session imported successfully!', 'success');
                return true;
            } catch (e) {
                LogManager.add('Session import failed: ' + e.message, 'error');
                return false;
            }
        },
        
        // Display captured session in console (for debugging)
        displaySession() {
            const session = this.captureSession();
            console.log('===== IVAC SESSION CAPTURE =====');
            console.log('Timestamp:', session.timestamp);
            console.log('URL:', session.url);
            console.log('\n--- COOKIES ---');
            console.log(session.cookies);
            console.log('\n--- LOCAL STORAGE ---');
            console.log(session.localStorage);
            console.log('\n--- SESSION STORAGE ---');
            console.log(session.sessionStorage);
            console.log('\n--- TOKENS ---');
            console.log(session.tokens);
            console.log('================================');
            
            LogManager.add('Session displayed in browser console', 'info');
        }
    };

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
                        SilentConsole.log('[AUTH] Session valid, welcome back ' + sessionData.username);
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
            SilentConsole.log('[WARNING] Your license expires in ' + daysLeft + ' days (' + expiryDate + ')');
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
            SilentConsole.log('[AUTH] Fetching user database from:', USER_DB_URL);
            
            // Fetch user database
            const response = await fetch(USER_DB_URL + '?t=' + Date.now(), {
                cache: 'no-cache'
            });
            
            SilentConsole.log('[AUTH] Response status:', response.status);
            
            if (!response.ok) {
                SilentConsole.error('[AUTH] Failed to fetch user database. Status:', response.status);
                return {
                    success: false,
                    error: 'Unable to verify credentials. Please try again.'
                };
            }
            
            // Get response text first for debugging
            const responseText = await response.text();
            SilentConsole.log('[AUTH] Response received, length:', responseText.length);
            
            // Try to parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
                SilentConsole.log('[AUTH] JSON parsed successfully');
            } catch (parseErr) {
                SilentConsole.error('[AUTH] JSON Parse Error:', parseErr.message);
                SilentConsole.error('[AUTH] Response text:', responseText.substring(0, 200));
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
            SilentConsole.log('[AUTH] Login successful: ' + username);
            return {
                success: true,
                userExpires: user.expires,
                role: user.role || 'basic'
            };
            
        } catch (err) {
            SilentConsole.error('[AUTH] Error:', err);
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
            SilentConsole.log('[IVAC] Authentication failed. System not loaded.');
            return;
        }
        
        SilentConsole.log('[IVAC] Authentication successful. Loading main system...');

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
            min-width: 400px;
            max-width: 95vw;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: Arial, sans-serif;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            resize: both;
            overflow: auto;
        }
        .resize-handle {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            cursor: nwse-resize;
            background: linear-gradient(135deg, transparent 50%, #999 50%);
            border-bottom-right-radius: 8px;
            z-index: 10;
        }
        .user-profile-section {
            padding: 8px 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-bottom: 1px solid #ddd;
            display: none;
            align-items: center;
            gap: 10px;
            color: white;
            font-size: 12px;
        }
        .user-profile-section.active {
            display: flex;
        }
        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #667eea;
            font-size: 16px;
            flex-shrink: 0;
        }
        .user-info {
            flex: 1;
            min-width: 0;
        }
        .user-name {
            font-weight: bold;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .user-details {
            font-size: 10px;
            opacity: 0.9;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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
            // Reverse logs to show latest on top
            const reversedLogs = [...this.logs].reverse();
            this.contentDiv.innerHTML = reversedLogs.map(log => 
                `<div class="log-entry log-${log.type}">[${log.timestamp}] ${log.message}</div>`
            ).join('');
            // Keep scroll at top to see latest logs
            this.contentDiv.scrollTop = 0;
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

    // ==================== STEALTH-SAFE NETWORK WRAPPER ====================
    // NO global fetch/XHR patching - uses optional wrapper pattern instead
    // This preserves native browser behavior while allowing optional anti-fingerprinting
    
    const StealthFetch = {
        // Optional wrapper for fetch with human-like timing (NO global patching)
        async safeFetch(url, options = {}) {
            // Add small random pre-request delay (human thinking time)
            await new Promise(r => setTimeout(r, 50 + Math.random() * 150));
            
            // Use NATIVE fetch - no interception
            const response = await fetch(url, options);
            
            // Optional post-request delay if too fast (looks bot-like)
            const elapsed = Date.now();
            if (elapsed < 100) {
                await new Promise(r => setTimeout(r, 30 + Math.random() * 70));
            }
            
            // Optional logging (non-intrusive)
            const status = response.status;
            if (status >= 200 && status < 300) {
                LogManager.add(`[${status}] ${options.method || 'GET'}`, 'success');
            } else if (status >= 400) {
                LogManager.add(`[${status}] ${options.method || 'GET'}`, 'error');
            }
            
            return response;
        },
        
        // Get safe headers (no forbidden headers)
        getSafeHeaders(additionalHeaders = {}) {
            return {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
                'Cache-Control': 'no-cache',
                ...additionalHeaders
            };
        }
    };

    // STEALTH: NO global XMLHttpRequest/fetch patching
    // Scripts using native fetch() will work normally
    // Scripts can OPTIONALLY use StealthFetch.safeFetch() for anti-fingerprinting

    // ==================== CONTAINER ====================
    const container = document.createElement('div');
    container.id = 'ivac-container';
    
    // User Profile Section (hidden by default, shown after login)
    const userProfileSection = document.createElement('div');
    userProfileSection.className = 'user-profile-section';
    userProfileSection.innerHTML = `
        <div class="user-avatar" id="user-avatar">U</div>
        <div class="user-info">
            <div class="user-name" id="user-name">Not logged in</div>
            <div class="user-details" id="user-details">Login to see your profile</div>
        </div>
    `;
    
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
    
    // Resize handle for resizable interface
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.title = 'Drag to resize';
    
    // Assemble structure
    mainContent.appendChild(content);
    mainContent.appendChild(popupContainer);
    
    bodyWrapper.appendChild(logPanel);
    bodyWrapper.appendChild(mainContent);
    
    container.appendChild(userProfileSection);
    container.appendChild(header);
    container.appendChild(bodyWrapper);
    container.appendChild(resizeHandle);
    document.body.appendChild(container);
    
    // Initialize log system
    LogManager.init(logPanel);
    LogManager.add('IVAC System initialized', 'success');

    // ==================== USER PROFILE MANAGER ====================
    const UserProfileManager = {
        updateProfile(userData) {
            if (!userData) return;
            
            // Update UI with user data
            const avatar = document.getElementById('user-avatar');
            const name = document.getElementById('user-name');
            const details = document.getElementById('user-details');
            
            // Handle profile photo if available
            if (userData.photo || userData.image || userData.avatar || userData.profile_photo) {
                const photoUrl = userData.photo || userData.image || userData.avatar || userData.profile_photo;
                
                // Clear text content
                avatar.textContent = '';
                
                // Create or update img element
                let img = avatar.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    img.style.cssText = `
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        object-fit: cover;
                    `;
                    avatar.appendChild(img);
                }
                
                img.src = photoUrl;
                img.alt = userData.name || 'Profile';
                
                // Fallback to initials if image fails to load
                img.onerror = () => {
                    avatar.removeChild(img);
                    const initials = this.getInitials(userData.name || userData.full_name || 'User');
                    avatar.textContent = initials;
                    LogManager.add('Profile image failed to load, showing initials', 'warning');
                };
                
                LogManager.add('Profile image loaded successfully', 'success');
            } else {
                // No photo available, show initials
                avatar.textContent = '';
                const initials = this.getInitials(userData.name || userData.full_name || 'User');
                avatar.textContent = initials;
            }
            
            name.textContent = userData.name || userData.full_name || 'User';
            
            // Build details string
            const detailParts = [];
            if (userData.email || userData.email_name) detailParts.push(userData.email || userData.email_name);
            if (userData.phone || userData.mobile_no) detailParts.push(userData.phone || userData.mobile_no);
            
            details.textContent = detailParts.length > 0 ? detailParts.join(' | ') : 'Welcome!';
            
            // Show profile section
            userProfileSection.classList.add('active');
            
            // Store in sessionStorage for anti-detection (simulates natural browser behavior)
            sessionStorage.setItem('ivac_user_data', JSON.stringify(userData));
            
            LogManager.add(`Profile loaded: ${userData.name || 'User'}`, 'success');
        },
        
        getInitials(name) {
            if (!name) return 'U';
            const parts = name.trim().split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return name[0].toUpperCase();
        },
        
        hide() {
            userProfileSection.classList.remove('active');
        }
    };

    // ==================== ANTI-DETECTION UTILITIES ====================
    const AntiDetection = {
        // Human-like random delays
        randomDelay(min = 100, max = 500) {
            return new Promise(resolve => {
                const delay = Math.floor(Math.random() * (max - min + 1)) + min;
                setTimeout(resolve, delay);
            });
        },
        
        // Natural typing simulation
        async typeNaturally(input, text) {
            input.value = '';
            for (let char of text) {
                await this.randomDelay(50, 150);
                input.value += char;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            input.dispatchEvent(new Event('change', { bubbles: true }));
        },
        
        // Enhanced headers for API requests (more browser-like)
        // Note: Forbidden headers that browser manages automatically:
        // Accept-Encoding, Host, Origin, Connection, User-Agent, etc.
        // We only set safe, non-forbidden headers here
        getHeaders(additionalHeaders = {}) {
            return {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                ...additionalHeaders
            };
        },
        
        // Simulate mouse movement (triggers browser events)
        simulateActivity() {
            const event = new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: Math.random() * window.innerWidth,
                clientY: Math.random() * window.innerHeight
            });
            document.dispatchEvent(event);
        },
        
        // Simulate scroll activity
        simulateScroll() {
            window.scrollBy({
                top: Math.random() * 10 - 5,
                left: 0,
                behavior: 'smooth'
            });
        },
        
        // Add natural jitter to timing
        jitter(baseTime) {
            return baseTime + (Math.random() * 200 - 100);
        },
        
        // Advanced: Mimic human interaction pattern before API call
        async mimicHumanBehavior() {
            // Random mouse movements
            for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
                this.simulateActivity();
                await this.randomDelay(100, 300);
            }
            
            // Random scroll
            if (Math.random() > 0.5) {
                this.simulateScroll();
                await this.randomDelay(50, 150);
            }
            
            // Final thinking pause
            await this.randomDelay(200, 500);
        },
        
        // Fingerprint-resistant fetch wrapper
        async safeFetch(url, options = {}) {
            // Pre-request human behavior simulation
            await this.randomDelay(100, 300);
            
            // Enhance headers
            const enhancedOptions = {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...(options.headers || {})
                },
                credentials: 'include', // Include cookies
                mode: 'cors'
            };
            
            // Add subtle timing variation
            const startTime = Date.now();
            const response = await fetch(url, enhancedOptions);
            const elapsed = Date.now() - startTime;
            
            // Add post-request delay if response was too fast (looks bot-like)
            if (elapsed < 100) {
                await this.randomDelay(50, 150);
            }
            
            return response;
        }
    };

    // Periodically simulate activity to avoid detection (with random intervals)
    function scheduleActivitySimulation() {
        AntiDetection.simulateActivity();
        const nextDelay = 3000 + Math.random() * 7000; // 3-10 seconds
        setTimeout(scheduleActivitySimulation, nextDelay);
    }
    scheduleActivitySimulation();
    
    // Occasional scroll simulation
    function scheduleScrollSimulation() {
        if (Math.random() > 0.7) {
            AntiDetection.simulateScroll();
        }
        const nextDelay = 10000 + Math.random() * 10000; // 10-20 seconds
        setTimeout(scheduleScrollSimulation, nextDelay);
    }
    scheduleScrollSimulation();

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
        
        // ===== IMPORTANT INSTRUCTION (NO EMOJIS - ANTI-DETECTION) =====
        const instructionBox = el('div', { 
            innerHTML: '<strong>[!] CORRECT WORKFLOW:</strong><br>' +
                       '1. CAPTCHA + Mobile + Send (verify mobile)<br>' +
                       '2. Password + Login → OTP to EMAIL<br>' +
                       '3. Enter OTP → Submit → Login<br>' +
                       '<small style="color:#2196f3;">Login button sends OTP to your email!</small>'
        });
        style(instructionBox, {
            fontSize: '11px',
            padding: '8px',
            marginBottom: '10px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            color: '#856404',
            lineHeight: '1.4'
        });
        ivacPanel.appendChild(instructionBox);
        
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
        
        // ===== SESSION CAPTURE & REPLAY SYSTEM =====
        const sessionSeparator = style(el('div', { innerHTML: '<strong>SESSION MANAGEMENT</strong> (Bypass Cloudflare)' }), {
            fontSize: '11px',
            fontWeight: '700',
            padding: '6px 8px',
            marginTop: '8px',
            marginBottom: '4px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '4px',
            color: '#1976d2',
            textAlign: 'center'
        });
        form.appendChild(sessionSeparator);
        
        const sessionInfo = style(el('div', { 
            innerHTML: 'Workflow: Manual login → Export session → Import session → Automate<br>' +
                       '<small style="color:#666;">This captures cookies, localStorage, sessionStorage & tokens</small>'
        }), {
            fontSize: '10px',
            padding: '6px',
            marginBottom: '6px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            lineHeight: '1.3'
        });
        form.appendChild(sessionInfo);
        
        // Session buttons row
        const sessionBtnRow = style(el('div'), { display: 'flex', gap: '6px' });
        
        const exportSessionBtn = el('button', { innerText: 'Export Session' });
        exportSessionBtn.classList.add('slim-btn');
        style(exportSessionBtn, { background: '#4caf50', color: '#fff', flex: '1', fontSize: '11px' });
        
        const captureSessionBtn = el('button', { innerText: 'Capture Session' });
        captureSessionBtn.classList.add('slim-btn');
        style(captureSessionBtn, { background: '#2196f3', color: '#fff', flex: '1', fontSize: '11px' });
        
        const displaySessionBtn = el('button', { innerText: 'View Console' });
        displaySessionBtn.classList.add('slim-btn');
        style(displaySessionBtn, { background: '#9c27b0', color: '#fff', flex: '1', fontSize: '11px' });
        
        sessionBtnRow.appendChild(captureSessionBtn);
        sessionBtnRow.appendChild(exportSessionBtn);
        sessionBtnRow.appendChild(displaySessionBtn);
        form.appendChild(sessionBtnRow);
        
        // Import session row
        const importRow = style(el('div'), { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' });
        
        const importTextarea = el('textarea', { 
            placeholder: 'Paste exported session JSON here to import...',
            rows: 3
        });
        style(importTextarea, { 
            fontSize: '10px', 
            fontFamily: 'monospace',
            resize: 'vertical',
            padding: '4px',
            borderRadius: '4px',
            border: '1px solid #ddd'
        });
        
        const importBtnRow = style(el('div'), { display: 'flex', gap: '6px' });
        const importSessionBtn = el('button', { innerText: 'Import Session' });
        importSessionBtn.classList.add('slim-btn');
        style(importSessionBtn, { background: '#ff9800', color: '#fff', flex: '1', fontSize: '11px' });
        
        const clearImportBtn = el('button', { innerText: 'Clear' });
        clearImportBtn.classList.add('slim-btn');
        style(clearImportBtn, { background: '#757575', color: '#fff', flex: '0 0 60px', fontSize: '11px' });
        
        importBtnRow.appendChild(importSessionBtn);
        importBtnRow.appendChild(clearImportBtn);
        
        importRow.appendChild(importTextarea);
        importRow.appendChild(importBtnRow);
        form.appendChild(importRow);
        
        // Session button handlers
        captureSessionBtn.addEventListener('click', () => {
            const session = SessionCapture.captureSession();
            status.innerText = '[OK] Session captured! ' + Object.keys(session.localStorage).length + ' items';
            status.style.color = '#4caf50';
            LogManager.add('Session captured successfully', 'success');
            startCooldown(captureSessionBtn);
        });
        
        exportSessionBtn.addEventListener('click', () => {
            SessionCapture.exportSession();
            status.innerText = '[OK] Session exported to download file!';
            status.style.color = '#4caf50';
            startCooldown(exportSessionBtn);
        });
        
        displaySessionBtn.addEventListener('click', () => {
            SessionCapture.displaySession();
            status.innerText = '[OK] Session displayed in browser console (F12)';
            status.style.color = '#2196f3';
            startCooldown(displaySessionBtn);
        });
        
        importSessionBtn.addEventListener('click', () => {
            const jsonData = importTextarea.value.trim();
            if (!jsonData) {
                status.innerText = '[ERR] Please paste session JSON first';
                status.style.color = '#f44336';
                return;
            }
            
            const success = SessionCapture.importSession(jsonData);
            if (success) {
                status.innerText = '[OK] Session imported! Cookies & tokens restored';
                status.style.color = '#4caf50';
                importTextarea.value = '';
                
                // Reload token display
                const savedToken = localStorage.getItem('access_token');
                if (savedToken) {
                    tokenInput.value = savedToken;
                }
            } else {
                status.innerText = '[ERR] Session import failed - check JSON format';
                status.style.color = '#f44336';
            }
            startCooldown(importSessionBtn);
        });
        
        clearImportBtn.addEventListener('click', () => {
            importTextarea.value = '';
            status.innerText = 'Import textarea cleared';
            status.style.color = '#666';
        });
        
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
        
        // Wait for profile data to be available after DOM-based login
        async function waitForProfileData(timeout = 10000) {
            const startTime = Date.now();
            
            while (Date.now() - startTime < timeout) {
                // Check if the page has updated with user data
                const userNameElement = document.querySelector('[class*="user-name"], [class*="profile-name"], .user-info');
                const profileImageElement = document.querySelector('[class*="profile-image"], [class*="user-avatar"], img[alt*="profile" i]');
                
                if (userNameElement || profileImageElement) {
                    // Extract user data from DOM
                    const userData = {
                        name: userNameElement?.textContent?.trim() || 'User',
                        photo: profileImageElement?.src || null
                    };
                    
                    LogManager.add('Profile data extracted from page', 'success');
                    UserProfileManager.updateProfile(userData);
                    return;
                }
                
                await DOMAutomation.randomDelay(500, 1000);
            }
            
            LogManager.add('Profile data not found on page (may load later)', 'warning');
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
            // CORRECT WORKFLOW: Login button sends OTP to EMAIL
            // Step: Mobile + Password → DOM-based form submit → OTP sent to email
            
            const mobile = mobileRow.input.value.trim();
            const password = passRow.input.value.trim();
            
            if (!mobile || !password) {
                status.innerText = '[ERR] Mobile and password required';
                LogManager.add('Mobile and password required for OTP request', 'error');
                return;
            }
            
            // Disable button during processing
            passRow.btn.disabled = true;
            const originalText = passRow.btn.innerText;
            passRow.btn.innerText = 'Sending...';
            
            try {
                status.innerText = 'Requesting OTP to email...';
                LogManager.add('Requesting OTP for mobile: ' + mobile, 'info');
                
                // CRITICAL: Try DOM-based password OTP request first (bypasses Cloudflare)
                LogManager.add('Attempting DOM-based password OTP request...', 'info');
                
                // Check if we're on IVAC login page
                const hasLoginForm = document.querySelector(
                    'input[name="mobile_no"], input[name="mobile"], input[type="tel"]'
                );
                
                if (hasLoginForm && window.IVACFormAutomation) {
                    // Use DOM automation to fill and submit the real form
                    status.innerText = 'Using native form (anti-detection mode)...';
                    LogManager.add('Native login form detected - using DOM automation', 'info');
                    
                    const result = await IVACFormAutomation.requestPasswordOTP(
                        mobile,
                        password,
                        (msg) => {
                            status.innerText = msg;
                            LogManager.add(msg, 'info');
                        }
                    );
                    
                    if (result.success) {
                        status.innerText = '[OK] OTP sent to your email! Check inbox/spam';
                        LogManager.add('[SUCCESS] OTP request via DOM automation - Cloudflare bypassed', 'success');
                        LogManager.add('Next step: Enter OTP in OTP box → Click Submit', 'info');
                        
                        // Flash instruction box to guide user
                        instructionBox.style.backgroundColor = '#e8f5e9';
                        instructionBox.style.borderColor = '#4caf50';
                        setTimeout(() => {
                            instructionBox.style.backgroundColor = '#fff3cd';
                            instructionBox.style.borderColor = '#ffc107';
                        }, 3000);
                        
                        // Focus OTP field for user convenience
                        otpRow.input.focus();
                    } else {
                        throw new Error(result.error || 'DOM OTP request failed');
                    }
                } else {
                    // Fallback warning: No native form found
                    status.innerText = '[ERR] Navigate to IVAC login page first!';
                    LogManager.add('[WARNING] Native form not found on page', 'warning');
                    LogManager.add('[INFO] Open https://payment.ivacbd.com/ and try again', 'warning');
                    
                    throw new Error('IVAC login form not found. Navigate to payment.ivacbd.com first.');
                }
                
                startCooldown(passRow.btn);
            } catch (e) {
                status.innerText = '[ERR] Error: ' + e.message;
                LogManager.add('OTP request error: ' + e.message, 'error');
            } finally {
                passRow.btn.disabled = false;
                passRow.btn.innerText = originalText;
            }
        });
        
        otpRow.btn.addEventListener('click', async () => {
            const mobile = mobileRow.input.value.trim();
            const password = passRow.input.value.trim();
            const otpValue = otpRow.input.value.trim();
            
            // Variable-length OTP validation (6-7 digits)
            if (!otpValue || otpValue.length < 6 || otpValue.length > 7 || !/^\d+$/.test(otpValue)) {
                status.innerText = 'Please enter valid OTP (6-7 digits)';
                LogManager.add('Invalid OTP format (must be 6-7 digits)', 'error');
                return;
            }
            
            if (!mobile || !password) {
                status.innerText = 'Mobile and password required';
                LogManager.add('Mobile and password required for OTP login', 'error');
                return;
            }
            
            // Disable button during processing
            otpRow.btn.disabled = true;
            const originalText = otpRow.btn.innerText;
            otpRow.btn.innerText = 'Working...';
            
            try {
                // CRITICAL: Try DOM-based OTP login first (bypasses Cloudflare detection)
                LogManager.add('Attempting DOM-based OTP login...', 'info');
                
                // Check if we're on a page with IVAC form
                const hasLoginForm = document.querySelector(
                    'input[name="mobile_no"], input[name="mobile"], input[type="tel"]'
                );
                
                if (hasLoginForm && window.IVACFormAutomation) {
                    // Use DOM automation to fill and submit the real form
                    status.innerText = 'Using native form (anti-detection mode)...';
                    LogManager.add('Native login form detected - using DOM automation', 'info');
                    
                    const result = await IVACFormAutomation.loginWithOTP(
                        mobile,
                        password,
                        otpValue,
                        (msg) => {
                            status.innerText = msg;
                            LogManager.add(msg, 'info');
                        }
                    );
                    
                    if (result.success && result.token) {
                        tokenInput.value = result.token;
                        status.innerText = '[OK] OTP login successful (DOM mode)';
                        LogManager.add('[SUCCESS] Login via DOM automation - Cloudflare bypassed', 'success');
                        
                        // Update user profile
                        await DOMAutomation.randomDelay(300, 600);
                        const userData = {
                            access_token: result.token,
                            name: 'User ' + mobile.slice(-4)
                        };
                        UserProfileManager.updateProfile(userData);
                    } else {
                        throw new Error(result.error || 'DOM login failed');
                    }
                } else {
                    // Fallback to direct API (RISKY - may be blocked by Cloudflare)
                    status.innerText = 'WARNING: Using direct API (may be blocked)...';
                    LogManager.add('[WARNING] Native form not found - using direct API (RISKY!)', 'warning');
                    LogManager.add('[INFO] This may cause account blocking. Navigate to IVAC login page first!', 'warning');
                    
                    const payload = {
                        mobile_no: mobile,
                        password: password,
                        otp: otpValue
                    };
                    
                    const res = await postJson('https://payment.ivacbd.com/api/v2/login-otp', payload);
                    
                    if (res.data && res.data.access_token) {
                        localStorage.setItem('access_token', res.data.access_token);
                        tokenInput.value = res.data.access_token;
                        status.innerText = '[WARN] Login successful (but API mode - risky)';
                        LogManager.add('[WARNING] OTP login via API - may cause blocking!', 'warning');
                        
                        // Update user profile with anti-detection delay
                        await DOMAutomation.randomDelay(300, 600);
                        UserProfileManager.updateProfile(res.data);
                    } else {
                        status.innerText = '[ERR] OTP submission failed';
                        LogManager.add('OTP verification failed', 'error');
                    }
                }
                
                startCooldown(otpRow.btn);
            } catch (e) {
                status.innerText = '[ERR] Error: ' + e.message;
                LogManager.add('OTP error: ' + e.message, 'error');
            } finally {
                otpRow.btn.disabled = false;
                otpRow.btn.innerText = originalText;
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
                    SilentConsole.log(e);
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
            
            // WARNING: Direct API submission (may be blocked by Cloudflare)
            LogManager.add('[WARNING] Using direct API for submit (may trigger Cloudflare)', 'warning');
            
            try {
                showMessage('Submitting payload...');
                
                // Try to detect if we're on IVAC submit page
                const ivacSubmitForm = document.querySelector('form[action*="submit"], form[action*="appointment"]');
                if (ivacSubmitForm && window.DOMAutomation) {
                    LogManager.add('[INFO] Found IVAC submit form - attempting DOM submission', 'info');
                    // TODO: Implement DOM-based submit
                    showMessage('[INFO] DOM submit not implemented yet, using direct API');
                }
                
                const res = await fetch(fullURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${bearerToken}`
                    },
                    body: JSON.stringify(payload)
                });
                
                // Check if response is JSON or error page
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Server returned non-JSON response (likely Cloudflare block)');
                }
                
                const data = await res.json();
                showMessage(data.message || '[OK] Payload submitted successfully!');
                LogManager.add('Application submitted: ' + (data.message || 'Success'), 'success');
                startCooldown(submitAppBtn);
            } catch (e) {
                // Enhanced error reporting
                if (e.message.includes('Automated') || e.message.includes('not valid JSON')) {
                    showMessage('[ERR] Cloudflare blocked request - need DOM-based submission!');
                    LogManager.add('[CRITICAL] Cloudflare detected automation: ' + e.message, 'error');
                } else {
                    showMessage('[ERR] Error: ' + e.message);
                    LogManager.add('Submit error: ' + e.message, 'error');
                }
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
        
        // OTP Format Info (NO DIGIT SELECTOR - supports alphanumeric)
        const otpInfoRow = document.createElement('div');
        otpInfoRow.className = 'input-row';
        otpInfoRow.style.gap = '8px';
        otpInfoRow.style.alignItems = 'center';
        otpInfoRow.style.padding = '6px 8px';
        otpInfoRow.style.background = '#e8f5e9';
        otpInfoRow.style.borderRadius = '4px';
        otpInfoRow.style.border = '1px solid #81c784';
        
        const infoIcon = document.createElement('span');
        infoIcon.textContent = 'INFO:';
        infoIcon.style.fontSize = '11px';
        infoIcon.style.fontWeight = '700';
        infoIcon.style.color = '#2e7d32';
        otpInfoRow.appendChild(infoIcon);
        
        const infoText = document.createElement('span');
        infoText.textContent = 'Payment OTP supports ALPHANUMERIC format (e.g., Fg5SC6, V8Tca4X)';
        infoText.style.fontSize = '11px';
        infoText.style.color = '#1b5e20';
        infoText.style.flex = '1';
        otpInfoRow.appendChild(infoText);
        
        topSection.appendChild(otpInfoRow);
        
        const otpRow = document.createElement('div');
        otpRow.className = 'input-row';
        const otpInput = createInput('Enter OTP (alphanumeric)', 'text', true);
        otpInput.maxLength = 10; // Support alphanumeric OTP (Fg5SC6, V8Tca4X, etc.)
        otpInput.placeholder = 'e.g. Fg5SC6, V8Tca4X, gLmyMU9';
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
        
        // OTP send (REFERENCE CODE IMPLEMENTATION)
        otpSendBtn.addEventListener('click', async () => {
            // Validate Bearer Token first
            if (!BEARER_TOKEN || BEARER_TOKEN.length < 10) {
                showMessage('[ERR] Bearer Token required! Login first.', true);
                LogManager.add('[ERR] Payment OTP send failed: No Bearer Token', 'error');
                return;
            }
            
            // Disable button during processing
            otpSendBtn.disabled = true;
            const originalText = otpSendBtn.innerText;
            otpSendBtn.innerText = 'Sending...';
            
            try {
                LogManager.add('Sending Payment OTP request...', 'info');
                const url = baseURLInput.value.trim() + '/api/v2/payment/pay-otp-sent';
                const payload = {resend: 0};
                
                LogManager.add('POST ' + url, 'info');
                LogManager.add('Payload: ' + JSON.stringify(payload), 'info');
                
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${BEARER_TOKEN}`
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                LogManager.add('Response: ' + JSON.stringify(data), 'info');
                
                if (data.status === 'success') {
                    showMessage('[OK] Payment OTP sent successfully!');
                    LogManager.add('Payment OTP sent successfully', 'success');
                } else {
                    showMessage('[ERR] OTP send failed: ' + (data.message || 'Unknown error'), true);
                    LogManager.add('Payment OTP send failed: ' + (data.message || 'Unknown error'), 'error');
                }
                
                startCooldown(otpSendBtn);
            } catch (e) {
                showMessage('[ERR] Error: ' + e.message, true);
                LogManager.add('Payment OTP send error: ' + e.message, 'error');
            } finally {
                otpSendBtn.disabled = false;
                otpSendBtn.innerText = originalText;
            }
        });
        
        // OTP verify (ALPHANUMERIC SUPPORT - FIXED!)
        verifyBtn.addEventListener('click', async () => {
            const otpValue = otpInput.value.trim();
            
            // Validate Bearer Token
            if (!BEARER_TOKEN || BEARER_TOKEN.length < 10) {
                showMessage('[ERR] Bearer Token required! Login first.', true);
                LogManager.add('[ERR] Payment OTP verify failed: No Bearer Token', 'error');
                return;
            }
            
            // FIXED: Accept ALPHANUMERIC OTP (Fg5SC6, V8Tca4X, gLmyMU9, etc.)
            if (!otpValue || otpValue.length < 4 || otpValue.length > 10) {
                showMessage('[ERR] Please enter valid OTP (4-10 characters)', true);
                LogManager.add('[ERR] Invalid OTP: length must be 4-10 characters', 'error');
                return;
            }
            
            // Accept alphanumeric characters only (no spaces/special chars)
            if (!/^[a-zA-Z0-9]+$/.test(otpValue)) {
                showMessage('[ERR] OTP should contain only letters and numbers', true);
                LogManager.add('[ERR] Invalid OTP format: contains special characters', 'error');
                return;
            }
            
            // Disable button during processing
            verifyBtn.disabled = true;
            const originalText = verifyBtn.innerText;
            verifyBtn.innerText = 'Verifying...';
            
            try {
                LogManager.add(`Verifying Payment OTP: ${otpValue} (${otpValue.length} chars)`, 'info');
                const url = baseURLInput.value.trim() + '/api/v2/payment/pay-otp-verify';
                const payload = {otp: otpValue};
                
                LogManager.add('POST ' + url, 'info');
                LogManager.add('Payload: ' + JSON.stringify(payload), 'info');
                
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${BEARER_TOKEN}`
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                LogManager.add('Response: ' + JSON.stringify(data), 'info');
                
                if (data.status === 'success') {
                    if (data.data && data.data.slot_dates && data.data.slot_dates.length > 0) {
                        dateValInput.value = data.data.slot_dates[0];
                        timeValInput.value = "";
                        showMessage(`[OK] OTP Verified! Date: ${data.data.slot_dates[0]}`);
                        LogManager.add(`Payment OTP verified! Date: ${data.data.slot_dates[0]}`, 'success');
                    } else {
                        showMessage('[OK] OTP Verified! (No date auto-filled)');
                        LogManager.add('Payment OTP verified (no slot dates)', 'warning');
                    }
                } else {
                    showMessage('[ERR] Verification failed: ' + (data.message || 'Unknown error'), true);
                    LogManager.add('Payment OTP verification failed: ' + (data.message || 'Unknown error'), 'error');
                }
                
                startCooldown(verifyBtn);
            } catch (e) {
                showMessage('[ERR] Error: ' + e.message, true);
                LogManager.add('Payment OTP verification error: ' + e.message, 'error');
            } finally {
                verifyBtn.disabled = false;
                verifyBtn.innerText = originalText;
            }
        });
        
        // Slot time (REFERENCE CODE IMPLEMENTATION)
        slotBtn.addEventListener('click', async () => {
            const appointment_date = dateValInput.value.trim();
            
            if (!appointment_date) {
                showMessage('[ERR] First select a date', true);
                LogManager.add('[ERR] Cannot fetch slot time: no date selected', 'error');
                return;
            }
            
            // Validate Bearer Token
            if (!BEARER_TOKEN || BEARER_TOKEN.length < 10) {
                showMessage('[ERR] Bearer Token required! Login first.', true);
                LogManager.add('[ERR] Slot time fetch failed: No Bearer Token', 'error');
                return;
            }
            
            // Disable button during processing
            slotBtn.disabled = true;
            const originalText = slotBtn.innerText;
            slotBtn.innerText = 'Loading...';
            
            try {
                LogManager.add('Fetching slot times for date: ' + appointment_date, 'info');
                const url = baseURLInput.value.trim() + '/api/v2/payment/pay-slot-time';
                const payload = {appointment_date};
                
                LogManager.add('POST ' + url, 'info');
                
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${BEARER_TOKEN}`
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                LogManager.add('Response: ' + JSON.stringify(data), 'info');
                
                if (data.data?.slot_times?.length) {
                    timeValInput.value = data.data.slot_times[0].time_display;
                    showMessage('[OK] Slot Time: ' + data.data.slot_times[0].time_display);
                    LogManager.add('Slot time fetched: ' + data.data.slot_times[0].time_display, 'success');
                } else {
                    timeValInput.value = "";
                    showMessage('[ERR] No slot times available for this date', true);
                    LogManager.add('No slot times available for date: ' + appointment_date, 'warning');
                }
                
                startCooldown(slotBtn);
            } catch (e) {
                showMessage('[ERR] Error: ' + e.message, true);
                LogManager.add('Slot time fetch error: ' + e.message, 'error');
            } finally {
                slotBtn.disabled = false;
                slotBtn.innerText = originalText;
            }
        });
        
        fallbackBtn.addEventListener('click', () => {
            timeValInput.value = '09:00 - 09:59';
            showMessage('Default Slot Time filled.');
        });
        
        // Pay now (REFERENCE CODE IMPLEMENTATION)
        payNowBtn.addEventListener('click', async () => {
            const originalBtnText = payNowBtn.textContent;
            payNowBtn.textContent = 'Loading...';
            payNowBtn.disabled = true;
            
            try {
                // Validate Bearer Token
                if (!BEARER_TOKEN || BEARER_TOKEN.length < 10) {
                    showMessage('[ERR] Bearer Token required! Login first.', true);
                    LogManager.add('[ERR] Payment failed: No Bearer Token', 'error');
                    return;
                }
                
                // Get CAPTCHA token
                const token = await getCaptchaToken();
                LogManager.add('CAPTCHA token ready', 'success');
                
                // Build payload
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
                
                // Validate required fields
                const dateKey = dateKeyInput.value.trim();
                const timeKey = timeKeyInput.value.trim();
                
                if (!payload[dateKey]) {
                    showMessage('[ERR] Appointment Date required', true);
                    LogManager.add('[ERR] Appointment date missing', 'error');
                    return;
                }
                
                if (!payload[timeKey]) {
                    showMessage('[ERR] Appointment Time required', true);
                    LogManager.add('[ERR] Appointment time missing', 'error');
                    return;
                }
                
                LogManager.add('Submitting payment request...', 'info');
                const url = baseURLInput.value.trim() + endpointInput.value.trim();
                LogManager.add('POST ' + url, 'info');
                LogManager.add('Payload: ' + JSON.stringify(payload), 'info');
                
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${BEARER_TOKEN}`
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                LogManager.add('Response: ' + JSON.stringify(data), 'info');
                
                if (data.status === 'success' && data.data && data.data.url) {
                    paymentLink = data.data.url;
                    paymentBtn.disabled = false;
                    paymentBtn.style.opacity = '1';
                    paymentBtn.style.backgroundColor = '#22c55e';
                    showMessage('[OK] Payment link ready! Click "Open Payment"');
                    LogManager.add('Payment link generated: ' + paymentLink, 'success');
                } else {
                    showMessage('[ERR] Payment link missing: ' + (data.message || 'Unknown error'), true);
                    LogManager.add('Payment link generation failed: ' + (data.message || 'Unknown error'), 'error');
                }
                
                startCooldown(payNowBtn);
            } catch (e) {
                showMessage('[ERR] Error: ' + e.message, true);
                LogManager.add('Payment error: ' + e.message, 'error');
            } finally {
                payNowBtn.textContent = originalBtnText;
                payNowBtn.disabled = false;
            }
        });
        
        paymentBtn.addEventListener('click', () => {
            if (paymentLink && paymentLink.length > 0) {
                LogManager.add('Opening payment link: ' + paymentLink, 'info');
                window.open(paymentLink, '_blank');
                showMessage('[OK] Payment page opened in new tab');
                LogManager.add('Payment page opened', 'success');
            } else {
                showMessage('[ERR] Payment link not available. Click "Pay Now" first.', true);
                LogManager.add('[ERR] Cannot open payment: link not available', 'error');
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
    SilentConsole.log('[OK] IVAC System loaded successfully!');
    LogManager.add('System ready - STEALTH MODE ACTIVE', 'success');

    })(); // End of initializeSystem async IIFE

})(); // End of main IIFE
