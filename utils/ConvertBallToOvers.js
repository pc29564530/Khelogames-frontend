export const convertBallToOvers = (item) => {
    const overs = Math.floor(item / 6);
    const remainingBall = item % 6;
    return `${overs}.${remainingBall}`;
};