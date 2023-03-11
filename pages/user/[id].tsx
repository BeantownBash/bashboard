import Button from '@/components/Button';
import MarkdownWithPlugins from '@/components/MarkdownWithPlugins';
import prisma from '@/lib/prisma';
import { PostData } from '@/types/PostData';
import { LightProjectData } from '@/types/ProjectData';
import { Post } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import {
    BsChevronRight,
    BsGithub,
    BsLink45Deg,
    BsYoutube,
} from 'react-icons/bs';
import Image from 'next/image';
import { selectRandomPlaceholder } from '@/lib/utils';
import { useRouter } from 'next/router';
import { BasicUserData } from '@/types/UserData';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.query;

    if (!id || typeof id !== 'string') {
        return {
            notFound: true,
        };
    }

    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!user) {
        return {
            notFound: true,
        };
    }

    const projects = await prisma.project.findMany({
        where: {
            members: {
                some: {
                    id: context.query.id as string,
                },
            },
        },
        include: {
            logo: true,
        },
    });

    return {
        props: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
            projects: projects.map((project) => ({
                id: project.id,
                title: project.title,
                tagline: project.tagline,
                description: project.description,
                githubLink: project.githubLink,
                websiteLink: project.websiteLink,
                videoLink: project.videoLink,
                logo: project.logo
                    ? {
                          id: project.logo?.id,
                          url: project.logo?.url,
                      }
                    : null,
            })),
        },
    };
};

export default function Projects({
    user,
    projects,
}: {
    user: BasicUserData;
    projects: LightProjectData[];
}) {
    const router = useRouter();

    return (
        <div className="mx-auto max-w-4xl px-8 py-8">
            <h1 className="mb-4 font-display text-4xl font-extrabold">
                {user.name}&apos;s Projects
            </h1>

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {projects.map((project) => (
                        <div
                            className="flex cursor-pointer flex-col items-stretch justify-center gap-4 rounded-lg border border-zinc-400 bg-zinc-700 px-4 py-4 transition-shadow hover:shadow-lg hover:shadow-zinc-400/20"
                            key={project.id}
                            onClick={() => {
                                router.push(`/projects/${project.id}`);
                            }}
                        >
                            <div className="flex flex-row gap-4">
                                <div className="flex w-20 flex-col">
                                    {project.logo ? (
                                        <Image
                                            src={project.logo.url}
                                            alt=""
                                            width={512}
                                            height={512}
                                            className="aspect-square h-full w-full rounded-2xl object-contain"
                                        />
                                    ) : (
                                        <Image
                                            src={selectRandomPlaceholder(
                                                project.id,
                                            )}
                                            alt=""
                                            width={512}
                                            height={512}
                                            className="aspect-square h-full w-full rounded-2xl object-contain"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col">
                                    <p className="mb-1 font-display text-2xl font-semibold">
                                        {project.title}
                                    </p>
                                    {project.tagline &&
                                        project.tagline.length > 0 && (
                                            <p className="text-lg leading-snug">
                                                {project.tagline}
                                            </p>
                                        )}
                                </div>
                            </div>
                            {(project.githubLink ||
                                project.websiteLink ||
                                project.videoLink) && (
                                <div className="items-between flex flex-row gap-2">
                                    {project.githubLink && (
                                        <a
                                            href={project.githubLink}
                                            className="w-full"
                                        >
                                            <Button
                                                colorType="lightgray"
                                                fullWidth
                                            >
                                                <BsGithub className="inline-block h-6 w-6" />
                                            </Button>
                                        </a>
                                    )}
                                    {project.websiteLink && (
                                        <a
                                            href={project.websiteLink}
                                            className="w-full"
                                        >
                                            <Button
                                                colorType="lightgray"
                                                fullWidth
                                            >
                                                <BsLink45Deg className="inline-block h-6 w-6" />
                                            </Button>
                                        </a>
                                    )}
                                    {project.videoLink && (
                                        <a
                                            href={project.videoLink}
                                            className="w-full"
                                        >
                                            <Button
                                                colorType="lightgray"
                                                fullWidth
                                            >
                                                <BsYoutube className="inline-block h-6 w-6" />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No projects yet. 🥲</p>
            )}
        </div>
    );
}
