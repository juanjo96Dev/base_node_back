export const expirationTime = (amount: number = 1, type: 'h' | 'd' | 'w' | 'y' = 'y') => {
    let amountType: number;
    switch (type) {
        case 'h':
            amountType = 3600;
            break;
        case 'd':
            amountType = 86400;
            break;
        case 'w':
            amountType = 604800;
            break;
        default:
            amountType = 3.154e+7;
            break;
    }

    return Math.floor((Date.now() / 1000) + (amountType * amount));
};
