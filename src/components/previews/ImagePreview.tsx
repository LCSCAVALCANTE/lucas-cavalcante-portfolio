// Mostra uma ilustracao estatica (imagem/SVG) do projeto, para casos em que
// nao existe um HTML/CSS/JS standalone que possa ser embutido com fidelidade
// (ex.: extensoes de navegador que atuam sobre a tela de um sistema de
// terceiros). A imagem em si ja e' 100% ficticia/ilustrativa.
export function ImagePreview({
  src,
  label,
  caption,
}: {
  src: string;
  label: string;
  caption?: string;
}) {
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-foreground"
        >
          Abrir imagem em tela cheia (nova aba)
        </a>
      </div>
      <img src={src} alt={label} className="w-full rounded-xl border border-border bg-white" />
      {caption && <p className="mt-3 text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}
