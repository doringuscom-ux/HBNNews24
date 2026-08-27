 'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { optimizeImage } from '../utils/imageOptimizer';

export default function FeaturedNews({ news = [] }) {
    const featuredList = news.slice(0, 3);
    const count = featuredList.length;

    // Extended list with clones for seamless infinite looping
    // [LastClone, ...items, FirstClone]
    const extendedList = count > 1 ? [featuredList[count - 1], ...featuredList, featuredList[0]] : featuredList;

    const [currentIndex, setCurrentIndex] = useState(count > 1 ? 1 : 0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchStartY, setTouchStartY] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);
    const [touchEndY, setTouchEndY] = useState(null);

    // Auto-advance every 5 seconds
    useEffect(() => {
        if (count <= 1) return;
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setCurrentIndex((prev) => prev + 1);
        }, 5000);

        return () => clearInterval(interval);
    }, [count, currentIndex]);

    // Handle seamless infinite loop jump when reaching clones
    const handleTransitionEnd = () => {
        if (count <= 1) return;
        if (currentIndex >= count + 1) {
            // Reached clone of first slide (at end) -> snap silently to real first slide
            setIsTransitioning(false);
            setCurrentIndex(1);
        } else if (currentIndex <= 0) {
            // Reached clone of last slide (at start) -> snap silently to real last slide
            setIsTransitioning(false);
            setCurrentIndex(count);
        }
    };

    const handlePrev = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev - 1);
    };

    const handleNext = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
    };

    const handleDotClick = (e, idx) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsTransitioning(true);
        setCurrentIndex(idx + 1);
    };

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

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
            if (diffX > 0) {
                // Swiped Left -> Next slide
                handleNext();
            } else {
                // Swiped Right -> Previous slide
                handlePrev();
            }
        }
    };

    if (count === 0) {
        return (
            <div className="w-full bg-white rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-pulse">
                <div className="w-full aspect-[16/9] bg-gray-200"></div>
                <div className="p-6 bg-gradient-to-b from-white to-gray-50/50">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    // Active indicator dot index (0 to count - 1)
    const activeDotIndex = count > 1 
        ? (currentIndex === 0 ? count - 1 : currentIndex > count ? 0 : currentIndex - 1)
        : 0;

    return (
        <div 
            className="w-full relative bg-white rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-100 group select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div 
                className={`flex ${isTransitioning ? 'transition-transform duration-600 ease-out' : ''}`}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                onTransitionEnd={handleTransitionEnd}
            >
                {extendedList.map((featured, index) => {
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
                        <div key={`${featured._id || index}-${index}`} className="w-full flex-shrink-0">
                            <Link href={`/news/${featured.slug || featured._id}`} title={featured.title || "Featured News"} className="block w-full cursor-pointer">
                                <div className="relative overflow-hidden w-full bg-gray-100 flex items-center justify-center aspect-[16/9]">
                                    <Image 
                                        src={featured.image} 
                                        alt={featured.title || "Featured News"} 
                                        title={featured.title || "Featured News"}
                                        fill
                                        priority={index <= 2}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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

            {/* Left & Right Navigation Buttons (PC / Desktop & Hover) */}
            {count > 1 && (
                <>
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous Slide"
                        className="absolute left-3 top-[38%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#da0000] text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-lg md:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
                    >
                        <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next Slide"
                        className="absolute right-3 top-[38%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#da0000] text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-lg md:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
                    >
                        <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-20 bg-white/80 backdrop-blur-xs px-2 py-1 rounded-full shadow-xs">
                        {featuredList.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={(e) => handleDotClick(e, idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === activeDotIndex ? 'w-5 bg-[#da0000]' : 'w-1.5 bg-gray-300 hover:bg-gray-500'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}





