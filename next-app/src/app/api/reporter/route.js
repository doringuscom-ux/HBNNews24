import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import News from '@/models/News';

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Get all registered admins/reporters from Admin collection
    const admins = await Admin.find().select('-password').lean();

    // 2. Aggregate news count by author
    const articleCounts = await News.aggregate([
      { $match: { status: { $ne: 'draft' } } },
      { 
        $group: { 
          _id: { $toLower: "$author" }, 
          originalAuthor: { $first: "$author" }, 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const countsMap = new Map();
    articleCounts.forEach(item => {
      if (item.originalAuthor) {
        countsMap.set(item.originalAuthor.toLowerCase().trim(), {
          author: item.originalAuthor,
          count: item.count
        });
      }
    });

    const reportersList = [];
    const addedNames = new Set();

    // Helper to check if name is admin alias
    const isAdminAlias = (name) => {
      const lower = (name || '').toLowerCase().trim();
      return lower === 'admin' || lower === 'एडमिन' || lower === 'shiv kumar' || lower === 'shiv-kumar';
    };

    // Calculate total count for admin / एडमिन / Shiv Kumar
    let adminTotalCount = 0;
    for (const [key, val] of countsMap.entries()) {
      if (isAdminAlias(key) || isAdminAlias(val.author)) {
        adminTotalCount += val.count;
      }
    }

    // Add registered admin/reporters
    for (const admin of admins) {
      let usernameKey = admin.username.toLowerCase().trim();
      let displayName = admin.username;
      let displaySlug = admin.username.toLowerCase().replace(/\s+/g, '-');
      let displayRole = admin.designation?.trim() || (admin.role === 'admin' ? 'Chief Editor' : 'Content Writer');

      // Convert "admin" or "एडमिन" to "Shiv Kumar"
      if (isAdminAlias(admin.username)) {
        displayName = 'Shiv Kumar';
        displaySlug = 'shiv-kumar';
        displayRole = admin.designation?.trim() || 'Chief Editor';
        usernameKey = 'shiv-kumar';
      }

      if (addedNames.has(usernameKey) || addedNames.has(displaySlug)) {
        continue;
      }
      addedNames.add(usernameKey);
      addedNames.add(displaySlug);

      let count = 0;
      if (isAdminAlias(displayName)) {
        count = adminTotalCount;
      } else {
        for (const [key, val] of countsMap.entries()) {
          if (key === usernameKey || key.replace(/\s+/g, '-') === usernameKey.replace(/\s+/g, '-')) {
            count += val.count;
          }
        }
      }

      reportersList.push({
        id: admin._id,
        name: displayName,
        slug: displaySlug,
        role: displayRole || 'Content Writer',
        profileImage: admin.profileImage || '',
        email: admin.email || '',
        articleCount: count,
      });
    }

    // Add any authors who have published news but aren't in Admin
    for (const [key, val] of countsMap.entries()) {
      let displayName = val.author;
      let slug = val.author.toLowerCase().replace(/\s+/g, '-');
      let role = 'Content Writer';

      if (isAdminAlias(val.author)) {
        displayName = 'Shiv Kumar';
        slug = 'shiv-kumar';
        role = 'Chief Editor';
      }

      if (!addedNames.has(key) && !addedNames.has(slug) && !addedNames.has(displayName.toLowerCase())) {
        addedNames.add(key);
        addedNames.add(slug);
        addedNames.add(displayName.toLowerCase());

        reportersList.push({
          id: slug,
          name: displayName,
          slug: slug,
          role: role,
          profileImage: '',
          email: '',
          articleCount: isAdminAlias(displayName) ? adminTotalCount : val.count,
        });
      }
    }

    // Filter OUT reporters with 0 articles and sort by articleCount descending
    const filteredList = reportersList
      .filter(reporter => reporter.articleCount > 0)
      .sort((a, b) => b.articleCount - a.articleCount);

    return NextResponse.json(filteredList);
  } catch (error) {
    console.error('Error fetching reporters list:', error);
    return NextResponse.json([], { status: 200 });
  }
}
