'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { FaXTwitter, FaFacebookF, FaWhatsapp } from 'react-icons/fa6';
import { GiRam, GiBullHorns, GiGemini, GiCrab, GiLion, GiFemale, GiScales, GiScorpion, GiBowArrow, GiGoat, GiJug, GiDoubleFish } from 'react-icons/gi';
import lfCircleImg from '../assets/lf-circel.png';
import rhCircleImg from '../assets/rh-circel.png';
import dhrmIconImg from '../assets/dhrmH.png';

export default function Religion({ initialNewsData = [], initialLatestNewsData = [] }) {
    const [newsData, setNewsData] = useState(initialNewsData);
    const [latestNewsData, setLatestNewsData] = useState(initialLatestNewsData);
    const [loading, setLoading] = useState(!initialNewsData || initialNewsData.length === 0);

    useEffect(() => {
        if (initialNewsData && initialNewsData.length > 0) return;
        const fetchNews = async () => {
            try {
                // Fetch religion specific news
                const relRes = await fetch('/api/news/religion');
                const relData = await relRes.json();
                
                // Fetch all news for the 'latest' sidebar across all fields
                const allRes = await fetch('/api/news');
                const allData = await allRes.json();

                setNewsData(relData);
                setLatestNewsData(allData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching news:", error);
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const mainNews = newsData[0] || { title: 'Loading...', image: '' };
    const topSideNews = newsData[1] || { title: 'Loading...', image: '' };
    const bottomNews = newsData.slice(2, 5);
    const latestNews = latestNewsData.slice(0, 5);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading...</div>;
    }

    return (
        <div className="w-full min-h-screen bg-[#f3f4f6]">
            {/* Banner Section */}
            <div className="w-full min-h-[120px] md:h-[160px] py-4 md:py-0 relative overflow-hidden flex items-center px-4 md:px-10" style={{ background: 'linear-gradient(to right, #8d570f, #b97a0c, #f3bd18)' }}>
                
                {/* Background Watermark Right */}
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none hidden md:block">
                    <img src={rhCircleImg?.src || rhCircleImg} alt="Right Circle" className="h-[180px] w-auto object-contain" />
                </div>

                {/* Left side Graphics */}
                <div className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 pointer-events-none hidden md:block">
                    <img src={lfCircleImg?.src || lfCircleImg} alt="Left Circle" className="h-[180px] w-auto object-contain" />
                </div>

                <div className="w-full max-w-[1270px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 md:pl-[120px] gap-4 md:gap-0">
                    {/* Center Title */}
                    <div className="flex flex-col justify-center w-full md:w-auto">
                        <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                            <span className="text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px] leading-tight shadow-sm" style={{ border: '1px solid white' }}>Hindi News</span>
                            <span className="text-white text-[13px] font-bold">/ धर्म</span>
                        </div>
                        <div className="flex items-center justify-between w-full md:w-auto">
                            <div className="flex items-center gap-3">
                                {/* Mobile Icon */}
                                <img src={dhrmIconImg?.src || dhrmIconImg} alt="Dharma" className="w-12 h-12 object-contain drop-shadow-md md:hidden" />
                                {/* Desktop Icon */}
                                <div className="hidden md:flex bg-transparent items-center justify-center">
                                    <img src={dhrmIconImg?.src || dhrmIconImg} alt="Dharma" className="w-[50px] h-auto object-contain" />
                                </div>
                                <h1 className="text-white text-[32px] md:text-[46px] font-black tracking-wide drop-shadow-md" style={{ fontFamily: '"Mukta", sans-serif' }}>धर्म कर्म</h1>
                            </div>
                            
                            {/* Mobile Socials */}
                            <div className="flex items-center gap-3 text-white md:hidden">
                                <FaWhatsapp size={16} className="cursor-pointer hover:text-green-400 drop-shadow-sm" />
                                <FaFacebookF size={15} className="cursor-pointer hover:text-blue-500 drop-shadow-sm" />
                                <FaXTwitter size={15} className="cursor-pointer hover:text-black drop-shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Right Social Icons (Desktop) */}
                    <div className="hidden md:flex items-center gap-3 text-white">
                        <span className="text-[13px] font-bold mr-1">फॉलो करें</span>
                        <a href="https://twitter.com/HBNNews24" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition-all">
                            <FaXTwitter size={15} />
                        </a>
                        <a href="https://facebook.com/HBNNews24" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition-all">
                            <FaFacebookF size={15} />
                        </a>
                        <a href="https://whatsapp.com/channel/0029VaA8j0U30LKZ9Qc50D0Y" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition-all">
                            <FaWhatsapp size={16} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="w-full max-w-[1270px] mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Top 2 News (Main Left + Top Right) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            
                            {/* Big Main Featured Card */}
                            <div className="md:col-span-7 flex flex-col">
                                <Link href={`/news/${mainNews.slug || mainNews._id}`} className="group relative block overflow-hidden rounded-lg bg-gray-100">
                                    <div className="w-full h-[240px] sm:h-[300px] overflow-hidden">
                                        <img 
                                            src={mainNews.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"} 
                                            alt={mainNews.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    </div>
                                    <div className="absolute top-3 left-3 bg-[#b97a0c] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                                        धर्म
                                    </div>
                                </Link>
                                <Link href={`/news/${mainNews.slug || mainNews._id}`} className="mt-3">
                                    <h2 className="text-[20px] sm:text-[24px] font-extrabold text-[#111] leading-[1.3] hover:text-[#b97a0c] transition-colors line-clamp-2" style={{ fontFamily: '"Mukta", sans-serif' }}>
                                        {mainNews.title}
                                    </h2>
                                </Link>
                                <p className="text-[#666] text-[14px] leading-relaxed mt-2 line-clamp-3">
                                    {mainNews.shortDescription || mainNews.content?.replace(/<[^>]*>?/gm, '')}
                                </p>
                            </div>

                            {/* Top Right Card */}
                            <div className="md:col-span-5 flex flex-col border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                <Link href={`/news/${topSideNews.slug || topSideNews._id}`} className="group relative block overflow-hidden rounded-lg bg-gray-100">
                                    <div className="w-full h-[180px] overflow-hidden">
                                        <img 
                                            src={topSideNews.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"} 
                                            alt={topSideNews.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    </div>
                                </Link>
                                <Link href={`/news/${topSideNews.slug || topSideNews._id}`} className="mt-3">
                                    <h3 className="text-[17px] font-bold text-[#111] leading-[1.35] hover:text-[#b97a0c] transition-colors line-clamp-3" style={{ fontFamily: '"Mukta", sans-serif' }}>
                                        {topSideNews.title}
                                    </h3>
                                </Link>
                                <p className="text-[#666] text-[13px] leading-relaxed mt-2 line-clamp-2">
                                    {topSideNews.shortDescription || topSideNews.content?.replace(/<[^>]*>?/gm, '')}
                                </p>
                            </div>

                        </div>

                        {/* Bottom 3 Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {bottomNews.map((newsItem) => (
                                <div key={newsItem._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
                                    <Link href={`/news/${newsItem.slug || newsItem._id}`} className="group block">
                                        <div className="w-full h-[140px] overflow-hidden rounded-md bg-gray-100 mb-2.5">
                                            <img 
                                                src={newsItem.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"} 
                                                alt={newsItem.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                            />
                                        </div>
                                        <h4 className="text-[15px] font-bold text-[#222] leading-[1.35] group-hover:text-[#b97a0c] transition-colors line-clamp-3" style={{ fontFamily: '"Mukta", sans-serif' }}>
                                            {newsItem.title}
                                        </h4>
                                    </Link>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Right Column - Sidebar (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* Latest News Widget */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#b97a0c]"></span>
                                    <h3 className="text-[18px] font-black text-[#111]" style={{ fontFamily: '"Mukta", sans-serif' }}>लेटेस्ट न्यूज़</h3>
                                </div>
                                <Link href="/" className="text-[12px] font-bold text-[#b97a0c] hover:underline">और देखें ›</Link>
                            </div>

                            <div className="flex flex-col gap-4">
                                {latestNews.map((news, index) => (
                                    <Link href={`/news/${news.slug || news._id}`} key={news._id} className="flex gap-3 items-center group border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <span className="text-[18px] font-extrabold text-gray-300 group-hover:text-[#b97a0c] transition-colors w-5 text-center flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <div className="w-[85px] h-[60px] flex-shrink-0 overflow-hidden rounded bg-gray-100">
                                            <img 
                                                src={news.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"} 
                                                alt={news.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                            />
                                        </div>
                                        <h4 className="text-[14px] font-bold text-[#222] leading-[1.3] group-hover:text-[#b97a0c] transition-colors line-clamp-2 flex-1" style={{ fontFamily: '"Mukta", sans-serif' }}>
                                            {news.title}
                                        </h4>
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
