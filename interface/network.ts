import * as yup from "yup";

export interface NetworkInfo {
  type: string;
  state: number;
  device: string;
  mac: string;
  name: string;
  ip: string;
  gateway: string;
  dns: [string, string];
  subnet: string;
  signal_level: number;
  quality: number;
  security: string;
}
export const _network = yup.object().shape({
  type: yup.string().required(),
  state: yup.number().required(),
  device: yup.string().required(),
  mac: yup.string().required(),
  name: yup.string().required(),
  ip: yup.string(),
  gateway: yup.string(),
  dns: yup.array(),
  subnet: yup.string(),
  signal_level: yup.number(),
  quality: yup.number(),
  security: yup.string(),
});

