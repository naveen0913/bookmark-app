"use client";

import { supabase } from "@/lib/supabase";

export default function Login() {

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow space-y-4 w-80">

        <h2 className="text-xl font-bold text-center">
          Login
        </h2>

        <button
          onClick={loginWithGoogle}
          className="bg-red-500 text-white w-full py-2 rounded"
        >
          Sign in with Google
        </button>

      </div>
    </div>
  );
}