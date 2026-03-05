alter table profiles enable row level security;
alter table engagements enable row level security;
alter table interview_sessions enable row level security;
alter table transcripts enable row level security;
alter table extractions enable row level security;
alter table outputs enable row level security;

create policy "authenticated users can read profiles" on profiles for select to authenticated using (true);
create policy "authenticated users can upsert profiles" on profiles for insert to authenticated with check (true);
create policy "authenticated users can update profiles" on profiles for update to authenticated using (true) with check (true);

create policy "authenticated users manage engagements" on engagements for all to authenticated using (true) with check (true);
create policy "authenticated users manage interview_sessions" on interview_sessions for all to authenticated using (true) with check (true);
create policy "authenticated users manage transcripts" on transcripts for all to authenticated using (true) with check (true);
create policy "authenticated users manage extractions" on extractions for all to authenticated using (true) with check (true);
create policy "authenticated users manage outputs" on outputs for all to authenticated using (true) with check (true);
