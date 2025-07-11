import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    return session;
}

export const getUser = async () => {
    const session = await getSession();
    return session?.user;
}