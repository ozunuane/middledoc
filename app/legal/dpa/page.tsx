import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Processing Agreement — MiddleDoc',
  description: 'GDPR Article 28 Data Processing Agreement for MiddleDoc business customers.',
}

export default function DPAPage() {
  return (
    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-li:text-neutral-700 prose-a:text-primary-600">
      <h1>Data Processing Agreement</h1>
      <p className="text-sm text-neutral-500">Effective Date: June 30, 2026 &nbsp;|&nbsp; Last Updated: June 30, 2026</p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 not-prose mb-8">
        <p className="text-sm text-amber-800 font-medium mb-1">For Business Customers</p>
        <p className="text-sm text-amber-700">
          This Data Processing Agreement (&ldquo;DPA&rdquo;) is entered into by MiddleDoc and any business
          customer (&ldquo;Customer&rdquo;) who accepts the MiddleDoc Terms of Service and uses the Service
          to process personal data of their own clients or employees. This DPA forms part of the
          agreement between MiddleDoc and Customer and is effective upon Customer&apos;s acceptance of
          the Terms of Service. If you require a countersigned DPA with your company name, contact
          hello@middledoc.com.
        </p>
      </div>

      <hr />

      <h2>1. Definitions</h2>
      <p>As used in this DPA:</p>
      <ul>
        <li><strong>&ldquo;Controller&rdquo;</strong> means the natural or legal person who determines the purposes and means of processing personal data. Customer is the Controller of End-User Personal Data.</li>
        <li><strong>&ldquo;Processor&rdquo;</strong> means the entity that processes personal data on behalf of the Controller. MiddleDoc is the Processor.</li>
        <li><strong>&ldquo;End-User Personal Data&rdquo;</strong> means personal data that Customer&apos;s clients or employees upload to or through the Service.</li>
        <li><strong>&ldquo;GDPR&rdquo;</strong> means Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 and, where applicable, the equivalent UK GDPR.</li>
        <li><strong>&ldquo;Sub-Processor&rdquo;</strong> means any third party appointed by MiddleDoc to process personal data in connection with the Service.</li>
        <li><strong>&ldquo;Data Subject&rdquo;</strong> means the individual to whom personal data relates.</li>
        <li><strong>&ldquo;Security Incident&rdquo;</strong> means a confirmed breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, personal data.</li>
        <li><strong>&ldquo;SCCs&rdquo;</strong> means the Standard Contractual Clauses for the transfer of personal data to third countries pursuant to GDPR, as issued by the European Commission in June 2021.</li>
        <li>All other defined terms have the meanings given in the MiddleDoc Terms of Service or the GDPR.</li>
      </ul>

      <hr />

      <h2>2. Roles of the Parties</h2>
      <p>
        <strong>2.1</strong> Customer is the Controller in respect of End-User Personal Data processed through the Service. Customer determines the purposes for which personal data is collected from its clients (e.g., collecting tax documents, HR records, legal documents) and instructs MiddleDoc on how to process that data through its configuration of the Service.
      </p>
      <p>
        <strong>2.2</strong> MiddleDoc is the Processor of End-User Personal Data. MiddleDoc processes such data only in accordance with Customer&apos;s documented instructions, as set out in this DPA and the Terms of Service, except where applicable law requires otherwise.
      </p>
      <p>
        <strong>2.3</strong> MiddleDoc is the Controller of account registration data (name, email, billing information) of Customer&apos;s authorized users. This data is processed pursuant to MiddleDoc&apos;s Privacy Policy.
      </p>

      <hr />

      <h2>3. Details of Processing</h2>

      <h3>3.1 Subject Matter</h3>
      <p>
        The processing of personal data by MiddleDoc on behalf of Customer in connection with the
        provision of the document collection, AI classification, and e-signature platform.
      </p>

      <h3>3.2 Duration</h3>
      <p>
        The term of the agreement between MiddleDoc and Customer (including any renewal periods)
        plus any post-termination period during which MiddleDoc retains data subject to the
        retention provisions of this DPA.
      </p>

      <h3>3.3 Nature and Purpose of Processing</h3>
      <ul>
        <li>Storing uploaded documents on behalf of Customer</li>
        <li>Transmitting uploaded documents to AI classification services (OpenAI/Anthropic) when the feature is enabled by Customer</li>
        <li>Generating and embedding electronic signature audit trails in PDF documents</li>
        <li>Sending email notifications and reminders to Client&apos;s clients on Customer&apos;s behalf via SendGrid</li>
        <li>Providing Customer with document management, organization, and search functionality</li>
        <li>Maintaining logs and audit trails for compliance purposes</li>
      </ul>

      <h3>3.4 Types of Personal Data</h3>
      <ul>
        <li>Names and email addresses of Customer&apos;s clients (end users of the portal)</li>
        <li>Content of documents uploaded by Customer&apos;s clients (which may include identity documents, financial records, health records, legal documents, and other personal data depending on Customer&apos;s use case)</li>
        <li>Electronic signature data: signer name, email address, IP address, timestamp</li>
        <li>IP addresses and access logs generated when Customer&apos;s clients access the portal</li>
      </ul>

      <h3>3.5 Categories of Data Subjects</h3>
      <ul>
        <li>Customer&apos;s clients who upload documents via the MiddleDoc portal</li>
        <li>Individuals referenced in documents uploaded to the Service</li>
        <li>Individuals who sign documents via the e-signature feature</li>
      </ul>

      <hr />

      <h2>4. Customer Obligations</h2>
      <p>Customer represents and warrants that:</p>
      <ul>
        <li>Customer has a valid legal basis under applicable data protection law for collecting and processing End-User Personal Data and for instructing MiddleDoc to process it</li>
        <li>Customer has provided all required notices to, and obtained all required consents from, Data Subjects whose personal data will be processed through the Service</li>
        <li>Customer&apos;s instructions to MiddleDoc comply with applicable law</li>
        <li>Customer will promptly inform MiddleDoc if Customer believes any MiddleDoc instruction or action would violate applicable data protection law</li>
      </ul>

      <hr />

      <h2>5. MiddleDoc&apos;s Obligations as Processor</h2>
      <p>MiddleDoc agrees to:</p>
      <ul>
        <li>
          <strong>Process only on instruction:</strong> Process End-User Personal Data only in accordance with Customer&apos;s documented instructions (as reflected in these Terms and DPA) and not for any other purpose, except where required by applicable law.
        </li>
        <li>
          <strong>Confidentiality:</strong> Ensure that persons authorized to process End-User Personal Data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality.
        </li>
        <li>
          <strong>Security:</strong> Implement and maintain the technical and organizational security measures described in Section 7 of this DPA.
        </li>
        <li>
          <strong>Sub-Processor management:</strong> Engage Sub-Processors only as described in Section 6 and impose equivalent data protection obligations on them.
        </li>
        <li>
          <strong>Data Subject rights assistance:</strong> Assist Customer in fulfilling its obligations to respond to Data Subject requests as described in Section 9.
        </li>
        <li>
          <strong>Breach notification:</strong> Notify Customer of Security Incidents as described in Section 8.
        </li>
        <li>
          <strong>DPIA assistance:</strong> Assist Customer in ensuring compliance with obligations regarding data protection impact assessments (DPIAs) and prior consultation, taking into account the nature of processing and information available to MiddleDoc.
        </li>
        <li>
          <strong>Deletion or return:</strong> At Customer&apos;s option, delete or return all End-User Personal Data upon termination of the agreement, subject to Section 11.
        </li>
        <li>
          <strong>Audit cooperation:</strong> Make available to Customer all information necessary to demonstrate compliance with GDPR Article 28 obligations and allow for and contribute to audits as described in Section 10.
        </li>
        <li>
          <strong>Notification of unlawful instructions:</strong> Inform Customer promptly if, in MiddleDoc&apos;s reasonable opinion, any instruction from Customer infringes GDPR or applicable data protection law.
        </li>
      </ul>

      <hr />

      <h2>6. Sub-Processors</h2>

      <h3>6.1 Authorization</h3>
      <p>
        Customer grants MiddleDoc general written authorization to engage the Sub-Processors
        listed in the table below. MiddleDoc will impose data protection obligations on each
        Sub-Processor equivalent to those imposed on MiddleDoc by this DPA.
      </p>

      <h3>6.2 Approved Sub-Processors</h3>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-neutral-50">
            <th className="text-left p-3 border border-neutral-200 font-semibold">Sub-Processor</th>
            <th className="text-left p-3 border border-neutral-200 font-semibold">Processing Activity</th>
            <th className="text-left p-3 border border-neutral-200 font-semibold">Data Location</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Cloudflare, Inc.', 'CDN, DNS, DDoS protection; document object storage (R2)', 'USA (global edge network)'],
            ['Render Services, Inc.', 'Application server hosting, background job processing', 'USA'],
            ['OpenAI, L.L.C.', 'AI document classification (when feature is enabled)', 'USA'],
            ['Anthropic, PBC', 'AI document classification — alternative provider (when feature is enabled)', 'USA'],
            ['Twilio Inc. (SendGrid)', 'Transactional email delivery', 'USA'],
            ['Stripe, Inc.', 'Payment processing (US/international customers)', 'USA'],
            ['Paystack (Stripe subsidiary)', 'Payment processing (African market customers)', 'Nigeria / USA'],
            ['PostgreSQL hosting provider', 'Relational database (structured account and metadata storage)', 'USA'],
          ].map(([sp, activity, location], i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
              <td className="p-3 border border-neutral-200 font-medium">{sp}</td>
              <td className="p-3 border border-neutral-200">{activity}</td>
              <td className="p-3 border border-neutral-200 text-neutral-500">{location}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>6.3 Changes to Sub-Processors</h3>
      <p>
        MiddleDoc will provide Customer with at least 30 days&apos; prior written notice (via email to
        the Customer&apos;s account email or via notification in the platform) before adding or
        replacing any Sub-Processor. Customer may object to a new Sub-Processor within 14 days
        of notice on reasonable data protection grounds by emailing hello@middledoc.com. If
        MiddleDoc cannot accommodate the objection without materially affecting the Service,
        either party may terminate the agreement with 30 days&apos; written notice without penalty.
      </p>

      <hr />

      <h2>7. Security Measures</h2>
      <p>
        MiddleDoc implements and maintains the following technical and organizational security
        measures to protect End-User Personal Data:
      </p>

      <h3>7.1 Encryption</h3>
      <ul>
        <li>All data in transit is encrypted using TLS 1.3 or higher</li>
        <li>Documents stored at rest are encrypted using AES-256 on Cloudflare R2</li>
        <li>Database connections use encrypted channels</li>
      </ul>

      <h3>7.2 Access Controls</h3>
      <ul>
        <li>Role-based access control (RBAC) is enforced at both application and API levels</li>
        <li>Access to production systems is restricted to authorized personnel</li>
        <li>Multi-factor authentication is required for production infrastructure access</li>
        <li>Principle of least privilege is applied to all system and employee access</li>
      </ul>

      <h3>7.3 Data Isolation</h3>
      <ul>
        <li>Customer data is logically isolated from other customers&apos; data at the application layer</li>
        <li>All API endpoints enforce ownership checks ensuring users can only access their own organization&apos;s data</li>
        <li>Group-based access controls limit team member visibility to assigned clients only</li>
      </ul>

      <h3>7.4 Infrastructure Security</h3>
      <ul>
        <li>Cloudflare WAF (Web Application Firewall) protects against common web vulnerabilities</li>
        <li>DDoS protection is provided at the network edge by Cloudflare</li>
        <li>Regular security audits are performed; findings are remediated according to risk severity</li>
        <li>Software dependencies are monitored for known vulnerabilities</li>
      </ul>

      <h3>7.5 Organizational Measures</h3>
      <ul>
        <li>Personnel with access to personal data are trained on data protection obligations</li>
        <li>Data protection considerations are incorporated into product development processes</li>
        <li>An incident response plan is maintained and tested regularly</li>
      </ul>

      <hr />

      <h2>8. Security Incident (Data Breach) Notification</h2>
      <p>
        <strong>8.1</strong> MiddleDoc will notify Customer without undue delay and in any event
        within <strong>72 hours</strong> of becoming aware of a Security Incident affecting
        End-User Personal Data. Notification will be sent to the email address associated with
        Customer&apos;s MiddleDoc account.
      </p>
      <p>
        <strong>8.2</strong> The notification will include, to the extent then known:
      </p>
      <ul>
        <li>A description of the nature of the Security Incident including categories and approximate number of Data Subjects and records concerned</li>
        <li>The name and contact details of MiddleDoc&apos;s data protection contact</li>
        <li>The likely consequences of the Security Incident</li>
        <li>Measures taken or proposed to address the Security Incident</li>
      </ul>
      <p>
        <strong>8.3</strong> MiddleDoc may provide initial notification with information available
        at the time and supplement it as additional information becomes available.
      </p>
      <p>
        <strong>8.4</strong> Customer is responsible for notifying Data Subjects and relevant
        supervisory authorities as required by applicable law. MiddleDoc will cooperate
        reasonably with Customer in connection with such notifications.
      </p>

      <hr />

      <h2>9. Data Subject Rights Assistance</h2>
      <p>
        <strong>9.1</strong> MiddleDoc provides Customer with the following tools to assist in
        responding to Data Subject requests:
      </p>
      <ul>
        <li>Account holders can export all their data (including client data and documents) via Settings &gt; Account &gt; Export Data</li>
        <li>Account holders can delete their accounts and associated data via Settings &gt; Account &gt; Delete Account</li>
        <li>Individual documents can be deleted from the document browser</li>
      </ul>
      <p>
        <strong>9.2</strong> To the extent Customer cannot fulfill a Data Subject request using
        the tools above, Customer may request MiddleDoc&apos;s assistance by emailing
        hello@middledoc.com. MiddleDoc will provide assistance within a commercially reasonable
        time. MiddleDoc may charge a fee for assistance beyond the standard tooling where
        permitted by applicable law.
      </p>
      <p>
        <strong>9.3</strong> Customer is the primary point of contact for Data Subjects whose
        personal data is processed through the Service. MiddleDoc will, where it receives a
        direct Data Subject request, redirect the Data Subject to Customer unless MiddleDoc is
        legally required to respond directly.
      </p>

      <hr />

      <h2>10. Audit Rights</h2>
      <p>
        <strong>10.1</strong> MiddleDoc will make available to Customer, upon written request,
        all information reasonably necessary to demonstrate MiddleDoc&apos;s compliance with its
        obligations under this DPA, including this DPA itself, MiddleDoc&apos;s security policies,
        and any relevant third-party certifications or audit reports (under appropriate
        confidentiality obligations).
      </p>
      <p>
        <strong>10.2</strong> Customer may, no more than once per calendar year and with at
        least 60 days&apos; prior written notice, request an audit of MiddleDoc&apos;s data processing
        practices relevant to this DPA, conducted by Customer or a mutually agreed third-party
        auditor under confidentiality obligations. Such audits must be conducted during normal
        business hours and in a manner that minimizes disruption to MiddleDoc&apos;s operations.
        Customer bears the costs of such audits unless the audit reveals material non-compliance
        by MiddleDoc.
      </p>
      <p>
        <strong>10.3</strong> MiddleDoc may satisfy audit requests by providing relevant
        third-party audit reports (e.g., SOC 2 Type II reports when available) in lieu of
        direct site audits where this adequately addresses Customer&apos;s concerns.
      </p>

      <hr />

      <h2>11. Data Deletion and Return Upon Termination</h2>
      <p>
        <strong>11.1</strong> Upon termination of the agreement between MiddleDoc and Customer
        for any reason, MiddleDoc will, at Customer&apos;s election:
      </p>
      <ul>
        <li>Delete all End-User Personal Data within 30 days of termination, or</li>
        <li>Return End-User Personal Data to Customer in a machine-readable format (JSON and PDF) within 30 days</li>
      </ul>
      <p>
        <strong>11.2</strong> Customer must make its election within 30 days of termination by
        emailing hello@middledoc.com. If no election is made within 30 days, MiddleDoc will
        delete all End-User Personal Data.
      </p>
      <p>
        <strong>11.3</strong> Notwithstanding the above, MiddleDoc may retain:
      </p>
      <ul>
        <li>E-signature audit trail records for 7 years as required for legal enforceability</li>
        <li>Billing and payment records for 7 years as required by accounting and tax law</li>
        <li>Aggregated and anonymized analytics data that does not identify any individual</li>
        <li>Any data MiddleDoc is required to retain by applicable law</li>
      </ul>
      <p>
        <strong>11.4</strong> MiddleDoc will provide Customer with written confirmation of
        deletion upon request.
      </p>

      <hr />

      <h2>12. International Data Transfers</h2>
      <p>
        <strong>12.1</strong> MiddleDoc&apos;s infrastructure is primarily located in the United
        States. Processing of End-User Personal Data by MiddleDoc and its Sub-Processors may
        involve transfer of personal data from the EEA, UK, or Switzerland to the United States
        or other countries that may not provide an equivalent level of data protection.
      </p>
      <p>
        <strong>12.2</strong> For such transfers, MiddleDoc relies on:
      </p>
      <ul>
        <li>
          <strong>Standard Contractual Clauses (SCCs):</strong> This DPA incorporates the Module
          Two SCCs (controller to processor) as issued by the European Commission on 4 June 2021
          (Decision 2021/914/EU), which are hereby incorporated into and form part of this DPA.
          The SCCs are completed as follows:
          <ul>
            <li>Clause 7 (Docking clause): Not applicable</li>
            <li>Clause 9 (Use of sub-processors): Option 2 — General written authorization</li>
            <li>Clause 11 (Redress): The optional language is not included</li>
            <li>Clause 17 (Governing law): The law of Ireland</li>
            <li>Clause 18 (Choice of forum): The courts of Ireland</li>
            <li>Annex I.A: Customer as data exporter; MiddleDoc as data importer</li>
            <li>Annex I.B: The processing details set out in Section 3 of this DPA</li>
            <li>Annex I.C: The competent supervisory authority for the Customer</li>
            <li>Annex II: The technical and organizational measures set out in Section 7 of this DPA</li>
          </ul>
        </li>
        <li>
          <strong>UK IDTA:</strong> For transfers involving UK personal data, MiddleDoc will
          provide a UK International Data Transfer Agreement (IDTA) or addendum upon request.
        </li>
      </ul>
      <p>
        <strong>12.3</strong> MiddleDoc will ensure that Sub-Processors engaged to process EEA,
        UK, or Swiss personal data provide equivalent transfer safeguards.
      </p>

      <hr />

      <h2>13. Governing Law and Dispute Resolution</h2>
      <p>
        This DPA is governed by the law specified in the MiddleDoc Terms of Service, except that
        the SCCs incorporated under Section 12 are governed by the law of Ireland as specified
        therein. Disputes relating to this DPA will be resolved pursuant to the dispute
        resolution provisions of the Terms of Service.
      </p>

      <hr />

      <h2>14. Order of Precedence</h2>
      <p>
        In the event of a conflict between this DPA and the Terms of Service with respect to the
        processing of personal data subject to applicable data protection law, this DPA will
        prevail. In all other respects, the Terms of Service prevail.
      </p>

      <hr />

      <h2>15. Contact</h2>
      <p>For DPA-related inquiries, countersigned DPA requests, or Sub-Processor objections:</p>
      <address className="not-italic">
        <strong>MiddleDoc Data Protection</strong><br />
        Email: <a href="mailto:hello@middledoc.com">hello@middledoc.com</a><br />
        Subject: &ldquo;DPA Inquiry&rdquo;
      </address>
    </article>
  )
}
