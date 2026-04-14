import { Link } from 'react-router-dom';

type BrandLogoProps = {
  to?: string;
  alt?: string;
  className?: string;
  linkClassName?: string;
  imageClassName?: string;
  title?: string;
  titleClassName?: string;
  textBlockClassName?: string;
  caption?: string;
  captionClassName?: string;
};

const logoSrc = '/igo-farmgate-mandi-logo.png';

export const BrandLogo = ({
  to,
  alt = 'Farmgate Mandi',
  className = 'flex flex-col items-start gap-1',
  linkClassName = 'block shrink-0',
  imageClassName = 'h-12 w-auto',
  title,
  titleClassName = 'text-sm font-black leading-none tracking-tight text-gray-900',
  textBlockClassName = 'flex flex-col items-start gap-1',
  caption,
  captionClassName = 'text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400',
}: BrandLogoProps) => {
  const content = (
    <div className={className}>
      <img
        src={logoSrc}
        alt={alt}
        className={imageClassName}
        loading="eager"
        decoding="async"
      />
      {title || caption ? (
        <div className={textBlockClassName}>
          {title ? <span className={titleClassName}>{title}</span> : null}
          {caption ? <span className={captionClassName}>{caption}</span> : null}
        </div>
      ) : null}
    </div>
  );

  if (!to) return content;

  return (
    <Link to={to} className={linkClassName} aria-label={alt}>
      {content}
    </Link>
  );
};
