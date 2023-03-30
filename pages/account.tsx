import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import React from 'react';
import { BsBoxArrowLeft, BsDashCircleFill, BsSave } from 'react-icons/bs';
import Button from '@/components/Button';
import prisma from '@/lib/prisma';
import { BasicUserDataWithProjectId } from '@/types/UserData';
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

    return {
        props: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                projectId: user.projectId,
            },
        },
    };
};

export default function Account({
    user,
}: {
    user: BasicUserDataWithProjectId;
}) {
    const [name, setName] = React.useState(user.name ?? '');
    const router = useRouter();

    const updateUser = async () => {
        if (!name || name.length === 0) {
            alert(
                "Please enter your name.\nYou'll want this for your teammates to be able to identify you.",
            );
            return;
        }

        try {
            await axios.post('/api/account', { name });
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again later.');
        }
    };

    const leaveTeam = async () => {
        if (confirm('Are you sure you want to leave your team?')) {
            try {
                await axios.post('/api/projects/leave');
                router.push('/');
            } catch (error) {
                console.error(error);
                alert('Something went wrong. Please try again later.');
            }
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-8 py-8">
            <h1 className="mb-4 font-display text-4xl font-extrabold">
                Your Account
            </h1>

            {user.isAdmin && (
                <div className="mb-4 rounded-xl border-4 border-indigo-700 py-2 px-4">
                    You are an administrator. Administrator actions are purple.
                    <br />
                    Go to &quot;Admin&quot; to access the administration panel.
                </div>
            )}

            <div className="mb-4">
                <label
                    htmlFor="projecttitle"
                    className=" mb-2 block font-medium text-white"
                >
                    Your Name
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
                <BsSave className="mr-4 inline-block h-6 w-6" />
                Save Changes
            </Button>

            {user.projectId && (
                <>
                    <hr className="my-6 h-px border-0 bg-zinc-600" />

                    <h2 className="font-display text-2xl font-semibold">
                        Your Team
                    </h2>
                    <label className="mb-4 block text-sm text-zinc-400">
                        You won&apos;t be able to rejoin unless you are invited
                        again.
                    </label>
                    <Button fullWidth colorType="danger" onClick={leaveTeam}>
                        <BsDashCircleFill className="mr-4 inline-block h-6 w-6" />
                        Leave Team
                    </Button>
                </>
            )}

            <hr className="my-6 h-px border-0 bg-zinc-600" />

            <Button fullWidth colorType="gray" onClick={signOut}>
                <BsBoxArrowLeft className="mr-4 inline-block h-6 w-6" />
                Log Out
            </Button>
        </div>
    );
}
