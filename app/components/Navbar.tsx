"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Button from "@/app/components/Button";
import ProfileImage from "@/app/components/ProfileImage";
import Image from "next/image";

const Navbar = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-white shadow-md sticky top-0 z-50">
        <div className="flex justify-between items-center p-4 md:px-8 lg:px-16 w-full rounded-tr-lg rounded-tl-lg">
          {/* Logo Section */}
          <section className="flex-shrink-0">
            <Link href="/" className="block">
              <Image
                src="/logo.png"
                alt="App Logo"
                width={180}
                height={48}
                className="h-10 w-auto md:h-16 md:w-[300px] object-contain"
                priority
              />
            </Link>
          </section>

          {/* Desktop Nav */}
          <section className="hidden md:flex flex-1 justify-end items-center space-x-6">
            <Link href="/create">
              <span className="font-semibold text-base md:text-xl hover:underline">Create</span>
            </Link>

            {session?.user ? (
              <Button onclick={() => signOut()}>Sign Out</Button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button onclick={() => {}}>Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button onclick={() => {}}>Register</Button>
                </Link>
              </div>
            )}

            <Link href="/">
              <div className="flex flex-col-reverse items-center w-16 md:w-20">
                <span className="text-xs md:text-base truncate">
                  {session?.user?.name}
                </span>
                <div className="h-10 w-10 md:h-14 md:w-14 bg-blue-300 rounded-full overflow-hidden">
                  <ProfileImage
                    path={session?.user?.image ?? null}
                    height={144}
                    width={144}
                  />
                </div>
              </div>
            </Link>
          </section>

          {/* Mobile Nav Toggle */}
          <section className="md:hidden flex items-center">
            <button
              className="focus:outline-none"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              aria-expanded={menuOpen}
            >
              <svg
                width={32}
                height={32}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  // Close icon
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  // Burger menu
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 8h16M4 16h16"
                  />
                )}
              </svg>
            </button>
          </section>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 pt-4 pb-6 space-y-4 shadow-md animate-slide-down rounded-b-xl">
            <Link href="/create" onClick={() => setMenuOpen(false)}>
              <span className="block font-semibold text-lg mb-3 hover:underline">Create</span>
            </Link>
            {session?.user ? (
              <Button
                onclick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
              >
                Sign Out
              </Button>
            ) : (
              <div className="flex flex-col gap-2 mb-3">
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <Button onclick={() => {}}>Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <Button onclick={() => {}}>Register</Button>
                </Link>
              </div>
            )}

            <Link href="/" onClick={() => setMenuOpen(false)}>
              <div className="flex flex-col-reverse items-center w-16 mx-auto">
                <span className="text-xs truncate">{session?.user?.name}</span>
                <div className="h-10 w-10 bg-blue-300 rounded-full overflow-hidden">
                  <ProfileImage
                    path={session?.user?.image ?? null}
                    height={144}
                    width={144}
                  />
                </div>
              </div>
            </Link>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
