import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import { BsDashCircleFill, BsSave } from 'react-icons/bs';
import Button from '@/components/Button';
import IndeterminateCheckbox, {
    CheckboxState,
} from '@/components/IndeterminateCheckbox';
import prisma from '@/lib/prisma';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { BasicProjectData } from '@/types/ProjectData';
import { VoteData } from '@/types/VoteData';

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

    if (!user || !user.isAdmin) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const { id } = context.query;

    let vote;
    if (id && id.length > 0) {
        vote = await prisma.vote.findUnique({
            where: { id: id[0] },
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
            },
        });
    }

    const projects = await prisma.project.findMany({});

    return {
        props: {
            vote: vote
                ? {
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
                  }
                : null,
            projects: projects.map((project) => ({
                id: project.id,
                title: project.title,
            })),
        },
    };
};

export default function EditVote({
    vote,
    projects,
}: {
    vote?: VoteData;
    projects: BasicProjectData[];
}) {
    const [title, setTitle] = React.useState(vote?.title ?? '');
    const [description, setDescription] = React.useState(
        vote?.description ?? '',
    );
    const [linkedForm, setLinkedForm] = React.useState(vote?.linkedForm ?? '');
    const [open, setOpen] = React.useState(vote?.open ?? false);
    const [canVote, setCanVote] = React.useState(
        vote?.canVote.map((project) => project.id) ?? [],
    );
    const [voteFor, setVoteFor] = React.useState(
        vote?.voteFor.map((project) => project.id) ?? [],
    );

    const router = useRouter();
    const discardChanges = () => {
        if (
            confirm(
                `Are you sure you want to cancel and DISCARD any unsaved changes?`,
            )
        ) {
            router.push('/vote');
        }
    };

    const saveChanges = async () => {
        if (!title || title.length === 0) {
            alert('Please enter a title for this vote.');
            return;
        }

        if (!description || description.length === 0) {
            alert('Please enter a description for this vote.');
            return;
        }

        await axios
            .post('/api/votes/update', {
                id: vote?.id,
                title,
                description,
                linkedForm,
                open,
                canVote,
                voteFor,
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

    return (
        <div className="mx-auto max-w-4xl px-8 py-8">
            <Button
                fullWidth
                colorType="admin"
                className="mb-2"
                onClick={saveChanges}
            >
                <BsSave className="mr-4 inline-block h-6 w-6" />
                Save Changes
            </Button>
            <Button
                fullWidth
                colorType="danger"
                className="mb-6"
                onClick={discardChanges}
            >
                <BsDashCircleFill className="mr-4 inline-block h-6 w-6" />
                Cancel
            </Button>

            <div className="mb-2">
                <label
                    htmlFor="projecttitle"
                    className="mb-2 block font-medium text-white"
                >
                    Vote Title
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="projecttitle"
                        placeholder="ex. A guide to Markdown"
                        className="block w-full rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 font-display text-xl font-extrabold text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value.substring(0, 32))
                        }
                    />
                    <span className="absolute right-2 bottom-1 text-xs text-zinc-300">
                        {title.length}/32
                    </span>
                </div>
            </div>

            <div>
                <label
                    htmlFor="description"
                    className=" block font-medium text-white"
                >
                    Description
                </label>
                <label
                    htmlFor="description"
                    className="mb-2 block text-sm text-zinc-400"
                >
                    A short blurb describing this vote. This can include
                    instructions.
                </label>
                <input
                    type="text"
                    id="description"
                    placeholder="ex. Your breakout room's initial vote."
                    className="block w-full rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 font-sans text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <hr className="my-6 h-px border-0 bg-zinc-600" />

            <div>
                <label className="relative inline-flex cursor-pointer items-center">
                    <input
                        type="checkbox"
                        value=""
                        className="peer sr-only"
                        checked={open}
                        onChange={(e) => setOpen(e.target.checked)}
                    />
                    <div className="peer h-7 w-14 rounded-full border-zinc-600 bg-zinc-700 after:absolute after:top-0.5 after:left-[4px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-400" />
                    <span className="ml-3 font-medium text-zinc-300">
                        Open Vote
                    </span>
                </label>
            </div>

            <hr className="my-6 h-px border-0 bg-zinc-600" />

            <div>
                <label
                    htmlFor="linkedform"
                    className="block font-medium text-white"
                >
                    Linked Form
                </label>
                <label
                    htmlFor="linkedform"
                    className="mb-2 block text-sm text-zinc-400"
                >
                    ID of the linked Tally form.
                </label>
                <input
                    type="text"
                    id="linkedform"
                    placeholder="ex. qZbt4F"
                    className="block w-full rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 font-sans text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                    value={linkedForm}
                    onChange={(e) => setLinkedForm(e.target.value)}
                />
                <div className="mt-4 rounded-lg bg-zinc-800 p-4 ring-4 ring-indigo-400">
                    <p className="block text-zinc-200">
                        The linked form <strong>MUST</strong> include three
                        hidden fields titled{' '}
                        <code className="rounded bg-zinc-700 p-1">
                            securityKey
                        </code>
                        , <code className="rounded bg-zinc-700 p-1">email</code>
                        , and{' '}
                        <code className="rounded bg-zinc-700 p-1">voteId</code>.
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
            </div>

            <hr className="my-6 h-px border-0 bg-zinc-600" />

            <div>
                <label className="mb-2 block font-medium text-white">
                    Projects to Vote For
                </label>
                <div className="flex items-center rounded-lg border border-zinc-700 pl-4">
                    <IndeterminateCheckbox
                        id="votefor"
                        className="h-6 w-6 rounded border-zinc-600 bg-zinc-700 text-teal-600 ring-offset-zinc-800 focus:ring-2 focus:ring-teal-600"
                        value={
                            voteFor.length > 0
                                ? voteFor.length === projects.length
                                    ? CheckboxState.CHECKED
                                    : CheckboxState.INDETERMINATE
                                : CheckboxState.UNCHECKED
                        }
                        onChange={(e: any) => {
                            if (e.target.checked) {
                                setVoteFor(
                                    projects.map((project) => project.id),
                                );
                            } else {
                                setVoteFor([]);
                            }
                        }}
                    />
                    <label
                        htmlFor="votefor"
                        className="ml-4 w-full py-2 font-medium text-zinc-300"
                    >
                        Select All
                    </label>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className={`flex items-center rounded-lg border border-zinc-700 bg-zinc-700 py-4 px-4 pl-4 ${
                                voteFor.includes(project.id)
                                    ? 'ring-2 ring-teal-400'
                                    : ''
                            }`}
                        >
                            <input
                                type="checkbox"
                                id={`votefor-${project.id}`}
                                className="h-6 w-6 rounded border-zinc-600 bg-zinc-700 text-teal-600 ring-offset-zinc-800 focus:ring-2 focus:ring-teal-400"
                                checked={voteFor.includes(project.id)}
                                onChange={() => {
                                    if (voteFor.includes(project.id)) {
                                        setVoteFor((oldVal) =>
                                            oldVal.filter(
                                                (id) => id !== project.id,
                                            ),
                                        );
                                    } else {
                                        setVoteFor((oldVal) => [
                                            ...oldVal,
                                            project.id,
                                        ]);
                                    }
                                }}
                            />
                            <div className="ml-4 flex w-full flex-col gap-1">
                                <label
                                    htmlFor={`votefor-${project.id}`}
                                    className="font-medium"
                                >
                                    {project.title}
                                </label>
                                <label
                                    htmlFor={`votefor-${project.id}`}
                                    className="text-sm text-zinc-400"
                                >
                                    {project.id}
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="my-6 h-px border-0 bg-zinc-600" />

            <div>
                <label className="mb-2 block font-medium text-white">
                    Projects that Can Vote
                </label>
                <div className="flex items-center rounded-lg border border-zinc-700 pl-4">
                    <IndeterminateCheckbox
                        id="canvote"
                        className="h-6 w-6 rounded border-zinc-600 bg-zinc-700 text-teal-600 ring-offset-zinc-800 focus:ring-2 focus:ring-teal-400"
                        value={
                            canVote.length > 0
                                ? canVote.length === projects.length
                                    ? CheckboxState.CHECKED
                                    : CheckboxState.INDETERMINATE
                                : CheckboxState.UNCHECKED
                        }
                        onChange={(e: any) => {
                            if (e.target.checked) {
                                setCanVote(
                                    projects.map((project) => project.id),
                                );
                            } else {
                                setCanVote([]);
                            }
                        }}
                    />
                    <label
                        htmlFor="canvote"
                        className="ml-4 w-full py-2 font-medium text-zinc-300"
                    >
                        Select All
                    </label>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className={`flex items-center rounded-lg border border-zinc-700 bg-zinc-700 py-4 px-4 pl-4 ${
                                canVote.includes(project.id)
                                    ? 'ring-2 ring-teal-400'
                                    : ''
                            }`}
                        >
                            <input
                                type="checkbox"
                                id={`canvote-${project.id}`}
                                className="h-6 w-6 rounded border-zinc-600 bg-zinc-700 text-teal-600 ring-offset-zinc-800 focus:ring-2 focus:ring-teal-600"
                                checked={canVote.includes(project.id)}
                                onChange={() => {
                                    if (canVote.includes(project.id)) {
                                        setCanVote((oldVal) =>
                                            oldVal.filter(
                                                (id) => id !== project.id,
                                            ),
                                        );
                                    } else {
                                        setCanVote((oldVal) => [
                                            ...oldVal,
                                            project.id,
                                        ]);
                                    }
                                }}
                            />
                            <div className="ml-4 flex w-full flex-col gap-1">
                                <label
                                    htmlFor={`canvote-${project.id}`}
                                    className="font-medium"
                                >
                                    {project.title}
                                </label>
                                <label
                                    htmlFor={`canvote-${project.id}`}
                                    className="text-sm text-zinc-400"
                                >
                                    {project.id}
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
