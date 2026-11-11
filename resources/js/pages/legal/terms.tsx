import { Head } from '@inertiajs/react';
import { FileText, CheckCircle2, ShieldAlert, Scale, HelpCircle, HardDrive, Share2, AlertCircle, Heart } from 'lucide-react';
import LegalLayout from '@/layouts/legal-layout';

interface Props {
    lastUpdated?: string;
}

const tableOfContents = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'description', title: '2. Description of Mementra' },
    { id: 'eligibility', title: '3. Eligibility & Account Registration' },
    { id: 'google-auth', title: '4. Google Authentication' },
    { id: 'google-drive', title: '5. Google Drive Integration' },
    { id: 'content-ownership', title: '6. User Content & Intellectual Property Ownership' },
    { id: 'shared-memories', title: '7. Shared Memories & Relationships' },
    { id: 'responsibilities', title: '8. User Responsibilities & Conduct' },
    { id: 'prohibited-activities', title: '9. Prohibited Activities' },
    { id: 'privacy', title: '10. Privacy & Personal Information' },
    { id: 'third-party-services', title: '11. Third-Party Services' },
    { id: 'service-availability', title: '12. Service Availability & Modifications' },
    { id: 'termination', title: '13. Account Termination & Deletion' },
    { id: 'mementra-ip', title: '14. Intellectual Property of Mementra' },
    { id: 'disclaimers', title: '15. Disclaimers of Warranties' },
    { id: 'limitation-liability', title: '16. Limitation of Liability' },
    { id: 'indemnification', title: '17. Indemnification' },
    { id: 'changes-to-terms', title: '18. Changes to These Terms' },
    { id: 'governing-law', title: '19. Governing Law & Dispute Resolution' },
    { id: 'contact', title: '20. Contact Information' },
];

