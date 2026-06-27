interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner = ({ size = 'md' }: SpinnerProps) => {
  return <span className={`spinner spinner-${size}`} />;
};
