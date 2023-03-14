import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import { BsArrowRight } from 'react-icons/bs';
import { Prisma } from '@prisma/client';
import { BasicUserData } from '@/types/UserData';
import prisma from '@/lib/prisma';
import Button from '@/components/Button';
import { authOptions } from './api/auth/[...nextauth]';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions,
    );

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return {
            notFound: true,
        };
    }

    // If this is the first user OR is on the admin list, make them an admin
    const userCount = await prisma.user.count();
    const adminUsers =
        ((
            await prisma.systemConfigSetting.findUnique({
                where: { key: 'adminUsers' },
            })
        )?.value as Prisma.JsonArray) ?? [];

    // are they in the list
    if (adminUsers.includes(user.email)) {
        await prisma.user.update({
            where: { id: user.id },
            data: { isAdmin: true },
        });
    } else if (userCount === 1) {
        // then are they the first user
        await prisma.user.update({
            where: { id: user.id },
            data: { isAdmin: true },
        });

        // add this user to the admin list too
        await prisma.systemConfigSetting.upsert({
            where: { key: 'adminUsers' },
            update: {
                value: [user.email],
            },
            create: {
                key: 'adminUsers',
                value: [user.email],
            },
        });
    }

    if (user.name && user.name.length > 0) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    return {
        props: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
        },
    };
};

export default function Account({ user }: { user: BasicUserData }) {
    const [name, setName] = React.useState(user.name ?? '');
    const router = useRouter();

    const updateUser = async () => {
        if (!name || name.length === 0) {
            alert(
                "Please enter your name to continue.\nYou'll want this for your teammates to be able to identify you.",
            );
            return;
        }

        try {
            await axios.post('/api/account', { name });
            router.push('/');
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again later.');
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-8 py-8">
            <h1 className="mb-2 font-display text-4xl font-extrabold">
                Hi there!
            </h1>
            <p className="mb-4">
                Let&apos;s get to know you before we continue.
            </p>
            <div className="mb-4">
                <label
                    htmlFor="projecttitle"
                    className="block font-medium text-white"
                >
                    Your Name
                </label>
                <label className="mb-2 block text-sm text-zinc-400">
                    You can change this at any time on your account page.
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="projecttitle"
                        placeholder="ex. John Dymek Jacob"
                        className="block w-full rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value.substring(0, 32))
                        }
                    />
                    <span className="absolute right-2 bottom-1 text-xs text-zinc-300">
                        {name.length}/32
                    </span>
                </div>
            </div>

            <div className="mb-6">
                <label
                    htmlFor="projecttitle"
                    className="block font-medium text-white"
                >
                    Your Email
                </label>
                <label className="mb-2 block text-sm text-zinc-400">
                    Talk to an event organizer if you really need to change your
                    email.
                </label>
                <input
                    type="text"
                    id="projecttitle"
                    disabled
                    readOnly
                    placeholder="ex. team@beantownbash.org"
                    className="block w-full rounded-lg border border-zinc-600 bg-zinc-700 p-2.5 text-white"
                    value={user.email}
                />
            </div>

            <Button fullWidth onClick={updateUser}>
                Next
                <BsArrowRight className="ml-4 inline-block h-6 w-6" />
            </Button>
        </div>
    );
}
