export const isForwardDirection = (candles) => {
	if (candles.length > 1) {
		return !!(candles[0] < candles[6]);
	}
	return null;
};