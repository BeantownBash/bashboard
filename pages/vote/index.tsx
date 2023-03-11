import Button from '@/components/Button';
import prisma from '@/lib/prisma';
import { PostData } from '@/types/PostData';
import { BasicUserData } from '@/types/UserData';
import { SimpleBallot } from '@/types/VoteData';
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

    if (user.isAdmin) {
        return {
            redirect: {
                destination: '/vote/admin',
                permanent: false,
            },
        };
    }

    const ballots = await prisma.ballot.findMany({
        where: {
            user: {
                email: session.user.email,
            },
        },
        include: {
            vote: true,
        },
    });

    return {
        props: {
            ballots: ballots.map((ballot) => ({
                vote: {
                    id: ballot.vote.id,
                    title: ballot.vote.title,
                    open: ballot.vote.open,
                },
                isCast: ballot.isCast,
            })),
        },
    };
};

export default function Votes({ ballots }: { ballots: SimpleBallot[] }) {
    return (
        <div className="mx-auto max-w-4xl px-8 py-8">
            <h1 className="mb-4 font-display text-4xl font-extrabold">Votes</h1>

            {ballots.length > 0 ? (
                <div className="flex flex-col">
                    {ballots.map((ballot, index, array) => {
                        let button;

                        if (ballot.isCast) {
                            button = (
                                <Button colorType="graydisabled" disabled>
                                    Vote Cast
                                </Button>
                            );
                        } else if (!ballot.vote.open) {
                            button = (
                                <Button colorType="graydisabled" disabled>
                                    Vote Closed
                                </Button>
                            );
                        } else {
                            button = (
                                <Link href={`/vote/${ballot.vote.id}`}>
                                    <Button colorType="primary">Vote</Button>
                                </Link>
                            );
                        }

                        return (
                            <div
                                className={`flex flex-row items-center justify-between border border-zinc-400 bg-zinc-700 px-4 py-4 ${
                                    index === 0 ? 'rounded-t-lg' : ''
                                } ${
                                    index === array.length - 1
                                        ? 'rounded-b-lg'
                                        : ''
                                }`}
                                key={ballot.vote.id}
                            >
                                <p className="text-xl font-medium">
                                    {ballot.vote.title}
                                </p>
                                <div className="flex flex-col gap-2 md:flex-row">
                                    {button}
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
