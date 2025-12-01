import { X, Users, Layers } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, selectedRoom, setSelectedUser, setSelectedRoom } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isRoom = !!selectedRoom;

  return (
    <div className="p-3 border-b border-base-300 bg-gradient-to-r from-base-100 to-base-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar / Room icon */}
          <div className="avatar">
            <div className="size-10 rounded-full relative ring-1 ring-base-300 grid place-items-center bg-base-200">
              {isRoom ? (
                <Layers className="size-5" />
              ) : (
                <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-medium flex items-center gap-2">
              {isRoom ? selectedRoom.name : selectedUser.fullName}
              {!isRoom && (
                <span
                  className={`hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full ${
                    onlineUsers.includes(selectedUser._id)
                      ? "bg-emerald-500 text-emerald-50"
                      : "bg-base-300 text-base-content/70"
                  }`}
                >
                  {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                </span>
              )}
              {isRoom && (
                <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-base-300 text-base-content/70">
                  {selectedRoom.members?.length || 0} members
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isRoom ? (
            <button onClick={() => setSelectedRoom(null)} className="btn btn-ghost btn-sm" title="Close">
              <X className="size-4" />
            </button>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" title="People">
                <Users className="size-4" />
              </button>
              <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-sm" title="Close">
                <X className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
