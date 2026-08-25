
import React from 'react';
import Link from 'next/link';
import { optimizeImage } from '../utils/imageOptimizer';

export default function SportsSection({ news = [] }) {
    const textNews = news.slice(3, 6).map(n => ({ title: n.title, id: n.slug || n._id }));
    
    const imageNews = news.slice(0, 3).map(n => ({
        image: optimizeImage(n.image, 400),
        title: n.title,
        id: n.slug || n._id
    }));

    while (textNews.length < 3) textNews.push({ title: "Loading...", id: "loading" });
    while (imageNews.length < 3) imageNews.push({ image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E", title: "Loading...", id: Math.random() });

    return (
        <section className="w-full bg-white py-8 font-sans">
            <div className="w-full max-w-[1270px] mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-0 h-0 border-t-[8px] border-t-[#d91f26] border-l-[8px] border-l-transparent -mt-1"></div>
                        <h2 className="text-black text-[22px] font-black leading-none">खेल</h2>
                    </div>
                    <a href="#" className="text-[#d91f26] text-[14px] font-bold hover:underline flex items-center gap-1">
                        और भी <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mt-0.5"><path d="M5 3l14 9-14 9V3z" /></svg>
                    </a>
                </div>

                {/* Content Box with thick border */}
                <div className="border-[6px] border-[#424242] bg-white p-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        
                        {/* Left Column (Text List) */}
                        <div className="flex flex-col justify-between">
                            {textNews.map((item, index) => (
                                <Link href={item.id !== 'loading' ? `/news/${item.id}` : '#'} key={index} className={`flex-1 flex flex-col justify-center block ${index !== textNews.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <h3 className="text-[#000] text-[16px] font-medium leading-[1.3] group-hover:text-[#d91f26] transition-colors py-3 hover:text-[#d91f26]">
                                        {item.title}
                                    </h3>
                                </Link>
                            ))}
                        </div>

                        {/* Middle Column (Image + Text) */}
                        <Link href={imageNews[0].id !== 'loading' && typeof imageNews[0].id === 'string' ? `/news/${imageNews[0].id}` : '#'} className="group cursor-pointer flex flex-col gap-2.5 block">
                            <div className="w-full aspect-[16/9] overflow-hidden">
                                <img loading="lazy" width="400" height="250" src={imageNews[0].image} alt={imageNews[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <h3 className="text-[#000] text-[16px] font-medium leading-[1.3] group-hover:text-[#d91f26] transition-colors line-clamp-3">
                                {imageNews[0].title}
                            </h3>
                        </Link>

                        {/* Right Column (Image + Text) */}
                        <Link href={imageNews[1].id !== 'loading' && typeof imageNews[1].id === 'string' ? `/news/${imageNews[1].id}` : '#'} className="group cursor-pointer flex flex-col gap-2.5 block">
                            <div className="w-full aspect-[16/9] overflow-hidden">
                                <img loading="lazy" width="400" height="250" src={imageNews[1].image} alt={imageNews[1].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <h3 className="text-[#000] text-[16px] font-medium leading-[1.3] group-hover:text-[#d91f26] transition-colors line-clamp-3">
                                {imageNews[1].title}
                            </h3>
                        </Link>

                        {/* 4th Column (Image + Text) */}
                        <Link href={imageNews[2].id !== 'loading' && typeof imageNews[2].id === 'string' ? `/news/${imageNews[2].id}` : '#'} className="group cursor-pointer flex flex-col gap-2.5 block">
                            <div className="w-full aspect-[16/9] overflow-hidden">
                                <img loading="lazy" width="400" height="250" src={imageNews[2].image} alt={imageNews[2].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <h3 className="text-[#000] text-[16px] font-medium leading-[1.3] group-hover:text-[#d91f26] transition-colors line-clamp-3">
                                {imageNews[2].title}
                            </h3>
                        </Link>

                    </div>
                </div>
            </div>
        </section>
    );
}





