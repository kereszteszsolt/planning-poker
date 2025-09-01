export type Participant = {
  id: string;
  name: string;
  voted: boolean;
  vote?: number | string;
  isModerator: boolean;
};
