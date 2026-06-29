export function Spinner({ size = 40 }: { size?: number }) {
  return (
    <div className="spinner-wrap">
      <div
        className="spinner"
        style={{ width: size, height: size, borderWidth: Math.max(3, size / 12) }}
      />
    </div>
  );
}
