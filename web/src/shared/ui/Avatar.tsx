import Image from "next/image";

type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: number;
};

export function Avatar({ src, alt, size = 40 }: AvatarProps) {
  return (
    <Image
      src={src ?? "/default-avatar.png"}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  );
}
