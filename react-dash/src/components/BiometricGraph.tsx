import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useTranslation } from "react-i18next";

// Type definitions
interface Coefficients {
  b: number;
  h: number;
  x: number;
  g: number;
  s: number;
  const: number;
}

interface CoeffsDict {
  [key: string]: Coefficients;
}

interface BiometricGraphProps {
  price: number[];
  security: number[];
  gate: number[];
  identity: string; // "Casa" o "Aeroporto"
  bioSecurity: number[]; // Biometric Security Time
  bioGate: number[]; // Biometric Gate Time
}

// Logit probability function
const logitProb = (
  coeffs: Coefficients,
  B: number,
  H: number,
  X: number,
  G: number,
  S: number,
  b: number,
  h: number,
  x: number,
  g: number,
  s: number,
): number => {
  const linearRef =
    coeffs.const +
    coeffs.b * B +
    coeffs.h * H +
    coeffs.x * X +
    coeffs.g * G +
    coeffs.s * S;
  const linearVal =
    coeffs.const +
    coeffs.b * b +
    coeffs.h * h +
    coeffs.x * x +
    coeffs.g * g +
    coeffs.s * s;
  return (
    (100 * Math.exp(linearVal)) / (Math.exp(linearRef) + Math.exp(linearVal))
  );
};

// Coefficients dictionary
const coeffsDict: CoeffsDict = {
  "Class 1": {
    b: -2.939027,
    h: 0.6691704,
    x: -0.1012086,
    g: 0.0235957,
    s: -0.0652274,
    const: 0,
  },
  "Class 2": {
    b: 1.681342,
    h: 0.4759244,
    x: -0.1479497,
    g: -0.1011663,
    s: -0.0580061,
    const: 0,
  },
  "Class 1 - Business": {
    b: -2.697979,
    h: 1.643144,
    x: -0.0693062,
    g: 0.308092,
    s: 0.0418367,
    const: 0,
  },
  "Class 2 - Business": {
    b: 1.32608,
    h: 0.1211617,
    x: -0.117378,
    g: -0.151521,
    s: -0.05661,
    const: 0,
  },
  "Class 1 - Leisure": {
    b: -2.865958,
    h: 0.001302,
    x: -0.228802,
    g: -0.0331192,
    s: -0.0606975,
    const: 0,
  },
  "Class 2 - Leisure": {
    b: 2.41825,
    h: 1.046411,
    x: -0.2415749,
    g: 0.0043248,
    s: -0.038333,
    const: 0,
  },
};

