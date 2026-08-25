 'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function BreakingNews({ news = [] }) {
    const [isVisible, setIsVisible] = useState(true);
    const [customNews, setCustomNews] = useState([]);

    useEffect(() => {
        fetch('' + '/api/breaking-news')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setCustomNews(data);
                }
            })
            .catch(err => console.error('Error fetching breaking news:', err));
    }, []);

    const breakingNewsItems = customNews.length > 0 ? customNews : news.slice(0, 5);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (breakingNewsItems.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % breakingNewsItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [breakingNewsItems.length]);

    if (!isVisible || breakingNewsItems.length === 0) return null;

    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 mt-6">
            <style>{`
                @keyframes periodic-flip {
                    0%, 50% { transform: perspective(400px) rotateY(0deg) scale(1); }
                    75% { transform: perspective(400px) rotateY(180deg) scale(1.15); }
                    100% { transform: perspective(400px) rotateY(360deg) scale(1); }
                }
                .animate-periodic-flip {
                    animation: periodic-flip 4s infinite ease-in-out;
                    display: inline-block;
                    transform-style: preserve-3d;
                }
                @keyframes shimmer-sweep {
                    0% { transform: translateX(-150%) skewX(-15deg); }
                    100% { transform: translateX(300%) skewX(-15deg); }
                }
                .animate-shimmer-sweep {
                    animation: shimmer-sweep 3s infinite;
                }

                /* ── Attractive Border Styles ── */
                @keyframes border-rotate {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes slide-chevrons {
                    0% { background-position: 0px 50%; }
                    100% { background-position: 30px 50%; }
                }

                .breaking-border-wrap {
                    position: relative;
                    padding: 3px;
                    border-radius: 46px;
                    background: linear-gradient(135deg, #ff6b6b, #da0000, #ff6b6b, #ffb347, #da0000);
                    background-size: 300% 300%;
                    animation: border-rotate 4s ease-in-out infinite;
                    overflow: hidden;
                }

                .breaking-border-wrap .breaking-inner {
                    position: relative;
                    z-index: 1;
                    border-radius: 43px;
                    overflow: hidden;
                    background: #da0000;
                }

                /* Shimmer overlay inside border */
                .breaking-border-wrap .shimmer-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 40%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
                    transform: translateX(-150%) skewX(-20deg);
                    animation: shimmer-sweep 3.5s infinite;
                    pointer-events: none;
                    z-index: 2;
                    mix-blend-mode: overlay;
                }
                
                /* Moving Chevrons (>>>>) Effect */
                .chevron-overlay {
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 40'%3E%3Cpath fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' d='M10 10 L20 20 L10 30' /%3E%3C/svg%3E");
                    background-size: 30px 40px;
                    animation: slide-chevrons 0.8s linear infinite;
                    pointer-events: none;
                    z-index: 3;
                }

                /* Responsive tweaks */
                @media (max-width: 768px) {
                    .breaking-border-wrap {
                        border-radius: 8px;
                        padding: 2px;
                    }
                    .breaking-border-wrap .breaking-inner {
                        border-radius: 6px;
                    }
                }
            `}</style>

            {/* ── Attractive Border Wrapper ── */}
            <div className="breaking-border-wrap">

                {/* Spinning Animated Border */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3000px] h-[3000px] pointer-events-none z-0">
                    <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(255,255,255,1)_100%)] animate-[spin_1.5s_linear_infinite]"></div>
                </div>

                <div className="breaking-inner">

                    <div className="relative z-20 flex bg-[#da0000] text-white rounded-[6px] md:rounded-[46px] overflow-hidden md:h-12 md:items-center w-full h-full">

                        {/* Premium Sweeping Light Shimmer */}
                        <div className="shimmer-overlay"></div>

                        {/* Moving Chevrons (>>>>) */}
                        <div className="chevron-overlay"></div>

                        {/* Left Side: Breaking News Tag */}
                        <div className="flex flex-col md:flex-row items-center justify-center flex-shrink-0 bg-[#b30000] md:bg-transparent px-3 py-2 md:py-0 md:pl-5">
                            <span className="font-extrabold italic text-[11px] md:text-xl tracking-wide whitespace-nowrap drop-shadow-sm text-center leading-tight animate-periodic-flip">
                                <span className="block md:inline">BREAKING</span>
                                <span className="block md:inline md:ml-1">NEWS</span>
                            </span>
                            <div className="hidden md:block h-5 w-[2px] bg-white/40 mx-4"></div>
                        </div>

                        {/* Center: Headline (Animated Ticker) */}
                        <div className="flex-1 overflow-hidden relative min-h-[52px] md:min-h-0 md:h-full flex items-center px-3 py-1.5 md:py-0">
                            {breakingNewsItems.map((item, index) => {
                                const isCustom = !item.slug;
                                const content = item.text || item.title;
                                
                                let slideClass = '';
                                if (index === currentIndex) {
                                    slideClass = 'opacity-100 translate-x-0';
                                } else if (index === (currentIndex - 1 + breakingNewsItems.length) % breakingNewsItems.length) {
                                    // previous item goes to the left
                                    slideClass = 'opacity-0 -translate-x-12 pointer-events-none';
                                } else {
                                    // next items wait on the right
                                    slideClass = 'opacity-0 translate-x-12 pointer-events-none';
                                }

                                const className = `block absolute w-[95%] transition-all duration-500 ease-in-out ${slideClass}`;

                                return isCustom ? (
                                    <Link key={item._id || index} href="/breaking-news" className={className}>
                                        <p className="text-[13px] md:text-xl font-extrabold line-clamp-2 md:truncate cursor-pointer hover:underline leading-snug">
                                            {content}
                                        </p>
                                    </Link>
                                ) : (
                                    <Link
                                        key={item._id || index}
                                        href={`/news/${item.slug || item._id}`}
                                        className={className}
                                    >
                                        <p className="text-[13px] md:text-xl font-extrabold line-clamp-2 md:truncate cursor-pointer hover:underline leading-snug">
                                            {content}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Side: Close Button */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="flex-shrink-0 self-center ml-1 md:ml-4 mr-2 md:mr-3 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}




