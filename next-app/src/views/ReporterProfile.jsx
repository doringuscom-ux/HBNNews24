 'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa6';

export default function ReporterProfile() {
    const params = useParams();
    const name = params?.name || '';
    const [newsData, setNewsData] = useState([]);
    const [latestNewsData, setLatestNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [profilePhone, setProfilePhone] = useState('');

    const displayName = newsData.length > 0 && newsData[0].author 
        ? newsData[0].author 
        : (name ? name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Reporter');
    const authorBio = `${displayName} is a dedicated journalist and reporter for HBN News 24, committed to bringing you the most accurate and fastest news updates from ground zero.`;
    
    const getInitials = (fullName) => {
        if (!fullName) return '';
        const names = fullName.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch profile data
                try {
                    const profileRes = await fetch(`/api/auth/profile/${encodeURIComponent(name)}`);
                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        if (profileData.profileImage) {
                            setProfileImage(profileData.profileImage);
                        }
                        if (profileData.email) {
                            setProfileEmail(profileData.email);
                        }
                        if (profileData.phone) {
                            setProfilePhone(profileData.phone);
                        }
                    }
                } catch (e) {
                    console.error("Error fetching profile:", e);
                }

                const authorRes = await fetch(`/api/news/author/${encodeURIComponent(name)}`);
                const authorData = await authorRes.json();
                
                const allRes = await fetch('/api/news');
                const allData = await allRes.json();

                setNewsData(authorData);
                setLatestNewsData(allData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching news:", error);
                setLoading(false);
            }
        };
        if (name) {
            fetchNews();
        }
    }, [name]);

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center text-xl font-bold">Loading...</div>;
    }

    return (
        <div className="w-full min-h-screen bg-[#f3f4f6]">
            {/* Author Header Banner */}
            <div className="w-full bg-white border-b border-gray-200 py-10 px-4">
                <div className="max-w-[1270px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: Author Info */}
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#cc0000] flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden border-2 border-white">
                            {profileImage ? (
                                <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-3xl sm:text-4xl font-semibold tracking-wider">{getInitials(displayName)}</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{displayName}</h1>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                                {authorBio}
                            </p>
                        </div>
                    </div>
                    {/* Right: Social Links */}
                    <div className="flex items-center gap-4 mt-2 md:mt-0 w-full md:w-auto md:justify-end pl-[120px] md:pl-0">
                        <a href="https://www.youtube.com/@hbnnews24x7" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center text-white cursor-pointer hover:bg-red-700 shadow-sm transition-colors">
                            <FaYoutube size={20} />
                        </a>
                        <a href="https://www.facebook.com/HBNNews24" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 shadow-sm transition-colors">
                            <FaFacebookF size={18} />
                        </a>
                        <a href="https://www.instagram.com/hbnnews24/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center text-white cursor-pointer hover:opacity-90 shadow-sm transition-opacity">
                            <FaInstagram size={20} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Articles Section */}
            <div className="w-full max-w-[1270px] mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Main Content */}
                    <div className="w-full lg:w-[70%]">
                        <div className="flex items-center gap-2 mb-6 border-b-[2px] border-gray-100 pb-2">
                            <div className="w-0 h-0 border-t-[10px] border-t-[#d91f26] border-l-[10px] border-l-transparent"></div>
                            <h2 className="text-[20px] font-black text-black uppercase tracking-wide">Articles by {displayName}</h2>
                        </div>

                        {newsData.length === 0 ? (
                            <div className="bg-white p-8 text-center text-gray-500 font-medium border border-gray-200 rounded-sm">
                                No articles found for this author.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {newsData.map((news, idx) => (
                                    <Link href={`/news/${news.slug || news._id}`} key={idx} className="col-span-1 bg-white shadow-sm flex flex-col group cursor-pointer border border-gray-200 rounded-sm overflow-hidden">
                                        <div className="w-full aspect-[16/9] overflow-hidden relative">
                                            <img src={news.image} alt={news.title} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500" />
                                            {news.category && !Array.isArray(news.category) && (
                                                <span className="absolute top-2 left-2 bg-[#da0000] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                                    {news.category.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="text-black text-[15px] font-bold leading-[1.4] group-hover:text-[#d91f26] transition-colors line-clamp-3 mb-2">
                                                {news.title}
                                            </h3>
                                            <div className="mt-auto text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                                                {new Date(news.createdAt).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-[30%]">
                        <div className="bg-white p-5 shadow-sm border border-gray-200 sticky top-4">
                            <div className="flex items-center gap-2 mb-4 border-b-[2px] border-gray-100 pb-2">
                                <div className="w-0 h-0 border-t-[10px] border-t-[#d91f26] border-l-[10px] border-l-transparent"></div>
                                <h2 className="text-[20px] font-black text-black">लेटेस्ट</h2>
                            </div>
                            <div className="flex flex-col">
                                {latestNewsData.slice(0, 15).map((news, idx) => (
                                    <Link href={`/news/${news.slug || news._id}`} key={idx} className={`flex gap-3 py-3.5 group cursor-pointer ${idx !== Math.min(latestNewsData.length, 15) - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="w-[110px] aspect-[16/9] flex-shrink-0 overflow-hidden rounded-[2px]">
                                            <img src={news.image} alt="latest" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-300" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[14px] font-medium leading-[1.4] text-gray-800 group-hover:text-[#d91f26] transition-colors line-clamp-3">
                                                {news.title}
                                            </h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}






