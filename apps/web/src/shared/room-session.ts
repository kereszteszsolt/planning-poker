export type RoomSession = {
  roomId: string;
  participantId: string;
  name: string;
  sessionToken: string;
};

const keyForRoom = (roomId: string) => `planning-poker:room-session:${roomId}`;

export const readRoomSession = (roomId: string): RoomSession | null => {
  try {
    const value = window.sessionStorage.getItem(keyForRoom(roomId));
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<RoomSession>;
    return parsed.roomId === roomId &&
      typeof parsed.participantId === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.sessionToken === "string"
      ? (parsed as RoomSession)
      : null;
  } catch {
    return null;
  }
};

export const writeRoomSession = (session: RoomSession) => {
  window.sessionStorage.setItem(
    keyForRoom(session.roomId),
    JSON.stringify(session),
  );
};

export const clearRoomSession = (roomId: string) => {
  window.sessionStorage.removeItem(keyForRoom(roomId));
};
