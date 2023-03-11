import { BasicProjectData, LightProjectData } from './ProjectData';

export type BasicVoteData = {
    id: string;
    title: string;
    open: boolean;
};

export type VoteData = {
    id: string;
    title: string;
    description: string;
    linkedForm: string;
    canVote: BasicProjectData[];
    voteFor: BasicProjectData[];
    open: boolean;
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
};

export type VoteDataWithProjects = {
    id: string;
    title: string;
    description: string;
    linkedForm: string;
    voteFor: LightProjectData[];
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
    };
    isCast: boolean;
};
