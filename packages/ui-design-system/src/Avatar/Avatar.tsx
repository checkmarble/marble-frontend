import {
  type AvatarProps as RootAvatarProps,
  Fallback,
  Image,
  Root,
} from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

const avatar = cva(
  'inline-flex select-none items-center justify-center overflow-hidden rounded-full bg-purple-25 shrink-0',
  {
    variants: {
      size: {
        xs: 'size-6 text-xs',
        s: 'size-8 text-s',
        m: 'size-10 text-m',
        l: 'size-14 text-l',
        xl: 'size-16 text-l',
      },
    },
    defaultVariants: {
      size: 'm',
    },
  },
);

export type AvatarProps = Omit<RootAvatarProps, 'asChild'> &
  VariantProps<typeof avatar> & {
    firstName?: string;
    lastName?: string;
    src?: string;
  };

export function Avatar({
  firstName,
  lastName,
  src,
  size,
  className,
  ...props
}: AvatarProps) {
  return (
    <Root
      className={avatar({
        size,
        className,
      })}
      {...props}
    >
      <Image
        referrerPolicy="no-referrer"
        className="size-full object-cover"
        src={src}
        alt={
          firstName || lastName
            ? `${firstName ?? ''} ${lastName ?? ''}`
            : 'Unknown user'
        }
      />
      <Fallback
        className="text-grey-100 flex size-full items-center justify-center text-center font-normal uppercase"
        delayMs={src ? 400 : 0}
      >
        {`${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}` || '👤'}
      </Fallback>
    </Root>
  );
}
