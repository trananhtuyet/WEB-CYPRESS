export const paymentConfigStorageKey = "dolia_bank_payment_config";

export const defaultPaymentConfig = {
  bankCode: "MB",
  accountNumber: "0123456789",
  accountName: "TRAN ANH TUYET",
  transferNotePrefix: "DOLIA",
  customQrImage: "",
};

export const getPaymentConfig = () => {
  try {
    const stored = localStorage.getItem(paymentConfigStorageKey);
    return stored ? { ...defaultPaymentConfig, ...JSON.parse(stored) } : defaultPaymentConfig;
  } catch {
    return defaultPaymentConfig;
  }
};

export const savePaymentConfig = (config) => {
  localStorage.setItem(paymentConfigStorageKey, JSON.stringify({ ...defaultPaymentConfig, ...config }));
};

export const createBankQrUrl = ({ amount = 0, orderCode = "ORDER", config = getPaymentConfig() } = {}) => {
  if (config.customQrImage) {
    return config.customQrImage;
  }

  const bankCode = encodeURIComponent(config.bankCode || defaultPaymentConfig.bankCode);
  const accountNumber = encodeURIComponent(config.accountNumber || defaultPaymentConfig.accountNumber);
  const accountName = encodeURIComponent(config.accountName || defaultPaymentConfig.accountName);
  const note = encodeURIComponent(`${config.transferNotePrefix || "DOLIA"} ${orderCode}`);
  const safeAmount = Math.max(Number(amount) || 0, 0);

  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${safeAmount}&addInfo=${note}&accountName=${accountName}`;
};
