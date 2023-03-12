import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { BsChevronRight, BsPencil } from 'react-icons/bs';
import Button from '@/components/Button';
import prisma from '@/lib/prisma';
import { PostData } from '@/types/PostData';
import { BasicUserData } from '@/types/UserData';
import { authOptions } from '../api/auth/[...nextauth]';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const posts = await prisma.post.findMany();

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

    return {
        props: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
            posts: posts.map((post) => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
            })),
        },
    };
};

export default function Info({
    user,
    posts,
}: {
    user: BasicUserData;
    posts: PostData[];
}) {
    return (
        <div className="mx-auto max-w-4xl px-8 py-8">
            <h1 className="mb-4 font-display text-4xl font-extrabold">
                Info Posts
            </h1>

            {user.isAdmin && (
                <Link href="/info/edit">
                    <Button
                        alignedLeft
                        fullWidth
                        colorType="admin"
                        className="mb-6"
                    >
                        <BsPencil className="mr-4 inline-block h-6 w-6" />
                        Create Post
                    </Button>
                </Link>
            )}

            {posts.length > 0 ? (
                <div className="flex flex-col">
                    {posts.map((post, index, array) => (
                        <Link href={`/info/${post.slug}`} key={post.id}>
                            <div
                                className={`flex flex-row items-center justify-between border border-zinc-400 bg-zinc-700 px-4 py-4 hover:bg-zinc-800 ${
                                    index === 0 ? 'rounded-t-lg' : ''
                                } ${
                                    index === array.length - 1
                                        ? 'rounded-b-lg'
                                        : ''
                                }`}
                            >
                                <p className="text-xl font-medium">
                                    {post.title}
                                </p>
                                <div className="flex flex-col gap-2 md:flex-row">
                                    <BsChevronRight className="h-6 w-6" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="mb-4">No posts yet. 🥲</p>
            )}
        </div>
    );
}
