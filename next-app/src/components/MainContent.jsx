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
                <div className="w-full lg:w-[70%] flex flex-col gap-6">
                    <FeaturedNews news={featuredNews} />

                    {/* Header: Aaj Ki Taza News (Below Featured News) */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-2 border-b-2 border-gray-100 mt-1 gap-1 sm:gap-3">
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="w-0 h-0 border-x-[5px] border-x-transparent border-t-[7px] border-t-[#da0000] shrink-0"></div>
                            <h1 className="text-black text-[18px] sm:text-[22px] font-black leading-none tracking-tight whitespace-nowrap">
                                Aaj Ki Taza News
                            </h1>
                        </div>
                        <p className="text-gray-400 font-normal text-[11px] sm:text-[13px] md:text-[14px] pl-3.5 sm:pl-0 leading-tight">
                            Get Daily updates &amp; Latest Breaking News in Hindi at HBN News 24
                        </p>
                    </div>

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





