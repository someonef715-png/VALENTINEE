
export enum AppStep {
  WELCOME = 'WELCOME',
  MESSAGE = 'MESSAGE',
  PROPOSAL = 'PROPOSAL',
  EASY_PULL = 'EASY_PULL',
  LOVE_METER = 'LOVE_METER',
  HEART_GAME = 'HEART_GAME',
  FAV_THINGS_FORM = 'FAV_THINGS_FORM',
  FINAL = 'FINAL',
  INTERACTIVE_LETTER = 'INTERACTIVE_LETTER'
}

export interface ValentineInfo {
  name: string;
  favFood: string;
  birthday: string;
  motherName: string;
  collegeName: string;
}
