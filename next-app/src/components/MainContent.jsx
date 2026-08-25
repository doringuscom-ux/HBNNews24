import React, { Suspense } from 'react';
import FeaturedNews from './FeaturedNews';
import NewsGrid from './NewsGrid';
import SidebarVideos from './SidebarVideos';
import PollWidget from './PollWidget';
import EntertainmentSection from './EntertainmentSection';

export default function MainContent({ mixNews = [], entertainmentNews = [], videos = [], shorts = [], superfastNews = [], featuredNews = [] }) {
    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 mt-8 mb-12 flex flex-col gap-8">
            {/* Upper Section: Featured + NewsGrid on left, Sidebar on right */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column (70%) */}
                <div className="w-full lg:w-[70%] flex flex-col gap-8">
                    <FeaturedNews news={featuredNews} />
                    <div className="w-full h-[1px] bg-gray-200"></div>
                    <NewsGrid news={mixNews} />
                </div>

                {/* Right Column (30%) - SidebarNews */}
                <div className="w-full lg:w-[30%]">
                    <div className="sticky top-6">
                        <div className="mb-8">
                            <PollWidget />
                        </div>
                        <SidebarVideos videos={shorts} />
                    </div>
                </div>
            </div>

            {/* Lower Section: Entertainment (Full Width) */}
            <div className="w-full flex flex-col gap-8">
                <EntertainmentSection news={entertainmentNews} />
            </div>
        </div>
    );
}





