declare namespace JSX {
  /**
   * Chatlio
   */
  interface IntrinsicElements {
    ['chatlio-widget']: ChatlioWidget;
  }
  // More info here: https://chatlio.com/docs/api-v1/
  interface ChatlioWidget {
    widgetid: string;
    'data-start-hidden'?: boolean;
  }
}
