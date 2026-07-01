import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security Policy — MiddleDoc',
  description: 'How MiddleDoc secures your documents, data, and account.',
}

export default function SecurityPolicyPage() {
  return (
    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-li:text-neutral-700 prose-a:text-primary-600">
      <h1>Security Policy</h1>
      <p className="text-sm text-neutral-500">Effective Date: June 30, 2026 &nbsp;|&nbsp; Last Updated: June 30, 2026</p>

      <p>
        MiddleDoc is built to handle sensitive professional documents — tax records, legal files,
        HR data, healthcare paperwork. Security is foundational to our product, not an
        afterthought. This page describes the security controls, practices, and commitments
        we maintain to protect your data.
      </p>

      <hr />

      <h2>1. Encryption</h2>

      <h3>1.1 Data in Transit</h3>
      <p>
        All data transmitted between your browser and MiddleDoc servers is encrypted using
        <strong> TLS 1.3</strong> (Transport Layer Security). We enforce HTTPS across all
        endpoints. HTTP connections are automatically redirected to HTTPS. Older TLS versions
        (1.0, 1.1) and weak cipher suites are disabled. Our TLS configuration is validated
        against current industry standards.
      </p>

      <h3>1.2 Data at Rest</h3>
      <p>
        All documents and files stored in MiddleDoc are encrypted at rest using
        <strong> AES-256 encryption</strong> on Cloudflare R2 object storage. Cloudflare R2
        uses server-side encryption (SSE) with AES-256 keys managed through Cloudflare&apos;s key
        management infrastructure.
      </p>
      <p>
        Database records are stored on encrypted volumes. Encryption keys are managed separately
        from the data they protect.
      </p>

      <h3>1.3 Password Storage</h3>
      <p>
        User passwords are <strong>never stored in plaintext</strong>. All passwords are hashed
        using <strong>bcrypt</strong> with an appropriate cost factor before storage. We cannot
        retrieve your plaintext password and neither can anyone who gains access to our database.
      </p>

      <h3>1.4 Authentication Tokens</h3>
      <p>
        Session authentication uses <strong>JSON Web Tokens (JWT)</strong> stored exclusively
        in httpOnly, Secure, SameSite=Strict cookies. JWT tokens cannot be accessed via
        JavaScript, making them immune to cross-site scripting (XSS) token theft. Tokens have
        defined expiry times and are invalidated on logout.
      </p>

      <hr />

      <h2>2. Infrastructure Security</h2>

      <h3>2.1 Hosting — Render</h3>
      <p>
        MiddleDoc&apos;s application servers and background job processors run on
        <strong> Render</strong> (render.com), a managed cloud platform that provides:
      </p>
      <ul>
        <li>Isolated compute environments per service</li>
        <li>Automatic TLS certificate management and renewal</li>
        <li>Private networking between internal services</li>
        <li>Continuous deployment with rollback capability</li>
        <li>SOC 2 Type II compliance at the infrastructure layer</li>
      </ul>

      <h3>2.2 Network Security — Cloudflare</h3>
      <p>
        All traffic to middledoc.com passes through <strong>Cloudflare</strong>&apos;s global
        network before reaching our application servers. Cloudflare provides:
      </p>
      <ul>
        <li><strong>Web Application Firewall (WAF):</strong> Protection against OWASP Top 10 vulnerabilities including SQL injection, XSS, and CSRF</li>
        <li><strong>DDoS protection:</strong> Anycast network absorbs and mitigates volumetric DDoS attacks at the network edge</li>
        <li><strong>Bot management:</strong> Detection and blocking of malicious automated traffic</li>
        <li><strong>Rate limiting:</strong> Configurable request rate limits per IP and endpoint</li>
        <li><strong>API Shield:</strong> Schema validation and anomaly detection for API endpoints</li>
        <li><strong>TLS termination:</strong> Industry-leading TLS configuration at the edge</li>
      </ul>

      <h3>2.3 Document Storage — Cloudflare R2</h3>
      <p>
        Uploaded documents are stored in <strong>Cloudflare R2</strong> object storage.
        Documents are not publicly accessible — all access is authenticated and authorized
        through the MiddleDoc API. Pre-signed download URLs expire within a short time window
        (15 minutes) and are generated per-request. Files are stored with AES-256 encryption
        and Cloudflare&apos;s infrastructure-level redundancy.
      </p>

      <h3>2.4 Database Security</h3>
      <p>
        MiddleDoc&apos;s PostgreSQL database:
      </p>
      <ul>
        <li>Accepts connections only over encrypted TLS channels</li>
        <li>Is not directly exposed to the public internet</li>
        <li>Uses connection pooling with configured pool limits to prevent resource exhaustion</li>
        <li>Has automated backup with point-in-time recovery capability</li>
        <li>Is protected by network-level firewall rules restricting access to authorized application servers only</li>
      </ul>

      <hr />

      <h2>3. Access Controls</h2>

      <h3>3.1 Application-Level RBAC</h3>
      <p>MiddleDoc enforces role-based access control (RBAC) at the API level:</p>
      <ul>
        <li><strong>Owner:</strong> Full access to all organization data, billing, and team management</li>
        <li><strong>Admin:</strong> Full access to clients, documents, and requests; can manage team members</li>
        <li><strong>Member:</strong> Access restricted to assigned clients and groups only; cannot access clients outside their assignments</li>
      </ul>
      <p>
        Every API request is authenticated and authorization is checked before any data is
        returned. There are no &ldquo;publicly readable&rdquo; endpoints for authenticated user data.
        Client portal access uses separate, one-time or time-limited share tokens that are
        scoped to specific document requests only.
      </p>

      <h3>3.2 Admin Panel Isolation</h3>
      <p>
        The MiddleDoc administrative panel (for MiddleDoc staff only) is a separate application
        with separate authentication, separate JWT audience scoping, and 8-hour session limits.
        Admin credentials are distinct from user-facing credentials.
      </p>

      <h3>3.3 Production System Access</h3>
      <p>
        Access to MiddleDoc&apos;s production infrastructure is restricted to authorized personnel.
        Multi-factor authentication (MFA) is required for all production system access.
        We apply the principle of least privilege — personnel are granted only the minimum
        permissions required to perform their duties.
      </p>

      <h3>3.4 Audit Logging</h3>
      <p>
        MiddleDoc maintains an audit log of significant account events including:
      </p>
      <ul>
        <li>Login and logout events</li>
        <li>Document uploads, downloads, deletions, and rejections</li>
        <li>E-signature events</li>
        <li>User and team management changes</li>
        <li>Billing and plan changes</li>
        <li>API access by admin users</li>
      </ul>
      <p>
        Audit logs are immutable and retained for compliance purposes. Account holders on paid
        plans can view their audit log from the admin panel.
      </p>

      <hr />

      <h2>4. Application Security</h2>

      <h3>4.1 OWASP Top 10 Protection</h3>
      <p>
        Our development practices and infrastructure controls address the OWASP Top 10 web
        application security risks:
      </p>
      <ul>
        <li><strong>Injection (SQL, command):</strong> Parameterized queries and ORM use throughout; no string-concatenated SQL</li>
        <li><strong>Broken authentication:</strong> httpOnly JWT cookies; bcrypt password hashing; brute-force rate limiting</li>
        <li><strong>Sensitive data exposure:</strong> TLS 1.3 in transit; AES-256 at rest; no sensitive data in URLs or logs</li>
        <li><strong>XSS:</strong> Output encoding; Content Security Policy headers; httpOnly cookies prevent token theft</li>
        <li><strong>CSRF:</strong> SameSite=Strict cookies; CSRF token validation on state-changing requests</li>
        <li><strong>Security misconfiguration:</strong> Regular security audits; automated dependency scanning</li>
        <li><strong>Broken access control:</strong> RBAC enforced at API layer for every request</li>
        <li><strong>Insecure deserialization:</strong> No use of unsafe deserialization methods</li>
        <li><strong>Using components with known vulnerabilities:</strong> Automated dependency vulnerability scanning in CI/CD</li>
        <li><strong>Insufficient logging:</strong> Comprehensive audit logs with alerting</li>
      </ul>

      <h3>4.2 File Upload Security</h3>
      <p>
        Uploaded files are processed through the following security controls:
      </p>
      <ul>
        <li>File size limits enforced per upload and per account plan</li>
        <li>MIME type validation (both header and content-based)</li>
        <li>Uploaded files are stored in isolated object storage, not served from the same origin as the application</li>
        <li>File contents are not executed; they are stored as binary data and downloaded only</li>
      </ul>

      <h3>4.3 Security Headers</h3>
      <p>MiddleDoc sets the following HTTP security response headers:</p>
      <ul>
        <li><code>Strict-Transport-Security (HSTS)</code> — enforces HTTPS</li>
        <li><code>X-Content-Type-Options: nosniff</code> — prevents MIME sniffing</li>
        <li><code>X-Frame-Options: DENY</code> — prevents clickjacking</li>
        <li><code>Content-Security-Policy</code> — restricts content sources</li>
        <li><code>Referrer-Policy: strict-origin-when-cross-origin</code></li>
        <li><code>Permissions-Policy</code> — restricts browser feature access</li>
      </ul>

      <hr />

      <h2>5. Data Isolation and Multi-Tenancy</h2>
      <p>
        MiddleDoc is a multi-tenant SaaS application. Customer data is logically isolated:
      </p>
      <ul>
        <li>Every database query is scoped to the authenticated user&apos;s organization using a tenant ID filter enforced at the API level</li>
        <li>Cross-tenant data access is architecturally prevented — an account holder cannot retrieve or enumerate another account holder&apos;s clients, documents, or metadata</li>
        <li>Team member access within an organization is further restricted by group assignments enforced at every data retrieval endpoint</li>
        <li>Client portal share tokens are one-time or expiring tokens that are scoped to a single document request, not to an entire account</li>
      </ul>

      <hr />

      <h2>6. Incident Response</h2>

      <h3>6.1 Detection</h3>
      <p>
        We monitor our systems for anomalous activity using server-side log analysis and
        infrastructure-level alerts. Cloudflare provides real-time threat detection at the
        network edge.
      </p>

      <h3>6.2 Response</h3>
      <p>
        MiddleDoc maintains a documented incident response plan. Upon detection of a potential
        security incident:
      </p>
      <ol>
        <li><strong>Triage:</strong> Assess the nature, scope, and severity of the incident</li>
        <li><strong>Containment:</strong> Isolate affected systems or accounts to prevent further impact</li>
        <li><strong>Investigation:</strong> Determine the root cause and extent of any data exposure</li>
        <li><strong>Remediation:</strong> Fix the vulnerability and restore service</li>
        <li><strong>Notification:</strong> Notify affected users and, where required by law, regulatory authorities. For personal data breaches, affected customers are notified within 72 hours of confirmed impact on their data</li>
        <li><strong>Post-incident review:</strong> Document lessons learned and implement preventive measures</li>
      </ol>

      <h3>6.3 Business Continuity</h3>
      <p>
        Our infrastructure is designed for resilience. We maintain automated database backups
        with regular restoration testing. Application deployments use zero-downtime strategies.
        Incident playbooks are maintained for common failure scenarios.
      </p>

      <hr />

      <h2>7. Vulnerability Disclosure Program</h2>
      <p>
        MiddleDoc welcomes responsible security research. If you believe you have found a
        security vulnerability in our platform, please report it to us before public disclosure.
      </p>

      <h3>7.1 How to Report</h3>
      <address className="not-italic not-prose">
        <p className="text-neutral-700">Email: <a href="mailto:hello@middledoc.com" className="text-primary-600 hover:underline">hello@middledoc.com</a></p>
        <p className="text-neutral-700">Subject: &ldquo;Security Vulnerability Report&rdquo;</p>
      </address>
      <p>
        Please include in your report:
      </p>
      <ul>
        <li>A description of the vulnerability and its potential impact</li>
        <li>Step-by-step instructions to reproduce the issue</li>
        <li>Any proof-of-concept code (please do not exploit data belonging to other users)</li>
        <li>Your contact information for follow-up</li>
      </ul>

      <h3>7.2 Our Commitment to Reporters</h3>
      <ul>
        <li>We will acknowledge receipt of your report within 3 business days</li>
        <li>We will provide an initial assessment within 10 business days</li>
        <li>We will keep you informed of our progress in addressing the issue</li>
        <li>We will not take legal action against researchers who comply with this responsible disclosure policy</li>
        <li>We will credit reporters in our changelog (with your permission)</li>
      </ul>

      <h3>7.3 Out of Scope</h3>
      <p>The following are outside the scope of our vulnerability disclosure program:</p>
      <ul>
        <li>Social engineering or phishing attacks against MiddleDoc employees or users</li>
        <li>Physical security issues</li>
        <li>Denial of service attacks</li>
        <li>Scanning or testing without prior authorization that affects service availability</li>
        <li>Vulnerabilities in third-party services we use that are the responsibility of those service providers</li>
        <li>Reports that require access to another user&apos;s account without their consent</li>
      </ul>

      <hr />

      <h2>8. Third-Party Security</h2>
      <p>
        We assess the security practices of all significant third-party service providers before
        engaging them. Key providers relevant to data security:
      </p>
      <ul>
        <li><strong>Cloudflare:</strong> SOC 2 Type II, ISO 27001 certified. Provides edge security, WAF, and storage.</li>
        <li><strong>Render:</strong> SOC 2 Type II certified hosting provider.</li>
        <li><strong>OpenAI:</strong> Processes document content for AI classification under API data handling terms that restrict training use.</li>
        <li><strong>Anthropic:</strong> Processes document content for AI classification under equivalent API data handling terms.</li>
        <li><strong>SendGrid (Twilio):</strong> ISO 27001 and SOC 2 Type II certified email delivery provider.</li>
        <li><strong>Stripe:</strong> PCI DSS Level 1 certified payment processor. Payment data never touches MiddleDoc servers.</li>
      </ul>

      <hr />

      <h2>9. Compliance Roadmap</h2>
      <p>
        MiddleDoc is committed to continuous improvement of our security posture. Our current and
        planned compliance milestones:
      </p>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-neutral-50">
            <th className="text-left p-3 border border-neutral-200 font-semibold">Framework / Certification</th>
            <th className="text-left p-3 border border-neutral-200 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['GDPR compliance (data processing and user rights)', 'Implemented — Privacy Policy, DPA, data export, account deletion'],
            ['CCPA/CPRA compliance', 'Implemented — California rights in Privacy Policy'],
            ['ESIGN Act / UETA (e-signature validity)', 'Implemented — audit trail, disclosure, consent'],
            ['OWASP Top 10 mitigations', 'Implemented — verified through security audits'],
            ['Security audit program', 'Active — 48 findings resolved across 2 audit cycles; ongoing'],
            ['SOC 2 Type II certification', 'In planning — target initiation within 12 months of launch'],
            ['HIPAA Business Associate Agreement (BAA)', 'Available upon request — contact hello@middledoc.com'],
            ['ISO 27001 certification', 'Future roadmap — post Series A'],
            ['SSO / SAML / OIDC', 'Future roadmap — Enterprise plan'],
            ['Penetration testing (third-party)', 'Planned — annual schedule post-launch'],
          ].map(([framework, status], i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
              <td className="p-3 border border-neutral-200">{framework}</td>
              <td className="p-3 border border-neutral-200 text-neutral-600">{status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      <h2>10. Security Best Practices for Users</h2>
      <p>You can further protect your MiddleDoc account by following these practices:</p>
      <ul>
        <li>Use a strong, unique password for your MiddleDoc account (minimum 12 characters with a mix of letters, numbers, and symbols)</li>
        <li>Do not share your password or account credentials with others</li>
        <li>Log out of your account when using shared or public computers</li>
        <li>Be cautious of phishing emails claiming to be from MiddleDoc — we will never ask for your password by email</li>
        <li>Review your team member access settings regularly and remove access for departed employees promptly</li>
        <li>Contact us immediately if you suspect unauthorized access to your account</li>
      </ul>

      <hr />

      <h2>11. Security Contact</h2>
      <p>
        For security questions, vulnerability reports, or HIPAA BAA requests:
      </p>
      <address className="not-italic">
        <strong>MiddleDoc Security Team</strong><br />
        Email: <a href="mailto:hello@middledoc.com">hello@middledoc.com</a><br />
        Subject: &ldquo;Security Inquiry&rdquo; or &ldquo;Security Vulnerability Report&rdquo;<br />
        Website: <a href="https://middledoc.com">middledoc.com</a>
      </address>
      <p>
        We take all security reports seriously and will respond as quickly as possible.
      </p>
    </article>
  )
}
