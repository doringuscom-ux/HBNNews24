'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, ChevronRight, Search, ShieldCheck } from 'lucide-react';

export default function ReportersList() {
    const [reporters, setReporters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchReporters = async () => {
            try {
                const res = await fetch('/api/reporter');
                if (res.ok) {
                    const data = await res.json();
                    setReporters(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error('Error fetching reporters:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReporters();
    }, []);

    const getInitials = (fullName) => {
        if (!fullName) return 'R';
        const names = fullName.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const filteredReporters = reporters.filter(reporter =>
        reporter.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reporter.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full min-h-screen bg-gray-50/50 pb-16 font-sans">
            {/* Header Banner */}
            <div className="w-full bg-gradient-to-r from-[#111] via-[#1c1c1c] to-[#111] text-white py-14 px-4 border-b-4 border-[#da0000]">
                <div className="max-w-[1270px] mx-auto text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-red-500/30 mb-4">
                        <ShieldCheck size={15} /> Verified Editorial Team
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
                        Our Journalists & Reporters
                    </h1>
                    <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed">
                        Meet the ground correspondents, investigative journalists, and editors bringing you truthful, fast, and verified news 24x7.
                    </p>

                    {/* Search bar */}
                    <div className="relative w-full max-w-md mt-6">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search reporter by name..."
                            className="w-full bg-white/10 text-white placeholder-gray-400 pl-11 pr-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#da0000] focus:bg-white/15 transition-all text-sm"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>
            </div>

            {/* Reporters Directory Grid */}
            <div className="max-w-[1270px] mx-auto px-4 mt-10">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-gray-200 mb-4"></div>
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded-lg w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredReporters.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Search size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">No Reporter Found</h2>
                        <p className="text-gray-500 text-sm">Try searching with a different name or keyword.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredReporters.map((reporter, index) => (
                            <Link
                                href={`/reporter/${reporter.slug}`}
                                key={reporter.id || index}
                                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
                            >
                                {/* Top colored accent line on hover */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-[#da0000] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                                {/* Avatar */}
                                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-red-50 group-hover:border-[#da0000] transition-colors shadow-md flex-shrink-0 bg-gradient-to-tr from-gray-900 to-red-900 flex items-center justify-center">
                                    {reporter.profileImage ? (
                                        <img
                                            src={reporter.profileImage}
                                            alt={reporter.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <span className="text-white text-2xl font-black tracking-wider">
                                            {getInitials(reporter.name)}
                                        </span>
                                    )}
                                </div>

                                {/* Name */}
                                <h2 className="text-[18px] font-bold text-gray-900 group-hover:text-[#da0000] transition-colors leading-snug line-clamp-1 mb-1">
                                    {reporter.name}
                                </h2>

                                {/* Role Badge */}
                                <span className="inline-block text-[12px] font-semibold text-gray-500 bg-gray-100 px-3 py-0.5 rounded-full mb-3">
                                    {reporter.role}
                                </span>

                                {/* Articles Count */}
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-5">
                                    <Newspaper size={14} className="text-[#da0000]" />
                                    <span>{reporter.articleCount} {reporter.articleCount === 1 ? 'Article' : 'Articles'} Published</span>
                                </div>

                                {/* View Profile Action */}
                                <div className="mt-auto w-full pt-3 border-t border-gray-100 flex items-center justify-center gap-1 text-sm font-bold text-gray-700 group-hover:text-[#da0000] transition-colors">
                                    <span>View Profile & News</span>
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
