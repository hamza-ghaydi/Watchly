import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: string;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: '',
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('App crashed:', error, info);
        this.setState({ errorInfo: info.componentStack || '' });

        // Send error to server for logging
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        fetch('/api/client-error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
            },
            body: JSON.stringify({
                error: error.message,
                stack: error.stack,
                componentStack: info.componentStack,
                url: window.location.href,
                userAgent: navigator.userAgent,
            }),
        }).catch(() => {
            // Silently fail if logging fails
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        padding: 20,
                        background: '#070B14',
                        color: '#F5C518',
                        minHeight: '100vh',
                    }}
                >
                    <h2>Something went wrong</h2>
                    <p style={{ color: '#9CA3AF' }}>Please refresh the page</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#F5C518',
                            color: '#000',
                            padding: '8px 16px',
                            borderRadius: 8,
                            marginTop: 12,
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Refresh
                    </button>
                    {import.meta.env.DEV && (
                        <pre
                            style={{
                                color: 'red',
                                fontSize: 11,
                                marginTop: 20,
                                overflow: 'auto',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {this.state.error?.toString()}
                            {this.state.errorInfo}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
