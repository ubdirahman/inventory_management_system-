class WaafiPaymentError extends Error {
    constructor(message, statusCode = 502, details = null) {
        super(message);
        this.name = 'WaafiPaymentError';
        this.statusCode = statusCode;
        this.details = details;
    }
}

const getRequiredConfig = () => {
    const config = {
        url: process.env.WAAFI_BASE_URL || 'https://api.waafipay.net/asm',
        merchantUid: process.env.WAAFI_MERCHANT_UID,
        apiUserId: process.env.WAAFI_API_USER_ID,
        apiKey: process.env.WAAFI_API_KEY,
        paymentMethod: process.env.WAAFI_PAYMENT_METHOD || 'mwallet_account',
        currency: process.env.WAAFI_CURRENCY || 'USD',
        channelName: process.env.WAAFI_CHANNEL_NAME || 'WEB',
        countryCode: process.env.WAAFI_COUNTRY_CODE || '252',
        successCodes: (process.env.WAAFI_SUCCESS_CODES || '2001,0,00,200')
            .split(',')
            .map((code) => code.trim())
            .filter(Boolean)
    };

    const missing = ['merchantUid', 'apiUserId', 'apiKey'].filter((key) => !config[key]);
    if (missing.length > 0) {
        throw new WaafiPaymentError(`WaafiPay config missing: ${missing.join(', ')}`, 500);
    }

    return config;
};

const normalizeAccountNo = (phone, countryCode = '252') => {
    const digits = String(phone || '').replace(/\D/g, '');

    if (!digits) return '';
    if (digits.startsWith(countryCode)) return digits;
    if (digits.startsWith('0')) return `${countryCode}${digits.slice(1)}`;
    if (digits.length <= 9) return `${countryCode}${digits}`;

    return digits;
};

const findValueByKey = (value, keys) => {
    if (!value || typeof value !== 'object') return null;

    for (const key of Object.keys(value)) {
        if (keys.includes(key.toLowerCase())) return value[key];
        const nested = findValueByKey(value[key], keys);
        if (nested !== null && nested !== undefined) return nested;
    }

    return null;
};

const isSuccessfulResponse = (data, successCodes) => {
    const code = findValueByKey(data, ['responsecode', 'errorcode', 'statuscode', 'code']);
    if (code !== null && code !== undefined && successCodes.includes(String(code))) {
        return true;
    }

    const message = String(findValueByKey(data, ['responsemsg', 'message', 'status', 'description']) || '').toLowerCase();
    return message.includes('success') || message.includes('approved');
};

const createPaymentIdentity = (prefix) => {
    const safePrefix = prefix || 'POS';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return {
        requestId: `${safePrefix}-${timestamp}-${random}`,
        referenceId: `${safePrefix}-REF-${timestamp}-${random}`,
        invoiceId: `${safePrefix}-INV-${timestamp}-${random}`
    };
};

const purchase = async ({ accountNo, amount, description, referencePrefix }) => {
    const config = getRequiredConfig();
    const normalizedAccountNo = normalizeAccountNo(accountNo, config.countryCode);
    const numericAmount = Number(amount);

    if (!normalizedAccountNo) {
        throw new WaafiPaymentError('Customer phone number is required for WaafiPay.', 400);
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new WaafiPaymentError('Payment amount must be greater than zero.', 400);
    }

    const ids = createPaymentIdentity(referencePrefix);
    const payload = {
        schemaVersion: '1.0',
        requestId: ids.requestId,
        timestamp: new Date().toISOString(),
        channelName: config.channelName,
        serviceName: 'API_PURCHASE',
        serviceParams: {
            merchantUid: config.merchantUid,
            apiUserId: config.apiUserId,
            apiKey: config.apiKey,
            paymentMethod: config.paymentMethod,
            payerInfo: {
                accountNo: normalizedAccountNo
            },
            transactionInfo: {
                referenceId: ids.referenceId,
                invoiceId: ids.invoiceId,
                amount: Number(numericAmount.toFixed(2)),
                currency: config.currency,
                description: description || 'IMS POS Payment'
            }
        }
    };

    let response;
    let data;

    try {
        response = await fetch(config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        data = await response.json();
    } catch (error) {
        throw new WaafiPaymentError('WaafiPay request failed. Please try again.', 502, { error: error.message });
    }

    const success = response.ok && isSuccessfulResponse(data, config.successCodes);
    const safeRequest = {
        requestId: ids.requestId,
        referenceId: ids.referenceId,
        invoiceId: ids.invoiceId,
        accountNo: normalizedAccountNo,
        amount: Number(numericAmount.toFixed(2)),
        currency: config.currency,
        description: description || 'IMS POS Payment'
    };

    if (!success) {
        throw new WaafiPaymentError('WaafiPay payment was not approved.', 402, { request: safeRequest, response: data });
    }

    return {
        ...safeRequest,
        response: data
    };
};

module.exports = {
    WaafiPaymentError,
    normalizeAccountNo,
    purchase
};