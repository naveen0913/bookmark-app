"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const router = useRouter();

  /* ---------------- AUTH SYNC ---------------- */

  useEffect(() => {
    const setupRealtime = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const channel = supabase
        .channel("user-bookmarks")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${user.id}`, // ⭐ IMPORTANT
          },
          () => {
            loadBookmarks();
          }
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    };

    setupRealtime();
  }, []);

  useEffect(() => {

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
      } else {
        loadBookmarks();
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        loadBookmarks();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadBookmarks = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };


  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        () => {
          loadBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const addBookmark = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    setTitle("");
    setUrl("");

    await loadBookmarks();
  };


  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };


  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold"> Bookmark App</h1>

        <button
          onClick={logout}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Add bookmark */}
      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <input
          className="w-full border p-2 rounded"
          placeholder="enter your title"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="enter your URL"
          value={url}
          required
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={addBookmark}
          className="bg-blue-600 text-white w-full py-2 rounded disabled"
          disabled={title === '' || url === ''}
        >
          Add Bookmark
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {bookmarks.map((b) => (
          <div
            key={b.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div className="overflow-hidden">
              <p className="font-semibold">{b.title}</p>
              <a
                href={b.url}
                target="_blank"
                className="text-blue-500 text-sm break-all"
              >
                {b.url}
              </a>
            </div>

            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}