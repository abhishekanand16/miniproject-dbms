import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, LogIn, Shield, AlertCircle, HelpCircle, Mail, Lock, Key, Bug, RefreshCw, Globe, Smartphone, Monitor } from 'lucide-react';
import './Help.css';

const Help = () => {
  return (
    <div className="help-container">
      <div className="help-content">
        <div className="help-header">
          <Link to="/login" className="back-button">
            <ArrowLeft size={20} />
            <span>Back to Login</span>
          </Link>
          <h1><HelpCircle size={32} /> Help & Support</h1>
          <p className="help-subtitle">Get assistance with accessing and using the Hospital Management System</p>
        </div>

        <div className="help-sections">
          {/* Quick Access Section */}
          <section className="help-section">
            <div className="section-header">
              <Globe size={24} />
              <h2>Quick Access Guide</h2>
            </div>
            <div className="info-box">
              <p><strong>Website URL:</strong> <code>http://localhost:3000</code></p>
              <p className="info-note">Make sure both the backend server (port 3001) and frontend (port 3000) are running.</p>
            </div>
            <div className="step-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div>
                  <h3>Start the Backend Server</h3>
                  <p>Navigate to the <code>backend</code> folder and run:</p>
                  <pre><code>npm start</code></pre>
                  <p className="step-note">Server will run on http://localhost:3001</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div>
                  <h3>Start the Frontend Application</h3>
                  <p>Navigate to the <code>frontend</code> folder and run:</p>
                  <pre><code>npm start</code></pre>
                  <p className="step-note">Application will open in your browser at http://localhost:3000</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div>
                  <h3>Access the Website</h3>
                  <p>Your browser should automatically open to the login page. If not, manually navigate to:</p>
                  <pre><code>http://localhost:3000</code></pre>
                </div>
              </div>
            </div>
          </section>

          {/* Sign Up Section */}
          <section className="help-section">
            <div className="section-header">
              <UserPlus size={24} />
              <h2>Signing Up (Patient Registration)</h2>
            </div>
            <div className="warning-box">
              <AlertCircle size={20} />
              <div>
                <strong>Important:</strong> Currently, only <strong>Patient</strong> accounts can be created by users. Other roles (Doctor, Cashier, Admin) must be created by an administrator.
              </div>
            </div>
            <div className="step-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div>
                  <h3>Contact Your Administrator</h3>
                  <p>To create a patient account, you'll need to contact your hospital administrator. They will register your account in the system.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div>
                  <h3>Patient Self-Registration (If Available)</h3>
                  <p>If patient self-registration is enabled, look for a "Sign Up" or "Register" link on the login page.</p>
                  <p className="step-note">You'll need to provide:</p>
                  <ul>
                    <li>Email address</li>
                    <li>Password</li>
                    <li>Full name</li>
                    <li>Phone number (optional)</li>
                    <li>Address (optional)</li>
                    <li>Date of birth (optional)</li>
                  </ul>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div>
                  <h3>After Registration</h3>
                  <p>Once your account is created, you can log in using your email and password.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Login Section */}
          <section className="help-section">
            <div className="section-header">
              <LogIn size={24} />
              <h2>How to Sign In</h2>
            </div>
            <div className="step-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div>
                  <h3>Navigate to Login Page</h3>
                  <p>Go to <code>http://localhost:3000</code> or click the "Back to Login" button above.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div>
                  <h3>Enter Your Credentials</h3>
                  <div className="credentials-info">
                    <div className="credential-item">
                      <Mail size={18} />
                      <span><strong>Email or Username:</strong> Enter the email address or username associated with your account</span>
                    </div>
                    <div className="credential-item">
                      <Lock size={18} />
                      <span><strong>Password:</strong> Enter your account password</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div>
                  <h3>Click Sign In</h3>
                  <p>Press the "Sign In" button to access your dashboard.</p>
                </div>
              </div>
            </div>
            <div className="demo-credentials-box">
              <Key size={20} />
              <div>
                <h3>Demo Credentials</h3>
                <p>For testing purposes, you can use these demo accounts:</p>
                <table className="credentials-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Admin</strong></td>
                      <td>admin@hospital.com</td>
                      <td>admin123</td>
                    </tr>
                    <tr>
                      <td><strong>Doctor</strong></td>
                      <td>dr.williams@hospital.com</td>
                      <td>doctor123</td>
                    </tr>
                    <tr>
                      <td><strong>Cashier</strong></td>
                      <td>cashier1@hospital.com</td>
                      <td>cashier123</td>
                    </tr>
                    <tr>
                      <td><strong>Patient</strong></td>
                      <td>john.doe@example.com</td>
                      <td>patient123</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Troubleshooting Section */}
          <section className="help-section">
            <div className="section-header">
              <Bug size={24} />
              <h2>Common Problems & Solutions</h2>
            </div>
            <div className="problem-list">
              <div className="problem-item">
                <AlertCircle size={20} className="problem-icon" />
                <div>
                  <h3>Cannot Access the Website</h3>
                  <p><strong>Problem:</strong> The website doesn't load or shows connection errors.</p>
                  <p><strong>Solutions:</strong></p>
                  <ul>
                    <li>Ensure both backend (port 3001) and frontend (port 3000) servers are running</li>
                    <li>Check that no other applications are using ports 3000 or 3001</li>
                    <li>Try accessing <code>http://localhost:3000</code> directly in your browser</li>
                    <li>Clear your browser cache and try again</li>
                    <li>Check your firewall settings</li>
                  </ul>
                </div>
              </div>

              <div className="problem-item">
                <AlertCircle size={20} className="problem-icon" />
                <div>
                  <h3>Login Fails</h3>
                  <p><strong>Problem:</strong> Cannot log in with correct credentials.</p>
                  <p><strong>Solutions:</strong></p>
                  <ul>
                    <li>Verify you're using the correct email and password</li>
                    <li>Check if the backend server is running (http://localhost:3001)</li>
                    <li>Ensure your account exists in the database</li>
                    <li>Try the demo credentials listed above</li>
                    <li>Check browser console for error messages (F12)</li>
                  </ul>
                </div>
              </div>

              <div className="problem-item">
                <AlertCircle size={20} className="problem-icon" />
                <div>
                  <h3>Session Expired</h3>
                  <p><strong>Problem:</strong> Logged out unexpectedly or session expired.</p>
                  <p><strong>Solutions:</strong></p>
                  <ul>
                    <li>Simply log in again with your credentials</li>
                    <li>Clear browser localStorage if persistent issues occur</li>
                    <li>Check that your token hasn't expired (default: 24 hours)</li>
                  </ul>
                </div>
              </div>

              <div className="problem-item">
                <AlertCircle size={20} className="problem-icon" />
                <div>
                  <h3>Database Connection Errors</h3>
                  <p><strong>Problem:</strong> Backend shows database connection errors.</p>
                  <p><strong>Solutions:</strong></p>
                  <ul>
                    <li>Ensure MySQL server is running</li>
                    <li>Verify database credentials in <code>backend/.env</code> file</li>
                    <li>Check that the HMS database exists and tables are created</li>
                    <li>Run the DDL.sql and InsertDML.sql scripts if needed</li>
                  </ul>
                </div>
              </div>

              <div className="problem-item">
                <AlertCircle size={20} className="problem-icon" />
                <div>
                  <h3>Page Not Loading Properly</h3>
                  <p><strong>Problem:</strong> Blank page or styling issues.</p>
                  <p><strong>Solutions:</strong></p>
                  <ul>
                    <li>Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)</li>
                    <li>Clear browser cache and cookies</li>
                    <li>Ensure all dependencies are installed (<code>npm install</code>)</li>
                    <li>Check browser console for JavaScript errors</li>
                    <li>Try a different browser</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Browser Compatibility */}
          <section className="help-section">
            <div className="section-header">
              <Monitor size={24} />
              <h2>Browser & Device Compatibility</h2>
            </div>
            <div className="info-box">
              <p><strong>Recommended Browsers:</strong></p>
              <ul>
                <li>Google Chrome (latest version)</li>
                <li>Mozilla Firefox (latest version)</li>
                <li>Microsoft Edge (latest version)</li>
                <li>Safari (latest version)</li>
              </ul>
              <p className="info-note">For best experience, use a desktop or laptop computer with a modern browser.</p>
            </div>
          </section>

          {/* Security Tips */}
          <section className="help-section">
            <div className="section-header">
              <Shield size={24} />
              <h2>Security Tips</h2>
            </div>
            <div className="security-tips">
              <div className="tip-item">
                <Shield size={18} />
                <span>Never share your login credentials with anyone</span>
              </div>
              <div className="tip-item">
                <Shield size={18} />
                <span>Always log out when finished, especially on shared computers</span>
              </div>
              <div className="tip-item">
                <Shield size={18} />
                <span>Use strong passwords (mix of letters, numbers, and special characters)</span>
              </div>
              <div className="tip-item">
                <Shield size={18} />
                <span>Report any suspicious activity to your administrator</span>
              </div>
            </div>
          </section>

          {/* Contact Support */}
          <section className="help-section">
            <div className="section-header">
              <Mail size={24} />
              <h2>Still Need Help?</h2>
            </div>
            <div className="contact-box">
              <p>If you're still experiencing issues:</p>
              <ul>
                <li>Contact your system administrator</li>
                <li>Check the browser console (F12) for detailed error messages</li>
                <li>Review the README.md file in the project for setup instructions</li>
                <li>Ensure all prerequisites are installed (Node.js, MySQL, etc.)</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Help;


