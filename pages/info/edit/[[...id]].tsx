import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import React from 'react';
import { BsDashCircleFill, BsSave } from 'react-icons/bs';
import { PostData } from '@/types/PostData';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import MarkdownWithPlugins from '@/components/MarkdownWithPlugins';
import Button from '@/components/Button';

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

    let post;
    if (id && id.length > 0) {
        post = await prisma.post.findUnique({ where: { id: id[0] } });
    }

    return {
        props: {
            post: post
                ? {
                      id: post.id,
                      title: post.title,
                      slug: post.slug,
                      content: post.content,
                  }
                : null,
        },
    };
};

export default function Edit({ post }: { post?: PostData }) {
    const [title, setTitle] = React.useState(post?.title ?? '');
    const [slug, setSlug] = React.useState(post?.slug ?? '');
    const [content, setContent] = React.useState(post?.content ?? '');
    const [previewOn, setPreviewOn] = React.useState(false);

    const router = useRouter();
    const discardChanges = () => {
        if (
            confirm(
                `Are you sure you want to cancel and DISCARD any unsaved changes?`,
            )
        ) {
            router.push('/info');
        }
    };

    const saveChanges = async () => {
        if (!title || title.length === 0) {
            alert('Please enter a title for your post.');
            return;
        }

        if (!slug || slug.length === 0) {
            alert('Please enter a slug for your post.');
            return;
        }

        if (!content || content.length === 0) {
            alert('Please enter post content.');
            return;
        }

        await axios
            .post('/api/posts/update', {
                id: post?.id,
                title,
                slug,
                content,
            })
            .then(() => {
                router.push('/info');
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
                    Post Title
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

            <div className="mb-8">
                <label
                    htmlFor="tagline"
                    className=" block font-medium text-white"
                >
                    Slug
                </label>
                <label
                    htmlFor="tagline"
                    className="mb-2 block text-sm text-zinc-400"
                >
                    How the post is displayed in the URL. Can only contain
                    alphanumeric characters and dashes.
                </label>
                <input
                    type="text"
                    id="tagline"
                    placeholder="ex. markdown-guide"
                    className="block w-full rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 font-sans text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                    value={slug}
                    // filter non alphannumeric and dash
                    onChange={(e) =>
                        setSlug(
                            e.target.value
                                .substring(0, 32)
                                .replace(/[^0-9a-z-]/gi, ''),
                        )
                    }
                />
            </div>

            <div className="mb-4 min-w-0 rounded-lg border border-zinc-600 bg-zinc-700">
                <div className="flex items-center justify-between border-b border-zinc-600 px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            className={`cursor-pointer rounded py-2 px-4 hover:bg-zinc-600 hover:text-white ${
                                !previewOn ? 'bg-zinc-600 text-white' : ''
                            }`}
                            onClick={() => setPreviewOn(false)}
                        >
                            Write
                        </button>
                        <button
                            type="button"
                            className={`cursor-pointer rounded py-2 px-4 hover:bg-zinc-600 hover:text-white ${
                                previewOn ? 'bg-zinc-600 text-white' : ''
                            }`}
                            onClick={() => setPreviewOn(true)}
                        >
                            Preview
                        </button>
                    </div>
                </div>
                {previewOn ? (
                    <div className="min-h-[30rem] w-full min-w-0 rounded-b-lg bg-zinc-900 p-6">
                        <MarkdownWithPlugins content={content} />
                    </div>
                ) : (
                    <div className="rounded-b-lg bg-zinc-800 px-4 py-2 focus-within:ring-4 focus-within:ring-teal-400">
                        <textarea
                            id="projectdescription"
                            rows={20}
                            className="block w-full border-none bg-zinc-800 p-2.5 text-white placeholder-zinc-400 outline-none focus:ring-0"
                            placeholder="ex. StarNet is a **brand new way** to connect with the stars."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
