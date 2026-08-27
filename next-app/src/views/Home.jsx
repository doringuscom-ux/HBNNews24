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
    const rawNews = initialNews || {
        latestNews: [], mixNews: [], sports: [], religion: [], lifestyle: [], technology: [], business: [], entertainment: [], superfast: [], featured: []
    };
    const videos = initialVideos?.videos || [];
    const shorts = initialVideos?.shorts || [];
    const news24Shorts = initialVideos?.news24Shorts || [];

    // Page-wide deduplication pipeline: Ensures NO news item repeats anywhere on the page
    const usedNewsIds = new Set();
    const getUniqueItems = (items = [], max = 15) => {
        const unique = [];
        for (const item of items) {
            if (!item) continue;
            const id = String(item._id || item.slug || item.title);
            if (!usedNewsIds.has(id)) {
                usedNewsIds.add(id);
                unique.push(item);
                if (unique.length >= max) break;
            }
        }
        return unique;
    };

    // 1. Featured News (Top 3)
    const featuredNews = getUniqueItems(rawNews.featured?.length > 0 ? rawNews.featured : rawNews.mixNews, 3);

    // 2. Aaj Ki Taza News (Subsequent news)
    const mixNews = getUniqueItems(rawNews.mixNews?.length > 0 ? rawNews.mixNews : rawNews.latestNews, 10);

    // 3. Category Sections
    const entertainmentNews = getUniqueItems(rawNews.entertainment, 12);
    const sportsNews = getUniqueItems(rawNews.sports, 12);
    const religionNews = getUniqueItems(rawNews.religion, 12);
    const lifestyleNews = getUniqueItems(rawNews.lifestyle, 12);
    const technologyNews = getUniqueItems(rawNews.technology, 12);
    const businessNews = getUniqueItems(rawNews.business, 12);
    const superfastNews = getUniqueItems(rawNews.superfast, 12);

    return (
        <div className="bg-white">
            <BreakingNews news={rawNews.latestNews} />
            <MainContent 
                mixNews={mixNews} 
                entertainmentNews={entertainmentNews} 
                superfastNews={superfastNews} 
                featuredNews={featuredNews} 
                videos={videos} 
                shorts={shorts} 
            />
            
            <VideoSection videos={videos} />
            <SportsSection news={sportsNews} />
            <ReligionSection news={religionNews} />
            <LifestyleSection news={lifestyleNews} />
            
            {news24Shorts.length > 0 && (
                <div className="w-full max-w-[1280px] mx-auto px-4 mb-12">
                    <ShortVideos shorts={news24Shorts} title="न्यूज़24 शॉर्ट्स" />
                </div>
            )}

            <TechnologySection news={technologyNews} />
            <BusinessSection news={businessNews} />
        </div>
    );
}







