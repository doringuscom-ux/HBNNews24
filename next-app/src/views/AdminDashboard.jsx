 'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Pencil, Trash2, Plus, LayoutDashboard, Settings, LogOut, FileText, ChevronLeft, ChevronRight, X, Globe, Sparkles, Users, Menu, Eye, EyeOff, MessageSquare, BarChart2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import JoditEditor from 'jodit-react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { cleanHtmlFormatting } from '@/utils/cleanHtmlFormatting';

const ImageCropModal = ({ isOpen, onClose, imageSrc, onUpload, isUploading, aspectRatio = 16 / 9, title = "Crop Image" }) => {
    const [crop, setCrop] = useState({ unit: '%', x: 0, y: 0, width: 100, height: 100 / aspectRatio, aspect: aspectRatio });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [mode, setMode] = useState('crop'); // 'crop' or 'blur'
    const [zoom, setZoom] = useState(100);
    const imageRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 / aspectRatio, aspect: aspectRatio });
            setCompletedCrop(null);
            setMode('crop');
            setZoom(100);
        }
    }, [isOpen]);

    const getCroppedImg = async () => {
        try {
            const image = imageRef.current;
            const canvas = document.createElement('canvas');

            if (mode === 'blur') {
                const size = Math.max(image.naturalWidth, image.naturalHeight);
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');

                // Draw blurred background
                ctx.filter = 'blur(30px) brightness(0.8)';
                const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
                const w = image.naturalWidth * scale;
                const h = image.naturalHeight * scale;
                const x = (size - w) / 2;
                const y = (size - h) / 2;
                ctx.drawImage(image, x, y, w, h);

                // Draw sharp original image centered
                ctx.filter = 'none';
                const containScale = Math.min(size / image.naturalWidth, size / image.naturalHeight) * (zoom / 100);
                const cw = image.naturalWidth * containScale;
                const ch = image.naturalHeight * containScale;
                const cx = (size - cw) / 2;
                const cy = (size - ch) / 2;
                ctx.drawImage(image, cx, cy, cw, ch);
            } else {
                const scaleX = image.naturalWidth / image.width;
                const scaleY = image.naturalHeight / image.height;
                canvas.width = completedCrop.width;
                canvas.height = completedCrop.height;
                const ctx = canvas.getContext('2d');

                ctx.drawImage(
                    image,
                    completedCrop.x * scaleX,
                    completedCrop.y * scaleY,
                    completedCrop.width * scaleX,
                    completedCrop.height * scaleY,
                    0,
                    0,
                    completedCrop.width,
                    completedCrop.height
                );
            }

            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    resolve(blob);
                }, 'image/jpeg', 0.95);
            });
        } catch (e) {
            return null;
        }
    };

    const handleCropUploadLocal = async () => {
        if (mode === 'crop' && (!completedCrop || !imageRef.current)) return;
        if (mode === 'blur' && !imageRef.current) return;
        const croppedBlob = await getCroppedImg();
        if (croppedBlob) {
            onUpload(croppedBlob);
        }
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        {aspectRatio === 1 && (
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start">
                                <button onClick={() => setMode('crop')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${mode === 'crop' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                                    Manual Crop
                                </button>
                                <button onClick={() => setMode('blur')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${mode === 'blur' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                                    Fit & Blur
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200 self-start">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 sm:p-6 bg-gray-100 flex flex-col items-center justify-center flex-1 overflow-auto relative" style={{ minHeight: '50vh', maxHeight: '70vh' }}>
                    {mode === 'crop' ? (
                        <ReactCrop
                            crop={crop}
                            onChange={c => setCrop(c)}
                            onComplete={c => setCompletedCrop(c)}
                            aspect={aspectRatio}
                            className="max-w-full max-h-full shadow-lg"
                        >
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="Crop me"
                                className="max-w-full object-contain"
                                style={{ maxHeight: '60vh' }}
                            />
                        </ReactCrop>
                    ) : (
                        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                            <div className="relative w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full overflow-hidden shadow-2xl bg-black border-4 border-white">
                                <img src={imageSrc} className="absolute inset-0 w-full h-full object-cover blur-xl opacity-70 scale-110" alt="blur background" />
                                <img ref={imageRef} src={imageSrc} className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl transition-transform" style={{ transform: `scale(${zoom / 100})` }} alt="original" />
                            </div>
                            <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-700">Zoom Out Image</label>
                                    <span className="text-sm font-semibold text-red-600">{zoom}%</span>
                                </div>
                                <input type="range" min="40" max="100" value={zoom} onChange={(e) => setZoom(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" />
                                <p className="text-xs text-gray-500 mt-2 text-center">Adjust this if the logo corners are getting cut by the circle.</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleCropUploadLocal} disabled={isUploading || (mode === 'crop' && (!completedCrop?.width || !completedCrop?.height))} className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed">
                        {isUploading ? 'Uploading...' : mode === 'blur' ? 'Save & Upload' : 'Crop & Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    const editor = useRef(null);
    const submitStatusRef = useRef('published');
    const navigate = useRouter();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState('');
    const [cropType, setCropType] = useState('news');
    const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);
    const [isGeneratingRashifal, setIsGeneratingRashifal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [bulkStatus, setBulkStatus] = useState({ isRunning: false, total: 0, processed: 0 });
    const [missingSeoCount, setMissingSeoCount] = useState(0);

    const staticPagesList = [
        { url: '/', title: 'Home Page' },
        { url: '/entertainment', title: 'Entertainment' },
        { url: '/religion', title: 'Religion' },
        { url: '/sports', title: 'Sports' },
        { url: '/lifestyle', title: 'Lifestyle' },
        { url: '/business', title: 'Business' },
        { url: '/technology', title: 'Technology' },
        { url: '/epaper', title: 'E-Paper' },
        { url: '/breaking-news', title: 'Breaking News' },
        { url: '/punjab', title: 'Punjab (पंजाब)' },
        { url: '/haryana', title: 'Haryana (हरियाणा)' },
        { url: '/delhi', title: 'Delhi (दिल्ली)' },
        { url: '/jobs', title: 'Jobs' },
        { url: '/education', title: 'Education' },
        { url: '/national', title: 'National' },
        { url: '/international', title: 'International' },
        { url: '/about', title: 'About Us' },
        { url: '/contact', title: 'Contact Us' },
        { url: '/privacy-policy', title: 'Privacy Policy' },
        { url: '/terms', title: 'Terms & Conditions' },
        { url: '/disclaimer', title: 'Disclaimer' },
        { url: '/editorial-policy', title: 'Editorial Policy' },
        { url: '/fact-check-policy', title: 'Fact Check Policy' },
        { url: '/authors', title: 'Authors' },
        { url: '/corrections-policy', title: 'Corrections Policy' }
    ];

    const [pageSeoList, setPageSeoList] = useState([]);
    const [selectedPageSeoUrl, setSelectedPageSeoUrl] = useState('');
    const [pageSeoData, setPageSeoData] = useState({ metaTitle: '', metaDescription: '', metaKeywords: '', robots: 'index, follow' });

    const [currentView, setCurrentView] = useState('all');
    const [breakingNewsList, setBreakingNewsList] = useState([]);
    const [newBreakingNews, setNewBreakingNews] = useState('');
    const [editingBreakingNewsId, setEditingBreakingNewsId] = useState(null);
    const [isFetchingBreakingNews, setIsFetchingBreakingNews] = useState(false);
    const [selectedBreakingNews, setSelectedBreakingNews] = useState([]);

    const fetchBreakingNews = async () => {
        setIsFetchingBreakingNews(true);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await fetch('/api/breaking-news/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                setBreakingNewsList(data);
            }
        } catch (e) {
            console.error(e);
        }
        setIsFetchingBreakingNews(false);
    };

    const handleAddBreakingNews = async (e) => {
        e.preventDefault();
        if (!newBreakingNews.trim()) return;
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            
            if (editingBreakingNewsId) {
                const res = await fetch('/api/breaking-news/' + editingBreakingNewsId, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ text: newBreakingNews })
                });
                if (res.ok) {
                    setNewBreakingNews('');
                    setEditingBreakingNewsId(null);
                    fetchBreakingNews();
                }
            } else {
                const res = await fetch('/api/breaking-news', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ text: newBreakingNews })
                });
                if (res.ok) {
                    setNewBreakingNews('');
                    fetchBreakingNews();
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditBreakingNews = (item) => {
        setEditingBreakingNewsId(item._id);
        setNewBreakingNews(item.text);
    };

    const handleCancelEditBreakingNews = () => {
        setEditingBreakingNewsId(null);
        setNewBreakingNews('');
    };

    const handleToggleBreakingNews = async (id, currentStatus) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await fetch('/api/breaking-news/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                fetchBreakingNews();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteBreakingNews = async (id) => {
        if (!window.confirm('Are you sure you want to delete this breaking news?')) return;
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await fetch('/api/breaking-news/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchBreakingNews();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSelectAllBreakingNews = (e) => {
        if (e.target.checked) {
            setSelectedBreakingNews(breakingNewsList.map(item => item._id));
        } else {
            setSelectedBreakingNews([]);
        }
    };

    const handleSelectBreakingNews = (id) => {
        setSelectedBreakingNews(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleDeleteMultipleBreakingNews = async () => {
        if (!selectedBreakingNews.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedBreakingNews.length} selected items?`)) return;
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            await Promise.all(selectedBreakingNews.map(id => 
                fetch('/api/breaking-news/' + id, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ));
            setSelectedBreakingNews([]);
            fetchBreakingNews();
        } catch (e) {
            console.error(e);
        }
    };
    const [contactMessages, setContactMessages] = useState([]);
    const [userRole, setUserRole] = useState('user');
    const [currentUsername, setCurrentUsername] = useState('');
    const [usersList, setUsersList] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user', email: '', phone: '', profileImage: '', designation: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [editUserData, setEditUserData] = useState({ id: '', username: '', role: '', email: '', phone: '', password: '', profileImage: '', designation: '' });
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [rashifalData, setRashifalData] = useState([]);
    const [suvicharText, setSuvicharText] = useState('');
    const [isGeneratingSuvichar, setIsGeneratingSuvichar] = useState(false);
    const [myProfileData, setMyProfileData] = useState({ username: '', password: '', email: '', phone: '', profileImage: '', designation: '' });
    const [activityLogs, setActivityLogs] = useState([]);
    const [seoData, setSeoData] = useState({
        googleAnalyticsId: '',
        liveTvUrl: '',
        liveTvType: 'hls'
    });
    
    // Poll state
    const [pollQuestion, setPollQuestion] = useState("क्या भारत को UN सुरक्षा परिषद का स्थायी सदस्य होना चाहिए?");
    const [pollOptions, setPollOptions] = useState([
        { id: 1, text: "हाँ", emoji: "👍", initialVotes: 10000, realVotes: 0 },
        { id: 2, text: "नहीं", emoji: "👎", initialVotes: 2000, realVotes: 0 },
        { id: 3, text: "कह नहीं सकते", emoji: "🤔", initialVotes: 450, realVotes: 0 }
    ]);
    const [isSavingPoll, setIsSavingPoll] = useState(false);
    const [isPollActive, setIsPollActive] = useState(false);

    const [savedLocalDraft, setSavedLocalDraft] = useState(null);
    const [newsStatusFilter, setNewsStatusFilter] = useState('published'); // 'published', 'draft', 'all'

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        image: '',
        imageAlt: '',
        category: ['entertainment'],
        content: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        robots: 'index, follow',
        canonicalUrl: '',
        isEpaper: false,
        location: 'नई दिल्ली',
        author: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Auto-save draft to local storage while typing
    useEffect(() => {
        if (isModalOpen && !editingId) {
            if (formData.title?.trim() || formData.content?.trim()) {
                try {
                    localStorage.setItem('hbn_news_autosave_draft', JSON.stringify({
                        formData,
                        savedAt: new Date().toISOString()
                    }));
                } catch (e) {}
            }
        }
    }, [formData, isModalOpen, editingId]);

    // Warn before closing tab if unsaved changes exist
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isModalOpen && (formData.title?.trim() || formData.content?.trim())) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isModalOpen, formData.title, formData.content]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const API_URL = '/api/news';

    const joditConfig = useMemo(() => ({
        readonly: false,
        height: 380,
        placeholder: 'Paste the full article content here...',
        toolbarAdaptive: false,
        toolbarSticky: false,
        toolbarButtonSize: 'middle',
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: 'insert_as_html',
        buttons: [
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'superscript', 'subscript', '|',
            'ul', 'ol', '|',
            'outdent', 'indent', '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            'image', 'video', 'table', 'link', '|',
            'align', 'undo', 'redo', '|',
            'hr', 'eraser', 'copyformat', '|',
            'symbol', 'fullsize', 'source'
        ],
        uploader: {
            insertImageAsBase64URI: false,
            url: '/api/upload',
            format: 'json',
            method: 'POST',
            headers: { 'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null}` },
            filesVariableName: function (i) { return 'image'; },
            isSuccess: (resp) => !resp.error && resp.imageUrl,
            process: (resp) => {
                return {
                    files: [resp.imageUrl || ''],
                    path: resp.imageUrl || '',
                    baseurl: '',
                    error: resp.error ? 1 : 0,
                    msg: resp.message || ''
                };
            },
            defaultHandlerSuccess: function (data) {
                if (data.files && data.files.length > 0) {
                    const imageUrl = data.files[0];
                    
                    // 1. Insert a temporary marker at the current cursor position BEFORE the prompt
                    const markerId = 'img-marker-' + Date.now();
                    this.selection.insertHTML(`<span id="${markerId}"></span>`);
                    
                    // 2. Small delay to let DOM update before blocking prompt
                    setTimeout(() => {
                        const altText = window.prompt("Enter alt text for this image (Important for SEO):", "");
                        
                        let imgHtml = "";
                        if (altText && altText.trim() !== "") {
                            imgHtml = `<figure style="margin: 10px 0; text-align: center;">
                                        <img src="${imageUrl}" alt="${altText}" title="${altText}" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px;" />
                                        <figcaption style="font-size: 14px; color: #666; margin-top: 6px; font-style: italic;">${altText}</figcaption>
                                       </figure><p><br></p>`;
                        } else {
                            imgHtml = `<img src="${imageUrl}" alt="" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px;" /><p><br></p>`;
                        }
                        
                        // 3. Find the marker and replace it with the image
                        const marker = this.editorDocument.getElementById(markerId);
                        if (marker) {
                            marker.outerHTML = imgHtml;
                            // Manually fire change event so React state updates
                            this.events.fire('change');
                        } else {
                            this.selection.insertHTML(imgHtml);
                        }
                    }, 50);
                }
            },
            defaultHandlerError: function (err) {
                console.error("Jodit upload error:", err);
                alert("Image upload failed.");
            }
        }
    }), []);

    useEffect(() => {
        const verifyAndLoad = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            if (!token) {
                navigate.push('/admin/login');
                return;
            }
            try {
                const res = await fetch('/api/auth/verify', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) {
                    if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                    navigate.push('/admin/login');
                    return;
                }
                let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                setUserRole(data.role || 'user');
                if (data.username) {
                    setCurrentUsername(data.username);
                }

                if (data.role === 'admin') {
                    fetchUsers();
                    fetchActivityLogs();
                }
                if (data.role !== 'user') {
                    fetchNews();
                    fetchRashifal();
                    fetchSuvichar();
                    fetchSeo();
                }
                fetchMyProfile(data.username || (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null));
            } catch (error) {
                console.error('Verify error:', error);
            }
        };
        verifyAndLoad();
    }, []);

    const fetchUsers = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (!token) return;
        try {
            const res = await fetch('/api/auth/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                navigate.push('/admin/login');
                return;
            }
            if (res.ok) {
                let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                setUsersList(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchMyProfile = async (username) => {
        if (!username) return;
        setCurrentUsername(username);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await fetch(`/api/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                setMyProfileData({
                    username: data.username || '',
                    password: '',
                    email: data.email || '',
                    phone: data.phone || '',
                    profileImage: data.profileImage || '',
                    designation: data.designation || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchActivityLogs = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/auth/logs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                setActivityLogs(data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const fetchActivePoll = async () => {
        try {
            const res = await fetch(`/api/poll/active`);
            if (res.ok) {
                setIsPollActive(true);
                let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                setPollQuestion(data.question);
                
                if (data.options && Array.isArray(data.options)) {
                    setPollOptions(data.options.map(opt => ({
                        id: opt.id,
                        text: opt.text || '',
                        emoji: opt.emoji || '',
                        initialVotes: opt.initialVotes || 0,
                        realVotes: opt.realVotes || 0,
                    })));
                }
            } else {
                setIsPollActive(false);
            }
        } catch (error) {
            console.error('Error fetching poll:', error);
            setIsPollActive(false);
        }
    };

    const handleSavePoll = async () => {
        setIsSavingPoll(true);
        try {
            const res = await fetch(`/api/poll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null}`
                },
                body: JSON.stringify({ question: pollQuestion, options: pollOptions })
            });

            if (res.ok) {
                alert('Poll saved and activated successfully!');
                fetchActivePoll();
            } else {
                alert('Failed to save poll.');
            }
        } catch (error) {
            console.error('Error saving poll:', error);
            alert('Error saving poll.');
        } finally {
            setIsSavingPoll(false);
        }
    };

    const handleDeactivatePoll = async () => {
        if (!window.confirm("Are you sure you want to turn off the poll? It will be hidden from the public website.")) return;
        
        setIsSavingPoll(true);
        try {
            const res = await fetch(`/api/poll/deactivate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null}`
                }
            });

            if (res.ok) {
                alert('Poll deactivated successfully! It is now hidden.');
                setIsPollActive(false);
            } else {
                alert('Failed to deactivate poll.');
            }
        } catch (error) {
            console.error('Error deactivating poll:', error);
            alert('Error deactivating poll.');
        } finally {
            setIsSavingPoll(false);
        }
    };

    const fetchContactMessages = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (!token) return;
        try {
            const res = await fetch('/api/contact', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                setContactMessages(data);
            }
        } catch (error) {
            console.error('Error fetching contact messages:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (!token) return;
        try {
            const res = await fetch(`/api/contact/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'read' })
            });
            if (res.ok) fetchContactMessages();
        } catch (error) {
            console.error('Error updating message status:', error);
        }
    };

    const handleMarkAsUnread = async (id) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (!token) return;
        try {
            const res = await fetch(`/api/contact/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'new' })
            });
            if (res.ok) fetchContactMessages();
        } catch (error) {
            console.error('Error updating message status:', error);
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch(`/api/contact/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchContactMessages();
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/auth/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });
            if (res.ok) {
                alert('User created successfully');
                setNewUser({ username: '', password: '', role: 'user', email: '', phone: '', profileImage: '', designation: '' });
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.message || 'Error creating user');
            }
        } catch (error) {
            alert('Error creating user');
        }
    };

    const handleOpenEditUser = (u) => {
        setEditUserData({
            id: u._id,
            username: u.username,
            role: u.role || 'user',
            email: u.email || '',
            phone: u.phone || '',
            password: '',
            profileImage: u.profileImage || '',
            designation: u.designation || ''
        });
        setIsEditUserModalOpen(true);
    };

    const handleProfileImageUpload = async (e, isEdit) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setCropImageSrc(reader.result);
            setCropType(isEdit ? 'editProfile' : 'newProfile');
            setIsCropModalOpen(true);
        });
        reader.readAsDataURL(file);
    };

    const handleEditUserSubmit = async (e) => {
        e.preventDefault();
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch(`/api/auth/users/${editUserData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editUserData)
            });
            if (res.ok) {
                alert('User updated successfully');
                setIsEditUserModalOpen(false);
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.message || 'Error updating user');
            }
        } catch (error) {
            alert('Error updating user');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch(`/api/auth/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                navigate.push('/admin/login');
                return;
            }
            if (res.ok) {
                alert('User deleted successfully');
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.message || 'Error deleting user');
            }
        } catch (error) {
            alert('Error deleting user');
        }
    };

    const handleUpdateMyProfile = async (e) => {
        e.preventDefault();
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(myProfileData)
            });
            if (res.ok) {
                alert('Profile updated successfully');
                if (myProfileData.username && myProfileData.username !== currentUsername) {
                    if (typeof window !== 'undefined') localStorage.setItem('adminToken', resData.token);
                    setCurrentUsername(myProfileData.username);
                }
                fetchMyProfile(myProfileData.username || currentUsername);
                setMyProfileData(prev => ({ ...prev, password: '' }));
            } else {
                const err = await res.json();
                alert(err.message || 'Error updating profile');
            }
        } catch (error) {
            alert('Error updating profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeRole = async (id, newRole) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch(`/api/auth/users/${id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                alert('Role updated successfully');
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.message || 'Error updating role');
            }
        } catch (error) {
            alert('Error updating role');
        }
    };

    useEffect(() => {
        const fetchMissingCount = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            if (!token) return;
            try {
                const res = await fetch('/api/seo/missing-count', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.status === 401) {
                    if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                    navigate.push('/admin/login');
                    return;
                }
                let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                setMissingSeoCount(data.missingCount);
            } catch (e) { }
        };

        const fetchBulkStatus = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            if (!token) return;
            try {
                const res = await fetch('/api/seo/bulk-status', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.status === 401) {
                    if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                    navigate.push('/admin/login');
                    return;
                }
                let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                setBulkStatus(prev => {
                    if (prev.isRunning && !data.isRunning) {
                        fetchMissingCount();
                        fetchNews();
                    }
                    return data;
                });
            } catch (e) { }
        };

        fetchMissingCount();
        fetchBulkStatus();
        const intervalId = setInterval(fetchBulkStatus, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchSeo = async () => {
        try {
            const res = await fetch('/api/seo');
            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
            if (data) {
                setSeoData({
                    googleAnalyticsId: data.googleAnalyticsId || '',
                    liveTvUrl: data.liveTvUrl || '',
                    liveTvType: data.liveTvType || 'hls'
                });
            }
        } catch (error) {
            console.error('Error fetching global SEO:', error);
        }
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await fetch('/api/seo/pages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                navigate.push('/admin/login');
                return;
            }
            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
            setPageSeoList(data);
            if (selectedPageSeoUrl) {
                const homeSeo = data.find(p => p.pageUrl === selectedPageSeoUrl);
                if (homeSeo) {
                    setPageSeoData(homeSeo);
                }
            }
        } catch (error) {
            console.error('Error fetching page SEO:', error);
        }
    };

    const handleSelectedPageChange = (e) => {
        const url = e.target.value;
        setSelectedPageSeoUrl(url);
        const seo = pageSeoList.find(p => p.pageUrl === url);
        if (seo) {
            setPageSeoData({
                metaTitle: seo.metaTitle || '',
                metaDescription: seo.metaDescription || '',
                metaKeywords: seo.metaKeywords || '',
                robots: seo.robots || 'index, follow'
            });
        } else {
            setPageSeoData({ metaTitle: '', metaDescription: '', metaKeywords: '', robots: 'index, follow' });
        }
    };

    const handleEditStaticPage = (url) => {
        setSelectedPageSeoUrl(url);
        const seo = pageSeoList.find(p => p.pageUrl === url);
        if (seo) {
            setPageSeoData({
                metaTitle: seo.metaTitle || '',
                metaDescription: seo.metaDescription || '',
                metaKeywords: seo.metaKeywords || '',
                robots: seo.robots || 'index, follow'
            });
        } else {
            setPageSeoData({ metaTitle: '', metaDescription: '', metaKeywords: '', robots: 'index, follow' });
        }
        document.getElementById('static-seo-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePageSeoChange = (e) => {
        const { name, value } = e.target;
        setPageSeoData(prev => ({ ...prev, [name]: value }));
    };

    const handlePageSeoSave = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/seo/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ pageUrl: selectedPageSeoUrl, ...pageSeoData })
            });
            if (res.ok) {
                alert('Page SEO saved successfully!');
                fetchSeo();
            }
        } catch (err) {
            alert('Error saving Page SEO');
        }
    };

    const handleGenerateStaticSeo = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/seo/generate-static-pages', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
            if (res.ok) {
                setBulkStatus(data.status);
                setIsSeoModalOpen(false);
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Error generating static SEO');
        }
    };

    const handleSeoChange = (e) => {
        const { name, value } = e.target;
        setSeoData(prev => ({ ...prev, [name]: value }));
    };

    const handleSeoSave = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/seo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(seoData)
            });
            if (res.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                navigate.push('/admin/login');
                return;
            }
            alert('SEO settings saved successfully!');
        } catch (error) {
            console.error('Error saving SEO:', error);
            alert('Error saving SEO settings');
        }
    };

    const fetchRashifal = async () => {
        try {
            const res = await fetch('/api/rashifal');
            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
            if (data.signs) {
                setRashifalData(data.signs);
            }
        } catch (error) {
            console.error('Error fetching rashifal:', error);
        }
    };

    const handleRashifalTextChange = (id, newDesc) => {
        setRashifalData(prev => prev.map(item => item.id === id ? { ...item, desc: newDesc } : item));
    };

    const handleRashifalSave = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/rashifal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ signs: rashifalData })
            });
            if (res.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                navigate.push('/admin/login');
                return;
            }
            alert('Rashifal saved successfully!');
        } catch (error) {
            console.error('Error saving rashifal:', error);
            alert('Error saving rashifal');
        }
    };

    const handleGenerateRashifal = async () => {
        setIsGeneratingRashifal(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/rashifal/generate-ai', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
            if (res.ok) {
                alert('Rashifal Generated Successfully!');
                if (data.data && data.data.signs) {
                    setRashifalData(data.data.signs);
                }
            } else {
                alert(data.message || 'Failed to generate Rashifal');
            }
        } catch (err) {
            alert('Error generating Rashifal');
        } finally {
            setIsGeneratingRashifal(false);
        }
    };

    const fetchSuvichar = async () => {
        try {
            const res = await fetch('/api/suvichar');
            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
            if (data && data.text) {
                setSuvicharText(data.text);
            }
        } catch (error) {
            console.error('Error fetching suvichar:', error);
        }
    };

    const handleSuvicharSave = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/suvichar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: suvicharText })
            });
            if (res.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                navigate.push('/admin/login');
                return;
            }
            alert('Suvichar saved successfully!');
        } catch (error) {
            console.error('Error saving suvichar:', error);
            alert('Error saving suvichar');
        }
    };

    const handleGenerateSuvichar = async () => {
        setIsGeneratingSuvichar(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/suvichar/generate-ai', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
            if (res.ok) {
                alert('Suvichar Generated Successfully!');
                if (data.data && data.data.text) {
                    setSuvicharText(data.data.text);
                }
            } else {
                alert(data.message || 'Failed to generate Suvichar');
            }
        } catch (err) {
            alert('Error generating Suvichar');
        } finally {
            setIsGeneratingSuvichar(false);
        }
    };

    const fetchNews = async () => {
        try {
            const res = await fetch(API_URL);
            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
            const sortedData = data.sort((a, b) => (a._id < b._id ? 1 : -1));
            setNews(sortedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching news:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;

        if (name === 'slug' && typeof finalValue === 'string') {
            finalValue = finalValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: finalValue };
            if (name === 'title' && !prev.slug) {
                updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }
            return updated;
        });
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleCategoryCheckbox = (catId) => {
        setFormData(prev => {
            const currentCats = Array.isArray(prev.category)
                ? prev.category
                : (typeof prev.category === 'string' && prev.category.trim() !== '' ? [prev.category.trim()] : []);
            if (currentCats.includes(catId)) {
                return { ...prev, category: currentCats.filter(id => id !== catId) };
            } else {
                return { ...prev, category: [...currentCats, catId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        
        const payload = { 
            ...formData, 
            content: cleanHtmlFormatting(formData.content || ''),
            author: (formData.author && formData.author.trim() !== '') ? formData.author.trim() : (currentUsername || 'एडमिन'),
            status: submitStatusRef.current 
        };

        try {
            let res;
            if (editingId) {
                res = await fetch(`${API_URL}/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                if (res.status === 401) {
                    if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                    navigate.push('/admin/login');
                    return;
                }
            } else {
                res = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                if (res.status === 401) {
                    if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                    navigate.push('/admin/login');
                    return;
                }
            }

            if (res.ok) {
                if (typeof window !== 'undefined') localStorage.removeItem('hbn_news_autosave_draft');
                setSavedLocalDraft(null);
                alert(editingId ? 'News article updated successfully!' : (submitStatusRef.current === 'draft' ? 'Draft saved successfully!' : 'News article published successfully!'));
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ title: '', slug: '', image: '', imageAlt: '', category: [], content: '', metaTitle: '', metaDescription: '', metaKeywords: '', robots: 'index, follow', canonicalUrl: '', isEpaper: false, location: 'नई दिल्ली', author: currentUsername || '' });
                fetchNews();
            } else {
                let errData;
                try { errData = await res.json(); } catch(e) {}
                alert(errData?.message || 'Failed to save news article.');
            }
        } catch (error) {
            console.error('Error saving news:', error);
            alert('Network error while saving news article.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!formData.title && !formData.content) {
            alert('Please enter a Title or Content first so the AI knows what the article is about.');
            return;
        }

        setIsGeneratingSeo(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/seo/generate-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    content: formData.content
                })
            });

            if (res.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                navigate.push('/admin/login');
                return;
            }

            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }

            if (res.ok && data) {
                setFormData(prev => ({
                    ...prev,
                    metaTitle: data.metaTitle || prev.metaTitle,
                    metaDescription: data.metaDescription || prev.metaDescription,
                    metaKeywords: data.metaKeywords || prev.metaKeywords
                }));
                alert('SEO generated successfully!');
            } else {
                alert(data.message || 'Error generating SEO.');
            }
        } catch (error) {
            console.error('Error with AI generation:', error);
            alert('Error connecting to AI service.');
        } finally {
            setIsGeneratingSeo(false);
        }
    };

    const handleStartBulk = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        try {
            const res = await fetch('/api/seo/start-bulk', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
            if (res.ok) {
                setBulkStatus(data.status);
                setIsSeoModalOpen(false);
            } else {
                alert(data.message);
            }
        } catch (e) {
            alert('Failed to start background SEO process.');
        }
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title || '',
            slug: item.slug || '',
            image: item.image || '',
            imageAlt: item.imageAlt || '',
            category: Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []),
            content: item.content || '',
            metaTitle: item.metaTitle || '',
            metaDescription: item.metaDescription || '',
            metaKeywords: item.metaKeywords || '',
            robots: item.robots || 'index, follow',
            canonicalUrl: item.canonicalUrl || '',
            isEpaper: item.isEpaper || false,
            location: item.location || 'नई दिल्ली',
            author: item.author || currentUsername || ''
        });
        setEditingId(item._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this news item?')) {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.status === 401) {
                    if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                    navigate.push('/admin/login');
                    return;
                }
                fetchNews();
            } catch (error) {
                console.error('Error deleting news:', error);
            }
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ 
            title: '', 
            slug: '', 
            image: '', 
            imageAlt: '', 
            category: [], 
            content: '', 
            metaTitle: '', 
            metaDescription: '', 
            metaKeywords: '', 
            robots: 'index, follow', 
            canonicalUrl: '', 
            isEpaper: false, 
            location: 'नई दिल्ली',
            author: currentUsername || ''
        });
        try {
            const draftStr = typeof window !== 'undefined' ? localStorage.getItem('hbn_news_autosave_draft') : null;
            if (draftStr) {
                const parsed = JSON.parse(draftStr);
                if (parsed?.formData && (parsed.formData.title?.trim() || parsed.formData.content?.trim())) {
                    setSavedLocalDraft(parsed);
                } else {
                    setSavedLocalDraft(null);
                }
            } else {
                setSavedLocalDraft(null);
            }
        } catch (e) {
            setSavedLocalDraft(null);
        }
        setIsModalOpen(true);
    };

    const handleRestoreDraft = () => {
        if (savedLocalDraft?.formData) {
            setFormData(savedLocalDraft.formData);
            setSavedLocalDraft(null);
        }
    };

    const handleDiscardDraft = () => {
        if (typeof window !== 'undefined') localStorage.removeItem('hbn_news_autosave_draft');
        setSavedLocalDraft(null);
    };

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCropImageSrc(reader.result);
                setCropType('news');
                setIsCropModalOpen(true);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCropUpload = async (croppedBlob) => {
        if (!croppedBlob) return;
        setIsCropModalOpen(false);
        setIsUploading(true);

        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        const formDataUpload = new FormData();
        formDataUpload.append('image', croppedBlob, 'cropped.jpg');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            if (res.status === 401) {
                if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                navigate.push('/admin/login');
                return;
            }

            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
            if (res.ok) {
                // Set the returned Cloudinary URL
                setFormData(prev => ({ ...prev, image: data.imageUrl }));
            } else {
                alert(data.message || 'Image upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            setCropImageSrc('');
        }
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
        navigate.push('/admin/login');
    };

    // Derived State
    const draftNewsCount = news.filter(item => item.status === 'draft').length;
    const publishedNewsCount = news.filter(item => item.status !== 'draft').length;

    const filteredNews = news.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const itemCats = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
        const matchesCategory = filterCategory === 'all' || itemCats.includes(filterCategory);
        const isDraft = item.status === 'draft';
        
        let matchesView = true;
        if (currentView === 'all') {
            matchesView = newsStatusFilter === 'draft' ? isDraft : (newsStatusFilter === 'published' ? !isDraft : true);
        } else if (currentView === 'drafts') {
            matchesView = isDraft;
        } else if (currentView === 'epaper') {
            matchesView = item.isEpaper;
        }
        return matchesSearch && matchesCategory && matchesView;
    });

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterCategory, newsStatusFilter, currentView]);

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'breaking', label: 'ब्रेकिंग न्यूज़ (Breaking News)' },
        { id: 'superfast', label: 'सुपरफ़ास्ट' },
        { id: 'featured', label: 'मुख्य ख़बरें (Featured)' },
        { id: 'entertainment', label: 'मनोरंजन' },
        { id: 'sports', label: 'खेल' },
        { id: 'religion', label: 'धर्म' },
        { id: 'lifestyle', label: 'लाइਫस्टाइल' },
        { id: 'technology', label: 'टेक्नोलॉजी' },
        { id: 'business', label: 'बिज़नेस' },
        { id: 'national', label: 'राष्ट्रीय' },
        { id: 'international', label: 'अंतर्राष्ट्रीय' },
        { id: 'politics', label: 'राजनीति' },
        { id: 'jobs', label: 'जॉब्स' },
        { id: 'education', label: 'एजुकेशन' },
        { id: 'punjab', label: 'पंजाब' },
        { id: 'haryana', label: 'हरियाणा' },
        { id: 'delhi', label: 'दिल्ली' }
    ];

    if (userRole === 'user') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 font-sans">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-gray-800 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-8">You do not have permission to access the admin dashboard.</p>
                    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 mx-auto">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 w-64 bg-gray-900 text-white flex flex-col shadow-xl z-30 transition-transform duration-200 ease-in-out`}>
                <div className="p-6 text-2xl font-black border-b border-gray-800 flex items-center justify-between gap-2 tracking-tight">
                    <div className="flex items-center gap-2">
                        <span className="text-red-600 bg-white px-2 py-0.5 rounded shadow-sm">HBN</span> Admin
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto">
                    <button
                        onClick={() => { setCurrentView('all'); setNewsStatusFilter('published'); }}
                        className={`px-6 py-3 border-l-4 flex items-center justify-between font-medium transition-colors text-left ${currentView === 'all' && newsStatusFilter !== 'draft' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <LayoutDashboard size={20} className={currentView === 'all' && newsStatusFilter !== 'draft' ? 'text-red-500' : ''} /> Published News
                        </div>
                        <span className="text-xs bg-gray-800 text-gray-300 font-bold px-2 py-0.5 rounded-full">
                            {publishedNewsCount}
                        </span>
                    </button>
                    <button
                        onClick={() => { setCurrentView('drafts'); setNewsStatusFilter('draft'); }}
                        className={`px-6 py-3 border-l-4 flex items-center justify-between font-medium transition-colors text-left ${currentView === 'drafts' || (currentView === 'all' && newsStatusFilter === 'draft') ? 'bg-amber-500/10 border-amber-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center gap-3">
                            <FileText size={20} className={currentView === 'drafts' || (currentView === 'all' && newsStatusFilter === 'draft') ? 'text-amber-500' : ''} /> Drafts (ਡਰਾਫਟ)
                        </div>
                        {draftNewsCount > 0 && (
                            <span className="text-xs bg-amber-500 text-black font-black px-2 py-0.5 rounded-full animate-pulse">
                                {draftNewsCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setCurrentView('epaper')}
                        className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'epaper' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <FileText size={20} className={currentView === 'epaper' ? 'text-red-500' : ''} /> E-Paper News
                    </button>
                    <button
                        onClick={() => setCurrentView('rashifal')}
                        className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'rashifal' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <Settings size={20} className={currentView === 'rashifal' ? 'text-red-500' : ''} /> Rashifal
                    </button>
                    <button
                        onClick={() => setCurrentView('suvichar')}
                        className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'suvichar' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <FileText size={20} className={currentView === 'suvichar' ? 'text-red-500' : ''} /> Suvichar
                    </button>
                    <button
                        onClick={() => { setCurrentView('poll'); fetchActivePoll(); }}
                        className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'poll' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <BarChart2 size={20} className={currentView === 'poll' ? 'text-red-500' : ''} /> Poll
                    </button>
                    <button
                        onClick={() => { setCurrentView('breaking_news'); fetchBreakingNews(); }}
                        className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'breaking_news' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <AlertTriangle size={20} className={currentView === 'breaking_news' ? 'text-red-500' : ''} /> Breaking News
                    </button>
                    <button
                        onClick={() => setCurrentView('seo')}
                        className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'seo' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <Globe size={20} className={currentView === 'seo' ? 'text-red-500' : ''} /> Global SEO
                    </button>
                    <button
                        onClick={() => setCurrentView('profile')}
                        className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'profile' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        <Users size={20} className={currentView === 'profile' ? 'text-red-500' : ''} /> My Profile
                    </button>
                    {userRole === 'admin' && (
                        <>
                            <button
                                onClick={() => setCurrentView('users')}
                                className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'users' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                            >
                                <Users size={20} className={currentView === 'users' ? 'text-red-500' : ''} /> Manage Users
                            </button>
                            <button
                                onClick={() => { setCurrentView('messages'); fetchContactMessages(); }}
                                className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'messages' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                            >
                                <MessageSquare size={20} className={currentView === 'messages' ? 'text-red-500' : ''} /> Contact Messages
                            </button>
                            <button
                                onClick={() => { setCurrentView('logs'); fetchActivityLogs(); }}
                                className={`px-6 py-3 border-l-4 flex items-center gap-3 font-medium transition-colors text-left ${currentView === 'logs' ? 'bg-red-600/10 border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'}`}
                            >
                                <FileText size={20} className={currentView === 'logs' ? 'text-red-500' : ''} /> Activity Logs
                            </button>
                        </>
                    )}
                    <a href="/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                        <LayoutDashboard size={20} /> View Website
                    </a>
                </div>
                <div className="p-6 border-t border-gray-800">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full group">
                        <LogOut size={20} className="group-hover:text-red-400 transition-colors" /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Header */}
                <header className="h-auto min-h-[80px] bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-8 z-10 border-b border-gray-200 gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                {currentView === 'epaper' ? 'E-Paper Management' : currentView === 'rashifal' ? 'Rashifal Management' : currentView === 'suvichar' ? 'Suvichar Management' : currentView === 'seo' ? 'Global SEO Manager' : currentView === 'users' ? 'User Management' : currentView === 'profile' ? 'My Profile' : currentView === 'logs' ? 'Activity Logs' : currentView === 'breaking_news' ? 'Breaking News' : 'News Management'}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                                {currentView === 'epaper' ? 'Manage articles active on the E-Paper page' : currentView === 'rashifal' ? 'Manage daily horoscope for all 12 signs' : currentView === 'suvichar' ? 'Manage daily thought of the day' : currentView === 'seo' ? 'Manage global website SEO settings' : currentView === 'profile' ? 'Edit your profile details' : currentView === 'logs' ? 'View user activity logs' : currentView === 'breaking_news' ? 'Manage scrolling breaking news headlines' : 'Manage and publish news articles'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {bulkStatus.isRunning && (
                            <div className="bg-purple-100 text-purple-800 px-4 py-1.5 rounded-full text-sm font-bold border border-purple-200 flex items-center gap-2 animate-pulse shadow-sm">
                                <Sparkles size={16} />
                                AI SEO: {bulkStatus.processed} / {bulkStatus.total}
                            </div>
                        )}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search news..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm w-64 transition-all"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md shadow-red-600/20 whitespace-nowrap flex-1 sm:flex-none justify-center"
                        >
                            <Plus size={18} /> Add News
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-8">
                    {currentView === 'poll' ? (
                        <div className="flex flex-col gap-8 w-full max-w-4xl">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <BarChart2 className="text-red-500" /> Active Poll Settings
                                </h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Poll Question</label>
                                        <input
                                            type="text"
                                            value={pollQuestion}
                                            onChange={(e) => setPollQuestion(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                                            placeholder="Enter your poll question here..."
                                        />
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
                                        <h4 className="font-semibold text-gray-700">Poll Options & Base Votes</h4>
                                        <p className="text-sm text-gray-500 mb-4">Set the options and their initial (fake/base) votes. Real votes from users will be added on top of these base numbers to calculate the final percentage.</p>
                                        
                                        {pollOptions.map((opt, index) => (
                                            <div key={opt.id} className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded border border-gray-200 shadow-sm">
                                                <div className="w-full sm:w-16">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Emoji</label>
                                                    <input
                                                        type="text"
                                                        value={opt.emoji}
                                                        onChange={(e) => {
                                                            const newOptions = [...pollOptions];
                                                            newOptions[index].emoji = e.target.value;
                                                            setPollOptions(newOptions);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 text-center text-xl"
                                                    />
                                                </div>
                                                <div className="w-full sm:flex-1">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Option Text</label>
                                                    <input
                                                        type="text"
                                                        value={opt.text}
                                                        onChange={(e) => {
                                                            const newOptions = [...pollOptions];
                                                            newOptions[index].text = e.target.value;
                                                            setPollOptions(newOptions);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                                                    />
                                                </div>
                                                <div className="w-full sm:w-32">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Initial Votes</label>
                                                    <input
                                                        type="number"
                                                        value={opt.initialVotes}
                                                        onChange={(e) => {
                                                            const newOptions = [...pollOptions];
                                                            newOptions[index].initialVotes = parseInt(e.target.value) || 0;
                                                            setPollOptions(newOptions);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 font-mono"
                                                    />
                                                </div>
                                                <div className="w-full sm:w-24 bg-gray-100 px-3 py-2 rounded text-center border border-gray-200">
                                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Real Votes</label>
                                                    <span className="font-bold text-lg text-gray-700">{opt.realVotes || 0}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-4 gap-4">
                                            {isPollActive && (
                                                <button
                                                    type="button"
                                                    onClick={handleDeactivatePoll}
                                                    disabled={isSavingPoll}
                                                    className="px-6 py-3 bg-red-600/20 text-red-400 font-semibold rounded-xl hover:bg-red-600/30 transition-all disabled:opacity-50"
                                                >
                                                    Turn Poll OFF
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleSavePoll}
                                                disabled={isSavingPoll}
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isSavingPoll ? 'Saving...' : 'Save & Activate Poll'}
                                            </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : currentView === 'breaking_news' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-160px)]">
                            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Breaking News Items</h2>
                                    <p className="text-sm text-gray-500">Add headlines that will scroll on the website banner.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {selectedBreakingNews.length > 0 && (
                                        <button
                                            onClick={handleDeleteMultipleBreakingNews}
                                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={16} /> Delete Selected ({selectedBreakingNews.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
                                <form onSubmit={handleAddBreakingNews} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                                    <h3 className="font-bold text-gray-800">{editingBreakingNewsId ? 'Edit Headline' : 'Add New Headline'}</h3>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={newBreakingNews}
                                            onChange={(e) => setNewBreakingNews(e.target.value)}
                                            placeholder="Enter breaking news text..."
                                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                                        />
                                        <button type="submit" className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors whitespace-nowrap">
                                            {editingBreakingNewsId ? 'Update Headline' : 'Add Headline'}
                                        </button>
                                        {editingBreakingNewsId && (
                                            <button type="button" onClick={handleCancelEditBreakingNews} className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors whitespace-nowrap">
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
                                    <div className="bg-gray-50 p-4 border-b border-gray-200 font-bold text-gray-700 grid grid-cols-[40px_1fr_100px_120px] gap-4 items-center">
                                        <div className="flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={breakingNewsList.length > 0 && selectedBreakingNews.length === breakingNewsList.length}
                                                onChange={handleSelectAllBreakingNews}
                                                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                            />
                                        </div>
                                        <div>Headline Text</div>
                                        <div className="text-center">Status</div>
                                        <div className="text-right">Actions</div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        {isFetchingBreakingNews ? (
                                            <div className="p-8 text-center text-gray-500">Loading...</div>
                                        ) : breakingNewsList.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">No breaking news added yet.</div>
                                        ) : (
                                            breakingNewsList.map((item) => (
                                                <div key={item._id} className="p-4 border-b border-gray-100 flex items-center grid grid-cols-[40px_1fr_100px_120px] gap-4 hover:bg-gray-50">
                                                    <div className="flex justify-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedBreakingNews.includes(item._id)}
                                                            onChange={() => handleSelectBreakingNews(item._id)}
                                                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="text-gray-800 font-medium truncate" title={item.text}>{item.text}</div>
                                                    <div className="text-center">
                                                        <button
                                                            onClick={() => handleToggleBreakingNews(item._id, item.isActive)}
                                                            className={`px-3 py-1 rounded-full text-xs font-bold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                                                        >
                                                            {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                        </button>
                                                    </div>
                                                    <div className="text-right flex justify-end gap-2">
                                                        <button onClick={() => handleEditBreakingNews(item)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button onClick={() => handleDeleteBreakingNews(item._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : currentView === 'seo' ? (
                        <div className="flex flex-col gap-8 w-full">
                            {/* Unified SEO Generator Header */}
                            <div className="bg-purple-600 rounded-xl shadow-md p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Sparkles /> Master SEO Auto-Generator</h2>
                                    <p className="text-purple-100 mt-1 text-sm sm:text-base">Automatically generate intelligent SEO for Static Pages or News Articles using AI.</p>
                                </div>
                                <button
                                    onClick={() => setIsSeoModalOpen(true)}
                                    className="bg-white text-purple-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-bold shadow-sm transition-colors text-base sm:text-lg w-full sm:w-auto text-center flex justify-center items-center gap-2"
                                >
                                    ✨ Auto-Generate AI
                                </button>
                            </div>

                            {/* Page-Specific SEO Box */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Global Settings & Features</h2>
                                    <button onClick={handleSeoSave} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md">
                                        Save Settings
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-5">
                                    <div className="w-full md:w-1/2 pr-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Google Analytics ID</label>
                                        <input type="text" name="googleAnalyticsId" value={seoData.googleAnalyticsId} onChange={handleSeoChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="G-XXXXXXXXXX" />
                                        <p className="text-xs text-gray-500 mt-1">Example: G-ABC123XYZ</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Live TV Player Type</label>
                                            <select name="liveTvType" value={seoData.liveTvType} onChange={handleSeoChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white font-medium">
                                                <option value="hls">News Channel Live (.m3u8)</option>
                                                <option value="youtube">YouTube Video Player</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Select the type of player to use on the homepage.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Live TV URL</label>
                                            <input type="text" name="liveTvUrl" value={seoData.liveTvUrl} onChange={handleSeoChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="https://..." />
                                            <p className="text-xs text-gray-500 mt-1">Paste the .m3u8 link or YouTube link here.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="static-seo-form" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Page-Specific SEO Settings</h2>
                                    <button onClick={handlePageSeoSave} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md">
                                        Save Page SEO
                                    </button>
                                </div>

                                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Select Page to Edit SEO:</label>
                                    <select value={selectedPageSeoUrl} onChange={handleSelectedPageChange} className="w-full md:w-1/2 border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white font-medium">
                                        <option value="" disabled>-- Select a Page --</option>
                                        {staticPagesList.map(page => (
                                            <option key={page.url} value={page.url}>{page.title} ({page.url})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-5">
                                        <div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <label className="block text-sm font-semibold text-gray-700">Meta Title</label>
                                                <span className={`text-xs font-bold ${pageSeoData.metaTitle?.length >= 50 && pageSeoData.metaTitle?.length <= 60 ? 'text-green-600' : pageSeoData.metaTitle?.length > 60 ? 'text-red-600' : pageSeoData.metaTitle?.length > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                                                    {pageSeoData.metaTitle?.length || 0} / 60
                                                </span>
                                            </div>
                                            <input type="text" name="metaTitle" value={pageSeoData.metaTitle} onChange={handlePageSeoChange} className={`w-full border rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-colors ${pageSeoData.metaTitle?.length >= 50 && pageSeoData.metaTitle?.length <= 60 ? 'bg-green-50 border-green-400 text-green-900 focus:border-green-500' : pageSeoData.metaTitle?.length > 60 ? 'bg-red-50 border-red-400 text-red-900 focus:border-red-500' : pageSeoData.metaTitle?.length > 0 ? 'bg-orange-50 border-orange-400 text-orange-900 focus:border-orange-500' : 'bg-white border-gray-300'}`} placeholder="Page specific title..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Keywords</label>
                                            <input type="text" name="metaKeywords" value={pageSeoData.metaKeywords} onChange={handlePageSeoChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="news, updates..." />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-5">
                                        <div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <label className="block text-sm font-semibold text-gray-700">Meta Description</label>
                                                <span className={`text-xs font-bold ${pageSeoData.metaDescription?.length >= 145 && pageSeoData.metaDescription?.length <= 155 ? 'text-green-600' : pageSeoData.metaDescription?.length > 155 ? 'text-red-600' : pageSeoData.metaDescription?.length > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                                                    {pageSeoData.metaDescription?.length || 0} / 155
                                                </span>
                                            </div>
                                            <textarea name="metaDescription" value={pageSeoData.metaDescription} onChange={handlePageSeoChange} className={`w-full border rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-colors ${pageSeoData.metaDescription?.length >= 145 && pageSeoData.metaDescription?.length <= 155 ? 'bg-green-50 border-green-400 text-green-900 focus:border-green-500' : pageSeoData.metaDescription?.length > 155 ? 'bg-red-50 border-red-400 text-red-900 focus:border-red-500' : pageSeoData.metaDescription?.length > 0 ? 'bg-orange-50 border-orange-400 text-orange-900 focus:border-orange-500' : 'bg-white border-gray-300'}`} rows="4" placeholder="Page specific description..."></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Robots Tag</label>
                                            <select name="robots" value={pageSeoData.robots} onChange={handlePageSeoChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white">
                                                <option value="index, follow">index, follow (Default)</option>
                                                <option value="noindex, follow">noindex, follow</option>
                                                <option value="index, nofollow">index, nofollow</option>
                                                <option value="noindex, nofollow">noindex, nofollow</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Static Pages Audit Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4 border-b pb-4">
                                    <h2 className="text-xl font-bold text-gray-800">Static Pages SEO Overview</h2>
                                    <p className="text-sm text-gray-500">Showing SEO for all main website URLs.</p>
                                </div>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Page URL</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Meta Title</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Meta Description</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Robots</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-20">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {staticPagesList.map(page => {
                                                const seo = pageSeoList.find(p => p.pageUrl === page.url);
                                                return (
                                                    <tr key={page.url} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 text-sm font-semibold text-gray-800 max-w-[200px] truncate" title={page.title}>{page.url}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate" title={seo?.metaTitle}>{seo?.metaTitle || '-'}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[300px] truncate" title={seo?.metaDescription}>{seo?.metaDescription || '-'}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-600">{seo?.robots || 'index, follow'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button onClick={() => handleEditStaticPage(page.url)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit SEO">
                                                                <Pencil size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Global SEO Box */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-6 border-b pb-4">
                                    <h2 className="text-xl font-bold text-gray-800">Global Website Settings</h2>
                                    <button onClick={handleSeoSave} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md">
                                        Save Global Settings
                                    </button>
                                </div>
                                <div className="flex flex-col gap-5">
                                    <div className="md:w-1/2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Google Analytics Tracking ID</label>
                                        <input type="text" name="googleAnalyticsId" value={seoData.googleAnalyticsId} onChange={handleSeoChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="G-XXXXXXXXXX" />
                                        <p className="text-xs text-gray-500 mt-1">This ID will be applied across the entire website.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Audit Table Box */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4 border-b pb-4">
                                    <h2 className="text-xl font-bold text-gray-800">News Articles SEO Audit</h2>
                                    <p className="text-sm text-gray-500">Showing articles with generated SEO.</p>
                                </div>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Page URL</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Article Title</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Meta Title</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Meta Description</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Robots</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-20">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {news.filter(item => item.metaDescription).map(item => (
                                                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-xs font-semibold text-blue-600 max-w-[150px] truncate" title={`/news/${item.slug || item._id}`}>
                                                        <a href={`/news/${item.slug || item._id}`} target="_blank" rel="noopener noreferrer">/news/{item.slug || item._id}</a>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 max-w-[200px] truncate" title={item.title}>{item.title}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[150px] truncate" title={item.metaTitle}>{item.metaTitle || '-'}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[250px] truncate" title={item.metaDescription}>{item.metaDescription}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-600">{item.robots || 'index, follow'}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit SEO">
                                                            <Pencil size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {news.filter(item => item.metaDescription).length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-sm">No SEO data found yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : currentView === 'rashifal' ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Update Daily Rashifal</h2>
                                    <p className="text-sm text-gray-500 mt-1">Generate or edit today's horoscope for all 12 zodiac signs.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={handleGenerateRashifal}
                                        disabled={isGeneratingRashifal}
                                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Sparkles size={18} />
                                        {isGeneratingRashifal ? "Generating..." : "✨ Auto-Generate AI"}
                                    </button>
                                    <button onClick={handleRashifalSave} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md flex items-center justify-center">
                                        Save Rashifal
                                    </button>
                                </div>
                            </div>
                            {rashifalData.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Loading Rashifal...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {rashifalData.map((sign) => (
                                        <div key={sign.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-2">
                                            <div className="flex justify-between items-center font-bold text-gray-800 border-b border-gray-200 pb-2">
                                                <span className="text-red-700">{sign.hindi}</span>
                                                <span className="text-xs text-gray-400 uppercase tracking-wider">{sign.sign}</span>
                                            </div>
                                            <textarea
                                                className="w-full mt-2 p-3 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:outline-none transition-all resize-none bg-white"
                                                rows="4"
                                                value={sign.desc}
                                                onChange={(e) => handleRashifalTextChange(sign.id, e.target.value)}
                                            ></textarea>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : currentView === 'suvichar' ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Update Suvichar</h2>
                                    <p className="text-sm text-gray-500 mt-1">Generate or edit today's Thought of the Day.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={handleGenerateSuvichar}
                                        disabled={isGeneratingSuvichar}
                                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Sparkles size={18} />
                                        {isGeneratingSuvichar ? "Generating..." : "✨ Auto-Generate AI"}
                                    </button>
                                    <button onClick={handleSuvicharSave} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md flex items-center justify-center">
                                        Save Suvichar
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-sm font-bold text-gray-800 mb-2">Suvichar Text</label>
                                <textarea
                                    className="w-full p-4 text-base border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:outline-none transition-all resize-none bg-white font-sans text-center"
                                    rows="6"
                                    value={suvicharText}
                                    onChange={(e) => setSuvicharText(e.target.value)}
                                    placeholder="सुविचार यहाँ लिखें..."
                                ></textarea>
                            </div>
                        </div>
                    ) : currentView === 'messages' ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Contact Inquiries & Messages</h2>

                            {contactMessages.length === 0 ? (
                                <p className="text-gray-500 text-center py-10">No messages found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {contactMessages.map((msg) => (
                                        <div key={msg._id} className={`p-5 rounded-lg border ${msg.status === 'new' ? 'bg-red-50/30 border-red-200 shadow-sm' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                        {msg.subject}
                                                        {msg.status === 'new' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">NEW</span>}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">From: <span className="font-semibold text-gray-800">{msg.name}</span> ({msg.email})</p>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    {msg.status === 'new' ? (
                                                        <button
                                                            onClick={() => handleMarkAsRead(msg._id)}
                                                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm font-semibold hover:bg-blue-100 transition-colors"
                                                        >
                                                            Mark as Read
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleMarkAsUnread(msg._id)}
                                                            className="flex-1 sm:flex-none px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded text-sm font-semibold hover:bg-gray-200 transition-colors"
                                                        >
                                                            Mark as Unread
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg._id)}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-red-600 border border-gray-200 rounded text-sm font-semibold hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded border border-gray-100 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                                {msg.message}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : currentView === 'profile' ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-2xl mx-auto mt-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 border-b pb-4">My Profile</h2>
                            <form onSubmit={handleUpdateMyProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                                    <input type="text" required value={myProfileData.username} onChange={e => setMyProfileData({ ...myProfileData, username: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Enter username" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                    <input type="email" value={myProfileData.email} onChange={e => setMyProfileData({ ...myProfileData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Enter email" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                                    <input type="text" value={myProfileData.phone} onChange={e => setMyProfileData({ ...myProfileData, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Enter phone" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Designation / Role Title <span className="text-gray-400 font-normal">(e.g. Senior Journalist, Crime Reporter, Chief Editor)</span></label>
                                    <input type="text" value={myProfileData.designation} onChange={e => setMyProfileData({ ...myProfileData, designation: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Content Writer (Default)" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password <span className="text-gray-400 font-normal">(Leave empty to keep current)</span></label>
                                    <input type="password" value={myProfileData.password} onChange={e => setMyProfileData({ ...myProfileData, password: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Enter new password" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Profile Image</label>
                                    <div className="flex gap-4 items-center">
                                        <input type="file" accept="image/*" onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            // Open cropper instead of direct upload
                                            const reader = new FileReader();
                                            reader.addEventListener('load', () => {
                                                setCropImageSrc(reader.result);
                                                setCropType('profile');
                                                setIsCropModalOpen(true);
                                            });
                                            reader.readAsDataURL(file);
                                        }} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
                                        {myProfileData.profileImage && (
                                            <div className="flex flex-col items-center gap-1">
                                                <img src={myProfileData.profileImage} alt="Profile" className="w-12 h-12 rounded-full object-cover border" />
                                                <button type="button" onClick={() => setMyProfileData({ ...myProfileData, profileImage: '' })} className="text-xs text-red-600 font-medium hover:underline">Remove</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button type="submit" disabled={isSubmitting || isUploading} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md disabled:opacity-50">
                                        {isSubmitting ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : currentView === 'logs' ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Activity Logs</h2>
                            {activityLogs.length === 0 ? (
                                <p className="text-gray-500 text-center py-10">No recent activity.</p>
                            ) : (
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Details</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {activityLogs.map((log) => (
                                                <tr key={log._id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{log.username}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">{log.action}</span></td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{log.details}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : currentView === 'users' ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Manage Users & Roles</h2>

                            <form onSubmit={handleCreateUser} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                                        <input
                                            type="text"
                                            required
                                            value={newUser.username}
                                            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            placeholder="Enter username"
                                        />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={newUser.password}
                                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none pr-10"
                                                placeholder="Enter password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                                        <select
                                            value={newUser.role}
                                            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
                                        >
                                            <option value="user">User</option>
                                            <option value="subadmin">Sub-Admin</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation (Optional)</label>
                                        <input
                                            type="text"
                                            value={newUser.designation}
                                            onChange={e => setNewUser({ ...newUser, designation: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            placeholder="Content Writer (Default)"
                                        />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={newUser.email}
                                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            placeholder="Enter email"
                                        />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone (Optional)</label>
                                        <input
                                            type="text"
                                            value={newUser.phone}
                                            onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profile Image (Optional)</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleProfileImageUpload(e, false)}
                                                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                            />
                                            {newUser.profileImage && <img src={newUser.profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover" />}
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        <button type="submit" disabled={isUploading} className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md disabled:opacity-50">
                                            {isUploading ? 'Uploading...' : 'Create User'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50/80">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Username</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Designation</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Contact</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase w-20">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {usersList.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-semibold text-gray-800">{u.username}</td>
                                                <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                                                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                                                        {u.designation || 'Content Writer'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600">
                                                    {u.email && <div>✉️ {u.email}</div>}
                                                    {u.phone && <div>📞 {u.phone}</div>}
                                                    {!u.email && !u.phone && <span className="text-gray-400">N/A</span>}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    <select
                                                        value={u.role || 'user'}
                                                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                                                        className="border border-gray-300 rounded p-1 text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="subadmin">Sub-Admin</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleOpenEditUser(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit User">
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete User">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Edit User Modal */}
                            {isEditUserModalOpen && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden flex flex-col">
                                        <div className="flex justify-between items-center p-5 border-b bg-gray-50/50">
                                            <h3 className="text-xl font-bold text-gray-800">Edit User Details</h3>
                                            <button onClick={() => setIsEditUserModalOpen(false)} className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50">
                                                <X size={24} />
                                            </button>
                                        </div>
                                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                                            <form id="edit-user-form" onSubmit={handleEditUserSubmit} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={editUserData.username}
                                                        onChange={e => setEditUserData({ ...editUserData, username: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Designation / Role Title</label>
                                                    <input
                                                        type="text"
                                                        value={editUserData.designation}
                                                        onChange={e => setEditUserData({ ...editUserData, designation: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                                                        placeholder="Content Writer (Default)"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password <span className="text-gray-400 font-normal">(Leave empty to keep current)</span></label>
                                                    <div className="relative">
                                                        <input
                                                            type={showEditPassword ? "text" : "password"}
                                                            value={editUserData.password}
                                                            onChange={e => setEditUserData({ ...editUserData, password: e.target.value })}
                                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none pr-10"
                                                            placeholder="Enter new password"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowEditPassword(!showEditPassword)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        >
                                                            {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                                                    <select
                                                        value={editUserData.role}
                                                        onChange={e => setEditUserData({ ...editUserData, role: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none bg-white"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="subadmin">Sub-Admin</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        value={editUserData.email}
                                                        onChange={e => setEditUserData({ ...editUserData, email: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={editUserData.phone}
                                                        onChange={e => setEditUserData({ ...editUserData, phone: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Profile Image (Optional)</label>
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleProfileImageUpload(e, true)}
                                                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        />
                                                        {editUserData.profileImage && (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <img src={editUserData.profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover border" />
                                                                <button type="button" onClick={() => setEditUserData({ ...editUserData, profileImage: '' })} className="text-xs text-red-600 font-medium hover:underline">Remove</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 mt-auto">
                                            <button
                                                onClick={() => setIsEditUserModalOpen(false)}
                                                className="px-5 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                form="edit-user-form"
                                                disabled={isUploading}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isUploading ? 'Uploading...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Stats & Filters */}
                            <div className="mb-6 flex flex-col gap-4">
                                {/* Top Status Filter Buttons */}
                                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Status Filter:</span>
                                    <button
                                        onClick={() => { setNewsStatusFilter('published'); if (currentView === 'drafts') setCurrentView('all'); }}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${newsStatusFilter === 'published' && currentView !== 'drafts' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                                    >
                                        Published ({publishedNewsCount})
                                    </button>
                                    <button
                                        onClick={() => { setNewsStatusFilter('draft'); setCurrentView('drafts'); }}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${newsStatusFilter === 'draft' || currentView === 'drafts' ? 'bg-amber-500 text-black shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                                    >
                                        Drafts (ਡਰਾਫਟ) {draftNewsCount > 0 && <span className="bg-black text-amber-400 text-xs px-2 py-0.5 rounded-full font-black">{draftNewsCount}</span>}
                                    </button>
                                    <button
                                        onClick={() => { setNewsStatusFilter('all'); if (currentView === 'drafts') setCurrentView('all'); }}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${newsStatusFilter === 'all' && currentView !== 'drafts' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                                    >
                                        Show All ({news.length})
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFilterCategory(cat.id)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterCategory === cat.id ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-sm text-gray-500 font-medium">
                                    Showing <span className="text-gray-900 font-bold">{filteredNews.length}</span> news items {filterCategory !== 'all' && `in ${categories.find(c => c.id === filterCategory)?.label}`}
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50/80">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Image</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Category</th>
                                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {paginatedNews.map((item) => (
                                                    <tr key={item._id} className="hover:bg-red-50/30 transition-colors group">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="h-14 w-20 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                                                <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-red-700 transition-colors">{item.title}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {item.status === 'draft' && (
                                                                    <span className="inline-block text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                                                        📝 DRAFT (ਡਰਾਫਟ)
                                                                    </span>
                                                                )}
                                                                {item.isEpaper && (
                                                                    <span className="inline-block text-[10px] bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                                        Active on E-Paper
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                                                                {Array.isArray(item.category) ? item.category.join(', ') : item.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                                                    <Pencil size={18} />
                                                                </button>
                                                                <button onClick={() => handleDelete(item._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {paginatedNews.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <FileText size={32} className="text-gray-300" />
                                                                <p className="text-lg font-medium">No news found</p>
                                                                <p className="text-sm">Try adjusting your filters or search query.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredNews.length)}</span> of <span className="font-semibold text-gray-900">{filteredNews.length}</span> entries
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                                        // Simple logic to show limited pages
                                                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                                            return (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => setCurrentPage(page)}
                                                                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${currentPage === page ? 'bg-red-600 text-white border-transparent' : 'border border-gray-300 text-gray-700 hover:bg-white'}`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            );
                                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                            return <span key={page} className="text-gray-400">...</span>;
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Crop Modal */}
            <ImageCropModal
                isOpen={isCropModalOpen}
                onClose={() => { setIsCropModalOpen(false); setCropImageSrc(''); }}
                imageSrc={cropImageSrc}
                onUpload={async (croppedBlob) => {
                    if (cropType === 'news') {
                        await handleCropUpload(croppedBlob);
                    } else if (cropType === 'profile') {
                        setIsCropModalOpen(false);
                        setIsUploading(true);
                        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
                        const fd = new FormData();
                        fd.append('image', croppedBlob, 'profile_cropped.jpg');
                        try {
                            const res = await fetch('/api/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
                            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                            if (res.ok) setMyProfileData({ ...myProfileData, profileImage: data.imageUrl });
                        } catch (err) { } finally { setIsUploading(false); }
                    } else if (cropType === 'newProfile' || cropType === 'editProfile') {
                        setIsCropModalOpen(false);
                        setIsUploading(true);
                        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
                        const fd = new FormData();
                        fd.append('image', croppedBlob, 'user_profile_cropped.jpg');
                        try {
                            const res = await fetch('/api/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
                            if (res.status === 401) {
                                if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
                                navigate.push('/admin/login');
                                return;
                            }
                            let data; try { data = await res.json(); } catch(e) { console.error('Failed to parse JSON for', res.url); return; }
                            if (res.ok) {
                                if (cropType === 'editProfile') {
                                    setEditUserData(prev => ({ ...prev, profileImage: data.imageUrl }));
                                } else {
                                    setNewUser(prev => ({ ...prev, profileImage: data.imageUrl }));
                                }
                            } else {
                                alert(data.message || 'Image upload failed');
                            }
                        } catch (err) {
                            alert('Error uploading image');
                        } finally { setIsUploading(false); }
                    }
                }}
                isUploading={isUploading}
                aspectRatio={cropType.toLowerCase().includes('profile') ? 1 : 16 / 9}
                title={cropType.toLowerCase().includes('profile') ? "Crop Profile Image (1:1)" : "Crop News Image (16:9)"}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-0 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-none sm:rounded-xl shadow-2xl w-full max-w-5xl min-h-screen sm:min-h-0 sm:my-8 lg:my-12 flex flex-col overflow-hidden transform transition-all">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 sticky top-0 z-20 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit News Article' : 'Add New Article'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 lg:pt-6">
                            {/* Unsaved Local Draft Notification Banner */}
                            {savedLocalDraft && !editingId && (
                                <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl flex-shrink-0">📝</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-900">Unsaved Local Draft Found (ਅਧੂਰੀ ਖ਼ਬਰ ਮਿਲੀ ਹੈ)</h4>
                                            <p className="text-xs text-amber-700 font-medium">
                                                We detected an unfinished article draft saved on this browser from {savedLocalDraft.savedAt ? new Date(savedLocalDraft.savedAt).toLocaleTimeString() : 'earlier'}.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleRestoreDraft}
                                            className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                                        >
                                            Restore Draft (ਰੀਸਟੋਰ ਕਰੋ)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDiscardDraft}
                                            className="flex-1 sm:flex-none bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Discard (ਹਟਾਓ)
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10 flex-1">
                                {/* Left Column: Main Content */}
                                <div className="flex-1 flex flex-col gap-5 lg:mt-2">
                                    <h4 className="text-lg font-bold text-gray-800 border-b pb-2">Main Content</h4>
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-sm font-semibold text-gray-700">Headline (Title)</label>
                                            <span className={`text-xs font-bold ${formData.title?.length >= 50 && formData.title?.length <= 60 ? 'text-green-600' : formData.title?.length > 60 ? 'text-red-600' : formData.title?.length > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                                                {formData.title?.length || 0} / 60
                                            </span>
                                        </div>
                                        <textarea required name="title" value={formData.title} onChange={handleInputChange} className={`w-full border rounded-lg shadow-sm p-3 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none ${formData.title?.length >= 50 && formData.title?.length <= 60 ? 'bg-green-50 border-green-400 text-green-900 focus:border-green-500' : formData.title?.length > 60 ? 'bg-red-50 border-red-400 text-red-900 focus:border-red-500' : formData.title?.length > 0 ? 'bg-orange-50 border-orange-400 text-orange-900 focus:border-orange-500' : 'bg-white border-gray-300 focus:border-red-500'}`} rows="2" placeholder="Enter an engaging headline..."></textarea>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 mb-2">
                                         <div className="flex-1">
                                             <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Users size={16} /> Author / Reporter (ਲੇਖਕ / ਰਿਪੋਰਟਰ)</label>
                                             <input type="text" name="author" value={formData.author || ''} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" placeholder="Enter author/reporter name" />
                                         </div>
                                         <div className="flex-1">
                                             <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Globe size={16} /> Location (City/Place)</label>
                                             <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" placeholder="e.g. नई दिल्ली" />
                                         </div>
                                     </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col lg:flex-row gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL Slug</label>
                                                <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-gray-50" placeholder="Auto-generated if empty" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categories (Multiple)</label>
                                                <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg bg-white max-h-[100px] overflow-y-auto">
                                                    {categories.filter(c => c.id !== 'all').map(cat => (
                                                        <label key={cat.id} className="flex items-center gap-1.5 cursor-pointer bg-gray-50 px-2 py-1 rounded border border-gray-200 hover:bg-red-50 transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={(formData.category || []).includes(cat.id)}
                                                                onChange={() => handleCategoryCheckbox(cat.id)}
                                                                className="w-3.5 h-3.5 text-red-600 focus:ring-red-500 rounded cursor-pointer"
                                                            />
                                                            <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 mb-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                            <input type="checkbox" id="isEpaper" name="isEpaper" checked={formData.isEpaper} onChange={handleInputChange} className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer" />
                                            <label htmlFor="isEpaper" className="text-sm font-semibold text-blue-900 cursor-pointer">Show this article in E-Paper</label>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Article Content</label>
                                        <div className="flex-1 bg-white" style={{ minHeight: '300px', marginBottom: '40px' }}>
                                            <JoditEditor
                                                ref={editor}
                                                value={formData.content}
                                                config={joditConfig}
                                                onBlur={(newContent) => handleContentChange(newContent)}
                                                onChange={() => { }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Media & SEO */}
                                <div className="w-full lg:w-[380px] flex flex-col gap-5 lg:mt-2">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <h4 className="text-lg font-bold text-gray-800">Media & SEO</h4>
                                        <button
                                            type="button"
                                            onClick={handleAIGenerate}
                                            disabled={isGeneratingSeo}
                                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 border border-purple-200 shadow-sm"
                                        >
                                            {isGeneratingSeo ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-purple-700"></div> : <Sparkles size={14} />}
                                            {isGeneratingSeo ? 'Generating...' : 'Auto-Generate AI'}
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Blog Image</label>

                                        {/* File Upload Area */}
                                        <div className="mb-3">
                                            <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isUploading ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-red-400'}`}>
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {isUploading ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mb-2"></div>
                                                            <p className="text-sm text-gray-500 font-semibold">Uploading...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <svg className="w-6 h-6 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                            <p className="mb-1 text-sm text-gray-500 font-semibold"><span className="text-red-600">Click to upload</span> image</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} onClick={(e) => { e.target.value = null }} disabled={isUploading} />
                                            </label>
                                        </div>

                                        <div className="flex gap-3 items-center">
                                            <input required type="url" name="image" value={formData.image} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" placeholder="Or enter image URL..." />
                                            {formData.image && (
                                                <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 shadow-sm">
                                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-sm font-semibold text-gray-700">Image Alt Text (SEO)</label>
                                            <span className={`text-xs font-bold ${formData.imageAlt?.length >= 100 && formData.imageAlt?.length <= 150 ? 'text-green-600' : formData.imageAlt?.length > 150 ? 'text-red-600' : formData.imageAlt?.length > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                                                {formData.imageAlt?.length || 0} / 150
                                            </span>
                                        </div>
                                        <input type="text" name="imageAlt" value={formData.imageAlt} onChange={handleInputChange} className={`w-full border rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none ${formData.imageAlt?.length >= 100 && formData.imageAlt?.length <= 150 ? 'bg-green-50 border-green-400 text-green-900 focus:border-green-500' : formData.imageAlt?.length > 150 ? 'bg-red-50 border-red-400 text-red-900 focus:border-red-500' : formData.imageAlt?.length > 0 ? 'bg-orange-50 border-orange-400 text-orange-900 focus:border-orange-500' : 'bg-white border-gray-300 focus:border-red-500'}`} placeholder="Describe the image..." />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-sm font-semibold text-gray-700">Meta Title</label>
                                            <span className={`text-xs font-bold ${formData.metaTitle?.length >= 50 && formData.metaTitle?.length <= 60 ? 'text-green-600' : formData.metaTitle?.length > 60 ? 'text-red-600' : formData.metaTitle?.length > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                                                {formData.metaTitle?.length || 0} / 60
                                            </span>
                                        </div>
                                        <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} className={`w-full border rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none ${formData.metaTitle?.length >= 50 && formData.metaTitle?.length <= 60 ? 'bg-green-50 border-green-400 text-green-900 focus:border-green-500' : formData.metaTitle?.length > 60 ? 'bg-red-50 border-red-400 text-red-900 focus:border-red-500' : formData.metaTitle?.length > 0 ? 'bg-orange-50 border-orange-400 text-orange-900 focus:border-orange-500' : 'bg-white border-gray-300 focus:border-red-500'}`} placeholder="Leave empty to use Headline" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-sm font-semibold text-gray-700">Meta Description</label>
                                            <span className={`text-xs font-bold ${formData.metaDescription?.length >= 145 && formData.metaDescription?.length <= 155 ? 'text-green-600' : formData.metaDescription?.length > 155 ? 'text-red-600' : formData.metaDescription?.length > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                                                {formData.metaDescription?.length || 0} / 155
                                            </span>
                                        </div>
                                        <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} className={`w-full border rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none ${formData.metaDescription?.length >= 145 && formData.metaDescription?.length <= 155 ? 'bg-green-50 border-green-400 text-green-900 focus:border-green-500' : formData.metaDescription?.length > 155 ? 'bg-red-50 border-red-400 text-red-900 focus:border-red-500' : formData.metaDescription?.length > 0 ? 'bg-orange-50 border-orange-400 text-orange-900 focus:border-orange-500' : 'bg-white border-gray-300 focus:border-red-500'}`} rows="2" placeholder="Brief summary for search engines..."></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Keywords</label>
                                        <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" placeholder="news, politics, sports..." />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Robots Tag</label>
                                            <select name="robots" value={formData.robots} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white">
                                                <option value="index, follow">index, follow (Default)</option>
                                                <option value="noindex, follow">noindex, follow</option>
                                                <option value="index, nofollow">index, nofollow</option>
                                                <option value="noindex, nofollow">noindex, nofollow</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Canonical URL</label>
                                            <input type="url" name="canonicalUrl" value={formData.canonicalUrl} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 sm:mt-8 -mx-4 sm:mx-0 p-4 sm:p-0 pt-4 sm:pt-5 bg-white sm:bg-transparent border-t border-gray-200 sticky bottom-0 z-20 flex flex-col-reverse sm:flex-row justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:shadow-none">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-lg text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" formNoValidate onClick={() => submitStatusRef.current = 'draft'} disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-lg text-sm font-bold text-gray-700 bg-yellow-100 hover:bg-yellow-200 transition-colors">
                                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                                </button>
                                <button type="submit" onClick={() => submitStatusRef.current = 'published'} disabled={isSubmitting} className="w-full sm:w-auto px-8 py-3 sm:py-2.5 rounded-lg shadow-lg shadow-red-600/30 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Publishing...' : (editingId ? 'Save All Changes' : 'Publish Complete Article')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Master SEO Auto-Generator Modal */}
            {isSeoModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Sparkles className="text-purple-600" /> Master Auto-Generate AI</h3>
                            <button onClick={() => setIsSeoModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8">
                            <p className="text-gray-600 mb-6">What would you like the AI to generate SEO for?</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Option 1: Static Pages */}
                                <div className="border-2 border-blue-100 hover:border-blue-300 rounded-xl p-6 transition-all cursor-pointer hover:shadow-md bg-white group flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Globe size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">Static Pages</h4>
                                    <p className="text-sm text-gray-500 mb-6 flex-1">Generates unique, URL-based SEO for your main pages like Home, E-Paper, Sports, etc.</p>
                                    <button
                                        onClick={handleGenerateStaticSeo}
                                        disabled={bulkStatus.isRunning}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
                                    >
                                        {bulkStatus.isRunning && bulkStatus.type === 'static_pages' ? 'Processing...' : 'Generate Static Pages'}
                                    </button>
                                </div>

                                {/* Option 2: News Articles */}
                                <div className="border-2 border-purple-100 hover:border-purple-300 rounded-xl p-6 transition-all cursor-pointer hover:shadow-md bg-white group flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <FileText size={32} />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">News Articles</h4>
                                    <p className="text-sm text-gray-500 mb-6 flex-1">Background bulk processor for <strong className="text-purple-700">{missingSeoCount}</strong> news articles missing SEO based on their content.</p>
                                    <button
                                        onClick={handleStartBulk}
                                        disabled={bulkStatus.isRunning || missingSeoCount === 0}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
                                    >
                                        {bulkStatus.isRunning ? 'Processing...' : 'Start Bulk Generator'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}


























