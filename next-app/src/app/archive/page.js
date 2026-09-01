import React from 'react';
import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import Link from 'next/link';
import ArchiveFilter from '@/components/ArchiveFilter';
import { Play, Image as ImageIcon, CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Archive News - HBN24',
  description: 'Browse past news articles by date or month.',
};

export default async function ArchivePage({ searchParams }) {
    await connectToDatabase();
    
    // Parse searchParams
    const { date, month, year } = await searchParams;
    
    let query = { $or: [{ status: 'published' }, { status: { $exists: false } }] };
    let displayTitle = 'Latest Archive';
    
    // If a specific date is provided (YYYY-MM-DD)
    if (date) {
        const [y, m, d] = date.split('-');
        const startDate = new Date(y, m - 1, d);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(y, m - 1, d);
        endDate.setHours(23, 59, 59, 999);
        
        query.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
        
        displayTitle = `News for ${new Date(y, m - 1, d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    } 
    // If month (1-12) and year (YYYY) are provided
    else if (month && year) {
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);
        
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0); // Last day of the month
        endDate.setHours(23, 59, 59, 999);
        
        query.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
        
        displayTitle = `News for ${new Date(y, m - 1, 1).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}`;
    } else {
        // Default to showing latest news across all dates if no params
        displayTitle = 'Latest Archive';
    }

    const newsData = await News.find(query)
                               .sort({ createdAt: -1 })
                               .lean();
                               
    const news = newsData.map(item => {
        item._id = item._id.toString();
        if (item.createdAt) item.createdAt = item.createdAt.toString();
        if (item.updatedAt) item.updatedAt = item.updatedAt.toString();
        return item;
    });

    return (
        <div className="max-w-[1140px] mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-200 pb-6 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#da0000] mb-2 flex items-center gap-2">
                        <CalendarDays className="w-8 h-8" />
                        News Archive
                    </h1>
                    <p className="text-gray-600 font-medium flex items-center gap-2">
                        {displayTitle}
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full font-bold">
                            {news.length} न्यूज़
                        </span>
                    </p>
                </div>
                
                <div className="w-full md:w-auto">
                    <ArchiveFilter initialDate={date} initialMonth={month} initialYear={year} />
                </div>
            </div>
            
            {news.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-400 mb-2">No news found</h3>
                    <p className="text-gray-500">We couldn't find any news articles for the selected period.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {news.map((item, index) => (
                        <Link href={`/news/${item.slug || item._id}`} title={item.title || "News"} key={item._id || index} className="flex flex-col group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-[#da0000]/50 hover:shadow-[0_4px_12px_rgba(218,0,0,0.08)] transition-all duration-300 h-full p-4 relative">
                            {/* Content Only */}
                            <div className="flex flex-col flex-grow">
                                <span className="text-[12px] font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                                    <CalendarDays size={14} className="text-[#da0000]/70" />
                                    {new Date(item.createdAt).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <h3 className="text-[15px] font-bold text-[#222] leading-[1.5] group-hover:text-[#da0000] transition-colors line-clamp-3">
                                    {item.title}
                                </h3>
                            </div>
                            
                            {/* Icons (Video/Gallery indicators) */}
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                                {item.isVideo && (
                                    <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                        <Play size={10} className="text-[#da0000]" /> Video
                                    </span>
                                )}
                                {item.isGallery && (
                                    <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                        <ImageIcon size={10} className="text-[#da0000]" /> Gallery
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
