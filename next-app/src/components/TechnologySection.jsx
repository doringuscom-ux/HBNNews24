
import React from 'react';
import Link from 'next/link';
import { optimizeImage } from '../utils/imageOptimizer';

export default function TechnologySection({ news = [] }) {
    const safeNews = (index, width = 300) => {
        if (news[index]) return { image: optimizeImage(news[index].image, width), title: news[index].title, _id: news[index].slug || news[index]._id };
        return { image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E", title: "Loading...", _id: "loading" };
    };

    const mainNews = safeNews(0, 600);
    const bottomNewsLeft = safeNews(1);
    
    const middleNewsList = [safeNews(2), safeNews(3), safeNews(4)];
    const rightNewsList = [safeNews(5), safeNews(6), safeNews(7)];

    return (
        <section className="w-full bg-white pb-10 pt-4 font-sans border-b-2 border-gray-100">
            <div className="w-full max-w-[1270px] mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-0 h-0 border-t-[8px] border-t-[#d91f26] border-l-[8px] border-l-transparent -mt-1"></div>
                        <h2 className="text-black text-[22px] font-black leading-none">टेक्नोलॉजी</h2>
                    </div>
                    <a href="#" className="text-[#d91f26] text-[14px] font-bold hover:underline flex items-center gap-1">
                        और भी <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mt-0.5"><path d="M5 3l14 9-14 9V3z" /></svg>
                    </a>
                </div>

                {/* Content Box */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column (42%) */}
                    <div className="w-full md:w-[42%] flex flex-col md:pr-4 border-b md:border-b-0 md:border-r border-[#e5e5e5] pb-6 md:pb-0">
                        
                        {/* Top Main News */}
                        <Link href={mainNews._id !== 'loading' ? `/news/${mainNews._id}` : '#'} className="flex flex-col sm:flex-row gap-4 group cursor-pointer mb-5">
                            <div className="w-full sm:w-[230px] aspect-[16/9] overflow-hidden flex-shrink-0 bg-gray-50 rounded">
                                <img loading="lazy" width="400" height="250" src={optimizeImage(mainNews.image, 400)} alt={mainNews.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[#000] text-[20px] font-bold leading-[1.3] group-hover:text-[#d91f26] transition-colors pt-1">
                                    {mainNews.title}
                                </h3>
                            </div>
                        </Link>

                        {/* Bottom News Left */}
                        <Link href={bottomNewsLeft._id !== 'loading' ? `/news/${bottomNewsLeft._id}` : '#'} className="border-t border-[#e5e5e5] pt-4 group cursor-pointer flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-[130px] aspect-[16/9] overflow-hidden flex-shrink-0 bg-gray-50 rounded">
                                <img loading="lazy" width="400" height="250" src={optimizeImage(bottomNewsLeft.image, 300)} alt={bottomNewsLeft.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="flex-1 flex items-center">
                                <h3 className="text-[#000] text-[17px] font-medium leading-[1.3] group-hover:text-[#d91f26] transition-colors mt-0.5">
                                    {bottomNewsLeft.title}
                                </h3>
                            </div>
                        </Link>

                    </div>

                    {/* Middle Column (29%) */}
                    <div className="w-full md:w-[29%] flex flex-col justify-between md:pr-4 border-b md:border-b-0 md:border-r border-[#e5e5e5] pb-6 md:pb-0">
                        {middleNewsList.map((news, index) => (
                            <Link href={news._id !== 'loading' ? `/news/${news._id}` : '#'} key={index} className={`flex flex-col sm:flex-row gap-3 group cursor-pointer ${index !== middleNewsList.length - 1 ? 'border-b border-[#e5e5e5] pb-4 mb-4' : ''}`}>
                                <div className="w-full sm:w-[110px] aspect-[16/9] overflow-hidden flex-shrink-0 bg-gray-50 rounded">
                                    <img loading="lazy" width="400" height="250" src={optimizeImage(news.image, 300)} alt={news.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="flex-1 flex pt-1">
                                    <h3 className="text-[#000] text-[16px] font-medium leading-[1.3] group-hover:text-[#d91f26] transition-colors mt-0.5">
                                        {news.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Right Column (29%) */}
                    <div className="w-full md:w-[29%] flex flex-col justify-between">
                        {rightNewsList.map((news, index) => (
                            <Link href={news._id !== 'loading' ? `/news/${news._id}` : '#'} key={index} className={`flex flex-col sm:flex-row gap-3 group cursor-pointer ${index !== rightNewsList.length - 1 ? 'border-b border-[#e5e5e5] pb-4 mb-4' : ''}`}>
                                <div className="w-full sm:w-[110px] aspect-[16/9] overflow-hidden flex-shrink-0 bg-gray-50 rounded">
                                    <img loading="lazy" width="400" height="250" src={optimizeImage(news.image, 300)} alt={news.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="flex-1 flex pt-1">
                                    <h3 className="text-[#000] text-[16px] font-medium leading-[1.3] group-hover:text-[#d91f26] transition-colors mt-0.5">
                                        {news.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}





