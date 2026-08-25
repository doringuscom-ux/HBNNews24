
import React from 'react';
import Link from 'next/link';
import { optimizeImage } from '../utils/imageOptimizer';

export default function LifestyleSection({ news = [] }) {
    const safeNews = (index, width = 300) => {
        if (news[index]) return { image: optimizeImage(news[index].image, width), title: news[index].title, _id: news[index].slug || news[index]._id };
        return { image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E", title: "Loading...", _id: "loading" };
    };

    const mainNews = safeNews(0, 600);
    const sideNews = [safeNews(1), safeNews(2), safeNews(3), safeNews(4)];

    return (
        <section className="w-full bg-white pb-8 font-sans">
            <div className="w-full max-w-[1270px] mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-0 h-0 border-t-[8px] border-t-[#d91f26] border-l-[8px] border-l-transparent -mt-1"></div>
                        <h2 className="text-black text-[22px] font-black leading-none">लाइफस्टाइल</h2>
                    </div>
                    <a href="#" className="text-[#d91f26] text-[14px] font-bold hover:underline flex items-center gap-1">
                        और भी <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mt-0.5"><path d="M5 3l14 9-14 9V3z" /></svg>
                    </a>
                </div>

                {/* Content Box */}
                <div className="bg-[#f5f5f5] p-5 border border-[#eaeaea]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Left Column (Main News) */}
                        <Link href={mainNews._id !== 'loading' ? `/news/${mainNews._id}` : '#'} className="group cursor-pointer flex flex-col gap-3 block">
                            <div className="w-full aspect-[16/9] overflow-hidden">
                                <img loading="lazy" width="400" height="250" src={mainNews.image} alt={mainNews.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <h3 className="text-[#000] text-[22px] font-bold leading-[1.3] group-hover:text-[#d91f26] transition-colors pr-4">
                                {mainNews.title}
                            </h3>
                        </Link>

                        {/* Right Column (List) */}
                        <div className="flex flex-col justify-between">
                            {sideNews.map((news, index) => (
                                <Link href={news._id !== 'loading' ? `/news/${news._id}` : '#'} key={index} className={`flex gap-4 pb-4 ${index !== sideNews.length - 1 ? 'border-b border-[#e0e0e0] mb-4' : ''} group cursor-pointer block`}>
                                    <div className="w-[155px] flex-shrink-0 overflow-hidden">
                                        <img loading="lazy" width="400" height="250" src={news.image} alt={news.title} className="w-full h-[85px] object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-[#000] text-[18px] leading-[1.3] font-medium group-hover:text-[#d91f26] transition-colors mt-0.5">
                                            {news.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}





