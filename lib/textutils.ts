import { Tag, VoteType } from '@prisma/client';
import { BsAsterisk, BsPersonVideo3, BsTrophyFill } from 'react-icons/bs';
import { IconType } from 'react-icons/lib';

export const TagStrings: Record<
    Tag,
    {
        color: string;
        name: string;
    }
> = {
    [Tag.RefryRehash]: { color: 'bg-violet-700', name: '🍳 Refry Rehash' },
    [Tag.NewConnect]: { color: 'bg-emerald-700', name: '➡️ New Connect' },
    [Tag.SmallData]: { color: 'bg-blue-700', name: '🔍 Small Data' },
    [Tag.Other]: { color: 'bg-teal-700', name: '⭐ Other' },
};

export const VoteTypeStrings: Record<
    VoteType,
    {
        color: string;
        name: string;
        icon: IconType;
    }
> = {
    [VoteType.BreakoutRoom]: {
        color: 'bg-blue-800',
        name: '🧑‍💻 Breakout Room',
        icon: BsPersonVideo3,
    },
    [VoteType.Final]: {
        color: 'bg-emerald-800',
        name: '🏆 Final Vote',
        icon: BsTrophyFill,
    },
    [VoteType.Other]: {
        color: 'bg-violet-800',
        name: '✨ Other',
        icon: BsAsterisk,
    },
};
