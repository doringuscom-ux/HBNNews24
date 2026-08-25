'use client';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
                {children}
            </main>
            {!isAdmin && <Footer />}
        </>
    );
}


