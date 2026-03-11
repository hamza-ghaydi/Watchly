import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Link as LinkIcon, Loader2 } from 'lucide-react';
import axios from 'axios';

interface ImportModalProps {
    open: boolean;
    onClose: () => void;
    importUrl?: string; // Optional custom import URL
    importData?: (imdbId: string) => any; // Optional custom data transformer
}

interface SearchResult {
    imdbID: string;
    Title: string;
    Year: string;
    Type: string;
    Poster: string;
}

export function ImportModal({ open, onClose, importUrl, importData }: ImportModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [importing, setImporting] = useState(false);

    const urlForm = useForm({
        type: 'url',
        query: '',
    });

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setSearchError('');
        setSearchResults([]);

        try {
            const response = await axios.get('/movies/search', {
                params: { q: searchQuery },
            });
            setSearchResults(response.data.results || []);
            if (response.data.results.length === 0) {
                setSearchError('No results found');
            }
        } catch (error: any) {
            setSearchError(error.response?.data?.error || 'Search failed');
        } finally {
            setSearching(false);
        }
    };

    const handleSelectMovie = (imdbId: string) => {
        if (importing) return; // Prevent double-click
        
        setImporting(true);
        
        const url = importUrl || '/movies/import';
        const data = importData ? importData(imdbId) : {
            type: 'manual',
            query: imdbId,
        };
        
        router.post(url, data, {
            onSuccess: () => {
                setImporting(false);
                onClose();
                setSearchQuery('');
                setSearchResults([]);
            },
            onError: (errors) => {
                setImporting(false);
                console.error('Import error:', errors);
                setSearchError(errors.query || errors.imdb_id || 'Failed to import movie');
            },
        });
    };

    const handleUrlImport = (e: React.FormEvent) => {
        e.preventDefault();
        urlForm.post('/movies/import', {
            onSuccess: () => {
                onClose();
                urlForm.reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Import Movie/Series</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Search for a movie or series by title, or import directly using an IMDB URL
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Search Tab */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-neutral-300">Search by Title</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="Search for a movie or series..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                />
                                <Button
                                    onClick={handleSearch}
                                    disabled={searching || !searchQuery.trim()}
                                    className="bg-[#F5C518] text-black hover:bg-[#F5C518]/90"
                                >
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {searchError && (
                            <div className="text-red-400 text-sm">{searchError}</div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                            {searchResults.map((result) => (
                                <div
                                    key={result.imdbID}
                                    className={`bg-neutral-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#F5C518] transition-all ${
                                        importing ? 'opacity-50 pointer-events-none' : ''
                                    }`}
                                    onClick={() => handleSelectMovie(result.imdbID)}
                                >
                                    <div className="aspect-[2/3] bg-neutral-700">
                                        {result.Poster && result.Poster !== 'N/A' ? (
                                            <img
                                                src={result.Poster}
                                                alt={result.Title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback if image fails to load
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">🎬</div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">
                                                🎬
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2">
                                        <div className="font-semibold text-sm line-clamp-1">{result.Title}</div>
                                        <div className="text-xs text-neutral-400">{result.Year} • {result.Type}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* URL Import */}
                    <div className="border-t border-neutral-800 pt-4">
                        <form onSubmit={handleUrlImport} className="space-y-4">
                            <div>
                                <Label htmlFor="url" className="text-neutral-300">Or import by IMDB URL</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        id="url"
                                        placeholder="https://www.imdb.com/title/tt0111161/"
                                        value={urlForm.data.query}
                                        onChange={(e) => urlForm.setData('query', e.target.value)}
                                        className="bg-neutral-800 border-neutral-700 text-white"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={urlForm.processing || !urlForm.data.query.trim()}
                                        className="bg-[#F5C518] text-black hover:bg-[#F5C518]/90"
                                    >
                                        {urlForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {urlForm.errors.query && (
                                    <div className="text-red-400 text-sm mt-1">{urlForm.errors.query}</div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
