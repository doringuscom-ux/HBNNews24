'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { optimizeImage } from '../utils/imageOptimizer';
import { GiRam, GiBullHorns, GiGemini, GiCrab, GiLion, GiFemale, GiScales, GiScorpion, GiBowArrow, GiGoat, GiJug, GiDoubleFish } from 'react-icons/gi';
import rashifalBg from '../assets/rashiphal_circle1.webp';

export default function ReligionSection({ news = [] }) {
    const [fetchedRashifal, setFetchedRashifal] = useState([]);
    const mainNews = news.length > 0 ? {
        image: news[0].image,
        title: news[0].title,
        _id: news[0].slug || news[0]._id
    } : {
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E", 
        title: "Loading...",
        _id: "loading"
    };

    const sideNews = news.slice(1, 4).map(n => ({
        image: n.image,
        title: n.title,
        _id: n.slug || n._id
    }));

    while (sideNews.length < 3) {
        sideNews.push({
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5e7eb'/%3E%3C/svg%3E",
            title: "Loading...",
            _id: "loading"
        });
    }

    const zodiacs = [
        { id: 0, sign: 'Aries', hindi: 'मेष राशि', Icon: GiRam, desc: 'आज का दिन आपके लिए ऊर्जावान रहेगा। नए कार्यों की शुरुआत करने के लिए समय अनुकूल है। स्वास्थ्य पर ध्यान दें।' },
        { id: 1, sign: 'Taurus', hindi: 'वृषभ राशि', Icon: GiBullHorns, desc: 'आर्थिक मामलों में सावधानी बरतें। किसी पुराने मित्र से मुलाकात हो सकती है। परिवार में शांति का माहौल रहेगा।' },
        { id: 2, sign: 'Gemini', hindi: 'मिथुन राशि', Icon: GiGemini, desc: 'रचनात्मक कार्यों में आपकी रुचि बढ़ेगी। कार्यस्थल पर आपको नए मौके मिलेंगे। वाणी पर संयम रखें।' },
        { id: 3, sign: 'Cancer', hindi: 'कर्क राशि', Icon: GiCrab, desc: 'आज आप भावनात्मक रूप से मजबूत रहेंगे। रुके हुए काम पूरे होने की संभावना है। सेहत में सुधार होगा।' },
        { id: 4, sign: 'Leo', hindi: 'सिंह राशि', Icon: GiLion, desc: 'आज आप आत्मविश्वास से भरे रहेंगे। करियर में नई ऊंचाइयों को छू सकते हैं। विवादों से दूर रहें।' },
        { id: 5, sign: 'Virgo', hindi: 'कन्या राशि', Icon: GiFemale, desc: 'परिश्रम का फल मिलेगा। व्यापार में लाभ की संभावना है। जीवनसाथी के साथ समय बिताने का मौका मिलेगा।' },
        { id: 6, sign: 'Libra', hindi: 'तुला राशि', Icon: GiScales, desc: 'मानसिक शांति मिलेगी। किसी धार्मिक यात्रा पर जाने का प्लान बन सकता है। पैसों के लेन-देन में सावधानी बरतें।' },
        { id: 7, sign: 'Scorpio', hindi: 'वृश्चिक राशि', Icon: GiScorpion, desc: 'हर काम सावधानी से करें, भावनाओं में बह कर फैसला करने से बचें, काम करने का तरीका बदलें लाभ होगा, अचानक धन लाभ के अवसर मिलेंगे।' },
        { id: 8, sign: 'Sagittarius', hindi: 'धनु राशि', Icon: GiBowArrow, desc: 'पारिवारिक जीवन में सुख-शांति रहेगी। आपके काम की प्रशंसा होगी। खान-पान पर ध्यान दें और क्रोध से बचें।' },
        { id: 9, sign: 'Capricorn', hindi: 'मकर राशि', Icon: GiGoat, desc: 'मेहनत का सकारात्मक परिणाम मिलेगा। कोई शुभ समाचार प्राप्त हो सकता है। क्रोध पर नियंत्रण रखें।' },
        { id: 10, sign: 'Aquarius', hindi: 'कुंभ राशि', Icon: GiJug, desc: 'सामाजिक कार्यों में आपकी हिस्सेदारी बढ़ेगी। दोस्तों का सहयोग मिलेगा। स्वास्थ्य सामान्य रहेगा।' },
        { id: 11, sign: 'Pisces', hindi: 'मीन राशि', Icon: GiDoubleFish, desc: 'आज आपको मानसिक संतोष मिलेगा। कला और संगीत में रुचि बढ़ेगी। धन लाभ के योग बन रहे हैं।' },
    ];

    // Merge dynamic descriptions if available
    const zodiacsWithDynamicData = zodiacs.map(z => {
        const dynamicData = fetchedRashifal.find(d => d.id === z.id);
        if (dynamicData) {
            return { ...z, desc: dynamicData.desc };
        }
        return z;
    });

    useEffect(() => {
        const fetchRashifal = async () => {
            try {
                const res = await fetch('' + '/api/rashifal');
                const data = await res.json();
                if (data.signs) {
                    setFetchedRashifal(data.signs);
                }
            } catch (error) {
                console.error('Error fetching dynamic rashifal:', error);
            }
        };
        fetchRashifal();
    }, []);

    const [activeIndex, setActiveIndex] = useState(8);

    const handlePrev = () => setActiveIndex((prev) => (prev - 1 + 12) % 12);
    const handleNext = () => setActiveIndex((prev) => (prev + 1) % 12);

    const visibleZodiacs = [
        zodiacsWithDynamicData[(activeIndex - 2 + 12) % 12],
        zodiacsWithDynamicData[(activeIndex - 1 + 12) % 12],
        zodiacsWithDynamicData[activeIndex],
        zodiacsWithDynamicData[(activeIndex + 1) % 12],
        zodiacsWithDynamicData[(activeIndex + 2) % 12],
    ];

    const activeData = zodiacsWithDynamicData[activeIndex];

    return (
        <section className="w-full bg-white pb-10 pt-4 font-sans">
            <div className="w-full max-w-[1270px] mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-0 h-0 border-t-[8px] border-t-[#d91f26] border-l-[8px] border-l-transparent -mt-1"></div>
                        <h2 className="text-black text-[22px] font-black leading-none">धर्म</h2>
                    </div>
                    <Link href="/religion" title="धर्म और अध्यात्म की सभी ख़बरें" className="text-[#d91f26] text-[14px] font-bold hover:underline flex items-center gap-1">
                        और भी <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mt-0.5"><path d="M5 3l14 9-14 9V3z" /></svg>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* Left Column (News) */}
                    <div className="w-full md:w-[55%] flex flex-col md:pr-5">
                        
                        {/* Top Main News */}
                        <Link href={mainNews._id !== 'loading' ? `/news/${mainNews._id}` : '#'} title={mainNews.title} className="flex flex-col sm:flex-row gap-4 group cursor-pointer mb-6">
                            <div className="w-full sm:w-[260px] aspect-[16/9] overflow-hidden flex-shrink-0 border border-gray-200 p-[2px]">
                                <img loading="lazy" width="400" height="250" src={optimizeImage(mainNews.image, 400)} alt={mainNews.title || "Dharmik News"} title={mainNews.title || "Dharmik News"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[#000] text-[26px] font-bold leading-[1.3] group-hover:text-[#d84315] transition-colors pt-1">
                                    {mainNews.title}
                                </h3>
                            </div>
                        </Link>

                        {/* Bottom List News */}
                        <div className="flex flex-col">
                            {sideNews.map((news, index) => (
                                <Link href={news._id !== 'loading' ? `/news/${news._id}` : '#'} title={news.title} key={index} className={`flex flex-col sm:flex-row gap-4 group cursor-pointer pt-4 ${index !== sideNews.length - 1 ? 'border-b border-[#e5e5e5] pb-4' : ''} ${index === 0 ? 'border-t-2 border-[#f57c00]/20' : ''}`}>
                                    <div className="w-full sm:w-[140px] aspect-[16/9] overflow-hidden flex-shrink-0 rounded-[4px]">
                                        <img loading="lazy" width="400" height="250" src={optimizeImage(news.image, 300)} alt={news.title || "Dharmik News"} title={news.title || "Dharmik News"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <div className="flex-1 flex pt-1">
                                        <h3 className="text-[#000] text-[17px] font-medium leading-[1.3] group-hover:text-[#d84315] transition-colors mt-0.5">
                                            {news.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Column (Horoscope Widget) */}
                    <div className="w-full md:w-[45%] flex flex-col md:pl-4 mt-8 md:mt-0">
                        <h3 className="text-[20px] font-bold text-black mb-3">राशिफल</h3>
                        
                        <div className="w-full relative overflow-hidden pb-8 pt-4 h-full rounded-[2px] bg-[#0d274c]">
                            
                            <style>{`
                                @keyframes rotateBg {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                                .animate-rotate-bg {
                                    animation: rotateBg 25s linear infinite;
                                }
                            `}</style>

                            {/* Rotating Background Image */}
                            <div 
                                className="absolute -inset-[15%] pointer-events-none opacity-100 animate-rotate-bg"
                                style={{ 
                                    backgroundImage: `url(${rashifalBg?.src || rashifalBg})`, 
                                    backgroundSize: '80%', 
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            ></div>

                            {/* Dark overlay to ensure text is readable */}
                            <div className="absolute inset-0 bg-[#0d274c]/20 pointer-events-none z-0"></div>
                            
                            <div className="absolute inset-2 border border-white/20 pointer-events-none z-10"></div>

                            {/* Zodiac Strip */}
                            <div className="flex items-center justify-between bg-[#030e1e]/90 h-[55px] relative z-20 border-y border-white/10 backdrop-blur-md">
                                <button onClick={handlePrev} className="bg-[#007acc] w-7 h-7 flex flex-shrink-0 items-center justify-center mx-3 cursor-pointer hover:bg-[#005f99] transition-colors rounded-sm">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                                </button>
                                
                                <div className="flex flex-1 justify-between items-center h-full relative">
                                    {visibleZodiacs.map((zodiac, i) => {
                                        const isActive = i === 2;
                                        return (
                                            <div key={`${zodiac.id}-${i}`} className={`flex-1 h-full flex items-center justify-center relative ${i < 2 ? 'border-r border-white/10' : i > 2 ? 'border-l border-white/10' : ''}`}>
                                                {isActive ? (
                                                    <div 
                                                        onClick={() => setActiveIndex(zodiac.id)}
                                                        className="bg-[#091b33] border border-[#3b4c6b] rounded-[6px] shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center h-[75px] w-[65px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 hover:bg-[#0a2040] transition-colors"
                                                    >
                                                        <zodiac.Icon className="text-[#f3c428] w-10 h-10" />
                                                    </div>
                                                ) : (
                                                    <div onClick={() => setActiveIndex(zodiac.id)} className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                                                        <zodiac.Icon className="text-gray-300 w-7 h-7" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <button onClick={handleNext} className="bg-[#007acc] w-7 h-7 flex flex-shrink-0 items-center justify-center mx-3 cursor-pointer hover:bg-[#005f99] transition-colors rounded-sm">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="relative z-20 flex flex-col items-center justify-center mt-6 px-10 h-[180px]">
                                <h3 className="text-white text-[32px] font-bold mb-3 drop-shadow-md">{activeData.hindi}</h3>
                                <p className="text-white text-center text-[18px] leading-[1.6] drop-shadow-sm font-medium">
                                    {activeData.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}





