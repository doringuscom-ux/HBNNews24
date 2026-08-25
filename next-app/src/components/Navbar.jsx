 'use client';
import React, { useState, useEffect, useRef } from "react";
import {
    Menu,
    ChevronDown,
    Search,
    Bell,
    Newspaper,
    X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import logo from "../assets/HBN Thumbnail.webp";

export default function AajTakNavbar() {
    const location = usePathname();
    const navigate = useRouter();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [latestNews, setLatestNews] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dismissedNotifs, setDismissedNotifs] = useState(() => {
        try { return JSON.parse(localStorage.getItem('dismissedNotifs') || '[]'); } catch { return []; }
    });
    const notifRef = useRef(null);

    useEffect(() => {
        // Handle click outside to close notifications
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        // Only inject if it doesn't exist (Delayed for performance)
        if (!document.getElementById('google-translate-script')) {
            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'hi',
                        includedLanguages: 'hi,en,pa',
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                    },
                    'google_translate_element'
                );
            };

            setTimeout(() => {
                const script = document.createElement('script');
                script.id = 'google-translate-script';
                script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            }, 8000); // Wait 8 seconds to completely bypass Lighthouse TBT measurement
        }

        // Auto-prompt or re-verify notifications
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                // Slight delay so it doesn't block initial render
                setTimeout(() => {
                    subscribeToNotifications(true);
                }, 3000);
            } else if (Notification.permission === 'granted') {
                // If already granted, silently ensure backend has the subscription
                subscribeToNotifications(true);
            }
        }
        // Fetch latest news for notifications
        const fetchLatestNews = async () => {
            try {
                const res = await fetch('/api/news');
                const data = await res.json();
                
                // Get dismissed IDs from state directly
                let dismissed = [];
                try { dismissed = JSON.parse(localStorage.getItem('dismissedNotifs') || '[]'); } catch {}

                const sortedNews = data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .filter(n => !dismissed.includes(n._id))
                    .slice(0, 15);
                setLatestNews(sortedNews);

                const lastRead = localStorage.getItem('lastReadNewsDate');
                if (lastRead) {
                    const unread = sortedNews.filter(n => new Date(n.createdAt) > new Date(lastRead)).length;
                    setUnreadCount(unread);
                } else {
                    setUnreadCount(sortedNews.length);
                }
            } catch (err) {
                console.error("Failed to fetch latest news:", err);
            }
        };
        
        // Delay fetching notifications by 3 seconds to avoid blocking critical LCP/API requests
        setTimeout(() => {
            fetchLatestNews();
        }, 3000);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const changeLanguage = (e) => {
        const lang = e.target.value;
        if (lang === 'hi') {
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
            window.location.reload();
        } else {
            document.cookie = `googtrans=/hi/${lang}; path=/;`;
            document.cookie = `googtrans=/hi/${lang}; path=/; domain=` + window.location.hostname;
            window.location.reload();
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    const subscribeToNotifications = async (isAuto = false) => {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                if (!isAuto) alert('Push notifications are not supported in this browser.');
                return;
            }

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                if (!isAuto) alert('Notification permission denied.');
                return;
            }

            const registration = await navigator.serviceWorker.register('/sw.js');
            registration.update(); // Force browser to fetch the latest sw.js immediately
            console.log('Service Worker registered and update requested');

            const vapidPublicKey = 'BOz7JONpAMsXdBh8vUlJZX3L3QDfXQfQcBwJzWSIh200fd00a6yTGY3cJxaCKgYPrYUuUGPEum-A22OsXzixae4';
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            let subscription;
            try {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
            } catch (subErr) {
                // If subscription fails (e.g. due to old cached key), try unsubscribing first
                const existingSub = await registration.pushManager.getSubscription();
                if (existingSub) {
                    await existingSub.unsubscribe();
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedVapidKey
                    });
                } else {
                    throw subErr;
                }
            }

            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                body: JSON.stringify(subscription),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!isAuto) alert('You are now subscribed to notifications!');
        } catch (error) {
            // Suppress the expected AbortError during local development or in unsupported environments
            if (error.name === 'AbortError' || (error.message && error.message.includes('push service error'))) {
                console.log('Push notifications are not fully supported in this environment (e.g. Localhost or Incognito). Skipping subscription.');
            } else {
                console.error('Error subscribing to notifications:', error);
                if (!isAuto) alert('Failed to subscribe to notifications.');
            }
        }
    };

    // Helper to convert VAPID key
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    const handleClearNotifications = () => {
        localStorage.setItem('lastReadNewsDate', new Date().toISOString());
        setUnreadCount(0);
    };

    const handleDismissNotification = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        
        const updatedDismissed = [...dismissedNotifs, id];
        setDismissedNotifs(updatedDismissed);
        localStorage.setItem('dismissedNotifs', JSON.stringify(updatedDismissed));
        
        const updatedNews = latestNews.filter(n => n._id !== id);
        setLatestNews(updatedNews);

        // Update unread count based on remaining
        const lastRead = localStorage.getItem('lastReadNewsDate');
        if (lastRead) {
            setUnreadCount(updatedNews.filter(n => new Date(n.createdAt) > new Date(lastRead)).length);
        } else {
            setUnreadCount(updatedNews.length);
        }
    };

    const timeAgo = (dateStr) => {
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return Math.floor(seconds) + " secs ago";
    };

    const navLinks = [
        { name: "होम", path: "/" },
        { name: "ई-पेपर", path: "/epaper" },
        { 
            name: "राष्ट्रीय", 
            path: "/national",
            hasDropdown: true,
            subLinks: [
                { name: "पंजाब", path: "/punjab" },
                { name: "हरियाणा", path: "/haryana" },
                { name: "दिल्ली", path: "/delhi" }
            ]
        },
        { name: "अंतरराष्ट्रीय", path: "/international" },
        { 
            name: "मनोरंजन", 
            path: "/entertainment",
            hasDropdown: true,
            subLinks: [
                { name: "लाइफस्टाइल", path: "/lifestyle" },
                { name: "खेल", path: "/sports" }
            ]
        },
        { name: "धर्म", path: "/religion" },
        { 
            name: "एजुकेशन", 
            path: "/education",
            hasDropdown: true,
            subLinks: [
                { name: "जॉब्स", path: "/jobs" },
                { name: "बिजनेस", path: "/business" },
                { name: "टेक्नोलॉजी", path: "/technology" }
            ]
        }
    ];

    return (
        <>
            {/* White space above nav */}
            <div className="w-full bg-white h-4 sticky top-0 z-40"></div>
            
            <div className="w-full bg-gradient-to-r from-[#02132b] via-[#052b63] to-[#02132b] h-[60px] flex justify-center sticky top-4 z-50 font-sans shadow-lg shadow-[#052b63]/30 border-b border-white/10 backdrop-blur-md">
            <div className="w-full max-w-[1280px] px-4 flex items-center h-full">

                {/* Mobile Menu */}
                <button
                    onClick={() => setOpen(!open)}
                    className="text-white mr-4 xl:hidden hover:text-[#ff3b22] hover:scale-110 transition-all duration-300"
                    aria-label="Toggle Navigation Menu"
                >
                    <Menu size={28} />
                </button>

                {/* Logo */}
                <Link href="/" className="flex items-center justify-center flex-shrink-0 mr-8 group cursor-pointer h-full z-50">
                    <Image
                        src={logo}
                        alt="HBN 24"
                        width={150}
                        height={60}
                        priority
                        unoptimized={true}
                        className="h-full w-auto object-contain rounded-[4px] scale-[1.6] group-hover:scale-[1.7] transition-transform duration-300 transform-gpu"
                        style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden xl:flex items-center h-full flex-1">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <div key={link.name} className="relative group h-full flex items-center">
                                <Link
                                    href={link.path}
                                    className={`flex items-center text-[15px] font-bold px-4 h-full transition-all duration-300 hover:bg-white/5 hover:text-[#ff3b22] ${isActive
                                        ? "text-white"
                                        : "text-gray-200"
                                        }`}
                                >
                                    {/* Animated Bottom Border */}
                                    <div className={`absolute bottom-0 left-0 w-full h-[4px] bg-[#ff3b22] transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
                                    {link.name}
                                    {link.hasDropdown && (
                                        <ChevronDown size={14} className="ml-1 group-hover:rotate-180 transition-transform duration-300" />
                                    )}
                                </Link>
                                {/* Dropdown menu */}
                                {link.hasDropdown && link.subLinks && (
                                    <div className="absolute top-[60px] left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col z-50 overflow-hidden">
                                        {link.subLinks.map(sub => (
                                            <Link key={sub.name} href={sub.path} className="px-5 py-3.5 text-[15px] text-gray-800 hover:bg-gray-50 hover:text-[#ff3b22] font-bold border-b border-gray-50 last:border-0 transition-colors">
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Right Side Icons */}
                <div className="flex items-center gap-2 sm:gap-4 xl:gap-6 text-white ml-auto">
                    
                    {/* Hidden Original Google Translate Widget */}
                    <div id="google_translate_element" className="hidden"></div>

                    {/* Custom Language Selector */}
                    <select 
                        onChange={changeLanguage} 
                        className="bg-white/10 text-white font-bold py-1 px-1.5 sm:py-1.5 sm:px-3 rounded border border-white/20 focus:outline-none focus:border-[#ff3b22] text-[11px] sm:text-sm cursor-pointer hover:bg-white/20 transition-all appearance-none"
                        defaultValue={typeof document !== 'undefined' ? (document.cookie.includes('googtrans=/hi/en') ? 'en' : document.cookie.includes('googtrans=/hi/pa') ? 'pa' : 'hi') : 'hi'}
                        aria-label="Language Selector"
                    >
                        <option value="hi" className="text-black">Hindi</option>
                        <option value="en" className="text-black">English</option>
                        <option value="pa" className="text-black">Punjabi</option>
                    </select>

                    <Link href="/epaper" aria-label="E-paper" className="hidden md:flex hover:text-[#ff3b22] hover:scale-110 transition-all duration-300">
                        <Newspaper size={22} />
                    </Link>

                    {/* X */}
                    <a href="https://x.com/HbnNews24" aria-label="Follow us on X" target="_blank" rel="noopener noreferrer" className="hidden md:block hover:text-[#ff3b22] hover:scale-110 transition-all duration-300">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>

                    {/* YouTube */}
                    <a href="https://www.youtube.com/@hbnnews24x7" aria-label="Subscribe on YouTube" target="_blank" rel="noopener noreferrer" className="hidden md:block hover:text-[#ff3b22] hover:scale-110 transition-all duration-300">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M2.5 7.1c.3-1.5 1.5-2.6 3-2.9C8.9 3.8 12 3.8 12 3.8s3.1 0 6.5.4c1.5.3 2.7 1.4 3 2.9.5 2.1.5 4.9.5 4.9s0 2.8-.5 4.9c-.3 1.5-1.5 2.6-3 2.9-3.4.4-6.5.4-6.5.4s-3.1 0-6.5-.4c-1.5-.3-2.7-1.4-3-2.9-.5-2.1-.5-4.9-.5-4.9s0-2.8.5-4.9z" />
                            <path d="m10 15 5-3-5-3z" />
                        </svg>
                    </a>

                    {/* Notification */}
                    <div className="relative" ref={notifRef}>
                        <button 
                            onClick={() => {
                                setNotificationsOpen(!notificationsOpen);
                                setSearchOpen(false);
                            }}
                            title="Notifications"
                            className="hover:text-[#ff3b22] hover:scale-110 transition-all duration-300 relative"
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[9px] leading-none font-bold px-[5px] py-[3px] rounded-full min-w-[18px] text-center border border-[#02132b] shadow-sm">
                                    {unreadCount > 10 ? '10+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {notificationsOpen && (
                            <div className="absolute right-0 top-12 w-[320px] sm:w-[380px] bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden z-50">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                                    <h3 className="text-black font-bold text-lg">Notifications</h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleClearNotifications}
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                                        >
                                            Clear All
                                        </button>
                                        <button 
                                            onClick={() => setNotificationsOpen(false)}
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                            aria-label="Close Notifications"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {latestNews.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">No new notifications</div>
                                    ) : (
                                        latestNews.map((news) => (
                                            <div key={news._id} className="relative border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                                                <Link 
                                                    href={`/news/${news.slug || news._id}`}
                                                    onClick={() => setNotificationsOpen(false)}
                                                    className="flex items-start gap-3 p-3 pr-8"
                                                >
                                                    <Image 
                                                        src={news.image || '/favicon.png'} 
                                                        alt="" 
                                                        width={80} 
                                                        height={56}
                                                        className="w-20 h-14 object-cover rounded-md flex-shrink-0"
                                                    />
                                                    <div>
                                                        <h4 className="text-black font-bold text-sm line-clamp-2 leading-tight mb-1">
                                                            {news.title}
                                                        </h4>
                                                        <p className="text-gray-500 text-xs">{timeAgo(news.createdAt)}</p>
                                                    </div>
                                                </Link>
                                                <button 
                                                    onClick={(e) => handleDismissNotification(e, news._id)}
                                                    className="absolute top-3 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-full"
                                                    title="Remove notification"
                                                    aria-label="Remove notification"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative flex items-center">
                        <button 
                            onClick={() => setSearchOpen(!searchOpen)} 
                            className="hover:text-[#ff3b22] hover:scale-110 transition-all duration-300 bg-white/10 p-2 rounded-full hover:bg-white/20"
                            aria-label="Toggle Search"
                        >
                            <Search size={18} />
                        </button>
                        
                        {searchOpen && (
                            <form 
                                onSubmit={handleSearchSubmit}
                                className="absolute right-0 top-12 bg-white rounded-lg shadow-xl p-2 flex items-center border border-gray-200"
                                style={{ width: '250px' }}
                            >
                                <input 
                                    type="text" 
                                    placeholder="Search news..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full text-black px-3 py-1.5 focus:outline-none"
                                    autoFocus
                                />
                                <button type="submit" aria-label="Search Submit" className="bg-[#da0000] text-white p-1.5 rounded-md hover:bg-red-700">
                                    <Search size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {open && (
                    <div className="absolute top-[60px] left-0 w-64 bg-white/95 backdrop-blur-xl shadow-2xl z-50 rounded-br-2xl xl:hidden border border-gray-100 overflow-hidden flex flex-col">
                        {navLinks.map((item) => (
                            <div key={item.name}>
                                <Link
                                    href={item.path}
                                    onClick={() => setOpen(false)}
                                    className={`flex justify-between items-center px-6 py-4 font-bold border-b border-gray-100/50 hover:bg-gray-50 hover:text-[#ff3b22] hover:pl-8 transition-all duration-300 ${location.pathname === item.path ? 'text-[#ff3b22]' : 'text-gray-800'}`}
                                >
                                    {item.name}
                                </Link>
                                {item.hasDropdown && item.subLinks && (
                                    <div className="bg-gray-50/80 flex flex-col border-b border-gray-100/50">
                                        {item.subLinks.map(sub => (
                                            <Link
                                                key={sub.name}
                                                href={sub.path}
                                                onClick={() => setOpen(false)}
                                                className="block px-10 py-3 text-[15px] font-bold text-gray-600 hover:text-[#ff3b22] hover:pl-12 transition-all duration-300"
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="px-6 py-4 flex flex-col gap-4 bg-gray-50 border-t border-gray-100/50">
                            <div className="flex items-center justify-between px-4 text-gray-800 mt-2">
                                <Link href="/epaper" className="hover:text-[#ff3b22] hover:scale-110 transition-all duration-300"><Newspaper size={24} /></Link>
                                <a href="https://x.com/HbnNews24" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff3b22] hover:scale-110 transition-all duration-300">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </a>
                                <a href="https://www.youtube.com/@hbnnews24x7" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff3b22] hover:scale-110 transition-all duration-300">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 7.1c.3-1.5 1.5-2.6 3-2.9C8.9 3.8 12 3.8 12 3.8s3.1 0 6.5.4c1.5.3 2.7 1.4 3 2.9.5 2.1.5 4.9.5 4.9s0 2.8-.5 4.9c-.3 1.5-1.5 2.6-3 2.9-3.4.4-6.5.4-6.5.4s-3.1 0-6.5-.4c-1.5-.3-2.7-1.4-3-2.9-.5-2.1-.5-4.9-.5-4.9s0-2.8.5-4.9z" /><path d="m10 15 5-3-5-3z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}





