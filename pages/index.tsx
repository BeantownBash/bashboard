import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import {
    BsArrowClockwise,
    BsCheck,
    BsCollectionFill,
    BsGithub,
    BsLink45Deg,
    BsPersonCircle,
    BsPlusCircle,
    BsX,
    BsYoutube,
} from 'react-icons/bs';
import { BasicUserData } from '@/types/UserData';
import { ProjectData, TeamInviteDataWithProject } from '@/types/ProjectData';
import { selectRandomPlaceholder } from '@/lib/utils';
import prisma from '@/lib/prisma';
import MarkdownWithPlugins from '@/components/MarkdownWithPlugins';
import Button from '@/components/Button';
import { authOptions } from './api/auth/[...nextauth]';
import { TagStrings } from '@/lib/textutils';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions,
    );

    if (!session) {
        return {
            props: {
                loggedIn: false,
            },
        };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            invites: {
                include: {
                    project: true,
                },
            },
            project: {
                include: {
                    extraLinks: true,
                    logo: true,
                    banner: true,
                    members: true,
                },
            },
        },
    });

    if (!user) {
        return {
            notFound: true,
        };
    }

    if (user.isAdmin) {
        return {
            redirect: {
                destination: '/admin',
                permanent: false,
            },
        };
    }

    const allowEditing =
        (await prisma.systemConfigSetting.findUnique({
            where: {
                key: 'allowEditing',
            },
        })) ?? true;

    return {
        props: {
            loggedIn: true,
            allowEditing,
            user: {
                id: user.id,
                name: user.name || '',
                email: user.email,
                isAdmin: user.isAdmin,
            },
            invites: user.invites.map((invite) => ({
                id: invite.id,
                project: {
                    id: invite.project.id,
                    title: invite.project.title,
                },
            })),
            project: user.project
                ? {
                      id: user.project.id,
                      title: user.project.title,
                      tagline: user.project.tagline,
                      description: user.project.description,
                      tags: user.project.tags,
                      extraLinks: user.project.extraLinks,
                      githubLink: user.project.githubLink,
                      websiteLink: user.project.websiteLink,
                      videoLink: user.project.videoLink,
                      logo: user.project.logo
                          ? {
                                id: user.project.logo?.id,
                                url: user.project.logo?.url,
                            }
                          : null,
                      banner: user.project.banner
                          ? {
                                id: user.project.banner?.id,
                                url: user.project.banner?.url,
                            }
                          : null,
                      members: user.project.members.map((member) => ({
                          id: member.id,
                          name: member.name,
                          email: member.email,
                          isAdmin: member.isAdmin,
                      })),
                  }
                : null,
        },
    };
};

