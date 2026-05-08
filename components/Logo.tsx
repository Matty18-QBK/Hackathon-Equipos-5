import Image from "next/image";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function Logo({ className = "", width = 160, height = 96, priority = false }: LogoProps) {
  return (
    <Image
      src="/zenfiscal-logo.png"
      alt="ZenFiscal"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
