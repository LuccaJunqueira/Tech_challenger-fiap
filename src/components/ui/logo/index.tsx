import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" aria-label="ByteBank - Página inicial" className="flex items-center gap-2">
      {/* Imagem decorativa — aria-hidden para leitores de tela ignorarem */}
      <Image
        src="/images/avatar3.png"
        alt=""
        aria-hidden="true"
        width={44}
        height={44}
        className="object-contain"
        priority
      />
      {/* Imagem com significado — alt descritivo */}
      <Image
        src="/images/logo.png"
        alt="ByteBank"
        width={100}
        height={24}
        className="object-contain"
        priority
      />
    </Link>
  );
}