import { Shield, Eye, Lock, Share2, Clock, Baby, Mail, Cookie, ChevronRight } from "lucide-react";

const sections = [
  {
    id: "information-we-collect",
    icon: Eye,
    title: "Information We Collect",
    content: [
      {
        subtitle: "Account & Profile Data",
        text: "When you create an account, we collect your name, email address, and username. If you make a purchase, we also retain your order history and associated transaction references.",
      },
      {
        subtitle: "Technical Data",
        text: "We automatically collect certain technical information when you visit Hbooks, including your IP address, browser type and version, device identifiers, pages visited, and referring URLs. This data helps us maintain security and improve performance.",
      },
      {
        subtitle: "Payment Information",
        text: "All payment processing is handled entirely by IntaSend, our third-party payment provider. We do not receive, store, or have access to your card details, bank account numbers, or any other sensitive financial information.",
      },
    ],
  },
  {
    id: "how-we-use-your-data",
    icon: Shield,
    title: "How We Use Your Data",
    content: [
      {
        subtitle: "Core Service Delivery",
        text: "We use your information to create and manage your account, process purchases, generate secure download links for your digital products, and communicate essential order and account updates.",
      },
      {
        subtitle: "Membership Management",
        text: "For members, we use your account data to verify subscription status, calculate and track expiry dates, and grant appropriate access to content.",
      },
      {
        subtitle: "Service Improvement",
        text: "We analyse aggregated, anonymised usage data to understand how our store is used and to improve the experience. We do not build individual behavioural profiles for marketing purposes.",
      },
      {
        subtitle: "Legal Compliance",
        text: "We may process your data where required by applicable law, including for tax reporting and fraud prevention.",
      },
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies & Tracking",
    content: [
      {
        subtitle: "Essential Cookies Only",
        text: "Hbooks uses only strictly necessary cookies for authentication and session management. These cookies are required for the site to function and cannot be disabled without affecting core functionality.",
      },
      {
        subtitle: "No Advertising Trackers",
        text: "We do not use third-party advertising cookies, social media tracking pixels, or behavioural analytics tools. Your browsing activity on Hbooks is not shared with any advertising network.",
      },
    ],
  },
  {
    id: "data-security",
    icon: Lock,
    title: "Data Security",
    content: [
      {
        subtitle: "Technical Safeguards",
        text: "All data is transmitted over HTTPS with TLS encryption. Our database is hosted on Supabase's managed infrastructure, which provides row-level security, encrypted storage at rest, and regular security audits.",
      },
      {
        subtitle: "Access Controls",
        text: "Access to personal data is restricted to authorised personnel only, on a strict need-to-know basis. Download links for digital products are cryptographically signed and expire after 24 hours.",
      },
      {
        subtitle: "Breach Notification",
        text: "In the unlikely event of a data breach affecting your personal information, we will notify you and the relevant supervisory authority within 72 hours of becoming aware, as required under GDPR.",
      },
    ],
  },
  {
    id: "data-sharing",
    icon: Share2,
    title: "Data Sharing & Disclosure",
    content: [
      {
        subtitle: "We Never Sell Your Data",
        text: "We do not sell, rent, or trade your personal information to any third party, under any circumstances.",
      },
      {
        subtitle: "Service Providers",
        text: "We share limited data with trusted providers essential to running Hbooks: IntaSend (payment processing) and Supabase (database and authentication hosting). Each provider is contractually bound to process your data only as instructed and in compliance with applicable data protection law.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required to do so by law or in response to valid legal process (court orders, regulatory requests). We will notify you where legally permitted.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: Shield,
    title: "Your Rights",
    content: [
      {
        subtitle: "GDPR Rights (EEA & UK Residents)",
        text: "Under the UK GDPR and EU GDPR, you have the right to: access a copy of your personal data; request correction of inaccurate data; request erasure ('right to be forgotten'); restrict or object to processing; and receive your data in a portable format.",
      },
      {
        subtitle: "CCPA Rights (California Residents)",
        text: "California residents have the right to know what personal information we collect, the right to delete personal information, and the right to opt out of the sale of personal information (we do not sell personal information).",
      },
      {
        subtitle: "How to Exercise Your Rights",
        text: "To exercise any of these rights, contact us at support@hpbooks.uk. We will respond within 30 days. We may need to verify your identity before processing your request.",
      },
    ],
  },
  {
    id: "data-retention",
    icon: Clock,
    title: "Data Retention",
    content: [
      {
        subtitle: "Account Data",
        text: "We retain your account and profile data for as long as your account remains active. If you request account deletion, we will remove your personal data within 30 days, subject to the exceptions below.",
      },
      {
        subtitle: "Purchase & Financial Records",
        text: "Transaction records are retained for 7 years to comply with UK tax law (HMRC requirements) and financial regulations. This data is stored securely and is not used for any other purpose.",
      },
      {
        subtitle: "Deletion Requests",
        text: "You may request deletion of your account and personal data at any time by contacting support@hpbooks.uk. We will confirm deletion within 30 days.",
      },
    ],
  },
  {
    id: "childrens-privacy",
    icon: Baby,
    title: "Children's Privacy",
    content: [
      {
        subtitle: "Age Restriction",
        text: "Hbooks is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a child, please contact us immediately and we will delete it promptly.",
      },
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact & Complaints",
    content: [
      {
        subtitle: "Privacy Enquiries",
        text: "For any questions, requests, or complaints relating to this Privacy Policy or how we handle your data, please contact us at support@hpbooks.uk. We aim to respond to all enquiries within 5 business days.",
      },
      {
        subtitle: "Supervisory Authority",
        text: "If you are in the UK, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk. If you are in the EU, you may contact your local data protection authority.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto max-w-4xl px-4 py-14">
          <div className="flex items-center gap-3 text-primary mb-4">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            We believe privacy is a right, not a feature. This policy explains clearly and honestly
            what data Hbooks collects, why we collect it, and how we protect it.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">Last updated:</strong> March 22, 2025
            </span>
            <span>
              <strong className="text-foreground">Applies to:</strong> bookshop.hpbooks.uk
            </span>
            <span>
              <strong className="text-foreground">Jurisdiction:</strong> Ireland
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Quick nav */}
        <div className="mb-12 rounded-xl border border-border bg-card p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Contents
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="w-5 text-xs font-mono text-primary opacity-60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
                <ChevronRight className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <section key={section.id} id={section.id} className="scroll-mt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-heading text-xl font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                </div>

                <div className="ml-14 space-y-5">
                  {section.content.map((block) => (
                    <div
                      key={block.subtitle}
                      className="rounded-lg border border-border bg-card p-5"
                    >
                      <h3 className="mb-2 text-sm font-semibold text-foreground">
                        {block.subtitle}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {block.subtitle === "Privacy Enquiries" ||
                        block.subtitle === "Deletion Requests" ||
                        block.subtitle === "How to Exercise Your Rights" ? (
                          <>
                            {block.text.split("support@hpbooks.uk").map((part, idx, arr) =>
                              idx < arr.length - 1 ? (
                                <span key={idx}>
                                  {part}
                                  <a
                                    href="mailto:support@hpbooks.uk"
                                    className="text-primary hover:underline font-medium"
                                  >
                                    support@hpbooks.uk
                                  </a>
                                </span>
                              ) : (
                                <span key={idx}>{part}</span>
                              )
                            )}
                          </>
                        ) : (
                          block.text
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <Shield className="mx-auto h-8 w-8 text-primary mb-3" />
          <h3 className="font-heading text-lg font-bold text-foreground">
            Questions about your privacy?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            We're committed to transparency. If anything in this policy is unclear,
            or you'd like to exercise your rights, get in touch — we respond within 5 business days.
          </p>
          <a
            href="mailto:support@hpbooks.uk"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Mail className="h-4 w-4" />
            support@hpbooks.uk
          </a>
        </div>
      </div>
    </div>
  );
}