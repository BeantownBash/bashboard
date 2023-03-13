import {
    BsGithub,
    BsLink45Deg,
    BsPlus,
    BsTrashFill,
    BsYoutube,
} from 'react-icons/bs';
import React from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { Tag } from '@prisma/client';
import { generateRandomKey } from '@/lib/utils';
import MarkdownWithPlugins from '@/components/MarkdownWithPlugins';
import ImageDropzone from '@/components/ImageDropzone';
import Button from '@/components/Button';
import prisma from '@/lib/prisma';
import { authOptions } from './api/auth/[...nextauth]';
import { ProjectDataWithInvites } from '@/types/ProjectData';
import { TagStrings } from '@/lib/textutils';

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

    const allowEditing = await prisma.systemConfigSetting.findUnique({
        where: {
            key: 'allowEditing',
        },
    });

    if (!allowEditing) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const project = await prisma.user
        .findUnique({
            where: { email: session.user.email },
        })
        .project({
            include: {
                extraLinks: true,
                logo: true,
                banner: true,
                members: true,
                invites: {
                    include: {
                        user: true,
                    },
                },
            },
        });

    if (!project) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    return {
        props: {
            project: {
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
                invites: project.invites.map((invite) => ({
                    id: invite.id,
                    user: {
                        id: invite.user.id,
                        name: invite.user.name,
                        email: invite.user.email,
                        isAdmin: invite.user.isAdmin,
                    },
                })),
            },
        },
    };
};

