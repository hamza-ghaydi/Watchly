import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function UserForm() {
    const { user } = usePage<{ user: User | null }>().props;
    const isEditing = !!user;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/admin/users' },
        { title: isEditing ? 'Edit User' : 'Create User', href: '#' },
    ];

    const form = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        role: user?.role || 'user',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing) {
            form.patch(`/admin/users/${user.id}`);
        } else {
            form.post('/admin/users');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit User' : 'Create User'} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-2xl">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {isEditing ? 'Edit User' : 'Create User'}
                    </h1>
                    <p className="text-neutral-400 mt-1">
                        {isEditing ? 'Update user information' : 'Add a new user to the system'}
                    </p>
                </div>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-neutral-300">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                                    placeholder="John Doe"
                                />
                                {form.errors.name && (
                                    <div className="text-red-400 text-sm mt-1">{form.errors.name}</div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-neutral-300">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                                    placeholder="john@example.com"
                                />
                                {form.errors.email && (
                                    <div className="text-red-400 text-sm mt-1">{form.errors.email}</div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-neutral-300">
                                    Password {isEditing && '(leave blank to keep current)'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                                    placeholder={isEditing ? 'Leave blank to keep current' : 'Enter password'}
                                />
                                {form.errors.password && (
                                    <div className="text-red-400 text-sm mt-1">{form.errors.password}</div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation" className="text-neutral-300">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                                    placeholder="Confirm password"
                                />
                            </div>

                            <div>
                                <Label htmlFor="role" className="text-neutral-300">
                                    Role
                                </Label>
                                <Select
                                    value={form.data.role}
                                    onValueChange={(value) => form.setData('role', value)}
                                >
                                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-800 border-neutral-700">
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.role && (
                                    <div className="text-red-400 text-sm mt-1">{form.errors.role}</div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="bg-[#F5C518] text-black hover:bg-[#F5C518]/90"
                                >
                                    {form.processing ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="border-neutral-700"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
