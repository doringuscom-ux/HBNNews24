 'use client';
import React, { useState } from "react";
import Image from 'next/image';
import { optimizeImage } from '../utils/imageOptimizer';

const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
};

export default function VideoSection({ videos = [] }) {
    const [mainIndex, setMainIndex] = useState(0);
    const [playingIndex, setPlayingIndex] = useState(null);
    const [animate, setAnimate] = useState(false);

    let activeVideos = videos.map((v, i) => ({ ...v, originalIndex: i }));
    
    // Fill with loading placeholders if API fails or hasn't loaded
    while (activeVideos.length < 5) {
        activeVideos.push({ originalIndex: activeVideos.length, title: "Loading...", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E", duration: "0:00", link: "#" });
    }

    // Determine current main video
    const mainVideo = activeVideos[mainIndex];
    
    // Filter out the main video from the side columns
    const remainingVideos = activeVideos.filter((_, i) => i !== mainIndex);
    const leftVideos = remainingVideos.slice(0, 2);
    const rightVideos = remainingVideos.slice(2, 4);

    const ytId = getYouTubeId(mainVideo.link);

    const handleVideoClick = (e, index) => {
        const clickedVideo = activeVideos.find(v => v.originalIndex === index);
        const clickedYtId = getYouTubeId(clickedVideo?.link);
        
        if (!clickedYtId) return; // Let standard link behavior happen
        e.preventDefault();

        // On mobile/tablet (<1024px), play inline without swapping
        if (window.innerWidth < 1024) {
            setPlayingIndex(index);
        } else {
            // On desktop, swap the video to the main center view
            if (index !== mainIndex) {
                setAnimate(true);
                setTimeout(() => {
                    setMainIndex(index);
                    setPlayingIndex(index);
                    setAnimate(false);
                }, 300);
            } else {
                setPlayingIndex(index);
            }
        }
    };

    return (
        <section className="video-section-widget">
            <div className="video-container">
                <div className="widget-head">
                    <div className="widget-title">
                        <span className="title-icon"></span>
                        <h2>वीडियो</h2>
                    </div>

                    <a href="/videos" title="सभी वीडियो देखें" className="widget-more">
                        और भी <span>▶</span>
                    </a>
                </div>

                <div className="video-inner-body">
                    <div className="video-col">
                        {leftVideos.map((video) => (
                            <VideoCard key={video.originalIndex} video={video} onClick={handleVideoClick} isPlaying={playingIndex === video.originalIndex} />
                        ))}
                    </div>

                    <div className="video-middle">
                        <div 
                            className={`main-video block relative overflow-hidden transition-all duration-300 transform w-full aspect-[16/9] ${animate ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                        >
                            {playingIndex === mainVideo.originalIndex && ytId ? (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`} 
                                    title={mainVideo.title}
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    className="relative absolute inset-0 w-full h-full"
                                ></iframe>
                            ) : (
                                <a 
                                    href={mainVideo.link} 
                                    title={mainVideo.title || "Video"}
                                    onClick={(e) => handleVideoClick(e, mainVideo.originalIndex)}
                                    className="block w-full h-full cursor-pointer group"
                                >
                                    <Image src={optimizeImage(mainVideo.image, 600) || "https://hbnnews24.com/favicon.png"} alt={mainVideo.title || "Video"} title={mainVideo.title || "Video"} fill sizes="(max-width: 768px) 100vw, 400px" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="main-gradient absolute inset-0 pointer-events-none"></div>
                                    <div className="main-caption absolute bottom-0 left-0 w-full p-4 pointer-events-none z-10">
                                        <h3 className="text-white text-xl font-bold">{mainVideo.title}</h3>
                                        <div className="main-play-wrap mt-2 flex items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                                            <div className="main-play w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">▶</div>
                                            <div className="main-duration text-white font-medium">{mainVideo.duration}</div>
                                        </div>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="video-col right-col">
                        {rightVideos.map((video) => (
                            <VideoCard key={video.originalIndex} video={video} onClick={handleVideoClick} isPlaying={playingIndex === video.originalIndex} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function VideoCard({ video, onClick, isPlaying }) {
    const ytId = getYouTubeId(video.link);
    
    if (isPlaying && ytId) {
        return (
            <div className="video-card block w-full mb-4 md:mb-0">
                <iframe 
                    width="100%" 
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`} 
                    title={video.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full aspect-video rounded-md"
                ></iframe>
                <h3 className="text-red-500 font-medium line-clamp-2 mt-2">{video.title}</h3>
            </div>
        );
    }

    return (
        <a 
            href={video.link} 
            title={video.title || "Video"}
            onClick={(e) => onClick(e, video.originalIndex)}
            className="video-card block cursor-pointer group mb-4 md:mb-0"
        >
            <div className="video-thumb overflow-hidden relative">
                <Image src={optimizeImage(video.image, 300) || "https://hbnnews24.com/favicon.png"} alt={video.title || "Video"} title={video.title || "Video"} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="duration">
                    <span className="small-play">▶</span>
                    {video.duration}
                </div>
            </div>
            <h3 className="group-hover:text-red-500 transition-colors line-clamp-2 mt-2">{video.title}</h3>
        </a>
    );
}





