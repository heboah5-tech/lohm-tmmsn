import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main dir="rtl" className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/40 px-4 py-10 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={{
          variables: {
            colorPrimary: "#2563eb",
            colorBackground: "white",
            colorForeground: "#0f172a",
            borderRadius: "1rem",
            fontFamily: "Cairo, Tajawal, sans-serif",
          },
        }}
      />
    </main>
  );
}