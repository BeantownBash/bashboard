import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BsDashCircleFill, BsPencil } from 'react-icons/bs';
import { PostData } from '@/types/PostData';
import prisma from '@/lib/prisma';
import MarkdownWithPlugins from '@/components/MarkdownWithPlugins';
import Button from '@/components/Button';
import { BasicUserData } from '@/types/UserData';
import { authOptions } from '../api/auth/[...nextauth]';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.query;

    if (!slug || typeof slug !== 'string') {
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

    if (!user) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const post = await prisma.post.findUnique({ where: { slug } });

    if (!post) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
            post: {
                id: post.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
            },
        },
    };
};

export default function Projects({
    post,
    user,
}: {
    post: PostData;
    user: BasicUserData;
}) {
    const router = useRouter();
    const deletePost = async () => {
        await axios
            .post('/api/posts/delete', {
                id: post.id,
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
            <Link href="/info">
                <Button
                    alignedLeft
                    fullWidth
                    colorType="transparent"
                    className="mb-6"
                >
                    ← Go back to all posts
                </Button>
            </Link>
            {user.isAdmin && (
                <Link href={`/info/edit/${post.id}`}>
                    <Button
                        alignedLeft
                        fullWidth
                        colorType="admin"
                        className="mb-2"
                    >
                        <BsPencil className="mr-4 inline-block h-6 w-6" />
                        Edit Post
                    </Button>
                </Link>
            )}
            {user.isAdmin && (
                <Button
                    alignedLeft
                    fullWidth
                    colorType="danger"
                    className="mb-6"
                    onClick={deletePost}
                >
                    <BsDashCircleFill className="mr-4 inline-block h-6 w-6" />
                    Delete Post
                </Button>
            )}

            <h1 className="mb-4 font-display text-4xl font-extrabold">
                {post.title}
            </h1>

            <MarkdownWithPlugins content={post.content} />
        </div>
    );
}
