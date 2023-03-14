import { VoteType } from '@prisma/client';
import { BasicProjectData, LightProjectData } from './ProjectData';

export type BasicVoteData = {
    id: string;
    title: string;
    open: boolean;
    type: VoteType;
};

export type VoteData = {
    id: string;
    title: string;
    description: string;
    linkedForm: string;
    canVote: BasicProjectData[];
    voteFor: BasicProjectData[];
    open: boolean;
    type: VoteType;
};

export type VoteDataWithBallotsAndKeys = {
    id: string;
    title: string;
    description: string;
    linkedForm: string;
    canVote: BasicProjectData[];
    voteFor: BasicProjectData[];
    open: boolean;
    ballots: BasicBallotData[];
    type: VoteType;
};

export type VoteDataWithProjects = {
    id: string;
    title: string;
    description: string;
    linkedForm: string;
    voteFor: LightProjectData[];
    type: VoteType;
};

export type BasicBallotData = {
    isCast: boolean;
    securityKey: string;
    user: {
        email: string;
    };
};

export type SimpleBallot = {
    vote: {
        id: string;
        title: string;
        open: boolean;
        type: VoteType;
    };
    isCast: boolean;
};
