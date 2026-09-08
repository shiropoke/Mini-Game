import { useCallback, useEffect, useRef, useState } from 'react';

export type GamePhase = 'setup' | 'ready' | 'playing' | 'paused' | 'completed' | 'failed';
export type ResultStat = { label: string; value: string | number };

// Each game starts a session, then reports complete(stats) or fail().
// The layout owns pause/resume, reset/replay and the result screen.
export function useGameSession() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [seconds, setSeconds] = useState(0);
  const [difficulty, setDifficulty] = useState('');
  const [stats, setStats] = useState<ResultStat[]>([]);
  const clock = useRef({ elapsed: 0, since: null as number | null });
  const phaseRef = useRef<GamePhase>('setup');
  const resumePhase = useRef<'playing' | 'ready'>('playing');

  const changePhase = useCallback((next: GamePhase) => {
    const now = performance.now();
    if (clock.current.since !== null) clock.current.elapsed += now - clock.current.since;
    clock.current.since = next === 'playing' ? now : null;
    phaseRef.current = next;
    setSeconds(Math.floor(clock.current.elapsed / 1000));
    setPhase(next);
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = window.setInterval(() => {
      const { elapsed, since } = clock.current;
      setSeconds(Math.floor((elapsed + (since === null ? 0 : performance.now() - since)) / 1000));
    }, 200);
    return () => window.clearInterval(interval);
  }, [phase]);

  const start = useCallback((level: string, waitForFirstMove = false) => {
    clock.current = { elapsed: 0, since: null };
    setDifficulty(level);
    setStats([]);
    changePhase(waitForFirstMove ? 'ready' : 'playing');
  }, [changePhase]);
  const begin = useCallback(() => {
    if (phaseRef.current === 'ready') changePhase('playing');
  }, [changePhase]);
  const pause = useCallback(() => {
    if (phaseRef.current !== 'playing' && phaseRef.current !== 'ready') return;
    resumePhase.current = phaseRef.current;
    changePhase('paused');
  }, [changePhase]);
  const resume = useCallback(() => {
    if (phaseRef.current === 'paused') changePhase(resumePhase.current);
  }, [changePhase]);
  const complete = useCallback((additionalStats: ResultStat[] = []) => {
    if (phaseRef.current !== 'playing') return;
    setStats(additionalStats);
    changePhase('completed');
  }, [changePhase]);
  const fail = useCallback(() => changePhase('failed'), [changePhase]);
  const stop = useCallback(() => {
    const { elapsed, since } = clock.current;
    clock.current = { elapsed: elapsed + (since === null ? 0 : performance.now() - since), since: null };
    setSeconds(Math.floor(clock.current.elapsed / 1000));
  }, []);
  const reset = useCallback(() => {
    clock.current = { elapsed: 0, since: null };
    setStats([]);
    setDifficulty('');
    changePhase('setup');
  }, [changePhase]);

  return { phase, seconds, difficulty, stats, start, begin, pause, resume, stop, reset, complete, fail };
}

export type GameSession = ReturnType<typeof useGameSession>;

export function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