const BiometricGraph: React.FC<BiometricGraphProps> = ({
  price,
  security,
  gate,
  identity,
  bioSecurity,
  bioGate,
}) => {
  const { t } = useTranslation();

  // Parametri fissi
  const B = 0; // tradizionale = 0
  const H = 0; // tradizionale = non a casa
  const b = 1; // check-in biometrico = 1

  // Converti luogo in booleano
  const h = identity === "Casa" ? 1 : 0; // H: casa / aeroporto

  const chartData = useMemo(() => {
    // Analisi prezzo
    const data = [];
    const numPoints = 150;

    // Baseline
    const baselinePrice = price[0]; // X
    const baselineGateTime = gate[0]; // G
    const baselineSecurityTime = security[0]; // S

    const altGateTime = bioGate[0]; // g
    const altSecurityTime = bioSecurity[0]; // s

    for (let i = 0; i <= numPoints; i++) {
      const deltaPerc = -0.5 + (1.5 * i) / numPoints;
      const xVal = price[0] * (1 + deltaPerc); // x

      const overall =
        0.31 *
          logitProb(
            coeffsDict["Class 1"],
            B,
            H,
            baselinePrice,
            baselineGateTime,
            baselineSecurityTime,
            b,
            h,
            xVal,
            altGateTime,
            altSecurityTime,
          ) +
        0.69 *
          logitProb(
            coeffsDict["Class 2"],
            B,
            H,
            baselinePrice,
            baselineGateTime,
            baselineSecurityTime,
            b,
            h,
            xVal,
            altGateTime,
            altSecurityTime,
          );

      const business =
        0.31 *
          logitProb(
            coeffsDict["Class 1 - Business"],
            B,
            H,
            baselinePrice,
            baselineGateTime,
            baselineSecurityTime,
            b,
            h,
            xVal,
            altGateTime,
            altSecurityTime,
          ) +
        0.69 *
          logitProb(
            coeffsDict["Class 2 - Business"],
            B,
            H,
            baselinePrice,
            baselineGateTime,
            baselineSecurityTime,
            b,
            h,
            xVal,
            altGateTime,
            altSecurityTime,
          );

      const leisure =
        0.31 *
          logitProb(
            coeffsDict["Class 1 - Leisure"],
            B,
            H,
            baselinePrice,
            baselineGateTime,
            baselineSecurityTime,
            b,
            h,
            xVal,
            altGateTime,
            altSecurityTime,
          ) +
        0.69 *
          logitProb(
            coeffsDict["Class 2 - Leisure"],
            B,
            H,
            baselinePrice,
            baselineGateTime,
            baselineSecurityTime,
            b,
            h,
            xVal,
            altGateTime,
            altSecurityTime,
          );

      data.push({
        deltaPerc: deltaPerc * 100,
        overall,
        business,
        leisure,
      });
    }
    return data;
  }, [price, security, gate, identity, h, bioGate, bioSecurity]);

  const thresholdData = useMemo(() => {
    const thresholds = [-0.5, -0.25, 0, 0.25, 0.5, 1.0];

    return thresholds.map((thr) => {
      const closest = chartData.reduce((prev, curr) =>
        Math.abs(curr.deltaPerc - thr * 100) <
        Math.abs(prev.deltaPerc - thr * 100)
          ? curr
          : prev,
      );

      return {
        threshold: `${thr >= 0 ? "+" : ""}${(thr * 100).toFixed(0)}%`,
        overall: closest.overall.toFixed(1),
        business: closest.business.toFixed(1),
        leisure: closest.leisure.toFixed(1),
      };
    });
  }, [chartData]);

  return (
    <div className="w-full space-y-4 mr-8">
      <div className="bg-background text-foreground rounded-lg p-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              allowDataOverflow={true}
              dataKey="deltaPerc"
              label={{
                value: t("biometric.table.valuePrice"),
                position: "insideBottom",
                offset: -5,
              }}
              domain={[-50, 100]}
              ticks={[-50, -25, 0, 25, 50, 75, 100]}
            />
            <YAxis
              label={{
                value: t("biometric.table.acceptance"),
                angle: -90,
                position: "outerLeft",
                offset: -30,
              }}
              domain={[0, 100]}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}%`}
              labelFormatter={(label) =>
                `Δ${t("biometric.table.literalPrice")}: ${Number(label).toFixed(1)}%`
              }
            />
            <Legend />
            <ReferenceLine x={0} stroke="#FF0000" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="overall"
              stroke="#3B82F6"
              strokeWidth={2}
              name={t("biometric.table.overall")}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="business"
              stroke="#F59E0B"
              strokeWidth={2}
              name={t("biometric.table.business")}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="leisure"
              stroke="#10B981"
              strokeWidth={2}
              name={t("biometric.table.leisure")}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-background text-foreground rounded-lg border overflow-hidden">
        <h3 className="text-lg font-semibold p-3 border-b">
          {t("biometric.table.title")}
          {t("biometric.table.price")}
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Δ {t("biometric.table.literalPrice")}</TableHead>
              <TableHead>{t("biometric.table.overall")}</TableHead>
              <TableHead>{t("biometric.table.business")}</TableHead>
              <TableHead>{t("biometric.table.leisure")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {thresholdData.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.threshold}</TableCell>
                <TableCell>{row.overall}%</TableCell>
                <TableCell>{row.business}%</TableCell>
                <TableCell>{row.leisure}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BiometricGraph;
