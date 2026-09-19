import AuthProvider from "@/app/Components/AuthProvider";

export default function AuthLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
