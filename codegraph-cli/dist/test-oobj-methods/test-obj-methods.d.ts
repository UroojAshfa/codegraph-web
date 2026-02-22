declare const handlers: {
    valid: boolean;
    onClick(): void;
    onSubmit(this: {
        valid: boolean;
    }): void;
    validate(): boolean;
};
declare const utils: {
    formatDate: (date: Date) => string;
    parseJSON: (str: string) => any;
};
declare const callbacks: {
    onSuccess: () => void;
    onError: (error: Error) => void;
};
declare const api: {
    get(url: string): Promise<Response>;
    post: (url: string, data: unknown) => Promise<Response>;
    delete: (id: number) => Promise<Response>;
};
declare const config: {
    handlers: {
        onClick(): void;
    };
    init(): void;
};
declare function createController(): {
    start(): void;
    stop(): void;
};
declare const app: {
    use(arg: unknown): void;
};
//# sourceMappingURL=test-obj-methods.d.ts.map