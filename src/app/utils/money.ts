

// utils/money.ts
export const toPaisa = (amountBDT: number) => Math.round(amountBDT * 100);
export const fromPaisa = (amountPaisa: number) => amountPaisa / 100;
