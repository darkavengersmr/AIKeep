import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getListForUser } from "@/server/todos/service";
import { listMembers } from "@/server/members/service";
import { ListDetail } from "@/components/todos/list-detail";

export default async function ListPage(props: PageProps<"/lists/[id]">) {
  const user = await requireAuth();
  const { id } = await props.params;

  const list = await getListForUser(user.id, id);
  if (!list) notFound();

  const members = await listMembers(user.id, id);

  return <ListDetail list={list} members={members} />;
}