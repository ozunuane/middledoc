import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — MiddleDoc',
  description: 'What cookies MiddleDoc uses and how to manage them.',
}

export default function CookiePolicyPage() {
  return (
    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-li:text-neutral-700 prose-a:text-primary-600">
      <h1>Cookie Policy</h1>
      <p className="text-sm text-neutral-500">Effective Date: June 30, 2026 &nbsp;|&nbsp; Last Updated: June 30, 2026</p>

      <p>
        This Cookie Policy explains how MiddleDoc (&ldquo;MiddleDoc,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) uses
        cookies and similar tracking technologies on middledoc.com and through the MiddleDoc
        application (collectively, the &ldquo;Service&rdquo;).
      </p>

      <hr />

      <h2>1. What Is a Cookie?</h2>
      <p>
        A cookie is a small text file that a website places on your device when you visit. Cookies
        are widely used to make websites work more efficiently, provide essential functionality,
        and in many cases to collect information about browsing behavior. Cookies can be
        &ldquo;session&rdquo; cookies (deleted when you close your browser) or &ldquo;persistent&rdquo; cookies (stored
        for a defined period).
      </p>

      <hr />

      <h2>2. The Only Cookie MiddleDoc Uses</h2>
      <p>
        MiddleDoc takes a minimal approach to cookies. We set <strong>exactly one cookie</strong>
        on your device when you log in to the Service:
      </p>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-neutral-50">
            <th className="text-left p-3 border border-neutral-200 font-semibold">Cookie Name</th>
            <th className="text-left p-3 border border-neutral-200 font-semibold">Type</th>
            <th className="text-left p-3 border border-neutral-200 font-semibold">Purpose</th>
            <th className="text-left p-3 border border-neutral-200 font-semibold">Duration</th>
            <th className="text-left p-3 border border-neutral-200 font-semibold">Third Party?</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            <td className="p-3 border border-neutral-200 font-mono text-xs">middledoc_session</td>
            <td className="p-3 border border-neutral-200">Strictly Necessary — Authentication</td>
            <td className="p-3 border border-neutral-200">
              Stores your encrypted JSON Web Token (JWT) authentication credential to keep you
              logged in to your MiddleDoc account. Without this cookie the Service cannot
              verify your identity.
            </td>
            <td className="p-3 border border-neutral-200">Session (expires when you log out or the token expires, typically 8 hours for admin sessions and up to 7 days for standard sessions)</td>
            <td className="p-3 border border-neutral-200">No — set by MiddleDoc only</td>
          </tr>
        </tbody>
      </table>

      <h3>Technical Attributes of This Cookie</h3>
      <ul>
        <li><strong>httpOnly:</strong> Yes — the cookie cannot be accessed or read by JavaScript running on the page. This protects against cross-site scripting (XSS) attacks.</li>
        <li><strong>Secure:</strong> Yes — the cookie is only transmitted over HTTPS encrypted connections. It is never sent over plain HTTP.</li>
        <li><strong>SameSite:</strong> Strict — the cookie is not sent with cross-site requests, protecting against cross-site request forgery (CSRF) attacks.</li>
        <li><strong>Path:</strong> / (available across the entire middledoc.com domain)</li>
      </ul>

      <hr />

      <h2>3. What We Do Not Use</h2>
      <p>
        We want to be clear about what MiddleDoc does <strong>not</strong> use:
      </p>
      <ul>
        <li><strong>No advertising or targeting cookies</strong> — we do not serve or participate in ad networks</li>
        <li><strong>No third-party analytics cookies</strong> — we do not use Google Analytics, Mixpanel, Segment, Hotjar, or similar services</li>
        <li><strong>No social media tracking pixels</strong> — we do not embed Facebook Pixel, LinkedIn Insight Tag, or similar</li>
        <li><strong>No fingerprinting or supercookies</strong> — we do not use browser fingerprinting or evercookies</li>
        <li><strong>No persistent tracking identifiers</strong> — beyond the session authentication cookie, we do not place persistent identifiers on your device</li>
        <li><strong>No cross-site tracking</strong> — our authentication cookie is SameSite=Strict and cannot be used to track you across other websites</li>
      </ul>

      <hr />

      <h2>4. Local Storage</h2>
      <p>
        In addition to cookies, MiddleDoc may use browser <strong>localStorage</strong> or
        <strong>sessionStorage</strong> to store:
      </p>
      <ul>
        <li>UI preferences (e.g., sidebar collapsed state, column sorting)</li>
        <li>Draft form state (e.g., partially completed document request forms)</li>
        <li>Cached list data to improve page load performance</li>
      </ul>
      <p>
        This data is stored locally on your device only, is never transmitted to third parties,
        and does not constitute a &ldquo;cookie&rdquo; under applicable regulations. It can be cleared at
        any time by clearing your browser&apos;s site data for middledoc.com.
      </p>

      <hr />

      <h2>5. Why We Don&apos;t Need a Cookie Consent Banner</h2>
      <p>
        Under the EU ePrivacy Directive (the &ldquo;Cookie Law&rdquo;) and the UK PECR, consent is
        required only for cookies that are not strictly necessary for the operation of the
        service. Our single authentication cookie is strictly necessary — without it, you cannot
        log in or use the Service. Strictly necessary cookies are exempt from consent
        requirements.
      </p>
      <p>
        We provide this full disclosure so you understand exactly what is on your device, and
        you can exercise your choices as described below.
      </p>

      <hr />

      <h2>6. Managing and Removing Cookies</h2>
      <p>
        Because our only cookie is strictly necessary for authentication, disabling or deleting
        it will prevent you from staying logged in to MiddleDoc. You can:
      </p>
      <ul>
        <li>
          <strong>Log out:</strong> Clicking &ldquo;Log out&rdquo; in the MiddleDoc interface will delete
          the session cookie immediately.
        </li>
        <li>
          <strong>Clear cookies in your browser:</strong> You can delete all cookies for
          middledoc.com through your browser settings. You will be signed out and will need to
          log in again.
        </li>
        <li>
          <strong>Block cookies:</strong> You can configure your browser to block cookies from
          middledoc.com. Note that this will prevent you from logging in to the Service.
        </li>
      </ul>

      <h3>Browser Cookie Management Links</h3>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
        <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
      </ul>

      <hr />

      <h2>7. Changes to This Cookie Policy</h2>
      <p>
        We will update this Cookie Policy if we change the cookies we use. If we add any
        non-essential cookies in the future we will update this page, implement a consent
        mechanism, and notify users by email. The &ldquo;Last Updated&rdquo; date at the top of this page
        indicates when changes were last made.
      </p>

      <hr />

      <h2>8. Contact Us</h2>
      <p>
        For questions about our use of cookies, please contact:
      </p>
      <address className="not-italic">
        <strong>MiddleDoc Privacy Team</strong><br />
        Email: <a href="mailto:hello@middledoc.com">hello@middledoc.com</a><br />
        Subject: &ldquo;Cookie Policy Inquiry&rdquo;
      </address>
    </article>
  )
}
