 'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { optimizeImage } from '../utils/imageOptimizer';

export default function FeaturedNews({ news = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchStartY, setTouchStartY] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);
    const [touchEndY, setTouchEndY] = useState(null);

    const featuredList = news.slice(0, 10);

    useEffect(() => {
        if (featuredList.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredList.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [featuredList.length]);

    const handleTouchStart = (e) => {
        setTouchEndX(null);
        setTouchEndY(null);
        setTouchStartX(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);
    };

    const handleTouchMove = (e) => {
        setTouchEndX(e.targetTouches[0].clientX);
        setTouchEndY(e.targetTouches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (touchStartX === null || touchEndX === null) return;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY !== null && touchEndY !== null ? touchStartY - touchEndY : 0;

        // Ensure horizontal swipe is dominant over vertical scroll
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX > 0) {
                // Swiped Left -> Next
                setCurrentIndex((prev) => (prev + 1) % featuredList.length);
            } else {
                // Swiped Right -> Prev
                setCurrentIndex((prev) => (prev === 0 ? featuredList.length - 1 : prev - 1));
            }
        }
    };

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
        <div 
            className="w-full relative bg-white rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-100 group select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
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
                            <Link href={`/news/${featured.slug || featured._id}`} title={featured.title || "Featured News"} className="block w-full cursor-pointer">
                                <div className="relative overflow-hidden w-full bg-gray-100 flex items-center justify-center aspect-[16/9] sm:aspect-[21/9]">
                                    <Image 
                                        src={featured.image} 
                                        alt={featured.title || "Featured News"} 
                                        title={featured.title || "Featured News"}
                                        fill
                                        priority={index === 0}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                        className="object-contain group-hover:scale-95 transition-transform duration-700 ease-out rounded-[12px] group-hover:rounded-[16px]"
                                    />
                                </div>
                                <div className="p-4 sm:p-5 bg-gradient-to-b from-white to-gray-50/50">
                                    <h2 className="text-[20px] md:text-[30px] font-black text-[#111] mb-2 group-hover:text-[#da0000] transition-colors leading-[1.3] line-clamp-2 sm:line-clamp-1">
                                        {featured.title}
                                    </h2>
                                    <div className="w-10 h-1 bg-[#da0000] mb-3 rounded-full"></div>
                                    <p className="text-gray-600 text-[14px] sm:text-[15px] leading-relaxed line-clamp-2 sm:line-clamp-1">
                                        {displayDesc}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Dots */}
            {featuredList.length > 1 && (
                <div className="absolute bottom-2 right-4 flex items-center gap-1.5 z-10">
                    {featuredList.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(idx); }}
                            aria-label={`Slide ${idx + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-5 bg-[#da0000]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}





