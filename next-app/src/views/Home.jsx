import React, { Suspense } from 'react';
import BreakingNews from "../components/BreakingNews"
import MainContent from "../components/MainContent"
import VideoSection from "../components/VideoSection"
import SportsSection from "../components/SportsSection"
import ReligionSection from "../components/ReligionSection"
import LifestyleSection from "../components/LifestyleSection"
import TechnologySection from "../components/TechnologySection"
import BusinessSection from "../components/BusinessSection"
import ShortVideos from "../components/ShortVideos"

export default function Home({ initialNews, initialVideos }) {
    // We expect initialNews and initialVideos to be passed from the server (page.js).
    const news = initialNews || {
        latestNews: [], mixNews: [], sports: [], religion: [], lifestyle: [], technology: [], business: [], entertainment: [], superfast: [], featured: []
    };
    const videos = initialVideos?.videos || [];
    const shorts = initialVideos?.shorts || [];
    const news24Shorts = initialVideos?.news24Shorts || [];

    return (
        <div className="bg-white">
            <BreakingNews news={news.latestNews} />
            <MainContent 
                mixNews={news.mixNews} 
                entertainmentNews={news.entertainment} 
                superfastNews={news.superfast} 
                featuredNews={news.featured} 
                videos={videos} 
                shorts={shorts} 
            />
            
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
        </div>
    );
}







