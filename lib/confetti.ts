import confetti from "canvas-confetti";

/** Праздничный салют при завершении теста или получении награды. */
export function fireCelebrationConfetti(): void {
  const durationMs = 2200;
  const end = Date.now() + durationMs;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 62,
      origin: { x: 0, y: 0.72 },
      colors: ["#10b981", "#f59e0b", "#faf6ee", "#059669"],
    });

    confetti({
      particleCount: 4,
      angle: 120,
      spread: 62,
      origin: { x: 1, y: 0.72 },
      colors: ["#10b981", "#f59e0b", "#faf6ee", "#059669"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  confetti({
    particleCount: 90,
    spread: 78,
    origin: { y: 0.62 },
    colors: ["#10b981", "#34d399", "#f59e0b", "#fbbf24", "#ffffff"],
  });

  frame();
}
