import { PanelSharpFactory } from './Panel';

export function PanelOverlay() {
  const sharp = PanelSharpFactory.useSharp();

  return (
    <div
      className="absolute inset-0 bg-grey-primary/10 z-20 backdrop-blur-xs animate-overlay-show"
      onClick={sharp.actions.close}
      aria-hidden="true"
    />
  );
}
