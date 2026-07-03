export class CurrentRefreshUser {
    id: number;
    name: string;
    email: string;
    refreshToken: string

    constructor(id: number, name: string, email: string, refreshToken: string) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.refreshToken = refreshToken;
    }
}

export class CurrentAuthUser {
    id: number;
    name: string;
    email: string;

    constructor (id: number, name: string, email: string) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}