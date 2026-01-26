
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, Menu, User as UserIcon, LayoutDashboard, Heart, CalendarCheck, MessageSquare, Wallet } from "lucide-react";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { ADMIN_UID } from "@/lib/auth";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { NotificationsDropdown } from "@/components/notifications-dropdown";

const navLinks = [
  { href: "/discover", label: "Discover" },
  { href: "/become-a-host", label: "Become a Host" },
];

export function Header() {
  const { user, isUserLoading, firestore, auth } = useFirebase();

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };
  
  const userDocRef = useMemoFirebase(() => {
    if (firestore && user) {
      return doc(firestore, "users", user.uid);
    }
    return null;
  }, [firestore, user]);
  const { data: userProfile } = useDoc<User>(userDocRef);
  const isHost = userProfile?.role === 'host' || userProfile?.role === 'both';
  const isAdmin = user?.uid === ADMIN_UID;
  const userImage = userProfile ? PlaceHolderImages.find(p => p.id === userProfile.profilePhotoId) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo className="text-primary-foreground" />
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              {link.label}
            </Link>
          ))}
           {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                Admin
              </Link>
            )}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {isUserLoading ? (
            <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-0.5">
              <NotificationsDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary-foreground/10">
                    <Avatar className="h-10 w-10">
                      {userImage ? (
                        <AvatarImage src={userImage.imageUrl} alt={user.displayName || 'User'} />
                      ) : null}
                      <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || 'Go2Culture User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/messages">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Inbox</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/profile/bookings">
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        <span>My Reservations</span>
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/profile/wishlist">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>My Wishlist</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/profile/referrals">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Refer a Friend</span>
                      </Link>
                    </DropdownMenuItem>
                    {isHost && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/host">
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              <span>Host Dashboard</span>
                          </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                 {isAdmin && (
                    <Link href="/admin" className="text-lg font-medium">Admin</Link>
                 )}
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                  {user ? (
                     <>
                      <Button variant="ghost" className="w-full justify-start text-lg font-medium" asChild>
                        <Link href="/messages">Inbox</Link>
                      </Button>
                       <Button variant="ghost" className="w-full justify-start text-lg font-medium" asChild>
                        <Link href="/profile/bookings">My Reservations</Link>
                      </Button>
                       <Button variant="ghost" className="w-full justify-start text-lg font-medium" asChild>
                        <Link href="/profile/wishlist">My Wishlist</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-lg font-medium" asChild>
                        <Link href="/profile">Account Settings</Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-lg font-medium" asChild>
                        <Link href="/profile/referrals">Refer a Friend</Link>
                      </Button>
                      {isHost && (
                         <Button variant="ghost" className="w-full justify-start text-lg font-medium" asChild>
                           <Link href="/host">Host Dashboard</Link>
                         </Button>
                      )}
                      <Button variant="ghost" className="w-full justify-start text-lg font-medium" onClick={handleLogout}>Log Out</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/login">Log In</Link>
                      </Button>
                      <Button className="w-full justify-start" asChild>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
