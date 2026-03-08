import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '/admin/settings' },
];

export default function Settings() {
    const { api_key } = usePage<{ api_key: string }>().props;
    const [showKey, setShowKey] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [testing, setTesting] = useState(false);

    const form = useForm({
        api_key: api_key || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/settings');
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const response = await axios.post('/admin/settings/test');
            setTestResult({
                success: response.data.success,
                message: response.data.success
                    ? `Connection successful! Found: ${response.data.movie_title}`
                    : response.data.error,
            });
        } catch (error: any) {
            setTestResult({
                success: false,
                message: error.response?.data?.error || 'Test failed',
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-2xl">
                <div>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-neutral-400 mt-1">Configure OMDB API settings</p>
                </div>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-white">OMDB API Configuration</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Get your free API key from{' '}
                            <a
                                href="https://www.omdbapi.com/apikey.aspx"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#F5C518] hover:underline"
                            >
                                omdbapi.com
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="api_key" className="text-neutral-300">
                                    API Key
                                </Label>
                                <div className="flex gap-2 mt-2">
                                    <div className="relative flex-1">
                                        <Input
                                            id="api_key"
                                            type={showKey ? 'text' : 'password'}
                                            value={form.data.api_key}
                                            onChange={(e) => form.setData('api_key', e.target.value)}
                                            className="bg-neutral-800 border-neutral-700 text-white pr-10"
                                            placeholder="Enter your OMDB API key"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowKey(!showKey)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                                        >
                                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleTest}
                                        disabled={testing || !form.data.api_key}
                                        className="border-neutral-700"
                                    >
                                        {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
                                    </Button>
                                </div>
                                {form.errors.api_key && (
                                    <div className="text-red-400 text-sm mt-1">{form.errors.api_key}</div>
                                )}
                            </div>

                            {testResult && (
                                <div
                                    className={`flex items-center gap-2 p-3 rounded ${
                                        testResult.success
                                            ? 'bg-green-900/20 text-green-400'
                                            : 'bg-red-900/20 text-red-400'
                                    }`}
                                >
                                    {testResult.success ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        <XCircle className="h-5 w-5" />
                                    )}
                                    <span className="text-sm">{testResult.message}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-[#F5C518] text-black hover:bg-[#F5C518]/90"
                            >
                                {form.processing ? 'Saving...' : 'Save API Key'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
