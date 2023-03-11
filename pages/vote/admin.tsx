import Button from '@/components/Button';
import prisma from '@/lib/prisma';
import { PostData } from '@/types/PostData';
import { BasicUserData } from '@/types/UserData';
import { BasicVoteData, SimpleBallot } from '@/types/VoteData';
import { Post } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { BsChevronRight, BsPencil, BsPlusCircle } from 'react-icons/bs';
import { authOptions } from '../api/auth/[...nextauth]';

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
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    if (!user.isAdmin) {
        return {
            redirect: {
                destination: '/vote',
                permanent: false,
            },
        };
    }

    const votes = await prisma.vote.findMany();

    return {
        props: {
            votes: votes.map((vote) => ({
                id: vote.id,
                title: vote.title,
                open: vote.open,
            })),
        },
    };
};

export default function Votes({ votes }: { votes: BasicVoteData[] }) {
    return (
        <div className="mx-auto max-w-4xl px-8 py-8">
            <h1 className="mb-4 font-display text-4xl font-extrabold">Votes</h1>

            <Link href="/vote/edit">
                <Button
                    alignedLeft
                    fullWidth
                    colorType="admin"
                    className="mb-6"
                >
                    <BsPlusCircle className="mr-4 inline-block h-6 w-6" />
                    Create Vote
                </Button>
            </Link>

            {votes.length > 0 ? (
                <div className="flex flex-col">
                    {votes.map((vote, index, array) => {
                        return (
                            <div
                                className={`flex flex-row items-center justify-between border border-zinc-400 bg-zinc-700 px-4 py-4 ${
                                    index === 0 ? 'rounded-t-lg' : ''
                                } ${
                                    index === array.length - 1
                                        ? 'rounded-b-lg'
                                        : ''
                                }`}
                                key={vote.id}
                            >
                                <p className="text-xl font-medium">
                                    {vote.title}
                                </p>
                                <div className="flex flex-row items-center gap-2">
                                    {vote.open ? '(Open)' : '(Closed)'}
                                    <Link
                                        className="ml-4"
                                        href={`/vote/inspect/${vote.id}`}
                                    >
                                        <Button colorType="primary">
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <>
                    <p className="mb-4">No votes yet. 🥲</p>
                </>
            )}
        </div>
    );
}
