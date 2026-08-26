'use client';
import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Copy, Check } from 'lucide-react';
import { FaWhatsapp, FaFacebookF, FaXTwitter } from 'react-icons/fa6';

export default function BreakingNewsPage({ initialNews = [] }) {
    const [news, setNews] = useState(initialNews);
    const [loading, setLoading] = useState(!initialNews || initialNews.length === 0);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        if (initialNews && initialNews.length > 0) return;
        fetch('/api/breaking-news')
            .then(res => res.json())
            .then(data => {
                setNews(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setNews([]);
                setLoading(false);
            });
    }, [initialNews]);

    const handleShare = (platform, text) => {
        const url = typeof window !== 'undefined' ? window.location.href : 'https://hbnnews24.com/breaking-news';
        if (platform === 'whatsapp') {
            const shareText = `🔴 BREAKING NEWS: ${text}\n\nRead more at: ${url}`;
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🔴 BREAKING: ${text}`)}&url=${encodeURIComponent(url)}`, '_blank');
        }
    };

    const handleCopy = (id, text) => {
        const url = typeof window !== 'undefined' ? window.location.href : 'https://hbnnews24.com/breaking-news';
        const shareText = `🔴 BREAKING NEWS: ${text}\n\nRead more at: ${url}`;
        navigator.clipboard.writeText(shareText).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2500);
        });
    };

    // Format date as time ago
    const timeAgo = (dateString) => {
        if (!dateString) return 'अभी-अभी';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.max(0, Math.round((now - date) / 1000));
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return 'अभी-अभी';
        if (minutes < 60) return `${minutes} मिनट पहले`;
        if (hours < 24) return `${hours} घंटे पहले`;
        if (days === 1) return 'कल';
        return `${days} दिन पहले`;
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-16">
            {/* Premium Header Banner */}
            <div className="w-full relative overflow-hidden py-8 md:py-12 px-4 md:px-10 border-b-2 border-[#da0000]/30 shadow-md" style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1c0a0a 45%, #660808 100%)' }}>
                {/* Decorative background lights */}
                <div className="absolute -left-20 -top-20 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute right-0 bottom-0 w-96 h-96 bg-red-700/15 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 mb-3 bg-[#da0000] text-white px-3.5 py-1 rounded-full shadow-md">
                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                        <span className="text-xs font-black tracking-widest uppercase">Live Breaking News</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight drop-shadow-md text-white">
                        Breaking News Updates
                    </h1>
                    <p className="text-gray-300 text-sm md:text-base mt-2.5 font-medium max-w-2xl drop-shadow-sm">
                        Catch 24x7 live updates, flash alerts, and urgent breaking headlines as they happen.
                    </p>
                </div>
            </div>

            {/* News Feed Container */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#da0000]"></div>
                    </div>
                ) : news.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-200 mt-4">
                        <AlertCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800">No Active Breaking News</h3>
                        <p className="text-gray-500 mt-2">Check back later for urgent live updates.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {news.map((item, index) => (
                            <div key={item._id || index} className="p-5 md:p-6 rounded-2xl shadow-sm bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-red-200 relative overflow-hidden">
                                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#da0000]"></div>
                                
                                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                                        <span className="text-xs font-black text-[#da0000] tracking-wider uppercase">BREAKING</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium" suppressHydrationWarning>
                                        <Clock size={13} />
                                        <span suppressHydrationWarning>{timeAgo(item.createdAt)}</span>
                                    </div>
                                </div>

                                <p className="text-gray-900 font-bold text-base md:text-lg leading-relaxed mb-4">
                                    {item.text}
                                </p>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        {/* WhatsApp */}
                                        <button
                                            onClick={() => handleShare('whatsapp', item.text)}
                                            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                            title="Share on WhatsApp"
                                            type="button"
                                        >
                                            <FaWhatsapp size={15} />
                                        </button>
                                        {/* Facebook */}
                                        <button
                                            onClick={() => handleShare('facebook', item.text)}
                                            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                            title="Share on Facebook"
                                            type="button"
                                        >
                                            <FaFacebookF size={14} />
                                        </button>
                                        {/* Twitter */}
                                        <button
                                            onClick={() => handleShare('twitter', item.text)}
                                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-800 hover:bg-black hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                            title="Share on X"
                                            type="button"
                                        >
                                            <FaXTwitter size={14} />
                                        </button>
                                    </div>

                                    {/* Copy Button */}
                                    <button
                                        onClick={() => handleCopy(item._id, item.text)}
                                        type="button"
                                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${copiedId === item._id ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        {copiedId === item._id ? <Check size={14} /> : <Copy size={14} />}
                                        <span>{copiedId === item._id ? 'Copied!' : 'Copy News'}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
