import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceptable Use Policy — MiddleDoc',
  description: 'Rules governing the acceptable use of the MiddleDoc platform.',
}

export default function AcceptableUsePolicyPage() {
  return (
    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-li:text-neutral-700 prose-a:text-primary-600">
      <h1>Acceptable Use Policy</h1>
      <p className="text-sm text-neutral-500">Effective Date: June 30, 2026 &nbsp;|&nbsp; Last Updated: June 30, 2026</p>

      <p>
        This Acceptable Use Policy (&ldquo;AUP&rdquo;) governs your use of the MiddleDoc platform,
        including all features, APIs, and integrations (the &ldquo;Service&rdquo;). It is incorporated by
        reference into the MiddleDoc Terms of Service. Capitalized terms not defined here have
        the meanings given in the Terms of Service.
      </p>
      <p>
        MiddleDoc is a professional tool designed for legitimate document collection and
        e-signature workflows. We rely on all users to use the Service responsibly. Violation of
        this AUP may result in immediate suspension or termination of your account, without
        refund, and may be reported to law enforcement where appropriate.
      </p>

      <hr />

      <h2>1. Prohibited Content</h2>
      <p>
        You may not upload, transmit, store, or distribute through the Service any content that:
      </p>

      <h3>1.1 Is Illegal or Facilitates Illegal Activity</h3>
      <ul>
        <li>Violates any applicable federal, state, local, or international law or regulation</li>
        <li>Facilitates fraud, money laundering, tax evasion, or other financial crimes</li>
        <li>Constitutes or enables identity theft or impersonation</li>
        <li>Violates export control laws, sanctions regulations (including OFAC sanctions), or embargoes</li>
        <li>Infringes or misappropriates any patent, copyright, trademark, trade secret, or other intellectual property right</li>
        <li>Constitutes defamation, libel, or unlawful discrimination</li>
      </ul>

      <h3>1.2 Is Harmful or Dangerous</h3>
      <ul>
        <li>Contains malware, viruses, ransomware, Trojan horses, worms, spyware, adware, keyloggers, or any other malicious code</li>
        <li>Contains exploits, vulnerability probes, or attack tools targeting MiddleDoc systems or third parties</li>
        <li>Is designed to damage, disable, overburden, or impair any system, network, or service</li>
      </ul>

      <h3>1.3 Is Sexually Explicit or Abusive</h3>
      <ul>
        <li>Constitutes child sexual abuse material (CSAM) or any content that sexually exploits minors</li>
        <li>Is used to harass, threaten, bully, or intimidate any individual</li>
        <li>Constitutes non-consensual intimate imagery (&ldquo;revenge porn&rdquo;)</li>
      </ul>

      <h3>1.4 Violates Privacy Rights</h3>
      <ul>
        <li>Contains personal data of third parties collected without lawful basis or required consent</li>
        <li>Is uploaded in violation of applicable data protection laws (GDPR, CCPA, HIPAA, etc.)</li>
        <li>Constitutes unauthorized surveillance or tracking of individuals</li>
      </ul>

      <hr />

      <h2>2. Prohibited Activities</h2>
      <p>You may not use the Service to:</p>

      <h3>2.1 Unauthorized Access and Security Attacks</h3>
      <ul>
        <li>Attempt to gain unauthorized access to any MiddleDoc system, account, server, network, or data</li>
        <li>Access another user&apos;s account without explicit authorization from that user and MiddleDoc</li>
        <li>Conduct penetration testing, vulnerability scanning, or security research against MiddleDoc infrastructure without prior written authorization from our security team (see security@middledoc.com)</li>
        <li>Launch denial-of-service (DoS) or distributed denial-of-service (DDoS) attacks against any target</li>
        <li>Conduct man-in-the-middle attacks, session hijacking, or credential stuffing</li>
        <li>Exploit or attempt to exploit any security vulnerability in the Service</li>
      </ul>

      <h3>2.2 Reverse Engineering and Circumvention</h3>
      <ul>
        <li>Reverse engineer, decompile, disassemble, or attempt to derive source code from any part of the Service</li>
        <li>Circumvent, disable, or otherwise interfere with security features of the Service, including authentication mechanisms, access controls, or encryption</li>
        <li>Remove, obscure, or alter any copyright notice, trademark, or proprietary legend on the Service</li>
        <li>Create derivative works based on the Service software without express written permission</li>
      </ul>

      <h3>2.3 Automated Scraping and Bulk Data Extraction</h3>
      <ul>
        <li>Use automated bots, scrapers, spiders, or crawlers to extract data from the Service without prior written authorization</li>
        <li>Systematically download or cache Service content beyond normal browser caching</li>
        <li>Use the API in ways that exceed documented rate limits or circumvent rate limiting mechanisms</li>
      </ul>

      <h3>2.4 Spam and Abusive Communications</h3>
      <ul>
        <li>Use the email reminder system to send unsolicited bulk email (spam) to individuals who have not consented to receive communications from you</li>
        <li>Harvest email addresses from the Service for use in unsolicited communications</li>
        <li>Impersonate MiddleDoc, another user, or any person or entity in communications sent through the Service</li>
        <li>Send phishing or social engineering communications through the document request system</li>
      </ul>

      <h3>2.5 Resource Abuse</h3>
      <ul>
        <li>Upload files for purposes unrelated to document collection (e.g., using MiddleDoc as a general-purpose file hosting service)</li>
        <li>Use the Service in a manner that disproportionately burdens shared infrastructure and degrades performance for other users</li>
        <li>Create multiple free accounts to circumvent plan limits (limit cycling)</li>
        <li>Resell access to the Service to third parties without an authorized reseller agreement with MiddleDoc</li>
      </ul>

      <h3>2.6 Interference with the Service</h3>
      <ul>
        <li>Introduce any content or code that disrupts, modifies, or interferes with the Service&apos;s normal operation</li>
        <li>Conduct load testing against MiddleDoc production infrastructure without prior written approval</li>
        <li>Intercept or redirect network traffic associated with the Service</li>
      </ul>

      <hr />

      <h2>3. Account Responsibility</h2>
      <p>
        You are responsible for all activity that occurs under your account, including the
        activity of anyone you invite to your team, and the documents uploaded by clients using
        your share links. You must:
      </p>
      <ul>
        <li>Keep your account credentials confidential and not share your password with others</li>
        <li>Use strong, unique passwords and enable any multi-factor authentication options when available</li>
        <li>Promptly notify MiddleDoc at hello@middledoc.com if you believe your account has been compromised</li>
        <li>Ensure that all team members you add comply with this AUP</li>
        <li>Ensure that clients uploading documents via your share links have been appropriately notified of the platform&apos;s terms and privacy practices</li>
        <li>Not grant account access to individuals whose purpose you know or suspect to be abusive or harmful</li>
      </ul>

      <hr />

      <h2>4. Compliance with Laws</h2>
      <p>
        You are solely responsible for ensuring that your use of the Service complies with all
        laws and regulations applicable to you and your clients, including but not limited to:
      </p>
      <ul>
        <li>Data protection laws (GDPR, CCPA/CPRA, PIPEDA, POPIA, etc.)</li>
        <li>Healthcare privacy laws (HIPAA, if you handle protected health information)</li>
        <li>Financial regulations applicable to your professional practice</li>
        <li>Electronic signature laws in your jurisdiction</li>
        <li>Professional licensing and ethics rules governing your practice area</li>
      </ul>
      <p>
        MiddleDoc is not a HIPAA Business Associate by default. If you handle Protected Health
        Information (PHI) and are subject to HIPAA, you must execute a Business Associate
        Agreement (BAA) with MiddleDoc before using the Service for PHI. Contact
        hello@middledoc.com to request a BAA.
      </p>

      <hr />

      <h2>5. Reporting Violations</h2>
      <p>
        If you become aware of content or activity on the Service that appears to violate this
        AUP, please report it promptly to:
      </p>
      <address className="not-italic">
        <strong>MiddleDoc Trust &amp; Safety</strong><br />
        Email: <a href="mailto:hello@middledoc.com">hello@middledoc.com</a><br />
        Subject: &ldquo;AUP Violation Report&rdquo;
      </address>
      <p>
        Include a description of the suspected violation, the URL or account involved (if known),
        and any supporting evidence. We will investigate all credible reports and take appropriate
        action. We may not be able to disclose the outcome of investigations due to privacy
        considerations.
      </p>
      <p>
        To report child sexual abuse material (CSAM), contact us immediately and also report
        directly to the National Center for Missing and Exploited Children (NCMEC) at
        cybertipline.org or by calling 1-800-843-5678.
      </p>

      <hr />

      <h2>6. Consequences of Violation</h2>
      <p>
        If we determine or reasonably suspect that you have violated this AUP, we may, in our
        sole discretion and without limiting other remedies:
      </p>
      <ul>
        <li><strong>Issue a warning</strong> and require remediation within a specified time</li>
        <li><strong>Temporarily suspend</strong> your account or specific features pending investigation</li>
        <li><strong>Permanently terminate</strong> your account without refund</li>
        <li><strong>Remove</strong> offending content from the Service</li>
        <li><strong>Report</strong> suspected illegal activity to law enforcement, regulatory authorities, or affected parties</li>
        <li><strong>Pursue legal action</strong> for damages or injunctive relief where appropriate</li>
        <li><strong>Cooperate</strong> with law enforcement investigations and disclose information pursuant to lawful requests</li>
      </ul>
      <p>
        For minor or first-time violations, we will typically provide notice and an opportunity to
        cure before imposing sanctions, unless the violation poses an immediate security threat or
        is clearly illegal.
      </p>

      <hr />

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this AUP from time to time. Changes will be posted at
        middledoc.com/legal/acceptable-use with an updated effective date. Material changes will
        be communicated to account holders by email at least 14 days before taking effect.
      </p>

      <hr />

      <h2>8. Contact</h2>
      <address className="not-italic">
        <strong>MiddleDoc</strong><br />
        Email: <a href="mailto:hello@middledoc.com">hello@middledoc.com</a><br />
        Website: <a href="https://middledoc.com">middledoc.com</a>
      </address>
    </article>
  )
}
