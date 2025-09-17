import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Separator } from "./ui/separator";
import MOSTLogo from "@/assets/MOST.png";

interface NavbarProps {
  nightMode: boolean;
  setNightMode: Dispatch<SetStateAction<boolean>>;
  setPage: Dispatch<SetStateAction<string>>;
}

const Navbar = (props: NavbarProps) => {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {/* Logo */}
        <NavigationMenuItem>
          <img src={MOSTLogo} alt="MOST" className="h-16 w-auto" />
        </NavigationMenuItem>
        {/* Electric Aircraft */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Electric Aircraft</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink
              onClick={() => props.setPage("electric-dashboard")}
            >
              Mappa
            </NavigationMenuLink>
            <Separator />
            <NavigationMenuLink
              onClick={() => props.setPage("electric-impact")}
            >
              Impatto Economico - Sociale
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {/* Evoluzione del settore */}
        <NavigationMenuItem>
          <NavigationMenuLink onClick={() => props.setPage("evolution")}>
            Evoluzione del settore
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Droni cargo */}
        <NavigationMenuItem>
          <NavigationMenuLink onClick={() => props.setPage("cargo")}>
            Droni cargo
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Riconoscimento biometrico */}
        <NavigationMenuItem>
          <NavigationMenuLink onClick={() => props.setPage("biometric")}>
            Riconoscimento biometrico
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Night mode */}
        <NavigationMenuItem className="mx-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => props.setNightMode(!props.nightMode)}
            aria-label={
              props.nightMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {props.nightMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navbar;
