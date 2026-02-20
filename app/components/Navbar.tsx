import { logout } from "@/app/auth/Auth";


export default function Navbar() {
  return (
    <div className="flex justify-between p-4 border-b">
      <h1 className="font-bold">Smart Bookmark</h1>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}