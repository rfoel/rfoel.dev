import { useEffect, useState } from "react";

// Troca a frase a cada poucos segundos. Leitores de tela recebem só a primeira.
export function Rotator({ phrases, interval = 2600 }: { phrases: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % phrases.length), interval);
    return () => clearInterval(id);
  }, [phrases.length, interval]);

  return (
    <>
      <span className="sr-only">{phrases[0]}</span>
      <span aria-hidden className="relative inline-block whitespace-nowrap text-(--muted)">
        {/* A primeira frase já vem no HTML, sem animar; só as trocas animam */}
        <span key={index} className={index ? "animate-rise inline-block" : "inline-block"}>
          {phrases[index]}
        </span>
      </span>
    </>
  );
}
