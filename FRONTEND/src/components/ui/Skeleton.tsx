interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', style }: SkeletonProps) => {
  return <div className="skeleton" style={{ width, height, borderRadius, ...style }} />;
};
