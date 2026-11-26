import type { Rng } from '@/lib/random/rng';

export const WALL_N = 1;
export const WALL_E = 2;
export const WALL_S = 4;
export const WALL_W = 8;

export type MazeDir = 'N' | 'E' | 'S' | 'W';

export interface MazeData {
  readonly size: number;
  readonly walls: Uint8Array;
  readonly start: readonly [number, number];
  readonly goal: readonly [number, number];
}

const DIR_INFO: Record<
  MazeDir,
  { readonly dx: number; readonly dy: number; readonly bit: number; readonly opp: number }
> = {
  N: { dx: 0, dy: -1, bit: WALL_N, opp: WALL_S },
  E: { dx: 1, dy: 0, bit: WALL_E, opp: WALL_W },
  S: { dx: 0, dy: 1, bit: WALL_S, opp: WALL_N },
  W: { dx: -1, dy: 0, bit: WALL_W, opp: WALL_E },
};

const ALL_DIRS: readonly MazeDir[] = ['N', 'E', 'S', 'W'];

export function cellIndex(size: number, x: number, y: number): number {
  return y * size + x;
}

export function generateMaze(size: number, rng: Rng): MazeData {
  const total = size * size;
  const walls = new Uint8Array(total).fill(WALL_N | WALL_E | WALL_S | WALL_W);
  const visited = new Uint8Array(total);
  const stack: [number, number][] = [[0, 0]];
  visited[0] = 1;

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];
    const dirs = rng.shuffle(ALL_DIRS);
    let carved = false;

    for (const dir of dirs) {
      const info = DIR_INFO[dir];
      const nx = cx + info.dx;
      const ny = cy + info.dy;
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
      const nIdx = cellIndex(size, nx, ny);
      if (visited[nIdx]) continue;

      const cIdx = cellIndex(size, cx, cy);
      walls[cIdx] &= ~info.bit;
      walls[nIdx] &= ~info.opp;
      visited[nIdx] = 1;
      stack.push([nx, ny]);
      carved = true;
      break;
    }

    if (!carved) {
      stack.pop();
    }
  }

  return {
    size,
    walls,
    start: [0, 0],
    goal: [size - 1, size - 1],
  };
}

export function canMove(maze: MazeData, cell: readonly [number, number], dir: MazeDir): boolean {
  const [x, y] = cell;
  const info = DIR_INFO[dir];
  const nx = x + info.dx;
  const ny = y + info.dy;
  if (nx < 0 || ny < 0 || nx >= maze.size || ny >= maze.size) return false;
  return (maze.walls[cellIndex(maze.size, x, y)] & info.bit) === 0;
}

export function stepCell(cell: readonly [number, number], dir: MazeDir): readonly [number, number] {
  const info = DIR_INFO[dir];
  return [cell[0] + info.dx, cell[1] + info.dy];
}

export function dirFromTap(
  pos: readonly [number, number],
  cell: readonly [number, number],
): MazeDir | null {
  const dx = cell[0] - pos[0];
  const dy = cell[1] - pos[1];
  if (Math.abs(dx) + Math.abs(dy) !== 1) return null;
  if (dx === 1) return 'E';
  if (dx === -1) return 'W';
  if (dy === 1) return 'S';
  return 'N';
}

export function dirFromSwipe(dx: number, dy: number, minPx = 30): MazeDir | null {
  if (Math.abs(dx) < minPx && Math.abs(dy) < minPx) return null;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? 'E' : 'W';
  }
  return dy > 0 ? 'S' : 'N';
}

export function solveMaze(
  maze: MazeData,
  from: readonly [number, number] = maze.start,
): readonly (readonly [number, number])[] | null {
  const total = maze.size * maze.size;
  const visited = new Uint8Array(total);
  const parent = new Int32Array(total).fill(-1);
  const startIdx = cellIndex(maze.size, from[0], from[1]);
  const goalIdx = cellIndex(maze.size, maze.goal[0], maze.goal[1]);

  const queue: number[] = [startIdx];
  visited[startIdx] = 1;

  for (let head = 0; head < queue.length; head++) {
    const idx = queue[head];
    if (idx === goalIdx) {
      const path: [number, number][] = [];
      let cur = goalIdx;
      while (cur !== -1) {
        path.push([cur % maze.size, Math.floor(cur / maze.size)]);
        cur = parent[cur];
      }
      return path.reverse();
    }

    const cx = idx % maze.size;
    const cy = Math.floor(idx / maze.size);
    for (const dir of ALL_DIRS) {
      if (!canMove(maze, [cx, cy], dir)) continue;
      const [nx, ny] = stepCell([cx, cy], dir);
      const nIdx = cellIndex(maze.size, nx, ny);
      if (visited[nIdx]) continue;
      visited[nIdx] = 1;
      parent[nIdx] = idx;
      queue.push(nIdx);
    }
  }
  return null;
}
