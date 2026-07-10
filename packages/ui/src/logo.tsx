import Image from 'next/image';

export function Logo() {
  return (
    <a href="/" aria-label="ByteBank - Página inicial" className="flex items-center gap-2">
      <Image
        src="/images/avatar3.png"
        alt=""
        aria-hidden="true"
        width={44}
        height={44}
        className="object-contain"
        priority
      />
      <Image
        src="/images/logo.png"
        alt="ByteBank"
        width={100}
        height={24}
        className="object-contain"
        priority
      />
    </a>
  );
}
