import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg ring-1 ring-primary/20"
            >
              <MessageSquare className="w-10 h-10 text-primary " />
            </div>
            <div className="absolute -inset-1 rounded-2xl blur-xl opacity-20 bg-primary" />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-bold">Welcome to Chatty</h2>
        <p className="text-base-content/70">
          Select a conversation from the sidebar to start chatting. Stay connected in real-time and share moments with friends.
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
