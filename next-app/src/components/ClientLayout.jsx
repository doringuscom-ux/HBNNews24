'use client';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Suspense } from 'react';
import Script from 'next/script';

export default function ClientLayout({ children, globalSeo, googleAnalyticsId }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <>
            {googleAnalyticsId && !isAdmin && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
                        strategy="lazyOnload"
                    />
                    <Script id="ga-inline" strategy="lazyOnload">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${googleAnalyticsId}', { page_path: '${pathname}' });
                        `}
                    </Script>
                </>
            )}
            {!isAdmin && <Navbar />}
            <main id="main-content" className="flex-grow">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div></div>}>
                    {children}
                </Suspense>
            </main>
            {!isAdmin && <Footer />}
        </>
    );
}


