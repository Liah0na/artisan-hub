type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

export default function Divider({
  orientation = 'horizontal',
  className = '',
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`
        ${orientation === "vertical" ? "w-px h-6" : "h-px w-full"}
        bg-gray-200
        ${className}
      `}
    />
  );
}