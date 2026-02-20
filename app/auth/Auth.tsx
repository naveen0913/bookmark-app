import { supabase } from "@/lib/supabase"

export async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error(error.message);
        return;
    }

    window.location.href = "/login";
}