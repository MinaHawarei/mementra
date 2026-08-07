import { Form, Head, usePage, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth & {
        user: {
            locale?: string;
            timezone?: string;
        };
    };
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    const { data: prefData, setData: setPrefData, patch: patchPref, processing: prefProcessing } = useForm({
        locale: auth.user.locale ?? 'en',
        timezone: auth.user.timezone ?? 'UTC',
    });

    const handlePrefSubmit = (e: FormEvent) => {
        e.preventDefault();
        patchPref('/settings/preferences');
    };

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile Information"
                    description="Update your name and email address"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to re-send the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save Profile
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <div className="space-y-6 pt-6 border-t">
                <Heading
                    variant="small"
                    title="Preferences"
                    description="Set your preferred language and timezone"
                />

                <form onSubmit={handlePrefSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="locale">Language</Label>
                        <select
                            id="locale"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                            value={prefData.locale}
                            onChange={(e) => setPrefData('locale', e.target.value)}
                        >
                            <option value="en">English (LTR)</option>
                            <option value="ar">العربية (Arabic RTL)</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                            id="timezone"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                            value={prefData.timezone}
                            onChange={(e) => setPrefData('timezone', e.target.value)}
                        >
                            <option value="UTC">UTC (Universal Coordinated Time)</option>
                            <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                            <option value="Asia/Riyadh">Asia/Riyadh (AST)</option>
                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                            <option value="Europe/London">Europe/London (GMT/BST)</option>
                            <option value="America/New_York">America/New_York (EST/EDT)</option>
                            <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                        </select>
                    </div>

                    <Button type="submit" disabled={prefProcessing}>
                        Save Preferences
                    </Button>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
