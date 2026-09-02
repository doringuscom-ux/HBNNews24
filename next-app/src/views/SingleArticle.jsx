 'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ThumbsUp, MessageCircle, Share2, Bookmark, Pencil, Trash2 } from 'lucide-react';
import { optimizeImage } from '@/utils/imageOptimizer';
import { cleanHtmlFormatting } from '@/utils/cleanHtmlFormatting';

export default function SingleArticle({ initialArticle }) {
    const { id } = useParams();
    const router = useRouter();
    const [article, setArticle] = useState(initialArticle || null);
    const [authorProfileImage, setAuthorProfileImage] = useState('');
    const [latestNews, setLatestNews] = useState([]);
    const [loading, setLoading] = useState(!initialArticle);
    const [isExpanded, setIsExpanded] = useState(false);

    // New states for interaction
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState({ name: '', text: '' });
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [myComments, setMyComments] = useState([]);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const commentsRef = useRef(null);
    const articleContentRef = useRef(null);

    // Effect to clean up any invisible trailing empty nodes (like <p><span><br></span></p>)
    // And to intercept clicks on injected related news links for SPA navigation
    useEffect(() => {
        if (articleContentRef.current) {
            // Remove foreign font-family inline styles so uniform clean font applies
            try {
                const allElements = articleContentRef.current.querySelectorAll('*');
                allElements.forEach(el => {
                    if (el.style.fontFamily) el.style.fontFamily = '';
                });
            } catch (err) {
                console.error("Error sanitizing article DOM:", err);
            }

            const handleLinkClick = (e) => {
                const anchor = e.target.closest('a');
                if (anchor && anchor.getAttribute('href') && anchor.getAttribute('href').startsWith('/news/')) {
                    e.preventDefault();
                    const href = anchor.getAttribute('href');
                    try {
                        router.push(href);
                    } catch (err) {
                        window.location.href = href;
                    }
                }
            };
            articleContentRef.current.addEventListener('click', handleLinkClick);

            // Related News Carousel functionality
            const leftBtn = articleContentRef.current.querySelector('.related-scroll-left');
            const rightBtn = articleContentRef.current.querySelector('.related-scroll-right');
            const scrollCont = articleContentRef.current.querySelector('.related-scroll-container');

            if (leftBtn && rightBtn && scrollCont) {
                // Hide scrollbar
                scrollCont.style.cssText = "scrollbar-width: none; -ms-overflow-style: none;";
                const style = document.createElement('style');
                style.innerHTML = ".related-scroll-container::-webkit-scrollbar { display: none; }";
                articleContentRef.current.appendChild(style);

                const scrollAmount = window.innerWidth < 640 ? 280 : 320;

                const onLeftClick = () => scrollCont.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                const onRightClick = () => scrollCont.scrollBy({ left: scrollAmount, behavior: 'smooth' });

                leftBtn.addEventListener('click', onLeftClick);
                rightBtn.addEventListener('click', onRightClick);

                const updateArrows = () => {
                    leftBtn.style.opacity = scrollCont.scrollLeft > 5 ? "1" : "0";
                    leftBtn.style.pointerEvents = scrollCont.scrollLeft > 5 ? "auto" : "none";

                    const maxScroll = scrollCont.scrollWidth - scrollCont.clientWidth;
                    rightBtn.style.opacity = scrollCont.scrollLeft >= maxScroll - 5 ? "0" : "1";
                    rightBtn.style.pointerEvents = scrollCont.scrollLeft >= maxScroll - 5 ? "none" : "auto";
                };
                scrollCont.addEventListener('scroll', updateArrows);
                // initial call after a short delay to ensure rendering
                setTimeout(updateArrows, 100);

                return () => {
                    if (articleContentRef.current) {
                        articleContentRef.current.removeEventListener('click', handleLinkClick);
                    }
                    leftBtn.removeEventListener('click', onLeftClick);
                    rightBtn.removeEventListener('click', onRightClick);
                    scrollCont.removeEventListener('scroll', updateArrows);
                };
            }

            return () => {
                if (articleContentRef.current) {
                    articleContentRef.current.removeEventListener('click', handleLinkClick);
                }
            };
        }
    });

    useEffect(() => {
        // Fetch article and latest news
        const fetchData = async () => {
            try {
                // If we don't have initialArticle, fetch it client-side
                if (!initialArticle) {
                    let articleRes;
                    let retries = 2;
                    while (retries >= 0) {
                        try {
                            articleRes = await fetch(`/api/news/article/${id}`);
                            if (articleRes.ok) break;
                        } catch (e) {
                            if (retries === 0) throw e;
                        }
                        if (retries > 0) await new Promise(r => setTimeout(r, 1500));
                        retries--;
                    }
                    
                    if (!articleRes || !articleRes.ok) throw new Error("API Failed");

                    const articleData = await articleRes.json();

                    if (articleData.redirect) {
                        router.replace(`/news/${articleData.newSlug}`);
                        return;
                    }
                    setArticle(articleData);
                }

                // Fetch latest news for sidebar (also with retry)
                let newsRes;
                let newsRetries = 2;
                while (newsRetries >= 0) {
                    try {
                        newsRes = await fetch(`/api/news`);
                        if (newsRes.ok) break;
                    } catch (e) {
                        if (newsRetries === 0) throw e;
                    }
                    if (newsRetries > 0) await new Promise(r => setTimeout(r, 1000));
                    newsRetries--;
                }
                
                const rawNewsData = newsRes && newsRes.ok ? await newsRes.json() : [];
                const currentArticleId = article?._id || initialArticle?._id || id;
                const filteredLatest = (Array.isArray(rawNewsData) ? rawNewsData : []).filter(
                    item => String(item._id) !== String(currentArticleId) && String(item.slug) !== String(id)
                );

                setLatestNews(filteredLatest);
                setLoading(false);

                // Fetch likes/comments based on loaded article
                if (article || initialArticle) {
                    const activeArticle = article || initialArticle;
                    setLikes(activeArticle.likes || 0);

                    // Check if user already liked
                    let likedArticles = [];
                    let mySavedComments = [];
                    try {
                        likedArticles = JSON.parse(localStorage.getItem('hbn_liked_articles') || '[]');
                        mySavedComments = JSON.parse(localStorage.getItem('hbn_my_comments') || '[]');
                    } catch (e) {}
                    setHasLiked(likedArticles.includes(activeArticle._id));
                    setMyComments(mySavedComments);

                    // Fetch comments
                    const commentsRes = await fetch(`/api/news/${activeArticle._id}/comments`);
                    if (commentsRes.ok) {
                        const commentsData = await commentsRes.json();
                        setComments(Array.isArray(commentsData) ? commentsData : []);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                if (!initialArticle) setArticle({ message: 'Server timeout. Please refresh.' });
                setLoading(false);
            }
        };
        fetchData();
        // Scroll to top when route changes
        window.scrollTo(0, 0);
        // Reset expanded state
        setIsExpanded(false);
    }, [id]);

    const handleLike = async () => {
        if (hasLiked || !article) return;

        // Optimistic UI
        setLikes(prev => prev + 1);
        setHasLiked(true);
        let likedArticles = [];
        try {
            likedArticles = JSON.parse(localStorage.getItem('hbn_liked_articles') || '[]');
            likedArticles.push(article._id);
            localStorage.setItem('hbn_liked_articles', JSON.stringify(likedArticles));
        } catch (e) {}

        try {
            const res = await fetch(`/api/news/${article._id}/like`, { method: 'PUT' });
            if (!res.ok) {
                // Revert if failed
                setLikes(prev => prev - 1);
                setHasLiked(false);
                const revertedLiked = likedArticles.filter(id => id !== article._id);
                try { localStorage.setItem('hbn_liked_articles', JSON.stringify(revertedLiked)); } catch(e) {}
            }
        } catch (error) {
            console.error('Error liking article:', error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.name.trim() || !newComment.text.trim()) return;

        setIsSubmittingComment(true);
        try {
            const res = await fetch(`/api/news/${article._id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment)
            });
            if (res.ok) {
                const addedComment = await res.json();
                setComments([addedComment, ...comments]);
                setNewComment({ name: '', text: '' });

                // Save to myComments
                const updatedMyComments = [...myComments, addedComment._id];
                setMyComments(updatedMyComments);
                try { localStorage.setItem('hbn_my_comments', JSON.stringify(updatedMyComments)); } catch(e) {}
            } else {
                alert('Failed to post comment. Please try again.');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Error posting comment. Please try again.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleEditCommentSubmit = async (commentId) => {
        if (!editCommentText.trim()) return;
        try {
            const res = await fetch(`/api/news/${article._id}/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editCommentText })
            });
            if (res.ok) {
                const updatedComment = await res.json();
                setComments(comments.map(c => c._id === commentId ? updatedComment : c));
                setEditingCommentId(null);
                setEditCommentText('');
            }
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const res = await fetch(`/api/news/${article._id}/comments/${commentId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setComments(comments.filter(c => c._id !== commentId));
                const updatedMyComments = myComments.filter(id => id !== commentId);
                setMyComments(updatedMyComments);
                try { localStorage.setItem('hbn_my_comments', JSON.stringify(updatedMyComments)); } catch(e) {}
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: article?.title || 'HBN24 News',
            text: article?.metaDescription || 'Read this news on HBN24',
            url: (typeof window !== 'undefined' ? window.location : { hostname: '' }).href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText((typeof window !== 'undefined' ? window.location : { hostname: '' }).href);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText((typeof window !== 'undefined' ? window.location : { hostname: '' }).href);
        alert("Link copied to clipboard!");
    };

    const handleBookmark = () => {
        alert("इस पेज को बुकमार्क करने के लिए कृपया अपने कीबोर्ड पर Ctrl+D (या Mac पर Cmd+D) दबाएं।");
    };

    const scrollToComments = () => {
        commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (article && article.author) {
            const fetchAuthorProfile = async () => {
                try {
                    const profileRes = await fetch(`/api/auth/profile/${encodeURIComponent(article.author)}`);
                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        if (profileData.profileImage) {
                            setAuthorProfileImage(profileData.profileImage);
                        }
                    }
                } catch (e) {
                    console.error("Error fetching author profile:", e);
                }
            };
            fetchAuthorProfile();
        }
    }, [article]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#da0000]"></div></div>;
    }

    if (!article || article.message) {
        if (article?.message?.includes('timeout')) {
            return (
                <div className="text-center py-20">
                    <p className="text-xl font-bold text-red-600 mb-4">Server loading timeout.</p>
                    <button onClick={() => window.location.reload()} className="bg-[#da0000] text-white px-4 py-2 rounded">
                        Refresh Page
                    </button>
                </div>
            );
        }
        return <div className="text-center py-20 text-xl font-bold text-red-600">Article not found (URL me shayad error hai)</div>;
    }

    // Clean all dirty Word styles, foreign fonts, inline font-sizes and legacy tags
    let cleanContent = cleanHtmlFormatting(article.content || '');

    // Auto-fix: If an editor accidentally formatted an entire long paragraph as <h2>/<h3>, convert it back to <p>
    cleanContent = cleanContent.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
        // If the heading tag contains a <br> separating a short heading title and body paragraph:
        if (inner.includes('<br>') || inner.includes('<br/>') || inner.includes('<br />')) {
            const parts = inner.split(/<br\s*\/?>/i);
            return parts.map(part => {
                const textOnly = part.replace(/<[^>]+>/g, '').trim();
                if (textOnly.length > 70) {
                    return `<p>${part}</p>`;
                } else if (textOnly.length > 0) {
                    return `<h3><strong>${part}</strong></h3>`;
                }
                return '';
            }).join('');
        }

        const textOnly = inner.replace(/<[^>]+>/g, '').trim();
        // If the heading text is longer than 70 characters (clearly a body paragraph, not a heading)
        if (textOnly.length > 70) {
            return `<p>${inner}</p>`;
        }
        return match;
    });

    // Auto-linkify raw URLs that aren't already part of an HTML tag
    cleanContent = cleanContent.replace(/<[^>]+>|(\b(https?:\/\/[^\s<]+))/g, (match, url) => {
        // If it's an HTML tag, leave it alone
        if (!url) return match;
        // If it's a URL, wrap it in an anchor tag with blue link styling
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb !important; text-decoration: underline !important; font-weight: 600 !important;">${url}</a>`;
    });

    // Inject related news inside the article content as a horizontal widget
    if (latestNews.length > 0) {
        // Get up to 4 related articles
        const relatedArticlesToInject = latestNews.filter(n => n.category === article.category).slice(0, 4);
        if (relatedArticlesToInject.length < 4) {
            const moreNews = latestNews.filter(n => n.category !== article.category).slice(0, 4 - relatedArticlesToInject.length);
            relatedArticlesToInject.push(...moreNews);
        }

        if (relatedArticlesToInject.length > 0) {
            const paragraphs = cleanContent.split(/(<\/p>)/i);
            const totalParagraphs = paragraphs.filter(p => p.toLowerCase() === '</p>').length;
            // Inject after the 2nd paragraph (or 1st if very short) to make it appear higher
            const targetParagraph = totalParagraphs >= 3 ? 2 : 1;

            let injectedHTML = '';
            let pCount = 0;
            let widgetInjected = false;

            for (let i = 0; i < paragraphs.length; i++) {
                injectedHTML += paragraphs[i];
                if (paragraphs[i].toLowerCase() === '</p>') {
                    pCount++;
                    if (pCount === targetParagraph && !widgetInjected) {

                        let articlesHtml = relatedArticlesToInject.map((related, index) => {
                            const linkUrl = `/news/${related.slug || related._id}`;
                            const isLast = index === relatedArticlesToInject.length - 1;
                            return `
                                <a href="${linkUrl}" class="flex-none w-[280px] sm:w-[320px] flex items-center gap-3 snap-start border-r border-gray-200 pr-4 hover:bg-gray-50/80 p-1.5 rounded transition-all cursor-pointer ${isLast ? 'border-r-0 pr-0' : ''}" style="text-decoration: none !important; cursor: pointer !important;">
                                    <div class="w-[120px] sm:w-[140px] h-[90px] sm:h-[100px] flex-shrink-0 overflow-hidden bg-gray-50 rounded">
                                        <img src="${optimizeImage(related.image, 300)}" alt="${related.title ? related.title.replace(/"/g, '&quot;') : 'News'}" class="w-full h-full object-contain" />
                                    </div>
                                    <div class="flex-1 flex flex-col justify-center">
                                        <span class="font-bold hover:text-[#da0000] transition-colors block" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; color: #111827 !important; font-size: 15px !important; line-height: 1.3 !important; cursor: pointer !important;">
                                            ${related.title}
                                        </span>
                                    </div>
                                </a>
                            `;
                        }).join('');

                        injectedHTML += `
                            <div class="my-8 font-sans w-full clear-both relative z-10 mx-auto max-w-[100%] group">
                                <div class="border border-gray-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] relative">
                                    <div class="bg-[#002866] px-4 py-2 font-extrabold" style="color: #ffffff !important; font-size: 17px !important;">
                                        संबंधित ख़बर
                                    </div>
                                    
                                    <button class="related-scroll-left absolute left-2 top-[55%] -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#a3a3a3] rounded-full flex items-center justify-center z-20 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-[#888] transition-all opacity-0 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><path d="m15 18-6-6 6-6" stroke="#ffffff" /></svg>
                                    </button>
                                    
                                    <button class="related-scroll-right absolute right-2 top-[55%] -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#a3a3a3] rounded-full flex items-center justify-center z-20 shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-[#888] transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><path d="m9 18 6-6-6-6" stroke="#ffffff" /></svg>
                                    </button>

                                    <div class="related-scroll-container flex overflow-x-auto gap-4 p-4 scroll-smooth snap-x relative items-center">
                                        ${articlesHtml}
                                    </div>
                                </div>
                            </div>
                        `;
                        widgetInjected = true;
                    }
                }
            }
            cleanContent = injectedHTML;
        }
    }

    const hasContent = cleanContent && cleanContent.trim() !== '';
    const breadcrumbCategory = article?.category?.find(c => c.toLowerCase() !== 'superfast');

    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 font-sans">

            {/* Left Column - Main Article */}
            <div className="w-full md:w-3/4 flex flex-col gap-5">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm font-medium text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis">
                    <Link href="/" className="hover:text-[#da0000] transition-colors">Home</Link>
                    <span className="mx-2">›</span>
                    {breadcrumbCategory && (
                        <>
                            <Link href={`/${breadcrumbCategory.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[#da0000] transition-colors capitalize">
                                {breadcrumbCategory}
                            </Link>
                            <span className="mx-2">›</span>
                        </>
                    )}
                    <span className="text-gray-800 truncate capitalize">{article.slug ? article.slug.replace(/-/g, ' ') : ''}</span>
                </nav>

                <h1 className="text-3xl md:text-[38px] font-black text-[#111] leading-[1.3] mt-2">
                    {article.title}
                </h1>



                <div className="w-full flex flex-col group cursor-pointer">
                    <div className="relative w-full bg-gray-100 overflow-hidden h-[300px] sm:h-[400px] md:h-[500px]">
                        <Image src={optimizeImage(article.image, 800)} alt={article.imageAlt || article.title} fill priority sizes="(max-width: 1280px) 100vw, 1280px" className="object-contain transition-transform duration-500 group-hover:scale-110 group-hover:origin-center" />
                    </div>
                    <p className="text-sm text-gray-500 py-2 px-1 border-b border-gray-200">
                        {article.imageAlt || `${article.title} (Photo)`}
                    </p>
                </div>

                {/* Author & Share Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={`/reporter/${(article.author || 'Admin').toLowerCase().replace(/\s+/g, '-')}`} className="relative w-10 h-10 rounded-full bg-gray-300 overflow-hidden hover:scale-105 transition-transform block">
                            <Image src={authorProfileImage || `https://ui-avatars.com/api/?name=${article.author || 'Admin'}&background=da0000&color=fff`} alt="Author" fill sizes="40px" className="object-cover" />
                        </Link>
                        <div className="flex flex-col">
                            <Link href={`/reporter/${(article.author || 'Admin').toLowerCase().replace(/\s+/g, '-')}`} className="font-bold text-[15px] text-gray-900 hover:text-[#da0000] transition-colors">{article.author || 'एडमिन'}</Link>
                            <span className="text-[13px] text-gray-500">
                                {article.location ? `${article.location}, ` : ''}{new Date(article.createdAt || Date.now()).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}, (अपडेटेड {new Date(article.createdAt || Date.now()).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })})
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500">
                        <a href="https://www.google.com/preferences/source?q=hbnnews24.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 border border-[#da0000] bg-white rounded-md px-2.5 py-[3px] hover:bg-red-50 transition-colors mr-1 sm:mr-2" title="Follow on Google News">
                            <span className="text-[13px] font-semibold text-gray-800">Prefer us on</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[14px] h-[14px]">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </a>
                        <button onClick={handleLike} className={`flex items-center gap-1 hover:text-[#da0000] transition-colors ${hasLiked ? 'text-[#da0000]' : ''}`}>
                            <ThumbsUp size={18} className={hasLiked ? 'fill-current' : ''} />
                            <span className="text-xs">{likes > 0 ? likes : ''}</span>
                        </button>
                        <button onClick={scrollToComments} className="flex items-center gap-1 hover:text-[#da0000] transition-colors">
                            <MessageCircle size={18} />
                            <span className="text-xs">{comments.length > 0 ? comments.length : ''}</span>
                        </button>
                        <a href="https://www.facebook.com/HBNNews24" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors" title="Facebook">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </a>
                        <button onClick={handleShare} className="hover:text-[#da0000] transition-colors"><Share2 size={18} /></button>
                        <button onClick={handleBookmark} className="flex items-center hover:text-[#da0000] transition-colors" title="Bookmark">
                            <Bookmark size={18} />
                        </button>
                    </div>
                </div>

                {/* Article Body - Always Full View */}
                {hasContent && (
                    <div className="relative">
                        <style>{`
                            .force-article-font {
                                font-family: var(--font-noto-devanagari), 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                                font-size: 18px !important;
                                line-height: 1.85 !important;
                                font-weight: 400 !important;
                                color: #222222 !important;
                            }
                            .force-article-font p,
                            .force-article-font span,
                            .force-article-font div,
                            .force-article-font li {
                                font-family: inherit !important;
                                font-weight: 400 !important;
                            }
                            .force-article-font b,
                            .force-article-font strong,
                            .force-article-font b *,
                            .force-article-font strong *,
                            .force-article-font b span,
                            .force-article-font strong span {
                                font-family: inherit !important;
                                font-weight: 800 !important;
                                color: #000000 !important;
                            }
                            .force-article-font h1,
                            .force-article-font h2,
                            .force-article-font h3,
                            .force-article-font h4,
                            .force-article-font h5,
                            .force-article-font h6 {
                                font-family: inherit !important;
                                font-weight: 800 !important;
                                color: #111827 !important;
                                margin-top: 24px !important;
                                margin-bottom: 12px !important;
                            }
                            .force-article-font p {
                                margin-bottom: 20px !important;
                            }
                        `}</style>
                        <div
                            ref={articleContentRef}
                            className="force-article-font [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4"
                            dangerouslySetInnerHTML={{ __html: cleanContent }}
                        />
                    </div>
                )}

                {/* Author Bio Box for Google News */}
                {hasContent && (
                    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm">
                        <Link href={`/reporter/${(article.author || 'Admin').toLowerCase().replace(/\s+/g, '-')}`} className="relative w-16 h-16 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform block">
                            <Image src={authorProfileImage || `https://ui-avatars.com/api/?name=${article.author || 'Admin'}&background=da0000&color=fff&size=128`} alt={article.author || 'Author'} fill sizes="64px" className="object-cover" />
                        </Link>
                        <div className="flex flex-col text-center sm:text-left">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">
                                About the Author: <Link href={`/reporter/${(article.author || 'Admin').toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[#da0000] hover:underline transition-colors">{article.author || 'HBN News 24 Desk'}</Link>
                            </h4>
                            <p className="text-gray-600 text-[15px] leading-relaxed">
                                {article.author && !['admin', 'एडमिन'].includes(article.author.toLowerCase())
                                    ? `${article.author} is a dedicated journalist and reporter for HBN News 24, committed to bringing you the most accurate and fastest news updates from ground zero.`
                                    : 'HBN News 24 Editorial Desk comprises a team of experienced journalists and editors dedicated to providing fast, verified, and unbiased news to our readers.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <div ref={commentsRef} className="mt-8 border-t border-gray-200 pt-8">
                    <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-8 flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={newComment.name}
                            onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                            className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#da0000]"
                            required
                        />
                        <textarea
                            placeholder="Write your comment here..."
                            value={newComment.text}
                            onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#da0000]"
                            rows="4"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            disabled={isSubmittingComment}
                            className="self-start bg-[#da0000] text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                    </form>

                    {/* Comments List */}
                    <div className="flex flex-col gap-6">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment._id} className="bg-gray-50 p-4 rounded-lg group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">{comment.name}</span>
                                            {myComments.includes(comment._id) && (
                                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">You</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            {(isAdmin || myComments.includes(comment._id)) && (
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {myComments.includes(comment._id) && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingCommentId(comment._id);
                                                                setEditCommentText(comment.text);
                                                            }}
                                                            className="text-gray-400 hover:text-blue-600"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                        className="text-gray-400 hover:text-red-600"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {editingCommentId === comment._id ? (
                                        <div className="mt-2 flex flex-col gap-2">
                                            <textarea
                                                value={editCommentText}
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                                rows="3"
                                            ></textarea>
                                            <div className="flex gap-2 self-end">
                                                <button
                                                    onClick={() => { setEditingCommentId(null); setEditCommentText(''); }}
                                                    className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleEditCommentSubmit(comment._id)}
                                                    className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-700">{comment.text}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Right Column - Sidebar */}
            <div className="w-full md:w-1/4">
                <div className="sticky top-6 flex flex-col">
                    <div className="flex items-center gap-2 border-b-[2px] border-gray-200 pb-2 mb-4">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-[#da0000] border-b-[6px] border-b-transparent transform rotate-45"></div>
                        <h2 className="text-xl font-bold">लेटेस्ट</h2>
                    </div>

                    <div className="flex flex-col gap-6">
                        {latestNews.filter(n => n._id !== (article?._id || initialArticle?._id)).slice(0, 8).map((news) => (
                            <Link href={`/news/${news.slug || news._id}`} key={news._id} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0">
                                <div className="relative w-[110px] h-[75px] flex-shrink-0 overflow-hidden rounded-[4px] bg-gray-100">
                                    <Image
                                        src={optimizeImage(news.image, 300) || "https://hbnnews24.com/favicon.png"}
                                        alt={news.title || "News"}
                                        fill
                                        sizes="110px"
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[15px] font-bold text-[#222] leading-[1.35] group-hover:text-[#da0000] transition-colors line-clamp-3">
                                        {news.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}









