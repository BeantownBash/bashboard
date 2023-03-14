import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { BsClipboard, BsDashCircleFill, BsPencil } from 'react-icons/bs';
import Button from '@/components/Button';
import prisma from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { VoteDataWithBallotsAndKeys } from '@/types/VoteData';
import { VoteTypeStrings } from '@/lib/textutils';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.query;

    if (!id || typeof id !== 'string' || id.length === 0) {
        return {
            notFound: true,
        };
    }

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

    if (!user || !user.isAdmin) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const vote = await prisma.vote.findUnique({
        where: { id },
        include: {
            canVote: {
                select: {
                    id: true,
                    title: true,
                },
            },
            voteFor: {
                select: {
                    id: true,
                    title: true,
                },
            },
            ballots: {
                select: {
                    isCast: true,
                    securityKey: true,
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
            },
        },
    });

    if (!vote) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            vote: {
                id: vote.id,
                title: vote.title,
                description: vote.description ?? '',
                linkedForm: vote.linkedForm,
                canVote: vote.canVote.map((project) => ({
                    id: project.id,
                    title: project.title,
                })),
                voteFor: vote.voteFor.map((project) => ({
                    id: project.id,
                    title: project.title,
                })),
                open: vote.open,
                ballots: vote.ballots,
                type: vote.type,
            },
        },
    };
};

export default function InspectVote({
    vote,
}: {
    vote: VoteDataWithBallotsAndKeys;
}) {
    const router = useRouter();
    const deleteVote = async () => {
        await axios
            .post('/api/votes/delete', {
                id: vote.id,
            })
            .then(() => {
                router.push('/vote');
            })
            .catch((e) => {
                console.error(e);
                alert(
                    'An error occurred while saving your changes. Please try again later.',
                );
            });
    };

    let securityKeys = '';
    vote.ballots.forEach((ballot, index) => {
        securityKeys += `${index !== 0 ? '\n' : ''}${ballot.user.email}\t${
            ballot.securityKey
        }`;
    });

    const IconFunc = VoteTypeStrings[vote.type].icon;

    return (
        <div className="mx-auto max-w-4xl px-8 py-8">
            <Link href="/vote">
                <Button
                    alignedLeft
                    fullWidth
                    colorType="transparent"
                    className="mb-6"
                >
                    ← Go back to all votes
                </Button>
            </Link>

            <Link href={`/vote/edit/${vote.id}`}>
                <Button fullWidth colorType="admin" className="mb-2">
                    <BsPencil className="mr-4 inline-block h-6 w-6" />
                    Edit Vote
                </Button>
            </Link>

            <Button
                fullWidth
                colorType="danger"
                className="mb-6"
                onClick={deleteVote}
            >
                <BsDashCircleFill className="mr-4 inline-block h-6 w-6" />
                Delete Vote
            </Button>

            <div className="mt-8 mb-4 flex flex-row items-center gap-4">
                <div
                    className={`${
                        VoteTypeStrings[vote.type].color
                    } flex h-14 w-14 items-center justify-center rounded-lg`}
                >
                    <IconFunc className="h-8 w-8" />
                </div>
                <h1 className="flex-1 font-display text-4xl font-extrabold">
                    {vote.title}
                </h1>
            </div>

            <p className="mb-4">{vote.description}</p>

            <div className="mb-8 rounded-lg bg-zinc-800 p-4 ring-4 ring-indigo-400">
                <p className="block text-zinc-200">
                    The linked form <strong>MUST</strong> include three hidden
                    fields titled{' '}
                    <code className="rounded bg-zinc-700 p-1">securityKey</code>
                    , <code className="rounded bg-zinc-700 p-1">email</code>,
                    and <code className="rounded bg-zinc-700 p-1">voteId</code>.
                </p>
                <p className="block text-zinc-200">
                    This form must have a webhook integration pointed to{' '}
                    <pre className="inline">
                        <code className="rounded bg-zinc-700 p-1">
                            https://my.beantownbash.org/api/votes/webhook
                        </code>
                    </pre>
                    .
                </p>
            </div>

            <div>
                <h2 className="mb-4 text-2xl font-medium">Votes Cast</h2>

                <div className="text-xl">
                    <span className="rounded-lg border-2 border-teal-800 px-4 py-2">
                        {vote.ballots.reduce((accumulator, currentValue) => {
                            if (currentValue.isCast) {
                                return accumulator + 1;
                            }
                            return accumulator;
                        }, 0)}
                    </span>
                    <span className="mx-4">/</span>
                    <span className="rounded-lg border-2 border-teal-500 px-4 py-2">
                        {vote.ballots.length}
                    </span>
                </div>
            </div>

            <div>
                <h2 className="mt-4 mb-2 text-2xl font-medium">
                    Projects to Vote For
                </h2>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {vote.voteFor.map((project) => (
                        <div
                            key={project.id}
                            className="rounded-lg border border-zinc-600 bg-zinc-700 py-2 px-4"
                        >
                            {project.title}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="mt-4 mb-2 text-2xl font-medium">
                    Projects that Can Vote
                </h2>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {vote.canVote.map((project) => (
                        <div
                            key={project.id}
                            className="rounded-lg border border-zinc-600 bg-zinc-700 py-2 px-4"
                        >
                            {project.title}
                        </div>
                    ))}
                </div>
            </div>

            <hr className="my-6 h-px border-0 bg-zinc-600" />

            <div>
                <h2 className="mt-4 mb-2 text-2xl font-medium">
                    Security Keys
                </h2>
                <Button
                    className="my-2"
                    fullWidth
                    onClick={() => {
                        navigator.clipboard.writeText(securityKeys);
                        alert('Copied!');
                    }}
                >
                    <BsClipboard className="mr-4 inline-block h-6 w-6" />
                    Copy
                </Button>
                <textarea
                    rows={20}
                    // className="block w-full border-none bg-zinc-800 p-2.5 text-white placeholder-zinc-400 focus:ring-0"
                    className="block w-full rounded-lg border border-zinc-600 bg-zinc-700 p-2.5 font-sans text-white"
                    value={securityKeys}
                    disabled
                />
            </div>
        </div>
    );
}
