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
} from "recharts";
import { Separator } from "./ui/separator";

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
  display: string; // "Tempi" or "Prezzi"
  price: number[];
  security: number[];
  gate: number[];
  bioPrice: number[];
  identity: string; // "Casa" or "Aeroporto"
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
  display,
  price,
  security,
  gate,
  bioPrice,
  identity,
}) => {
  // Fixed parameters
  const B = 0; // traditional
  const H = 0; // traditional - not at home
  const b = 1; // biometric

  // Convert identity to h value
  const h = identity === "Casa" ? 1 : 0;

  const chartData = useMemo(() => {
    if (display === "Prezzi") {
      // Price analysis
      const data = [];
      const numPoints = 150;
      const baselinePrice = price[0];
      const altGateTime = gate[0];
      const altSecurityTime = security[0];
      const baselineGateTime = gate[0];
      const baselineSecurityTime = security[0];

      for (let i = 0; i <= numPoints; i++) {
        const deltaPerc = -0.5 + (1.5 * i) / numPoints;
        const xVal = bioPrice[0] * (1 + deltaPerc);

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
    } else {
      // Time analysis ("Tempi")
      const data = [];
      const numPoints = 150;
      const baselinePrice = price[0];
      const baselineGateTime = gate[0];
      const baselineSecurityTime = security[0];

      for (let i = 0; i <= numPoints; i++) {
        const deltaPerc = -0.8 + (1.0 * i) / numPoints;
        const gVal = gate[0] * (1 + deltaPerc);
        const sVal = security[0] * (1 + deltaPerc);

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
              bioPrice[0],
              gVal,
              sVal,
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
              bioPrice[0],
              gVal,
              sVal,
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
              bioPrice[0],
              gVal,
              sVal,
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
              bioPrice[0],
              gVal,
              sVal,
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
              bioPrice[0],
              gVal,
              sVal,
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
              bioPrice[0],
              gVal,
              sVal,
            );

        data.push({
          deltaPerc: deltaPerc * 100,
          overall,
          business,
          leisure,
        });
      }
      return data;
    }
  }, [display, price, security, gate, bioPrice, identity, h]);

  const thresholdData = useMemo(() => {
    const thresholds =
      display === "Prezzi"
        ? [-0.5, -0.25, 0, 0.25, 0.5, 1.0]
        : [-0.8, -0.6, -0.4, -0.2, 0, 0.2];

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
  }, [chartData, display]);

  return (
    <div className="w-full space-y-4 mr-8">
      <div className="bg-background text-foreground rounded-lg p-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="deltaPerc"
              label={{
                value:
                  display === "Prezzi"
                    ? "ΔPrezzo (% vs baseline)"
                    : "ΔTempo (% vs baseline)",
                position: "insideBottom",
                offset: -5,
              }}
              domain={display === "Prezzi" ? [-50, 100] : [-80, 20]}
            />
            <YAxis
              label={{
                value: "% Passeggeri che utilizzano tecnologie biometriche",
                angle: -90,
                position: "insideLeft",
              }}
              domain={[0, 100]}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}%`}
              labelFormatter={(label) =>
                `Δ${display === "Prezzi" ? "Prezzo" : "Tempo"}: ${Number(label).toFixed(1)}%`
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="overall"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Complessivo"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="business"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Business"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="leisure"
              stroke="#10B981"
              strokeWidth={2}
              name="Leisure"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-background text-foreground rounded-lg border border-gray-200 overflow-hidden">
        <h3 className="text-lg font-semibold p-3 border-b border-gray-200">
          Utilizzo stimato (%) alle soglie selezionate di Δ
          {display === "Prezzi" ? "Prezzo" : "Tempo"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Δ{display === "Prezzi" ? "Prezzo" : "Tempo"}
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Complessivo
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Business
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Leisure
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {thresholdData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-600">
                  <td className="px-3 py-3 text-sm">{row.threshold}</td>
                  <td className="px-3 py-3 text-sm">{row.overall}%</td>
                  <td className="px-3 py-3 text-sm">{row.business}%</td>
                  <td className="px-3 py-3 text-sm">{row.leisure}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BiometricGraph;
