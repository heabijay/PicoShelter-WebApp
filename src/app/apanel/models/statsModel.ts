import { DbStatsModel } from "./dbStatsModel";
import { DriveInfoModel } from "./driveInfoModel";

export class StatsModel
{
    drives: Array<DriveInfoModel>;
    db: DbStatsModel;
}