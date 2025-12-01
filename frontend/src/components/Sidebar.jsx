import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, PlusCircle, Layers } from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    getRooms,
    rooms,
    selectedRoom,
    setSelectedRoom,
    createRoom,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("contacts"); // 'contacts' | 'rooms'

  // create room state
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    getUsers();
    getRooms();
  }, [getUsers, getRooms]);

  const filteredUsers = (showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users
  ).filter((user) => user.fullName.toLowerCase().includes(search.toLowerCase()));

  const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(search.toLowerCase()));

  const toggleMember = (id) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error("Enter a room name");
      return;
    }
    try {
      const room = await createRoom({ name: roomName.trim(), memberIds: selectedMembers });
      setShowCreate(false);
      setRoomName("");
      setSelectedMembers([]);
      setSelectedRoom(room);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to create room");
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200 bg-gradient-to-b from-base-100 to-base-200">
      <div className="border-b border-base-300 w-full p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === "contacts" ? <Users className="size-6" /> : <Layers className="size-6" />}
            <span className="font-medium hidden lg:block">
              {mode === "contacts" ? "Contacts" : "Rooms"}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <button
              className={`btn btn-xs ${mode === "contacts" ? "btn-active" : ""}`}
              onClick={() => setMode("contacts")}
            >
              Contacts
            </button>
            <button
              className={`btn btn-xs ${mode === "rooms" ? "btn-active" : ""}`}
              onClick={() => setMode("rooms")}
            >
              Rooms
            </button>
            <span className="px-2 py-0.5 text-xs rounded-full bg-base-300 text-base-content/70">
              {mode === "contacts" ? Math.max(onlineUsers.length - 1, 0) + " online" : rooms.length + " rooms"}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/60" />
            <input
              type="text"
              className="input input-bordered input-sm w-full pl-9"
              placeholder={mode === "contacts" ? "Search contacts..." : "Search rooms..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {mode === "contacts" && (
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Online only</span>
            </label>
          )}
        </div>

        {mode === "rooms" && (
          <div className="hidden lg:flex items-center gap-2">
            <button className="btn btn-sm btn-ghost" onClick={() => setShowCreate((s) => !s)}>
              <PlusCircle className="size-4" />
              New Room
            </button>
          </div>
        )}
      </div>

      {/* Create Room Panel */}
      {mode === "rooms" && showCreate && (
        <div className="p-3 border-b border-base-300 hidden lg:block">
          <div className="space-y-2">
            <input
              type="text"
              className="input input-bordered input-sm w-full"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <div className="max-h-36 overflow-auto border border-base-300 rounded-md p-2">
              {users.map((u) => (
                <label key={u._id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs"
                    checked={selectedMembers.includes(u._id)}
                    onChange={() => toggleMember(u._id)}
                  />
                  <span className="text-sm">{u.fullName}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-xs" onClick={handleCreateRoom} disabled={!roomName.trim()}>
                Create
              </button>
              <button className="btn btn-xs btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-y-auto w-full py-3">
        {mode === "contacts" && (
          <>
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.name}
                    className="size-12 object-cover rounded-full shadow-sm"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-emerald-500 
                  rounded-full ring-2 ring-zinc-900"
                    />
                  )}
                </div>

                {/* User info - only visible on larger screens */}
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-base-content/60">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center text-base-content/60 py-4">No contacts found</div>
            )}
          </>
        )}

        {mode === "rooms" && (
          <>
            {filteredRooms.map((room) => (
              <button
                key={room._id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                  selectedRoom?._id === room._id ? "bg-base-300 ring-1 ring-base-300" : ""
                }`}
              >
                <div className="mx-auto lg:mx-0">
                  <div className="size-12 rounded-full grid place-items-center bg-base-300">
                    <Layers className="size-6" />
                  </div>
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{room.name}</div>
                  <div className="text-sm text-base-content/60">{room.members?.length || 0} members</div>
                </div>
              </button>
            ))}
            {filteredRooms.length === 0 && (
              <div className="text-center text-base-content/60 py-4">No rooms found</div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;