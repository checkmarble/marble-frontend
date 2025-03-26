export const tagColors = ['#C8C3FF', '#FDE9AD', '#FFA89A', '#B7DFF5', '#B2E5BA'] as const;

export type TagColor = (typeof tagColors)[number];
