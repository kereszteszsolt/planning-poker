import React from "react";

type RoomHeaderProps = {
  roomId: string;
};

const RoomHeader: React.FC<RoomHeaderProps> = ({ roomId }) => {
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
    <>
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Room ID: {roomId}
      </h1>
      <div className="mb-6 text-center space-x-2">
        <button
          onClick={handleCopyRoomId}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Copy Room ID
        </button>
        <button
          onClick={handleCopyRoomLink}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Copy Room Link
        </button>
      </div>
    </>
  );
};

export default RoomHeader;
