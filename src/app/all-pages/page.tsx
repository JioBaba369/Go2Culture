import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const pageGroups = [
    {
        title: 'Public Pages',
        pages: [
            { path: '/', name: 'Home' },
            { path: '/about', name: 'About Us' },
            { path: '/become-a-host', name: 'Become a Host' },
            { path: '/careers', name: 'Careers' },
            { path: '/cities', name: 'Cities' },
            { path: '/contact', name: 'Contact' },
            { path: '/cookies', name: 'Cookie Policy' },
            { path: '/cuisines', name: 'Cuisines' },
            { path: '/discover', name: 'Discover Experiences' },
            { path: '/experiences/1', name: 'Experience Details (example)' },
            { path: '/guest-guidelines', name: 'Guest Guidelines' },
            { path: '/host-guidelines', name: 'Host Guidelines' },
            { path: '/impact', name: 'Our Impact' },
            { path: '/press', name: 'Press' },
            { path: '/privacy', name: 'Privacy Policy' },
            { path: '/sponsors', name: 'Sponsors' },
            { path: '/terms', name: 'Terms of Service' },
            { path: '/trust-and-safety', name: 'Trust & Safety' },
            { path: '/users/user-1', name: 'Public User Profile (example)' },
            { path: '/what-is-culture', name: 'What is Culture?' },
        ]
    },
    {
        title: 'Authentication',
        pages: [
            { path: '/login', name: 'Login' },
            { path: '/signup', name: 'Signup' },
            { path: '/forgot-password', name: 'Forgot Password' },
        ]
    },
    {
        title: 'User Profile',
        pages: [
            { path: '/profile', name: 'Account Settings' },
            { path: '/messages', name: 'Inbox' },
            { path: '/profile/bookings', name: 'My Bookings' },
            { path: '/profile/referrals', name: 'Referrals' },
            { path: '/profile/wishlist', name: 'Wishlist' },
        ]
    },
    {
        title: 'Host Dashboard',
        pages: [
            { path: '/host', name: 'Dashboard' },
            { path: '/host/bookings', name: 'Bookings' },
            { path: '/host/calendar', name: 'Calendar' },
            { path: '/host/contract', name: 'Contract' },
            { path: '/host/experiences', name: 'Experiences' },
            { path: '/host/experiences/1/edit', name: 'Edit Experience (example)' },
            { path: '/host/payouts', name: 'Payouts' },
        ]
    },
    {
        title: 'Admin Dashboard',
        pages: [
            { path: '/admin', name: 'Dashboard' },
            { path: '/admin/applications', name: 'Applications' },
            { path: '/admin/applications/app-1', name: 'Application Details (example)' },
            { path: '/admin/bookings', name: 'Bookings' },
            { path: '/admin/coupons', name: 'Coupons' },
            { path: '/admin/experiences', name: 'Experiences' },
            { path: '/admin/jobs', name: 'Jobs' },
            { path: '/admin/payouts', name: 'Payouts' },
            { path: '/admin/referrals', name: 'Referrals' },
            { path: '/admin/reports', name: 'Reports' },
            { path: '/admin/settings', name: 'Settings' },
            { path: '/admin/sponsors', name: 'Sponsors' },
            { path: '/admin/stories', name: 'Stories' },
            { path: '/admin/users', name: 'Users' },
            { path: '/admin/users/user-1/edit', name: 'Edit User (example)' },
        ]
    }
];

export default function AllPages() {
  return (
    <div className="py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Application Sitemap</h1>
        <p className="mt-4 text-lg text-muted-foreground">A list of all available pages in this application for easy navigation.</p>
      </div>
      <div className="mt-12 space-y-8">
        {pageGroups.map(group => (
            <Card key={group.title}>
                <CardContent className="p-6">
                    <h2 className="font-headline text-2xl font-semibold mb-4">{group.title}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
                        {group.pages.map((page) => (
                        <Link key={page.path} href={page.path} className="text-primary hover:underline transition-colors">
                            {page.name} <span className="text-muted-foreground font-mono text-xs">({page.path})</span>
                        </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
