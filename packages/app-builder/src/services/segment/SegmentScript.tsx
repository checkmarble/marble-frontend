export function SegmentScript({ script, nonce }: { script: string; nonce?: string }) {
  return (
    <script
      async={true}
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: script,
      }}
    />
  );
}
