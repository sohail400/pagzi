export function startDemoClock(stageRef, onStep) {
  const tick = () => {
    if (document.visibilityState === "hidden") return;
    const node = stageRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const height = window.innerHeight || document.documentElement.clientHeight || 0;
    if (rect.bottom < -200 || rect.top > height + 200) return;
    onStep(100);
  };
  const id = window.setInterval(tick, 100);
  return () => window.clearInterval(id);
}
