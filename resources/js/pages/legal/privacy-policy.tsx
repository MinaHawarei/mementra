import { Head } from '@inertiajs/react';
import { ShieldCheck, Lock, HardDrive, Share2, Trash2, Key, Info, Mail, AlertTriangle, ExternalLink } from 'lucide-react';
import LegalLayout from '@/layouts/legal-layout';

interface Props {
    lastUpdated?: string;
}

const tableOfContents = [
    { id: 'introduction', title: 'Introduction & Scope' },
    { id: 'information-we-collect', title: 'Information We Collect' },
    { id: 'how-we-use-information', title: 'How We Use Information' },
    { id: 'google-api-services', title: 'Google OAuth & Google API Services' },
    { id: 'google-drive-storage', title: 'Google Drive & File Storage Architecture' },
    { id: 'sharing-and-visibility', title: 'Sharing, Relationships & Independent Copies' },
    { id: 'data-retention-deletion', title: 'Data Retention & Deletion' },
    { id: 'data-security', title: 'Data Security Measures' },
    { id: 'third-party-services', title: 'Third-Party Service Providers' },
    { id: 'user-rights', title: 'Your Rights & Choices' },
    { id: 'childrens-privacy', title: "Children's Privacy" },
    { id: 'international-transfers', title: 'International Data Transfers' },
    { id: 'policy-changes', title: 'Changes to This Policy' },
    { id: 'contact-us', title: 'Contact Information' },
];

