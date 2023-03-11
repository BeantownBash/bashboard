export type BasicUserData = {
    id: string;
    name: string | null;
    email: string;
    isAdmin: boolean;
};

export type BasicUserDataWithProjectId = {
    id: string;
    name: string | null;
    email: string;
    isAdmin: boolean;
    projectId: string | null;
};