export default function Edit({ project }: { project: ProjectDataWithInvites }) {
    const [projectTitle, setProjectTitle] = React.useState(project.title ?? '');
    const [tagline, setTagline] = React.useState(project.tagline ?? '');
    const [tags, setTags] = React.useState(project.tags);
    const [projectDescription, setProjectDescription] = React.useState(
        project.description ?? '',
    );
    const [githubLink, setGithubLink] = React.useState(
        project.githubLink ?? '',
    );
    const [videoLink, setVideoLink] = React.useState(project.videoLink ?? '');
    const [websiteLink, setWebsiteLink] = React.useState(
        project.websiteLink ?? '',
    );

    // generate original list of default links
    const defaultExtraLinks: Record<string, { name: string; url: string }> = {};
    if (project.extraLinks && project.extraLinks.length > 0) {
        project.extraLinks.forEach((link) => {
            defaultExtraLinks[generateRandomKey()] = {
                name: link.name,
                url: link.url,
            };
        });
    } else {
        defaultExtraLinks[generateRandomKey()] = {
            name: '',
            url: '',
        };
    }

    const [extraLinks, setExtraLinks] = React.useState(defaultExtraLinks);

    const updateExtraLink = (id: string, name: string, url: string) => {
        setExtraLinks((prev) => ({
            ...prev,
            [id]: { name, url },
        }));
    };
    const deleteExtraLink = (id: string) => {
        setExtraLinks((prev) => {
            const newLinks = { ...prev };
            delete newLinks[id];
            return newLinks;
        });
    };
    const createExtraLink = () => {
        let newKey = generateRandomKey();
        while (newKey in extraLinks) {
            newKey = generateRandomKey();
        }

        setExtraLinks((prev) => ({
            ...prev,
            [newKey]: {
                name: '',
                url: '',
            },
        }));
    };

    const [previewOn, setPreviewOn] = React.useState(false);

    const [addedInvites, setAddedInvites] = React.useState<
        { id: string; name: string }[]
    >([]);

    const addTeamMember = async () => {
        const email = prompt(
            "Enter your team member's email address that they used to sign in to the Bashboard.",
        );
        if (email && email.length > 0) {
            if (
                confirm(`Are you sure you want to add ${email} to your team?`)
            ) {
                axios
                    .post('/api/projects/invites/create', { email })
                    .then(({ data }) => {
                        alert('Succesfully invited!');
                        setAddedInvites((prev) => [
                            ...prev,
                            { id: data.user.id, name: data.user.name },
                        ]);
                    })
                    .catch((e) => {
                        if (e && e.response && e.response.status === 400) {
                            alert(
                                `Error inviting teammate. ${e.response.data.e}`,
                            );
                        } else {
                            console.error(e);
                            alert(
                                'Error inviting teammate. Please try again later.',
                            );
                        }
                    });
            }
        }
    };

    const router = useRouter();
    const discardChanges = () => {
        if (
            confirm(
                `Are you sure you want to cancel and DISCARD any unsaved changes?`,
            )
        ) {
            router.push('/');
        }
    };

    const saveChanges = async () => {
        await axios
            .post('/api/projects/update', {
                title: projectTitle,
                tagline,
                description: projectDescription,
                tags,
                githubLink,
                websiteLink,
                videoLink,
                extraLinks: Object.values(extraLinks).filter(
                    (link) => link.name.length > 0 && link.url.length > 0,
                ),
            })
            .then(() => {
                router.push('/');
            })
            .catch((e) => {
                console.error(e);
                alert(
                    'An error occurred while saving your changes. Please try again later.',
                );
            });
    };

    const teamMembers: any[] = [];
    project.members.forEach((member) => {
        teamMembers.push(
            <div
                key={member.id}
                className="rounded-lg border border-zinc-600 bg-zinc-700 py-2 px-4"
            >
                {member.name}
            </div>,
        );
    });
    project.invites.forEach((invite) => {
        teamMembers.push(
            <div
                key={invite.id}
                className="rounded-lg border border-zinc-600 bg-zinc-700 py-2 px-4"
            >
                {invite.user.name} (Invited)
            </div>,
        );
    });
    addedInvites.forEach((invite) => {
        teamMembers.push(
            <div
                key={invite.id}
                className="rounded-lg border border-zinc-600 bg-zinc-700 py-2 px-4"
            >
                {invite.name} (Invited)
            </div>,
        );
    });

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-8 py-8 md:flex-row">
            <aside className="flex flex-none flex-col gap-8 sm:max-md:flex-row md:w-52">
                <div>
                    <label
                        htmlFor="logodropzone"
                        className="block font-medium text-white"
                    >
                        Logo
                    </label>
                    <label
                        htmlFor="logodropzone"
                        className="mb-2 block text-sm text-zinc-400"
                    >
                        <strong>512x512px</strong>
                    </label>
                    <ImageDropzone
                        id="logodropzone"
                        width={512}
                        height={512}
                        className="aspect-square"
                        url="/api/logo/upload"
                        deleteUrl="/api/logo/delete"
                        defaultUrl={project.logo?.url ?? undefined}
                    />

                    <label
                        htmlFor="logodropzone"
                        className="mt-1 block text-sm text-zinc-400"
                    >
                        Images are saved automatically.
                    </label>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                    <p className="mb-2 block text-sm text-zinc-400">
                        <strong>Note:</strong> this editor doesn&apos;t sync
                        across devices, so only one person should edit at a
                        time.
                    </p>
                    <Button fullWidth onClick={saveChanges}>
                        Save Changes
                    </Button>
                    <Button
                        fullWidth
                        colorType="danger"
                        onClick={discardChanges}
                    >
                        Cancel
                    </Button>
                </div>
            </aside>

            <main className="min-w-0 flex-1">
                <div className="mb-2">
                    <label
                        htmlFor="projecttitle"
                        className=" block font-medium text-white"
                    >
                        Project Title
                    </label>
                    <label
                        htmlFor="projecttitle"
                        className="mb-2 block text-sm text-zinc-400"
                    >
                        Come up with something catchy, but descriptive.
                    </label>
                    <input
                        type="text"
                        id="projecttitle"
                        placeholder="ex. StarNet"
                        className="block w-full rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 font-display text-xl font-extrabold text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                        value={projectTitle}
                        onChange={(e) =>
                            setProjectTitle(e.target.value.substring(0, 32))
                        }
                    />
                </div>

                <div className="mb-8">
                    <label
                        htmlFor="tagline"
                        className=" block font-medium text-white"
                    >
                        Tagline
                    </label>
                    <label
                        htmlFor="tagline"
                        className="mb-2 block text-sm text-zinc-400"
                    >
                        An optional brief description.
                    </label>
                    <input
                        type="text"
                        id="tagline"
                        placeholder="ex. A new way to connect with the stars."
                        className="block w-full rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 font-sans font-semibold text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                        value={tagline}
                        onChange={(e) =>
                            setTagline(e.target.value.substring(0, 32))
                        }
                    />
                </div>

                <div className="mb-8">
                    <label
                        htmlFor="tagline"
                        className=" block font-medium text-white"
                    >
                        Project Tags
                    </label>
                    <div className="my-2 flex flex-wrap gap-4">
                        {Object.entries(TagStrings).map(
                            ([tag, { color, name }]) => (
                                <label
                                    className="relative inline-flex cursor-pointer items-center"
                                    key={tag}
                                >
                                    <input
                                        type="checkbox"
                                        value=""
                                        className="peer sr-only"
                                        checked={tags.includes(tag as Tag)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setTags([...tags, tag as Tag]);
                                            } else {
                                                setTags(
                                                    tags.filter(
                                                        (tagF) => tagF !== tag,
                                                    ),
                                                );
                                            }
                                        }}
                                    />
                                    <div
                                        className={`${color} peer rounded-full py-1 px-6 peer-checked:ring-4 peer-checked:ring-teal-400 peer-focus:outline-none`}
                                    >
                                        {name}
                                    </div>
                                </label>
                            ),
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <label
                        htmlFor="teammembers"
                        className="block font-medium text-white"
                    >
                        Team Members
                    </label>
                    <label
                        htmlFor="teammembers"
                        className="block text-sm text-zinc-400"
                    >
                        Once you add someone to your team, you can&apos;t remove
                        them unless they choose to leave.
                    </label>
                    <label
                        htmlFor="teammembers"
                        className="mb-2 block text-sm text-zinc-400"
                    >
                        You can leave a team at any time from your account page.
                    </label>
                    <div
                        id="teammembers"
                        className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2"
                    >
                        {teamMembers}
                        {project.members.length < 4 && (
                            <Button onClick={addTeamMember}>
                                <BsPlus className="mr-4 inline-block h-6 w-6" />
                                Add Team Member
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <label
                        htmlFor="bannerdropbox"
                        className="block font-medium text-white"
                    >
                        Banner Image
                    </label>
                    <label
                        htmlFor="bannerdropbox"
                        className="mb-2 block text-sm text-zinc-400"
                    >
                        A picture is worth a thousand words. Upload an optional
                        banner image to appear near the top of your project
                        page. <strong>1280x720px</strong>
                    </label>
                    <ImageDropzone
                        id="bannerdropbox"
                        width={1280}
                        height={720}
                        className="aspect-video w-full "
                        url="/api/banner/upload"
                        deleteUrl="/api/banner/delete"
                        defaultUrl={project.banner?.url ?? undefined}
                    />
                    <label
                        htmlFor="bannerdropbox"
                        className="mt-1 block text-sm text-zinc-400"
                    >
                        Images are saved automatically.
                    </label>
                </div>

                <div className="mb-8">
                    <label className="block font-medium text-white">
                        Project Links
                    </label>
                    <label className="mb-2 block text-sm text-zinc-400">
                        Add optional links to anything you want to share,
                        whether it&apos;s a repository, website, demo video, or
                        anything else.
                    </label>
                    <div className="mb-4 flex flex-col gap-2">
                        <div className="flex">
                            <div className="block w-full flex-[1] rounded-l-lg border border-zinc-600 bg-zinc-700 px-4 py-2.5 text-white placeholder-zinc-400">
                                <BsGithub className="mr-4 inline-block h-6 w-6" />
                                GitHub
                            </div>
                            <input
                                type="text"
                                id="projecttitle"
                                placeholder="ex. https://github.com/BeantownBash/bashboard"
                                className="block w-full flex-[2] rounded-r-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                                value={githubLink}
                                onChange={(e) => setGithubLink(e.target.value)}
                            />
                        </div>
                        <div className="flex">
                            <div className="block w-full flex-[1] rounded-l-lg border border-zinc-600 bg-zinc-700 px-4 py-2.5 text-white placeholder-zinc-400">
                                <BsLink45Deg className="mr-4 inline-block h-6 w-6" />
                                Website
                            </div>
                            <input
                                type="text"
                                placeholder="ex. https://beantownbash.org"
                                className="block w-full flex-[2] rounded-r-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                                value={websiteLink}
                                onChange={(e) => setWebsiteLink(e.target.value)}
                            />
                        </div>
                        <div className="flex">
                            <div className="block w-full flex-[1] rounded-l-lg border border-zinc-600 bg-zinc-700 px-4 py-2.5 text-white placeholder-zinc-400">
                                <BsYoutube className="mr-4 inline-block h-6 w-6" />
                                Video
                            </div>
                            <input
                                type="text"
                                placeholder="ex. https://www.youtube.com/watch?v=KJZ4YYtdMIg"
                                className="block w-full flex-[2] rounded-r-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                                value={videoLink}
                                onChange={(e) => setVideoLink(e.target.value)}
                            />
                        </div>
                    </div>
                    <label className="mb-2 block text-sm font-medium text-white">
                        More Links
                    </label>
                    <div className="mb-2 flex flex-col gap-2">
                        {Object.entries(extraLinks).map(
                            ([key, { name, url }]) => (
                                <div className="flex" key={key}>
                                    <input
                                        type="text"
                                        placeholder="Another website"
                                        className="block w-full flex-[1] rounded-l-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                                        value={name}
                                        onChange={(e) => {
                                            updateExtraLink(
                                                key,
                                                e.target.value,
                                                url,
                                            );
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="ex. https://beantownbash.org"
                                        className="z-10 block w-full flex-[2]  border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                                        value={url}
                                        onChange={(e) => {
                                            updateExtraLink(
                                                key,
                                                name,
                                                e.target.value,
                                            );
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="flex items-center rounded-r-lg bg-red-700 p-2 font-medium hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-400"
                                        onClick={() => {
                                            deleteExtraLink(key);
                                        }}
                                    >
                                        <BsTrashFill className="h-6 w-6" />
                                    </button>
                                </div>
                            ),
                        )}
                    </div>
                    <Button
                        onClick={() => {
                            createExtraLink();
                        }}
                        fullWidth
                    >
                        <BsPlus className="mr-4 inline-block h-6 w-6" />
                        Add Another Link
                    </Button>
                </div>

                <div className="my-4 min-w-0">
                    <label
                        htmlFor="projectdescription"
                        className="block text-lg font-medium text-white"
                    >
                        Project Description
                    </label>
                    <label
                        htmlFor="bannerdropbox"
                        className="mb-2 block text-sm text-zinc-400"
                    >
                        Write a description of your project. An extended version
                        of Markdown is supported.{' '}
                        <a
                            className="text-blue-400 hover:underline"
                            target="_blank"
                            href="/info/markdown"
                            rel="noopener noreferrer"
                        >
                            Click here for a guide to our Markdown syntax.
                        </a>
                    </label>

                    <div className="mb-4 min-w-0 rounded-lg border border-zinc-600 bg-zinc-700">
                        <div className="flex items-center justify-between border-b border-zinc-600 px-3 py-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    className={`cursor-pointer rounded py-2 px-4 hover:bg-zinc-600 hover:text-white ${
                                        !previewOn
                                            ? 'bg-zinc-600 text-white'
                                            : ''
                                    }`}
                                    onClick={() => setPreviewOn(false)}
                                >
                                    Write
                                </button>
                                <button
                                    type="button"
                                    className={`cursor-pointer rounded py-2 px-4 hover:bg-zinc-600 hover:text-white ${
                                        previewOn
                                            ? 'bg-zinc-600 text-white'
                                            : ''
                                    }`}
                                    onClick={() => setPreviewOn(true)}
                                >
                                    Preview
                                </button>
                            </div>
                        </div>
                        {previewOn ? (
                            <div className="min-h-[30rem] w-full min-w-0 rounded-b-lg bg-zinc-900 p-6">
                                <MarkdownWithPlugins
                                    content={projectDescription}
                                />
                            </div>
                        ) : (
                            <div className="rounded-b-lg bg-zinc-800 px-4 py-2 focus-within:ring-4 focus-within:ring-teal-400">
                                <textarea
                                    id="projectdescription"
                                    rows={20}
                                    className="block w-full border-none bg-zinc-800 p-2.5 text-white placeholder-zinc-400 focus:ring-0"
                                    placeholder="ex. StarNet is a **brand new way** to connect with the stars."
                                    value={projectDescription}
                                    onChange={(e) =>
                                        setProjectDescription(e.target.value)
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
