export default function rankText(score: number): string {
    let tier: string = "B";
    let sub: number = 5;

    while (true) {
        const need: Record<string, number> = {
            B: 50,
            A: 75,
            S: 100,
            SS: 100,
            SSS: 100,
            LEGEND: 100,
        };
        if (score < need[tier]) break;
        score -= need[tier];

        if (tier === "B" && sub === 1) {
            tier = "A";
            sub = 5;
        } else if (tier === "A" && sub === 1) {
            tier = "S";
            sub = 5;
        } else if (tier === "S" && sub === 1) {
            tier = "SS";
            sub = 5;
        } else if (tier === "SS" && sub === 1) {
            tier = "SSS";
            sub = 5;
        } else if (tier === "SSS" && sub === 1) {
            tier = "LEGEND";
            sub = 1;
        } else {
            sub -= 1;
        }
    }

    if (tier === "LEGEND") return `LEGEND ★${-sub+1}`;
    return `${tier}${sub}`;
}