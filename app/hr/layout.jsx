// import HRShell from "@/app/Components/HRShell";

// export default function HRLayout({ children }) {
//   return <HRShell>{children}</HRShell>;
// }



import HRShell from "@/app/Components/HRShell";
import Providers from "./Providers";

export default function HRLayout({ children }) {
  return (
    <Providers>
      <HRShell>{children}</HRShell>
    </Providers>
  );
}

