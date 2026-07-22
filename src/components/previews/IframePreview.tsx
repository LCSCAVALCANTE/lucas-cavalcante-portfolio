// Embute o HTML real do projeto (clonado 1:1 do app de producao), so' que
// com uma fonte de dados 100% ficticia embutida no proprio arquivo estatico
// (ver public/previews/*.html) - nenhuma chamada de rede real acontece.
export function IframePreview({ src, label }: { src: string; label: string }) {
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-foreground"
        >
          Abrir em tela cheia (nova aba)
        </a>
      </div>
      <iframe
        src={src}
        title={label}
        loading="lazy"
        className="h-[85vh] min-h-[700px] w-full rounded-xl border-0 bg-white"
      />
    </div>
  );
}
