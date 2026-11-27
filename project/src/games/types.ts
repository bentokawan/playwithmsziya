import type { ComponentType } from 'react';
import type { StickerId } from '@/content/stickers';
import type { SpeechClip } from '@/lib/audio/types';
import type { ResolvedContent } from '@/lib/content/types';
import type { FinalReason, FinalWinner, RoomPlayerInfo, RoomRole } from '@/lib/room/protocol';
import type { PlayerNumber, SessionConfig } from '@/lib/session/session';

export type { DifficultyId } from '@/lib/session/session';

export interface RoundResult {
  readonly attempts: number;
  readonly firstTry: boolean;
  /** Only for turnMode 'in-game' (G08): matched pairs per player */
  readonly perPlayer?: Partial<Record<PlayerNumber, number>>;
}

export interface RoundPane {
  readonly side: 'left' | 'right';
  readonly quiet: boolean;
}

export interface RoundProps<R> {
  readonly round: R;
  readonly config: SessionConfig;
  readonly player: PlayerNumber;
  readonly roundIndex: number;
  readonly calmMotion: boolean;
  readonly thickLines: boolean;
  readonly pane?: RoundPane;
  readonly onComplete: (result: RoundResult) => void;
}

export interface GameModule<R> {
  readonly turnMode: 'per-round' | 'in-game';
  createRounds(config: SessionConfig, content: ResolvedContent): readonly R[];
  speechFor?(round: R, config: SessionConfig): SpeechClip[];
  readonly Round: ComponentType<RoundProps<R>>;
}

export interface PlayerOutcome {
  readonly player: PlayerNumber;
  readonly profileId?: string;
  readonly roundsCompleted: number;
  readonly firstTryCount: number;
  readonly score?: number;
  readonly maxScore?: number;
  readonly speedBonus?: number;
  readonly stars?: 1 | 2 | 3;
  readonly isPersonalBest?: boolean;
  readonly improvement?: number;
  readonly won?: boolean;
  readonly stickerId: StickerId;
  readonly stickerIsNew: boolean;
}

export interface OnlineFinalOutcome {
  readonly scores: {
    readonly host: number;
    readonly guest: number;
  };
  readonly winner: FinalWinner;
  readonly reason: FinalReason;
  readonly role: RoomRole;
  readonly roomCode: string;
  readonly localPlayer: RoomPlayerInfo;
  readonly peerPlayer: RoomPlayerInfo;
}

export interface SessionOutcome {
  readonly schemaVersion: 1 | 2;
  readonly config: SessionConfig;
  readonly players: readonly PlayerOutcome[];
  readonly finishedAt: string;
  readonly onlineFinal?: OnlineFinalOutcome;
}
