import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import Button from '@/components/Button';
import prisma from '@/lib/prisma';
import { SimpleBallot } from '@/types/VoteData';
import { authOptions } from '../api/auth/[...nextauth]';
import { VoteTypeStrings } from '@/lib/textutils';

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
                    type: ballot.vote.type,
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

                        const IconFunc = VoteTypeStrings[ballot.vote.type].icon;

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
                                <div className="flex flex-row items-center gap-4">
                                    <div
                                        className={`${
                                            VoteTypeStrings[ballot.vote.type]
                                                .color
                                        } flex h-14 w-14 items-center justify-center rounded-lg`}
                                    >
                                        <IconFunc className="h-8 w-8" />
                                    </div>
                                    <p className="flex-1 text-xl font-medium">
                                        {ballot.vote.title}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 md:flex-row">
                                    {button}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="mb-4">No votes yet. 🥲</p>
            )}
        </div>
    );
}
