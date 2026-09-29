export function Mark({ className, color = "#6F9BFF" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 237 250" className={className} aria-hidden="true">
      <path
        d="M64.23 151.9 107.14 127.22 44.54 91.21 1.28 66.33.5 66.78v48.46l1.13.65 62.6 36.01Z"
        fill={color}
      />
      <path d="M77.36 22.57 11.92 60.21l43.26 24.88L116.59 49.77V0L77.36 22.57Z" fill={color} />
      <path
        d="M51.28 170.26.5 199.47V250l94.7-54.48 21.38-12.3v-50.53l-42.87 24.66-22.43 12.91Z"
        fill={color}
      />
      <path
        d="M192.7 88.91 170.13 101.9l-42.88 24.66-1.33.77v85.86l44.21 25.43V151.22l1.05.6 65.32-37.58V63.72L192.7 88.91Z"
        fill={color}
      />
      <path
        d="M183.22 83.46 227.02 58.26 170.13 25.54l-5.71-3.29L125.92.1v50.4l44.21 25.43 13.09 7.53Z"
        fill={color}
      />
    </svg>
  );
}