import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

function LanguageSwitch() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-2">
      <Button
        variant={i18n.language === "it" ? "default" : "outline"}
        onClick={() => i18n.changeLanguage("it")}
      >
        🇮🇹 IT
      </Button>
      <Button
        variant={i18n.language === "en" ? "default" : "outline"}
        onClick={() => i18n.changeLanguage("en")}
      >
        🇬🇧 EN
      </Button>
    </div>
  );
}

export default LanguageSwitch;
