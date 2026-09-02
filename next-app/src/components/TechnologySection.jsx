import React from 'react';
import Image from 'next/image';
 from 'react';
import Link from 'next/link';
import { optimizeImage } from '../utils/imageOptimizer';

export default function TechnologySection({ news = [] }) {
    if (!news || news.length === 0) return null;

    const mainNews = news[0];
    const bottomNewsLeft = news[1];
    
    const middleNewsList = news.slice(2, 5);
    const rightNewsList = news.slice(5, 8);

    return (
        <section className="w-full bg-white pb-10 pt-4 font-sans border-b-2 border-gray-100">
            <div className="w-full max-w-[1270px] mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-0 h-0 border-t-[8px] border-t-[#d91f26] border-l-[8px] border-l-transparent -mt-1"></div>
                        <h2 className="text-black text-[22px] font-black leading-none">टेक्नोलॉजी</h2>
                    </div>
                    <Link href="/technology" title="टेक्नोलॉजी और गैजेट्स की सभी ख़बरें" className="text-[#d91f26] text-[14px] font-bold hover:underline flex items-center gap-1">
                        और भी <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mt-0.5"><path d="M5 3l14 9-14 9V3z" /></svg>
                    </Link>
                </div>

                {/* Content Box */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column (42%) */}
                    <div className="w-full md:w-[42%] flex flex-col md:pr-4 border-b md:border-b-0 md:border-r border-[#e5e5e5] pb-6 md:pb-0">
                        
                        {/* Top Main News */}
                        {mainNews && (
                            <Link href={`/news/${mainNews.slug || mainNews._id}`} title={mainNews.title} className="flex flex-col sm:flex-row gap-4 group cursor-pointer mb-5">
                                <div className="w-full sm:w-[230px] aspect-[16/9] overflow-hidden flex-shrink-0 bg-gray-50 rounded">
                                    <Image src={optimizeImage(mainNews.image, 400) || "https://hbnnews24.com/favicon.png"} alt={mainNews.title} title={mainNews.title} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[#000] text-[20px] font-bold leading-[1.3] group-hover:text-[#d91f26] transition-colors pt-1">
                                        {mainNews.title}
                                    </h3>
                                </div>
                            </Link>
                        )}

                        {/* Bottom News Left */}
                        {bottomNewsLeft && (
                            <Link href={`/news/${bottomNewsLeft.slug || bottomNewsLeft._id}`} title={bottomNewsLeft.title} className="border-t border-[#e5e5e5] pt-4 group cursor-pointer flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-[130px] aspect-[16/9] overflow-hidden flex-shrink-0 bg-gray-50 rounded">
                                    <Image src={optimizeImage(bottomNewsLeft.image, 300) || "https://hbnnews24.com/favicon.png"} alt={bottomNewsLeft.title} title={bottomNewsLeft.title} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="flex-1 flex items-center">
                                    <h3 className="text-[#000] text-[17px] font-medium leading-[1.3] group-hover:text-[#d91f26] transition-colors mt-0.5">
                                        {bottomNewsLeft.title}
                                    </h3>
                                </div>
                            </Link>
                        )}

                    </div>

                    {/* Middle Column (29%) */}
                    <div className="w-full md:w-[29%] flex flex-col justify-between md:pr-4 border-b md:border-b-0 md:border-r border-[#e5e5e5] pb-6 md:pb-0 gap-4">
                        {middleNewsList.map((item, index) => (
                            <Link href={`/news/${item.slug || item._id}`} title={item.title} key={item._id || index} className={`flex flex-col sm:flex-row gap-3 group cursor-pointer ${index !== middleNewsList.length - 1 ? 'border-b border-[#e5e5e5] pb-4' : ''}`}>
                                <div className="w-full sm:w-[110px] aspect-[16/9] overflow-hidden flex-shrink-0 bg-gray-50 rounded">
                                    <Image src={optimizeImage(item.image, 300) || "https://hbnnews24.com/favicon.png"} alt={item.title} title={item.title} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="flex-1 flex pt-1">
                                    <h3 className="text-[#000] text-[16px] font-medium leading-[1.3] group-hover:text-[#d91f26] transition-colors mt-0.5">
                                        {item.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Right Column (29%) */}
                    <div className="w-full md:w-[29%] flex flex-col justify-between gap-4">
                        {rightNewsList.map((item, index) => (
                            <Link href={`/news/${item.slug || item._id}`} title={item.title} key={item._id || index} className={`flex flex-col sm:flex-row gap-3 group cursor-pointer ${index !== rightNewsList.length - 1 ? 'border-b border-[#e5e5e5] pb-4' : ''}`}>
                                <div className="w-full sm:w-[110px] aspect-[16/9] overflow-hidden flex-shrink-0 bg-gray-50 rounded">
                                    <Image src={optimizeImage(item.image, 300) || "https://hbnnews24.com/favicon.png"} alt={item.title} title={item.title} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <div className="flex-1 flex pt-1">
                                    <h3 className="text-[#000] text-[16px] font-medium leading-[1.3] group-hover:text-[#d91f26] transition-colors mt-0.5">
                                        {item.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
