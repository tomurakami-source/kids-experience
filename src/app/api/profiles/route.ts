import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  created_at: string;
}

// GET /api/profiles — list all profiles for logged-in user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_key, created_at')
    .order('created_at', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  const profiles = (data ?? []).map(({ avatar_key, ...rest }) => ({ ...rest, avatar: avatar_key }));
  return Response.json(profiles as Profile[]);
}

// POST /api/profiles — create a new profile
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, avatar } = await request.json() as { name: string; avatar: string };
  if (!name?.trim()) return Response.json({ error: 'name is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('profiles')
    .insert({ user_id: user.id, name: name.trim(), avatar_key: avatar ?? 'sword' })
    .select('id, name, avatar_key, created_at')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  const { avatar_key, ...rest } = data;
  return Response.json({ ...rest, avatar: avatar_key } as Profile, { status: 201 });
}

// DELETE /api/profiles?id=xxx — delete a profile
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 });

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
