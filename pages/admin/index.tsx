import axios from 'axios';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import React from 'react';
import { BsSave } from 'react-icons/bs';
import prisma from '@/lib/prisma';
import Button from '@/components/Button';
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

    const directoryDisabled = await prisma.systemConfigSetting.findUnique({
        where: {
            key: 'directoryDisabled',
        },
    });

    const forbidEditing = await prisma.systemConfigSetting.findUnique({
        where: {
            key: 'forbidEditing',
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
            forbidEditing: forbidEditing?.value ?? true,
            directoryDisabled: directoryDisabled?.value ?? false,
            allowedUsers: allowedUsers?.value ?? [],
            adminUsers: adminUsers.map((adminUser) => adminUser.email),
        },
    };
};

export default function Admin({
    forbidEditing,
    directoryDisabled,
    allowedUsers,
    adminUsers,
}: {
    forbidEditing?: boolean;
    directoryDisabled?: boolean;
    allowedUsers: string[];
    adminUsers: string[];
}) {
    const [forbidEditingSetting, setForbidEditingSetting] = React.useState(
        forbidEditing ?? false,
    );
    const [directoryDisabledSetting, setDirectoryDisabledSetting] =
        React.useState(directoryDisabled ?? false);
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
            console.error(error);
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
            console.error(error);
            alert(
                `Something went wrong setting users. ${error.response.data.e}`,
            );
        }

        try {
            await axios.post('/api/admin/directory', {
                value: directoryDisabledSetting,
            });
        } catch (error: any) {
            console.error(error);
            alert(
                `Something went wrong setting directory enabled. ${error.response.data.e}`,
            );
        }

        try {
            await axios.post('/api/admin/editing', {
                value: forbidEditingSetting,
            });
        } catch (error: any) {
            console.error(error);
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
                        checked={forbidEditingSetting}
                        onChange={(e) =>
                            setForbidEditingSetting(e.target.checked)
                        }
                    />
                    <div className="peer h-7 w-14 rounded-full border-zinc-600 bg-zinc-700 after:absolute after:top-0.5 after:left-[4px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-400" />
                    <span className="ml-3 font-medium text-zinc-300">
                        Forbid Project Editing
                    </span>
                </label>
                <label className="mb-2 block text-sm text-zinc-400">
                    Turn this on once hacking ends.
                </label>
            </div>

            <hr className="my-6 h-px border-0 bg-zinc-600" />

            <div className="mb-6">
                <label className="relative inline-flex cursor-pointer items-center">
                    <input
                        type="checkbox"
                        value=""
                        className="peer sr-only"
                        checked={directoryDisabledSetting}
                        onChange={(e) =>
                            setDirectoryDisabledSetting(e.target.checked)
                        }
                    />
                    <div className="peer h-7 w-14 rounded-full border-zinc-600 bg-zinc-700 after:absolute after:top-0.5 after:left-[4px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-400" />
                    <span className="ml-3 font-medium text-zinc-300">
                        Disable &quot;All Projects&quot; Directory
                    </span>
                </label>
                <label className="mb-2 block text-sm text-zinc-400">
                    Keep this on during the event to keep ideas fresh. Turn it
                    off once hacking is over.
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
