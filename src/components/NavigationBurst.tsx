import type { CSSProperties } from "react";

const emojis = ["✨", "🚀", "⚡", "💻", "📊", "🔥", "💡", "⚙️", "🎯", "📈", "⭐", "🧠"];

export function NavigationBurst({ x, y }: { x: number; y: number }) {
  const particles = Array.from({ length: 22 }, (_, index) => {
    const angle = (-155 + (310 / 21) * index) * (Math.PI / 180);
    const distance = 75 + ((index * 37) % 115);
    return {
      emoji: emojis[index % emojis.length],
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 28,
      rotation: -140 + ((index * 53) % 280),
      delay: (index % 5) * 18,
      size: 18 + (index % 4) * 3,
    };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      <span className="project-burst-flash" style={{ left: x, top: y }} />
      {particles.map((particle, index) => (
        <span
          key={index}
          className="project-burst-particle"
          style={{
            left: x,
            top: y,
            fontSize: particle.size,
            animationDelay: `${particle.delay}ms`,
            "--burst-x": `${particle.dx}px`,
            "--burst-y": `${particle.dy}px`,
            "--burst-rotation": `${particle.rotation}deg`,
          } as CSSProperties}
        >
          {particle.emoji}
        </span>
      ))}
    </div>
  );
}
