import ReporterProfile from '@/views/ReporterProfile';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawName = resolvedParams?.name || '';
  const displayName = rawName 
    ? decodeURIComponent(rawName).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
    : 'Reporter';

  return {
    title: `${displayName} - Reporter Profile & Articles | HBN News 24`,
    description: `Read exclusive news reports, ground coverage, and latest articles written by ${displayName} on HBN News 24.`,
    robots: 'index, follow',
    alternates: {
      canonical: `/reporter/${rawName}`,
    },
    openGraph: {
      title: `${displayName} - Reporter Profile | HBN News 24`,
      description: `Articles and news reports by ${displayName} on HBN News 24.`,
      type: 'profile',
    },
  };
}

export default function Page() {
  return <ReporterProfile />;
}
