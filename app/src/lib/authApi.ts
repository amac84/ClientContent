import { auth } from "@clerk/nextjs/server";

export type ApiActor = {
  userId: string;
  orgId: string;
};

export async function getApiActor(): Promise<ApiActor | null> {
  const { userId, orgId } = await auth();

  if (!userId) {
    return null;
  }

  return {
    userId,
    orgId: orgId ?? `user:${userId}`,
  };
}
