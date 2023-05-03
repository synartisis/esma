export var URLPattern: {
    new (init: {} | undefined, baseURLOrOptions: any, options: any): {
        regexp: {};
        names: {};
        component_pattern: {};
        parts: {};
        pattern: any;
        test(input: {} | undefined, baseURL: any): boolean;
        exec(input: {} | undefined, baseURL: any): {
            inputs: any[] | {}[];
        } | null | undefined;
        readonly protocol: any;
        readonly username: any;
        readonly password: any;
        readonly hostname: any;
        readonly port: any;
        readonly pathname: any;
        readonly search: any;
        readonly hash: any;
    };
    compareComponent(component: any, left: any, right: any): number;
};
