//type.d.ts

declare module "next-auth" {
    interface User {
        role: string
    }
}

export {}