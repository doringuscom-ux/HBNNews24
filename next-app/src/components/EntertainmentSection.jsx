import React from 'react';
import Image from 'next/image';
 from 'react';
import Link from 'next/link';
import { optimizeImage } from '../utils/imageOptimizer';

export default function EntertainmentSection({ news = [] }) {
    const safeNews = (index, width = 300) => {
        if (news[index]) return { image: optimizeImage(news[index].image, width), title: news[index].title, id: news[index].slug || news[index]._id };
        return { 
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E", 
            title: "मनोरंजन समाचार", 
            id: `loading-${index}`
        };
    };

    const main = safeNews(0, 600);
    const subMain = safeNews(1);
    const list = [safeNews(2), safeNews(3), safeNews(4)];
    const list2 = [safeNews(5), safeNews(6), safeNews(7)];

    return (
        <div className="w-full mt-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b-[2px] border-gray-200 pb-2 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-[#da0000] border-b-[6px] border-b-transparent transform rotate-45"></div>
                    <h2 className="text-xl font-bold">मनोरंजन</h2>
                </div>
                <Link href="/entertainment" title="मनोरंजन की सभी खबरें" className="flex items-center gap-1 text-[#da0000] font-medium text-sm hover:underline">
                    और भी
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[5px] border-l-[#da0000] border-b-[4px] border-b-transparent"></div>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column (Main Feature + 1 small) */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    {/* Main Feature */}
                    <Link href={main.id !== 'loading' && typeof main.id === 'string' ? `/news/${main.id}` : '#'} title={main.title} className="relative group cursor-pointer block">
                        <div className="overflow-hidden bg-black rounded-[4px]">
                            <Image src={main.image || "https://hbnnews24.com/favicon.png"} alt={main.title || "Entertainment News"} title={main.title || "Entertainment News"} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-[272px] object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-[4px]">
                            <h3 className="text-white text-xl font-bold leading-snug group-hover:underline">
                                {main.title}
                            </h3>
                        </div>
                    </Link>

                    {/* Secondary Left Feature */}
                    <Link href={subMain.id !== 'loading' && typeof subMain.id === 'string' ? `/news/${subMain.id}` : '#'} title={subMain.title} className="flex gap-4 group cursor-pointer border-t border-gray-200 pt-4 block">
                        <div className="w-1/2 overflow-hidden bg-gray-50 rounded">
                            <Image src={subMain.image || "https://hbnnews24.com/favicon.png"} alt={subMain.title || "Entertainment News"} title={subMain.title || "Entertainment News"} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-[120px] object-contain group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="w-1/2 flex items-center">
                            <h3 className="text-[17px] font-bold leading-tight group-hover:text-[#da0000]">
                                {subMain.title}
                            </h3>
                        </div>
                    </Link>
                </div>

                {/* Middle Column (List 1) */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    {list.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <Link href={item.id !== 'loading' && typeof item.id === 'string' ? `/news/${item.id}` : '#'} title={item.title} className="flex gap-4 group cursor-pointer block">
                                <div className="w-1/2 overflow-hidden relative bg-gray-50 rounded">
                                    <Image src={item.image || "https://hbnnews24.com/favicon.png"} alt={item.title || "Entertainment News"} title={item.title || "Entertainment News"} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-[120px] object-contain group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="w-1/2 flex items-center">
                                    <h3 className="text-[17px] font-bold leading-tight group-hover:text-[#da0000]">
                                        {item.title}
                                    </h3>
                                </div>
                            </Link>
                            {index !== list.length - 1 && (
                                <div className="w-full h-[1px] bg-gray-200"></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Right Column (List 2) */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    {list2.map((item, index) => (
                        <React.Fragment key={item.id}>
                            <Link href={item.id !== 'loading' && typeof item.id === 'string' ? `/news/${item.id}` : '#'} title={item.title} className="flex gap-4 group cursor-pointer block">
                                <div className="w-1/2 overflow-hidden relative bg-gray-50 rounded">
                                    <Image src={item.image || "https://hbnnews24.com/favicon.png"} alt={item.title || "Entertainment News"} title={item.title || "Entertainment News"} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-[120px] object-contain group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="w-1/2 flex items-center">
                                    <h3 className="text-[17px] font-bold leading-tight group-hover:text-[#da0000]">
                                        {item.title}
                                    </h3>
                                </div>
                            </Link>
                            {index !== list2.length - 1 && (
                                <div className="w-full h-[1px] bg-gray-200"></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
