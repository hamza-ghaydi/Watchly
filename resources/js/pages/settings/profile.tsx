import { Transition } from '@headlessui/react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';
import { Upload, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit(),
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(auth.user.avatar || null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        bio: auth.user.bio || '',
        avatar: undefined as File | undefined,
        _method: 'PATCH',
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setData('avatar', undefined);
        setAvatarPreview(auth.user.avatar || null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create a clean data object, removing avatar if it's undefined
        const submitData: any = {
            name: data.name,
            email: data.email,
            bio: data.bio || '', // Ensure bio is never null
            _method: 'PATCH',
        };
        
        // Only include avatar if it's actually a file
        if (data.avatar instanceof File) {
            submitData.avatar = data.avatar;
        }
        
        post('/settings/profile', {
            data: submitData,
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="avatar">Profile Picture</Label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden"
                                    style={{ background: avatarPreview ? 'transparent' : 'var(--gold)', color: '#0D1117' }}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        auth.user.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <label htmlFor="avatar-upload">
                                        <Button type="button" variant="outline" size="sm" asChild>
                                            <span className="cursor-pointer">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload
                                            </span>
                                        </Button>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />
                                    </label>
                                    {avatarPreview && avatarPreview !== auth.user.avatar && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={removeAvatar}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <InputError className="mt-2" message={errors.avatar} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Bio</Label>

                            <Textarea
                                id="bio"
                                className="mt-1 block w-full"
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                placeholder="Tell us about yourself..."
                                rows={4}
                                maxLength={160}
                            />

                            <InputError className="mt-2" message={errors.bio} />
                            <p className="text-xs text-muted-foreground">
                                {data.bio.length}/160 characters
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} data-test="update-profile-button">
                                Save
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
