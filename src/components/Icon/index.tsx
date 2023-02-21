type TIconfont = {
  name: string;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
};

function Icon({
  name,
  color = "inherit",
  width = 16,
  height = 16,
  className = "",
}: TIconfont) {
  const style = {
    fill: color,
    width,
    height,
  };

  return (
    <svg className={`icon ${className}`} aria-hidden="true" style={style}>
      <use xlinkHref={`#${name}`}></use>
    </svg>
  );
}

export default Icon;
