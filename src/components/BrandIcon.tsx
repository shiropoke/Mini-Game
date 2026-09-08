export function BrandIcon({ className = '' }: { className?: string }) {
  return <img className={`brand-icon ${className}`.trim()} src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" aria-hidden="true" />;
}
