import {
  type AvatarProps as RootAvatarProps,
  Fallback,
  Image,
  Root,
} from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';

const avatar = cva(
  'inline-flex select-none items-center justify-center overflow-hidden rounded-full bg-purple-25',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        s: 'h-8 w-8 text-s',
        m: 'h-10 w-10 text-m',
        l: 'h-14 w-14 text-l',
        xl: 'h-16 w-16 text-l',
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
        className="h-full w-full object-cover"
        src={src}
        alt={
          firstName || lastName
            ? `${firstName ?? ''} ${lastName ?? ''}`
            : 'Unknown user'
        }
      />
      <Fallback
        className="text-grey-100 flex h-full w-full items-center justify-center text-center font-normal uppercase"
        delayMs={src ? 400 : 0}
      >
        {`${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}` || '👤'}
      </Fallback>
    </Root>
  );
}
