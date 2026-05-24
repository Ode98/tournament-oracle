import { supabase } from "./supabase";

function generateUniqueCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function registerWithNickname(nickname: string) {
  const loginCode = generateUniqueCode();
  const dummyEmail = `tournamentoracle+${loginCode}@gmail.com`;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: dummyEmail,
    password: loginCode,
  });

  if (authError) throw authError;

  const { error: dbError } = await supabase.from("profiles").insert({
    id: authData.user!.id,
    nickname: nickname,
    login_code: loginCode,
  });

  if (dbError) throw dbError;

  return {
    user: authData.user,
    loginCode,
  };
}

export async function loginWithCode(loginCode: string) {
  const dummyEmail = `tournamentoracle+${loginCode}@gmail.com`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password: loginCode,
  });

  if (error) throw error;

  return data.user;
}
