import DottedBg2 from "@/components/DottedBg2";

export function PageBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[#080D16] md:hidden" />
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background:
            "radial-gradient(90% 48% at 50% 0%, rgba(56, 189, 248, 0.22), transparent 72%), radial-gradient(75% 42% at 100% 36%, rgba(167, 139, 250, 0.16), transparent 75%), radial-gradient(65% 38% at 0% 72%, rgba(96, 165, 250, 0.12), transparent 76%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-60 md:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(96, 165, 250, 0.52) 1px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          maskImage:
            "linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.7) 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.7) 60%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 hidden md:block">
        <DottedBg2
          bgColor="#080D16"
          colors={["#38BDF899", "#60A5FA99", "#A78BFA99"]}
          frequency={2}
          speed={4}
          cellSize={1}
          gamma={5}
          paletteBias={-1}
          disableOnMobile
        />
      </div>
    </div>
  );
}
