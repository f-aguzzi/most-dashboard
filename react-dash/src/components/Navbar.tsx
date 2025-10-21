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
import LanguageSwitch from "./LanguageSwitch";
import { useTranslation } from "react-i18next";

interface NavbarProps {
  nightMode: boolean;
  setNightMode: Dispatch<SetStateAction<boolean>>;
  setPage: Dispatch<SetStateAction<string>>;
}

const Navbar = (props: NavbarProps) => {
  const { t } = useTranslation();

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {/* Logo */}
        <NavigationMenuItem>
          <img src={MOSTLogo} alt="MOST" className="h-16 w-auto" />
        </NavigationMenuItem>
        {/* Electric Aircraft */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            {t("navbar.electric.title")}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink
              onClick={() => props.setPage("electric-dashboard")}
            >
              {t("navbar.electric.map")}
            </NavigationMenuLink>
            <Separator />
            <NavigationMenuLink
              onClick={() => props.setPage("emissions-dashboard")}
            >
              {t("navbar.electric.emissions")}
            </NavigationMenuLink>
            <Separator />
            <NavigationMenuLink
              onClick={() => props.setPage("electric-impact")}
            >
              {t("navbar.electric.social")}
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {/* Evoluzione del settore */}
        <NavigationMenuItem>
          <NavigationMenuLink onClick={() => props.setPage("evolution")}>
            {t("navbar.evolution")}
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Droni cargo */}
        <NavigationMenuItem>
          <NavigationMenuLink onClick={() => props.setPage("cargo")}>
            {t("navbar.cargo")}
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Riconoscimento biometrico */}
        <NavigationMenuItem>
          <NavigationMenuLink onClick={() => props.setPage("biometric")}>
            {t("navbar.biometric")}
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
        <NavigationMenuItem className="mx-16">
          <LanguageSwitch />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navbar;
