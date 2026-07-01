import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'E-Signature Disclosure — MiddleDoc',
  description: 'Consumer disclosure and consent for electronic signatures under the ESIGN Act.',
}

export default function ESignDisclosurePage() {
  return (
    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-li:text-neutral-700 prose-a:text-primary-600">
      <h1>Electronic Signature Disclosure and Consent</h1>
      <p className="text-sm text-neutral-500">Effective Date: June 30, 2026 &nbsp;|&nbsp; Last Updated: June 30, 2026</p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 not-prose mb-8">
        <p className="text-sm text-blue-800 font-medium mb-1">Please Read Before Signing</p>
        <p className="text-sm text-blue-700">
          This disclosure explains your rights and the legal effect of using electronic signatures
          through the MiddleDoc platform. By signing a document electronically through MiddleDoc,
          you confirm that you have read this disclosure and consent to the use of electronic
          records and signatures.
        </p>
      </div>

      <hr />

      <h2>1. Legal Validity of Electronic Signatures</h2>
      <p>
        Electronic signatures created through the MiddleDoc platform are legally binding under:
      </p>
      <ul>
        <li>
          <strong>The Electronic Signatures in Global and National Commerce Act (ESIGN Act),
          15 U.S.C. &sect;&sect; 7001 et seq.:</strong> A federal US law that establishes that electronic
          signatures, contracts, and records have the same legal effect as paper-based signatures
          and documents. Under the ESIGN Act, a signature may not be denied legal effect solely
          because it is in electronic form.
        </li>
        <li>
          <strong>The Uniform Electronic Transactions Act (UETA):</strong> Adopted in 49 US
          states and the District of Columbia, UETA provides that electronic signatures and
          records satisfy requirements for writings and signatures in state law contexts, including
          contracts, notices, and consent forms.
        </li>
        <li>
          <strong>eIDAS Regulation (EU) 910/2014 (electronic identification and trust services):</strong>
          An EU regulation that provides a legal framework for electronic signatures within the
          EU. MiddleDoc&apos;s signatures qualify as &ldquo;electronic signatures&rdquo; under eIDAS Article 3(10).
          Note that MiddleDoc does not currently provide &ldquo;qualified electronic signatures&rdquo; (QES)
          under eIDAS, which require identity verification by a qualified trust service provider.
        </li>
        <li>
          <strong>Applicable state and international law:</strong> Many jurisdictions outside the
          US have enacted equivalent legislation recognizing electronic signatures. You are
          responsible for confirming that electronic signatures are legally valid for your
          specific document type and jurisdiction.
        </li>
      </ul>

      <h3>Important Limitations</h3>
      <p>Electronic signatures may <strong>not</strong> be legally valid for certain document types, which may include (depending on your jurisdiction):</p>
      <ul>
        <li>Wills, testamentary trusts, and codicils</li>
        <li>Adoption, divorce, and other family law matters requiring court approval</li>
        <li>Court orders and official court documents</li>
        <li>Notices of utility termination</li>
        <li>Documents governed by laws of states that have not adopted UETA or equivalent statutes</li>
        <li>Certain real property conveyance documents under specific state statutes</li>
      </ul>
      <p>
        <strong>Consult a qualified attorney if you are uncertain whether electronic signatures
        are appropriate for your specific document type or jurisdiction.</strong> MiddleDoc does
        not provide legal advice.
      </p>

      <hr />

      <h2>2. Your Consent to Electronic Records and Signatures</h2>
      <p>
        <strong>By using the MiddleDoc e-signature feature, you consent to:</strong>
      </p>
      <ul>
        <li>Conducting transactions and signing documents electronically</li>
        <li>Receiving electronic copies of signed documents in lieu of paper originals</li>
        <li>Having your electronic signature recorded and embedded in the signed document along with an audit trail</li>
        <li>Receiving legally required notices and disclosures electronically rather than in paper form</li>
        <li>Electronic records being used as evidence of your agreement in legal and regulatory proceedings</li>
      </ul>
      <p>
        This consent applies to all documents you sign through MiddleDoc unless you withdraw
        consent as described below.
      </p>

      <hr />

      <h2>3. How Electronic Signatures Work on MiddleDoc</h2>
      <p>
        When you sign a document through MiddleDoc, the following occurs:
      </p>

      <h3>3.1 Signature Capture</h3>
      <ul>
        <li>You draw your signature using a touch screen, trackpad, or mouse on the MiddleDoc signature canvas</li>
        <li>Alternatively, you may type your name and select a signature font style</li>
        <li>Your signature image is captured and embedded in the PDF document at the designated signature field</li>
      </ul>

      <h3>3.2 Audit Trail Generation</h3>
      <p>
        MiddleDoc automatically records the following information at the moment of signing
        (collectively, the &ldquo;Audit Trail&rdquo;):
      </p>
      <ul>
        <li>Signer&apos;s full name (as provided)</li>
        <li>Signer&apos;s email address (as provided or on file)</li>
        <li>IP address of the device used to sign</li>
        <li>Date and time of signing (recorded in UTC)</li>
        <li>A cryptographic hash (SHA-256) of the document at the time of signing to detect any subsequent alterations</li>
        <li>Browser and device type (user agent string)</li>
      </ul>

      <h3>3.3 Embedding in Document</h3>
      <p>
        The signature image and Audit Trail metadata are embedded within the signed PDF document
        using pdf-lib. The signed document is stored on MiddleDoc&apos;s servers and made available
        for download by both the account holder (your professional service provider) and you
        (the signer) upon request.
      </p>

      <hr />

      <h2>4. Hardware and Software Requirements</h2>
      <p>
        To use the MiddleDoc e-signature feature, you need:
      </p>
      <ul>
        <li>
          <strong>Device:</strong> Any desktop computer, laptop, tablet, or smartphone capable of
          running a modern web browser
        </li>
        <li>
          <strong>Operating System:</strong> Windows 10 or later, macOS 10.14 or later, iOS 14
          or later, Android 9 or later (or any OS supporting a supported browser version)
        </li>
        <li>
          <strong>Browser:</strong> Google Chrome (v90+), Mozilla Firefox (v88+), Apple Safari
          (v14+), Microsoft Edge (v90+), or any Chromium-based browser of equivalent version
        </li>
        <li>
          <strong>Internet connection:</strong> A stable broadband or mobile internet connection
          (minimum 1 Mbps recommended)
        </li>
        <li>
          <strong>JavaScript:</strong> Must be enabled in your browser
        </li>
        <li>
          <strong>PDF viewer:</strong> To view signed documents we recommend Adobe Acrobat Reader
          (free, available at adobe.com/acrobat/pdf-reader.html) or any PDF viewer capable of
          rendering embedded signature fields
        </li>
        <li>
          <strong>Input method:</strong> Mouse, trackpad, touch screen, or stylus for drawing
          signatures. Typed signatures are also supported.
        </li>
      </ul>
      <p>
        These requirements may change. If they do, we will provide reasonable advance notice.
        If you are unable to meet these requirements, please contact your service provider to
        arrange an alternative signing method.
      </p>

      <hr />

      <h2>5. Accessing and Retaining Your Signed Documents</h2>

      <h3>5.1 Electronic Access</h3>
      <p>
        Signed documents are available for download in PDF format from the MiddleDoc portal
        immediately after signing. You may download and save a copy for your records. We
        strongly recommend that you download and retain a copy of every document you sign.
      </p>

      <h3>5.2 MiddleDoc&apos;s Retention of Signed Documents</h3>
      <p>
        MiddleDoc retains e-signature Audit Trails for a minimum of <strong>7 years</strong>
        from the date of signing to support the legal enforceability of signed documents.
        Signed PDF documents are retained for the duration of the account holder&apos;s account.
        See our Privacy Policy for full data retention details.
      </p>

      <h3>5.3 Your Responsibility</h3>
      <p>
        You are responsible for retaining your own copies of signed documents for your personal
        records. MiddleDoc&apos;s retention of signed documents is provided as a convenience and
        does not substitute for your own record-keeping obligations.
      </p>

      <hr />

      <h2>6. Requesting a Paper Copy</h2>
      <p>
        You have the right to receive a paper copy of any document you sign electronically
        through MiddleDoc. To request a paper copy:
      </p>
      <ol>
        <li>Contact the professional service provider (accountant, attorney, HR professional, etc.) who sent you the document request through MiddleDoc, <strong>or</strong></li>
        <li>Contact MiddleDoc directly at <a href="mailto:hello@middledoc.com">hello@middledoc.com</a> with the subject &ldquo;Paper Copy Request&rdquo; and identify the document by name and approximate signing date</li>
      </ol>
      <p>
        There may be a reasonable fee to cover printing and postage costs for paper copies
        requested directly from MiddleDoc. Paper copy requests must be made within the applicable
        retention period for that document.
      </p>

      <hr />

      <h2>7. How to Withdraw Consent</h2>
      <p>
        You may withdraw your consent to use electronic signatures and records at any time.
        Withdrawal of consent does not affect the validity of any electronic signatures or
        records created before the withdrawal.
      </p>
      <p>To withdraw consent:</p>
      <ul>
        <li>Contact the service provider who sent you the document request and request paper-based processing, <strong>or</strong></li>
        <li>Email MiddleDoc at <a href="mailto:hello@middledoc.com">hello@middledoc.com</a> with the subject &ldquo;Withdraw E-Signature Consent&rdquo; and your name and email address</li>
      </ul>
      <p>
        After withdrawal, MiddleDoc will no longer present you with electronic signature
        requests. Your service provider may be unable to process your documents through the
        MiddleDoc platform and may need to provide alternative arrangements.
      </p>

      <hr />

      <h2>8. Identity Verification</h2>
      <p>
        MiddleDoc does not independently verify the identity of signers beyond the email address
        provided. The party who created the document request (the account holder) is responsible
        for:
      </p>
      <ul>
        <li>Confirming that the signer is who they claim to be</li>
        <li>Using appropriate authentication measures where required by law or their professional obligations</li>
        <li>Ensuring that the person signing has the legal authority to sign the relevant document</li>
      </ul>
      <p>
        If enhanced identity verification is required (such as identity document verification
        or knowledge-based authentication), the account holder must arrange this independently
        before or after the MiddleDoc signing process.
      </p>

      <hr />

      <h2>9. Contact for E-Signature Questions</h2>
      <address className="not-italic">
        <strong>MiddleDoc</strong><br />
        Email: <a href="mailto:hello@middledoc.com">hello@middledoc.com</a><br />
        Subject: &ldquo;E-Signature Inquiry&rdquo;<br />
        Website: <a href="https://middledoc.com">middledoc.com</a>
      </address>
    </article>
  )
}
