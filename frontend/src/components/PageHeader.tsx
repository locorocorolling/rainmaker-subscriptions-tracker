interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {subtitle && (
          <p className="text-gray-600">{subtitle}</p>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}