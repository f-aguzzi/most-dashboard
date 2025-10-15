import { Typography } from "@/components/ui/typography";
import { useState } from "react";
import BiometricDisplaySelector from "@/components/BiometricDisplaySelector";
import { Eye } from "lucide-react";
import LabeledSlider from "@/components/LabeledSlider";
import BiometricIdentitySelector from "@/components/BiometricIdentitySelector";
import BiometricGraph from "@/components/BiometricGraph";
import { useTranslation } from "react-i18next";

function BiometricDashboard() {
  const { t } = useTranslation();

  const [display, setDisplay] = useState("Prezzi");

  const displayHandler = (value: string) => {
    setDisplay(value);
  };

  const [price, setPrice] = useState([50]);
  const handlePrice = (value: number[]) => {
    setPrice(value);
  };

  const [security, setSecurity] = useState([15]);
  const handleSecurity = (value: number[]) => {
    setSecurity(value);
  };

  const [gate, setGate] = useState([10]);
  const handleGate = (value: number[]) => {
    setGate(value);
  };

  const [bioPrice, setBioPrice] = useState([50]);
  const handleBioPrice = (value: number[]) => {
    setBioPrice(value);
  };

  const [identity, setIdentity] = useState("Casa");
  const handleIdentity = (value: string) => {
    setIdentity(value);
  };

  const [bioSecurity, setBioSecurity] = useState([15]);
  const handleBioSecurity = (value: number[]) => {
    setBioSecurity(value);
  };

  const [bioGate, setBioGate] = useState([10]);
  const handleBioGate = (value: number[]) => {
    setBioGate(value);
  };

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("biometric.title")}
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr] gap-6 mt-6 h-auto w-auto">
        <div className="flex flex-col space-y-6 h-auto mx-8">
          {/* Visualizzazione */}
          <div className="flex flex-col space-y-2">
            <div className="flex flex-row space-x-3">
              <Eye />
              <Typography version="p">
                {t("biometric.display.title")}
              </Typography>
            </div>
            <BiometricDisplaySelector handler={displayHandler} />
          </div>
          {/* Sezione parametri */}
          <Typography version="h2">{t("biometric.parameters")}</Typography>
          {/* Tradizionale */}
          <Typography version="h3">{t("biometric.traditional")}</Typography>
          <div className="flex flex-col space-y-2">
            <LabeledSlider
              title={t("biometric.price")}
              value={price}
              onValueChange={handlePrice}
              defaultValue={[50]}
              min={25}
              max={150}
            />
            <LabeledSlider
              title={t("biometric.time")}
              value={security}
              onValueChange={handleSecurity}
              defaultValue={[15]}
              min={1}
              max={30}
            />
            <LabeledSlider
              title={t("biometric.gate")}
              value={gate}
              onValueChange={handleGate}
              defaultValue={[10]}
              min={1}
              max={20}
            />
          </div>
          <Typography version="h3">{t("biometric.biometric")}</Typography>
          <div className="flex flex-col space-y-4">
            <BiometricIdentitySelector handler={handleIdentity} />
            {display === "Prezzi" ? (
              <LabeledSlider
                title={t("biometric.bioparameters.airfare")}
                value={bioPrice}
                onValueChange={handleBioPrice}
                defaultValue={[50]}
                min={25}
                max={150}
              />
            ) : (
              <>
                <LabeledSlider
                  title={t("biometric.bioparameters.security")}
                  value={bioSecurity}
                  onValueChange={handleBioSecurity}
                  defaultValue={[15]}
                  min={1}
                  max={30}
                />
                <LabeledSlider
                  title={t("biometric.bioparameters.gate")}
                  value={bioGate}
                  onValueChange={handleBioGate}
                  defaultValue={[10]}
                  min={1}
                  max={20}
                />
              </>
            )}
          </div>
        </div>
        {/* Mappa */}
        <BiometricGraph
          display={display}
          price={price}
          security={security}
          gate={gate}
          identity={identity}
          bioPrice={bioPrice}
          bioSecurity={bioSecurity}
          bioGate={bioGate}
        />
      </div>
    </div>
  );
}

export default BiometricDashboard;
