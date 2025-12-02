export default function rankText(score: number): string {
    let tier: string = 'B';
    let sub: number = 5;

    while (true) {
        const need = tier === 'B' ? 50 : tier === 'A' ? 75 : 100;
        if (score < need) break;
        score -= need;

        if (tier === 'B' && sub === 1)       { tier = 'A'; sub = 5; }
        else if (tier === 'A' && sub === 1)  { tier = 'S'; sub = 5; }
        else if (tier === 'S' && sub === 1)  { tier = 'SS'; sub = 5; }
        else if (tier === 'SS' && sub === 1) { tier = 'SSS'; sub = 5; }
        else if (tier === 'SSS' && sub === 1){
            // 再吃掉 100 分才升 LEGEND
            if (score >= 100) {
                score -= 100;
                tier = 'LEGEND';
                sub = 0;
            } else {
                break;
            }
        }
        else sub--;
    }

    if (tier === 'LEGEND') {
        const stars = Math.floor(score / 100) + 1;
        return `LEGEND ★${stars}`;
    }
    return `${tier}${sub}`;
}