import { BsList, BsPersonCircle } from 'react-icons/bs';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import logo from '@/public/logo.svg';
import Button from './Button';

export default function Header() {
    const [menuOpen, setMenuOpen] = React.useState(false);

    const router = useRouter();
    const { data: session } = useSession();

    return (
        <nav className="sticky top-0 z-50 rounded-b border-b border-zinc-700 bg-zinc-900  px-8 py-2.5 shadow-md shadow-zinc-800/30">
            <div className="flex flex-wrap items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image
                        className="mr-5 h-16 w-12"
                        src={logo}
                        width={100}
                        alt=""
                    />
                    <span className="self-center whitespace-nowrap font-display text-2xl font-bold ">
                        Bashboard
                    </span>
                </Link>
                <button
                    data-collapse-toggle="navbar-default"
                    type="button"
                    className="ml-3 inline-flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-600 md:hidden md:p-0"
                    aria-controls="navbar-default"
                    aria-expanded="false"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span className="sr-only">Open main menu</span>
                    <BsList className="h-6 w-6" />
                </button>

                <div
                    className={`${
                        menuOpen ? '' : 'max-md:hidden'
                    } flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:justify-between md:gap-4`}
                    id="navbar-default"
                >
                    <ul className="mt-4 flex flex-col gap-1 rounded border border-zinc-700 bg-zinc-900  p-4 md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-transparent md:text-lg md:font-medium">
                        {session && (
                            <li>
                                <Link
                                    href="/"
                                    className={`${
                                        router.pathname === '/' ||
                                        router.pathname === '/edit' ||
                                        router.pathname === '/admin'
                                            ? 'bg-teal-700 text-white hover:bg-teal-800'
                                            : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    } block rounded py-2 pl-3 pr-4 md:bg-transparent md:p-0 md:hover:bg-transparent`}
                                    aria-current="page"
                                >
                                    My Project
                                </Link>
                            </li>
                        )}
                        <li>
                            <Link
                                href="/projects"
                                className={`${
                                    router.pathname.startsWith('/projects')
                                        ? 'bg-teal-700 text-white hover:bg-teal-800'
                                        : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                } block rounded py-2 pl-3 pr-4 md:bg-transparent md:p-0 md:hover:bg-transparent`}
                            >
                                Projects
                            </Link>
                        </li>
                        {session && (
                            <li>
                                <Link
                                    href="/info"
                                    className={`${
                                        router.pathname.startsWith('/info')
                                            ? 'bg-teal-700 text-white hover:bg-teal-800'
                                            : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    } block rounded py-2 pl-3 pr-4 md:bg-transparent md:p-0 md:hover:bg-transparent`}
                                >
                                    Info
                                </Link>
                            </li>
                        )}
                        {session && (
                            <li>
                                <Link
                                    href="/vote"
                                    className={`${
                                        router.pathname.startsWith('/vote')
                                            ? 'bg-teal-700 text-white hover:bg-teal-800'
                                            : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    } block rounded py-2 pl-3 pr-4 md:bg-transparent md:p-0 md:hover:bg-transparent`}
                                >
                                    Vote
                                </Link>
                            </li>
                        )}
                    </ul>

                    {session ? (
                        <Link href="/account">
                            <Button colorType="gray">
                                <BsPersonCircle className="inline-block h-6 w-6" />
                                <span className="sr-only">Account</span>
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={() => {
                                signIn(undefined, { callbackUrl: '/welcome' });
                            }}
                        >
                            Sign In
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
}
