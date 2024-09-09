import axios from "axios"
import "dotenv/config"

const API_KEY = process.env.RIOT_API_KEY;
const ENDPOINT = "https://americas.api.riotgames.com"

export interface RiotAccount {
    puuid: string;
    gameName: string;
    tagLine: string;
}

export interface MatchInfo {
    metadata: {
        dataVersion: string;
        matchId: string;
        participants: string[]
    }
    info: {
        endOfGameResult: string;
        gameCreation: number;
        gameDuration: number;
        gameEndTimestamp: number;
        gameId: number;
        gameMode: string;
        gameName: string;
        gameStartTimestamp: number;
        gameType: string;
        gameVersion: string;
        mapId: number;
        participants: ParticipantInfo[],
        platformId: string;
        teams: TeamInfo[];
        tournamentCode: string;
    }
}

export interface ParticipantInfo {
    allInPings: number;
    assistMePings: number;
    assists: number;
    baronKills: number;
    bountyLevel: number;
    champExperience: number;
    champLevel: number;
    championId: number;
    championName: string;
    commandPings: number;
    consumablesPurchased: number;
    challenges: any[]
    deaths: number;
    kills: number;
    goldEarned: number;
    largestMultiKill: number;
    physicalDamageDealt: number;
    physicalDamageDealtToChampions: number;
    physicalDamageTaken: number;
    puuid: string;
    role: string;
    summoner1Casts: number;
    summoner1Id: number;
    summoner2Casts: number;
    summoner2Id: number;
    totalDamageDealt: number;
    totalDamageDealtToChampions: number;
    totalDamageTaken: number;
    totalHeal: number;
    totalMinionsKilled: number;
    totalTimeCCDealt: number;
    totalTimeSpentDead: number;
    turretKills: number;
    visionScore: number;
    win: boolean;
}

export interface TeamInfo {
    bans: {
        championId: number;
        pickTurn: number;
    }[]
    objectives: {
        baron: ObjectiveInfo;
        champion: ObjectiveInfo;
        dragon: ObjectiveInfo;
        horde: ObjectiveInfo;
        inhibitor: ObjectiveInfo;
        riftHerald: ObjectiveInfo;
        tower: ObjectiveInfo;
    };
    teamId: number;
    win: boolean;
}

export interface ObjectiveInfo {
    first: boolean;
    kills: number;
}

export const ID_TO_SUMMONER_SPELL = {
    21: "Barrier",
    1: "Cleanse",
    2202: "Hex Flash",
    14: "Ignite",
    3: "Exhaust",
    4: "Flash",
    6: "Ghost",
    7: "Heal",
    13: "Clarity",
    11: "Smite",
    12: "Teleport",
    32: "Snowball",
}
export async function getAccount(userName: string, tagLine: string): Promise<RiotAccount | undefined> {
    const url = `${ENDPOINT}/riot/account/v1/accounts/by-riot-id/${userName}/${tagLine}?api_key=${API_KEY}`
    try {
        const res = await axios.get(url, {
            headers: {
                'X-Riot-Token': API_KEY
            }
        })
        return res.data;
    } catch (e) {
        console.log("Failed to get riot account", e)
        return undefined;
    }
}

export async function getLatestMatches(riotId: string, numEntries: number = 3) : Promise<{matches: MatchInfo[], puuid: string}> {
    const riotIdComponents = riotId.split("#");
    const userName = riotIdComponents[0];
    const tagLine = riotIdComponents[1];

    const account = await getAccount(userName, tagLine);
    if (account === undefined) {
        return {
            matches: [],
            puuid: undefined
        };
    }

    const matchListUrl = `${ENDPOINT}/lol/match/v5/matches/by-puuid/${account.puuid}/ids`
    let matchIds: string[];
    try {
        matchIds = (await axios.get(matchListUrl, {
            headers: {
                'X-Riot-Token': API_KEY
            }
        })).data;
    } catch (e) {
        console.error("Failed to fetch match Ids", e);
        return {
            matches: [],
            puuid: account.puuid
        };
    }

    const matchInfoList = [];
    for (let i = 0; i < Math.min(numEntries, matchIds.length); i++) {
        const matchInforUrl = `${ENDPOINT}/lol/match/v5/matches/${matchIds[i]}`
        try {
            const matchInfo: MatchInfo = (await axios.get(matchInforUrl, {
                headers: {
                    "X-Riot-Token": API_KEY
                }
            })).data;
            
            matchInfoList.push(matchInfo);
        } catch (error) {
            console.error("Failed to fetch match", error);
        }
    }
    
    return {
        matches: matchInfoList,
        puuid: account.puuid
    }

}

export function matchInfoMarkdown(matches: MatchInfo[], puuid: string, brief: boolean = true): string {

    const formattedMatches = matches.map(match => {
        
        const playerInfo = match.info.participants.find(participant => participant.puuid === puuid);

        const additionalInfo = "" + 
        `Best Multi-Kill: ${playerInfo.largestMultiKill}\n` +
        `Damage Taken: ${playerInfo.totalDamageTaken}\n` + 
        `CS: ${playerInfo.totalMinionsKilled}\n` + 
        `CC Dealt: ${playerInfo.totalTimeCCDealt}\n` + 
        `Turrent Kills: ${playerInfo.turretKills}\n` +
        `Vision Score: ${playerInfo.visionScore}\n` +
        `Time Spend Dead: ${playerInfo.totalTimeSpentDead} secs`; 

        return "" +
        `Game Mode: ${match.info.gameMode}\n` + 
        `Win: ${playerInfo.win}\n` + 
        `Champion: ${playerInfo.championName} (Role: ${playerInfo.role})\n` + 
        `Summoner Spells: ${ID_TO_SUMMONER_SPELL[playerInfo.summoner1Id]} (x${playerInfo.summoner1Casts} use), ${ID_TO_SUMMONER_SPELL[playerInfo.summoner2Id]} (x${playerInfo.summoner2Casts} use)\n` +
        `Kills: ${playerInfo.kills}\n` +
        `Deaths: ${playerInfo.deaths}\n` +
        `KDA: ${Math.round((playerInfo.kills + playerInfo.assists) / (playerInfo.deaths === 0 ? 1: playerInfo.deaths) * 100) / 100}\n` +
        `Gold Earned: ${playerInfo.goldEarned}\n` +
        `Damage Dealt: ${playerInfo.totalDamageDealtToChampions}\n` + 
        (!brief ? additionalInfo : "");
    })
    return "```" +
        `${formattedMatches.join("\n\n")}` 
        + "```"
}