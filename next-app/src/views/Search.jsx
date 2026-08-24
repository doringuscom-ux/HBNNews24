 'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Search() {
    const searchParams = useSearchParams();
    const query = searchParams ? searchParams.get('q') : '';
    
    const [newsData, setNewsData] = useState([]);
    const [latestNewsData, setLatestNewsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                // Fetch search results
                let searchData = [];
                if (query) {
                    const searchRes = await fetch(`/api/news/search?q=${encodeURIComponent(query)}`);
                    if (searchRes.ok) {
                        searchData = await searchRes.json();
                    }
                }
                
                // Fetch all news for the 'latest' sidebar across all fields
                const allRes = await fetch('/api/news');
                let allData = [];
                if (allRes.ok) {
                    allData = await allRes.json();
                }

                setNewsData(searchData);
                setLatestNewsData(allData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setLoading(false);
            }
        };
        fetchSearchResults();
    }, [query]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Searching...</div>;
    }

    return (
        <div className="w-full min-h-screen bg-[#f3f4f6]">
            {/* Banner Section */}
            <div className="w-full h-[160px] relative overflow-hidden flex items-center px-10" style={{ background: 'linear-gradient(to right, #da0000, #ff4d4d, #da0000)' }}>
                
                {/* Background Watermark Right */}
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-20 text-white">
                    <SearchIcon className="w-[140px] h-[140px]" />
                </div>

                <div className="w-[1270px] mx-auto flex items-center justify-between relative z-10 pl-[120px]">
                    {/* Center Title */}
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px] leading-tight shadow-sm" style={{ border: '1px solid white' }}>Search Results</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-white text-[38px] font-black tracking-wide drop-shadow-md" style={{ fontFamily: '"Mukta", sans-serif' }}>
                                "{query}"
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content Area */}
            <div className="w-[1270px] mx-auto py-10">
                <div className="flex gap-6 mt-2">
                    {/* Left Main Content */}
                    <div className="w-[70%] flex flex-col gap-4">
                        
                        <h2 className="text-2xl font-bold mb-4">{newsData.length} results found for "{query}"</h2>

                        {newsData.length === 0 ? (
                            <div className="bg-white p-10 text-center rounded-lg shadow-sm border border-gray-200">
                                <p className="text-gray-500 text-lg">No related news found. Try searching for different keywords.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-6">
                                {newsData.map((news, idx) => (
                                    <Link href={`/news/${news.slug || news._id}`} key={idx} className="col-span-1 bg-white shadow-sm flex flex-col group cursor-pointer border border-gray-200 block rounded-lg overflow-hidden">
                                        <div className="w-full h-[220px] overflow-hidden relative">
                                            {news.image ? (
                                                <img src={news.image} alt="news" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-gray-500 font-bold">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <span className="text-[#da0000] text-xs font-bold uppercase tracking-wider mb-2">{news.category}</span>
                                            <h3 className="text-black text-[18px] font-bold leading-[1.4] group-hover:text-[#da0000] transition-colors line-clamp-3 mb-3">
                                                {news.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm line-clamp-2 mt-auto">
                                                {news.shortDescription || news.content?.replace(/<[^>]+>/g, '').substring(0, 100)}...
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-[30%] bg-white p-5 shadow-sm border border-gray-200 h-fit sticky top-4">
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




