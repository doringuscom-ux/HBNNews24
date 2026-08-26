'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Haryana({ initialNewsData = [], initialLatestNewsData = [] }) {
    const [newsData, setNewsData] = useState(initialNewsData);
    const [latestNewsData, setLatestNewsData] = useState(initialLatestNewsData);
    const [loading, setLoading] = useState(!initialNewsData || initialNewsData.length === 0);

    useEffect(() => {
        if (initialNewsData && initialNewsData.length > 0) return;
        const fetchNews = async () => {
            try {
                const allRes = await fetch('/api/news');
                let allData = [];
                if (allRes.ok) {
                    allData = await allRes.json();
                }

                const catNews = allData.filter(item => {
                    if (Array.isArray(item.category)) {
                        return item.category.some(c => c.toLowerCase() === 'haryana');
                    } else if (typeof item.category === 'string') {
                        return item.category.toLowerCase() === 'haryana';
                    }
                    return false;
                }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setNewsData(catNews);
                setLatestNewsData(allData);
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
                    {/* Left: Graphic Image with soft ambient glow */}
                    <div className="flex items-center justify-center flex-shrink-0 p-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
                        <img 
                            src="https://res.cloudinary.com/dsd6oj52y/image/upload/v1787726513/ChatGPT_Image_Aug_26_2026_12_11_30_PM.png" 
                            alt="Haryana News Map" 
                            className="h-[80px] sm:h-[105px] md:h-[125px] w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(255,255,255,0.25)] hover:scale-105 transition-transform duration-300"
                        />
                    </div>

                    {/* Content: Text & H1 */}
                    <div className="flex flex-col justify-center flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#da0000] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                                Hindi News
                            </span>
                            <span className="text-gray-300 text-[13px] font-bold">
                                / हरियाणा
                            </span>
                        </div>
                        <h1 className="text-white text-[26px] sm:text-[34px] md:text-[42px] font-black tracking-tight drop-shadow-md leading-[1.2]" style={{ fontFamily: '"Mukta", sans-serif' }}>
                            Haryana Ki Taza News
                        </h1>
                        <p className="text-gray-300 text-[13px] sm:text-[14px] md:text-[15px] font-medium mt-1.5 drop-shadow-sm max-w-2xl">
                            Get Latest Haryana Breaking News in Hindi at HBN News 24
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1270px] mx-auto px-4 py-6 md:py-10">
                <div className="flex flex-col lg:flex-row gap-6 mt-2">
                    <div className="w-full lg:w-[70%] flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href={mainNews._id ? `/news/${mainNews.slug || mainNews._id}` : '#'} className="col-span-1 md:col-span-2 relative group cursor-pointer overflow-hidden shadow-sm bg-black border border-gray-200 flex flex-col w-full md:aspect-[16/9] h-[250px] md:h-auto">
                                {mainNews.image && <img src={mainNews.image} alt={mainNews.title} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500 opacity-95 group-hover:opacity-100 absolute inset-0" />}
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-4 px-5 z-10">
                                    <h3 className="text-white text-[22px] font-bold leading-[1.4]">{mainNews.title}</h3>
                                </div>
                            </Link>
                            <Link href={topSideNews._id ? `/news/${topSideNews.slug || topSideNews._id}` : '#'} className="col-span-1 bg-[#f0f2f5] shadow-sm flex flex-col group cursor-pointer border border-gray-200 block">
                                <div className="w-full aspect-[16/9] overflow-hidden flex-shrink-0">
                                    {topSideNews.image && <img src={topSideNews.image} alt="news" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500" />}
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-center bg-[#f0f2f5]">
                                    <h3 className="text-black text-[18px] font-bold leading-[1.4] group-hover:text-[#d91f26] transition-colors">{topSideNews.title}</h3>
                                </div>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                            {bottomNews.map((news, idx) => (
                                <Link href={`/news/${news.slug || news._id}`} key={idx} className="col-span-1 bg-white shadow-sm flex flex-col group cursor-pointer border border-gray-200 block">
                                    <div className="w-full aspect-[16/9] overflow-hidden relative">
                                        {news.image && <img src={news.image} alt="news" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500" />}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-black text-[16px] font-bold leading-[1.4] group-hover:text-[#d91f26] transition-colors line-clamp-3">{news.title}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="flex flex-col gap-4 mt-6">
                            {newsData.slice(5).map((news, idx) => (
                                <Link href={`/news/${news.slug || news._id}`} key={idx} className="bg-white p-4 shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 group cursor-pointer">
                                    <div className="w-full sm:w-[220px] aspect-[16/9] overflow-hidden flex-shrink-0 relative">
                                        {news.image && <img src={news.image} alt="news" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500" />}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h3 className="text-black text-[18px] font-bold leading-[1.4] group-hover:text-[#d91f26] transition-colors mb-2">{news.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2">{news.description || (news.content ? news.content.replace(/<[^>]+>/g, '').substring(0, 120) + '...' : '')}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="w-full lg:w-[30%] bg-white p-5 shadow-sm border border-gray-200 h-fit lg:sticky lg:top-4">
                        <div className="flex items-center gap-2 mb-4 border-b-[2px] border-gray-100 pb-2">
                            <div className="w-0 h-0 border-t-[10px] border-t-[#d91f26] border-l-[10px] border-l-transparent"></div>
                            <h2 className="text-[20px] font-black text-black">लेटेस्ट</h2>
                        </div>
                        <div className="flex flex-col">
                            {latestNewsData.slice(0, 15).map((news, idx) => (
                                <Link href={`/news/${news.slug || news._id}`} key={idx} className={`flex gap-3 py-3.5 group cursor-pointer ${idx !== Math.min(latestNewsData.length, 15) - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <div className="w-[110px] aspect-[16/9] flex-shrink-0 overflow-hidden rounded-[2px] bg-gray-100">
                                        <img src={news.image} alt="latest" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-300" />
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
