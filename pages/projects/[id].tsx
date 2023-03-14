import Link from 'next/link';
import { BsGithub, BsLink45Deg, BsYoutube } from 'react-icons/bs';
import Image from 'next/image';
import { GetServerSideProps } from 'next';
import Button from '@/components/Button';
import prisma from '@/lib/prisma';
import { ProjectData } from '@/types/ProjectData';
import { selectRandomPlaceholder } from '@/lib/utils';
import MarkdownWithPlugins from '@/components/MarkdownWithPlugins';
import { TagStrings } from '@/lib/textutils';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.query;

    if (!id || typeof id !== 'string') {
        return {
            notFound: true,
        };
    }

    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            members: true,
            logo: true,
            banner: true,
            extraLinks: true,
        },
    });

    if (!project) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            project: project
                ? {
                      id: project.id,
                      title: project.title,
                      tagline: project.tagline,
                      description: project.description,
                      tags: project.tags,
                      extraLinks: project.extraLinks,
                      githubLink: project.githubLink,
                      websiteLink: project.websiteLink,
                      videoLink: project.videoLink,
                      logo: project.logo
                          ? {
                                id: project.logo?.id,
                                url: project.logo?.url,
                            }
                          : null,
                      banner: project.banner
                          ? {
                                id: project.banner?.id,
                                url: project.banner?.url,
                            }
                          : null,
                      members: project.members.map((member) => ({
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

export default function Project({ project }: { project: ProjectData }) {
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
        <div className="mx-auto max-w-4xl px-8 py-8">
            <Link href="/projects">
                <Button
                    alignedLeft
                    fullWidth
                    colorType="transparent"
                    className="mb-6"
                >
                    ← Go back to all projects
                </Button>
            </Link>
            <div className="flex flex-col gap-8 md:flex-row">
                <aside className="flex flex-none flex-col gap-8 sm:max-md:flex-row md:w-52">
                    <div className="mx-auto aspect-square overflow-hidden rounded-2xl bg-teal-200/50">
                        {project.logo ? (
                            <Image
                                src={project.logo.url}
                                alt=""
                                width={512}
                                height={512}
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <Image
                                src={selectRandomPlaceholder(project.id)}
                                alt=""
                                width={512}
                                height={512}
                                className="h-full w-full object-contain"
                            />
                        )}
                    </div>

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

                    <div className="flex flex-1 flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            {project.githubLink && (
                                <a href={project.githubLink}>
                                    <Button
                                        colorType="gray"
                                        alignedLeft
                                        fullWidth
                                    >
                                        <BsGithub className="mr-4 inline-block h-6 w-6" />
                                        GitHub
                                    </Button>
                                </a>
                            )}
                            {project.websiteLink && (
                                <a href={project.websiteLink}>
                                    <Button
                                        colorType="gray"
                                        alignedLeft
                                        fullWidth
                                    >
                                        <BsLink45Deg className="mr-4 inline-block h-6 w-6" />
                                        Website
                                    </Button>
                                </a>
                            )}
                            {project.videoLink && (
                                <a href={project.videoLink}>
                                    <Button
                                        colorType="gray"
                                        alignedLeft
                                        fullWidth
                                    >
                                        <BsYoutube className="mr-4 inline-block h-6 w-6" />
                                        Video
                                    </Button>
                                </a>
                            )}
                            {project.extraLinks.map((link) => (
                                <a href={link.url} key={link.id}>
                                    <Button
                                        colorType="gray"
                                        alignedLeft
                                        fullWidth
                                    >
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
        </div>
    );
}
