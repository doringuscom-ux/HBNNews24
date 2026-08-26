'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Technology({ initialNewsData = [], initialLatestNewsData = [] }) {
    const [newsData, setNewsData] = useState(initialNewsData);
    const [latestNewsData, setLatestNewsData] = useState(initialLatestNewsData);
    const [loading, setLoading] = useState(!initialNewsData || initialNewsData.length === 0);

    useEffect(() => {
        if (initialNewsData && initialNewsData.length > 0) return;
        const fetchNews = async () => {
            try {
                const techRes = await fetch('/api/news/technology');
                let techData = [];
                if (techRes.ok) {
                    techData = await techRes.json();
                }
                
                const allRes = await fetch('/api/news');
                let allData = [];
                if (allRes.ok) {
                    allData = await allRes.json();
                }

                setNewsData(Array.isArray(techData) ? techData : []);
                setLatestNewsData(Array.isArray(allData) ? allData : []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching news:", error);
                setLoading(false);
            }
        };
        fetchNews();
    }, [initialNewsData]);

    const mainNews = newsData[0] || { title: 'Loading...', image: '' };
    const topSideNews = newsData[1] || { title: 'Loading...', image: '' };
    const bottomNews = newsData.slice(2, 5);
    const latestNews = latestNewsData.slice(0, 15);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading...</div>;
    }

    return (
        <div className="w-full min-h-screen bg-[#f3f4f6]">
            {/* Header Banner */}
            <div className="w-full relative overflow-hidden py-6 md:py-8 px-4 md:px-10 border-b-2 border-[#da0000]/30 shadow-md" style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1c0a0a 45%, #660808 100%)' }}>
                {/* Subtle decorative background glow */}
                <div className="absolute -left-20 -top-20 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute right-0 bottom-0 w-96 h-96 bg-red-700/15 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-[1270px] mx-auto flex flex-row items-center justify-start relative z-10 gap-5 sm:gap-8">
                    {/* Left: Technology Graphic with soft ambient glow */}
                    <div className="flex items-center justify-center flex-shrink-0 p-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
                        <img 
                            src="https://res.cloudinary.com/dsd6oj52y/image/upload/v1787735193/1731994789_whatistechnologyinnovationdefinitionexamplesandtypes.jpg" 
                            alt="Technology Ki Taza News - Latest Gadget and Tech Updates HBN News 24" 
                            className="h-[80px] sm:h-[105px] md:h-[125px] w-auto object-contain rounded-xl filter drop-shadow-[0_4px_16px_rgba(255,255,255,0.25)] hover:scale-105 transition-transform duration-300"
                        />
                    </div>

                    {/* Content: Text & H1 */}
                    <div className="flex flex-col justify-center flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#da0000] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                Hindi News
                            </span>
                            <span className="text-gray-300 text-[13px] font-bold">
                                / टेक्नोलॉजी
                            </span>
                        </div>
                        <h1 className="text-white text-[24px] sm:text-[32px] md:text-[40px] font-black tracking-tight drop-shadow-md leading-[1.2]" style={{ fontFamily: '"Mukta", sans-serif' }}>
                            Technology Ki Taza News
                        </h1>
                        <p className="text-gray-300 text-[13px] sm:text-[14px] md:text-[15px] font-medium mt-1.5 drop-shadow-sm max-w-2xl">
                            Latest Gadget & Tech Updates | HBN News 24
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="w-full max-w-[1270px] mx-auto px-4 py-6 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Top 2 News (Main Left + Top Right Balanced) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            
                            {/* Big Main Featured Card */}
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <Link href={`/news/${mainNews.slug || mainNews._id}`} className="group relative block overflow-hidden rounded-lg bg-gray-100">
                                        <div className="w-full aspect-[16/10] overflow-hidden">
                                            <img 
                                                src={mainNews.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"} 
                                                alt={mainNews.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        </div>
                                        <div className="absolute top-3 left-3 bg-[#da0000] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                                            टेक्नोलॉजी
                                        </div>
                                    </Link>
                                    <Link href={`/news/${mainNews.slug || mainNews._id}`} className="mt-3 block">
                                        <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#111] leading-[1.35] hover:text-[#da0000] transition-colors line-clamp-2" style={{ fontFamily: '"Mukta", sans-serif' }}>
                                            {mainNews.title}
                                        </h2>
                                    </Link>
                                    <p className="text-[#555] text-[14px] leading-relaxed mt-2.5 line-clamp-4">
                                        {mainNews.shortDescription || mainNews.description || (mainNews.content ? mainNews.content.replace(/<[^>]*>?/gm, '').substring(0, 240) + '...' : '')}
                                    </p>
                                </div>
                            </div>

                            {/* Top Right Card */}
                            <div className="flex flex-col h-full justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                <div>
                                    <Link href={`/news/${topSideNews.slug || topSideNews._id}`} className="group relative block overflow-hidden rounded-lg bg-gray-100">
                                        <div className="w-full aspect-[16/10] overflow-hidden">
                                            <img 
                                                src={topSideNews.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"} 
                                                alt={topSideNews.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        </div>
                                    </Link>
                                    <Link href={`/news/${topSideNews.slug || topSideNews._id}`} className="mt-3 block">
                                        <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#111] leading-[1.35] hover:text-[#da0000] transition-colors line-clamp-2" style={{ fontFamily: '"Mukta", sans-serif' }}>
                                            {topSideNews.title}
                                        </h3>
                                    </Link>
                                    <p className="text-[#555] text-[14px] leading-relaxed mt-2.5 line-clamp-4">
                                        {topSideNews.shortDescription || topSideNews.description || (topSideNews.content ? topSideNews.content.replace(/<[^>]*>?/gm, '').substring(0, 240) + '...' : '')}
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Bottom 3 Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {bottomNews.map((newsItem) => (
                                <div key={newsItem._id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                                    <Link href={`/news/${newsItem.slug || newsItem._id}`} className="group block">
                                        <div className="w-full h-[140px] overflow-hidden rounded-lg bg-gray-100 mb-2.5">
                                            <img 
                                                src={newsItem.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"} 
                                                alt={newsItem.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                            />
                                        </div>
                                        <h4 className="text-[15px] font-bold text-[#222] leading-[1.35] group-hover:text-[#da0000] transition-colors line-clamp-3" style={{ fontFamily: '"Mukta", sans-serif' }}>
                                            {newsItem.title}
                                        </h4>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Extended Feed */}
                        <div className="flex flex-col gap-4 mt-2">
                            {newsData.slice(5).map((newsItem, idx) => (
                                <Link href={`/news/${newsItem.slug || newsItem._id}`} key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 group cursor-pointer hover:shadow-md transition-shadow">
                                    <div className="w-full sm:w-[220px] aspect-[16/9] overflow-hidden rounded-lg flex-shrink-0 relative">
                                        <img src={newsItem.image} alt={newsItem.title} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="text-black text-[18px] font-bold leading-[1.4] group-hover:text-[#da0000] transition-colors mb-2">{newsItem.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2">{newsItem.description || (newsItem.content ? newsItem.content.replace(/<[^>]+>/g, '').substring(0, 120) + '...' : '')}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                    </div>

                    {/* Right Column - Sidebar (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* Latest News Widget */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-fit lg:sticky lg:top-4">
                            <div className="flex items-center gap-2 mb-4 border-b-[2px] border-gray-100 pb-2">
                                <div className="w-0 h-0 border-t-[10px] border-t-[#da0000] border-l-[10px] border-l-transparent"></div>
                                <h2 className="text-[20px] font-black text-black">लेटेस्ट</h2>
                            </div>

                            <div className="flex flex-col">
                                {latestNews.map((news, index) => (
                                    <Link href={`/news/${news.slug || news._id}`} key={news._id || index} className={`flex gap-3 py-3.5 group cursor-pointer ${index !== latestNews.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="w-[110px] aspect-[16/9] flex-shrink-0 overflow-hidden rounded-[2px] bg-gray-100">
                                            <img 
                                                src={news.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"} 
                                                alt={news.title} 
                                                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-300" 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[14px] font-medium leading-[1.4] text-gray-800 group-hover:text-[#da0000] transition-colors line-clamp-3">
                                                {news.title}
                                            </h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
