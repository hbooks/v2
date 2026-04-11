import { ScrollText, BookOpen, RefreshCw, Crown, UserCheck, Copyright, CreditCard, AlertTriangle, Mail, ChevronRight } from "lucide-react";

const sections = [
  {
    id: "acceptance",
    icon: ScrollText,
    title: "Acceptance of Terms",
    content: [
      {
        subtitle: "Agreement to Terms",
        text: "By accessing or using Hbooks Stores at bookshop.hpbooks.uk ('the Service', 'Hbooks', 'we', 'us'), you confirm that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must not use the Service.",
      },
      {
        subtitle: "Changes to Terms",
        text: "We reserve the right to modify these terms at any time. We will notify registered users of material changes by email or in-app notice. Continued use of the Service following notification constitutes acceptance of the revised terms. The 'last updated' date at the top of this page reflects the most recent revision.",
      },
      {
        subtitle: "Eligibility",
        text: "You must be at least 13 years of age to use the Service. By using Hbooks, you represent that you meet this age requirement and that you have the legal capacity to enter into a binding agreement.",
      },
    ],
  },
  {
    id: "digital-products",
    icon: BookOpen,
    title: "Digital Products & Licences",
    content: [
      {
        subtitle: "Nature of Products",
        text: "All products sold through Hbooks are digital goods delivered by secure download. No physical items will be shipped. Download links are cryptographically signed and expire 24 hours after generation for security purposes.",
      },
      {
        subtitle: "Licence Grant",
        text: "Upon successful purchase, Hbooks grants you a non-exclusive, non-transferable, personal licence to download and use the digital content for your own private, non-commercial enjoyment. This licence is for your personal use only.",
      },
      {
        subtitle: "Restrictions",
        text: "You may not: reproduce, distribute, publicly display, or sublicense any purchased content; share download links or account credentials with others; use any content for commercial purposes; or attempt to remove or circumvent any digital rights management or security measures.",
      },
      {
        subtitle: "Re-download Policy",
        text: "Purchased content is accessible from your account for as long as your account remains active and Hbooks operates the Service. We strongly recommend that you retain your own copies after download.",
      },
    ],
  },
  {
    id: "refund-policy",
    icon: RefreshCw,
    title: "Refund Policy",
    content: [
      {
        subtitle: "Digital Goods — All Sales Final",
        text: "Due to the nature of digital products, all sales are final once a download link has been accessed or a digital product has been delivered to your account. We are unable to offer refunds or exchanges on digital goods that have been downloaded.",
      },
      {
        subtitle: "Technical Issues",
        text: "If you experience a technical failure that prevents you from accessing a product you have paid for — such as a broken download link, corrupted file, or failure of delivery — please contact support@hpbooks.uk within 7 days of purchase. We will investigate and remedy the issue promptly.",
      },
      {
        subtitle: "Duplicate Purchases",
        text: "If you accidentally purchase a product you already own, contact us within 48 hours with proof of both transactions and we will consider a refund or credit at our discretion.",
      },
    ],
  },
  {
    id: "membership",
    icon: Crown,
    title: "Membership Subscriptions",
    content: [
      {
        subtitle: "What Membership Includes",
        text: "An active Hbooks membership grants unlimited access to all digital content in the store for the duration of your subscription period, including exclusive scenes, deleted chapters, early releases, and any new content added during your membership term.",
      },
      {
        subtitle: "Billing & Auto-Renewal",
        text: "Membership subscriptions are billed on a recurring basis (monthly or annually) and auto-renew at the end of each billing period. You authorise us to charge your chosen payment method at the applicable rate unless you cancel before the renewal date.",
      },
      {
        subtitle: "Cancellation",
        text: "You may cancel your membership at any time from your account profile or by contacting support@hpbooks.uk. Cancellation takes effect at the end of the current billing period — you retain full access until your paid period expires. No partial refunds are issued for unused time.",
      },
      {
        subtitle: "Price Changes",
        text: "We may adjust membership pricing with at least 30 days' prior notice to existing subscribers. If you do not wish to continue at the new price, you may cancel before the change takes effect.",
      },
      {
        subtitle: "Access After Expiry",
        text: "Once a membership expires or is cancelled, access to member-exclusive content will be suspended. Previously purchased individual products remain accessible from your account.",
      },
    ],
  },
  {
    id: "account-responsibility",
    icon: UserCheck,
    title: "Account Responsibility",
    content: [
      {
        subtitle: "Account Security",
        text: "You are solely responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to use a strong, unique password and to log out of shared devices.",
      },
      {
        subtitle: "Unauthorised Access",
        text: "You agree to notify us immediately at support@hpbooks.uk if you become aware of any unauthorised use of your account or any other security breach. We will not be liable for any loss resulting from unauthorised use of your account.",
      },
      {
        subtitle: "Account Sharing",
        text: "Accounts are for individual use only. Sharing your account credentials or download links with others violates these terms and may result in immediate account suspension without refund.",
      },
      {
        subtitle: "Accurate Information",
        text: "You agree to provide accurate and current information when creating your account and to update your information if it changes. Providing false information may result in account termination.",
      },
    ],
  },
  {
    id: "intellectual-property",
    icon: Copyright,
    title: "Intellectual Property",
    content: [
      {
        subtitle: "Our Content",
        text: "All content available through Hbooks, including but not limited to digital books, exclusive scenes, deleted chapters, cover art, and website design, is protected by copyright, trademark, and other intellectual property laws. All rights are reserved by Hbooks or the respective rights holders.",
      },
      {
        subtitle: "Prohibited Use",
        text: "You may not reproduce, copy, redistribute, upload, post, display, publish, or transmit any content from Hbooks in any form or by any means without our prior written consent. This includes sharing files with others, posting content online, or using content in any commercial context.",
      },
      {
        subtitle: "DMCA & Takedown",
        text: "If you believe any content on Hbooks infringes your intellectual property rights, please contact us at support@hpbooks.uk with details of the alleged infringement. We take intellectual property seriously and will investigate all notices promptly.",
      },
    ],
  },
  {
    id: "payment-security",
    icon: CreditCard,
    title: "Payments & Security",
    content: [
      {
        subtitle: "Payment Processing",
        text: "All payments are processed securely through IntaSend, our third-party payment provider. By making a purchase, you agree to IntaSend's terms of service and privacy policy in addition to ours.",
      },
      {
        subtitle: "Payment Data",
        text: "Hbooks does not store, receive, or have access to your payment card details, bank account numbers, or mobile money PINs. All sensitive payment information is handled exclusively by IntaSend in accordance with PCI DSS standards.",
      },
      {
        subtitle: "Failed Transactions",
        text: "If a payment fails, you will be notified and no download links will be generated. Please contact your payment provider or our support team if you experience persistent payment issues.",
      },
    ],
  },
  {
    id: "liability",
    icon: AlertTriangle,
    title: "Limitation of Liability",
    content: [
      {
        subtitle: "Service Availability",
        text: "We aim to maintain a reliable and available service, but we do not guarantee uninterrupted or error-free access to Hbooks. The Service is provided 'as is' and 'as available' without warranties of any kind, express or implied.",
      },
      {
        subtitle: "Limitation",
        text: "To the maximum extent permitted by applicable law, Hbooks and its operators shall not be liable for any indirect, incidental, special, exemplary, or consequential damages arising out of or in connection with your use of the Service, including but not limited to loss of data, loss of profits, or business interruption.",
      },
      {
        subtitle: "Consumer Rights",
        text: "Nothing in these terms limits or excludes any rights you may have under applicable consumer protection legislation that cannot be excluded by contract, including your statutory rights as a consumer under UK law.",
      },
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact & Governing Law",
    content: [
      {
        subtitle: "Contact Us",
        text: "For questions about these terms, to report a concern, or to exercise any rights, contact us at support@hpbooks.uk. We aim to respond to all enquiries within 5 business days.",
      },
      {
        subtitle: "Governing Law",
        text: "These Terms of Service are governed by and construed in accordance with the laws of England and Wales. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto max-w-4xl px-4 py-14">
          <div className="flex items-center gap-3 text-primary mb-4">
            <ScrollText className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            These terms govern your use of Hbooks Stores. Please read them carefully —
            they explain your rights, our obligations, and the rules that keep our community fair.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">Last updated:</strong> March 21, 2025
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

                <div className="ml-14 space-y-4">
                  {section.content.map((block) => (
                    <div
                      key={block.subtitle}
                      className="rounded-lg border border-border bg-card p-5"
                    >
                      <h3 className="mb-2 text-sm font-semibold text-foreground">
                        {block.subtitle}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {block.text.includes("support@hpbooks.uk") ? (
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

        {/* Footer note */}
        <div className="mt-16 rounded-xl border border-border bg-card p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <ScrollText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-base font-bold text-foreground">
                Questions about these terms?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                If any part of these terms is unclear, or you have a concern about how
                Hbooks operates, we're always happy to explain.
              </p>
            </div>
            <a
              href="mailto:support@hpbooks.uk"
              className="shrink-0 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}