export default function Home({
    allowEditing,
    loggedIn,
    invites,
    project,
}: {
    allowEditing: boolean;
    loggedIn: boolean;
    invites: TeamInviteDataWithProject[];
    user?: BasicUserData;
    project?: ProjectData;
}) {
    const router = useRouter();
    const [teamLoading, setTeamLoading] = React.useState(false);

    if (!loggedIn) {
        return (
            <div className="mx-auto max-w-4xl px-8 py-8">
                <h1 className="mb-4 font-display text-4xl font-extrabold">
                    Welcome!
                </h1>

                <button
                    type="button"
                    onClick={() => {
                        signIn(undefined, { callbackUrl: '/welcome' });
                    }}
                    className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-teal-700 px-8 py-8 text-2xl font-medium hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-400"
                >
                    <BsPersonCircle className="mr-4 inline-block h-8 w-8" />
                    Sign In
                </button>
                <label className="mt-1 block text-sm text-zinc-400">
                    You <strong>must</strong> sign in with the email address you
                    used to register for the event. If this is a problem, please
                    talk to an organizer.
                </label>
                <h2 className="my-4 text-center font-display text-2xl font-semibold">
                    OR
                </h2>
                <Link
                    href="/projects"
                    className="flex w-full items-center justify-center rounded-lg bg-emerald-700 px-8 py-8 text-2xl font-medium hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-400"
                >
                    <BsCollectionFill className="mr-4 inline-block h-8 w-8" />
                    Explore Projects
                </Link>
            </div>
        );
    }

    const createProject = async () => {
        try {
            setTeamLoading(true);
            await axios.post('/api/projects/create');
            router.push('/edit');
        } catch (e) {
            console.error(e);
            alert('Failed to create project. Please try again later.');
        }
    };

    const acceptInvite = async (id: string) => {
        try {
            await axios.post('/api/projects/invites/accept', { id });
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Failed to accept invite. Please try again later.');
        }
    };

    const rejectInvite = async (id: string) => {
        try {
            await axios.post('/api/projects/invites/reject', { id });
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Failed to reject invite. Please try again later.');
        }
    };

    if (!project) {
        return (
            <div className="mx-auto max-w-4xl px-8 py-8">
                <h1 className="mb-4 font-display text-4xl font-extrabold">
                    Welcome!
                </h1>

                <p className="mb-4">You don&apos;t have a project yet.</p>

                {allowEditing &&
                    (!teamLoading ? (
                        <button
                            type="button"
                            onClick={createProject}
                            className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-emerald-700 px-8 py-8 text-2xl font-medium hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-400"
                        >
                            <BsPlusCircle className="mr-4 inline-block h-8 w-8" />
                            Create a Project
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-emerald-700 px-8 py-8 text-2xl font-medium hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-400"
                        >
                            <BsArrowClockwise className="mr-4 inline-block h-8 w-8" />
                            Loading...
                        </button>
                    ))}

                <h2 className="mt-6 font-display text-2xl font-semibold">
                    Project Invites
                </h2>
                <label className="mb-4 block text-sm text-zinc-400">
                    Or wait patiently for someone to invite you to their
                    project...
                </label>

                {invites.length > 0 ? (
                    <div className="flex flex-col">
                        {invites.map((invite, index, array) => (
                            <div
                                className={`flex flex-row items-center justify-between border border-zinc-400 bg-zinc-700 px-4 py-4 ${
                                    index === 0 ? 'rounded-t-lg' : ''
                                } ${
                                    index === array.length - 1
                                        ? 'rounded-b-lg'
                                        : ''
                                }`}
                                key={invite.id}
                            >
                                <p className="text-xl font-medium">
                                    {invite.project.title}
                                </p>
                                <div className="flex flex-col gap-2 md:flex-row">
                                    <Button
                                        colorType="success"
                                        onClick={() => {
                                            acceptInvite(invite.id);
                                        }}
                                    >
                                        <BsCheck className="inline-block h-8 w-8" />
                                    </Button>
                                    <Button
                                        colorType="danger"
                                        onClick={() => {
                                            rejectInvite(invite.id);
                                        }}
                                    >
                                        <BsX className="inline-block h-8 w-8" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mb-4">You don&apos;t have any invites yet.</p>
                )}
            </div>
        );
    }

    const members: React.ReactNode[] = [];
    project.members.forEach((member, index) => {
        if (index > 0) {
            if (index === project.members.length - 1) {
                if (project.members.length === 2) {
                    members.push(' and ');
                } else {
                    members.push(', and ');
                }
            } else {
                members.push(', ');
            }
        }
        members.push(
            <Link
                href={`/user/${member.id}`}
                className="text-blue-400 hover:underline"
                key={member.id}
            >
                {member.name}
            </Link>,
        );
    });

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-8 py-8 md:flex-row">
            <aside className="flex flex-none flex-col gap-8 sm:max-md:flex-row md:w-52">
                <div className="mx-auto aspect-square overflow-hidden rounded-2xl bg-teal-200/50">
                    {project.logo ? (
                        <Image
                            src={project.logo.url}
                            alt=""
                            width={512}
                            height={512}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <Image
                            src={selectRandomPlaceholder(project.id)}
                            alt=""
                            width={512}
                            height={512}
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-8">
                    {allowEditing && (
                        <Link href="/edit">
                            <Button className="w-full">Edit</Button>
                        </Link>
                    )}

                    {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {project.tags.map((tag) => (
                                <div
                                    key={tag}
                                    className={`${TagStrings[tag].color} rounded-full py-1 px-6`}
                                >
                                    {TagStrings[tag].name}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        {project.githubLink && (
                            <a href={project.githubLink}>
                                <Button colorType="gray" alignedLeft fullWidth>
                                    <BsGithub className="mr-4 inline-block h-6 w-6" />
                                    GitHub
                                </Button>
                            </a>
                        )}
                        {project.websiteLink && (
                            <a href={project.websiteLink}>
                                <Button colorType="gray" alignedLeft fullWidth>
                                    <BsLink45Deg className="mr-4 inline-block h-6 w-6" />
                                    Website
                                </Button>
                            </a>
                        )}
                        {project.videoLink && (
                            <a href={project.videoLink}>
                                <Button colorType="gray" alignedLeft fullWidth>
                                    <BsYoutube className="mr-4 inline-block h-6 w-6" />
                                    Video
                                </Button>
                            </a>
                        )}
                        {project.extraLinks.map((link) => (
                            <a href={link.url} key={link.id}>
                                <Button colorType="gray" alignedLeft fullWidth>
                                    <BsLink45Deg className="mr-4 inline-block h-6 w-6" />
                                    {link.name}
                                </Button>
                            </a>
                        ))}
                    </div>
                </div>
            </aside>
            <main className="flex-1">
                <h1 className="font-display text-4xl font-extrabold">
                    {project.title}
                </h1>
                {project.tagline && (
                    <h2 className="mb-2 font-sans text-2xl font-semibold">
                        {project.tagline}
                    </h2>
                )}
                <p className="mb-4 italic">Created by {members}</p>
                {project.banner && (
                    <div className="mb-4 aspect-video w-full overflow-hidden rounded-2xl bg-teal-200/50">
                        <Image
                            src={project.banner.url}
                            alt=""
                            width={1280}
                            height={720}
                            className="h-full w-full object-contain"
                        />
                    </div>
                )}

                <MarkdownWithPlugins
                    content={
                        project.description ?? 'No project description set.'
                    }
                />
            </main>
        </div>
    );
}