export default function PrivacyPolicy({ lastUpdated = 'November 10, 2026' }: Props) {
    return (
        <LegalLayout
            title="Privacy Policy"
            description="How Mementra collects, uses, and safeguards your personal information, memories, and personal Google Drive cloud storage."
            lastUpdated={lastUpdated}
            badge="Privacy & Data Protection"
            activeTab="privacy"
            toc={tableOfContents}
        >
            <Head title="Privacy Policy — Mementra" />

            {/* A. Introduction */}
            <section id="introduction" className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2.5 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">1. Introduction & Scope</h2>
                </div>
                <p className="text-muted-foreground">
                    Welcome to <strong>Mementra</strong> we, available at{' '}
                    <a href="https://mementra.site.je" className="text-primary underline underline-offset-4 hover:opacity-80">
                        https://mementra.site.je
                    </a>. Mementra is a private memory management and shared journaling web application designed to help individuals and couples capture personal moments, celebrate life milestones, organize visual media, and preserve lasting narratives across time.
                </p>
                <p className="text-muted-foreground">
                    We believe your personal memories and emotional reflections belong solely to you. This Privacy Policy details our transparent commitments: what information we collect, why we collect it, how your personal Google Drive storage integration operates, and how you retain total ownership over your data.
                </p>
            </section>

            {/* B. Information We Collect */}
            <section id="information-we-collect" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Info className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">2. Information We Collect</h2>
                </div>
                <p className="text-muted-foreground">
                    We collect only the information necessary to provide, protect, and enhance Mementra&apos;s memory preservation features. We collect information in the following categories:
                </p>
                <div className="space-y-4">
                    <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
                        <h3 className="font-semibold text-foreground text-sm">A. Account & Identity Information</h3>
                        <ul className="list-disc pl-5 text-xs sm:text-sm text-muted-foreground space-y-1">
                            <li><strong>Email & Password Registration:</strong> Your full name, email address, and a salted, cryptographically hashed representation of your password.</li>
                            <li><strong>Google Identity Authentication:</strong> When authenticating via Google (&ldquo;Continue with Google&rdquo;), we receive your Google account ID (<code>sub</code>), verified email address, full name, and profile avatar URL (<code>picture</code>).</li>
                            <li><strong>Passkeys (WebAuthn / FIDO2):</strong> When you enroll a biometric or hardware passkey, we store only your public key credential and credential ID. Your biometric data and private keys never leave your personal physical device.</li>
                        </ul>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
                        <h3 className="font-semibold text-foreground text-sm">B. Journal Entries & Memory Content</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Content you author within the application, including memory titles, rich narrative text blocks, associated dates, emotional mood tags, locations, weather observations, timeline milestones, and recurring reminder schedules.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
                        <h3 className="font-semibold text-foreground text-sm">C. Media Metadata</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            When you attach photos or images to your memories, Mementra stores <strong>only metadata</strong> in its database (such as the original file name, MIME type, file byte size, and Google Drive file identifier). The underlying binary photo files are stored directly in your personal Google Drive account.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
                        <h3 className="font-semibold text-foreground text-sm">D. Relationship & Sharing Data</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Records of mutual relationship links established between you and your partner, sharing permissions you grant, and independent saved copy records created when a partner requests a duplicate in their personal Google Drive.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
                        <h3 className="font-semibold text-foreground text-sm">E. Technical Logs & Device Information</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Standard server diagnostic data, including Internet Protocol (IP) address, user agent, browser type, operating system, and request timestamps, utilized strictly for application performance, rate limiting, and security defense.
                        </p>
                    </div>
                </div>
            </section>

            {/* C. How We Use Information */}
            <section id="how-we-use-information" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Key className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">3. How We Use Information</h2>
                </div>
                <p className="text-muted-foreground">
                    We process your information exclusively to provide, maintain, and safeguard our memory services:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-2 text-xs sm:text-sm">
                    <li><strong>Account Management & Authentication:</strong> Creating your user account, verifying your identity, authenticating login sessions, and maintaining security credentials.</li>
                    <li><strong>Memory & Journal Preservation:</strong> Storing, organizing, and rendering your journal entries, milestones, and living timeline.</li>
                    <li><strong>Personal Google Drive Integration:</strong> Uploading, retrieving, and organizing your photo memories within a dedicated folder in your personal Google Drive.</li>
                    <li><strong>Partner Sharing & Collaboration:</strong> Displaying shared entries to your designated partner and allowing them to save independent copies to their personal Drive upon request.</li>
                    <li><strong>PDF Export Generation:</strong> Compiling your selected memories into downloadable keepsake books.</li>
                    <li><strong>Security & Abuse Prevention:</strong> Detecting fraudulent activity, enforcing authorization policies, maintaining rate limits, and securing user sessions.</li>
                </ul>
            </section>

            {/* D. Google API Services & OAuth Disclosures */}
            <section id="google-api-services" className="space-y-5 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Lock className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">4. Google OAuth & Google API Services</h2>
                </div>

                <div className="rounded-2xl border-2 border-indigo-500/30 bg-indigo-500/5 p-5 sm:p-6 space-y-3">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <span>Google API Services User Data Policy Compliance</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                        Mementra&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                        <a
                            href="https://developers.google.com/terms/api-services-user-data-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4 inline-flex items-center gap-0.5"
                        >
                            Google API Services User Data Policy
                            <ExternalLink className="h-3 w-3 inline" />
                        </a>
                        , including the Limited Use requirements.
                    </p>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5 pt-1">
                        <li><strong>No Selling of Data:</strong> Mementra never sells, rents, or monetizes Google user data or personal memories to any third party, data broker, or marketer.</li>
                        <li><strong>No Advertising:</strong> We do not use or transfer information received from Google APIs for serving advertisements, including personalized, retargeted, or interest-based advertising.</li>
                        <li><strong>No AI Model Training:</strong> We do not use Google user data or your uploaded photos to train, tune, or improve generalized artificial intelligence or machine learning models.</li>
                        <li><strong>Human Access Restrictions:</strong> Human personnel do not read or inspect your Google user data or uploaded files unless: (1) you provide affirmative consent for specific technical support; (2) it is strictly necessary for security investigations; or (3) required by applicable law.</li>
                    </ul>
                </div>

                <div className="space-y-3 text-muted-foreground text-xs sm:text-sm">
                    <h3 className="font-semibold text-foreground text-sm">OAuth Scopes Requested & Least Privilege</h3>
                    <p>
                        Mementra strictly requests the minimum necessary permissions required to operate:
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-border/60 rounded-xl overflow-hidden">
                            <thead className="bg-muted/50 border-b border-border/60 font-semibold text-foreground">
                                <tr>
                                    <th className="p-3">Scope</th>
                                    <th className="p-3">Classification</th>
                                    <th className="p-3">Exact Purpose</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                <tr>
                                    <td className="p-3 font-mono text-[11px]">openid</td>
                                    <td className="p-3">Identity</td>
                                    <td className="p-3">Authenticates your identity using OpenID Connect.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono text-[11px]">.../auth/userinfo.email</td>
                                    <td className="p-3">Identity</td>
                                    <td className="p-3">Retrieves your verified Google email address for account identification.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono text-[11px]">.../auth/userinfo.profile</td>
                                    <td className="p-3">Identity</td>
                                    <td className="p-3">Retrieves your name and avatar picture to display on your profile.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono text-[11px]">.../auth/drive.file</td>
                                    <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400">Least-Privilege Storage</td>
                                    <td className="p-3">
                                        Allows Mementra to create, view, and manage <strong>only the files and folders created by Mementra</strong>. It gives Mementra <strong>NO access</strong> to browse, read, or edit any other personal files, photos, or documents in your Google Drive.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 className="font-semibold text-foreground text-sm pt-2">Token Management & Encryption at Rest</h3>
                    <p>
                        OAuth access tokens and offline refresh tokens are encrypted at rest in Mementra&apos;s database using AES-256 encryption. Tokens are decrypted only transiently in memory when performing authorized storage operations and are never transmitted to client browsers or third parties.
                    </p>

                    <h3 className="font-semibold text-foreground text-sm pt-2">Optional Authorization & Disconnection</h3>
                    <p>
                        Google Drive integration is optional. You may authenticate with Google while declining Drive storage permissions during login. You may also disconnect your Google Drive connection at any time in <em>Settings &gt; Integrations</em>, which immediately revokes our authorization with Google and clears all stored tokens.
                    </p>
                </div>
            </section>

            {/* E. Google Drive & File Storage */}
            <section id="google-drive-storage" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <HardDrive className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">5. Google Drive & File Storage Architecture</h2>
                </div>
                <p className="text-muted-foreground">
                    Mementra utilizes a <strong>decentralized, user-owned cloud storage model</strong>. Instead of storing your media binaries on a centralized application server:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-2 text-xs sm:text-sm">
                    <li><strong>Original Files Stay in Your Drive:</strong> Media you upload is stored directly in your own personal Google Drive under a dedicated folder titled <code>Mementra</code>.</li>
                    <li><strong>Metadata Only in Mementra:</strong> Mementra&apos;s database stores only organizational metadata (file names, sizes, MIME types, and file IDs) necessary to link photos to your journal entries and timeline.</li>
                    <li><strong>Your Files Remain Yours Upon Disconnection:</strong> If you disconnect your Google Drive from Mementra, your media files <strong>remain untouched in your personal Google Drive</strong>. Mementra deletes its stored tokens and will simply no longer have access to display or synchronize those files.</li>
                </ul>
            </section>

            {/* F. Sharing and Visibility */}
            <section id="sharing-and-visibility" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Share2 className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">6. Sharing, Relationships & Independent Copies</h2>
                </div>
                <div className="space-y-3 text-muted-foreground text-xs sm:text-sm">
                    <p>
                        <strong>Private by Default:</strong> All entries, dates, and media are strictly private and visible only to you unless you explicitly choose to share them with a connected partner.
                    </p>
                    <p>
                        <strong>Mutual Partner Links:</strong> You can form a mutual relationship link with a partner through mutual invitation. Sharing an entry allows your designated partner to view the text, dates, and media associated with that memory.
                    </p>
                    <p>
                        <strong>Independent Copies (&ldquo;Save to Drive&rdquo;):</strong> When you share media with a partner, Mementra allows the recipient to save an independent duplicate copy of the media into their own personal Google Drive (in their dedicated <code>Saved Memories</code> folder). This independent copy is owned by the partner.
                    </p>
                    <p>
                        <strong>Revocation & Ending Relationships:</strong> If you unshare a memory or end a relationship, reciprocal viewing access through Mementra is immediately revoked. However, if your partner previously saved an independent copy into their personal Google Drive, that independent file remains in their personal Google Drive account.
                    </p>
                </div>
            </section>

            {/* G. Data Retention & Deletion */}
            <section id="data-retention-deletion" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Trash2 className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">7. Data Retention & Deletion</h2>
                </div>
                <div className="space-y-3 text-muted-foreground text-xs sm:text-sm">
                    <p>
                        <strong>Content Deletion:</strong> You can delete individual journal entries, events, or reminders at any time. When you delete a memory in Mementra, the database record is permanently removed. When you delete a media attachment, Mementra deletes the database metadata and requests the deletion of the associated file from your Google Drive.
                    </p>
                    <p>
                        <strong>Permanent Account Deletion:</strong> You have the right to permanently delete your Mementra account at any time via <em>Settings &gt; Profile &gt; Delete Account</em>. This permanently and irrevocably deletes your user profile, credentials, passkeys, relationship links, journal entries, and encrypted OAuth tokens from Mementra&apos;s database.
                    </p>
                    <p className="rounded-xl border border-border/70 bg-muted/30 p-3 text-xs">
                        <strong>Note Regarding Google Drive Files:</strong> Deleting your Mementra account deletes our database records and access credentials. Files already present in your personal Google Drive account will remain in your Google Drive unless you choose to delete them directly through Google Drive.
                    </p>
                </div>
            </section>

            {/* H. Data Security */}
            <section id="data-security" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Lock className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">8. Data Security Measures</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    We maintain technical and organizational safeguards designed to protect your information against unauthorized access, loss, or alteration:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1.5 text-xs sm:text-sm">
                    <li><strong>Encryption in Transit:</strong> All web requests, API interactions, and data transmissions are encrypted using Transport Layer Security (TLS/HTTPS).</li>
                    <li><strong>Encryption at Rest:</strong> OAuth tokens, refresh tokens, and sensitive recovery codes are encrypted at rest using AES-256 encryption.</li>
                    <li><strong>Authentication Hardening:</strong> We support modern Passkey authentication (WebAuthn), password hashing via Bcrypt, and optional Two-Factor Authentication (TOTP).</li>
                    <li><strong>Authorization Gates:</strong> Strict server-side policies ensure users can access only their own private memories or memories explicitly shared with them.</li>
                </ul>
                <p className="text-xs text-muted-foreground italic">
                    While we maintain rigorous security protocols, no internet transmission or electronic storage method is 100% infallible. Mementra does not provide client-side end-to-end encryption.
                </p>
            </section>

            {/* I. Third-Party Services */}
            <section id="third-party-services" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <ExternalLink className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">9. Third-Party Service Providers</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    We do not share your personal data with third parties except as necessary to provide core application infrastructure:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-xs sm:text-sm">
                    <li><strong>Google LLC:</strong> For Google OAuth identity authentication and Google Drive API v3 storage integration.</li>
                    <li><strong>Transactional Email Infrastructure:</strong> For sending essential account notices, verification emails, and reminder alerts.</li>
                </ul>
                <p className="text-xs text-muted-foreground">
                    Mementra does not use third-party behavioral analytics, tracking cookies, advertising networks, or data brokers.
                </p>
            </section>

            {/* J. User Rights & Choices */}
            <section id="user-rights" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Key className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">10. Your Rights & Choices</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    Depending on your jurisdiction (such as under GDPR or CCPA), you have rights regarding your personal data:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1.5 text-xs sm:text-sm">
                    <li><strong>Access & Review:</strong> View all your personal memories, journals, and profile details anytime via your dashboard.</li>
                    <li><strong>Data Portability:</strong> Export your memory entries into formatted keepsake PDF files.</li>
                    <li><strong>Correction:</strong> Edit your journal entries, memories, names, and preferences whenever you wish.</li>
                    <li><strong>Revocation of Google Access:</strong> Disconnect Google Drive in Settings or revoke Mementra&apos;s access directly in your{' '}
                        <a
                            href="https://myaccount.google.com/permissions"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4"
                        >
                            Google Account Permissions
                        </a>.
                    </li>
                    <li><strong>Erasure:</strong> Permanently delete individual entries or your entire account at will.</li>
                </ul>
            </section>

            {/* K. Children's Privacy */}
            <section id="childrens-privacy" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <AlertTriangle className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">11. Children&apos;s Privacy</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    Mementra is intended for adults, couples, and individuals managing personal memories. We do not knowingly collect or solicit personal information from children under the age of 13 (or under 16 within the European Economic Area / UK). If we become aware that we have collected information from a child without verified parental consent, we will promptly delete that information.
                </p>
            </section>

            {/* L. International Data Transfers */}
            <section id="international-transfers" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">12. International Data Transfers</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    Mementra and its service infrastructure operate globally. By accessing Mementra, you understand that your data may be transferred to and processed in countries where data protection standards may differ from those of your home jurisdiction. We implement reasonable safeguards to ensure your information remains protected.
                </p>
            </section>

            {/* M. Changes to This Policy */}
            <section id="policy-changes" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8">
                <div className="flex items-center gap-2.5 text-primary">
                    <Info className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">13. Changes to This Policy</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    We may update this Privacy Policy from time to time to reflect changes in our legal obligations, features, or Google API requirements. When changes are made, the revised policy will be posted on this page with an updated &ldquo;Effective Date.&rdquo; We encourage you to review this policy periodically.
                </p>
            </section>

            {/* N. Contact Information */}
            <section id="contact-us" className="space-y-4 scroll-mt-24 border-t border-border/50 pt-8 pb-4">
                <div className="flex items-center gap-2.5 text-primary">
                    <Mail className="h-5 w-5" />
                    <h2 className="text-xl font-bold tracking-tight text-foreground">14. Contact Information</h2>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                    If you have questions, feedback, or requests regarding this Privacy Policy or your personal information, please contact us:
                </p>
                <div className="rounded-2xl border border-border/70 bg-card/60 p-5 space-y-2 text-xs sm:text-sm">
                    <p className="font-semibold text-foreground">Mementra Privacy &amp; Data Protection</p>
                    <p className="text-muted-foreground">
                        Email:{' '}
                        <span className="font-mono text-primary font-medium">
                            privacy@mementra.site.je
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

