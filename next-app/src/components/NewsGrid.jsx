
import React from 'react';
import { Play, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { optimizeImage } from '../utils/imageOptimizer';
export default function NewsGrid({ news = [] }) {
    // Show 8 items
    const gridItems = news.slice(0, 8);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {gridItems.map((item, index) => (
                <Link href={`/news/${item.slug || item._id}`} key={item._id || index} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 md:border-b-0 md:pb-0">
                    {/* Image */}
                    <div className="relative w-[140px] h-[90px] flex-shrink-0 overflow-hidden rounded-[4px]">
                        <Image
                            src={optimizeImage(item.image, 400) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E"}
                            alt={item.title || "News"}
                            width={140}
                            height={90}
                            unoptimized={true}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Icons */}
                        {item.isVideo && (
                            <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-white text-[11px] flex items-center gap-1 font-semibold backdrop-blur-sm">
                                <Play size={10} fill="white" /> {item.duration}
                            </div>
                        )}
                        {item.isGallery && (
                            <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-white text-[11px] flex items-center gap-1 font-semibold backdrop-blur-sm">
                                <ImageIcon size={10} className="text-[#da0000]" /> {item.count}
                            </div>
                        )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pt-1">
                        <h2 className="text-[16px] font-bold text-[#222] leading-[1.4] group-hover:text-[#da0000] transition-colors line-clamp-3">
                            {item.title}
                        </h2>
                    </div>
                </Link>
            ))}
        </div>
    );
}





