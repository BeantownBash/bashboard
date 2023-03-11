import Button from '@/components/Button';
import prisma from '@/lib/prisma';
import { BasicUserData } from '@/types/UserData';
import { User } from '@prisma/client';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import React from 'react';
import { BsBoxArrowLeft, BsDashCircleFill, BsSave } from 'react-icons/bs';
import { authOptions } from '../api/auth/[...nextauth]';

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

    const directoryEnabled = await prisma.systemConfigSetting.findUnique({
        where: {
            key: 'directoryEnabled',
        },
    });

    const allowEditing = await prisma.systemConfigSetting.findUnique({
        where: {
            key: 'allowEditing',
        },
    });

    const allowedUsers = await prisma.systemConfigSetting.findUnique({
        where: {
            key: 'allowedUsers',
        },
    });

    const adminUsers = await prisma.user.findMany({
        where: {
            isAdmin: true,
        },
    });

    return {
        props: {
            allowEditing: allowEditing?.value ?? true,
            directoryEnabled: directoryEnabled?.value ?? true,
            allowedUsers: allowedUsers?.value ?? [],
            adminUsers: adminUsers.map((user) => user.email),
        },
    };
};

export default function Admin({
    allowEditing,
    directoryEnabled,
    allowedUsers,
    adminUsers,
}: {
    allowEditing?: boolean;
    directoryEnabled?: boolean;
    allowedUsers: string[];
    adminUsers: string[];
}) {
    const [allowEditingSetting, setAllowEditingSetting] = React.useState(
        allowEditing ?? false,
    );
    const [directoryEnabledSetting, setDirectoryEnabledSetting] =
        React.useState(directoryEnabled ?? false);
    const [allowedUsersSetting, setAllowedUsersSetting] = React.useState(
        allowedUsers.join('\n'),
    );
    const [adminUsersSetting, setAdminUsersSetting] = React.useState(
        adminUsers.join('\n'),
    );

    const saveChanges = async () => {
        if (!allowedUsersSetting || allowedUsersSetting.length === 0) {
            alert('Allowed Users cannot be empty.');
            return;
        }

        if (!adminUsersSetting || adminUsersSetting.length === 0) {
            alert('Admin Users cannot be empty.');
            return;
        }

        try {
            await axios.post(
                '/api/admin/admins',
                adminUsersSetting.split('\n').map((el) => el.trim()),
            );
        } catch (error: any) {
            console.log(error);
            alert(
                `Something went wrong setting admins. ${error.response.data.e}`,
            );
        }

        try {
            await axios.post(
                '/api/admin/users',
                allowedUsersSetting.split('\n').map((el) => el.trim()),
            );
        } catch (error: any) {
            console.log(error);
            alert(
                `Something went wrong setting users. ${error.response.data.e}`,
            );
        }

        try {
            await axios.post('/api/admin/directory', {
                value: directoryEnabledSetting,
            });
        } catch (error: any) {
            console.log(error);
            alert(
                `Something went wrong setting directory enabled. ${error.response.data.e}`,
            );
        }

        try {
            await axios.post('/api/admin/editing', {
                value: allowEditingSetting,
            });
        } catch (error: any) {
            console.log(error);
            alert(
                `Something went wrong setting editing enabled. ${error.response.data.e}`,
            );
        }

        alert('Changes saved!');
    };

    return (
        <div className="mx-auto max-w-4xl px-8 py-8">
            <h1 className="mb-4 font-display text-4xl font-extrabold">
                Admin Controls
            </h1>

            <Button
                className="mb-12"
                fullWidth
                onClick={saveChanges}
                colorType="admin"
            >
                <BsSave className="mr-4 inline-block h-6 w-6" />
                Save Changes
            </Button>

            <div className="mb-6">
                <label className="relative inline-flex cursor-pointer items-center">
                    <input
                        type="checkbox"
                        value=""
                        className="peer sr-only"
                        checked={allowEditingSetting}
                        onChange={(e) =>
                            setAllowEditingSetting(e.target.checked)
                        }
                    />
                    <div className="peer h-7 w-14 rounded-full border-zinc-600 bg-zinc-700 after:absolute after:top-0.5 after:left-[4px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-400" />
                    <span className="ml-3 font-medium text-zinc-300">
                        Allow Project Editing
                    </span>
                </label>
                <label className="mb-2 block text-sm text-zinc-400">
                    Turn this off once hacking ends.
                </label>
            </div>

            <hr className="my-6 h-px border-0 bg-zinc-600" />

            <div className="mb-6">
                <label className="relative inline-flex cursor-pointer items-center">
                    <input
                        type="checkbox"
                        value=""
                        className="peer sr-only"
                        checked={directoryEnabledSetting}
                        onChange={(e) =>
                            setDirectoryEnabledSetting(e.target.checked)
                        }
                    />
                    <div className="peer h-7 w-14 rounded-full border-zinc-600 bg-zinc-700 after:absolute after:top-0.5 after:left-[4px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-400" />
                    <span className="ml-3 font-medium text-zinc-300">
                        Enable &quot;All Projects&quot; Directory
                    </span>
                </label>
                <label className="mb-2 block text-sm text-zinc-400">
                    Keep this off during the event to keep ideas fresh. Turn it
                    on once hacking is over.
                </label>
            </div>

            <hr className="my-6 h-px border-0 bg-zinc-600" />

            <div>
                <label
                    htmlFor="allowedusers"
                    className="block font-medium text-white"
                >
                    Allowed Users
                </label>
                <label
                    htmlFor="allowedusers"
                    className="mb-2 block text-sm text-zinc-400"
                >
                    Only emails on this list are allowed to sign in to the
                    Bashboard. Separate emails with a new line.
                </label>
                <textarea
                    id="allowedusers"
                    rows={20}
                    // className="block w-full border-none bg-zinc-800 p-2.5 text-white placeholder-zinc-400 focus:ring-0"
                    className="block w-full rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 font-sans text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                    placeholder="ex. team@beantownbash.org"
                    value={allowedUsersSetting}
                    onChange={(e) => setAllowedUsersSetting(e.target.value)}
                />
            </div>

            <hr className="my-6 h-px border-0 bg-zinc-600" />

            <div>
                <label
                    htmlFor="allowedusers"
                    className="block font-medium text-white"
                >
                    Administrators
                </label>
                <label
                    htmlFor="allowedusers"
                    className="mb-2 block text-sm text-zinc-400"
                >
                    Only emails on this list can administrate the event.
                    Separate emails with a new line.
                </label>
                <textarea
                    id="allowedusers"
                    rows={10}
                    // className="block w-full border-none bg-zinc-800 p-2.5 text-white placeholder-zinc-400 focus:ring-0"
                    className="block w-full rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 font-sans text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500"
                    placeholder="ex. team@beantownbash.org"
                    value={adminUsersSetting}
                    onChange={(e) => setAdminUsersSetting(e.target.value)}
                />
            </div>
        </div>
    );
}
