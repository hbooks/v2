export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Privacy Policy</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p><strong className="text-foreground">Last updated:</strong> April 1, 2026</p>

        <h2 className="font-heading text-xl font-bold text-foreground">1. Information We Collect</h2>
        <p>We collect information you provide directly, including: name, email address, username, and purchase history. We also collect technical data such as IP address, browser type, and device information.</p>

        <h2 className="font-heading text-xl font-bold text-foreground">2. How We Use Your Information</h2>
        <p>We use your information to: process purchases, manage your account, send important updates about your orders, improve our services, and comply with legal obligations.</p>

        <h2 className="font-heading text-xl font-bold text-foreground">3. Cookies</h2>
        <p>We use essential cookies for authentication and session management. We do not use third-party tracking cookies for advertising.</p>

        <h2 className="font-heading text-xl font-bold text-foreground">4. Data Security</h2>
        <p>We implement industry-standard security measures to protect your personal data. Payment information is processed by IntaSend and is never stored on our servers.</p>

        <h2 className="font-heading text-xl font-bold text-foreground">5. Data Sharing</h2>
        <p>We do not sell your personal information. We only share data with service providers necessary for operating the store (payment processing, email delivery).</p>

        <h2 className="font-heading text-xl font-bold text-foreground">6. Your Rights (GDPR/CCPA)</h2>
        <p>You have the right to: access your personal data, request correction of inaccurate data, request deletion of your data, object to processing, and export your data. Contact us to exercise these rights.</p>

        <h2 className="font-heading text-xl font-bold text-foreground">7. Data Retention</h2>
        <p>We retain your account data for as long as your account is active. Purchase records are kept for 7 years for legal and tax compliance. You may request deletion at any time.</p>

        <h2 className="font-heading text-xl font-bold text-foreground">8. Children's Privacy</h2>
        <p>Our Service is not intended for children under 13. We do not knowingly collect personal information from children.</p>

        <h2 className="font-heading text-xl font-bold text-foreground">9. Contact</h2>
        <p>For privacy inquiries, contact us at <a href="mailto:support@hpbooks.uk" className="text-primary hover:underline">support@hpbooks.uk</a>.</p>
      </div>
    </div>
  );
}
