import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";
import { Typography } from "./ui/typography";
import { useTranslation } from "react-i18next";

interface ModelPickerProps {
  handler: (value: string) => void;
  value: string;
}

export function ModelPicker(props: ModelPickerProps) {
  const { t } = useTranslation();

  const handleItemClick = (value: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    props.handler(value);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col my-4">
        <Typography version="h4">{t("drone.model.title")}: </Typography>
      </div>
      <Select onValueChange={props.handler} value={props.value}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("drone.model.title") + "..."} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t("drone.model.title")}</SelectLabel>
            <SelectItem value="1" onMouseDown={handleItemClick("s1")}>
              {t("drone.model.title")} 1
            </SelectItem>
            <SelectItem value="2" onMouseDown={handleItemClick("s2")}>
              {t("drone.model.title")} 2
            </SelectItem>
            <SelectItem value="3" onMouseDown={handleItemClick("s3")}>
              {t("drone.model.title")} 3
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex flex-col space-y-2 my-4 text-sm">
        <Label>
          <b>{t("drone.model.title")} 1:</b> {t("drone.model.m1")}
        </Label>
        <Label>
          <b>{t("drone.model.title")} 2:</b> {t("drone.model.m2")}
        </Label>
        <Label>
          <b>{t("drone.model.title")} 3:</b> {t("drone.model.m3")}
        </Label>
      </div>
    </div>
  );
}

export default ModelPicker;
