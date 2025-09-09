import React from "react";

type RoomHeaderProps = {
  roomId: string;
};

const RoomControls: React.FC<RoomHeaderProps> = ({ roomId }) => {
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID copied to clipboard!");
  };

  const handleCopyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    alert("Room link copied to clipboard!");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow w-full min-w-[300px]">
      <h1 className="text-[16px] font-bold mb-4 text-center text-gray-800">
        Room: <span className="text-blue-600">{roomId}</span>
      </h1>
      <div className="flex flex-row w-full gap-4 px-2">
        <button
          onClick={handleCopyRoomId}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 w-full"
        >
          Copy Room ID
        </button>
        <button
          onClick={handleCopyRoomLink}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 w-full"
        >
          Copy Room Link
        </button>
      </div>
    </div>
  );
};

export default RoomControls;
