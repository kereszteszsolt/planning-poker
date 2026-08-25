import { useParams, useNavigate } from "react-router-dom";
import { usePlanningPokerTransport } from "../transport/transport-context";

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
  "session-replaced": {
    title: "Session Moved",
    description:
      "This room session was resumed in another browser connection. Rejoin with a new name if that was not intentional.",
  },
};

const MessageScreen: React.FC = () => {
  const { messageType } = useParams<{ messageType: string }>();
  const navigate = useNavigate();
  const transport = usePlanningPokerTransport();

  const message =
    messageType && messages[messageType]
      ? messages[messageType]
      : {
          title: "Unknown Message",
          description:
            "The message type is not recognized. You can return to the home page.",
        };

  return (
    <main className="pp-page pp-page-centered">
      <section className="pp-panel pp-form-panel text-center">
        <h1 className="pp-title">{message.title}</h1>
        <p className="pp-copy mb-6">{message.description}</p>
        <button
          type="button"
          className="pp-button pp-button-primary"
          onClick={() => {
            transport.returnHome();
            navigate("/");
          }}
        >
          Go to Home
        </button>
      </section>
    </main>
  );
};

export default MessageScreen;
