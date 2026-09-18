import brandMark from "/assets/3.jpg";
import brandMarkWebp from "/assets/3.small.webp";

export function BrandMark({
  alt = "Dr. Al Hasan Al Saiem",
  className = "",
  eager = false,
}: {
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <picture>
      <source type="image/webp" srcSet={brandMarkWebp} />
      <img
        src={brandMark}
        alt={alt}
        className={className}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}