'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toJpeg } from 'html-to-image';
import { FaInstagram, FaFacebook, FaFacebookF, FaWhatsapp, FaYoutube, FaTumblr, FaXTwitter, FaPinterest, FaLinkedin, FaGlobe } from 'react-icons/fa6';

const SUDOKU_PUZZLES = [
    "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    "000260701680070090190004500820100040004602900050003028009300074040050036703018000",
    "100489006730000040000001295007120600500703008006095700914600000020000037800512004"
];

const NewspaperGame = () => {
    const [initialBoard, setInitialBoard] = useState([]);
    const [board, setBoard] = useState([]);
    const [solutionBoard, setSolutionBoard] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [isWon, setIsWon] = useState(false);

    const isValidForSolve = (grid, r, c, n) => {
        for (let i = 0; i < 9; i++) {
            if (grid[r][i] === n) return false;
            if (grid[i][c] === n) return false;
            if (grid[3 * Math.floor(r / 3) + Math.floor(i / 3)][3 * Math.floor(c / 3) + (i % 3)] === n) return false;
        }
        return true;
    };

    const solveGrid = (grid) => {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === null) {
                    for (let n = 1; n <= 9; n++) {
                        if (isValidForSolve(grid, r, c, n)) {
                            grid[r][c] = n;
                            if (solveGrid(grid)) return true;
                            grid[r][c] = null;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    };

    const initGame = () => {
        const puzzle = SUDOKU_PUZZLES[Math.floor(Math.random() * SUDOKU_PUZZLES.length)];
        const grid = [];
        for (let r = 0; r < 9; r++) {
            const row = [];
            for (let c = 0; c < 9; c++) {
                const char = puzzle[r * 9 + c];
                row.push(char === '0' ? null : parseInt(char));
            }
            grid.push(row);
        }
        setInitialBoard(grid);
        setBoard(JSON.parse(JSON.stringify(grid)));

        // Generate solution for instant validation
        const solved = JSON.parse(JSON.stringify(grid));
        solveGrid(solved);
        setSolutionBoard(solved);

        setSelectedCell(null);
        setIsWon(false);
    };

    useEffect(() => { initGame(); }, []);

    const handleCellClick = (r, c) => {
        if (!initialBoard[r][c]) setSelectedCell({ r, c });
    };

    const handleNumberClick = (num) => {
        if (!selectedCell) return;
        const newBoard = [...board];
        newBoard[selectedCell.r][selectedCell.c] = num;
        setBoard(newBoard);

        if (newBoard.every(row => row.every(cell => cell !== null))) {
            let won = true;
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (newBoard[r][c] !== solutionBoard[r][c]) won = false;
                }
            }
            if (won) {
                setIsWon(true);
                setSelectedCell(null);
            }
        }
    };

    if (board.length === 0) return null;

    return (
        <div className="newspaper-game flex-1 w-full flex flex-col pt-4 pb-2">
            <div className="w-full border-y border-dashed border-gray-400 py-3 px-2 sm:px-4 bg-[#fcf9f2]/40 flex flex-col items-center justify-center">
                <span className="text-sm sm:text-base font-serif font-black text-gray-900 border-b-[1.5px] border-gray-900 pb-1 mb-3 w-full max-w-[350px] text-center tracking-widest uppercase">
                    {isWon ? 'बधाई हो! हल हो गया 🎉' : 'सुडोकू'}
                </span>

                <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full mb-3">
                    <div className="border-[1.5px] border-gray-900 bg-gray-400 gap-px grid grid-cols-9 w-[180px] sm:w-[220px] aspect-square shadow-sm">
                        {board.map((row, r) => (
                            row.map((cell, c) => {
                                const isInit = initialBoard[r][c] !== null;
                                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                                const isSameRowCol = selectedCell && (selectedCell.r === r || selectedCell.c === c);
                                const isCorrect = !isInit && cell !== null && cell === solutionBoard[r][c];
                                const isWrong = !isInit && cell !== null && cell !== solutionBoard[r][c];

                                const borderRight = c % 3 === 2 && c !== 8 ? 'border-r-[1.5px] border-gray-900' : '';
                                const borderBottom = r % 3 === 2 && r !== 8 ? 'border-b-[1.5px] border-gray-900' : '';

                                let bgColor = 'bg-white';
                                if (isSelected) bgColor = 'bg-yellow-300 ring-2 ring-yellow-500 z-10 relative shadow-sm';
                                else if (isSameRowCol) bgColor = 'bg-yellow-50';

                                let textColor = 'text-gray-900';
                                if (!isInit) {
                                    if (isCorrect) textColor = 'text-green-800 font-black text-[15px] sm:text-[18px] drop-shadow-sm';
                                    else if (isWrong) textColor = 'text-red-700 font-black text-[15px] sm:text-[18px] drop-shadow-sm';
                                }

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => handleCellClick(r, c)}
                                        className={`flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer transition-colors ${borderRight} ${borderBottom} ${bgColor} ${textColor}`}
                                    >
                                        {cell || ''}
                                    </div>
                                );
                            })
                        ))}
                    </div>

                    {!isWon && (
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-1 border-b border-gray-300 pb-0.5 whitespace-nowrap">नंबर भरें 👇</span>
                            <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'X'].map((num, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => num === 'X' ? handleNumberClick(null) : handleNumberClick(num)}
                                        className={`font-bold py-1 px-3 rounded shadow-sm text-[10px] sm:text-xs transition-colors ${num === 'X' ? 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300' : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-800'}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end w-full max-w-[350px]">
                    <button onClick={initGame} className="text-[10px] font-bold text-gray-600 hover:text-gray-900 underline uppercase tracking-wider">नया खेल</button>
                </div>
            </div>
        </div>
    );
};

export default function Epaper({ initialNews, initialSuvichar, initialPanchang }) {
    const [news, setNews] = useState(initialNews || []);
    const [loading, setLoading] = useState(!initialNews || initialNews.length === 0);
    const [currentPage, setCurrentPage] = useState(1);
    const [cuttingModalData, setCuttingModalData] = useState(null);
    const [suvicharText, setSuvicharText] = useState(initialSuvichar || 'मंजिलें क्या हैं, रास्ता क्या है? हौसला हो तो फासला क्या है?');
    const [panchangData, setPanchangData] = useState(() => {
        if (initialPanchang) return initialPanchang;
        const daysInHindi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
        const todayHindi = daysInHindi[new Date().getDay()];
        return {
            tithi: "लोड हो रहा है...",
            samvat: `विक्रम संवत 2083 • ${todayHindi}`
        };
    });
    const itemsPerPage = 11; // 11 stories per page to allow the last one to be wide

    useEffect(() => {
        const fetchSuvichar = async () => {
            try {
                const res = await fetch('/api/suvichar');
                if (res.ok) {
                    const dataArray = await res.json();
                    const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
                    if (data && data.text) {
                        setSuvicharText(data.text);
                    }
                }
            } catch (error) {
                console.error('Error fetching suvichar:', error);
            }
        };
        if (!initialSuvichar) fetchSuvichar();

        const fetchPanchang = async () => {
            try {
                const res = await fetch('/api/panchang');
                if (res.ok) {
                    const dataArray = await res.json();
                    const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
                    if (data && data.tithi) {
                        const daysInHindi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
                        const todayHindi = daysInHindi[new Date().getDay()];
                        let samvatText = data.samvat || '';
                        if (samvatText.includes('•')) {
                            samvatText = samvatText.split('•')[0].trim() + ' • ' + todayHindi;
                        } else {
                            samvatText = samvatText + ' • ' + todayHindi;
                        }
                        setPanchangData({ tithi: data.tithi, samvat: samvatText });
                    }
                }
            } catch (error) {
                console.error('Error fetching panchang:', error);
            }
        };
        if (!initialPanchang) fetchPanchang();

        const fetchEpaperNews = async () => {
            try {
                const res = await fetch('/api/news');
                if (res.ok) {
                    const data = await res.json();

                    // Get all published e-paper news sorted by newest
                    const allEpaperNews = data
                        .filter(item => item.isEpaper && item.status !== 'draft')
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    // Calculate timestamp for 4 days ago
                    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

                    // Filter for news in the last 4 days
                    const recentEpaperNews = allEpaperNews.filter(item => new Date(item.createdAt) >= fourDaysAgo);

                    let displayNews = [...recentEpaperNews];

                    // Ensure minimum 8 pages (8 pages * 11 items = 88 items) without repeating
                    if (displayNews.length < 88) {
                        const usedIds = new Set(displayNews.map(item => item._id));

                        // Pad with older e-paper news
                        for (const item of allEpaperNews) {
                            if (displayNews.length >= 88) break;
                            if (!usedIds.has(item._id)) {
                                displayNews.push(item);
                                usedIds.add(item._id);
                            }
                        }

                        // If still less than 88, pad with any other older news
                        if (displayNews.length < 88) {
                            const allSortedNews = [...data].filter(item => item.status !== 'draft').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                            for (const item of allSortedNews) {
                                if (displayNews.length >= 88) break;
                                if (!usedIds.has(item._id)) {
                                    displayNews.push(item);
                                    usedIds.add(item._id);
                                }
                            }
                        }
                    }

                    if (displayNews.length > 0) {
                        setNews(displayNews);
                    }
                }
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEpaperNews();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#ece4d7]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
        );
    }

    if (news.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#ece4d7]">
                <h2 className="text-3xl font-serif font-bold text-red-800">ई-पेपर उपलब्ध नहीं है</h2>
                <p className="text-gray-800 mt-2 font-sans">जल्द ही ताज़ा खबरें अपडेट की जाएंगी।</p>
            </div>
        );
    }

    const stripHtml = (html) => {
        if (!html) return '';
        const cleanHtml = html.replace(/&amp;nbsp;/gi, ' ').replace(/&nbsp;/gi, ' ');
        if (typeof window !== 'undefined' && window.DOMParser) {
            const doc = new DOMParser().parseFromString(cleanHtml, 'text/html');
            const text = doc.body.textContent || doc.body.innerText || '';
            return text.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
        } else {
            return cleanHtml.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
        }
    };

    const totalPages = Math.ceil(news.length / itemsPerPage);
    const paginatedNews = news.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const currentHour = new Date().getHours();
    const timeIcon = (currentHour >= 6 && currentHour < 18) ? '☀️' : '🌙';

    const generateClassicCutting = async (item, catHindi, bannerColor = '#0284c7', isFullArticle = false) => {
        try {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '0';
            container.style.top = '0';
            container.style.zIndex = '-9999';
            container.style.width = '1000px';
            container.style.backgroundColor = '#FFFFFA'; // Newspaper grey background
            container.style.padding = '20px'; // Outer padding for the black border
            container.style.boxSizing = 'border-box';
            container.style.fontFamily = "'Noto Sans Devanagari', sans-serif";

            const innerBorder = document.createElement('div');
            innerBorder.style.border = 'none';
            innerBorder.style.padding = '20px';
            container.appendChild(innerBorder);

            // 1. Top Row: Category and Brand
            const catTagRow = document.createElement('div');
            catTagRow.style.display = 'flex';
            catTagRow.style.alignItems = 'center';
            catTagRow.style.marginTop = '-5px';
            catTagRow.style.marginBottom = '16px';
            catTagRow.style.fontFamily = 'sans-serif';
            catTagRow.style.fontSize = '12px';
            catTagRow.style.fontWeight = 'bold';

            const catBlock = document.createElement('div');
            catBlock.style.backgroundColor = '#000000';
            catBlock.style.color = '#fef08a'; // yellow-200
            catBlock.style.padding = '4px 10px';
            catBlock.style.textTransform = 'uppercase';
            catBlock.style.letterSpacing = '0.5px';
            catBlock.innerText = catHindi || 'न्यूज़';

            const separator = document.createElement('span');
            separator.innerText = '|';
            separator.style.color = '#dc2626'; // red-600
            separator.style.margin = '0 8px';
            separator.style.fontSize = '22px';
            separator.style.lineHeight = '1';
            separator.style.marginTop = '-4px';

            const tagLine = document.createElement('span');
            tagLine.innerText = 'हिंद भारत न्यूज़';
            tagLine.style.color = '#dc2626';
            tagLine.style.fontFamily = "'Noto Sans Devanagari', sans-serif";
            tagLine.style.fontSize = '18px';
            tagLine.style.fontWeight = 'bold';
            tagLine.style.lineHeight = '1';
            tagLine.style.marginTop = '2px';

            catTagRow.appendChild(catBlock);
            catTagRow.appendChild(separator);
            catTagRow.appendChild(tagLine);
            innerBorder.appendChild(catTagRow);

            // 2. Title (Aligned left, bold, large with dynamic font size)
            const titleEl = document.createElement('h1');
            const titleLen = item.title.length;
            let dynamicFontSize = '42px';
            if (titleLen > 140) {
                dynamicFontSize = '30px';
            } else if (titleLen > 110) {
                dynamicFontSize = '34px';
            } else if (titleLen > 80) {
                dynamicFontSize = '38px';
            }
            titleEl.style.fontSize = dynamicFontSize;
            titleEl.style.fontWeight = '900';
            titleEl.style.lineHeight = '1.05';
            titleEl.style.textAlign = 'left';
            titleEl.style.color = '#000000';
            titleEl.style.marginTop = '0px';
            titleEl.style.marginBottom = '4px';
            titleEl.innerText = item.title;
            innerBorder.appendChild(titleEl);

            // 3. Location and Author Row
            const metaRow = document.createElement('div');
            metaRow.style.marginTop = '0px';
            metaRow.style.marginBottom = '10px';
            metaRow.style.fontSize = '16px';
            metaRow.style.fontWeight = 'bold';
            metaRow.style.fontFamily = "'Noto Sans Devanagari', sans-serif";

            let authorName = ['admin', 'एडमिन'].includes(item.author?.toLowerCase()) ? 'विशेष संवाददाता' : (item.author || 'विशेष संवाददाता');

            metaRow.innerHTML = `<span style="color: #dc2626;">${item.location || 'नई दिल्ली'}</span> <span style="color: #9ca3af; margin: 0 8px; font-weight: normal;">|</span> <span style="color: #6b7280; font-size: 14px; font-weight: 600;">${authorName}</span>`;

            // Global styles to prevent right overflow from WYSIWYG content
            const styleFix = document.createElement('style');
            styleFix.innerHTML = `
                .classic-cutting-content * {
                    height: auto !important;
                    word-wrap: break-word !important;
                    word-break: break-word !important;
                    hyphens: auto !important;
                    -webkit-hyphens: auto !important;
                    white-space: normal !important;
                    box-sizing: border-box !important;
                }
                .classic-cutting-content p {
                    margin-top: 0 !important;
                    margin-bottom: 6px !important;
                    padding: 0 !important;
                    line-height: 1.4 !important;
                }
                .classic-cutting-content br {
                    display: none !important;
                }
                .classic-cutting-content div {
                    margin-top: 0 !important;
                    margin-bottom: 6px !important;
                }
                .classic-cutting-content img {
                    display: block;
                    margin: 10px auto;
                }
            `;
            container.appendChild(styleFix);

            // Image
            let imgHTML = '';
            if (item.image) {
                const crossOrigin = !item.image.includes('chatgpt.com') ? 'crossOrigin="anonymous"' : '';
                imgHTML = `<div style="margin-bottom: 25px !important; break-inside: avoid;"><img src="${item.image}" style="width: 100%; max-height: 500px; object-fit: cover; border: 1px solid #000; display: block;" ${crossOrigin} /></div>`;
            }

            let leftContent, midContent, rightContent, doc, totalLength;

            if (isFullArticle) {
                const parser = new DOMParser();
                doc = parser.parseFromString(item.content, 'text/html');

                // Clean up empty tags and <br>s from WYSIWYG that cause extra spacing
                doc.querySelectorAll('p, div, span').forEach(el => {
                    if (!el.textContent.trim() && !el.querySelector('img')) {
                        el.remove();
                    }
                });
                doc.querySelectorAll('br').forEach(br => br.remove());

                // Remove embedded images so only the main image shows in cutting
                doc.querySelectorAll('img').forEach(img => img.remove());

                // Flatten paragraphs into a single continuous block of text
                doc.querySelectorAll('p, div').forEach(el => {
                    const space = document.createTextNode(' ');
                    el.appendChild(space);
                    while (el.firstChild) {
                        el.parentNode.insertBefore(el.firstChild, el);
                    }
                    el.remove();
                });

                totalLength = doc.body.textContent.length;

                const flexContainer = document.createElement('div');
                flexContainer.style.display = 'flow-root';

                const leftCol = document.createElement('div');
                leftCol.style.float = 'left';
                leftCol.style.width = '32%';
                leftCol.style.paddingRight = '25px';
                leftCol.style.boxSizing = 'border-box';
                leftCol.id = 'leftCol-measure';
                leftCol.appendChild(metaRow);

                const hr = document.createElement('hr');
                hr.style.border = 'none';
                hr.style.borderTop = '1px solid #d1d5db';
                hr.style.marginBottom = '15px';
                hr.style.marginTop = '10px';
                leftCol.appendChild(hr);

                leftContent = document.createElement('div');
                leftContent.className = 'classic-cutting-content';
                leftContent.style.textAlign = 'justify';
                leftContent.style.fontSize = '16px';
                leftContent.style.lineHeight = '1.6';
                leftContent.style.fontFamily = 'inherit';
                leftCol.appendChild(leftContent);

                const rightCol = document.createElement('div');
                rightCol.style.float = 'right';
                rightCol.style.width = '68%';
                rightCol.id = 'rightCol-measure';

                if (item.image) {
                    const imgDiv = document.createElement('div');
                    imgDiv.style.marginTop = '20px';
                    imgDiv.style.marginBottom = '18px';
                    imgDiv.innerHTML = imgHTML;
                    rightCol.appendChild(imgDiv);
                }

                const rightSplitter = document.createElement('div');
                rightSplitter.style.display = 'flow-root';

                midContent = document.createElement('div');
                midContent.className = 'classic-cutting-content';
                midContent.style.float = 'left';
                midContent.style.width = '48%';
                midContent.style.paddingRight = '25px';
                midContent.style.boxSizing = 'border-box';
                midContent.style.borderRight = '1px solid #d1d5db';
                midContent.style.textAlign = 'justify';
                midContent.style.fontSize = '16px';
                midContent.style.lineHeight = '1.6';
                midContent.style.fontFamily = 'inherit';

                rightContent = document.createElement('div');
                rightContent.className = 'classic-cutting-content';
                rightContent.style.float = 'right';
                rightContent.style.width = '48%';
                rightContent.style.paddingLeft = '5px';
                rightContent.style.boxSizing = 'border-box';
                rightContent.style.textAlign = 'justify';
                rightContent.style.fontSize = '16px';
                rightContent.style.lineHeight = '1.6';
                rightContent.style.fontFamily = 'inherit';

                rightSplitter.appendChild(midContent);
                rightSplitter.appendChild(rightContent);
                rightCol.appendChild(rightSplitter);

                flexContainer.appendChild(leftCol);
                flexContainer.appendChild(rightCol);
                innerBorder.appendChild(flexContainer);
            } else {
                innerBorder.appendChild(metaRow);
                const colsContainer = document.createElement('div');
                colsContainer.className = 'classic-cutting-content';
                colsContainer.style.columnCount = '3';
                colsContainer.style.columnGap = '25px';
                colsContainer.style.columnRule = '1px solid #d1d5db';
                colsContainer.style.textAlign = 'justify';
                colsContainer.style.fontSize = '22px';
                colsContainer.style.lineHeight = '1.6';
                colsContainer.innerHTML = `${imgHTML} <p style="margin: 0; display: inline;">${stripHtml(item.content)}</p><div style="height: 60px; width: 100%; clear: both;"></div>`;
                innerBorder.appendChild(colsContainer);
            }

            // Footer
            const footer = document.createElement('div');
            footer.style.clear = 'both';
            footer.style.marginTop = '25px';
            footer.style.paddingTop = '10px';
            footer.style.borderTop = '2px solid #000';
            footer.style.display = 'flex';
            footer.style.justifyContent = 'space-between';
            footer.style.fontSize = '14px';
            footer.style.fontWeight = 'bold';
            footer.innerHTML = `<span>हिंद भारत न्यूज़ • सच्ची खबर, बेबाक नजर</span> <span>www.hbnnews24.com</span>`;
            innerBorder.appendChild(footer);

            // Stop Google Translate from processing the clone
            container.setAttribute('translate', 'no');
            container.classList.add('skiptranslate');

            // Remove translation elements BEFORE appending to avoid html-to-image bugs
            container.querySelectorAll('.skiptranslate:not([translate="no"]), iframe, #google_translate_element').forEach(el => el.remove());
            container.querySelectorAll('font').forEach(el => {
                const textNode = document.createTextNode(el.innerText || '');
                el.parentNode.replaceChild(textNode, el);
            });

            document.body.appendChild(container);

            // Wait for image to load to ensure correct container height!
            const imgs = Array.from(container.querySelectorAll('img'));
            await Promise.all(imgs.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));

            // BINARY SEARCH HEIGHT BALANCING WITH 3-WAY SPLIT
            if (isFullArticle && leftContent && midContent && rightContent && doc && totalLength) {
                let low = 0.2;
                let high = 0.8;
                let bestDiff = Infinity;
                let bestLeftHTML = '';
                let bestMidHTML = '';
                let bestRightHTML = '';

                const lColMeasure = document.getElementById('leftCol-measure');
                const rColMeasure = document.getElementById('rightCol-measure');

                if (lColMeasure && rColMeasure) {
                    for (let i = 0; i < 7; i++) {
                        let mid = (low + high) / 2;
                        let target1 = totalLength * mid;
                        let remaining = totalLength - target1;
                        let target2 = target1 + (remaining / 2); // Split remaining 50/50

                        let currentLength = 0;
                        let state = 1; // 1: left, 2: mid, 3: right

                        const doc1 = document.createElement('div');
                        const doc2 = document.createElement('div');
                        const doc3 = document.createElement('div');

                        function traverse3(node, p1, p2, p3) {
                            if (node.nodeType === Node.TEXT_NODE) {
                                const text = node.textContent;
                                let remainingText = text;

                                while (remainingText.length > 0) {
                                    let currentTarget = state === 1 ? target1 : (state === 2 ? target2 : Infinity);

                                    if (currentLength + remainingText.length <= currentTarget) {
                                        if (state === 1) p1.appendChild(document.createTextNode(remainingText));
                                        else if (state === 2) p2.appendChild(document.createTextNode(remainingText));
                                        else p3.appendChild(document.createTextNode(remainingText));

                                        currentLength += remainingText.length;
                                        remainingText = '';
                                    } else {
                                        const splitIndex = currentTarget - currentLength;
                                        let spaceIndex = remainingText.indexOf(' ', splitIndex);
                                        if (spaceIndex === -1) spaceIndex = splitIndex;
                                        if (spaceIndex === 0 && remainingText.length > 0) spaceIndex = 1;

                                        const chunk = remainingText.substring(0, spaceIndex);
                                        remainingText = remainingText.substring(spaceIndex);

                                        if (state === 1) p1.appendChild(document.createTextNode(chunk));
                                        else if (state === 2) p2.appendChild(document.createTextNode(chunk));
                                        else p3.appendChild(document.createTextNode(chunk));

                                        currentLength += chunk.length;
                                        state++;
                                    }
                                }
                            } else if (node.nodeType === Node.ELEMENT_NODE) {
                                const c1 = node.cloneNode(false);
                                const c2 = node.cloneNode(false);
                                const c3 = node.cloneNode(false);

                                if (state <= 1) p1.appendChild(c1);
                                if (state <= 2) p2.appendChild(c2);
                                p3.appendChild(c3);

                                Array.from(node.childNodes).forEach(child => traverse3(child, c1, c2, c3));
                            }
                        }

                        Array.from(doc.body.childNodes).forEach(child => traverse3(child, doc1, doc2, doc3));

                        // Clean up empty tags generated by the traverse clone logic
                        [doc1, doc2, doc3].forEach(d => {
                            Array.from(d.querySelectorAll('p, div, span')).reverse().forEach(el => {
                                if (!el.textContent.trim() && !el.querySelector('img')) {
                                    el.remove();
                                }
                            });
                        });

                        leftContent.innerHTML = doc1.innerHTML;
                        midContent.innerHTML = doc2.innerHTML;
                        rightContent.innerHTML = doc3.innerHTML;

                        let diff = lColMeasure.offsetHeight - rColMeasure.offsetHeight;
                        if (Math.abs(diff) < bestDiff) {
                            bestDiff = Math.abs(diff);
                            bestLeftHTML = doc1.innerHTML;
                            bestMidHTML = doc2.innerHTML;
                            bestRightHTML = doc3.innerHTML;
                        }

                        if (diff < 0) {
                            low = mid; // left is shorter
                        } else {
                            high = mid; // left is taller
                        }
                    }
                    leftContent.innerHTML = bestLeftHTML;
                    midContent.innerHTML = bestMidHTML;
                    rightContent.innerHTML = bestRightHTML;
                }
            }

            // Inject Google Fonts directly to ensure html-to-image embeds them properly
            const fontStyle = document.createElement('style');
            fontStyle.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;900&family=Yatra+One&display=swap');`;
            container.appendChild(fontStyle);

            // Safely disable any cross-origin stylesheets that prevent cssRules access
            const allLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            const badLinks = allLinks.filter(link => {
                try {
                    // This will throw a SecurityError if the stylesheet is cross-origin without CORS
                    const rules = link.sheet ? link.sheet.cssRules : null;
                    return false; // It's accessible
                } catch (e) {
                    return true; // It threw an error, so it's a bad link
                }
            });
            badLinks.forEach(link => link.setAttribute('disabled', 'true'));

            // Extra wait for layout stabilization and fonts
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 800));

            const dataUrl = await toJpeg(container, {
                quality: 0.95,
                backgroundColor: '#FFFFFA',
                pixelRatio: 2
            });

            // Re-enable stylesheets
            badLinks.forEach(link => link.removeAttribute('disabled'));

            document.body.removeChild(container);

            const link = document.createElement('a');
            link.href = dataUrl;
            const cleanTitle = item.title.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_').substring(0, 30);
            link.download = `HBN24_Classic_Cutting_${cleanTitle}.jpg`;
            link.click();
        } catch (error) {
            console.error("Error generating classic cutting:", error);
            alert("Failed to download cutting: " + (error.message || error));
            const temp = document.body.querySelector('div[style*="-9999"]');
            if (temp) document.body.removeChild(temp);
        }
    };

    const downloadNewsCutting = async (id, title, item, theme = 'default', catHindi = '', bannerColor = '#0284c7') => {
        if (theme === 'classic' && item) {
            return generateClassicCutting(item, catHindi, bannerColor, false);
        }
        if (theme === 'classic-full' && item) {
            return generateClassicCutting(item, catHindi, bannerColor, true);
        }

        const articleElement = document.getElementById(`article-${id}`);
        const mastheadElement = document.getElementById('epaper-masthead');
        const footerElement = document.getElementById('epaper-footer');
        if (!articleElement || !mastheadElement) return;

        try {
            // Create a temporary container
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '0';
            tempContainer.style.top = '0';
            tempContainer.style.zIndex = '-9999'; // Hide behind current UI
            tempContainer.style.width = '1200px'; // Force desktop width
            tempContainer.style.backgroundColor = '#FFFFFA';
            tempContainer.style.padding = '0'; // Remove padding so masthead and footer are full width
            tempContainer.style.boxSizing = 'border-box';
            tempContainer.style.display = 'flex';
            tempContainer.style.flexDirection = 'column';
            tempContainer.style.gap = '0px';

            // Clone masthead and force desktop visibility & layout
            const mastheadClone = mastheadElement.cloneNode(true);

            // Remove borders and shadows for the downloaded cutting
            mastheadClone.classList.remove('border-b-[6px]', 'border-black/20');
            mastheadClone.style.borderBottom = 'none';
            mastheadClone.querySelectorAll('.shadow-sm').forEach(el => {
                el.classList.remove('shadow-sm');
                el.style.boxShadow = 'none';
            });

            // 1. Force hidden desktop elements to show (including sm: and md: breakpoints)
            mastheadClone.querySelectorAll('.hidden.md\\:flex').forEach(el => { el.classList.remove('hidden', 'md:flex'); el.style.display = 'flex'; });
            mastheadClone.querySelectorAll('.hidden.sm\\:inline').forEach(el => { el.classList.remove('hidden', 'sm:inline'); el.style.display = 'inline'; });
            mastheadClone.querySelectorAll('.hidden.sm\\:block').forEach(el => { el.classList.remove('hidden', 'sm:block'); el.style.display = 'block'; });

            // 2. Hide mobile-only elements
            mastheadClone.querySelectorAll('.sm\\:hidden').forEach(el => { el.style.display = 'none'; });

            // 3. Force desktop flex/grid directions and alignments
            mastheadClone.querySelectorAll('.md\\:flex-row').forEach(el => { el.style.flexDirection = 'row'; });
            mastheadClone.querySelectorAll('.md\\:items-end').forEach(el => { el.style.alignItems = 'flex-end'; });
            mastheadClone.querySelectorAll('.md\\:justify-start').forEach(el => { el.style.justifyContent = 'flex-start'; });
            mastheadClone.querySelectorAll('.md\\:justify-end').forEach(el => { el.style.justifyContent = 'flex-end'; });
            mastheadClone.querySelectorAll('.md\\:w-\\[220px\\]').forEach(el => {
                el.style.width = '220px';
                el.style.minWidth = '220px'; // Prevent squishing
            });

            // 3.5. Fix html-to-image flex-col wrapping overlap bug
            mastheadClone.querySelectorAll('.flex.flex-col.items-end.text-right').forEach(el => {
                el.style.display = 'block'; // Replace flex-col with block to fix height calc bug
                el.querySelectorAll('.flex.items-center').forEach(child => {
                    child.style.justifyContent = 'flex-end'; // Keep header right aligned
                });
            });
            mastheadClone.querySelectorAll('.tracking-tight.leading-tight').forEach(el => {
                el.style.whiteSpace = 'nowrap'; // Prevent tithi from wrapping and causing height bugs
            });

            mastheadClone.querySelectorAll('.md\\:grid').forEach(el => { el.classList.remove('flex'); el.style.display = 'grid'; });
            mastheadClone.querySelectorAll('.md\\:grid-cols-3').forEach(el => { el.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))'; });

            // 4. Fix text sizes, margins, and gaps that use md: directly
            const h1El = mastheadClone.querySelector('h1');
            if (h1El) h1El.style.fontSize = '90px';
            mastheadClone.querySelectorAll('.md\\:text-\\[13px\\]').forEach(el => el.style.fontSize = '13px');
            mastheadClone.querySelectorAll('.md\\:text-\\[14px\\]').forEach(el => el.style.fontSize = '14px');
            mastheadClone.querySelectorAll('.md\\:text-\\[15px\\]').forEach(el => el.style.fontSize = '15px');
            mastheadClone.querySelectorAll('.md\\:text-\\[16px\\]').forEach(el => el.style.fontSize = '16px');
            mastheadClone.querySelectorAll('.md\\:text-\\[18px\\]').forEach(el => el.style.fontSize = '18px');
            mastheadClone.querySelectorAll('.md\\:text-\\[20px\\]').forEach(el => el.style.fontSize = '20px');
            mastheadClone.querySelectorAll('.md\\:text-\\[26px\\]').forEach(el => el.style.fontSize = '26px');
            mastheadClone.querySelectorAll('.md\\:text-\\[4xl\\]').forEach(el => el.style.fontSize = '36px');
            mastheadClone.querySelectorAll('.md\\:gap-2').forEach(el => el.style.gap = '0.5rem');
            mastheadClone.querySelectorAll('.md\\:gap-4').forEach(el => el.style.gap = '1rem');
            mastheadClone.querySelectorAll('.md\\:-mt-4').forEach(el => el.style.marginTop = '-0.2rem');
            mastheadClone.querySelectorAll('.md\\:mt-4').forEach(el => el.style.marginTop = '1rem');
            mastheadClone.querySelectorAll('.md\\:-mb-2').forEach(el => el.style.marginBottom = '-8px');
            mastheadClone.querySelectorAll('.md\\:px-10').forEach(el => { el.style.paddingLeft = '2.5rem'; el.style.paddingRight = '2.5rem'; });

            // Clone article and clean it up
            const articleClone = articleElement.cloneNode(true);
            const cuttingBtn = articleClone.querySelector('.cutting-btn');
            if (cuttingBtn) cuttingBtn.remove();
            const gameEl = articleClone.querySelector('.newspaper-game');
            if (gameEl) gameEl.remove();

            // Enhance article styling for standalone download
            articleClone.style.border = 'none';
            articleClone.style.padding = '0px 40px'; // Add horizontal padding since container padding was removed
            articleClone.style.backgroundColor = 'transparent'; // Let the newspaper background show
            articleClone.style.boxShadow = 'none';
            articleClone.style.width = '100%';

            // Float image for text wrapping
            articleClone.classList.remove('flex', 'flex-col');
            articleClone.style.display = 'block';

            const imgContainers = articleClone.querySelectorAll('.mb-3.overflow-hidden.border');
            imgContainers.forEach(container => {
                container.style.float = 'left';
                container.style.width = '45%';
                container.style.marginRight = '20px';
                container.style.marginBottom = '12px';
            });

            const textContainersGroup = articleClone.querySelectorAll('.text-gray-800');
            textContainersGroup.forEach(tc => {
                tc.classList.remove('flex', 'flex-col', 'flex-1');
                tc.style.setProperty('text-align', 'justify', 'important');
                tc.style.setProperty('text-justify', 'inter-word', 'important');
                tc.querySelectorAll('p').forEach(p => {
                    p.style.setProperty('font-size', '16px', 'important');
                    p.style.setProperty('line-height', '1.6', 'important');
                    p.style.setProperty('text-align', 'justify', 'important');
                    p.style.setProperty('text-justify', 'inter-word', 'important');
                    p.style.setProperty('word-break', 'break-word', 'important');
                    p.style.setProperty('hyphens', 'auto', 'important');
                });
            });

            // Force all images to be in full color and show fully without cropping
            const images = articleClone.querySelectorAll('img');
            images.forEach(img => {
                img.classList.remove('grayscale', 'aspect-[16/9]', 'object-cover');
                img.style.filter = 'none';
                img.style.height = 'auto';
                img.style.maxHeight = 'none';
                img.style.objectFit = 'contain';
                img.style.width = '100%';
            });

            // Show full article text by removing line clamps
            const textContainers = articleClone.querySelectorAll('[class*="line-clamp-"]');
            textContainers.forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    el.className = el.className.replace(/line-clamp-\[\d+\]/g, '').replace(/line-clamp-\d/g, '');
                }
                el.style.display = 'block';
                el.style.webkitLineClamp = 'unset';
                el.style.maxHeight = 'none';
            });

            // Make all titles uniform large size for downloaded cutting
            const titleHeading = articleClone.querySelector('h2');
            if (titleHeading) {
                titleHeading.classList.remove('text-4xl', 'md:text-5xl', 'text-2xl', 'md:text-3xl', 'text-xl', 'text-3xl', 'mb-2', 'pb-1');
                // Ensure a uniform large font size for the downloaded cutting
                titleHeading.style.fontSize = '2.5rem';
                titleHeading.style.lineHeight = '1.15';
                titleHeading.style.fontWeight = 'bold';
                titleHeading.style.marginBottom = '-2px'; // Tighter gap
                titleHeading.style.paddingBottom = '0px';
            }
            // Ensure "हिंद भारत न्यूज़" tag is visible on ALL cuttings
            const categorySpan = articleClone.querySelector('span.bg-black.text-white');
            if (categorySpan) {
                const categoryContainer = categorySpan.parentElement;
                const hasTag = Array.from(categoryContainer.children).some(el => el.textContent.includes('हिंद भारत न्यूज़'));
                if (!hasTag) {
                    const tag = document.createElement('span');
                    tag.className = "text-[10px] font-bold text-red-800 border-l-2 border-red-800 pl-2";
                    tag.textContent = "हिंद भारत न्यूज़";
                    categoryContainer.appendChild(tag);
                }
            }

            tempContainer.appendChild(mastheadClone);
            tempContainer.appendChild(articleClone);

            if (footerElement) {
                const footerClone = footerElement.cloneNode(true);
                // Make sure hidden dot groups show up on download
                const hiddenDots = footerClone.querySelectorAll('.hidden.sm\\:flex');
                hiddenDots.forEach(el => {
                    el.classList.remove('hidden', 'sm:flex');
                    el.style.display = 'flex';
                });
                footerClone.style.backgroundColor = 'transparent';
                // footerClone.classList.remove('border-t', 'border-black/20');
                footerClone.style.borderTop = '1px solid rgba(0,0,0,0.2)';
                tempContainer.appendChild(footerClone);
            }

            // Stop Google Translate from processing the clone
            tempContainer.setAttribute('translate', 'no');
            tempContainer.classList.add('skiptranslate');

            // Remove translation elements BEFORE appending to avoid html-to-image bugs
            tempContainer.querySelectorAll('.skiptranslate:not([translate="no"]), iframe, #google_translate_element').forEach(el => el.remove());
            // Remove Google Translate injected `<font>` tags but keep their text
            tempContainer.querySelectorAll('font').forEach(el => {
                const textNode = document.createTextNode(el.innerText || '');
                el.parentNode.replaceChild(textNode, el);
            });

            // Append to the root so styles apply perfectly
            document.body.appendChild(tempContainer);

            // Inject Google Fonts directly to ensure html-to-image embeds them properly
            const fontStyle = document.createElement('style');
            fontStyle.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;900&family=Yatra+One&display=swap');`;
            tempContainer.appendChild(fontStyle);

            // Temporarily disable remote translate stylesheets to prevent cssRules SecurityError
            const badLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link =>
                link.href.includes('translate')
            );
            badLinks.forEach(link => link.setAttribute('disabled', 'true'));

            // Wait for browser to calculate layout of the new cloned DOM
            await new Promise(resolve => setTimeout(resolve, 300));

            const dataUrl = await toJpeg(tempContainer, {
                quality: 0.95,
                backgroundColor: '#FFFFFA',
                pixelRatio: 2
            });

            // Re-enable stylesheets
            badLinks.forEach(link => link.removeAttribute('disabled'));

            document.body.removeChild(tempContainer);

            const link = document.createElement('a');
            link.href = dataUrl;
            const cleanTitle = title.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_').substring(0, 30);
            link.download = `HBN24_News_Cutting_${cleanTitle}.jpg`;
            link.click();
        } catch (error) {
            console.error("Error generating cutting:", error);
            alert("Failed to download cutting: " + (error.message || error));
            // Clean up
            const temp = document.body.querySelector('div[style*="-9999"]');
            if (temp) document.body.removeChild(temp);
        }
    };

    // Assign newspaper layout roles
    const getStoryStyle = (index) => {
        if (index === 0) return 'headline'; // main top story
        if (index === 1) return 'double-column';
        if (index === 10) return 'bottom-wide'; // 11th item spans 2 columns
        if (index === 2 || index === 3) return 'feature';
        return 'normal';
    };

    return (
        <div className="min-h-screen bg-[#c9c1ae] py-6 px-4 md:px-8 selection:bg-yellow-900 selection:text-white">
            {/* Main newspaper wrapper with aged paper look */}
            <div id="epaper-page"
                className="max-w-[1300px] mx-auto bg-[#FFFFFA] shadow-2xl border border-black/20 border-b-[8px] border-b-[#a61c1c]"
                style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-paper-texture.png")',
                    fontFamily: "'Playfair Display', 'Times New Roman', Times, serif",
                }}
            >
                {/* ========== REAL NEWSPAPER MASTHEAD ========== */}
                <div id="epaper-masthead" className="border-b-[6px] border-black/20 pb-4 pt-6 px-6 relative">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 w-full">
                        <div className="hidden md:flex w-full md:w-[220px] justify-center md:justify-start shrink-0 mb-auto pt-2 md:pt-4">
                            <div className="flex flex-col items-center text-center">
                                <h3 className="text-3xl md:text-4xl font-normal text-[#a61c1c] mb-1 drop-shadow-sm" style={{ fontFamily: "'Yatra One', cursive" }}>सुविचार</h3>
                                <p className="text-[13px] md:text-[15px] font-bold text-gray-800 leading-snug tracking-tight max-w-[180px]">{suvicharText}</p>
                            </div>
                        </div>
                        <div className="text-center flex-1">
                            <div className="inline-block relative -mt-1 md:mt-4">
                                <div className="text-center text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-0 md:-mb-2 relative z-10 font-sans">
                                    A Unit of Digital ORRA
                                </div>
                                <h1
                                    className="text-[44px] min-[375px]:text-[48px] min-[400px]:text-[52px] sm:text-5xl md:text-[68px] lg:text-[90px] font-black tracking-tight leading-tight md:leading-[1.1] text-slate-900 uppercase whitespace-nowrap drop-shadow-sm w-full text-center"
                                    style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", letterSpacing: '-0.03em' }}
                                >
                                    हिंद भारत न्यूज़
                                </h1>
                                <div className="text-center text-[11px] sm:text-[13px] md:text-[16px] font-bold text-[#a61c1c] uppercase -mt-2 md:-mt-4 opacity-90">
                                    सच्ची खबर, बेबाक नजर
                                </div>
                            </div>
                            <p className="text-[12px] tracking-normal font-mono mt-1 text-gray-700">
                                राष्ट्रीय हिंदी दैनिक • स्थापना 2024
                            </p>
                        </div>
                        <div className="hidden md:flex w-full md:w-[220px] justify-center md:justify-end shrink-0 mb-auto pt-2 md:pt-4">
                            <div className="flex flex-col items-center text-center border-l-[3px] border-[#a61c1c] pl-4 opacity-95">
                                <div className="flex items-center justify-center gap-2 mb-1.5 text-[#a61c1c]">
                                    <span className="text-[22px] md:text-[26px] font-black" style={{ fontFamily: "'Yatra One', cursive" }}>ॐ</span>
                                    <span className="text-[14px] md:text-[16px] font-bold tracking-widest uppercase border-b-2 border-[#a61c1c]/30 pb-0.5">आज का पंचांग</span>
                                </div>
                                <div className="text-[18px] md:text-[20px] font-black text-gray-900 tracking-tight leading-tight">{panchangData.tithi}</div>
                                <div className="text-[13px] md:text-[15px] font-bold text-gray-600 mt-1">{panchangData.samvat}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between md:grid md:grid-cols-3 gap-1 md:gap-2 text-[12px] md:text-[14px] font-semibold border-y-[3px] border-[#801515] py-2.5 mt-4 bg-gradient-to-r from-[#801515] via-[#a61c1c] to-[#801515] text-white px-6 md:px-10 items-center shadow-sm -mx-6">
                        <a href="https://hbnnews24.com/" target="_blank" rel="noreferrer" className="text-left font-sans font-bold uppercase tracking-[0.02em] sm:tracking-[0.15em] text-[10px] md:text-[13px] whitespace-nowrap flex items-center gap-1.5 opacity-95 hover:text-gray-200 transition-colors">
                            <FaGlobe className="text-[12px] md:text-[15px] opacity-90 shrink-0" /> <span className="hidden sm:inline">www.hbnnews24.com</span><span className="sm:hidden">hbnnews24.com</span>
                        </a>
                        <div className="text-center font-bold text-white whitespace-nowrap drop-shadow-sm text-[9px] sm:text-[11px] md:text-[14px]">
                            {new Date().toLocaleDateString('hi-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })} <span className="hidden sm:inline mx-1 md:mx-2 opacity-60">|</span> <span className="hidden sm:inline font-medium opacity-90">पृष्ठ {currentPage} / {totalPages}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 md:gap-4 text-[13px] sm:text-[15px] md:text-[18px]">
                            <a href="https://www.youtube.com/@hbnnews24x7" target="_blank" rel="noreferrer" className="text-white hover:text-[#ffb3b3] hover:-translate-y-0.5 transition-all drop-shadow-md"><FaYoutube /></a>
                            <a href="https://www.instagram.com/hbnnews24/" target="_blank" rel="noreferrer" className="text-white hover:text-[#ffb3c6] hover:-translate-y-0.5 transition-all drop-shadow-md"><FaInstagram /></a>
                            <a href="https://www.facebook.com/HBNNews24" target="_blank" rel="noreferrer" className="text-white hover:text-[#b3d4ff] hover:-translate-y-0.5 transition-all drop-shadow-md"><FaFacebook /></a>
                            <a href="https://www.tumblr.com/hbnnews24" target="_blank" rel="noreferrer" className="hidden sm:block text-white hover:text-[#b3c6ff] hover:-translate-y-0.5 transition-all drop-shadow-md"><FaTumblr /></a>
                            <a href="https://x.com/HbnNews24" target="_blank" rel="noreferrer" className="hidden sm:block text-white hover:text-gray-300 hover:-translate-y-0.5 transition-all drop-shadow-md"><FaXTwitter /></a>
                            <a href="https://in.pinterest.com/hbnnews24/" target="_blank" rel="noreferrer" className="hidden sm:block text-white hover:text-[#ffb3c6] hover:-translate-y-0.5 transition-all drop-shadow-md"><FaPinterest /></a>
                            <a href="https://www.linkedin.com/in/hbn-news-b79459342/" target="_blank" rel="noreferrer" className="hidden sm:block text-white hover:text-[#b3e0ff] hover:-translate-y-0.5 transition-all drop-shadow-md"><FaLinkedin /></a>
                        </div>
                    </div>
                </div>

                {/* ========== 5-COLUMN NEWSPAPER GRID (AKHBAAR STYLE) ========== */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6 relative">
                    {paginatedNews.map((item, idx) => {
                        const style = getStoryStyle(idx);
                        const plainText = stripHtml(item.content);
                        let primaryCat = '';
                        if (Array.isArray(item.category)) {
                            const filtered = item.category.filter(c => c.toLowerCase() !== 'superfast' && c.toLowerCase() !== 'featured');
                            primaryCat = filtered.length > 0 ? filtered[0] : (item.category[0] || '');
                        } else if (typeof item.category === 'string') {
                            primaryCat = item.category;
                        }

                        const catHindi = {
                            politics: 'राजनीति',
                            sports: 'खेल',
                            entertainment: 'मनोरंजन',
                            business: 'अर्थ जगत',
                            tech: 'टेक्नोलॉजी',
                            technology: 'टेक्नोलॉजी',
                            religion: 'धर्म',
                            lifestyle: 'जीवनशैली',
                            national: 'राष्ट्रीय',
                            international: 'अंतर्राष्ट्रीय'
                        }[primaryCat?.toLowerCase()] || primaryCat;

                        // Dynamic column spans
                        let colSpan = 'col-span-1';
                        if (style === 'headline') colSpan = 'md:col-span-3 md:border-r-2 border-black/20 md:pr-6 md:pb-3';
                        if (style === 'double-column') colSpan = 'md:col-span-2 md:border-r border-black/15 md:pr-4 md:pb-3';
                        if (style === 'bottom-wide') colSpan = 'md:col-span-2 md:border-l border-black/15 md:pl-4';
                        if (style === 'feature') colSpan = 'md:col-span-1';

                        return (
                            <div
                                key={item._id}
                                className={`${colSpan} group break-inside-avoid pb-2 ${idx !== paginatedNews.length - 1 ? 'border-b md:border-b-0' : ''
                                    }`}
                            >
                                <div className="h-full -m-4 rounded transition-colors hover:bg-black/5">
                                    <article id={`article-${item._id}`} className="h-full flex flex-col p-4 relative">
                                        {/* Download Cutting Button - Visible on mobile, hover on desktop */}
                                        <button
                                            onClick={() => setCuttingModalData({ id: item._id, title: item.title, item: item, catHindi: catHindi })}
                                            className="cutting-btn absolute top-2 right-2 z-10 bg-white/90 border border-gray-300 text-gray-700 text-[10px] px-2 py-1 rounded shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:bg-red-50 hover:text-red-700 font-bold"
                                            title="न्यूज़ की कटिंग डाउनलोड करें"
                                        >
                                            ✂️ कटिंग लें
                                        </button>

                                        {/* category stripe */}
                                        <div className="mb-2 flex items-center gap-2 pr-20">
                                            <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 tracking-wider">
                                                {catHindi}
                                            </span>
                                            {style === 'headline' && (
                                                <span className="text-[10px] font-bold text-red-800 border-l-2 border-red-800 pl-2">
                                                    हिंद भारत न्यूज़
                                                </span>
                                            )}
                                        </div>

                                        {/* Headline */}
                                        <h2
                                            className={`font-black leading-snug pb-1 mb-2 hover:text-red-700 transition ${style === 'headline'
                                                ? 'text-[28px] md:text-[40px]'
                                                : style === 'double-column'
                                                    ? 'text-2xl md:text-3xl'
                                                    : 'text-xl'
                                                }`}
                                        >
                                            <Link href={`/news/${item.slug || item._id}`}>{item.title}</Link>
                                        </h2>

                                        {/* Byline */}
                                        <div className="flex items-center gap-2 text-[12px] font-medium text-gray-700 mb-3 border-b border-gray-200/50 pb-1 self-start">
                                            <span className="font-bold text-[#da0000] uppercase tracking-wide">{item.location || 'नई दिल्ली'}</span>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-gray-600">
                                                {['admin', 'एडमिन'].includes(item.author?.toLowerCase()) ? 'विशेष संवाददाता' : (item.author || 'विशेष संवाददाता')}
                                            </span>
                                        </div>

                                        {/* Image – only if not text-only and exists */}
                                        {item.image && (
                                            <div className="mb-3 overflow-hidden border border-black/10 bg-white shadow-sm">
                                                {item.image && !item.image.includes('chatgpt.com') ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-full aspect-[16/9] object-cover transition duration-500 grayscale group-hover:grayscale-0"
                                                        loading="lazy"
                                                        crossOrigin="anonymous"
                                                    />
                                                ) : (
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-full aspect-[16/9] object-cover transition duration-500 grayscale group-hover:grayscale-0"
                                                        loading="lazy"
                                                    />
                                                )}
                                                {style === 'headline' && (
                                                    <p className="text-[9px] font-mono bg-gray-100 p-1 text-center border-t border-black/10">
                                                        📸 सांकेतिक तस्वीर | फोटो: HBN News 24
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Article text with real dropcap on headline */}
                                        <div className={`text-gray-800 text-left md:text-justify break-words flex-1 flex flex-col ${style === 'double-column' ? 'mb-4' : ''}`}>
                                            <p
                                                className={`text-sm leading-relaxed break-words ${style === 'headline'
                                                    ? 'first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-red-900 first-letter:leading-[0.8] line-clamp-[8]'
                                                    : style === 'double-column'
                                                        ? 'line-clamp-[3]'
                                                        : style === 'bottom-wide'
                                                            ? 'line-clamp-[14]'
                                                            : 'line-clamp-[20]'
                                                    }`}
                                            >
                                                {plainText}
                                            </p>
                                        </div>

                                        {/* Auto-filler Game for empty space on right side */}
                                        {style === 'double-column' && <NewspaperGame />}
                                    </article>
                                </div>
                            </div>
                        );
                    })}
                </div>


                {/* Footer imprint and CMYK Newspaper Dots */}
                <div id="epaper-footer" className="border-t border-black/20 pt-4 pb-6 flex flex-col items-center gap-5 bg-transparent">
                    <div className="text-xs font-sans font-medium text-center text-gray-700 tracking-wide px-4">
                        प्रकाशक: HBN News 24 मीडिया | यह ई-पेपर मूल मुद्रित संस्करण के समान प्रमाणिक है।
                    </div>
                    {/* Newspaper Registration Color Marks and Socials */}
                    <div className="w-full flex items-center justify-between px-2 sm:px-6 md:px-10">
                        {/* Authentic CMYK Registration Marks 1 */}
                        <div className="hidden sm:flex gap-1.5 md:gap-3 items-center">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#00aeef]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#ec008c]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#fff200]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#000000]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#b0b0b0]"></div>
                            <div className="w-24 md:w-40 h-3 md:h-4 bg-[#b0b0b0]"></div>
                        </div>

                        {/* Authentic CMYK Registration Marks 2 */}
                        <div className="hidden md:flex gap-1.5 md:gap-3 items-center">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#00aeef]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#ec008c]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#fff200]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#000000]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#b0b0b0]"></div>
                            <div className="w-24 md:w-40 h-3 md:h-4 bg-[#b0b0b0]"></div>
                        </div>

                        {/* Authentic CMYK Registration Marks 3 */}
                        <div className="flex gap-1.5 md:gap-3 items-center">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#00aeef]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#ec008c]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#fff200]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#000000]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#b0b0b0]"></div>
                            <div className="w-24 md:w-40 h-3 md:h-4 bg-[#b0b0b0]"></div>
                        </div>

                        {/* Right Socials */}
                        <div className="flex gap-1.5 md:gap-2 items-center">
                            <a href="https://www.youtube.com/@hbnnews24x7" target="_blank" rel="noreferrer" className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"><FaYoutube className="text-xs md:text-base" /></a>
                            <a href="https://www.facebook.com/HBNNews24" target="_blank" rel="noreferrer" className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"><FaFacebookF className="text-xs md:text-base" /></a>
                            <a href="https://x.com/HbnNews24" target="_blank" rel="noreferrer" className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-black flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"><FaXTwitter className="text-xs md:text-base" /></a>
                        </div>
                    </div>
                </div>

                {/* ========== PAGE TURNING (REAL AKHBAAR BUTTONS) ========== */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-black/30 px-6 py-5 bg-white/60">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-40 border border-black/60 font-mono font-bold py-2 px-4 hover:bg-black hover:text-white transition disabled:opacity-30 uppercase text-sm tracking-wider"
                        >
                            ← पिछला पृष्ठ
                        </button>
                        <div className="font-mono text-sm border-b-2 border-black px-2">
                            पृष्ठ {currentPage} / {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-40 border border-black/60 font-mono font-bold py-2 px-4 hover:bg-black hover:text-white transition disabled:opacity-30 uppercase text-sm tracking-wider"
                        >
                            अगला पृष्ठ →
                        </button>
                    </div>
                )}
            </div>

            {/* Cutting Theme Modal */}
            {cuttingModalData && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-center">कटिंग की थीम चुनें</h3>
                        <p className="text-sm text-gray-600 mb-6 text-center">आप किस स्टाइल में न्यूज़ कटिंग डाउनलोड करना चाहते हैं?</p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => {
                                    downloadNewsCutting(cuttingModalData.id, cuttingModalData.title, cuttingModalData.item, 'default', cuttingModalData.catHindi);
                                    setCuttingModalData(null);
                                }}
                                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors text-left"
                            >
                                <div className="text-2xl">📱</div>
                                <div>
                                    <div className="font-bold text-gray-800">सिंगल कॉलम (Single Column)</div>
                                    <div className="text-xs text-gray-500">वेबसाइट जैसा डिफ़ॉल्ट डिज़ाइन (Full Article)</div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    downloadNewsCutting(cuttingModalData.id, cuttingModalData.title, cuttingModalData.item, 'classic', cuttingModalData.catHindi);
                                    setCuttingModalData(null);
                                }}
                                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                            >
                                <div className="text-2xl">📰</div>
                                <div>
                                    <div className="font-bold text-gray-800">क्लासिक (Classic Newspaper)</div>
                                    <div className="text-xs text-gray-500">कॉलम वाला पारंपरिक डिज़ाइन (सारांश)</div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    downloadNewsCutting(cuttingModalData.id, cuttingModalData.title, cuttingModalData.item, 'classic-full', cuttingModalData.catHindi);
                                    setCuttingModalData(null);
                                }}
                                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors text-left"
                            >
                                <div className="text-2xl">📜</div>
                                <div>
                                    <div className="font-bold text-gray-800">क्लासिक - पूरा लेख (Classic Full)</div>
                                    <div className="text-xs text-gray-500">पारंपरिक डिज़ाइन लेकिन पूरे पैराग्राफ के साथ</div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setCuttingModalData(null)}
                            className="w-full mt-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                        >
                            रद्द करें (Cancel)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}