export default function TermsOfService({ lastUpdated = 'November 10, 2026' }: Props) {
    return (
        <LegalLayout
            title="Terms of Service"
            description="The terms and conditions governing your access to and use of the Mementra personal memory and shared journaling platform."
            lastUpdated={lastUpdated}
            badge="User Agreement"
            activeTab="terms"
            toc={tableOfContents}
        >
            <Head title="Terms of Service — Mementra" />

            {/* 1. Acceptance of Terms */}
            <section id="acceptance" className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2.5 text-primary">
                    <FileText className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">1. Acceptance of Terms</h2>
                </div>
                <p className="text-muted-foreground">
                    These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;you&rdquo; or &ldquo;user&rdquo;) and <strong>Mementra</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), concerning your access to and use of the Mementra website, services, and applications at{' '}
                    <a href="https://mementra.site.je" className="text-primary underline underline-offset-4 hover:opacity-80">
                        https://mementra.site.je
                    </a>.
                </p>
                <p className="text-muted-foreground">
                    By accessing, browsing, registering an account, or authenticating via Google, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree with all of these Terms, you are expressly prohibited from using Mementra and must discontinue use immediately.
                </p>
            </section>

            {/* 2. Description of Mementra */}
            <section id="description" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Heart className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">2. Description of Mementra</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    Mementra is a private memory and relationship reflection web application designed to help individuals and couples author journal entries, record memories, track meaningful dates and reminders, visualize chronological timelines, export formatted keepsake books, and organize media through decentralized, per-user cloud storage integrations.
                </p>
            </section>

            {/* 3. Eligibility & Account Registration */}
            <section id="eligibility" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">3. Eligibility & Account Registration</h2>
                </div>
                <div className="space-y-3 text-muted-foreground text-xs sm:text-sm">
                    <p>
                        <strong>Age Requirement:</strong> You must be at least 18 years old, or the age of legal majority in your jurisdiction of residence, to create an account and use Mementra.
                    </p>
                    <p>
                        <strong>Account Accuracy:</strong> When registering, you agree to provide accurate, current, and complete information and maintain its accuracy. You are responsible for safeguarding your login credentials (passwords, passkeys, and two-factor recovery codes) and for all activities that occur under your account.
                    </p>
                </div>
            </section>

            {/* 4. Google Authentication */}
            <section id="google-auth" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <FileText className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">4. Google Authentication</h2>
                </div>
                <div className="space-y-3 text-muted-foreground text-xs sm:text-sm">
                    <p>
                        You may choose to register or authenticate using your Google account (&ldquo;Continue with Google&rdquo;). When doing so, you authorize Mementra to verify your identity and retrieve profile information in accordance with Google&apos;s permissions.
                    </p>
                    <p>
                        <strong>Account Linking Safeguards:</strong> To protect users against unauthorized account takeover, existing accounts created via email/password will only link to a Google identity if Google confirms the associated email address is verified (<code>email_verified === true</code>). Unverified Google identities cannot merge with existing accounts.
                    </p>
                </div>
            </section>

            {/* 5. Google Drive Integration */}
            <section id="google-drive" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <HardDrive className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">5. Google Drive Integration</h2>
                </div>
                <div className="space-y-3 text-muted-foreground text-xs sm:text-sm">
                    <p>
                        Mementra enables per-user personal Google Drive integration to store your media attachments. By connecting Google Drive:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li>You authorize Mementra to create and manage media files in a dedicated <code>Mementra</code> folder within your personal Google Drive account using the least-privilege <code>drive.file</code> scope.</li>
                        <li>You acknowledge that Google Drive is a third-party service operated by Google LLC. Your use of Google Drive is subject to the <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Terms of Service</a> and Google&apos;s storage quotas.</li>
                        <li>Mementra does not provide or guarantee Google Drive storage capacity. You are responsible for maintaining sufficient storage quota in your Google account.</li>
                        <li>You may disconnect your Google Drive connection at any time in Settings. Disconnection does not delete existing files from your Google Drive account, but Mementra will no longer be able to synchronize or display those files.</li>
                    </ul>
                </div>
            </section>

            {/* 6. User Content & Intellectual Property Ownership */}
            <section id="content-ownership" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Scale className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">6. User Content & Intellectual Property Ownership</h2>
                </div>
                <div className="space-y-3 text-muted-foreground text-xs sm:text-sm">
                    <p className="font-semibold text-foreground">
                        You Retain 100% Ownership of Your Content.
                    </p>
                    <p>
                        You retain all copyright, title, and intellectual property rights in any journal entries, stories, personal reflections, photos, videos, or other materials you submit or create on Mementra (&ldquo;User Content&rdquo;). We do not claim ownership of your memories or media.
                    </p>
                    <p>
                        <strong>Limited License Granted to Mementra:</strong> Solely to the extent necessary to provide the service to you, you grant Mementra a non-exclusive, worldwide, royalty-free, limited license to host, process, reproduce, stream, and display your User Content to you and to any user with whom you explicitly share it. This limited license ceases when you delete your content or terminate your account.
                    </p>
                </div>
            </section>

            {/* 7. Shared Memories & Relationships */}
            <section id="shared-memories" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Share2 className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">7. Shared Memories & Relationships</h2>
                </div>
                <div className="space-y-3 text-muted-foreground text-xs sm:text-sm">
                    <p>
                        Mementra allows users to form mutual relationship connections and share selected journal memories with their partner.
                    </p>
                    <p>
                        <strong>Independent Copies:</strong> When you share media with an authorized partner, that partner may choose to save a copy directly into their own personal Google Drive account (&ldquo;Save to Drive&rdquo;). That saved file becomes an independent copy owned by the partner.
                    </p>
                    <p>
                        <strong>Revocation & Dissolution:</strong> If you unshare a memory or end a relationship, mutual viewing permissions through Mementra terminate immediately. However, you acknowledge that independent copies previously saved by your partner into their personal Google Drive remain in their personal Google Drive account, beyond Mementra&apos;s technical control.
                    </p>
                </div>
            </section>

            {/* 8. User Responsibilities & Conduct */}
            <section id="responsibilities" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">8. User Responsibilities & Conduct</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    You represent and warrant that you own or have obtained all necessary rights, licenses, consents, and permissions for all User Content you upload or share, and that your content does not violate any applicable law or infringe upon the rights of any third party.
                </p>
            </section>

            {/* 9. Prohibited Activities */}
            <section id="prohibited-activities" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <ShieldAlert className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">9. Prohibited Activities</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    You agree not to use Mementra to:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-xs sm:text-sm">
                    <li>Upload or distribute content that is unlawful, defamatory, harassing, sexually exploitative, abusive, or infringing.</li>
                    <li>Attempt to gain unauthorized access to any accounts, computer systems, or networks connected to Mementra.</li>
                    <li>Interfere with, disrupt, or burden the infrastructure or operation of the service.</li>
                    <li>Introduce viruses, trojans, worms, logic bombs, or other malicious code.</li>
                    <li>Reverse engineer, decompile, or disassemble any aspect of Mementra&apos;s source code or underlying architecture.</li>
                    <li>Use automated scrapers, bots, or harvesting mechanisms without prior written authorization.</li>
                </ul>
            </section>

            {/* 10. Privacy & Personal Information */}
            <section id="privacy" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <FileText className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">10. Privacy & Personal Information</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    Your privacy is of paramount importance to us. Please review our{' '}
                    <a href="/privacy-policy" className="text-primary underline underline-offset-4">
                        Privacy Policy
                    </a>
                    , which is incorporated into and forms an integral part of these Terms.
                </p>
            </section>

            {/* 11. Third-Party Services */}
            <section id="third-party-services" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <HardDrive className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">11. Third-Party Services</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    Mementra interacts with third-party platforms, principally Google LLC for authentication and Google Drive API services. We have no control over and assume no responsibility for the availability, content, privacy policies, or practices of any third-party services.
                </p>
            </section>

            {/* 12. Service Availability & Modifications */}
            <section id="service-availability" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <AlertCircle className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">12. Service Availability & Modifications</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    We strive to maintain high availability and reliability. However, we do not guarantee uninterrupted, secure, or error-free operation. We reserve the right to modify, update, suspend, or discontinue any feature of Mementra at any time with or without notice. We are not liable to you or any third party for any modification, price change, suspension, or discontinuance of the service.
                </p>
            </section>

            {/* 13. Account Termination & Deletion */}
            <section id="termination" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <ShieldAlert className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">13. Account Termination & Deletion</h2>
                </div>
                <div className="space-y-3 text-muted-foreground text-xs sm:text-sm">
                    <p>
                        <strong>Termination by You:</strong> You may terminate your account at any time via <em>Settings &gt; Profile &gt; Delete Account</em>. Termination permanently deletes your user profile, journal entries, credentials, and relationship links in our database.
                    </p>
                    <p>
                        <strong>Termination by Us:</strong> We reserve the right to suspend or terminate your account and access to Mementra, with or without notice, in the event that you breach these Terms or engage in activities harmful to the platform or other users.
                    </p>
                </div>
            </section>

            {/* 14. Intellectual Property of Mementra */}
            <section id="mementra-ip" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Scale className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">14. Intellectual Property of Mementra</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    Except for your User Content, all content, features, visual design, graphics, software, code, logos, and trademarks on Mementra are the exclusive intellectual property of Mementra and are protected by applicable copyright, trademark, and intellectual property laws.
                </p>
            </section>

            {/* 15. Disclaimers of Warranties */}
            <section id="disclaimers" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <AlertCircle className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">15. Disclaimers of Warranties</h2>
                </div>
                <div className="rounded-xl border border-border/70 bg-card/60 p-4 text-xs sm:text-sm text-muted-foreground space-y-2">
                    <p className="uppercase font-semibold text-foreground text-xs">
                        AS-IS BASIS
                    </p>
                    <p>
                        MEMENTRA IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
                    </p>
                    <p>
                        WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE CORRECTED. YOU ARE SOLELY RESPONSIBLE FOR MAINTAINING INDEPENDENT BACKUPS OF YOUR CHERISHED PHOTOS AND MEMORIES.
                    </p>
                </div>
            </section>

            {/* 16. Limitation of Liability */}
            <section id="limitation-liability" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Scale className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">16. Limitation of Liability</h2>
                </div>
                <div className="rounded-xl border border-border/70 bg-card/60 p-4 text-xs sm:text-sm text-muted-foreground space-y-2">
                    <p>
                        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MEMENTRA, ITS OPERATORS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF DATA, LOSS OF GOODWILL, OR STORAGE FAILURE) ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR INABILITY TO ACCESS THE SERVICE.
                    </p>
                </div>
            </section>

            {/* 17. Indemnification */}
            <section id="indemnification" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <ShieldAlert className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">17. Indemnification</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    You agree to indemnify, defend, and hold harmless Mementra and its operators from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys&apos; fees) arising out of or in any way connected with your violation of these Terms or your User Content.
                </p>
            </section>

            {/* 18. Changes to These Terms */}
            <section id="changes-to-terms" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <FileText className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">18. Changes to These Terms</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    We reserve the right to revise these Terms at any time by posting the updated version on this page with a revised &ldquo;Effective Date.&rdquo; Your continued use of Mementra following the posting of changes constitutes your acceptance of such changes.
                </p>
            </section>

            {/* 19. Governing Law & Dispute Resolution */}
            <section id="governing-law" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Scale className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">19. Governing Law & Dispute Resolution</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    These Terms shall be governed by and construed in accordance with the laws of <em>[Governing Jurisdiction / Country to be confirmed by Project Owner]</em>, without regard to its conflict of law principles. Any legal action or proceeding arising under these Terms shall be brought exclusively in the courts located in <em>[City / Jurisdiction to be confirmed by Project Owner]</em>.
                </p>
            </section>

            {/* 20. Contact Information */}
            <section id="contact" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8 pb-4">
                <div className="flex items-center gap-2.5 text-primary">
                    <HelpCircle className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">20. Contact Information</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    For inquiries regarding these Terms of Service or our legal practices, please reach out to:
                </p>
                <div className="rounded-2xl border border-border/70 bg-card/60 p-5 space-y-2 text-xs sm:text-sm">
                    <p className="font-semibold text-foreground">Mementra Legal &amp; Compliance</p>
                    <p className="text-muted-foreground">
                        Email:{' '}
                        <span className="font-mono text-primary font-medium">
                            legal@mementra.site.je
                        </span>{' '}
                        <span className="text-[11px] text-muted-foreground italic">(Verification in Progress)</span>
                    </p>
                    <p className="text-muted-foreground">
                        Website:{' '}
                        <a href="https://mementra.site.je" className="text-primary underline underline-offset-4">
                            https://mementra.site.je
                        </a>
                    </p>
                    <p className="text-muted-foreground text-[11px] pt-1">
                        Operator Entity: <em>[Legal Entity Name / Operator to be confirmed by Project Owner]</em>
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
}

