 'use client';
import React from 'react';
import Link from 'next/link';

const Footer = () => {
    const footerLinks = [
        { name: 'Home', path: '/' },
        { name: 'Entertainment', path: '/entertainment' },
        { name: 'Religion', path: '/religion' },
        { name: 'Sports', path: '/sports' },
        { name: 'Lifestyle', path: '/lifestyle' },
        { name: 'Business', path: '/business' },
        { name: 'Technology', path: '/technology' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Terms & Conditions', path: '/terms' },
        { name: 'Disclaimer', path: '/disclaimer' },
        { name: 'Editorial Policy', path: '/editorial-policy' },
        { name: 'Fact Check Policy', path: '/fact-check-policy' },
        { name: 'Authors', path: '/authors' },
        { name: 'Corrections Policy', path: '/corrections-policy' },
    ];

    return (
        <footer className="w-full bg-[#171717] border-t-[3px] border-[#937851] py-5">
            <div className="w-full max-w-[1270px] mx-auto px-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {footerLinks.map((link, index) => (
                    <Link
                        key={index}
                        href={link.path}
                        title={link.name}
                        className="text-[#4da6ff] text-[13px] hover:text-white transition-colors tracking-wide"
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
        </footer>
    );
};

export default Footer;





