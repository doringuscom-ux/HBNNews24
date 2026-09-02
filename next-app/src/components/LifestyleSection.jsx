import React from 'react';
import Image from 'next/image';
 from 'react';
import Link from 'next/link';
import { optimizeImage } from '../utils/imageOptimizer';

export default function LifestyleSection({ news = [] }) {
    if (!news || news.length === 0) return null;

    const mainNews = news[0];
    const sideNews = news.slice(1, 5);

    return (
        <section className="w-full bg-white pb-8 font-sans">
            <div className="w-full max-w-[1270px] mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-0 h-0 border-t-[8px] border-t-[#d91f26] border-l-[8px] border-l-transparent -mt-1"></div>
                        <h2 className="text-black text-[22px] font-black leading-none">लाइफस्टाइल</h2>
                    </div>
                    <Link href="/lifestyle" title="लाइफस्टाइल और स्वास्थ्य की सभी ख़बरें" className="text-[#d91f26] text-[14px] font-bold hover:underline flex items-center gap-1">
                        और भी <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mt-0.5"><path d="M5 3l14 9-14 9V3z" /></svg>
                    </Link>
                </div>

                {/* Content Box */}
                <div className="bg-[#f5f5f5] p-5 border border-[#eaeaea]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Left Column (Main News) */}
                        {mainNews && (
                            <Link href={`/news/${mainNews.slug || mainNews._id}`} title={mainNews.title} className="group cursor-pointer flex flex-col gap-3 block">
                                <div className="relative w-full aspect-[16/9] overflow-hidden">
                                    <Image src={optimizeImage(mainNews.image, 400) || "https://hbnnews24.com/favicon.png"} alt={mainNews.title} title={mainNews.title} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                </div>
                                <h3 className="text-[#000] text-[22px] font-bold leading-[1.3] group-hover:text-[#d91f26] transition-colors pr-4">
                                    {mainNews.title}
                                </h3>
                            </Link>
                        )}

                        {/* Right Column (List) */}
                        <div className="flex flex-col justify-between gap-4">
                            {sideNews.map((item, index) => (
                                <Link href={`/news/${item.slug || item._id}`} title={item.title} key={item._id || index} className={`flex gap-4 pb-4 ${index !== sideNews.length - 1 ? 'border-b border-[#e0e0e0]' : ''} group cursor-pointer block`}>
                                    <div className="w-[155px] flex-shrink-0 overflow-hidden">
                                        <Image src={optimizeImage(item.image, 300) || "https://hbnnews24.com/favicon.png"} alt={item.title} title={item.title} fill sizes="(max-width: 768px) 100vw, 400px" className="w-full h-[85px] object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-[#000] text-[18px] leading-[1.3] font-medium group-hover:text-[#d91f26] transition-colors mt-0.5">
                                            {item.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
