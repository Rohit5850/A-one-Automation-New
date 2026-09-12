import EmployeeShell from "@/app/Components/EmployeeShell";
import Providers from "../hr/Providers";

export default function EmployeeLayout({ children }) {
  return ( <Providers> <EmployeeShell>{children}</EmployeeShell> </Providers>) ;
}


