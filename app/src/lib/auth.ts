import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type Actor = {
  userId: string;
  orgId: string;
};

export async function requireActor(): Promise<Actor> {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return {
    userId,
    orgId: orgId ?? `user:${userId}`,
  };
}
