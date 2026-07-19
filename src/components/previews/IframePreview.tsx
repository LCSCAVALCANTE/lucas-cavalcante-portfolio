// Embute o HTML real do projeto (clonado 1:1 do app de producao), so' que
// com uma fonte de dados 100% ficticia embutida no proprio arquivo estatico
// (ver public/previews/*.html) - nenhuma chamada de rede real acontece.
export function IframePreview({ src, label }: { src: string; label: string }) {
  return (
    <div>
      <iframe
        src={src}
        title={label}
        loading="lazy"
        className="h-[640px] w-full rounded-xl border-0 bg-white"
      />
    </div>
  );
}
