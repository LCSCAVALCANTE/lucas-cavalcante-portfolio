import DottedBg2 from "@/components/DottedBg2";

export function PageBackground() {
  return (
    // opacity-30: sem isso, nas fases claras da animação a tela inteira vira azul-claro.
    <div className="pointer-events-none absolute inset-0 z-0 opacity-30" aria-hidden="true">
      <DottedBg2
        bgColor="#080D16"
        colors={["#38BDF899", "#60A5FA99", "#A78BFA99"]}
        frequency={2}
        speed={4}
        cellSize={1}
        gamma={5}
        paletteBias={-1}
      />
    </div>
  );
}
