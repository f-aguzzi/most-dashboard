import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Typography } from "./ui/typography";
import { Button } from "./ui/button";
import { Moon, Sun, Plane } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Separator } from "./ui/separator";

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
          <div className="flex items-center gap-2 mx-2">
            <Plane className="h-6 w-6 text-primary" />
            <Typography version="h2">MOST</Typography>
          </div>
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
