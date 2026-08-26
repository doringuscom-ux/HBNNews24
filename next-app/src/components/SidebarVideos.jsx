 'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlayCircle, VolumeX } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimizer';

export default function SidebarVideos({ videos = [], title = "ट्रेंडिंग शॉर्ट्स" }) {
    const displayVideos = useMemo(() => {
        return [...videos].slice(0, 7);
    }, [videos]);

    const [playingIndex, setPlayingIndex] = useState(null); // Do not auto-play first video
    const [isMuted, setIsMuted] = useState(true);

    const containerRef = useRef(null);
    const videoRefs = useRef([]);

    const getYouTubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
        return match ? match[1] : null;
    };

    // Auto-scroll when a video finishes playing
    const handleVideoEnded = () => {
        setPlayingIndex((prev) => {
            const nextIndex = (prev + 1) % displayVideos.length;
            if (videoRefs.current[nextIndex] && containerRef.current) {
                containerRef.current.scrollTo({
                    top: videoRefs.current[nextIndex].offsetTop,
                    behavior: 'smooth'
                });
            }
            return nextIndex;
        });
    };

    // Safe way to listen to YouTube iframe events without crashing React DOM
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== 'https://www.youtube.com') return;
            try {
                const data = JSON.parse(event.data);
                // playerState 0 means ENDED
                if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
                    handleVideoEnded();
                }
            } catch (e) {
                // Ignore parsing errors from other messages
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [displayVideos.length]);

    const handleIframeLoad = (e) => {
        // Tell the YouTube iframe we are listening to events
        if (e.target && e.target.contentWindow) {
            e.target.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');
        }
    };

    // Manual click handler
    const handleVideoClick = (index, ytId, link) => {
        if (!ytId) {
            window.open(link, '_blank');
            return;
        }
        setPlayingIndex(index);
        if (videoRefs.current[index] && containerRef.current) {
            containerRef.current.scrollTo({
                top: videoRefs.current[index].offsetTop,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="w-full">
            {/* Header */}
            {/* <div className="flex items-end gap-3 mb-6 border-b border-gray-200 pb-3">
                <div className="flex items-end text-[#da0000]">
                    <h2 className="text-[30px] font-black italic tracking-tighter leading-none" style={{ textShadow: "0.5px 0.5px 0px #da0000" }}>{title}</h2>
                    <div className="flex flex-col ml-1.5 pb-0.5">
                        <div className="w-[32px] h-[3px] bg-[#da0000] mb-[3px]"></div>
                        <div className="w-[32px] h-[3px] bg-[#da0000] mb-[3px]"></div>
                        <div className="w-[32px] h-[3px] bg-[#da0000] mb-[1px]"></div>
                    </div>
                </div>
            </div> */}

            <div
                ref={containerRef}
                className="relative flex flex-col gap-6 max-h-[calc(100vh-350px)] min-h-[400px] overflow-y-auto snap-y snap-mandatory pb-6 insta-scroll rounded-xl"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style>{`
                    .insta-scroll::-webkit-scrollbar { display: none; }
                `}</style>
                {displayVideos.map((item, index) => {
                    const ytId = getYouTubeId(item.link);
                    const isPlaying = playingIndex === index && ytId;

                    return (
                        <div
                            key={index}
                            ref={(el) => (videoRefs.current[index] = el)}
                            className="flex flex-col group snap-start relative w-full aspect-[9/16] overflow-hidden rounded-2xl shadow-lg bg-black shrink-0"
                        >
                            {isPlaying ? (
                                <>
                                    {/* Native Iframe that worked before, with enablejsapi=1 added */}
                                    <iframe
                                        id={`yt-player-${index}`}
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&iv_load_policy=3&fs=0&enablejsapi=1`}
                                        title={item.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        onLoad={handleIframeLoad}
                                        className="w-full h-full absolute inset-0 z-0"
                                    ></iframe>

                                    {/* Unmute Overlay Button */}
                                    {isMuted && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsMuted(false); }}
                                            className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-[#da0000] text-white px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm transition-colors cursor-pointer"
                                        >
                                            <VolumeX size={16} />
                                            <span className="text-[11px] font-bold tracking-wide uppercase">Tap to Unmute</span>
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full absolute inset-0 z-0 cursor-pointer" onClick={() => handleVideoClick(index, ytId, item.link)}>
                                    {/* Image */}
                                    <img
                                        src={optimizeImage(item.image, 600) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"}
                                        alt={item.title || "Video"}
                                        title={item.title || "Video"}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />

                                    {/* Dark gradient for text & play button */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10 pointer-events-none transition-opacity duration-300"></div>

                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-16 h-16 bg-[#da0000]/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(218,0,0,0.6)] group-hover:bg-[#ff1a1a] group-hover:scale-110 transition-all duration-300">
                                            <PlayCircle className="text-white w-8 h-8 ml-1 opacity-100" />
                                        </div>
                                    </div>

                                    {/* Overlay Content (Title) */}
                                    <div className="absolute bottom-0 left-0 w-full p-5 pt-12 pointer-events-none flex flex-col justify-end">
                                        <div className="bg-[#da0000] text-white text-[11px] font-black px-2 py-0.5 rounded-sm w-fit mb-2 uppercase tracking-wider">
                                            Trending
                                        </div>
                                        <h3 className="text-[17px] font-bold text-white leading-[1.3] drop-shadow-md line-clamp-3">
                                            {item.title}
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





