import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — MiddleDoc',
  description: 'The terms and conditions governing your use of MiddleDoc.',
}

export default function TermsOfServicePage() {
  return (
    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-li:text-neutral-700 prose-a:text-primary-600">
      <h1>Terms of Service</h1>
      <p className="text-sm text-neutral-500">Effective Date: June 30, 2026 &nbsp;|&nbsp; Last Updated: June 30, 2026</p>

      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) constitute a binding legal agreement between you
        (&ldquo;you,&rdquo; &ldquo;your,&rdquo; or &ldquo;User&rdquo;) and MiddleDoc (&ldquo;MiddleDoc,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
        governing your access to and use of the MiddleDoc document collection and e-signature
        platform, including all associated websites, APIs, mobile applications, and features
        (collectively, the &ldquo;Service&rdquo;).
      </p>
      <p>
        <strong>By creating an account, clicking &ldquo;I agree,&rdquo; or using the Service, you
        acknowledge that you have read, understood, and agree to be bound by these Terms and our
        Privacy Policy. If you do not agree, do not use the Service.</strong>
      </p>

      <hr />

      <h2>1. Account Registration and Eligibility</h2>

      <h3>1.1 Eligibility</h3>
      <p>
        You must be at least 18 years of age and capable of entering into a legally binding
        contract to use the Service. By registering, you represent and warrant that you meet
        these requirements. The Service is not available to persons under 16 years of age.
      </p>

      <h3>1.2 Business Use</h3>
      <p>
        If you register on behalf of a company, organization, or other legal entity, you
        represent and warrant that you have authority to bind that entity to these Terms, and
        &ldquo;you&rdquo; in these Terms refers to both you and that entity.
      </p>

      <h3>1.3 Account Accuracy</h3>
      <p>
        You agree to provide accurate, current, and complete information during registration and
        to keep your account information updated. You are responsible for maintaining the
        confidentiality of your password and for all activities that occur under your account.
        Notify us immediately at hello@middledoc.com if you suspect unauthorized access to your
        account.
      </p>

      <h3>1.4 One Account Per Person</h3>
      <p>
        Each individual may maintain only one personal account. Team accounts and firm-level
        accounts accommodate multiple users under a single billing entity. Creating multiple
        individual accounts to circumvent plan limits is prohibited.
      </p>

      <hr />

      <h2>2. The Service</h2>

      <h3>2.1 Service Description</h3>
      <p>MiddleDoc provides a cloud-based platform that enables professional service providers to:</p>
      <ul>
        <li>Create and send document collection requests to clients via secure share links</li>
        <li>Receive, organize, and manage uploaded documents from clients</li>
        <li>Apply AI-powered document classification across 25+ document categories</li>
        <li>Collect legally binding electronic signatures on PDF documents</li>
        <li>Send automated email reminders to clients about outstanding document requests</li>
        <li>Manage client invoicing and payment collection through the client portal</li>
        <li>Integrate with QuickBooks Online for client data synchronization</li>
        <li>Collaborate in teams with role-based access control</li>
      </ul>

      <h3>2.2 Service Availability</h3>
      <p>
        We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. We may
        perform scheduled maintenance with advance notice where reasonably practicable. We are
        not liable for downtime caused by factors outside our reasonable control, including
        third-party infrastructure failures, internet outages, or force majeure events.
      </p>

      <h3>2.3 Service Modifications</h3>
      <p>
        We reserve the right to modify, add, or remove features of the Service at any time. We
        will provide reasonable notice of material changes to paid subscribers. Continued use
        after such changes constitutes acceptance.
      </p>

      <hr />

      <h2>3. Subscription Plans and Payment</h2>

      <h3>3.1 Plans</h3>
      <p>MiddleDoc offers the following subscription tiers, subject to change with notice:</p>
      <ul>
        <li><strong>Free:</strong> $0/month. Limited clients, storage, and features as described on the pricing page.</li>
        <li><strong>Solo:</strong> $19/month (or annual equivalent). Single-user plan with expanded limits.</li>
        <li><strong>Team:</strong> $39/month (or annual equivalent). Multi-user plan with team collaboration features.</li>
        <li><strong>Firm:</strong> $79/month (or annual equivalent). Full-featured plan for larger practices.</li>
        <li><strong>Enterprise:</strong> Custom pricing. Contact hello@middledoc.com for details.</li>
      </ul>
      <p>
        Current plan features and limits are described at middledoc.com/#pricing. We reserve the
        right to change pricing with at least 30 days&apos; notice to existing subscribers.
      </p>

      <h3>3.2 Billing and Payment</h3>
      <p>
        Paid subscriptions are billed in advance on a monthly or annual basis, beginning on the
        date you upgrade. Payments are processed by Stripe (for most users) or Paystack (for
        African markets). By providing payment information you authorize us to charge your
        payment method on a recurring basis according to your selected billing cycle.
      </p>
      <p>
        If a payment fails, we will retry the charge according to our payment processor&apos;s
        retry schedule. Accounts with failed payments may be downgraded to the Free plan after
        a grace period of 7 days.
      </p>

      <h3>3.3 Taxes</h3>
      <p>
        Prices listed are exclusive of applicable taxes. You are responsible for all applicable
        taxes, levies, and duties imposed by taxing authorities on your subscription. Where
        required by law, we will add VAT, GST, or other taxes to your invoice.
      </p>

      <h3>3.4 Cancellation</h3>
      <p>
        You may cancel your subscription at any time from Settings &gt; Billing. Cancellation takes
        effect at the end of the current billing period. You will retain access to paid features
        until the period ends. We do not provide prorated refunds for partial billing periods
        unless otherwise required by law.
      </p>

      <h3>3.5 Refunds</h3>
      <p>
        We offer a 14-day money-back guarantee for new paid subscribers. If you are not
        satisfied within the first 14 days of your first paid subscription, contact us at
        hello@middledoc.com for a full refund. After 14 days, all sales are final except where
        required by applicable consumer protection law in your jurisdiction. Refunds are not
        available for Enterprise plan fees or custom integrations.
      </p>

      <h3>3.6 Free Tier Limitations</h3>
      <p>
        Free tier accounts are subject to limits on the number of clients, storage capacity,
        monthly document requests, and email reminders as specified on the pricing page. We
        reserve the right to modify free tier limits with 30 days&apos; notice.
      </p>

      <hr />

      <h2>4. Acceptable Use Policy</h2>
      <p>
        Your use of the Service is subject to our full Acceptable Use Policy available at
        middledoc.com/legal/acceptable-use, which is incorporated into these Terms by reference.
        In summary, you agree not to use the Service to:
      </p>
      <ul>
        <li>Violate any applicable law or regulation</li>
        <li>Upload or transmit malicious code, viruses, or harmful files</li>
        <li>Infringe the intellectual property rights of any third party</li>
        <li>Harass, threaten, or harm any individual</li>
        <li>Attempt to gain unauthorized access to MiddleDoc systems or other users&apos; accounts</li>
        <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
        <li>Scrape, harvest, or systematically extract data from the Service by automated means</li>
        <li>Impersonate MiddleDoc or any other person or entity</li>
        <li>Circumvent plan limits or use the Service in a way that disproportionately burdens our infrastructure</li>
        <li>Use the Service to facilitate money laundering, fraud, or other financial crimes</li>
      </ul>
      <p>
        Violation of this section may result in immediate suspension or termination of your account
        without refund.
      </p>

      <hr />

      <h2>5. User Content and Intellectual Property</h2>

      <h3>5.1 Your Content</h3>
      <p>
        &ldquo;User Content&rdquo; means all documents, files, data, text, images, and other materials
        that you or your clients upload to the Service. You retain full ownership of all User
        Content. These Terms do not transfer any ownership rights in your User Content to
        MiddleDoc.
      </p>

      <h3>5.2 License to MiddleDoc</h3>
      <p>
        By uploading User Content you grant MiddleDoc a limited, non-exclusive, worldwide,
        royalty-free license to host, store, reproduce, transmit, and process your User Content
        solely as necessary to provide the Service to you. This license terminates when you
        delete the content or close your account.
      </p>

      <h3>5.3 No AI Training on Your Content</h3>
      <p>
        We do not use your User Content to train any machine learning or artificial intelligence
        models, including our own. When AI classification features are used, your document
        content is transmitted to our AI providers (OpenAI, Anthropic) under API terms that
        prohibit those providers from using API-submitted content to train their general models.
      </p>

      <h3>5.4 Your Representations About User Content</h3>
      <p>You represent and warrant that:</p>
      <ul>
        <li>You own or have the necessary rights to upload and share all User Content</li>
        <li>Your User Content does not violate applicable law or third-party rights</li>
        <li>You have obtained all necessary consents from any individuals whose personal data appears in your User Content</li>
        <li>Your User Content does not contain malware, viruses, or malicious code</li>
      </ul>

      <h3>5.5 MiddleDoc&apos;s Intellectual Property</h3>
      <p>
        The Service, including all software, algorithms, interfaces, designs, logos, trademarks,
        documentation, and underlying technology, is owned by MiddleDoc and is protected by
        copyright, trademark, patent, trade secret, and other intellectual property laws. Nothing
        in these Terms grants you any rights in MiddleDoc&apos;s intellectual property except the
        limited right to use the Service as described here. The MiddleDoc name, logo, and
        wordmark are trademarks of MiddleDoc.
      </p>

      <h3>5.6 Feedback</h3>
      <p>
        If you provide feedback, suggestions, or ideas about the Service (&ldquo;Feedback&rdquo;), you
        grant MiddleDoc a perpetual, irrevocable, worldwide, royalty-free license to use,
        incorporate, and commercialize that Feedback without obligation to you.
      </p>

      <hr />

      <h2>6. Electronic Signatures</h2>

      <h3>6.1 Legal Validity</h3>
      <p>
        Electronic signatures created through the MiddleDoc platform are intended to be legally
        binding under the United States Electronic Signatures in Global and National Commerce Act
        (ESIGN Act, 15 U.S.C. &sect;&sect; 7001 et seq.) and the Uniform Electronic Transactions Act
        (UETA) as adopted in applicable US states. For international users, e-signatures may
        also be valid under eIDAS Regulation (EU) 910/2014 and equivalent laws in other
        jurisdictions, though you are responsible for verifying enforceability in your specific
        jurisdiction.
      </p>

      <h3>6.2 Signature Audit Trail</h3>
      <p>
        MiddleDoc captures and stores an audit trail for each electronic signature event,
        including the signer&apos;s name, email address, IP address, timestamp (UTC), and a hash of
        the signed document. This audit trail is embedded in the signed PDF and is available for
        download from your account.
      </p>

      <h3>6.3 Not a Qualified Electronic Signature Provider</h3>
      <p>
        MiddleDoc does not currently provide qualified electronic signatures (QES) as defined
        under eIDAS. If your use case requires a QES (e.g., certain EU legal proceedings), you
        should use a qualified trust service provider.
      </p>

      <h3>6.4 Your Responsibility</h3>
      <p>
        You are responsible for ensuring that the use of electronic signatures is appropriate
        and legally valid for your specific documents and jurisdiction. Certain document types
        (e.g., wills, real property transfers under specific state laws, adoption papers, court
        orders) may not be executed by electronic signature. Consult qualified legal counsel for
        jurisdiction-specific requirements.
      </p>

      <p>
        See our full E-Signature Disclosure at middledoc.com/legal/esign.
      </p>

      <hr />

      <h2>7. AI Classification Disclaimer</h2>
      <p>
        The AI document classification feature categorizes documents to assist with organization.
        Classification results are generated by large language models operated by OpenAI and
        Anthropic. AI classification is provided as a convenience tool only and may be inaccurate.
      </p>
      <p>
        <strong>AI classification results do not constitute legal advice, tax advice, accounting
        advice, or any form of professional advice.</strong> You are solely responsible for
        reviewing all documents and their classifications. Do not rely on AI classification
        results for compliance, regulatory, or legal decision-making without independent
        professional review.
      </p>

      <hr />

      <h2>8. Privacy and Data Protection</h2>
      <p>
        Our collection and use of personal data in connection with the Service is governed by our
        Privacy Policy at middledoc.com/legal/privacy, which is incorporated into these Terms.
        Business customers who use MiddleDoc to process personal data of their own clients should
        execute our Data Processing Agreement (DPA) at middledoc.com/legal/dpa.
      </p>

      <hr />

      <h2>9. Confidentiality</h2>
      <p>
        MiddleDoc will maintain the confidentiality of your User Content and account data using
        reasonable security measures and will not disclose your User Content to third parties
        except as necessary to provide the Service, as authorized by you, or as required by law.
        You acknowledge that MiddleDoc employees may access your account data for support,
        security investigation, or legal compliance purposes, subject to internal access controls.
      </p>

      <hr />

      <h2>10. Termination</h2>

      <h3>10.1 Termination by You</h3>
      <p>
        You may terminate your account at any time by navigating to Settings &gt; Account &gt; Delete
        Account or by contacting hello@middledoc.com. Upon termination, your right to access the
        Service immediately ceases.
      </p>

      <h3>10.2 Termination by MiddleDoc</h3>
      <p>
        We may suspend or terminate your account immediately and without notice if:
      </p>
      <ul>
        <li>You violate these Terms or our Acceptable Use Policy</li>
        <li>You engage in fraud or misrepresentation</li>
        <li>Your account is involved in illegal activity</li>
        <li>Continued service poses security risks to MiddleDoc or other users</li>
        <li>Payment for a paid subscription is overdue by more than 14 days after the grace period</li>
      </ul>
      <p>
        For non-urgent violations we will provide written notice and a reasonable opportunity to
        cure before suspension.
      </p>

      <h3>10.3 Effect of Termination</h3>
      <p>
        Upon termination: (a) your account access is revoked; (b) we will make your data
        available for export for 30 days post-termination if you contact us; (c) after 30 days,
        we will delete your User Content from active systems subject to our data retention
        obligations for e-signatures and billing records. Provisions of these Terms that by their
        nature should survive termination will survive, including sections on IP ownership,
        warranty disclaimers, limitation of liability, and dispute resolution.
      </p>

      <hr />

      <h2>11. Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
        EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MIDDLEDOC
        DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. MIDDLEDOC DOES NOT WARRANT THAT:
        (A) THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE; (B) ANY DEFECTS WILL BE
        CORRECTED; (C) THE SERVICE OR ANY SERVER MAKING IT AVAILABLE IS FREE OF VIRUSES OR
        OTHER HARMFUL COMPONENTS; OR (D) AI CLASSIFICATION RESULTS WILL BE ACCURATE OR
        COMPLETE.
      </p>

      <hr />

      <h2>12. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL MIDDLEDOC, ITS
        OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY
        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING
        LOST PROFITS, LOSS OF DATA, LOSS OF GOODWILL, SERVICE INTERRUPTION, COMPUTER DAMAGE, OR
        THE COST OF SUBSTITUTE SERVICES, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR
        YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MIDDLEDOC&apos;S AGGREGATE LIABILITY TO
        YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE, REGARDLESS
        OF THE FORM OF ACTION, WILL NOT EXCEED THE GREATER OF: (A) THE TOTAL AMOUNT YOU PAID TO
        MIDDLEDOC IN THE 12 MONTHS IMMEDIATELY PRECEDING THE CLAIM, OR (B) ONE HUNDRED US
        DOLLARS ($100).
      </p>
      <p>
        SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IN THOSE
        JURISDICTIONS, OUR LIABILITY IS LIMITED TO THE GREATEST EXTENT PERMITTED BY LAW.
      </p>

      <hr />

      <h2>13. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless MiddleDoc and its officers, directors,
        employees, agents, and successors from and against any claims, liabilities, damages,
        losses, and expenses (including reasonable attorneys&apos; fees) arising out of or in any way
        connected with: (a) your access to or use of the Service; (b) your User Content;
        (c) your violation of these Terms; (d) your violation of any applicable law or regulation;
        or (e) your violation of any third-party rights, including intellectual property rights or
        privacy rights.
      </p>

      <hr />

      <h2>14. Dispute Resolution and Arbitration</h2>

      <h3>14.1 Informal Resolution</h3>
      <p>
        Before initiating any formal dispute, you agree to contact us at hello@middledoc.com and
        provide a written description of the dispute, your name, and your preferred contact
        information. We will attempt to resolve the dispute informally within 60 days.
      </p>

      <h3>14.2 Binding Arbitration</h3>
      <p>
        If informal resolution fails, any dispute, claim, or controversy arising out of or
        relating to these Terms or the Service will be resolved by binding individual arbitration
        administered by the American Arbitration Association (AAA) under its Consumer Arbitration
        Rules or Commercial Arbitration Rules (as applicable), except as stated in Section 14.4.
        The arbitrator&apos;s decision will be final and binding.
      </p>

      <h3>14.3 Class Action Waiver</h3>
      <p>
        <strong>TO THE EXTENT PERMITTED BY LAW, YOU AND MIDDLEDOC WAIVE THE RIGHT TO BRING OR
        PARTICIPATE IN CLASS ACTION LAWSUITS, CLASS-WIDE ARBITRATIONS, OR REPRESENTATIVE
        ACTIONS.</strong> Each party may bring claims only in its individual capacity.
      </p>

      <h3>14.4 Exceptions to Arbitration</h3>
      <p>
        Either party may seek injunctive or other equitable relief in a court of competent
        jurisdiction to prevent infringement of intellectual property rights or unauthorized
        access to confidential information. Nothing in this section prevents you from filing
        a complaint with a consumer protection agency or data protection authority.
      </p>

      <h3>14.5 Opt-Out</h3>
      <p>
        You may opt out of the arbitration and class action waiver provisions within 30 days of
        first accepting these Terms by sending written notice to hello@middledoc.com with the
        subject &ldquo;Arbitration Opt-Out.&rdquo; If you opt out, disputes will be resolved in court
        per Section 15.
      </p>

      <hr />

      <h2>15. Governing Law and Jurisdiction</h2>
      <p>
        These Terms are governed by and construed in accordance with the laws of the State of
        Delaware, United States, without regard to its conflict of law principles. For disputes
        not subject to arbitration, or where the arbitration clause is unenforceable, you and
        MiddleDoc consent to the exclusive jurisdiction of the federal and state courts located
        in Delaware. Notwithstanding the foregoing, MiddleDoc may seek injunctive relief in any
        court of competent jurisdiction.
      </p>
      <p>
        If you are a consumer located in the EU, UK, or a jurisdiction that does not permit
        mandatory arbitration clauses in consumer contracts, the mandatory arbitration provisions
        in Section 14 do not apply to you. You retain the right to bring claims in the courts of
        your country of residence.
      </p>

      <hr />

      <h2>16. Modifications to These Terms</h2>
      <p>
        We may update these Terms at any time. We will provide at least 30 days&apos; advance notice
        of material changes to paid subscribers via email. We will post a notice on our website
        for all users. If you disagree with updated Terms, you may terminate your account before
        the effective date. Your continued use after the effective date constitutes acceptance of
        the updated Terms.
      </p>

      <hr />

      <h2>17. Severability</h2>
      <p>
        If any provision of these Terms is held by a court of competent jurisdiction to be
        invalid, illegal, or unenforceable, the remaining provisions will continue in full force
        and effect. The invalid provision will be modified to the minimum extent necessary to
        make it enforceable.
      </p>

      <hr />

      <h2>18. Entire Agreement</h2>
      <p>
        These Terms, together with our Privacy Policy, Cookie Policy, Acceptable Use Policy, and
        any applicable Data Processing Agreement or Enterprise Agreement, constitute the entire
        agreement between you and MiddleDoc with respect to the Service and supersede all prior
        or contemporaneous understandings, representations, or agreements, whether written or
        oral, relating to the Service.
      </p>

      <hr />

      <h2>19. Waiver</h2>
      <p>
        MiddleDoc&apos;s failure to enforce any right or provision of these Terms will not constitute
        a waiver of that right or provision.
      </p>

      <hr />

      <h2>20. Assignment</h2>
      <p>
        You may not assign or transfer your rights or obligations under these Terms without our
        prior written consent. MiddleDoc may assign these Terms, in whole or in part, to any
        affiliate or in connection with a merger, acquisition, sale of assets, or by operation
        of law.
      </p>

      <hr />

      <h2>21. Force Majeure</h2>
      <p>
        MiddleDoc will not be liable for delays or failures in performance resulting from events
        beyond our reasonable control, including acts of God, internet outages, denial of service
        attacks, pandemic, natural disasters, labor disputes, or governmental actions.
      </p>

      <hr />

      <h2>22. Contact Information</h2>
      <address className="not-italic">
        <strong>MiddleDoc</strong><br />
        Email: <a href="mailto:hello@middledoc.com">hello@middledoc.com</a><br />
        Website: <a href="https://middledoc.com">middledoc.com</a>
      </address>
    </article>
  )
}
