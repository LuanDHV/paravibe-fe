// src/components/layout/AuthLayout.tsx
interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-5">
      <div className="w-full container mx-auto ">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            ParaVibe
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover music with AI-powered recommendations
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
