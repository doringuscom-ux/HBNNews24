'use client';
import React, { useRef, useState } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimizer';

export default function ShortVideos({ shorts = [], title = "शॉर्ट वीडियो" }) {
    const scrollRef = useRef(null);
    const [playingVideoId, setPlayingVideoId] = useState(null);

    let allVideos = shorts.map((v, i) => ({
        id: v.videoId || i,
        title: v.title,
        image: v.image,
        tag: 'शॉर्ट्स',
        link: v.link
    }));

    while (allVideos.length < 6) {
        allVideos.push({
            id: Math.random(),
            title: "Loading...",
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E",
            tag: 'शॉर्ट्स',
            link: '#'
        });
    }

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const getYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
        return match ? match[1] : null;
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-[#da0000] border-b-[8px] border-b-transparent"></div>
                    <h2 className="text-[20px] font-bold text-[#111]">{title}</h2>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => scroll('left')}
                        className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight size={20} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Scrollable Container */}
            <div 
                ref={scrollRef} 
                className="flex overflow-x-auto snap-x snap-mandatory gap-4 scroll-smooth pb-4 no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {allVideos.map((video) => {
                    const ytId = getYouTubeId(video.link);
                    const isPlaying = playingVideoId === video.id;

                    return (
                        <div 
                            key={video.id} 
                            className="relative group overflow-hidden rounded-lg aspect-[9/16] flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-10.66px)] md:w-[calc(16.666%-13.33px)] snap-start bg-black"
                        >
                            {isPlaying && ytId ? (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`} 
                                    title={video.title} 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    className="w-full h-full absolute inset-0"
                                ></iframe>
                            ) : (
                                <div 
                                    className="w-full h-full cursor-pointer"
                                    onClick={() => ytId ? setPlayingVideoId(video.id) : window.open(video.link, '_blank')}
                                >
                                    <img 
                                        loading="lazy" 
                                        width="400" 
                                        height="250" 
                                        src={optimizeImage(video.image, 300)} 
                                        alt={video.title || "Short Video"} 
                                        title={video.title || "Short Video"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>

                                    {/* Tag */}
                                    <div className="absolute top-2 left-2 bg-[#da0000] text-white text-[11px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
                                        {video.tag}
                                    </div>

                                    {/* Play Button (Centered) */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-12 h-12 bg-[#da0000]/90 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(218,0,0,0.5)] group-hover:bg-[#ff1a1a] group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
                                            <Play size={24} fill="white" className="ml-1 text-white" />
                                        </div>
                                    </div>

                                    {/* Title (Bottom) */}
                                    <div className="absolute bottom-4 left-0 w-full px-3 text-center pointer-events-none">
                                        <h3 className="text-white text-[14px] font-bold leading-[1.3] line-clamp-3 drop-shadow-md">
                                            {video.title}
                                        </h3>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
