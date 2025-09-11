import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Typography } from "./ui/typography";
import { Button } from "./ui/button";
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
          <Typography version="h2">MOST</Typography>
        </NavigationMenuItem>
        <NavigationMenuItem className="px-16">
          <Button onClick={() => props.setNightMode(!props.nightMode)}>
            {!props.nightMode ? "🌜" : "🌞"}
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navbar;
