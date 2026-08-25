 'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { FaXTwitter, FaFacebookF, FaWhatsapp } from 'react-icons/fa6';
import { MdSportsCricket } from 'react-icons/md';
import { IoFootball } from 'react-icons/io5';

export default function Sports({ initialNewsData = [], initialLatestNewsData = [] }) {
    const [newsData, setNewsData] = useState(initialNewsData);
    const [latestNewsData, setLatestNewsData] = useState(initialLatestNewsData);
    const [loading, setLoading] = useState(!initialNewsData || initialNewsData.length === 0);

    useEffect(() => {
        if (initialNewsData && initialNewsData.length > 0) return;
        const fetchNews = async () => {
            try {
                // Fetch sports specific news
                const sportsRes = await fetch('/api/news/sports');
                let sportsData = [];
                if (sportsRes.ok) {
                    sportsData = await sportsRes.json();
                }
                
                // Fetch all news for the 'latest' sidebar across all fields
                const allRes = await fetch('/api/news');
                let allData = [];
                if (allRes.ok) {
                    allData = await allRes.json();
                }

                setNewsData(sportsData);
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
            <div className="w-full min-h-[120px] md:h-[160px] py-4 md:py-0 relative overflow-hidden flex items-center px-4 md:px-10" style={{ background: 'linear-gradient(to right, #047857, #10b981, #34d399)' }}>
                
                {/* Background Watermark Right */}
                <div className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 opacity-20 pointer-events-none text-white hidden md:block">
                    <MdSportsCricket className="w-[300px] h-[300px]" />
                </div>

                {/* Left side Graphics */}
                <div className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 opacity-20 pointer-events-none text-white hidden md:block">
                    <IoFootball className="w-[250px] h-[250px]" />
                </div>

                <div className="w-full max-w-[1270px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 md:pl-[120px] gap-4 md:gap-0">
                    {/* Center Title */}
                    <div className="flex flex-col justify-center w-full md:w-auto">
                        <div className="flex items-center gap-2 mb-3 md:mb-1.5">
                            <span className="text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px] leading-tight shadow-sm" style={{ border: '1px solid white' }}>Hindi News</span>
                            <span className="text-white text-[13px] font-bold">/ खेल</span>
                        </div>
                        <div className="flex items-center justify-between w-full md:w-auto">
                            <div className="flex items-center gap-3">
                                {/* Mobile Icon */}
                                <MdSportsCricket className="text-white w-10 h-10 md:hidden" />
                                {/* Desktop Icon */}
                                <div className="hidden md:flex bg-transparent items-center justify-center border-2 border-white rounded-full p-2">
                                    <MdSportsCricket className="text-white w-[30px] h-[30px]" />
                                </div>
                                <h1 className="text-white text-[32px] md:text-[46px] font-black tracking-wide drop-shadow-md" style={{ fontFamily: '"Mukta", sans-serif' }}>खेल जगत</h1>
                            </div>
                            
                            {/* Mobile Socials */}
                            <div className="flex items-center gap-3 text-white md:hidden">
                                <FaWhatsapp size={16} className="cursor-pointer hover:text-green-400 drop-shadow-sm" />
                                <FaFacebookF size={15} className="cursor-pointer hover:text-blue-500 drop-shadow-sm" />
                                <FaXTwitter size={15} className="cursor-pointer hover:text-black drop-shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Right side Feedback & Socials (Desktop) */}
                    <div className="hidden md:flex flex-col items-end gap-3 pr-[40px]">
                        <button className="bg-white text-[#d32f2f] text-[12px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm hover:bg-gray-100 transition-colors">
                            <Pencil size={12} strokeWidth={3} /> Feedback
                        </button>
                        <div className="flex items-center gap-4 text-white">
                            <FaWhatsapp size={18} className="cursor-pointer hover:text-green-400 drop-shadow-sm" />
                            <FaFacebookF size={17} className="cursor-pointer hover:text-blue-500 drop-shadow-sm" />
                            <FaXTwitter size={17} className="cursor-pointer hover:text-black drop-shadow-sm" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content Area */}
            <div className="w-full max-w-[1270px] mx-auto px-4 py-6 md:py-10">
                <div className="flex flex-col lg:flex-row gap-6 mt-2">
                    {/* Left Main Content */}
                    <div className="w-full lg:w-[70%] flex flex-col gap-4">
                        {/* Top Row: 2 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Main Article (Takes 2 columns) */}
                            <Link href={`/news/${mainNews.slug || mainNews._id}`} className="col-span-1 md:col-span-2 relative group cursor-pointer overflow-hidden shadow-sm bg-black border border-gray-200 flex flex-col w-full md:aspect-[16/9] h-[250px] md:h-auto">
                                {mainNews.image ? (
                                    <img src={mainNews.image} alt={mainNews.title} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500 opacity-95 group-hover:opacity-100 absolute inset-0" />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 absolute inset-0"></div>
                                )}
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-4 px-5 z-10">
                                    <h3 className="text-white text-[22px] font-bold leading-[1.4]">
                                        {mainNews.title}
                                    </h3>
                                </div>
                            </Link>

                            {/* Top Side Article (Takes 1 column) */}
                            <Link href={`/news/${topSideNews.slug || topSideNews._id}`} className="col-span-1 bg-[#f0f2f5] shadow-sm flex flex-col group cursor-pointer border border-gray-200">
                                <div className="w-full aspect-[16/9] overflow-hidden flex-shrink-0">
                                    {topSideNews.image ? (
                                        <img src={topSideNews.image} alt="news" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 absolute inset-0"></div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-center bg-[#f0f2f5]">
                                    <h3 className="text-black text-[18px] font-bold leading-[1.4] group-hover:text-[#d91f26] transition-colors">
                                        {topSideNews.title}
                                    </h3>
                                </div>
                            </Link>
                        </div>

                        {/* Bottom Row: 3 columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                            {bottomNews.map((news, idx) => (
                                <Link href={`/news/${news.slug || news._id}`} key={idx} className="col-span-1 bg-white shadow-sm flex flex-col group cursor-pointer border border-gray-200 block">
                                    <div className="w-full aspect-[16/9] overflow-hidden relative">
                                        {news.image ? (
                                            <img src={news.image} alt="news" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-300 absolute inset-0"></div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-black text-[16px] font-bold leading-[1.4] group-hover:text-[#d91f26] transition-colors line-clamp-3">
                                            {news.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Rest of the news */}
                        {newsData.length > 5 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                                {newsData.slice(5).map((news, idx) => (
                                    <Link href={`/news/${news.slug || news._id}`} key={idx} className="col-span-1 bg-white shadow-sm flex flex-col group cursor-pointer border border-gray-200 block">
                                        <div className="w-full aspect-[16/9] overflow-hidden relative">
                                            {news.image ? (
                                                <img src={news.image} alt="news" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 absolute inset-0"></div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-black text-[16px] font-bold leading-[1.4] group-hover:text-[#d91f26] transition-colors line-clamp-3">
                                                {news.title}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-[30%] bg-white p-5 shadow-sm border border-gray-200 h-fit lg:sticky lg:top-4">
                        <div className="flex items-center gap-2 mb-4 border-b-[2px] border-gray-100 pb-2">
                            <div className="w-0 h-0 border-t-[10px] border-t-[#d91f26] border-l-[10px] border-l-transparent"></div>
                            <h2 className="text-[20px] font-black text-black">लेटेस्ट</h2>
                        </div>
                        <div className="flex flex-col">
                            {latestNewsData.slice(0, 15).map((news, idx) => (
                                <Link href={`/news/${news.slug || news._id}`} key={idx} className={`flex gap-3 py-3.5 group cursor-pointer ${idx !== Math.min(latestNewsData.length, 15) - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <div className="w-[110px] aspect-[16/9] flex-shrink-0 overflow-hidden rounded-[2px]">
                                        {news.image ? (
                                            <img src={news.image} alt="latest" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-300 absolute inset-0"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-[14px] font-medium leading-[1.4] text-gray-800 group-hover:text-[#d91f26] transition-colors line-clamp-3">
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
    );
}




