/* eslint-disable import/prefer-default-export */
import { Tag } from '@prisma/client';

export const TagStrings: Record<
    Tag,
    {
        color: string;
        name: string;
    }
> = {
    [Tag.RefryRehash]: { color: 'bg-purple-700', name: '🍳 Refry Rehash' },
    [Tag.NewConnect]: { color: 'bg-emerald-700', name: '➡️ New Connect' },
    [Tag.SmallData]: { color: 'bg-blue-700', name: '🔍 Small Data' },
    [Tag.Other]: { color: 'bg-teal-700', name: '⭐ Other' },
};
