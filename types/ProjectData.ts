import { ExtraLink, Tag, Year } from '@prisma/client';
import { BannerImageData, LogoImageData } from './ImageData';
import { BasicUserData } from './UserData';

export type BasicProjectData = {
    id: string;
    title: string;
};

export type LightProjectData = {
    id: string;
    title: string;
    tagline: string | null;
    description: string | null;
    tags: Tag[];
    githubLink: string | null;
    videoLink: string | null;
    websiteLink: string | null;
    logo: LogoImageData | null;
};

export type TeamInviteDataWithProject = {
    id: string;
    project: BasicProjectData;
};

export type TeamInviteDataWithUser = {
    id: string;
    user: BasicUserData;
};

export type ProjectData = {
    id: string;
    title: string;
    tagline: string | null;
    description: string | null;
    tags: Tag[];
    year: Year;
    githubLink: string | null;
    videoLink: string | null;
    websiteLink: string | null;
    extraLinks: ExtraLink[];
    logo: LogoImageData | null;
    banner: BannerImageData | null;
    members: BasicUserData[];
};

export type ProjectDataWithInvites = {
    id: string;
    title: string;
    tagline: string | null;
    description: string | null;
    tags: Tag[];
    year: Year;
    githubLink: string | null;
    videoLink: string | null;
    websiteLink: string | null;
    extraLinks: ExtraLink[];
    logo: LogoImageData | null;
    banner: BannerImageData | null;
    members: BasicUserData[];
    invites: TeamInviteDataWithUser[];
};
