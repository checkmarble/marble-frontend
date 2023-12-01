export function SegmentScript({ script }: { script: string }) {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: script,
      }}
    />
  );
}
