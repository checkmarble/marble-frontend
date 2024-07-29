export function SegmentScript({ script }: { script: string }) {
  return (
    <script
      async={true}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: script,
      }}
    />
  );
}
