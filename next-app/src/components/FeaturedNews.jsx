 'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { optimizeImage } from '../utils/imageOptimizer';

export default function FeaturedNews({ news = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const featuredList = news.slice(0, 10);

    useEffect(() => {
        if (featuredList.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredList.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [featuredList.length]);

    if (news.length === 0) {
        return (
            <div className="w-full bg-white rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-pulse">
                <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-gray-200"></div>
                <div className="p-6 bg-gradient-to-b from-white to-gray-50/50">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative bg-white rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-100 group">
            <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {featuredList.map((featured, index) => {
                    let displayCategory = '';
                    if (Array.isArray(featured.category)) {
                        const filtered = featured.category.filter(c => c.toLowerCase() !== 'superfast' && c.toLowerCase() !== 'featured');
                        displayCategory = filtered.length > 0 ? filtered[0] : (featured.category[0] || '');
                    } else if (typeof featured.category === 'string') {
                        displayCategory = featured.category;
                    }

                    let displayDesc = featured.description;
                    if (!displayDesc && featured.content) {
                        displayDesc = featured.content.replace(/<[^>]+>/g, '').substring(0, 180) + '...';
                    }
                    if (displayDesc) {
                        displayDesc = displayDesc.replace(/&amp;nbsp;/gi, ' ').replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
                    }
                    if (!displayDesc) {
                        displayDesc = "देश और दुनिया की तमाम बड़ी खबरों के लिए हमारे साथ बने रहें।";
                    }

                    return (
                        <div key={featured._id || index} className="w-full flex-shrink-0">
                            <Link href={`/news/${featured.slug || featured._id}`} className="block w-full cursor-pointer">
                                <div className="relative overflow-hidden w-full bg-gray-100 flex items-center justify-center aspect-[16/9] sm:aspect-[21/9]">
                                    <Image 
                                        src={optimizeImage(featured.image, 800)} 
                                        alt={featured.title || "Featured"} 
                                        fill
                                        unoptimized={true}
                                        priority={index === 0}
                                        fetchPriority={index === 0 ? "high" : "auto"}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                        className="object-contain group-hover:scale-95 transition-transform duration-700 ease-out rounded-[12px] group-hover:rounded-[16px]"
                                    />
                                </div>
                                <div className="p-6 bg-gradient-to-b from-white to-gray-50/50">
                                    <h1 className="text-[24px] md:text-[34px] font-black text-[#111] mb-4 group-hover:text-[#da0000] transition-colors leading-[1.25]">
                                        {featured.title}
                                    </h1>
                                    <div className="w-12 h-1.5 bg-[#da0000] mb-4 rounded-full"></div>
                                    <p className="text-gray-600 text-[17px] leading-relaxed line-clamp-2">
                                        {displayDesc}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Slider Controls */}
            {featuredList.length > 1 && (
                <>
                    <button 
                        onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev === 0 ? featuredList.length - 1 : prev - 1)); }}
                        className="absolute left-4 top-[25%] md:top-[30%] transform -translate-y-1/2 bg-white/80 hover:bg-white text-black w-10 h-10 flex items-center justify-center rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.1)] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label="Previous"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                        onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % featuredList.length); }}
                        className="absolute right-4 top-[25%] md:top-[30%] transform -translate-y-1/2 bg-white/80 hover:bg-white text-black w-10 h-10 flex items-center justify-center rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.1)] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label="Next"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </>
            )}
        </div>
    );
}





