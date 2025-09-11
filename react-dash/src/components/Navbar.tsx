import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Typography } from "./ui/typography";
import { Button } from "./ui/button";
import { Moon, Sun, Plane } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface NavbarProps {
  nightMode: boolean;
  setNightMode: Dispatch<SetStateAction<boolean>>;
}

const Navbar = (props: NavbarProps) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <Typography version="h2">MOST</Typography>
          </div>
        </NavigationMenuItem>
        <NavigationMenuItem className="px-16">
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
