import { useParams, useNavigate } from "react-router-dom";

const messages: Record<string, { title: string; description: string }> = {
  closed: {
    title: "Room Closed",
    description: "This room has been closed. You can return to the home page.",
  },
  "kicked-out": {
    title: "Kicked Out",
    description:
      "You were removed from the room. Please contact the moderator if you have questions.",
  },
};

const MessageScreen: React.FC = () => {
  const { messageType } = useParams<{ messageType: string }>();
  const navigate = useNavigate();

  const message =
    messageType && messages[messageType]
      ? messages[messageType]
      : {
          title: "Unknown Message",
          description:
            "The message type is not recognized. You can return to the home page.",
        };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">{message.title}</h1>
      <p className="mb-6 text-gray-700">{message.description}</p>
      <button
        className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        onClick={() => navigate("/")}
      >
        Go to Home
      </button>
    </div>
  );
};

export default MessageScreen;
