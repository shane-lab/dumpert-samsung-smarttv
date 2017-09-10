declare type TvKey = { [key: string]: number };

declare const SamsungAPI: {
    tvKey: TvKey,
    eventName: string,
    isSamsungTv: () => boolean,
    onKeyDown: <T extends Event>(event: T) => void
};