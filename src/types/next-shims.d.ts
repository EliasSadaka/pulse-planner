declare module "next" {
  export interface Metadata {
    [key: string]: unknown;
  }
}

declare module "next/font/google" {
  export const Geist: (config: Record<string, unknown>) => { variable: string };
  export const Geist_Mono: (config: Record<string, unknown>) => { variable: string };
}
