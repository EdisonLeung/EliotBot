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
    goldEarned: number;
    physicalDamageDealt: number;
    physicalDamageDealtToChampions: number;
    physicalDamageTaken: number;
    role: string;
    totalDamageDealt: number;
    totalDamageDealtToChampions: number;
    totalDamageTaken: number;
    totalHeal: number;
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

export async function getLatestMatches(riotId: string, numEntries: number = 10) : Promise<MatchInfo[]> {
    const riotIdComponents = riotId.split("#");
    const userName = riotIdComponents[0];
    const tagLine = riotIdComponents[1];

    const account = await getAccount(userName, tagLine);
    if (account === undefined) {
        return [];
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
        return [];
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
    
    return matchInfoList

}