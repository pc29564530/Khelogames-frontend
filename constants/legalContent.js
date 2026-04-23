// In-app legal content.

export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  lastUpdated: 'April 2026',
  intro:
    'This Privacy Policy describes how Kridagram ("we", "us", "our") collects, uses, and protects your information when you use the Kridagram mobile application.',
  sections: [
    {
      heading: '1. Information We Collect',
      body: [
        'Account information you provide when you sign up: full name, username, email address, and profile photo.',
        'Profile details you choose to add: bio, city, state, country, role, and sports preferences.',
        'Content you create: posts, comments, match incidents, tournament details, and media you upload.',
        'Device and usage information: device model, operating system version, and app interaction data used for diagnostics.',
      ],
    },
    {
      heading: '2. How We Use Your Information',
      body: [
        'To provide core features: showing tournaments, matches, and communities relevant to you.',
        'To personalize content based on your location and selected sport.',
        'To keep you signed in and secure your session.',
        'To improve the app and fix bugs through anonymous diagnostics.',
      ],
    },
    {
      heading: '3. Location Data',
      body: [
        'We use your approximate location (derived from your IP address or device GPS, with your permission) only to surface nearby tournaments, clubs, and matches.',
        'You can deny or revoke location permission at any time from your device settings. Core features remain available without it.',
      ],
    },
    {
      heading: '4. Media and Storage',
      body: [
        'When you upload photos or videos, those files are transferred to our servers and associated with your account.',
        'We access your media library only when you tap upload. We do not scan your gallery in the background.',
      ],
    },
    {
      heading: '5. Sharing',
      body: [
        'We do not sell your personal data.',
        'Content you post publicly (profile, posts, tournament entries) is visible to other Kridagram users.',
        'We may share limited data with service providers that help us operate the app (hosting, analytics), under contractual confidentiality obligations.',
      ],
    },
    {
      heading: '6. Data Retention',
      body: [
        'We retain your account data while your account is active.',
        'If you delete your account, we remove your personal information within 30 days, except where retention is required by law.',
      ],
    },
    {
      heading: '7. Your Rights',
      body: [
        'You can access, correct, or delete your profile information from Settings > Edit Profile.',
        'You can request full account deletion by contacting support@kridagram.com.',
      ],
    },
    {
      heading: '8. Children',
      body: [
        'Kridagram is not intended for users under the age of 13. We do not knowingly collect data from children.',
      ],
    },
    {
      heading: '9. Changes',
      body: [
        'We may update this policy from time to time. Material changes will be communicated through the app before they take effect.',
      ],
    },
    {
      heading: '10. Contact',
      body: [
        'Questions about this policy? Reach us at support@kridagram.com.',
      ],
    },
  ],
};

export const TERMS_AND_CONDITIONS = {
  title: 'Terms & Conditions',
  lastUpdated: 'April 2026',
  intro:
    'By using Kridagram, you agree to these Terms & Conditions. If you do not agree, please do not use the app.',
  sections: [
    {
      heading: '1. Eligibility',
      body: [
        'You must be at least 13 years old to use Kridagram. By creating an account you confirm you meet this requirement.',
      ],
    },
    {
      heading: '2. Your Account',
      body: [
        'You are responsible for the activity on your account and for keeping your login credentials secure.',
        'Do not share your account or impersonate another person.',
      ],
    },
    {
      heading: '3. Acceptable Use',
      body: [
        'You agree not to post content that is unlawful, harassing, hateful, sexually explicit, or infringes anyone else\'s rights.',
        'You agree not to disrupt the service, attempt to reverse engineer the app, or access it through unauthorized means.',
        'Tournament organizers and match scorers are responsible for the accuracy of the information they publish.',
      ],
    },
    {
      heading: '4. User Content',
      body: [
        'You retain ownership of the content you post.',
        'By posting, you grant Kridagram a non-exclusive, worldwide license to host, display, and distribute that content within the app.',
        'You are responsible for ensuring you have the rights to any media you upload.',
      ],
    },
    {
      heading: '5. Moderation',
      body: [
        'We may remove content or suspend accounts that violate these terms, without notice.',
        'You can report content or users from the app.',
      ],
    },
    {
      heading: '6. Service Availability',
      body: [
        'We work to keep the app running smoothly but do not guarantee uninterrupted availability.',
        'We may add, remove, or change features at any time.',
      ],
    },
    {
      heading: '7. Intellectual Property',
      body: [
        'The Kridagram name, logo, and app are our property. You may not copy or use them without permission, except as the app interface allows.',
      ],
    },
    {
      heading: '8. Disclaimer',
      body: [
        'Kridagram is provided "as is" without warranties of any kind.',
        'Match scores, tournament standings, and other user-generated information are provided by the community and may contain errors.',
      ],
    },
    {
      heading: '9. Limitation of Liability',
      body: [
        'To the fullest extent permitted by law, Kridagram is not liable for indirect, incidental, or consequential damages arising from your use of the app.',
      ],
    },
    {
      heading: '10. Termination',
      body: [
        'You may stop using Kridagram and delete your account at any time.',
        'We may suspend or terminate access if you violate these terms.',
      ],
    },
    {
      heading: '11. Governing Law',
      body: [
        'These terms are governed by the laws of the jurisdiction in which Kridagram is operated, without regard to conflict-of-law principles.',
      ],
    },
    {
      heading: '12. Changes',
      body: [
        'We may update these terms. Continued use of the app after an update means you accept the revised terms.',
      ],
    },
    {
      heading: '13. Contact',
      body: [
        'For questions about these terms, contact support@kridagram.com.',
      ],
    },
  ],
};

export const LEGAL_DOCS = {
  privacy: PRIVACY_POLICY,
  terms: TERMS_AND_CONDITIONS,
};
