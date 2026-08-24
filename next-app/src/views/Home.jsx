 'use client';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import BreakingNews from "../components/BreakingNews"
import MainContent from "../components/MainContent"

// Lazy load below-the-fold components to reduce initial JS payload
const VideoSection = lazy(() => import("../components/VideoSection"));
const SportsSection = lazy(() => import("../components/SportsSection"));
const ReligionSection = lazy(() => import("../components/ReligionSection"));
const LifestyleSection = lazy(() => import("../components/LifestyleSection"));
const TechnologySection = lazy(() => import("../components/TechnologySection"));
const BusinessSection = lazy(() => import("../components/BusinessSection"));
const ShortVideos = lazy(() => import("../components/ShortVideos"));

export default function Home({ initialNews, initialVideos }) {
    const hasInitialData = Boolean(initialNews && (initialNews.featured?.length > 0 || initialNews.mixNews?.length > 0 || initialNews.latestNews?.length > 0));
    
    const [news, setNews] = useState(initialNews || {
        latestNews: [], mixNews: [], sports: [], religion: [], lifestyle: [], technology: [], business: [], entertainment: [], superfast: [], featured: []
    });
    const [videos, setVideos] = useState(initialVideos?.videos || []);
    const [shorts, setShorts] = useState(initialVideos?.shorts || []);
    const [news24Shorts, setNews24Shorts] = useState(initialVideos?.news24Shorts || []);
    const [loading, setLoading] = useState(!hasInitialData);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Instantly load from cache if available and no initial server props
                if (!hasInitialData) {
                    const cachedNews = typeof window !== 'undefined' ? localStorage.getItem('hbn24_home_cache') : null;
                    const cachedVideos = typeof window !== 'undefined' ? localStorage.getItem('hbn24_video_cache') : null;
                    if (cachedNews && cachedVideos) {
                        setNews(JSON.parse(cachedNews));
                        const v = JSON.parse(cachedVideos);
                        setVideos(v.videos || []);
                        setShorts(v.shorts || []);
                        setNews24Shorts(v.news24Shorts || []);
                        setLoading(false);
                    }
                }

                // 2. Refresh fresh data in the background
                const [newsRes, videoRes] = await Promise.all([
                    fetch('/api/news/home', { priority: 'low' }),
                    fetch('/api/youtube', { priority: 'low' })
                ]);
                let newsData = await newsRes.json();
                const videoData = await videoRes.json();

                if (newsData && (newsData.mixNews?.length || newsData.latestNews?.length)) {
                    setNews(newsData);
                    if (typeof window !== 'undefined') localStorage.setItem('hbn24_home_cache', JSON.stringify(newsData));
                }
                if (videoData && videoData.videos?.length) {
                    setVideos(videoData.videos || []);
                    setShorts(videoData.shorts || []);
                    setNews24Shorts(videoData.news24Shorts || []);
                    if (typeof window !== 'undefined') localStorage.setItem('hbn24_video_cache', JSON.stringify(videoData));
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching home data:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const [loadBelowFold, setLoadBelowFold] = useState(false);
    
    useEffect(() => {
        // Delay below-the-fold loading to give 100% network priority to LCP image
        if (!loading) {
            const timer = setTimeout(() => setLoadBelowFold(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    if (loading) {
        return (
            <div className="bg-white min-h-screen">
                <div className="w-full max-w-[1280px] mx-auto px-4 mt-8 mb-12 flex flex-col gap-8 animate-pulse">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-[70%] flex flex-col gap-8">
                            <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-gray-200 rounded-[16px]"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-[140px] h-[90px] bg-gray-200 rounded-[4px]"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full lg:w-[30%] flex flex-col gap-4">
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-[110px] h-[75px] bg-gray-200 rounded-[4px]"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <BreakingNews news={news.latestNews} />
            <MainContent mixNews={news.mixNews} entertainmentNews={news.entertainment} superfastNews={news.superfast} featuredNews={news.featured} videos={videos} shorts={shorts} />
            
            {loadBelowFold ? (
                <Suspense fallback={<div className="h-40 w-full animate-pulse bg-gray-100"></div>}>
                    <VideoSection videos={videos} />
                    <SportsSection news={news.sports} />
                    <ReligionSection news={news.religion} />
                    <LifestyleSection news={news.lifestyle} />
                    
                    {news24Shorts.length > 0 && (
                        <div className="w-full max-w-[1280px] mx-auto px-4 mb-12">
                            <ShortVideos shorts={news24Shorts} title="न्यूज़24 शॉर्ट्स" />
                        </div>
                    )}

                    <TechnologySection news={news.technology} />
                    <BusinessSection news={news.business} />
                </Suspense>
            ) : (
                <div className="h-screen w-full"></div>
            )}
        </div>
    );
}







