import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";
import { Moon, Sun, Menu, X, ChevronDown } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [electricSubmenuOpen, setElectricSubmenuOpen] = useState(false);

  const handlePageChange = (page: string) => {
    props.setPage(page);
    setMobileMenuOpen(false);
    setElectricSubmenuOpen(false);
  };

  return (
    <>
      {/* Menu Desktop */}
      <NavigationMenu className="hidden lg:flex" viewport={false}>
        <NavigationMenuList>
          {/* Logo */}
          <NavigationMenuItem>
            <img src={MOSTLogo} alt="MOST" className="h-16 w-auto" />
          </NavigationMenuItem>
          {/* Evoluzione del settore */}
          <NavigationMenuItem>
            <NavigationMenuLink
              onClick={() => props.setPage("demand-dashboard")}
            >
              {t("navbar.evolution")}
            </NavigationMenuLink>
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
              <NavigationMenuLink onClick={() => props.setPage("social")}>
                {t("navbar.electric.social")}
              </NavigationMenuLink>
            </NavigationMenuContent>
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

      {/* Mobile */}
      <div className="lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <img src={MOSTLogo} alt="MOST" className="h-12 w-auto" />

          <div className="flex items-center gap-2">
            {/* Night mode */}
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

            {/* Linguaggio */}
            <LanguageSwitch />

            {/* Tasto menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="border-t bg-background">
            <nav className="flex flex-col space-y-1 px-4 py-3">
              {/* Evoluzione del settore */}
              <button
                onClick={() => handlePageChange("demand-dashboard")}
                className="px-4 py-3 text-left hover:bg-accent rounded-md transition-colors"
              >
                {t("navbar.evolution")}
              </button>

              {/* Electric Aircraft */}
              <div>
                <button
                  onClick={() => setElectricSubmenuOpen(!electricSubmenuOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-accent rounded-md transition-colors"
                >
                  <span>{t("navbar.electric.title")}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      electricSubmenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {electricSubmenuOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    <button
                      onClick={() => handlePageChange("electric-dashboard")}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      {t("navbar.electric.map")}
                    </button>
                    <button
                      onClick={() => handlePageChange("emissions-dashboard")}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      {t("navbar.electric.emissions")}
                    </button>
                    <button
                      onClick={() => handlePageChange("social")}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      {t("navbar.electric.social")}
                    </button>
                  </div>
                )}
              </div>

              {/* Droni cargo */}
              <button
                onClick={() => handlePageChange("cargo")}
                className="px-4 py-3 text-left hover:bg-accent rounded-md transition-colors"
              >
                {t("navbar.cargo")}
              </button>

              {/* Riconoscimento biometrico */}
              <button
                onClick={() => handlePageChange("biometric")}
                className="px-4 py-3 text-left hover:bg-accent rounded-md transition-colors"
              >
                {t("navbar.biometric")}
              </button>
            </nav>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
