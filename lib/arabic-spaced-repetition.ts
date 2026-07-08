export function applySm2(
  prev: { ease_factor: number; interval_days: number; repetitions: number } | null,
  result: "again" | "hard" | "good" | "easy",
): { ease_factor: number; interval_days: number; repetitions: number; xp: number } {
  let ease = prev?.ease_factor ?? 2.5;
  let interval = prev?.interval_days ?? 0;
  let reps = prev?.repetitions ?? 0;
  let xp = 5;

  if (result === "again") {
    reps = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    xp = 1;
  } else if (result === "hard") {
    ease = Math.max(1.3, ease - 0.15);
    interval = Math.max(1, Math.round(interval * 1.2));
    reps += 1;
    xp = 8;
  } else if (result === "good") {
    reps += 1;
    interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ease);
    xp = 12;
  } else {
    ease += 0.1;
    reps += 1;
    interval = reps === 1 ? 2 : Math.round(interval * ease * 1.3);
    xp = 18;
  }

  return { ease_factor: ease, interval_days: interval, repetitions: reps, xp };
}
