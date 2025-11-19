import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

interface EmissionsDialogProps {
  scenario: string;
  className: string;
}

const EmissionsDialog = (props: EmissionsDialogProps) => {
  const { t } = useTranslation();

  const InnerDialog = () => {
    if (props.scenario === "s1")
      return (
        <>
          <b>Scenario 1</b>
          <p>{t("emissions.info.s1.description")}</p>
          <br />
          {t("emissions.info.s1.first.description")}
          <ul className="my-1 ml-6 list-disc [&>li]:mt-1">
            <li>{t("emissions.info.s1.first.IT")}</li>
            <li>{t("emissions.info.s1.first.EU")}</li>
          </ul>
          {t("emissions.info.s1.second")}
          <ul className="my-1 ml-6 list-disc [&>li]:mt-1">
            <li> ES-19: 0,122 kWh / ({t("emissions.info.s1.seat")} × km) </li>
            <li>
              {" "}
              LF (load factor = 0,62): 0,077 kWh / (
              {t("emissions.info.s1.seat")} × km){" "}
            </li>
          </ul>
        </>
      );
    else
      return (
        <>
          <b>Scenario 2 - Scenario 3</b>
          <p>{t("emissions.info.s2s3.description")}</p>
          <br />
          {t("emissions.info.s2s3.code")}
          <ul className="ml-6 list-disc [&>li]:mt-1">
            <li>{t("emissions.info.s2s3.EU30")}</li>
            <li>{t("emissions.info.s2s3.EUFR")}</li>
          </ul>
        </>
      );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-6 md:m-auto">{t("emissions.info.button")}</Button>
      </DialogTrigger>
      <DialogContent>
        <InnerDialog />
      </DialogContent>
    </Dialog>
  );
};

export default EmissionsDialog;
